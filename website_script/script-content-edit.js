

/** 3. UI & CONVERSION ANCHORS **/
let backToTopBtn = document.createElement('button');
backToTopBtn.id = 'backToTopBtn';
backToTopBtn.innerHTML = '↑';
backToTopBtn.setAttribute('aria-label', 'Back to top');
if (!window.location.pathname.includes('fitment-tool-embed')) { document.body.appendChild(backToTopBtn); }
let contactUsBtn = document.createElement('button');
contactUsBtn.id = 'contactUsBtn';
contactUsBtn.innerHTML = 'Talk to an Expert';
if (!window.location.pathname.includes('fitment-tool-embed')) { document.body.appendChild(contactUsBtn); }

function applyKerstenStyles(element, styles) { for (let property in styles) { element.style[property] = styles[property]; } }
function adjustForMobile() {
    if (window.innerWidth <= 768) {
        applyKerstenStyles(backToTopBtn, { fontSize: '6.5vw', width: '17vw', height: '17vw', bottom: '12%', right: '6%', position: 'fixed', zIndex: '999999', borderRadius: '50%', border: 'none', backgroundColor: '#E44D2E', color: 'white', cursor: 'pointer', boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.4)', display: 'none', alignItems: 'center', justifyContent: 'center', transition: 'all 0.4s ease' });
        applyKerstenStyles(contactUsBtn, { fontSize: '14px', padding: '16px 24px', top: '15px', right: '15px', position: 'fixed', zIndex: '999999', borderRadius: '10px', border: 'none', backgroundColor: '#E44D2E', color: 'white', cursor: 'pointer', display: 'none', textAlign: 'center', fontWeight: '900', boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.4)', textTransform: 'uppercase', letterSpacing: '1px' });
    } else {
        applyKerstenStyles(backToTopBtn, { fontSize: '45px', width: '90px', height: '90px', bottom: '130px', right: '45px', position: 'fixed', zIndex: '999999', borderRadius: '50%', border: 'none', backgroundColor: '#E44D2E', color: 'white', cursor: 'pointer', boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.4)', display: 'none', alignItems: 'center', justifyContent: 'center', transition: 'all 0.4s ease' });
        applyKerstenStyles(contactUsBtn, { fontSize: '20px', padding: '18px 40px', top: '45px', right: '45px', position: 'fixed', zIndex: '999999', borderRadius: '10px', border: 'none', backgroundColor: '#E44D2E', color: 'white', cursor: 'pointer', display: 'none', textAlign: 'center', fontWeight: '900', boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.4)', textTransform: 'uppercase', letterSpacing: '1.5px' });
    }
}
function updateCTAByPrice() {
    const priceContainer = document.querySelector('[itemprop="price"], .product-price, .item-price, .price, [data-value]');
    if (priceContainer) {
        const rawPriceText = (priceContainer.getAttribute('content') || priceContainer.getAttribute('data-value') || priceContainer.innerText).replace(/[^\d.]/g, '');
        const numericPriceValue = parseFloat(rawPriceText);
        if (numericPriceValue > 500) { contactUsBtn.innerHTML = 'Book a Professional Site Demo'; contactUsBtn.style.backgroundColor = '#004d26'; } else { contactUsBtn.innerHTML = 'Verify Professional Compatibility'; contactUsBtn.style.backgroundColor = '#E44D2E'; }
    }
}
window.addEventListener('scroll', function() {
    const scrollDepth = document.documentElement.scrollTop || document.body.scrollTop;
    if (backToTopBtn.style.position !== 'fixed') adjustForMobile();
    if (scrollDepth > 300) { backToTopBtn.style.display = 'flex'; contactUsBtn.style.display = 'block'; } else { backToTopBtn.style.display = 'none'; contactUsBtn.style.display = 'none'; }
});
backToTopBtn.addEventListener('click', function() { window.scrollTo({ top: 0, behavior: 'smooth' }); });
contactUsBtn.addEventListener('click', function() { window.location.href = 'https://kerstenuk.com/Contact-us-2'; });
window.addEventListener('resize', adjustForMobile);
adjustForMobile();



/** FRAPPE READY:  everything after this was put in frappe ready */

    /* --- [E] NUCLEAR BREADCRUMB REPAIR --- */

    const executeNuclearBreadcrumbRepair = function() {

        const breadcrumbRoot = document.querySelector('.breadcrumb, .breadcrumb-list, #breadcrumbs, .yoast-breadcrumbs, .frappe-breadcrumbs');

        if (!breadcrumbRoot) return;

        const breadcrumbListItems = breadcrumbRoot.querySelectorAll('li');



        breadcrumbListItems.forEach(function(listItem) {

            if (!listItem.querySelector('a')) {

                const secureGhostLink = document.createElement('a');

                secureGhostLink.setAttribute('href', window.location.href);

                secureGhostLink.setAttribute('itemprop', 'item');

                secureGhostLink.style.display = 'none';

                listItem.appendChild(secureGhostLink);

            }

        });



        const unifiedBreadcrumbSchema = {

            "@context": "https://schema.org",

            "@type": "BreadcrumbList",

            "itemListElement": Array.from(breadcrumbListItems).map(function(li, i) {

                const activeLink = li.querySelector('a');

                return {

                    "@type": "ListItem",

                    "position": i + 1,

                    "name": li.innerText.trim() || "Kersten UK Authority Node",

                    "item": activeLink ? activeLink.href : window.location.href

                };

            })

        };

        performSchemaInjection(unifiedBreadcrumbSchema);

    };

    setTimeout(executeNuclearBreadcrumbRepair, 3000);



  /* --- [E.2] INTELLIGENT AUTO-BREADCRUMB GENERATOR (v2.0) --- */

/* Detects empty breadcrumbs and builds them based on page title keywords */

(function() {

    const buildBreadcrumbs = () => {

        // 1. Target the container and check if we are on the homepage

        const container = document.querySelector('.page-breadcrumbs');

        const currentUrl = window.location.pathname;



        // NEW: Stop the script if this is the homepage (path is "/")

        if (currentUrl === "/" || currentUrl === "/index") return;



        // Only run if container exists BUT is empty/too short

        if (!container || container.innerText.trim().length > 5) return;



        // 2. Get Page Data

        const pageTitle = document.title.split('|')[0].trim();

        const lowerTitle = pageTitle.toLowerCase();



        // 3. Define Logic: Keyword -> Parent Category Name -> Parent URL

        const logicMap = [

            { keys: ["kubota", "john deere", "iseki", "solis", "kioti", "new holland", "tym"], parent: "Compact Tractor Attachments", url: "/Compact-Tractor-Attachments-Page" },

            { keys: ["sweeper", "collector", "scavenger"], parent: "Sweepers & Collectors", url: "/sweepers" },

            { keys: ["weed", "moss", "brush", "wkb", "ubs"], parent: "Weed Control", url: "/weed-brush" },

            { keys: ["snow", "plough", "winter", "ice", "spreader"], parent: "Winter Equipment", url: "/winter-equipment" },

            { keys: ["mower", "grass", "flail"], parent: "Grass Cutting", url: "/grass-cutting-equipment" }

        ];



        // 4. Find a match

        let parentName = "All Products";

        let parentUrl = "/all-products";



        for (let rule of logicMap) {

            if (rule.keys.some(k => lowerTitle.includes(k))) {

                parentName = rule.parent;

                parentUrl = rule.url;

                break; // Stop at first match

            }

        }



        // 5. Build HTML (Standard Bootstrap/Frappe Structure)

        const html = `

            <nav aria-label="breadcrumb" style="padding: 10px 0;">

                <ol class="breadcrumb" style="background:transparent; padding:0; margin:0; font-size: 14px;">

                    <li class="breadcrumb-item"><a href="/" style="color:#666;">Home</a></li>

                    <li class="breadcrumb-item"><a href="${parentUrl}" style="color:#666;">${parentName}</a></li>

                    <li class="breadcrumb-item active" aria-current="page" style="color:#004d26; font-weight:600;">${pageTitle}</li>

                </ol>

            </nav>

        `;



        // 6. Inject with Schema

        container.innerHTML = html;



        // 7. Inject JSON-LD Schema for Google (Invisible but vital)

        const schema = {

            "@context": "https://schema.org",

            "@type": "BreadcrumbList",

            "itemListElement": [{

                "@type": "ListItem",

                "position": 1,

                "name": "Home",

                "item": "https://kerstenuk.com/"

            },{

                "@type": "ListItem",

                "position": 2,

                "name": parentName,

                "item": "https://kerstenuk.com" + parentUrl

            },{

                "@type": "ListItem",

                "position": 3,

                "name": pageTitle,

                "item": "https://kerstenuk.com" + currentUrl

            }]

        };

        const script = document.createElement('script');

        script.type = "application/ld+json";

        script.text = JSON.stringify(schema);

        document.head.appendChild(script);



        console.log(`Auto-Breadcrumb: Generated path for "${pageTitle}" under "${parentName}"`);

    };



    // Run immediately and check again after short delay (for dynamic loading)

    buildBreadcrumbs();

    setTimeout(buildBreadcrumbs, 1000);

})();




