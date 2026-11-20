# Album images API

`api.php` adds one action to Chevereto API V1. It looks up albums by name and returns a thumbnail URL and a direct file URL for each image in those albums.

Every other `/api/1/` action, including upload, is passed through to the stock `app/legacy/routes/api.php`.

## Request

```http
GET /api/1/album/?name=Album+name
X-API-Key: YOUR_KEY
```

Chevereto redirects `/api/1/album?name=...` to `/api/1/album/?name=...` (a trailing slash before the query string). Call the slashed URL directly, or follow the redirect.

The `name` parameter must match the album name stored in Chevereto. Spaces are significant. If several albums share that name, each visible match is returned.

Authentication is the same as `POST /api/1/upload`:

- Send the key in the `X-API-Key` header, or as the `key` query parameter.
- A user API key can read public albums, albums owned by that user, and, for an admin key, every album.
- The guest API key (`api_v1_key` in Dashboard) is accepted when `CHEVERETO_ENABLE_API_GUEST` is enabled.
- API access itself must be enabled. Chevereto reports a 404 when it is not.

Albums that are not public are omitted unless the key belongs to the owner or an admin. A name that matches nothing visible returns 404, including when the only matches are hidden from that key.

## Response

```json
{
  "status_code": 200,
  "status_txt": "OK",
  "albums": [
    {
      "id": "Ip",
      "name": "My album",
      "images": [
        {
          "thumbnail": "https://example.com/images/2026/10/30/photo.th.jpg",
          "direct": "https://example.com/images/2026/10/30/photo.jpg"
        }
      ]
    }
  ]
}
```

`thumbnail` is the thumbnail file. `direct` is the full image file. Either value is `null` when Chevereto has no URL for that size. Images are ordered by id.

An image is left out when it is not approved, has no file size, or its expiration date has passed.

| Status | Meaning |
| --- | --- |
| 400, code 100 | Missing key, invalid key, or missing album name |
| 404 | No visible album with that name, or the API is disabled |

## Install with Docker Compose

Mount the file over Chevereto's route override path. On the `php` service:

```yaml
services:
  php:
    volumes:
      - ./routes/overrides/api.php:/var/www/html/app/legacy/routes/overrides/api.php:ro
```

The left-hand path is relative to the compose file. The right-hand path is where this image loads `routes/overrides/api.php` before the stock API route. `:ro` keeps the container from changing the file.

Apply it by recreating the PHP container:

```sh
docker compose up -d php
```

This repository's `docker-compose.yml` already includes that mount.

The override directory does not exist in the image. Docker creates it when the file is mounted. A copied file inside the container, without a mount or an application volume, disappears when the container is recreated.

## Install on an existing Chevereto instance

The application root is the directory that contains `app/legacy/routes/api.php`. In the official Docker image that root is `/var/www/html`.

1. Create the override directory if it is not already there:

   ```sh
   mkdir -p /var/www/html/app/legacy/routes/overrides
   ```

2. Copy this `api.php` into that directory:

   ```sh
   cp api.php /var/www/html/app/legacy/routes/overrides/api.php
   ```

3. Make the file readable by the PHP user. In the official image that user is `www-data`:

   ```sh
   chown www-data:www-data /var/www/html/app/legacy/routes/overrides/api.php
   chmod 644 /var/www/html/app/legacy/routes/overrides/api.php
   ```

No database change is required. Chevereto loads the override on the next request. Reload PHP if the new route does not appear.

Do not replace `app/legacy/routes/api.php`. This file lives beside it and calls the stock route for every action other than `album`.
