/** 2. HIGH-SPEED VIDEO ENGINE **/
function labnolIframe(div) {
    var iframe = document.createElement('iframe');
    iframe.setAttribute('src', 'https://www.youtube.com/embed/' + div.dataset.id + '?autoplay=1&rel=0&modestbranding=1&controls=1&showinfo=0&mute=1');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', '1');
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
    div.parentNode.replaceChild(iframe, div);
}
function initYouTubeVideos() {
    var playerElements = document.getElementsByClassName('youtube-player');
    for (var n = 0; n < playerElements.length; n++) {
        var videoId = playerElements[n].dataset.id;
        var div = document.createElement('div');
        div.setAttribute('data-id', videoId);
        var thumbNode = document.createElement('img');
        thumbNode.src = 'https://i.ytimg.com/vi/' + videoId + '/hqdefault.jpg';
        thumbNode.setAttribute('loading', 'lazy');
        thumbNode.setAttribute('alt', 'Kersten Specialist Technical Demonstration Video');
        div.appendChild(thumbNode);
        var playButton = document.createElement('div');
        playButton.setAttribute('class', 'play');
        div.appendChild(playButton);
        div.onclick = function () { labnolIframe(this); };

// Auto-play on scroll into view
const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
        if (entry.isIntersecting) {
            labnolIframe(entry.target);
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });
observer.observe(div);
        playerElements[n].appendChild(div);
    }
}
document.addEventListener('DOMContentLoaded', initYouTubeVideos);



/* Frappe Ready */


// FINAL VIDEO INJECTION (v144.0 - CHANNEL SAFEGUARD)



        // 1. VIDEO KILLER: Destroy bad video schema coming from Channel Links (@KerstenUK)

        // This is critical: It finds elements marked as "VideoObject" that are just channel links and strips the tags.

        document.querySelectorAll('[itemprop="video"], [itemtype*="VideoObject"]').forEach(el => {

             if (el.innerHTML.includes('@KerstenUK') || (el.getAttribute('href') && el.getAttribute('href').includes('@KerstenUK'))) {

                 el.removeAttribute('itemprop');

                 el.removeAttribute('itemtype');

                 el.removeAttribute('itemscope');

             }

        });



        // 2. VIDEO FINDER: Look for real videos (Custom Player OR Standard Iframe)

        let ytElement = document.querySelector('.youtube-player div[data-id]');
let technicalYoutubeId = ytElement ? ytElement.dataset.id : null;



        if (!technicalYoutubeId) {

            // Fallback: Check for standard YouTube embeds

            const standardIframe = document.querySelector('iframe[src*="youtube.com/embed/"]');

            if (standardIframe) {

                // Robust extraction of ID

                technicalYoutubeId = standardIframe.src.split('embed/')[1].split('?')[0];

            }

        }



        // 3. INJECT VALID VIDEO SCHEMA (Only if a real ID was found)

        if (technicalYoutubeId) {

            masterUnifiedProductSchema.subjectOf = {

                "@type": "VideoObject",

                "name": `Technical Demo: ${currentDocumentTitle.split('|')[0].trim()}`,

                "description": `Operational demonstration and technical overview of the ${currentDocumentTitle.split('|')[0].trim()}.`,

                "uploadDate": new Date().toISOString(), // Required field fallback

                "thumbnailUrl": [

                    `https://i.ytimg.com/vi/${technicalYoutubeId}/maxresdefault.jpg`,

                    `https://i.ytimg.com/vi/${technicalYoutubeId}/hqdefault.jpg`

                ],

                "embedUrl": `https://www.youtube.com/embed/${technicalYoutubeId}`,

                "contentUrl": `https://www.youtube.com/watch?v=${technicalYoutubeId}`

            };

        }