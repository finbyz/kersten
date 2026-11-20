<?php

/*
 * Local extension of Chevereto API V1.
 *
 * GET /api/1/album?name=Album+name
 * Header: X-API-Key (or ?key=), same credentials as /api/1/upload.
 *
 * Returns each approved image in every visible album with that exact name:
 *   thumbnail — thumbnail file URL
 *   direct    — full image file URL
 *
 * Any other /api/1/* action is handled by the stock API route.
 */

use Chevereto\Legacy\Classes\Album;
use Chevereto\Legacy\Classes\ApiKey;
use Chevereto\Legacy\Classes\DB;
use Chevereto\Legacy\Classes\Image;
use Chevereto\Legacy\Classes\Listing;
use Chevereto\Legacy\Classes\User;
use Chevereto\Legacy\G\Handler;
use function Chevereto\Legacy\G\json_document_output;
use function Chevereto\Legacy\G\json_error;
use function Chevereto\Legacy\getSetting;
use function Chevereto\Vars\env;
use function Chevereto\Vars\request;
use function Chevereto\Vars\server;

return function (Handler $handler) {
    $action = strval($handler->request()[1] ?? '');
    if ($action !== 'album') {
        $original = require PATH_APP_LEGACY_ROUTES . 'api.php';
        $original($handler);

        return;
    }
    if (! $handler::cond('api_enabled')) {
        $handler->issueError(404);

        return;
    }

    try {
        $request = request();
        $server = server();
        $key = strval($server['HTTP_X_API_KEY'] ?? $request['key'] ?? '');
        if ($key === '') {
            throw new Exception('No key provided', 100);
        }
        $user = [];
        try {
            $verify = ApiKey::verify($key);
        } catch (InvalidArgumentException) {
            throw new Exception('Invalid API key.', 100);
        }
        if ($verify === []) {
            if (! (bool) env()['CHEVERETO_ENABLE_API_GUEST']) {
                throw new Exception('Invalid API key.', 100);
            }
            $apiV1Key = (string) (getSetting('api_v1_key') ?? '');
            if ($apiV1Key === '' || ! hash_equals($apiV1Key, $key)) {
                throw new Exception('Invalid API key.', 100);
            }
        } else {
            $user = User::getSingle($verify['user_id']);
        }

        $name = $request['name'] ?? null;
        if (! is_string($name) || trim($name) === '') {
            throw new Exception('No album name provided.', 100);
        }

        $albumsTable = DB::getTable('albums');
        $matches = DB::fetchAllQuery(
            'SELECT album_id FROM ' . $albumsTable . ' WHERE album_name = :name ORDER BY album_id ASC',
            [':name' => $name]
        );
        $isAdmin = (bool) ($user['is_admin'] ?? false);
        $userId = $user['id'] ?? null;
        $albums = [];
        foreach ($matches as $match) {
            $album = Album::getById((int) $match['album_id']);
            if ($album === [] || ! albumIsVisible($album, $isAdmin, $userId)) {
                continue;
            }
            $albums[] = [
                'id' => $album['id_encoded'],
                'name' => $album['name'],
                'images' => albumImageLinks((int) $album['id']),
            ];
        }
        if ($albums === []) {
            throw new Exception('Album not found.', 404);
        }
        json_document_output([
            'status_code' => 200,
            'albums' => $albums,
        ]);
    } catch (Exception $e) {
        if ((int) $e->getCode() === 404) {
            json_document_output([
                'status_code' => 404,
                'error' => [
                    'message' => $e->getMessage(),
                    'code' => 404,
                ],
            ]);
        }
        json_document_output(json_error($e));
    }
};

function albumIsVisible(array $album, bool $isAdmin, mixed $userId): bool
{
    if ($isAdmin) {
        return true;
    }
    $privacy = $album['privacy'] ?? 'public';
    if ($privacy === 'public') {
        return true;
    }
    $ownerId = $album['user']['id'] ?? null;

    return $ownerId !== null && $ownerId === $userId;
}

/**
 * @return list<array{thumbnail: ?string, direct: ?string}>
 */
function albumImageLinks(int $albumId): array
{
    $imagesTable = DB::getTable('images');
    $storagesTable = DB::getTable('storages');
    $imageColumns = implode(', ', Listing::COLUMNS['images']);
    $storageColumns = implode(', ', Listing::COLUMNS['storages']);
    $rows = DB::fetchAllQuery(
        'SELECT ' . $imageColumns . ', ' . $storageColumns
        . ' FROM ' . $imagesTable
        . ' LEFT JOIN ' . $storagesTable
        . ' ON ' . $imagesTable . '.image_storage_id = ' . $storagesTable . '.storage_id'
        . ' WHERE image_album_id = :album_id'
        . ' AND image_is_approved = 1'
        . ' AND image_size > 0'
        . ' AND (image_expiration_date_gmt IS NULL OR image_expiration_date_gmt > UTC_TIMESTAMP())'
        . ' ORDER BY image_id ASC',
        [':album_id' => $albumId]
    );
    $links = [];
    foreach ($rows as $row) {
        $image = Image::formatArray($row, fillAlbumCover: false);
        $thumbnail = $image['thumb']['url'] ?? null;
        $direct = $image['url'] ?? null;
        $links[] = [
            'thumbnail' => is_string($thumbnail) && $thumbnail !== '' ? $thumbnail : null,
            'direct' => is_string($direct) && $direct !== '' ? $direct : null,
        ];
    }

    return $links;
}
