/* --- [0] GLOBAL UTILITIES & COMPACT STYLING (Safe-Wrapped) --- */
(function() {
    if (!document.getElementById('kersten-master-styles')) {
        const stylePatch = document.createElement('style');
        stylePatch.id = 'kersten-master-styles';
        stylePatch.innerHTML = `
            html {
                overflow-x: hidden;
            }

            /* WIDEN ERPNEXT NAVBAR */
            header.navbar .container, 
            .navbar .container, 
            .web-header .container {
                max-width: 95% !important; 
                width: 100% !important;
            }

            @media (max-width: 768px) {
                .web-footer {
                    overflow-x: hidden;
                }
                .web-footer .row {
                    margin-left: 0 !important;
                    margin-right: 0 !important;
                }
            }

            img { height: auto; max-width: 100%; aspect-ratio: attr(width) / attr(height); }
            
            /* WIDGET COMPACT STYLING (Fixes Vertical Stretch) */
            .havs-compliance-widget, .pesticide-load-widget, .logistics-bar, #kersten-veto-table, #iwm-science-table { 
                color: #222 !important; 
                font-family: sans-serif; 
                height: auto !important; 
                min-height: 0 !important; 
                max-width: 850px !important;
                margin: 30px auto !important;
                display: block !important;
                clear: both !important;
            }
            
            /* TIGHTER TABLE CELLS */
            #kersten-veto-table td, #kersten-veto-table th, #iwm-science-table td, #iwm-science-table th {
                padding: 10px 12px !important;
                border-left: 1px solid #eee;
            }

            /* PLAYER & UTILS */
            .youtube-player { position: relative; cursor: pointer; display: block; overflow: hidden; background: #000; }
            .youtube-player img { opacity: 0.8; transition: opacity 0.2s; width: 100%; display: block; }
            .youtube-player:hover img { opacity: 1; }
            .play { position: absolute; top: 50%; left: 50%; width: 68px; height: 48px; background-color: #FF0000; border-radius: 12px; transform: translate(-50%, -50%); z-index: 10; opacity: 0.9; transition: all 0.2s; }
            .play:hover { opacity: 1; background-color: #CC0000; }
            .play:before { content: ""; position: absolute; top: 50%; left: 55%; transform: translate(-50%, -50%); border-style: solid; border-width: 10px 0 10px 18px; border-color: transparent transparent transparent #FFFFFF; }
            .kersten-dealer-locator { min-height: 165px; display: block; clear: both; margin: 30px 0; }
        `;
        
        document.head.appendChild(stylePatch);
    }
    
    // 2. IMAGE RECOVERY
    function forceOriginalImages() {
        const blogImages = document.querySelectorAll('.blog-card img, .card-img-top img, .item-card img');
        blogImages.forEach(function(img) {
            let currentSrc = img.getAttribute('src');
            if (currentSrc && currentSrc.includes('/files/') && !img.dataset.fixed) {
                let originalFile = currentSrc.replace(/(-small|-medium|_thumb|_small|_medium)/gi, "").split('?')[0];
                img.src = originalFile + "?v=" + new Date().getTime();
                img.dataset.fixed = "true";
                img.style.display = 'block';
                img.style.opacity = '1';
            }
        });
    }
    forceOriginalImages();
    setTimeout(forceOriginalImages, 2000);

    // 3. WIDGET RESIZER
    if (window.location.pathname.includes('fitment-tool-embed')) {
        const sendHeight = () => {
            const height = document.body.scrollHeight;
            window.parent.postMessage({ 'kerstenWidgetHeight': height }, "*");
        };
        window.addEventListener('load', sendHeight);
        window.addEventListener('resize', sendHeight);
        document.addEventListener('click', () => setTimeout(sendHeight, 200));
    }
})();

/* --- [X] BLOG TRAFFIC CONTROLLER (The "Highlander" Logic - v2.0 JIT) --- */
// We define a function that runs Just-In-Time when called by the tools
window.getKerstenBlogContext = function() {
    if (!window.location.href.includes('/blog')) return { tool: 'all' }; // Non-blog pages get everything

    const contentEl = document.querySelector('.blog-content, .web-page-content, article') || document.body;
    const text = (document.title + " " + contentEl.innerText).toLowerCase();
    
    // SCORING SYSTEM
    let scores = {
        'veto': 0,      // Engineering Comparison
        'audit': 2,     // Base score (Default fallback)
        'havs': 0,      // Safety Calculator
        'wizard': 0     // Fitment Finder
    };

    // 1. Veto Triggers
    if (text.includes('petrol') && text.includes('diesel')) scores.veto += 10;
    if (text.includes('kubota') || text.includes('hatz')) scores.veto += 5;
    if (text.includes('vs') || text.includes('comparison')) scores.veto += 3;

    // 2. Audit Triggers
    if (text.includes('cost') || text.includes('saving')) scores.audit += 5;
    if (text.includes('carbon') || text.includes('net zero')) scores.audit += 5;
    if (text.includes('chemical') || text.includes('glyphosate')) scores.audit += 8;

    // 3. HAVS Triggers
    if (text.includes('vibration') || text.includes('havs')) scores.havs += 15; // Strong priority
    if (text.includes('safety') || text.includes('health')) scores.havs += 5;

    // 4. Wizard Triggers
    if (text.includes('attachment') || text.includes('tractor')) scores.wizard += 5;
    if (text.includes('fit') || text.includes('compatible')) scores.wizard += 5;

    // DETERMINE WINNER
    let winner = 'audit'; // Default
    let maxScore = 0;

    for (let [key, score] of Object.entries(scores)) {
        if (score > maxScore) {
            maxScore = score;
            winner = key;
        }
    }
    // Cache the result so we don't recalculate 50 times
    window.kerstenBlogContextCache = { tool: winner };
    console.log(`Kersten Blog Controller: Winner is [${winner.toUpperCase()}]`);
    return { tool: winner };
};

/* --- AUTO-RELIINK RECOVERY SCRIPT (v129.0) --- */
(function() {
    function forceOriginalImages() {
        const blogImages = document.querySelectorAll('.blog-card img, .card-img-top img, .item-card img');
        blogImages.forEach(function(img) {
            let currentSrc = img.getAttribute('src');
            if (currentSrc && currentSrc.includes('/files/') && !img.dataset.fixed) {
                let originalFile = currentSrc.replace(/(-small|-medium|_thumb|_small|_medium)/gi, "").split('?')[0];
                img.src = originalFile + "?v=" + new Date().getTime();
                img.dataset.fixed = "true";
                img.style.display = 'block';
                img.style.opacity = '1';
                console.log("Recovered Image: " + originalFile);
            }
        });
    }
    forceOriginalImages();
    setTimeout(forceOriginalImages, 2000);
})();

/* --- KERSTEN DEEP IMAGE REPAIR (v128.9) --- */
(function() {
    function deepRepairImages() {
        const images = document.querySelectorAll('img');
        images.forEach(function(img) {
            let src = img.getAttribute('src');
            if (src && src.includes('/files/')) {
                let originalPath = src.replace(/(_small|_thumb|_medium| - small| - medium)/gi, "").split('?')[0].split('#')[0];
                if (!img.dataset.repaired) {
                    img.dataset.repaired = "true";
                    img.src = originalPath + "?v=" + new Date().getTime();
                    img.style.opacity = '1';
                    img.style.visibility = 'visible';
                    img.style.display = 'inline-block';
                    console.log("Deep Repaired: " + originalPath);
                }
            }
        });
    }
    [100, 1500, 4000].forEach(delay => setTimeout(deepRepairImages, delay));
})();

/* --- IMAGE LINK REPAIR ENGINE (v128.7) --- */
(function() {
    function repairImageLinks() {
        const docImages = document.querySelectorAll('img');
        docImages.forEach(function(img) {
            let src = img.getAttribute('src');
            if (src && src.includes('/files/') && src.includes('?')) {
                let cleanSrc = src.split('?')[0];
                img.src = cleanSrc;
                img.removeAttribute('srcset');
                img.removeAttribute('sizes');
                img.style.opacity = '1';
                img.style.visibility = 'visible';
                img.style.contentVisibility = 'visible';
            }
        });
    }
    [100, 1000, 3000].forEach(delay => setTimeout(repairImageLinks, delay));
})();

/* --- WIDGET AUTO-RESIZER ENGINE (SENDER) --- */
const sendHeightToParent = () => {
    if (window.location.pathname.includes('fitment-tool-embed')) {
        const height = document.body.scrollHeight;
        window.parent.postMessage({ 'kerstenWidgetHeight': height }, "*");
    }
};
window.addEventListener('load', sendHeightToParent);
window.addEventListener('resize', sendHeightToParent);
document.addEventListener('click', () => setTimeout(sendHeightToParent, 200));

/** 0. UI STABILIZER & WIDGET STYLING **/
const stylePatch = document.createElement('style');
stylePatch.innerHTML = `
    img { height: auto; max-width: 100%; aspect-ratio: attr(width) / attr(height); }
    .havs-compliance-widget, .pesticide-load-widget, .logistics-bar { color: #222 !important; font-family: sans-serif; }
    .youtube-player { position: relative; cursor: pointer; display: block; overflow: hidden; background: #000; }
    .youtube-player img { opacity: 0.8; transition: opacity 0.2s; width: 100%; display: block; }
    .youtube-player:hover img { opacity: 1; }
    .play { position: absolute; top: 50%; left: 50%; width: 68px; height: 48px; background-color: #FF0000; border-radius: 12px; transform: translate(-50%, -50%); z-index: 10; opacity: 0.9; transition: all 0.2s; }
    .play:hover { opacity: 1; background-color: #CC0000; }
    .play:before { content: ""; position: absolute; top: 50%; left: 55%; transform: translate(-50%, -50%); border-style: solid; border-width: 10px 0 10px 18px; border-color: transparent transparent transparent #FFFFFF; }
    .kersten-dealer-locator { min-height: 165px; display: block; clear: both; margin: 30px 0; }
    .logistics-bar { min-height: 90px; display: block; clear: both; margin: 40px 0 15px 0; }
    .havs-compliance-widget { min-height: 280px; display: block; clear: both; margin: 30px 0; }
    .pesticide-load-widget { min-height: 250px; display: block; clear: both; margin: 30px 0; }
    .kersten-fitment-wizard { min-height: 200px; display: block; clear: both; margin: 30px 0; }
`;
document.head.appendChild(stylePatch);

/** 1. PERFORMANCE & SPECULATIVE LOADING **/
const kerstenPreloads = ['https://kerstenuk.com/contact-us-pesticide-free-plan', 'https://kerstenuk.com/sean-faulkner---surface-maintenance-and-integrated-weed-management-specialist', 'https://kerstenuk.com/weedbrush', 'https://kerstenuk.com/Thermal-weed-control', 'https://kerstenuk.com/sweepers', 'https://kerstenuk.com/winter-equipment', '/products', '/blog'];
kerstenPreloads.forEach(function(url) {
    const link = document.createElement('link');
    link.rel = 'prerender';
    link.href = url;
    document.head.appendChild(link);
});

/* --- DYNAMIC SITEMAP INJECTOR --- */
if (window.location.pathname.replace(/\/$/, "") === '/sitemap') {
    const runDeepDiscoverySitemap = async function() {
        console.log("Kersten Authority Engine: Initiating Multi-Archive Deep Scan...");
        let foundLinks = Array.from(document.querySelectorAll('a')).map(function(a) { return a.href; }).filter(function(href) { return href.includes('kerstenuk.com') && !href.includes('#') && !href.includes('sitemap'); }).map(function(href) { return href.split('kerstenuk.com')[1]; });
        const archives = ['/blog', '/products', '/sweepers', '/weedbrush', '/Thermal-weed-control', '/winter-equipment', '/attachments', '/spare-parts', '/professional-weed-removal-equipment', '/pesticide-free-weed-control', '/surface-maintenance-machinery', '/path-and-pavement-cleaning-equipment', '/kersten-k-series-attachments', '/kersten-hy-series-attachments', '/pesticide-free-solutions'];
        try {
            await Promise.all(archives.map(async function(url) {
                const resp = await fetch(url).then(function(res) { return res.text(); });
                const doc = new DOMParser().parseFromString(resp, 'text/html');
                const deepLinks = Array.from(doc.querySelectorAll('a')).map(function(a) { return a.getAttribute('href'); }).filter(function(p) { return p && p.startsWith('/') && !p.includes('#') && p.length > 2; });
                foundLinks = foundLinks.concat(deepLinks);
                console.log("Discovery: Scanned archive node [" + url + "]");
            }));
        } catch(e) { console.log("Discovery Alert: Some secure archive nodes were skipped."); }
        const finalAuthorityPaths = [...new Set(foundLinks)].filter(function(p) { return p && p !== '/' && p.length > 1; }).sort();
        let sitemapHTML = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 80px; max-width: 1200px; margin: auto; background: #fff; line-height: 1.8; color: #333;">
                <h1 style="color: #004d26; border-bottom: 6px solid #ffcc00; padding-bottom: 25px; margin-bottom: 40px; font-size: 38px; font-weight: 900; letter-spacing: -1px;">Kersten UK - Global Authority Index (2025/26)</h1>
                <div style="background: #f9f9f9; padding: 35px; border-radius: 15px; margin-bottom: 55px; border-left: 12px solid #004d26; box-shadow: 0 15px 35px rgba(0,0,0,0.06);">
                    <p style="margin: 0; font-weight: 800; font-size: 22px; color: #004d26; text-transform: uppercase; letter-spacing: 1px;">Discovery Status: <span style="color: #333;">Multi-Archive Scan Complete</span></p>
                    <p style="margin: 15px 0 0 0; font-size: 18px; color: #555;">Technical Authority Records Located: <strong>${finalAuthorityPaths.length}</strong> Unique Endpoints<br>Index Scope: Commercial Inventory, UK Government Compliance Bridges, HAVS Documentation, and IWM Standards.</p>
                </div>
                <ul style="list-style: none; padding: 0; display: grid; grid-template-columns: 1fr; gap: 15px;">
                    ${finalAuthorityPaths.map(function(path) { return `<li style="padding: 20px; background: #fff; border-radius: 10px; border: 1px solid #eee; box-shadow: 0 4px 6px rgba(0,0,0,0.02); transition: all 0.3s ease;"><span style="color: #ffcc00; margin-right: 18px; font-weight: 900; font-size: 24px;">➔</span><a href="https://kerstenuk.com${path}" style="text-decoration: none; color: #004d26; font-weight: 700; font-size: 17px;">https://kerstenuk.com${path}</a></li>`; }).join('')}
                </ul>
            </div>`;
        document.body.innerHTML = sitemapHTML;
    };
    runDeepDiscoverySitemap();
    setTimeout(runDeepDiscoverySitemap, 5000);
}

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

/* --- CHATBOT KILL SWITCH FOR EMBED PAGE --- */
if (window.location.pathname.includes('fitment-tool-embed')) {
    const chatFailsafe = setInterval(() => {
        const chatWidget = document.querySelector('iframe[src*="enterprise-operation"], #hs-messages-messenger, .privy-embed-widget');
        if (chatWidget) { chatWidget.style.setProperty("display", "none", "important"); chatWidget.remove(); clearInterval(chatFailsafe); }
    }, 200);
    setTimeout(() => clearInterval(chatFailsafe), 10000);
}

/** 4. SEO & AUTHORITY ENGINE **/
frappe.ready(function() {
    const fullBodyText = document.body.innerText;
    const lowerBodyText = fullBodyText.toLowerCase();
    const currentDocumentTitle = document.title;
    const globalExpiryDate = "2026-12-31"; 
    const CORE_ORG_ID = "https://kerstenuk.com/#organization";

    const performSchemaInjection = function(schemaData) {
        const schemaScript = document.createElement('script');
        schemaScript.type = 'application/ld+json';
        schemaScript.text = JSON.stringify(schemaData);
        document.head.appendChild(schemaScript);
    };

   
    // --- Kersten Nationwide Dealer Authority Engine ---
    var dealerList = [
        { name: "Vincent Tractors", town: "Fraddon", region: "Cornwall and Devon", specialist: true }, // <--- SPECIALIST
        { name: "Craddock Tractors", town: "Clevedon", region: "South West" }, 
        { name: "Lister Wilder", town: "Reading", region: "South East" }, 
        { name: "Ernest Doe & Sons Ltd", town: "Maldon", region: "East of England" }, 
        { name: "R T Machinery Ltd", town: "Aylesbury", region: "London/Home Counties", specialist: true }, // <--- SPECIALIST
        { name: "Chandlers (Agricultural) Ltd", town: "Belton", region: "East Midlands" }, 
        { name: "Tallis Amos Group", town: "Evesham", region: "West Midlands" }, 
        { name: "R J Adams", town: "Wem", region: "West Midlands" }, 
        { name: "Terry Harrison Machinery", town: "Milford Haven", region: "South West Wales" }, 
        { name: "Ted Hopkins / Hopkins Machinery", town: "St. Brides Wentloog", region: "South Wales" }, 
        { name: "Hughie Willett Machinery", town: "Sutton Coldfield", region: "Midlands" }, 
        { name: "PS Marsden (Lawnmower Services) Ltd", town: "Nottingham", region: "Midlands" }, 
        { name: "The Mower Shop", town: "Haddenham", region: "Buckinghamshire" }, 
        { name: "Ripon Groundscare", town: "Ripon", region: "North East" }, 
        { name: "Russells Groundcare", town: "Malton", region: "North East" }, 
        { name: "Carrs Billington", town: "Carlisle", region: "North of England" }, 
        { name: "FR Sharrocks Ltd", town: "Wigan", region: "North West" }, 
        { name: "Cheshire Turf Machinery", town: "Stockport", region: "North West" }, 
        { name: "Agri Services Ltd", town: "Darvel", region: "Scotland" }, 
        { name: "Henderson Grass Machinery", town: "Selkirk", region: "Scotland" }, 
        { name: "Fraser C Robb", town: "Drymen", region: "Scotland", specialist: true }, // <--- SPECIALIST
        { name: "Macgregor Forest and Groundcare", town: "Inverness", region: "Highlands" }, 
        { name: "Dublin Grass Machinery", town: "Dublin", region: "Ireland" }, 
        { name: "Seamus Weldon Groundcare", town: "Killarney", region: "Ireland" }, 
        { name: "D A Forgie", town: "Limavady", region: "Northern Ireland" }
    ];
    var dealerNodes = dealerList.map(function(dealer) {
        return { "@type": "LocalBusiness", "name": dealer.name, "description": "Official Kersten Stocking Dealer providing specialist groundcare machinery and IWM support.", "address": { "@type": "PostalAddress", "addressLocality": dealer.town, "addressRegion": dealer.region, "addressCountry": dealer.town === "Dublin" || dealer.town === "Killarney" ? "IE" : "GB" }, "parentOrganization": { "@id": "https://kerstenuk.com/#organization" } };
    });
    if (dealerNodes.length > 0) {
        var dealerSchema = { "@context": "https://schema.org", "@graph": dealerNodes };
        var script = document.createElement('script');
        script.type = 'application/ld+json';
        script.text = JSON.stringify(dealerSchema);
        document.head.appendChild(script);
    }

/* --- [Q] CHEMICAL-FREE AUTHORITY INJECTOR (v5.10 - SMART CATEGORY PLACEMENT) --- */
(function() {

    /* --- HARD GLOBAL LOCK: prevents this whole injector starting twice --- */
    if (window.__kerstenChemicalFreeAuthorityInjectorStarted) {
        console.log("Kersten [Q]: Duplicate injector blocked.");
        return;
    }

    window.__kerstenChemicalFreeAuthorityInjectorStarted = true;

    /* --- Existing duplicate cleanup, useful while testing/publishing --- */
    function cleanupDuplicateAuthorityWidgets() {
        const tables = Array.from(document.querySelectorAll('#iwm-science-table'));
        const audits = Array.from(document.querySelectorAll('.pesticide-load-widget'));

        tables.slice(1).forEach(el => el.remove());
        audits.slice(1).forEach(el => el.remove());
    }

    function authorityWidgetAlreadyExists() {
        return !!(
            document.getElementById('iwm-science-table') ||
            document.getElementById('kersten-authority-audit-widget') ||
            document.querySelector('.pesticide-load-widget[data-kersten-authority="audit"]')
        );
    }
    // 1. SAFETY EXCLUSIONS
    if (window.location.pathname === '/' || window.location.pathname === '/index') return;
    if (window.location.href.includes('integrated-weed-management-trial-bracknell')) return;

    // 2. GATEKEEPER
    const targetPages = ["chemical-free", "integrated-weed", "pesticide-free", "thermal", "hot-water", "ewk", "hot-air", "electricity", "ripagreen", "zasso"];
    const isBlog = window.location.href.includes('/blog');

    // CRITICAL FIX: If it is a blog, SKIP the URL keyword check. 
    // We let the Traffic Controller decide later.
    if (!isBlog && !targetPages.some(page => window.location.href.toLowerCase().includes(page))) return;

    const injectFullAuthorityStack = () => {
        // 3. TRAFFIC CONTROL (The "Highlander" Check)
        if (isBlog) {
             const ctx = window.kerstenBlogContextCache || (window.getKerstenBlogContext ? window.getKerstenBlogContext() : { tool: 'audit' });
             // If Traffic Controller says "Veto" or "Havs" won, we stop here.
             if (ctx.tool !== 'audit') return;
        }

       /* --- DUPLICATION GUARD: AUTHORITY STACK --- */
/* Prevents repeat injection when either the table OR audit widget already exists */

cleanupDuplicateAuthorityWidgets();

if (authorityWidgetAlreadyExists()) {
    return true;
}

        // 4. TARGETING ENGINE (Expanded Selectors)
        const productTable = document.querySelector('.specification-table, .product-specs, .from-markdown table, .page_content table');
        const contentIntro = document.querySelector('.blog-content, .web-page-content, .product-description, .from-markdown, article, #main-content');
        
        if (!productTable && !contentIntro && !document.querySelector('.website-list')) return;

        // --- PART B: THE TECHNICAL MATRIX ---
        const tableContainer = document.createElement('div');
        tableContainer.id = 'iwm-science-table';
        tableContainer.style.cssText = "margin: 40px auto; max-width: 1200px; background: #fff; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); overflow: hidden; font-family: sans-serif; clear: both; border: 1px solid #eee; width: 100%; display: block;";
        tableContainer.innerHTML = `
            <div style="background: #004d26; color: white; padding: 20px;">
                <h3 style="margin:0; font-size: 20px; font-weight: bold; letter-spacing: 0.5px;">🧪 Technical Comparison: Professional Weed Control Methods</h3>
                <p style="margin: 5px 0 0 0; font-size: 13px; opacity: 0.9;">Engineering data for Council Grounds and Commercial Contracting procurement.</p>
            </div>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; min-width: 950px; font-size: 13px;">
                    <thead>
                        <tr style="background: #f8f9fa; border-bottom: 2px solid #004d26;">
                            <th style="padding: 15px 12px; text-align: left; color: #333; width: 15%;">Method</th>
                            <th style="padding: 15px 12px; text-align: left; color: #333; width: 12%;">Active Temp.</th>
                            <th style="padding: 15px 12px; text-align: left; color: #333; width: 20%;">Best Application</th>
                            <th style="padding: 15px 12px; text-align: left; color: #333;">Typical Speed</th>
                            <th style="padding: 15px 12px; text-align: left; color: #333;">Weather Limit</th>
                            <th style="padding: 15px 12px; text-align: left; color: #333;">Consumables</th>
                            <th style="padding: 15px 12px; text-align: left; color: #333;">Root Kill?</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 15px 12px;"><strong>Hot Water (Thermal)</strong></td>
                            <td style="padding: 15px 12px; background:#e8f5e9; font-weight:bold; color: #004d26;">100°C (Liquid)</td>
                            <td style="padding: 15px 12px; font-weight:bold; color:#555;">Sensitive Stone, Resin & Artificial Turf</td>
                            <td style="padding: 15px 12px;">1.5 - 2.5 km/h</td>
                            <td style="padding: 15px 12px;"><span style="color:#27ae60; font-weight:bold;">All Weather Capable</span></td>
                            <td style="padding: 15px 12px; color: #666;">Water Softener (Hard areas)</td>
                            <td style="padding: 15px 12px;"><span style="color:#27ae60; font-weight:bold;">High</span> (Conductive)</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 15px 12px;"><strong>Hot Air (Thermal)</strong></td>
                            <td style="padding: 15px 12px;">450°C - 700°C</td>
                            <td style="padding: 15px 12px; font-weight:bold; color:#555;">Gravel Paths & Permeable Surfaces</td>
                            <td style="padding: 15px 12px;">2.0 - 3.0 km/h</td>
                            <td style="padding: 15px 12px;"><span style="color:#27ae60; font-weight:bold;">All Weather</span> (Wet Capable)</td>
                            <td style="padding: 15px 12px; color: #666;">Propane / LPG Gas</td>
                            <td style="padding: 15px 12px;"><span style="color:#f39c12; font-weight:bold;">Medium</span> (Radiant)</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 15px 12px;"><strong>Mechanical Brush</strong></td>
                            <td style="padding: 15px 12px; background:#e8f5e9; font-weight:bold; color: #004d26;">Ambient</td>
                            <td style="padding: 15px 12px; font-weight:bold; color:#555;">Kerb Edging, Silt & Moss Removal</td>
                            <td style="padding: 15px 12px;">3.0 - 5.0 km/h</td>
                            <td style="padding: 15px 12px;"><span style="color:#27ae60; font-weight:bold;">All Weather Capable</span></td>
                            <td style="padding: 15px 12px; color: #666;">Spare Brushes (30+ hrs life)</td>
                            <td style="padding: 15px 12px;"><span style="color:#27ae60; font-weight:bold;">Instant</span> (Physical)</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div style="padding: 15px 20px; background: #f0f9f4; font-size: 14px; color: #004d26; line-height: 1.6; border-top: 1px solid #ccebd6;">
                <strong>💡 IWM Technical Insight:</strong> To maximise efficiency, Kersten recommends a <strong>"Mechanical Pass"</strong> first. Removing the organic growth medium (silt/soil) reduces the frequency of thermal treatments by up to 50%, significantly lowering annual operational costs.
            </div>`;
            
            
        // --- PART C: THE SMART ROI & SUSTAINABILITY ENGINE (v4.1 - DIPLOMATIC MODE) ---
        { 
            // 1. Context Detection
            const currentURL = window.location.href.toLowerCase();
            const pageTitle = document.title.toLowerCase();
            const isSweeperContext = currentURL.includes('sweeper') || currentURL.includes('collector') || pageTitle.includes('sweeper');
             
            // 2. Define Initial UI Text
            let widgetTitle = isSweeperContext ? "💰 Labor & Efficiency Calculator" : "🌍 Cost & Carbon Savings Audit";
            let initialInputLabel = isSweeperContext ? "Weekly Man-Hours (Current)" : "Annual Litres (Concentrate)";
            let distLabel = isSweeperContext ? "Site Size (Acres/Ha)" : "Network Size (KM)";
            let placeholder1 = isSweeperContext ? "e.g. 20" : "e.g. 400";
            let placeholder2 = isSweeperContext ? "e.g. 5" : "e.g. 50";

           const auditWidget = document.createElement('div');

auditWidget.id = 'kersten-authority-audit-widget';
auditWidget.className = 'pesticide-load-widget';
auditWidget.setAttribute('data-kersten-authority', 'audit');
            auditWidget.style.cssText = "background:#f9fbf9; border:2px solid #27ae60; border-radius:12px; margin:30px auto; max-width:1200px; width:100%; box-sizing:border-box; font-family:sans-serif; overflow:hidden; box-shadow:0 4px 15px rgba(39,174,96,0.1); clear:both; display:block;";

            auditWidget.innerHTML = `
                <div style="background:#f0f9f4; padding:15px 20px; border-bottom:1px solid #ccebd6; display:flex; justify-content:space-between; align-items:center;">
                    <h4 style="margin:0; color:#004d26; font-weight:800; font-size:16px;">${widgetTitle}</h4>
                    <span style="background:#27ae60; color:white; padding:4px 10px; border-radius:4px; font-size:11px; font-weight:bold;">2026 TENDER READY</span>
                </div>
                <div style="padding:25px;">
                    <p style="font-size:14px; color:#444; margin-bottom:20px; line-height:1.5;">
                        <strong>${isSweeperContext ? 'Productivity Analysis:' : 'Mandatory Impact Reporting:'}</strong> 
                        Calculate your ${isSweeperContext ? 'labor savings and ROI' : 'financial savings, active substance reduction, and carbon offset'} by transitioning to Kersten ${isSweeperContext ? 'mechanical' : 'chemical-free'} technology.
                    </p>

                    <div style="background:#f9fffb; padding:20px; border-radius:10px; border:1px dashed #27ae60; margin-bottom:20px;">
                        
                        <label style="display:block; font-size:12px; font-weight:bold; color:#004d26; margin-bottom:5px;">What are you comparing against?</label>
                        <select id="q-audit-method" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:6px; font-size:14px; margin-bottom:15px; background:white;">
                            ${isSweeperContext ? 
                                `<option value="manual">Manual Sweeping (Brooms/Hand)</option>
                                 <option value="contractor">External Contractor</option>` 
                                : 
                                `<option value="chemical">Glyphosate / Chemical Spraying</option>
                                 <option value="foam">Thermal (with Additives)</option>
                                 <option value="manual_weed">Manual Scraping / Hoeing</option>`
                            }
                        </select>

                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
                            <div>
                                <label id="q-audit-lbl-1" style="display:block; font-size:12px; font-weight:bold; color:#004d26; margin-bottom:5px;">${initialInputLabel}</label>
                                <input type="number" id="q-audit-input1" placeholder="${placeholder1}" style="width:100%; padding:12px; border:1px solid #ccc; border-radius:6px; font-size:15px;">
                            </div>
                            <div>
                                <label style="display:block; font-size:12px; font-weight:bold; color:#004d26; margin-bottom:5px;">${distLabel}</label>
                                <input type="number" id="q-audit-input2" placeholder="${placeholder2}" style="width:100%; padding:12px; border:1px solid #ccc; border-radius:6px; font-size:15px;">
                            </div>
                        </div>
                        <button id="q-audit-btn-exec" style="width:100%; margin-top:20px; background:#004d26; color:white; border:none; padding:15px; border-radius:8px; font-weight:bold; cursor:pointer; font-size:14px; letter-spacing:1px; text-transform:uppercase;">
                            Calculate Savings (Planet & Wallet)
                        </button>
                    </div>
                    <div id="q-audit-result-display" style="margin-top:20px; display:none; border-top:2px solid #eee; padding-top:20px; animation: fadeIn 0.5s;"></div>
                </div>`;

        // --- PART D: SMART PLACEMENT EXECUTION (UPDATED FOR CATEGORY & BLOG PAGES) ---
            const isProductPage = document.querySelector('.product-price, .cart-btn, [itemprop="offers"], .item-price');
            let pTable = (typeof productTable !== 'undefined') ? productTable : document.querySelector('.specification-table, .product-specs');
            let cIntro = (typeof contentIntro !== 'undefined') ? contentIntro : document.querySelector('.blog-content, .web-page-content');

            // 1. CONDITIONAL DISPLAY LOGIC FOR BLOGS
            let showTable = true;
            let showAudit = true;

            if (isBlog) {
                const blogText = (document.title + " " + (cIntro ? cIntro.innerText : document.body.innerText)).toLowerCase();
                // If it mentions hot water or hot air, show the table. Otherwise, show the audit.
                if (blogText.includes('hot water') || blogText.includes('hot air')) {
                    showTable = true;
                    showAudit = false;
                } else {
                    showTable = false;
                    showAudit = true;
                }
            }

            // 2. INJECTION LOGIC
            if (isBlog) {
                // BLOG PLACEMENT: Safely at the bottom of the actual blog content
                if (cIntro) {
                    if (showTable) cIntro.appendChild(tableContainer);
                    if (showAudit) cIntro.appendChild(auditWidget);
                } else {
                    // Fallback if no content wrapper is found
                    let mainTarget = document.querySelector('main, #page-content, article') || document.body;
                    if (showTable) mainTarget.appendChild(tableContainer);
                    if (showAudit) mainTarget.appendChild(auditWidget);
                }
                
            } else if (isProductPage) {
                // PRODUCT PAGE LOGIC: Keep it high up near specs/paragraphs
                if (pTable && pTable.parentNode) {
                    pTable.parentNode.insertBefore(tableContainer, pTable.nextSibling);
                    tableContainer.parentNode.insertBefore(auditWidget, tableContainer.nextSibling);
                } else if (cIntro) {
                    const paragraphs = cIntro.querySelectorAll('p');
                    if (paragraphs.length > 2 && paragraphs[2].parentNode) {
                         const targetNode = paragraphs[2];
                         targetNode.parentNode.insertBefore(tableContainer, targetNode);
                         tableContainer.parentNode.insertBefore(auditWidget, tableContainer.nextSibling);
                    } else {
                         cIntro.insertBefore(tableContainer, cIntro.firstChild);
                         if (tableContainer.parentNode) {
                             tableContainer.parentNode.insertBefore(auditWidget, tableContainer.nextSibling);
                         }
                    }
                }
            
            } else {
                // CATEGORY PAGE LOGIC: Put it strictly after the list of item cards
                const gridContainer = document.querySelector('.website-list, .item-list, .products-grid');
                const itemCards = document.querySelectorAll('.item-card, .product-card, .item-row');

                if (gridContainer && gridContainer.parentNode) {
                    gridContainer.parentNode.insertBefore(tableContainer, gridContainer.nextSibling);
                    tableContainer.parentNode.insertBefore(auditWidget, tableContainer.nextSibling);
                } else if (itemCards.length > 0) {
                    const lastCard = itemCards[itemCards.length - 1];
                    const container = lastCard.closest('.row') || lastCard.parentNode;
                    if (container && container.parentNode) {
                        container.parentNode.insertBefore(tableContainer, container.nextSibling);
                    } else {
                        lastCard.parentNode.insertBefore(tableContainer, lastCard.nextSibling);
                    }
                    tableContainer.parentNode.insertBefore(auditWidget, tableContainer.nextSibling);
                } else {
                    let backupTarget = document.querySelector('footer, .web-footer, #footer') || document.querySelector('#page-content, main, .page_content');
                    if (backupTarget && backupTarget.parentNode) {
                        backupTarget.parentNode.insertBefore(tableContainer, backupTarget);
                        tableContainer.parentNode.insertBefore(auditWidget, tableContainer.nextSibling);
                    } else {
                        document.body.appendChild(tableContainer);
                        document.body.appendChild(auditWidget);
                    }
                }
            }
            
            // --- PART E: THE LOGIC ENGINE ---
            setTimeout(function() {
                const execBtn = document.getElementById('q-audit-btn-exec');
                const methodSelect = document.getElementById('q-audit-method');
                const inputLabel1 = document.getElementById('q-audit-lbl-1');
                const inputField1 = document.getElementById('q-audit-input1');

                // 1. DYNAMIC LABEL SWITCHER
                if (methodSelect && inputLabel1) {
                    methodSelect.addEventListener('change', function() {
                        if (this.value === 'manual_weed') {
                            inputLabel1.innerText = "Weekly Man-Hours (Current)";
                            inputField1.placeholder = "e.g. 20";
                        } else if (!isSweeperContext) {
                            inputLabel1.innerText = "Annual Litres (Concentrate)";
                            inputField1.placeholder = "e.g. 400";
                        }
                    });
                }

                // 2. CALCULATION LOGIC
                if (execBtn) {
                    execBtn.onclick = function() {
                        const val1 = parseFloat(document.getElementById('q-audit-input1').value) || 0; 
                        const val2 = parseFloat(document.getElementById('q-audit-input2').value) || 0; 
                        const method = document.getElementById('q-audit-method').value;

                        if(val1 === 0) return;

                        let financialSaving = 0;
                        let ecoSaving = 0; 
                        let activeLoad = 0; 
                        let treeCount = 0; 
                        
                        let ecoLabel = "CO2e Saved";
                        let financeLabel = "Operational Savings";
                        let insightText = "";
                        let assumptionText = "";
                        let showGreenBanner = false;

                        // 1. CHEMICAL
                        if (method === 'chemical') {
                            financialSaving = (val1 * 12).toFixed(0); 
                            ecoSaving = (val1 * 30.5).toFixed(1); 
                            activeLoad = (val1 * 0.360).toFixed(2);
                            treeCount = Math.round(ecoSaving / 25);
                            showGreenBanner = true;
                            insightText = `By eliminating ${val1}L of chemical, you remove ${activeLoad}kg of active substance from the environment and avoid rising procurement costs.`;
                            assumptionText = "Glyphosate cost estimated at £12.00/L. Active substance calc: 360g/L.";
                        } 
                        // 2. FOAM (DIPLOMATIC UPDATE)
                        else if (method === 'foam') {
                            financialSaving = (val1 * 6.00).toFixed(0); 
                            ecoSaving = (val1 * 12.5).toFixed(1); 
                            treeCount = Math.round(ecoSaving / 25);
                            activeLoad = "0.00"; 
                            showGreenBanner = true; 
                            // DILUTED LANGUAGE: Focus on Logistics, not "Burning Budget"
                            insightText = `<strong>Operational Efficiency:</strong> Eliminating the requirement for additives removes a recurring supply chain cost and simplifies logistics. Kersten systems operate using water only, saving an estimated £${Number(financialSaving).toLocaleString()} annually.`;
                            assumptionText = "Additive costs modeled at typical industry consumable rates. Variables may differ by supplier.";
                        }
                        // 3. SWEEPERS
                        else if (method === 'manual' || method === 'contractor') {
                            if(method === 'manual') {
                                financialSaving = (val1 * 15 * 50).toFixed(0); 
                                ecoSaving = (val1 * 50).toFixed(0); 
                                ecoLabel = "Labor Hours Saved";
                                financeLabel = "Labor Re-allocation";
                                assumptionText = "Manual labor rate estimated at £15.00/hr.";
                            } else {
                                financialSaving = (val1 * 45 * 50).toFixed(0); 
                                ecoSaving = "100%";
                                ecoLabel = "Control Gained";
                                financeLabel = "Contractor Spend Saved";
                                assumptionText = "External contractor rate estimated at £45.00/hr.";
                            }
                            showGreenBanner = false; 
                            insightText = `Productivity Jump: This machine pays for itself in efficiency gains alone compared to manual labor.`;
                        }
                        // 4. MANUAL WEEDING
                        else if (method === 'manual_weed') {
                            financialSaving = (val1 * 15 * 50 * 0.9).toFixed(0); 
                            ecoSaving = (val1 * 50 * 0.9).toFixed(0);
                            ecoLabel = "Hours Reclaimed";
                            financeLabel = "Labor Cost Saved";
                            showGreenBanner = false;
                            insightText = `<strong>Velocity:</strong> Mechanical removal is significantly faster than manual scraping. You reclaim ${(val1 * 50 * 0.9).toFixed(0)} man-hours annually for skilled tasks.`;
                            assumptionText = "Manual labor rate estimated at £15.00/hr. Efficiency gain estimated at 90% vs hand-scraping.";
                        }

                        let greenBannerHTML = '';
                        if (showGreenBanner) {
                            greenBannerHTML = `
                            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; margin-bottom:20px;">
                                <div style="background:#f0f9f4; padding:15px; border-radius:8px; text-align:center; border:1px solid #27ae60;">
                                    <span style="display:block; font-size:22px; font-weight:900; color:#004d26;">${activeLoad} kg</span>
                                    <span style="font-size:10px; text-transform:uppercase; font-weight:bold; color:#27ae60;">Active Substance Reduced</span>
                                </div>
                                <div style="background:#f0f7ff; padding:15px; border-radius:8px; text-align:center; border:1px solid #2d95f0;">
                                    <span style="display:block; font-size:22px; font-weight:900; color:#003366;">${treeCount}</span>
                                    <span style="font-size:10px; text-transform:uppercase; font-weight:bold; color:#2d95f0;">Mature Trees Planted (Eq)</span>
                                </div>
                            </div>`;
                        }

                        const res = document.getElementById('q-audit-result-display');
                        res.style.display = 'block';
                        
                        res.innerHTML = `
                            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; margin-bottom:20px;">
                                <div style="background:#fffbe6; padding:20px; border:2px solid #f39c12; border-radius:8px; text-align:center;">
                                    <span style="display:block; font-size:28px; font-weight:900; color:#d35400;">£${Number(financialSaving).toLocaleString()}</span>
                                    <span style="font-size:11px; font-weight:bold; text-transform:uppercase; color:#d35400;">${financeLabel}</span>
                                </div>
                                <div style="background:#f0f9f4; padding:20px; border:2px solid #27ae60; border-radius:8px; text-align:center;">
                                    <span style="display:block; font-size:28px; font-weight:900; color:#004d26;">${ecoSaving}</span>
                                    <span style="font-size:11px; font-weight:bold; text-transform:uppercase; color:#27ae60;">${ecoLabel} ${method.includes('chemical') ? '(kg)' : ''}</span>
                                </div>
                            </div>
                            ${greenBannerHTML}
                            <div style="background:#f4f7f5; padding:15px; border-radius:8px; border-left:5px solid #003366; margin-bottom:20px; color:#333; font-size:14px; line-height:1.5;">
                                ${insightText}
                            </div>
                            <div style="margin-bottom:20px; padding-top:10px; border-top:1px solid #e0e0e0; font-size:11px; color:#777; line-height:1.4;">
                                <strong>Basis of Calculation:</strong> ${assumptionText}<br>
                                <em>Disclaimer: These figures are approximations based on typical industry rates and are for guidance purposes only.</em>
                            </div>
                            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                                <a href="/contact-us-pesticide-free-plan?message=ROI%20Audit:%20Saving%20£${financialSaving},%20${activeLoad}kg%20Active%20Substance" style="display:block; background:#004d26; color:#fff; text-align:center; padding:14px; border-radius:6px; text-decoration:none; font-weight:bold; font-size:13px; box-shadow:0 4px 6px rgba(0,77,38,0.2);">✉ Request Full Business Case</a>
                                <button onclick="window.print()" style="background:#fff; color:#333; border:1px solid #ccc; border-radius:6px; font-weight:bold; cursor:pointer; font-size:13px;">🖨️ Print Report</button>
                            </div>`;
                    };
                }
            }, 500); 
        }

        
        // --- PART F: SEMANTIC AI SCHEMAS ---
        const tableRowsArr = tableContainer.querySelectorAll('tbody tr');
        const dynamicFaqs = [];

        tableRowsArr.forEach(row => {
            const cols = row.querySelectorAll('td');
            if (cols.length >= 7) {
                const method = cols[0].innerText.trim(); 
                dynamicFaqs.push({
                    "@type": "Question",
                    "name": `Is ${method} effective for professional weed control?`,
                    "acceptedAnswer": { "@type": "Answer", "text": `${method} is highly effective for ${cols[2].innerText.trim()}. It operates at ${cols[1].innerText.trim()}, work rate of ${cols[3].innerText.trim()} and provides ${cols[6].innerText.trim()} root kill capability.` }
                });
            }
        });

        const faqScript = document.createElement('script');
        faqScript.type = "application/ld+json";
        faqScript.text = JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": dynamicFaqs });
        document.head.appendChild(faqScript);

        const semanticScript = document.createElement('script');
        semanticScript.type = "application/ld+json";
        semanticScript.text = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "mainEntity": [
                { "@type": "Service", "name": "Hot Water Weed Control", "additionalType": "http://www.productontology.org/id/Thermal_weed_control", "sameAs": "https://en.wikipedia.org/wiki/Thermal_weed_control" },
                { "@type": "IndividualProduct", "name": "Mechanical Weed Brush", "additionalType": "http://www.productontology.org/id/Power_broom", "sameAs": "https://en.wikipedia.org/wiki/Weed_brush" },
                { "@type": "Service", "name": "Integrated Weed Management", "description": "Holistic engineering approach to municipal weed control.", "sameAs": "https://en.wikipedia.org/wiki/Integrated_pest_management" }
            ]
        });
        document.head.appendChild(semanticScript);

cleanupDuplicateAuthorityWidgets();
return true;
    };

 // --- PART G: PERSISTENCE ENFORCER - HARDENED AGAINST DUPLICATION ---

let checkCount = 0;

const runEnforcer = setInterval(() => {

    cleanupDuplicateAuthorityWidgets();

    if (!authorityWidgetAlreadyExists()) {
        injectFullAuthorityStack();
    }

    const wizard = document.querySelector('.kersten-fitment-wizard');
    const content = document.querySelector('.page_content');

    if (wizard && content && content.lastElementChild !== wizard) {
        content.appendChild(wizard);
    }

    checkCount++;

    if (checkCount > 10 || authorityWidgetAlreadyExists()) {
        cleanupDuplicateAuthorityWidgets();
        clearInterval(runEnforcer);
    }

}, 500);

})();
/* =================================================================
   [R] THE COMPETITIVE ENGINEERING VETO (v2026.36 - STICKY BOTTOM DEPLOYMENT)
   -----------------------------------------------------------------
   Changes: 
   1. STRICT WHITELIST: Only runs on specific product/hot water paths.
   2. BOTTOM PLACEMENT: Injected at the end of the content.
   3. ORIGINAL STYLING: 100% match to the original design and data.
   ================================================================= */

(function() {
    console.log("KERSTEN VETO: Script Loaded v2026.36 (Strict Bottom Placement, Original Style)");

    // 1. DATA MATRIX (Unchanged)
    const comparisonLogic = {
        "kubota": { // PRO 10 (Twin Cyl)
            title: "🚜 HEAD-TO-HEAD: INDUSTRIAL VS. AMENITY",
            headers: ["Comparison Metric", "Kersten (Twin-Cyl Kubota)", "Standard Amenity Unit"],
            rows: [
                ["Cooling Physics", "<strong>WATER COOLED (Continuous)</strong>", "Air Cooled (Overheat Risk)"],
                ["Asset Lifespan", "<strong>20 Years (Industrial)</strong>", "5-10 Years (Commercial)"],
                ["Engine Class", "<strong>Kubota Diesel (2-Cyl)</strong>", "Stressed Petrol Engine"],
                ["Duty Cycle", "<strong>8hr+ Continuous Shift</strong>", "Intermittent / Heat Fade"],
                ["Thermal Stability", "<strong>High (Heavy Block Mass)</strong>", "Low (Lightweight Alloy)"],
                ["Torque Profile", "<strong>High Torque @ Low RPM</strong>", "Low Torque (High Revs)"],
                ["Fuel Logistics", "<strong>Red Diesel / HVO Ready</strong>", "Petrol (Storage Risk)"],
                ["OPEX / Cost", "<strong>£ (Water Only)</strong>", "<strong>£££ (Consumables and Additives)</strong>"]
            ]
        },
        "hatz": { // PRO 20 (Single Cyl) & GENERIC THERMAL
            title: "⚙️ TORQUE BATTLE: DIESEL VS. PETROL",
            headers: ["Performance Metric", "Kersten (Hatz Diesel)", "Standard Petrol / Additive Unit"],
            rows: [
                ["Cooling System", "<strong>WATER COOLED / Heavy Block</strong>", "Air Cooled (Heat Fade Risk)"],
                ["Asset Lifespan", "<strong>20 Years (Industrial)</strong>", "5-10 Years (Commercial)"],
                ["Engine Class", "<strong>Hatz Industrial Diesel</strong>", "Single Cyl. Petrol Engine"],
                ["Torque Profile", "<strong>High Torque @ Low RPM</strong>", "Low Torque (Needs High RPM)"],
                ["Workforce", "<strong>Dual Operator (2x Output)</strong>", "Single Operator (1x Output)"],
                ["Workflow", "<strong>Tow & Spray (Continuous)</strong>", "Stop-Start Repositioning"],
                ["Duty Cycle", "<strong>All-Day Operation</strong>", "Requires Cool-Downs"],
                ["Fuel Logistics", "<strong>Red Diesel / HVO Ready</strong>", "Petrol (Storage Risk)"],
                ["OPEX / Cost", "<strong>£ (Water Only)</strong>", "<strong>£££ (Consumables and Additives)</strong>"]
            ]
        },
        "electric": { // SP SERIES
            title: "⚡ EMISSIONS: TRUE EV VS. HYBRID",
            headers: ["Eco Metric", "Kersten Electric (Pure)", "Hybrid / Generator Unit"],
            rows: [
                ["Power Source", "<strong>High-Capacity Battery</strong>", "Petrol Generator / Hybrid"],
                ["Point Emissions", "<strong>Zero (True EV)</strong>", "High (Combustion Exhaust)"],
                ["Noise Profile", "<strong>Silent Operation</strong>", "Loud (Generator Noise)"],
                ["Indoor Safety", "<strong>Safe (Hospitals/Atriums)</strong>", "Unsafe (Fumes)"],
                ["Asset Life", "<strong>10+ Years (Modular)</strong>", "5-10 Years (Integrated)"],
                ["Vibration", "<strong>Zero (Electric Driven)</strong>", "High (Engine Driven)"],
                ["Maintenance", "<strong>Low (Built in Battery Maintenance)</strong>", "High (Engine Service)"],
                ["Compliance", "<strong>ULEZ / CAZ Exempt</strong>", "Restricted Access"]
            ]
        }
    };

    // 2. CONTEXT ENGINE (Strict Whitelist Approach)
    const determineContext = () => {
        const pageText = (document.title + " " + document.body.innerText).toLowerCase();
        const path = window.location.pathname.toLowerCase();

        // HARD BLOCK: Prevent appearing on generic pages
        const forbiddenPaths = ['/', '/index', '/contact', '/about', '/news', '/gallery'];
        if (forbiddenPaths.includes(path) || path === '') return null;

        // STRICT WHITELIST: Only trigger if relevant keywords are in the URL path
        // Adjust these keywords if your product page URLs use different terms!
        const isTargetPage = path.includes('product') || path.includes('weed') || path.includes('hot-water');
        if (!isTargetPage) return null;

        // LOGIC ASSIGNMENT
        if (pageText.includes("pro 10") || (pageText.includes("kubota") && pageText.includes("diesel"))) return "kubota";
        if (pageText.includes("pro 20") || pageText.includes("hatz") || pageText.includes("dual operator")) return "hatz";
        if (pageText.includes("sp 3") || pageText.includes("sp 6") || pageText.includes("battery powered")) return "electric";
        
        // GENERIC THERMAL (Fallback)
        const isThermalProduct = (pageText.includes("eco weedkiller") || pageText.includes("hot water") || pageText.includes("steam")) && (pageText.includes("specification") || pageText.includes("technical"));
        if (isThermalProduct) return "hatz";

        return null; 
    };

    // 3. INJECTION ENGINE
    const injectVeto = () => {
        // CHECK: If on blog, ask the controller (kept from your original script)
        if (window.location.href.includes('/blog')) {
            const ctx = window.kerstenBlogContextCache || (typeof window.getKerstenBlogContext === 'function' ? window.getKerstenBlogContext() : {});
            if (ctx.tool !== 'veto') return false;
        }

        if (document.getElementById('kersten-veto-table')) return true;
       
        const context = determineContext();
        if (!context) return false;

        const data = comparisonLogic[context];
        
        const vetoDiv = document.createElement('div');
        vetoDiv.id = 'kersten-veto-table';
        
        // Exact original CSS styling restored
        vetoDiv.style.cssText = "margin: 60px auto 40px auto; max-width: 1200px; border: 2px solid #004d26; border-radius: 8px; overflow: hidden; background: white; font-family: sans-serif; clear: both; box-shadow: 0 5px 15px rgba(0,0,0,0.08); display: block;";
        
        // Exact original HTML structure restored
        vetoDiv.innerHTML = `
            <div style="background: #004d26; color: white; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: 800; font-size: 16px; letter-spacing: 0.5px; text-transform: uppercase;">${data.title}</span>
                <span style="background: #c0392b; color: white; padding: 4px 8px; border-radius: 4px; font-weight: 900; font-size: 12px;">VS</span>
            </div>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <thead>
                        <tr style="background: #f4f4f4; border-bottom: 2px solid #ddd;">
                            <th style="padding: 12px 15px; text-align: left; width: 30%; color: #555; font-weight: 700;">${data.headers[0]}</th>
                            <th style="padding: 12px 15px; text-align: left; width: 35%; color: #004d26; background: #e8f5e9; border-top: 3px solid #27ae60; font-weight: 800;">
                                ${data.headers[1]}
                                <div style="font-size: 10px; font-weight: normal; margin-top: 2px; color: #27ae60;">(RECOMMENDED)</div>
                            </th>
                            <th style="padding: 12px 15px; text-align: left; width: 35%; color: #777; font-weight: 600;">${data.headers[2]}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.rows.map(row => `
                            <tr style="border-bottom: 1px solid #eee;">
                                <td style="padding: 12px 15px; font-weight: bold; color: #333;">${row[0]}</td>
                                <td style="padding: 12px 15px; background: #f0fdf4; color: #004d26; border-left: 1px solid #ccebd6; border-right: 1px solid #ccebd6;">${row[1]}</td>
                                <td style="padding: 12px 15px; color: #666;">${row[2]}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        // PLACEMENT: Pushed directly to the bottom (just above the footer)
        const footer = document.querySelector('footer') || document.querySelector('.footer');
        if (footer && footer.parentNode) {
            footer.parentNode.insertBefore(vetoDiv, footer);
            console.log("KERSTEN VETO: Placed above footer.");
            return true;
        } else {
            document.body.appendChild(vetoDiv);
            console.log("KERSTEN VETO: Appended to body end.");
            return true;
        }
    };

    // PERSISTENCE
    let retryCount = 0;
    const runner = setInterval(() => {
        retryCount++;
        if (injectVeto() || retryCount > 30) {
            clearInterval(runner);
        }
    }, 500);

})();

/* ==========================================================================

   [AUTO-DIFFERENTIATOR v9.1] SERIES INTELLIGENCE (BUG FIX)

   --------------------------------------------------------------------------

   FIX: 

   - Defined 'specTable' so the script doesn't crash during injection.

   - Includes 'Duty Class' Badges & Goldilocks Fitment Logic.

   ========================================================================== */

(function() {

    let attempts = 0;

    const MAX_ATTEMPTS = 30;

    

    const persistentPoller = setInterval(() => {

        attempts++;

        if (document.getElementById('dynamic-app-profile')) { clearInterval(persistentPoller); return; }

        if (attempts > MAX_ATTEMPTS) { clearInterval(persistentPoller); return; }



        // 1. Define Anchors (FIXED: Added specTable definition here)

        const wizardAnchor = document.querySelector('.kersten-fitment-wizard');

        const descContainer = document.querySelector('.product-description, .web-page-content, #main-content');

        const specTable = document.querySelector('table, .specification-table, .product-specs, .frappe-table');

        

        if (!descContainer && !wizardAnchor && !specTable) return;



        // --- DATABASE: EXTENDED TRACTOR WIDTHS (cm) ---

        const tractorWidths = [

            { name: "Solis 20/26", width: 105 },

            { name: "Kubota BX Series", width: 114 },

            { name: "John Deere 1-Series", width: 120 },

            { name: "Iseki TXGS 24", width: 122 },

            { name: "New Holland Boomer 25", width: 125 },

            { name: "Kubota B1 Series", width: 127 },

            { name: "Kubota B2 Series", width: 130 },

            { name: "John Deere 2-Series", width: 135 },

            { name: "Kubota LX Series", width: 135 },

            { name: "Kioti CS Series", width: 118 },

            { name: "Kioti CX Series", width: 125 },

            { name: "Kioti CK Series", width: 138 },

            { name: "Farmtrac 22", width: 105 },

            { name: "Farmtrac 26", width: 110 },

            { name: "Iseki TM Series", width: 110 },

            { name: "Iseki TH Series", width: 130 },

            { name: "Kubota L1/L2 Series", width: 145 },

            { name: "John Deere 3-Series", width: 150 },

            { name: "New Holland Boomer 35/40", width: 150 },

            { name: "John Deere 4-Series", width: 175 },

            { name: "Kubota M-Series", width: 190 },

            { name: "John Deere 5-Series", width: 200 }

        ];



        // 2. Data Harvesting

        let specs = { width: 0, weight: 0, capacity: 0, hp: 0, height: 0, features: [] };

        let widthScore = 0; 



        const clean = (str) => (str || '').toLowerCase().replace(/[^a-z0-9\sø]/g, '');

        const pageTitleRaw = document.title;

        const urlContext = window.location.href.toLowerCase();

        

        // --- SERIES DETECTION ---

        const isHeavyDuty = urlContext.includes('snk') || urlContext.includes('fkm') || urlContext.includes('hkm') || urlContext.includes('heavy');

        const isStandard = urlContext.includes('sch') || urlContext.includes('km') || urlContext.includes('light');

        

        const isPlough = urlContext.includes('plough') || urlContext.includes('snow') || urlContext.includes('blade');

        const isSpreader = urlContext.includes('spreader') || urlContext.includes('polaro');

        const isPowerUnit = urlContext.includes('machine') || urlContext.includes('hydro') && !isPlough;



        // Scrape Table

        const rows = document.querySelectorAll('tr');

        rows.forEach(row => {

            if (row.cells.length < 2) return;

            const label = clean(row.cells[0].innerText);

            const valRaw = row.cells[1].innerText;

            const valClean = clean(valRaw);

            const valNum = parseFloat(valRaw.match(/(\d+(\.\d+)?)/)?.[0] || 0);



            if (!label.includes('transport') && !label.includes('diameter') && !label.includes('ø') && !label.includes('angle')) {

                let currentScore = 0;

                let potentialWidth = 0;

                if (valClean.includes('mm')) potentialWidth = valNum / 10;

                else if (valClean.includes('cm')) potentialWidth = valNum;

                else if (valClean.includes('m') && valNum < 10) potentialWidth = valNum * 100;

                else if (valNum > 0 && valNum < 350) potentialWidth = valNum;



                if (label.includes('working width') || label.includes('clearing')) currentScore = 10;

                else if (label.includes('blade width')) currentScore = 8;

                else if (label.includes('width')) currentScore = 5;



                if (currentScore > widthScore && potentialWidth > 0) {

                    specs.width = potentialWidth;

                    widthScore = currentScore;

                }

            }

            if (label.includes('weight')) specs.weight = valNum;

            if (label.includes('capacity')) specs.capacity = valNum;

            if (label.includes('engine') && valClean.includes('hp')) specs.hp = valNum;

            if (valClean.includes('spring') || valClean.includes('trip')) specs.features.push("Spring-Loaded Trip");

            if (valClean.includes('rubber') || valClean.includes('ureth')) specs.features.push("Quiet Urethane Edge");

        });



        if (specs.width === 0) { // Fallback to title

            const titleMatch = pageTitleRaw.match(/(\d+)\s*(cm|mm|m)/i);

            if (titleMatch) {

                const num = parseFloat(titleMatch[1]);

                const unit = titleMatch[2].toLowerCase();

                if (unit === 'mm') specs.width = num / 10;

                else if (unit === 'cm') specs.width = num;

                else if (unit === 'm') specs.width = num * 100;

            }

        }



        if (specs.width === 0 && !isSpreader && !isPowerUnit) return;



        // 3. Logic Engine

        let sentA = "", sentB = "", sentC = "";

        let validMatches = [];

        let matchNote = "";

        let badge = "";



        // --- BADGE LOGIC ---

        if (isHeavyDuty || specs.weight > 250) {

            badge = `<span style="background:#2c3e50; color:white; padding:4px 10px; border-radius:4px; font-size:11px; font-weight:800; letter-spacing:1px;">🛡️ MUNICIPAL / HEAVY DUTY</span>`;

            sentC = `<strong>Series Note:</strong> This is a "Heavy Duty" variant, featuring reinforced chassis components and higher-grade steel for continuous municipal or contracting operations.`;

        } else if (isStandard || specs.weight < 250) {

            badge = `<span style="background:#27ae60; color:white; padding:4px 10px; border-radius:4px; font-size:11px; font-weight:800; letter-spacing:1px;">🏡 COMPACT / ESTATE SERIES</span>`;

            sentC = `<strong>Series Note:</strong> This "Compact Series" model is optimized for weight-sensitivity, allowing professional performance on smaller tractors without overloading the rear axle.`;

        }



        // --- WIDTH & FITMENT LOGIC ---

        if (!isSpreader && !isPowerUnit && specs.width > 0) {

            let effectiveWidth = isPlough ? Math.round(specs.width * 0.88) : specs.width;

            

            // 30cm Goldilocks Rule (Expanded slightly for better matching)

            const minTractorWidth = effectiveWidth - 30;

            const maxTractorWidth = effectiveWidth;



            validMatches = tractorWidths

                .filter(t => t.width >= minTractorWidth && t.width <= maxTractorWidth)

                .map(t => `${t.name} (${t.width}cm)`);

            

            matchNote = `*Matches based on effective working width of ${effectiveWidth}cm (Ideal Track Width: ${minTractorWidth}-${maxTractorWidth}cm).`;



            if (specs.width <= 140) sentA = `With a working width of <strong>${specs.width}cm</strong>, this model is the definitive "Path-Master," calibrated to clear standard 1.2m UK footpaths.`;

            else if (specs.width <= 175) sentA = `Spanning <strong>${specs.width}cm</strong>, this unit enters the "Utility Class," designed to mask the wheel track of modern compact tractors (25hp+).`;

            else sentA = `At <strong>${specs.width}cm</strong>, this machine is built for "Municipal Productivity," covering estate roads rapidly.`;



            if (isPlough) {

                 sentA = `<strong>❄️ Winter Clearing Physics:</strong> While the total blade width is <strong>${specs.width}cm</strong>, the effective clearing path when angled (30°) is approximately <strong>${effectiveWidth}cm</strong>.`;

            }

        }

        else if (isSpreader && specs.capacity > 0) {

            const bags = Math.floor(specs.capacity / 25);

            sentA = `With a hopper capacity of <strong>${specs.capacity} Litres</strong>, this unit accepts approximately <strong>${bags} x 25kg bags</strong> of salt.`;

            badge = `<span style="background:#2980b9; color:white; padding:4px 10px; border-radius:4px; font-size:11px; font-weight:800; letter-spacing:1px;">❄️ WINTER LOGISTICS</span>`;

        }



        // 4. Construct UI

        if (!sentA) return;



        clearInterval(persistentPoller);



        const profileBox = document.createElement('div');

        profileBox.id = 'dynamic-app-profile';

        profileBox.style.cssText = "background:#fdfdfd; border-left:4px solid #004d26; border:1px solid #e0e0e0; border-left-width:4px; padding:25px; margin-bottom:25px; border-radius:4px; font-family:'Inter', sans-serif; animation: fadeIn 0.5s ease-in-out;";

        

        let tractorHTML = '';

        if (validMatches.length > 0) {

            tractorHTML = `

                <div style="margin-top:20px; padding-top:15px; border-top:1px dashed #ccc;">

                    <span style="font-size:12px; font-weight:800; color:#555; text-transform:uppercase; display:block; margin-bottom:8px;">

                        ${isPlough ? '✅ Verified Track-Width Matches:' : '🚜 Calculated Ideal Matches:'}

                    </span>

                    <div style="display:flex; flex-wrap:wrap; gap:8px;">

                        ${validMatches.map(t => 

                            `<span style="background:#f0f9f4; border:1px solid #004d26; color:#004d26; font-size:12px; font-weight:700; padding:4px 10px; border-radius:4px;">✓ ${t}</span>`

                        ).join('')}

                    </div>

                    <div style="font-size:11px; color:#888; margin-top:6px;">${matchNote}</div>

                </div>

            `;

        } else if (!isSpreader && !isPowerUnit) {

             tractorHTML = `

                <div style="margin-top:20px; padding-top:15px; border-top:1px dashed #ccc;">

                    <span style="font-size:12px; font-weight:800; color:#888; text-transform:uppercase; display:block; margin-bottom:8px;">

                        🚜 Tractor Fitment Note:

                    </span>

                    <div style="font-size:13px; color:#555;">No standard compact tractors found for this specific width range (${specs.width - 20}-${specs.width}cm). This unit may require a specialist carrier.</div>

                </div>`;

        }



        profileBox.innerHTML = `

            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">

                <h4 style="margin:0; color:#004d26; font-size:16px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px;">

                    📊 Technical Application Profile

                </h4>

                ${badge}

            </div>

            <p style="font-size:15px; line-height:1.7; color:#333; margin-bottom:10px;">

                ${sentA} ${sentB}

            </p>

            <p style="font-size:14px; line-height:1.6; color:#555; margin-bottom:0; background:#f4f4f4; padding:10px; border-radius:4px;">

                ${sentC}

            </p>

            ${tractorHTML}

            <style>@keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }</style>

        `;



        // 5. Injection (Priority: Wizard -> Description -> Table)

        if (wizardAnchor && wizardAnchor.parentNode) {

            wizardAnchor.parentNode.insertBefore(profileBox, wizardAnchor.nextSibling);

        } else if (descContainer) {

            descContainer.insertBefore(profileBox, descContainer.firstChild);

        } else if (specTable && specTable.parentNode) { 

             specTable.parentNode.insertBefore(profileBox, specTable.nextSibling);

        }



    }, 200); 

})();

    

 /* --- [M] DYNAMIC LOCAL DEALER WIDGET (Compact Button Version) --- */
const injectDealerWidget = function() {
    // EXCLUSION: Never run on cart, checkout, or desk pages
    const _path = window.location.pathname;
    if (_path.includes('/cart') || _path.includes('/checkout') || window.location.href.includes('/desk')) return false;

    // 1. Identify Target
    const productAnchor = document.querySelector('.product-price, .cart-btn, [itemprop="offers"], .item-price');
    
    // Safety: If not found, return false so we can retry
    if (!productAnchor) return false;
    
    // Check if widget already exists to prevent duplicates
    if (document.querySelector('.kersten-dealer-locator')) return true;

    // 2. Create Compact Button Container
    const dealerWidget = document.createElement('div');
    dealerWidget.className = 'kersten-dealer-locator';
    
    // Adjusted styling to take up less vertical space (removed the min-height requirement)
    dealerWidget.style.cssText = "margin: 20px 0; clear: both; display: block;";
    
    dealerWidget.innerHTML = `
        <a href="https://kerstenuk.com/Kersten-Stocking-Dealers-Hire-Partners-and-Contractors" 
           style="display: block; background: #004d26; color: #fff; text-align: center; padding: 16px 20px; border-radius: 8px; text-decoration: none; font-weight: 800; font-size: 15px; font-family: sans-serif; box-shadow: 0 4px 10px rgba(0, 77, 38, 0.2); transition: transform 0.2s ease, box-shadow 0.2s ease;"
           onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 15px rgba(0, 77, 38, 0.3)';"
           onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 10px rgba(0, 77, 38, 0.2)';">
            📍 Find a Local Stocking Dealer or Hire Partner &rarr;
        </a>
    `;

    // 3. Insert Button
    productAnchor.parentNode.insertBefore(dealerWidget, productAnchor.nextSibling);
    return true; // Success
};

// RETRY LOGIC: Try at 1s, 2s, 3s, and 5s to catch slow ERPNext page loads
[1000, 2000, 3000, 5000].forEach(delay => setTimeout(injectDealerWidget, delay));

/* --- [A-C] TARGETED IWM AUTHORITY ENGINE --- */

(function () {
    "use strict";

    var path = window.location.pathname.toLowerCase();

    try {
        path = decodeURIComponent(path);
    } catch (error) {
        // Keep the original path if decoding fails.
    }

    var contentElement =
        document.querySelector(".blog-content") ||
        document.querySelector(".web-page-content") ||
        document.querySelector(".product-description") ||
        document.querySelector(".page_content") ||
        document.querySelector("article") ||
        document.querySelector("main") ||
        document.querySelector("#main-content");

    var pageContent = (
        document.title +
        " " +
        (contentElement ? contentElement.innerText : "")
    )
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();

    var iwmPathTerms = [
        "integrated-weed",
        "integrated weed",
        "chemical-free",
        "chemical free",
        "pesticide-free",
        "pesticide free",
        "weed-management",
        "weed management",
        "weed-control",
        "weed control",
        "weed-brush",
        "weedbrush",
        "thermal-weed",
        "thermal weed",
        "hot-water",
        "hot water",
        "hot-air",
        "hot air",
        "eco-weedkiller",
        "ripagreen",
        "zasso",
        "national-action-plan",
        "national action plan",
        "nap-2025",
        "bracknell",
        "weeds-are-not-the-problem",
        "iwm-workshop"
    ];

    var iwmContentTerms = [
        "integrated weed management",
        "pesticide reduction",
        "glyphosate reduction",
        "chemical-free weed control",
        "chemical free weed control",
        "pesticide-free weed control",
        "pesticide free weed control",
        "mechanical weed control",
        "thermal weed control"
    ];

    var councilTerms = [
        "council",
        "local authority",
        "borough",
        "municipal",
        "public realm",
        "amenity contractor"
    ];

    var isDirectIwmPage =
        iwmPathTerms.some(function (term) {
            return path.indexOf(term) !== -1;
        });

    var isRelevantIwmArticle =
        (
            path.indexOf("/blog/") !== -1 ||
            path.indexOf("/news/") !== -1
        ) &&
        iwmContentTerms.some(function (term) {
            return pageContent.indexOf(term) !== -1;
        });

    var isIwmPage =
        isDirectIwmPage ||
        isRelevantIwmArticle;

    if (!isIwmPage) {
        return;
    }

    var isCouncilPage =
        councilTerms.some(function (term) {
            return pageContent.indexOf(term) !== -1;
        });

    var authBar =
        document.getElementById("kersten-authority-outer");

    if (authBar && isCouncilPage) {
        authBar.style.borderBottom =
            "4px solid #ffcc00";

        var councilLink =
            authBar.querySelector(
                'a[href*="national-action-plan"]'
            );

        if (councilLink) {
            councilLink.textContent =
                "View the Council IWM Guide";

            councilLink.style.backgroundColor =
                "#ffcc00";

            councilLink.style.color =
                "#004d26";

            councilLink.style.borderColor =
                "#ffcc00";
        }
    }

    var authoritySchema = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id":
            window.location.origin +
            window.location.pathname +
            "#iwm-webpage",
        "url":
            window.location.origin +
            window.location.pathname,
        "name":
            document.querySelector("h1")
                ? document.querySelector("h1").innerText.trim()
                : document.title,
        "author": {
            "@id": "https://kerstenuk.com/#person"
        },
        "publisher": {
            "@id": "https://kerstenuk.com/#organization"
        },
        "about": [
            {
                "@type": "Thing",
                "name": "Integrated Weed Management"
            },
            {
                "@type": "Thing",
                "name": "Professional Amenity Weed Management"
            }
        ],
        "mentions": [
            {
                "@type": "CreativeWork",
                "name": "UK Pesticides National Action Plan 2025",
                "url": "https://www.gov.uk/government/publications/uk-pesticides-national-action-plan-2025"
            },
            {
                "@type": "CreativeWork",
                "name": "Parks for London Integrated Weed Management Reference Guide 2025",
                "url": "https://parksforlondon.org.uk/resource/integrated-weed-management/"
            },
            {
                "@type": "CreativeWork",
                "name": "Lantra Integrated Weed Management Training",
                "url": "https://www.lantra.co.uk/product/35943"
            }
        ]
    };

    if (isCouncilPage) {
        authoritySchema.audience = {
            "@type": "Audience",
            "audienceType":
                "UK local authorities, councils, grounds teams and amenity contractors"
        };
    }

    performSchemaInjection(authoritySchema);
})();




/* ================================================================= */
/* [D-RESCUE] TOPIC CLUSTER & BLOG NAVIGATOR (Footer-Docked v2.1)    */
/* ================================================================= */
(function() {
    // 1. Gatekeeper: Only run on Blog/News/Product pages (Skip lists/home)
    const currentPath = window.location.pathname;
    if (currentPath === '/' || 
        currentPath.includes('fitment-tool-embed') || 
        currentPath.includes('/cart') ||
        window.location.href.includes('/desk')) return;

    const runClusterEngine = function() {
        // 2. Prevent Duplicates
        if (document.querySelector('.authority-cluster-box')) return;

        // 3. Target the Content Source (for scraping context)
        const contentAnchor = document.querySelector('.blog-content') || 
                              document.querySelector('.web-page-content') || 
                              document.querySelector('.product-description') ||
                              document.querySelector('article');

        // If no content to "read", we can't recommend. Stop.
        if (!contentAnchor) return;

        // 4. Define The Library (Your Assets)
        const library = [
            // Strategy & Compliance
            { keys: ["math", "litre", "load", "volume", "spraying", "chemical"], label: "📉 Strategy: The New Math of Weed Control", url: "/blog/Sweeping,%20moss%20and%20weed%20control/the-new-math-of-weed-management-beyond-the-litre-into-the-load" },
            { keys: ["roadmap", "future", "2026", "nap", "legislation", "defra"], label: "🔮 Vision: The 2026 IWM Roadmap", url: "/blog/Sweeping,%20moss%20and%20weed%20control/the-2026-roadmap-redefining-weed-management-in-the-amenity-sector" },
            { keys: ["edge", "road", "pavement", "structural", "tracy", "highway"], label: "🏗️ Insight: Tracy's Law & Road Integrity", url: "/blog/Sweeping,%20moss%20and%20weed%20control/tracy%E2%80%99s-law-why-losing-the-edge-means-losing-the-road" },
            
            // Solutions
            { keys: ["sweeper", "debris", "mud", "silt", "collector"], label: "🧹 Machine: Mechanical Sweepers", url: "/sweepers" },
            { keys: ["weedbrush", "moss", "kerb", "edge", "brush"], label: "🌿 Machine: Weedbrushes", url: "/weed-brush" },
            { keys: ["thermal", "hot", "steam", "foam", "heat"], label: "🔥 Machine: Thermal Weed Control", url: "/hoaf-thermal-weed-control" },
            { keys: ["winter", "snow", "ice", "salt", "grit"], label: "❄️ Machine: Winter Maintenance", url: "/winter-equipment" }
        ];

        // 5. Context Matcher
        const pageText = (document.title + " " + contentAnchor.innerText.substring(0, 2000)).toLowerCase();
        
        let matches = library.filter(item => 
            item.keys.some(k => pageText.includes(k)) && 
            !window.location.href.includes(item.url) // Don't link to self
        );

        // Fallback: If no specific matches, fill with Strategy links
        if (matches.length < 3) {
            const fallback = library.filter(item => !window.location.href.includes(item.url));
            // Add fallbacks to the end, then slice top 4
            matches = [...matches, ...fallback].filter((v,i,a)=>a.findIndex(t=>(t.url===v.url))===i).slice(0, 4);
        } else {
            matches = matches.slice(0, 4);
        }

        // 6. Build the UI (Footer-Docked Style)
        const box = document.createElement('div');
        box.className = 'authority-cluster-box';
        // Style: Full width, subtle background, distinct from footer but connected
        box.style.cssText = "width: 100%; margin: 0; padding: 50px 0; background: #fdfdfd; border-top: 1px solid #eee; font-family: 'Segoe UI', sans-serif; position: relative; z-index: 10;";
        
        box.innerHTML = `
            <div style="max-width: 1200px; margin: 0 auto; padding: 0 15px;">
                <div style="display:flex; align-items:center; margin-bottom: 25px;">
                    <div style="width: 40px; height: 4px; background: #ffcc00; margin-right: 15px;"></div>
                    <h4 style="margin: 0; color: #004d26; font-size: 18px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
                        Explore Related Solutions & Insights
                    </h4>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 15px;">
                    ${matches.map(link => `
                        <a href="${link.url}" style="display: flex; align-items: center; text-decoration: none; background: white; padding: 15px 20px; border: 1px solid #e0e0e0; border-radius: 8px; transition: all 0.2s; box-shadow: 0 2px 5px rgba(0,0,0,0.02);">
                            <span style="color: #ffcc00; margin-right: 12px; font-size: 18px; font-weight: 900;">➔</span>
                            <span style="color: #004d26; font-weight: 700; font-size: 14px; line-height: 1.4;">${link.label}</span>
                        </a>
                    `).join('')}
                </div>

                <div style="margin-top: 25px; font-size: 13px; color: #666; font-style: italic; display: flex; align-items: center; gap: 10px;">
                    <span>🛡️ <strong>Kersten Authority Engine:</strong> Linking you to verified engineering data and NAP 2025 compliance frameworks.</span>
                </div>
            </div>
            
            <style>
                .authority-cluster-box a:hover { transform: translateY(-3px); box-shadow: 0 5px 15px rgba(0,0,0,0.08) !important; border-color: #004d26 !important; }
            </style>
        `;

        // 7. Inject (Footer Docking Logic)
        const footer = document.querySelector('footer, .layout-footer, #footer');
        
        if (footer) {
            // Insert IMMEDIATELY BEFORE the footer
            footer.parentNode.insertBefore(box, footer);
            console.log("Kersten Cluster: Docked above Footer.");
        } else {
            // Fallback: Append to body
            document.body.appendChild(box);
        }
    };

    // 8. Persistence Timer
    let attempts = 0;
    const clusterTimer = setInterval(() => {
        attempts++;
        runClusterEngine();
        // Stop if we found the box OR if we've tried for 4 seconds
        if (document.querySelector('.authority-cluster-box') || attempts > 8) {
            clearInterval(clusterTimer);
        }
    }, 500);

})();

    

   



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



/* --- [F] BLOG AUTHORITY OVERWRITE (v121.0 - Safety Context Patch) --- */

    // 1. SAFETY TRIGGER: Check if URL is blog/news AND ensure it is NOT a product page

    const isBlogUrl = window.location.href.includes('/blog') || window.location.href.includes('/news');

    const isProductPage = document.querySelector('.product-price') || document.querySelector('.cart-btn') || document.querySelector('[itemprop="price"]');



    if (isBlogUrl && !isProductPage) {

        setTimeout(() => {

            // 2. CLEANUP: Remove conflicting/duplicate ERPNext schemas to avoid "Double Classification"

            const systemScripts = document.querySelectorAll('script[type="application/ld+json"]');

            systemScripts.forEach(s => {

                if ((s.text.includes('"Article"') || s.text.includes('"BlogPosting"')) && !s.text.includes('#person')) {

                    s.remove(); 

                }

            });



            // 3. INJECT: Authority-Grade Schema

            const blogSchema = {

                "@context": "https://schema.org",

                "@type": "BlogPosting",

                "@id": window.location.href + "#article",

                "mainEntityOfPage": { "@type": "WebPage", "@id": window.location.href },

                "headline": document.querySelector('.blog-title, h1')?.innerText.trim() || document.title,

                "description": (document.querySelector('meta[name="description"]') ? document.querySelector('meta[name="description"]').content : "") || "Specialist guidance on the UK Pesticide National Action Plan 2025 (NAP).",

                "image": { "@type": "ImageObject", "url": document.querySelector('meta[property="og:image"]')?.content || "https://kerstenuk.com/files/kersten-logo.png" },

                "author": { "@id": "https://kerstenuk.com/#person" },

                "publisher": { 

                    "@id": "https://kerstenuk.com/#organization",

                    "@type": "Organization",

                    "name": "Kersten UK Limited",

                    "logo": { "@type": "ImageObject", "url": "https://kerstenuk.com/files/kersten-logo.png" }

                },

                "datePublished": document.querySelector('meta[property="article:published_time"]')?.content || "2025-01-01T08:00:00+00:00",

                "dateModified": new Date().toISOString()

            };

            performSchemaInjection(blogSchema);

        }, 600);

    }

    /* --- [G] CASE STUDY AUTHORITY ENGINE --- */

    if (window.location.href.includes('case-study')) {

        const tractors = ["Kubota", "John Deere", "Iseki", "Kioti", "New Holland"];

        const machines = ["Sweeper", "WeedBrush", "Hoaf", "Ripagreen", "Zasso"];

        

        const usedTractor = tractors.find(t => fullBodyText.includes(t)) || "Compact Tractor";

        const usedMachine = machines.find(m => fullBodyText.includes(m)) || "Kersten Attachment";



        const caseStudySchema = {

            "@context": "https://schema.org",

            "@type": "Article",

            "@id": window.location.href + "#casestudy",

            "headline": document.querySelector('h1')?.innerText || document.title,

            "description": `Technical case study demonstrating the integration of ${usedMachine} with ${usedTractor} for professional grounds maintenance.`,

            "author": { "@id": "https://kerstenuk.com/#person" },

            "publisher": { "@id": "https://kerstenuk.com/#organization" },

            "mainEntityOfPage": { "@type": "WebPage", "@id": window.location.href },

            "about": [

                { "@type": "Thing", "name": usedTractor },

                { "@type": "Thing", "name": usedMachine }

            ]

        };

        performSchemaInjection(caseStudySchema);

    }



    /* --- [H] SERIES CAROUSEL ENGINE --- */

    const isSeriesPage = window.location.href.includes('series') || window.location.href.includes('range') || window.location.href.includes('attachments') || window.location.href.includes('sweepers') || window.location.href.includes('weedbrush');

    if (isSeriesPage) {

        const carouselItems = [];

        const productCards = document.querySelectorAll('.product-item, .product-card, .item-card, .shop-card');



        productCards.forEach((card, index) => {

            const linkElement = card.querySelector('a');

            const imgElement = card.querySelector('img');

            const titleElement = card.querySelector('.product-title, .item-title, h3, h4');



            if (linkElement && titleElement) {

                carouselItems.push({

                    "@type": "ListItem",

                    "position": index + 1,

                    "url": linkElement.href,

                    "name": titleElement.innerText.trim(),

                    "image": imgElement ? imgElement.src : "https://kerstenuk.com/files/kersten-logo.png"

                });

            }

        });



        if (carouselItems.length > 0) {

            const seriesName = document.querySelector('h1')?.innerText || "Kersten Machine Series";

            performSchemaInjection({

                "@context": "https://schema.org",

                "@type": "ItemList",

                "name": seriesName,

                "itemListOrder": "https://schema.org/ItemListOrderAscending",

                "numberOfItems": carouselItems.length,

                "itemListElement": carouselItems

            });

        }

    }

    

    /* --- [I] SERVICE & EVENTS ENGINE --- */

    if (window.location.href.includes('event') || window.location.href.includes('demo') || window.location.href.includes('show')) {

        const eventName = document.querySelector('h1') ? document.querySelector('h1').innerText : "";

        const eventDate = document.querySelector('.date, .event-date, time')?.innerText;

        const eventLoc = document.querySelector('.location, .venue, .address')?.innerText;

        

        if (eventName && eventDate) {

            performSchemaInjection({

                "@context": "https://schema.org",

                "@type": "Event",

                "name": eventName,

                "startDate": new Date().toISOString(), 

                "eventStatus": "https://schema.org/EventScheduled",

                "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",

                "location": { "@type": "Place", "name": eventLoc || "Kersten UK Demo Site", "address": { "@type": "PostalAddress", "addressCountry": "GB" } },

                "organizer": { "@id": "https://kerstenuk.com/#organization" }

            });

        }

    }



    if (window.location.href.includes('training') || window.location.href.includes('lantra') || window.location.href.includes('course')) {

        performSchemaInjection({

            "@context": "https://schema.org",

            "@type": "Course",

            "name": document.querySelector('h1')?.innerText || "Integrated Weed Management Training",

            "description": (document.querySelector('meta[name="description"]') ? document.querySelector('meta[name="description"]').content : "") || "Lantra certified training for professional IWM.",

            "provider": { "@id": "https://kerstenuk.com/#organization" },

            "educationalCredentialAwarded": "Lantra Certificate of Competence"

        });

    }



  /* --- [N] INSTANT AUDIT PRINTER FUNCTION (Global Helper) --- */

    function addPrintButton(widgetID, type) {

        const resultBox = document.getElementById(widgetID + '-result');

        if (!resultBox) return;



        // Prevent Duplicate Buttons

        if (resultBox.querySelector('.kersten-print-btn')) return;



        const printBtn = document.createElement('button');

        printBtn.innerHTML = '🖨️ Print Official Compliance Card';

        printBtn.className = 'kersten-print-btn';

        printBtn.style.cssText = 'margin-top:10px; background:#fff; color:#004d26; border:1px solid #004d26; padding:8px 12px; border-radius:4px; cursor:pointer; font-size:12px; width:100%; font-weight:bold;';

        

        printBtn.onclick = function() {

            const dataToPrint = resultBox.innerHTML;

            const printWindow = window.open('', '', 'height=600,width=800');

            printWindow.document.write('<html><head><title>Kersten UK Compliance Audit</title>');

            printWindow.document.write('<style>body{font-family:sans-serif; color:#333; padding:40px;} .audit-box{border:2px solid #004d26; padding:30px; border-radius:10px;} h1{color:#004d26;} .footer{margin-top:50px; font-size:12px; color:#666; border-top:1px solid #ccc; padding-top:10px;}</style>');

            printWindow.document.write('</head><body>');

            printWindow.document.write('<div class="audit-box">');

            printWindow.document.write('<img src="https://kerstenuk.com/files/kersten-logo.png" style="width:150px; margin-bottom:20px;">');

            printWindow.document.write('<h1>' + (type === 'havs' ? 'HAVS Safety Audit' : 'NAP 2026 Reduction Audit') + '</h1>');

            printWindow.document.write('<p><strong>Date:</strong> ' + new Date().toLocaleDateString() + '</p>');

            printWindow.document.write('<hr style="border:0; border-top:1px solid #eee; margin:20px 0;">');

            printWindow.document.write(dataToPrint);

            printWindow.document.write('<div style="margin-top:30px; background:#f9f9f9; padding:15px; border-left:4px solid #ffcc00;"><strong>Next Step:</strong> This is a preliminary calculation. For a full certified strategy review, please contact Kersten UK.</div>');

            printWindow.document.write('</div>');

            printWindow.document.write('<div class="footer">Generated by Kersten Authority Engine | kerstenuk.com | 0118 986 9253</div>');

            printWindow.document.write('</body></html>');

            printWindow.document.close();

            printWindow.print();

        };

        resultBox.appendChild(printBtn);

    }



    /* --- DELAYED INTELLIGENCE BLOCK (Data Scrapers & Master Entity Weld) --- */

    /* This waits 4.0s for ERPNext to stabilize, then scrapes and injects */

    setTimeout(function() {

        updateCTAByPrice(); 

        adjustForMobile(); 

        

        // 6. QUANTITATIVE MACHINE SPECIFICATION & LOGISTICS ENGINE (v123.0)

        let machineQuantitativeSpecs = [];

        let specificMachineWeightKg = 0;

        let machineWidthCm = 0;

        let machineNoiseLevelDb = 0;

        let generatedFaqs = []; 

        

        const technicalTableRows = document.querySelectorAll('table tr, .specification-row, .product-spec-item, .tech-data-row');

        technicalTableRows.forEach(function(row) {

            if (row.cells && row.cells.length >= 2) {

                let technicalKeyName = row.cells[0].innerText.replace(':', '').trim();

                let technicalValueData = row.cells[1].innerText.trim();

                let lowerKey = technicalKeyName.toLowerCase();

                let lowerVal = technicalValueData.toLowerCase();

                let cleanPageName = currentDocumentTitle.split('|')[0].trim();



                // --- DATA EXTRACTION & NORMALIZATION ---

                let numMatch = technicalValueData.match(/(\d+(\.\d+)?)/);

                let rawNum = numMatch ? parseFloat(numMatch[0]) : 0;



                if (lowerKey.includes('vibration')) {

                    generatedFaqs.push({ "@type": "Question", "name": `What is the HAVS vibration level for the ${cleanPageName}?`, "acceptedAnswer": { "@type": "Answer", "text": `The ${cleanPageName} features a recorded HAVS vibration level of ${technicalValueData}, designed for safe, long-duration commercial operation.` } });

                }

                

                if (lowerKey.includes('weight') || lowerKey.includes('operating mass')) {

                    specificMachineWeightKg = rawNum;

                    // Handle tonnes if applicable, though rare for compacts

                    if (lowerVal.includes('tonne') || lowerVal.includes('ton')) specificMachineWeightKg = rawNum * 1000;

                    

                    generatedFaqs.push({ "@type": "Question", "name": `What is the operating weight of the ${cleanPageName}?`, "acceptedAnswer": { "@type": "Answer", "text": `The ${cleanPageName} has an operating weight of ${technicalValueData}.` } });

                }

                

                if (lowerKey.includes('noise') || lowerKey.includes('sound')) {

                    machineNoiseLevelDb = rawNum;

                    generatedFaqs.push({ "@type": "Question", "name": `What is the noise output of the ${cleanPageName}?`, "acceptedAnswer": { "@type": "Answer", "text": `The ${cleanPageName} operates at a noise level of ${technicalValueData}.` } });

                }



                if (lowerKey.includes('width') || lowerKey.includes('working')) {

                    // Normalize to CM for Logic Checks

                    if (lowerVal.includes('mm')) machineWidthCm = rawNum / 10;

                    else if (lowerVal.includes('cm')) machineWidthCm = rawNum;

                    else if (lowerVal.includes('m') && !lowerVal.includes('mm') && !lowerVal.includes('cm')) machineWidthCm = rawNum * 100;

                    

                    generatedFaqs.push({ "@type": "Question", "name": `What is the working width of the ${cleanPageName}?`, "acceptedAnswer": { "@type": "Answer", "text": `The ${cleanPageName} offers a working width of ${technicalValueData}.` } });

                }

                

                // --- SCHEMA PROPERTY CREATION ---

                let technicalPropertyObj = { "@type": "PropertyValue", "name": technicalKeyName, "value": technicalValueData };

                if (numMatch && (lowerVal.includes('cm') || lowerVal.includes('mm') || lowerVal.includes('kg') || lowerVal.includes('db'))) {

                    let technicalUnitType = lowerVal.includes('cm') ? "CMT" : lowerVal.includes('mm') ? "MMT" : lowerVal.includes('kg') ? "KGM" : "DB";

                    technicalPropertyObj.valueReference = { "@type": "QuantitativeValue", "value": rawNum, "unitCode": technicalUnitType };

                }

                machineQuantitativeSpecs.push(technicalPropertyObj);

            }

        });







/* --- [NEW] STANDALONE LOGISTICS INTELLIGENCE (v126.3 - FIXED POSITION) --- */

function injectLogisticsBar() {

    if (window.location.href.includes('fitment-tool-embed')) return; // STOP if embed

    // 1. Prevent Duplicates

    if (document.querySelector('.logistics-bar')) return;



    // 2. Scrape Data with Enhanced Accuracy

    let weight = 0, width = 0, noise = 0;

    

    document.querySelectorAll('table tr, .specification-row, .frappe-table tr').forEach(row => {

        if (row.cells && row.cells.length >= 2) {

            const key = row.cells[0].innerText.toLowerCase();

            const val = row.cells[1].innerText.toLowerCase();

            

            const numbers = val.match(/(\d+(\.\d+)?)/g);

            const firstNum = numbers ? parseFloat(numbers[0]) : 0;



            if (key.includes('weight') || key.includes('mass')) {

                weight = val.includes('ton') ? firstNum * 1000 : firstNum;

            }

            if (key.includes('width')) {

                let calculatedWidth = val.includes('mm') ? firstNum / 10 : (val.includes('m') && !val.includes('cm') ? firstNum * 100 : firstNum);

                if (width === 0 || key.includes('working')) width = calculatedWidth;

            }

            if (key.includes('noise') || key.includes('sound') || key.includes('db')) {

                noise = firstNum;

            }

        }

    });



    // 3. TARGETING: Specifically find the Table to sit directly above it

    const tableTarget = document.querySelector('table, .specification-table, .product-specs');

    

    // If no table exists on this specific page, we don't show the logistics summary

    if (!tableTarget || (weight === 0 && width === 0)) return;



    // 4. Build Badges

    let badges = [];

    if (weight > 0 && weight < 750) badges.push(`🚗 Easy Tow (<750kg)`);

    else if (weight >= 750) badges.push(`🚛 Trailer Required`);

    

    if (width > 0 && width < 100) badges.push(`🚪 Fits Single Gates`);

    else if (width > 0 && width < 155) badges.push(`🚪 Fits Double Gates`);

    

    if (noise > 0 && noise < 85) badges.push(`<span>🔇 Urban Quiet (${noise}dB)</span>`);



    if (badges.length === 0) return;



    // 5. Create and Inject Bar directly ABOVE the table

    const logBar = document.createElement('div');

    logBar.className = 'logistics-bar';

    logBar.style.cssText = "margin: 40px 0 15px 0; clear: both; padding-top: 10px; width: 100%;";

    logBar.innerHTML = `

        <p style="margin: 0 0 12px 0; font-size: 13px; font-weight: 800; color: #004d26; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #eee; padding-bottom: 8px;">

            ⚙️ Site Logistics Summary

        </p>

        <div style="display:flex; flex-wrap:wrap; gap:12px;">

            ${badges.map(b => `

                <div style="background:#fff; border:2px solid #004d26; color:#004d26; padding:12px 20px; border-radius:30px; font-size:15px; font-weight:800; box-shadow: 0 4px 10px rgba(0,0,0,0.08); display:flex; align-items:center; transition: all 0.2s ease;">

                    ${b}

                </div>

            `).join('')}

        </div>`;

    

    // This line ensures it sits precisely above the table

    tableTarget.parentNode.insertBefore(logBar, tableTarget);

}



/* --- [D] TOPIC SILO BRIDGES (v126.9 - SINGLE BOX / NO BIO FIX) --- */

if (!document.querySelector('.silo-bridge')) {

    if (window.location.href.includes('fitment-tool-embed')) return; // STOP if embed

    

    // We only keep the Pesticide Strategy link here

    const mappingAuthoritySilos = [

        { key: "weed", link: "https://kerstenuk.com/contact-us-pesticide-free-plan", text: "Download the 2026 Municipal Pesticide-Free Transition Strategy" }

    ];



    const productCol = document.querySelector('.product-details, .web-page-content');

    const reviewsArea = document.querySelector('#product-reviews, .product-reviews');

    

    // Only run if we aren't already on the Pesticide Plan page

    if (productCol && !window.location.href.includes('contact-us-pesticide-free-plan')) {

        mappingAuthoritySilos.forEach(function(mapping) {

            if (lowerBodyText.includes(mapping.key)) {

                const expertBridgeDiv = document.createElement('div');

                expertBridgeDiv.className = 'silo-bridge';

                expertBridgeDiv.innerHTML = `

                    <div style="background:#f9fbf9; padding:35px; border:1px solid #eee; border-left:12px solid #004d26; margin:60px 0; font-style:italic; border-radius: 0 15px 15px 0; box-shadow: 0 15px 35px rgba(0,0,0,0.05); clear: both; width: 100%; box-sizing: border-box;">

                        <p style="margin:0; font-size:18px; line-height:1.7; color:#333; font-family:sans-serif;">

                            <strong style="color:#004d26; text-transform:uppercase; display:block; margin-bottom:10px; font-size:14px; letter-spacing:1px; font-weight:900;">Technical Authority Guidance</strong> 

                            ${mapping.text} 

                            <a href="${mapping.link}" style="color:#004d26; text-decoration:underline; font-weight:900; margin-left:10px; white-space:nowrap;">Access Authority Document &rarr;</a>

                        </p>

                    </div>`;

                

                if (reviewsArea) {

                    reviewsArea.parentNode.insertBefore(expertBridgeDiv, reviewsArea);

                } else {

                    productCol.appendChild(expertBridgeDiv);

                }

            }

        });

    }

}

     /* --- [K] DYNAMIC HAVS SAFETY CHALLENGER (v124.1 - FIXED SCOPE) --- */

    let vibrationLevel = 0; 

    

    // 1. Scan for Vibration Data in Tables

    document.querySelectorAll('table tr, .specification-row').forEach(row => {

        if (row.cells && row.cells.length >= 2) {

            const key = row.cells[0].innerText.toLowerCase();

            const val = row.cells[1].innerText.trim();

            if (key.includes('vibration') || key.includes('havs')) {

                const match = val.match(/(\d+(\.\d+)?)/);

                if (match) vibrationLevel = parseFloat(match[0]);

            }

        }

    });



    // 2. Build The "Challenger" Widget

    const specTable = document.querySelector('table, .product-specs, .specification-table');

    

   if (vibrationLevel > 0 && specTable) {
        // CHECK: If on blog, ask the controller
        if (window.location.href.includes('/blog')) {
            const ctx = window.kerstenBlogContextCache || window.getKerstenBlogContext();
            if (ctx.tool !== 'havs') return;
        }
        const kPoints = Math.round(Math.pow(vibrationLevel, 2) * 2);

        const kSafeHours = (100 / kPoints).toFixed(1);

        

        // FIXED: Use document.title directly to avoid "undefined variable" errors

        const machineName = document.title.split('|')[0].trim();

        

        // Determine Kersten Safety Badge

        let kColor = "#004d26"; let kBadge = "EXCELLENT";

        if (vibrationLevel > 2.5) { kColor = "#e67e22"; kBadge = "STANDARD"; }

        if (vibrationLevel > 5.0) { kColor = "#c0392b"; kBadge = "HIGH"; }



        // Create Unique ID to prevent conflicts

        const widgetID = 'havs-calc-' + Math.floor(Math.random() * 10000);

        

        const havsWidget = document.createElement('div');

        havsWidget.className = 'havs-compliance-widget';

        havsWidget.innerHTML = `

            <div style="background:#f9fbf9; border:1px solid #ddd; border-radius:12px; margin:30px 0; font-family:sans-serif; overflow:hidden; box-shadow:0 4px 15px rgba(0,0,0,0.05); clear:both;">

                

                <div style="background:#f9f9f9; padding:15px 20px; border-bottom:1px solid #eee; display:flex; justify-content:space-between; align-items:center;">

                    <h4 style="margin:0; color:#004d26; font-weight:800; font-size:16px;">🖐 HAVS Safety Comparator</h4>

                    <span style="background:${kColor}; color:white; padding:4px 10px; border-radius:4px; font-size:11px; font-weight:bold;">${kBadge} RATING</span>

                </div>



                <div style="padding:20px;">

                    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:20px;">

                        <div>

                            <strong style="font-size:18px; color:#333;">This Machine</strong>

                            <div style="font-size:12px; color:#666;">Vibration: <strong>${vibrationLevel} m/s²</strong></div>

                        </div>

                        <div style="text-align:right;">

                            <div style="font-size:24px; font-weight:900; color:${kColor};">${kSafeHours} <span style="font-size:14px; font-weight:normal;">Safe Hours</span></div>

                            <div style="font-size:11px; color:#888;">Time to EAV (100 pts)</div>

                        </div>

                    </div>



                    <div style="background:#f0f7f4; padding:15px; border-radius:8px; border:1px dashed #004d26;">

                        <label for="${widgetID}-input" style="display:block; font-size:13px; font-weight:bold; color:#004d26; margin-bottom:8px;">Compare vs. Your Current Machine:</label>

                        

                        <div style="display:block;">

                            <input type="number" id="${widgetID}-input" placeholder="Enter Vibration (e.g. 5.0)" aria-label="Enter your machine's vibration level" style="width:100%; box-sizing:border-box; padding:10px; border:1px solid #ccc; border-radius:4px; margin-bottom:10px;">

                            

                            <button id="${widgetID}-btn" style="width:100%; background:#004d26; color:white; border:none; padding:12px; border-radius:4px; font-weight:bold; cursor:pointer;">

                                Calculate Safety Gap

                            </button>

                        </div>



                        <div id="${widgetID}-result" role="status" aria-live="polite" style="margin-top:15px; display:none; border-top:1px solid #ddd; padding-top:10px;"></div>

                    </div>

                </div>

                

                <div style="background:#f9f9f9; padding:10px 20px; text-align:right; font-size:11px; color:#999;">

                    Calculated using HSE Points System (p = v² * t * 2)

                </div>

            </div>

        `;

        

        // Insert Widget

        specTable.parentNode.insertBefore(havsWidget, specTable.nextSibling);
        
        posthog.capture('havs_widget_shown', {  
    machine_name: machineName,  
    vibration_level: vibrationLevel,  
    kersten_safe_hours: parseFloat(kSafeHours),  
    rating: kBadge  
});  



        // Add Logic Listener

        setTimeout(() => {

            const btn = document.getElementById(widgetID + '-btn');

            if(btn) {

                btn.onclick = function(e) {

                    e.preventDefault(); // Stop any form submit

                    

                    const inputVal = document.getElementById(widgetID + '-input').value;

                    const userVib = parseFloat(inputVal);

                    

                    if (!userVib || userVib <= 0) {

                        alert("Please enter a valid vibration number (e.g. 5.0)");

                        return;

                    }



                    const userPoints = Math.round(Math.pow(userVib, 2) * 2);

                    const userHours = (100 / userPoints).toFixed(1);

                    

                    // Logic check to handle low vibration numbers (avoiding infinity)

                    const validUserHours = userPoints === 0 ? "8.0+" : userHours;



                    let resultHTML = '';

                    let hoursDiff = 0;



                    if (parseFloat(kSafeHours) > parseFloat(userHours)) {

                        hoursDiff = (kSafeHours - userHours).toFixed(1);

                        resultHTML = `

                            <div style="color:#004d26; margin-bottom:15px;">

                                <strong style="display:block; font-size:16px;">✅ Safety Upgrade</strong>

                                Your current machine is safe for only <strong>${validUserHours} hours</strong>.

                                <br>Switching to Kersten gives you <strong style="background:#d4edda; padding:0 4px;">+${hoursDiff} extra hours</strong> of safe trigger time every day.

                            </div>

                        `;

                    } else {

                        resultHTML = `

                            <div style="color:#555; margin-bottom:15px;">

                                <strong>Comparison Result:</strong><br>

                                Your machine: ${validUserHours} hours vs. Kersten: ${kSafeHours} hours.<br>

                            </div>

                        `;

                    }



                    // Build Inquiry Message

                    const inquiryMessage = `HAVS SAFETY INQUIRY:\n\nMachine: ${machineName}\n\nCOMPARISON DATA:\n- My Current Machine: ${userVib} m/s² (${validUserHours} safe hours)\n- Kersten Machine: ${vibrationLevel} m/s² (${kSafeHours} safe hours)\n- Potential Gain: +${hoursDiff} Safe Hours/Day\n\nPlease provide a quote for this compliant solution.`;



                    // Append Quote Button

                    resultHTML += `

                        <a href="/Contact-us-2?message=${encodeURIComponent(inquiryMessage)}" style="display:block; background:#E44D2E; color:white; text-align:center; padding:12px; border-radius:6px; text-decoration:none; font-weight:bold; font-size:14px; box-shadow:0 4px 6px rgba(0,0,0,0.1);">

                            ✉ Request Verified Quote

                        </a>

                    `;



                    const resultBox = document.getElementById(widgetID + '-result');

                    if(resultBox) {
                        
                        posthog.capture('havs_widget_calculated', {  
    machine_name: machineName,  
    kersten_vibration: vibrationLevel,  
    kersten_safe_hours: parseFloat(kSafeHours),  
    user_vibration: userVib,  
    user_safe_hours: parseFloat(validUserHours),  
    hours_gained: parseFloat(hoursDiff),  
    outcome: parseFloat(kSafeHours) > parseFloat(userHours) ? 'safety_upgrade' : 'neutral'  
});  

                        resultBox.innerHTML = resultHTML;

                        resultBox.style.display = 'block';
                        
                        const quoteLink = resultBox.querySelector('a[href*="Contact-us-2"]');  
if (quoteLink) {  
    quoteLink.addEventListener('click', function() {  
        posthog.capture('havs_quote_requested', {  
            machine_name: machineName,  
            kersten_vibration: vibrationLevel,  
            user_vibration: userVib,  
            hours_gained: parseFloat(hoursDiff)  
        });  
    });  
}  

                    }

                    

                    // Trigger Print Button (if function exists)

                    if (typeof addPrintButton === "function") { 

                        addPrintButton(widgetID, 'havs'); 

                    }

                };

            }

        }, 500); // Small delay to ensure DOM insertion

    }

    







        // 7. ADVANCED PRICE ENGINE

        let masterCleanPriceValue = "0.00"; 

        const technicalPriceElem = document.querySelector('[itemprop="price"], .product-price, .item-price, .price, [data-value]'); 

        if (technicalPriceElem) { 

            masterCleanPriceValue = (technicalPriceElem.getAttribute('content') || technicalPriceElem.innerText).split('/')[0].replace(/,/g, '').replace(/[^\d.]/g, ''); 

        }



        // SHIPPING & RETURN LOGIC

        let commercialShippingType = (specificMachineWeightKg > 35 || lowerBodyText.includes("tractor") || lowerBodyText.includes("hydraulic") || lowerBodyText.includes("3-point")) ? "Specialist Freight" : "Professional Parcel";

        let technicalDeliveryTime = commercialShippingType === "Specialist Freight" ? { min: 3, max: 7 } : { min: 2, max: 5 };



        // 8. MASTER UNIFIED PRODUCT SCHEMA (Including v100 Brand Shield)

        const masterUnifiedProductSchema = {

            "@context": "https://schema.org",

            "@type": "Product",

            "@id": "https://kerstenuk.com/#product",

            "name": currentDocumentTitle.split('|')[0].trim(),

            "url": window.location.href,

            // UPDATED (v100 Feature): GREY MARKET BRAND SHIELD

            "brand": { 

                "@type": "Brand", 

                "name": "Kersten / Zasso",

                "description": "Factory-Authorized UK Distribution & Warranty Centre"

            },

            "sku": window.location.pathname.split('/').pop(),

            "image": document.querySelector('img[itemprop="image"]')?.src || document.querySelector('meta[property="og:image"]')?.content || document.querySelector('.main-image img')?.src || document.querySelector('.product-image img')?.src,

            "description": (document.querySelector('meta[name="description"]') ? document.querySelector('meta[name="description"]').content : "") || `Professional-grade technical specifications, authority documentation, and compliance data for the ${currentDocumentTitle.split('|')[0].trim()} groundcare machine series.`,

            "offers": { 

                "@type": "Offer", 

                "price": parseFloat(masterCleanPriceValue).toFixed(2),

                "priceCurrency": "GBP",

                "priceValidUntil": globalExpiryDate,

                "availability": "https://schema.org/InStock",

                "itemCondition": "https://schema.org/NewCondition",

                "url": window.location.href,

                "seller": { "@id": CORE_ORG_ID },

                "shippingDetails": {

                    "@type": "OfferShippingDetails",

                    "shippingRate": { "@type": "MonetaryAmount", "value": "0.00", "currency": "GBP" },

                    "deliveryTime": {

                        "@type": "ShippingDeliveryTime",

                        "handlingTime": { "@type": "QuantitativeValue", "minValue": 1, "maxValue": 3, "unitCode": "d" },

                        "transitTime": { "@type": "QuantitativeValue", "minValue": technicalDeliveryTime.min, "maxValue": technicalDeliveryTime.max, "unitCode": "d" }

                    },

                    "shippingDestination": { "@type": "DefinedRegion", "addressCountry": "GB" }

                },

                "hasMerchantReturnPolicy": { 

                    "@type": "MerchantReturnPolicy",

                    "applicableCountry": "GB",

                    "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnPeriod",

                    "merchantReturnDays": 14,

                    "returnMethod": "https://schema.org/ReturnByMail",

                    "returnFees": "https://schema.org/ReturnFeesCustomerPaying"

                }

            },

            "additionalProperty": machineQuantitativeSpecs

        };

        

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



      /* --- [D] UNIFIED FAQ ENGINE (v101.0 - Safety Patched) --- */

        const onPageFaqs = [];

        // SAFETY 1: Ignore common non-FAQ headers (like footer links)

        const ignoredQuestions = ["contact", "newsletter", "subscribe", "follow us", "need help", "search"];



        document.querySelectorAll('h3, h4, h5').forEach(header => {

            const question = header.innerText.trim();

            const lowerQ = question.toLowerCase();

            

            // SAFETY 2: Only grab headers that are actual questions AND not in our ignore list

            if (question.includes('?') && !ignoredQuestions.some(k => lowerQ.includes(k))) {

                const answerElement = header.nextElementSibling;

                

                // SAFETY 3: Verify the answer actually has text (prevents "Invalid" error)

                if (answerElement && answerElement.innerText) {

                    const answerText = answerElement.innerText.trim();

                    if (answerText.length > 15) { // Must be at least 15 chars to be a valid answer

                        onPageFaqs.push({ 

                            "@type": "Question", 

                            "name": question, 

                            "acceptedAnswer": { "@type": "Answer", "text": answerText } 

                        });

                    }

                }

            }

        });

        

        // 2. Merge Generated Spec FAQs with On-Page FAQs

        // SAFETY 4: Filter out any machine-generated FAQs that might have failed to capture data

        const validGeneratedFaqs = (typeof generatedFaqs !== 'undefined' ? generatedFaqs : []).filter(f => 

            f.acceptedAnswer && 

            f.acceptedAnswer.text && 

            f.acceptedAnswer.text.length > 5 &&

            !f.acceptedAnswer.text.includes("undefined")

        );



        const finalFaqList = [...validGeneratedFaqs, ...onPageFaqs];

        

        // 3. Inject ONE Unified FAQ Schema

        if (finalFaqList.length > 0) {

            // Check if an FAQ schema already exists to avoid the "2 Items" duplicate error

            const existingFaq = document.querySelector('script[type="application/ld+json"]');

            if (!existingFaq || !existingFaq.innerText.includes("FAQPage")) {

                performSchemaInjection({ 

                    "@context": "https://schema.org", 

                    "@type": "FAQPage", 

                    "mainEntity": finalFaqList 

                });

                console.log(`Authority Engine: Injected ${finalFaqList.length} Total FAQs (Validated).`);

            }

        }

 /** --- [SPEC ICON MAPPER & DATA HARVESTER] (v126.0) --- **/
function executeProfessionalIconMapping() {

    const technicalIconMap = {
        // Weight & Mass
        "weight": "fitness_center", "kg": "fitness_center", "mass": "fitness_center",
        
        // Safety & Sound
        "vibration": "vibration", "havs": "vibration", "noise": "volume_up", "db": "volume_up", "sound": "volume_up",
        
       // Physical Measurements
        "width": "straighten", "clearing": "straighten", "diameter": "swap_horizontal_circle", "ø": "swap_horizontal_circle",
        "height": "height", "length": "square_foot", "dimension": "aspect_ratio", "footprint": "layers",
        
        // Performance & Engine
        "engine": "settings", "motor": "settings", "speed": "speed", "rpm": "speed", "hp": "bolt", "power": "bolt",
        
        // Hydraulics, Pressure & Fuel
        "pressure": "compress", "bar": "compress", "flow": "water_drop", "oil": "opacity", "fuel": "local_gas_station",
        
        // Capacities & Volume
        "capacity": "layers", "volume": "layers", "hopper": "layers", "litre": "layers",
        
        // Mechanical Components
        "attachment": "extension", "drive": "sync_alt", "transmission": "sync_alt", "hitch": "link", "bracket": "build",
        "slope": "terrain", "gradient": "terrain"
    };

    // Variables to store data for Google and Logistics Bar
    let machineQuantitativeSpecs = [];
    let weightKg = 0;
    let widthCm = 0;
    let noiseDb = 0;

    const specificationTableRows = document.querySelectorAll('table tr, .specification-row, .frappe-table tr');

    specificationTableRows.forEach(function(row) {

        if (row.cells && row.cells.length >= 2) {

            let key = row.cells[0].innerText.trim();

            let val = row.cells[1].innerText.trim();

            let lowerKey = key.toLowerCase();

            let lowerVal = val.toLowerCase();



            // 1. ADD ICONS (Your existing capability)

            if (!row.querySelector('.material-icons')) {

                for (let keyword in technicalIconMap) {

                    if (lowerKey.includes(keyword)) {

                        row.cells[0].style.display = "flex";

                        row.cells[0].style.alignItems = "center";

                        row.cells[0].innerHTML = `<span class="material-icons" style="font-size:26px; color:#004d26; vertical-align:middle; margin-right:15px; min-width:32px;">${technicalIconMap[keyword]}</span>` + row.cells[0].innerHTML;

                        break;

                    }

                }

            }



            // 2. HARVEST DATA (For Google and Logistics Bar)

            let numMatch = val.match(/(\d+(\.\d+)?)/);

            let rawNum = numMatch ? parseFloat(numMatch[0]) : 0;



            if (lowerKey.includes('weight')) weightKg = lowerVal.includes('ton') ? rawNum * 1000 : rawNum;

            if (lowerKey.includes('width')) widthCm = lowerVal.includes('mm') ? rawNum/10 : (lowerVal.includes('m') && !lowerVal.includes('cm') ? rawNum*100 : rawNum);

            if (lowerKey.includes('noise') || lowerKey.includes('db')) noiseDb = rawNum;



            // Prepare for Google Schema

            machineQuantitativeSpecs.push({ "@type": "PropertyValue", "name": key, "value": val });

        }

    });



    // 3. INJECT LOGISTICS BAR (Lower Page)

    if ((weightKg > 0 || widthCm > 0) && !document.querySelector('.logistics-bar')) {

        let logTarget = document.querySelector('table, .specification-table, .havs-compliance-widget');

        if (logTarget) {

            let badges = [];

            if (weightKg > 0 && weightKg < 750) badges.push(`🚗 Easy Tow (<750kg)`);

            else if (weightKg > 0) badges.push(`🚛 Trailer Required`);

            if (widthCm > 0 && widthCm < 100) badges.push(`🚪 Fits Single Gates`);

            if (noiseDb > 0 && noiseDb < 85) badges.push(`🔇 Urban Quiet`);



            const logBar = document.createElement('div');

            logBar.className = 'logistics-bar';

            logBar.style.cssText = "margin: 30px 0; clear: both; border-top: 1px solid #eee; padding-top: 20px;";

            logBar.innerHTML = `<p style="margin: 0 0 12px 0; font-size: 13px; font-weight: 800; color: #004d26; text-transform: uppercase;">Logistics Summary:</p>

                <div style="display:flex; flex-wrap:wrap; gap:12px;">

                ${badges.map(b => `<div style="background:#fff; border:2px solid #004d26; color:#004d26; padding:10px 18px; border-radius:30px; font-size:14px; font-weight:700; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">${b}</div>`).join('')}

                </div>`;

            logTarget.parentNode.insertBefore(logBar, logTarget);

        }

    }



   

}



   // Trigger the Logistics Bar and Icons multiple times to ensure they catch the data

    setTimeout(injectLogisticsBar, 2000);

    setTimeout(injectLogisticsBar, 4000);

    

    setTimeout(executeProfessionalIconMapping, 2500);

    setTimeout(executeProfessionalIconMapping, 4500);

    

}, 2500); // Main Shell Delay



/* ================================================================= */
/* [P-FINAL] INDESTRUCTIBLE REVIEW ENGINE (Footer-Locked Version)    */
/* ================================================================= */
(function() {
    console.log("Kersten Reviews: Module Initialized...");

    const runReviews = function() {
        // 1. Safety Check: Don't run on the Fitment Tool Embed page
        if (window.location.href.includes('fitment-tool-embed')) return;

        // 2. Prevent Duplicates
        if (document.querySelector('.kersten-review-board')) return;

        // 3. Define Library Locally (Scope Safe)
        const reviews = [
            { tag: "weed", stars: 5, user: "Matthew Powers", role: "Veolia UK", text: "The machine would pay for itself in just 81 miles. Operators reported the effort needed was much less using the Kersten UBS 16 than by hand." },
            { tag: "weed", stars: 5, user: "Scott Coughlan", role: "Newport City Council", text: "We are really happy with our K820. It has reduced our reliance on chemical control. We purchased two more machines to stay ahead of restrictions." },
            { tag: "sweeper", stars: 5, user: "Cormac Operations", role: "Civil Engineering", text: "The Kersten sweeper proved highly effective in removing moss and debris from pavement edges. Critical for maintaining safe walkways." },
            { tag: "sweeper", stars: 5, user: "John", role: "Tyne Valley Garden Centre", text: "We were spending up to 20 hours a week removing moss. I was so impressed with the demonstration, I needed the machine there and then." },
            { tag: "winter", stars: 5, user: "Pocklington Council", role: "Highways Team", text: "The best insurance policy we have ever subscribed to. The machine handled the snow clearance very well, keeping footpaths safe." },
            { tag: "winter", stars: 5, user: "Wayne Dawkins", role: "New Forest District Council", text: "Probably the best machine investment we have made in the last 5 years. The reliability of the Lehner spreaders is unmatched." },
            { tag: "all", stars: 5, user: "Ian Low", role: "Mitie Landscapes", text: "Fantastic bit of machinery. It maintained the artificial pitches in summer, cleared moss with the hard brush, and is now ready for snow." }
        ];

        // 4. Context Matching Logic
        const context = (document.title + " " + window.location.pathname).toLowerCase();
        let filterTag = "all";
        if (context.includes("weed") || context.includes("moss") || context.includes("ubs")) filterTag = "weed";
        else if (context.includes("sweeper") || context.includes("clean") || context.includes("fkm")) filterTag = "sweeper";
        else if (context.includes("snow") || context.includes("ice") || context.includes("winter")) filterTag = "winter";

        // 5. Select & Shuffle Reviews
        const selectedReviews = reviews
            .filter(r => r.tag === "all" || r.tag === filterTag)
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);

        if (selectedReviews.length === 0) return;

        // 6. Build the UI
        const container = document.createElement('div');
        container.className = 'kersten-review-board';
        // Style adjusted to remove top margin so it sits flush if needed
        container.style.cssText = "margin: 0; padding: 60px 0; border-top: 1px solid #eee; background: #fff; width: 100%; display:block; clear:both; position: relative; z-index: 5;";
        
        container.innerHTML = `
            <div style="max-width: 1200px; margin: 0 auto; padding: 0 15px;">
                <div style="background:#f9f9f9; padding:30px; border-radius:10px; border:1px solid #e0e0e0;">
                    <h3 style="margin:0 0 25px 0; color:#004d26; font-size:22px; font-weight:800;">⭐ Verified Professional Feedback</h3>
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:20px;">
                        ${selectedReviews.map(r => `
                            <div style="background:white; padding:20px; border-radius:8px; border:1px solid #eee; box-shadow:0 2px 5px rgba(0,0,0,0.02);">
                                <div style="color:#f39c12; margin-bottom:10px;">★★★★★</div>
                                <p style="font-size:14px; color:#555; font-style:italic; line-height:1.5; margin-bottom:15px;">"${r.text}"</p>
                                <div style="font-size:12px; font-weight:bold; color:#004d26;">${r.user}</div>
                                <div style="font-size:11px; color:#888; text-transform:uppercase;">${r.role}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        // 7. FOOTER-LOCKED PLACEMENT STRATEGY
        // We ignore the content and go straight for the footer tags.
        const footerTarget = document.querySelector('footer, .layout-footer, #footer, .footer-section');
        
        if (footerTarget) {
            // Insert BEFORE the footer starts
            footerTarget.parentNode.insertBefore(container, footerTarget);
            console.log("Kersten Reviews: Locked to Footer");
        } else {
            // Emergency Fallback: Append to body end
            document.body.appendChild(container);
            console.log("Kersten Reviews: Appended to Body");
        }
    };

    // Run immediately, then check again at 2s and 4s to ensure loading
    if (document.readyState === "complete" || document.readyState === "interactive") {
        runReviews();
    } else {
        document.addEventListener("DOMContentLoaded", runReviews);
    }
    setTimeout(runReviews, 2000);
    setTimeout(runReviews, 4000);

})();

/* ================================================================
   CONTACT FORM MESSAGE AUTO-FILL
   Works with URLs such as:
   /Contact-us-2?message=HIRE%20ENQUIRY%3A%20Kersten...
   Also remains compatible with the fitment wizard.
   ================================================================ */
(function () {
    const params = new URLSearchParams(window.location.search);
    const message = params.get('message');

    // Only run when a message has been supplied in the URL.
    if (!message) return;

    // Limit this logic to the contact form page.
    const currentPath = window.location.pathname
        .replace(/\/+$/, '')
        .toLowerCase();

    if (currentPath !== '/contact-us-2') return;

    let completed = false;
    let attempts = 0;
    const maximumAttempts = 40;

    function setNativeValue(element, value) {
        if (!element) return false;

        const prototype =
            element.tagName === 'TEXTAREA'
                ? HTMLTextAreaElement.prototype
                : HTMLInputElement.prototype;

        const valueSetter = Object.getOwnPropertyDescriptor(
            prototype,
            'value'
        );

        if (valueSetter && valueSetter.set) {
            valueSetter.set.call(element, value);
        } else {
            element.value = value;
        }

        element.dispatchEvent(
            new Event('input', {
                bubbles: true
            })
        );

        element.dispatchEvent(
            new Event('change', {
                bubbles: true
            })
        );

        element.dispatchEvent(
            new Event('blur', {
                bubbles: true
            })
        );

        return element.value === value;
    }

    function findMessageField() {
        const selectors = [
            'textarea[name="message"]',
            'textarea[data-fieldname="message"]',
            '.frappe-control[data-fieldname="message"] textarea',
            '[data-fieldname="message"] textarea',
            'input[name="message"]',
            'input[data-fieldname="message"]',
            '.frappe-control[data-fieldname="message"] input',
            '[data-fieldname="message"] input'
        ];

        for (const selector of selectors) {
            const field = document.querySelector(selector);

            if (field) {
                return field;
            }
        }

        return null;
    }

    function fillMessageField() {
        if (completed) return;

        attempts += 1;

        // Prefer Frappe's own API when the web form is ready.
        try {
            if (
                window.frappe &&
                frappe.web_form &&
                typeof frappe.web_form.set_value === 'function'
            ) {
                frappe.web_form.set_value('message', message);
            }
        } catch (error) {
            console.warn(
                'Frappe message autofill API was not ready:',
                error
            );
        }

        const field = findMessageField();

        if (field) {
            setNativeValue(field, message);

            // Check again shortly in case Frappe redraws the field.
            setTimeout(function () {
                const currentField = findMessageField();

                if (currentField && currentField.value !== message) {
                    setNativeValue(currentField, message);
                }

                if (
                    currentField &&
                    currentField.value.trim() === message.trim()
                ) {
                    completed = true;
                }
            }, 250);
        }

        if (!completed && attempts < maximumAttempts) {
            setTimeout(fillMessageField, 250);
        }
    }

    // Run at several stages because Frappe may render the form late.
    if (document.readyState === 'loading') {
        document.addEventListener(
            'DOMContentLoaded',
            fillMessageField,
            { once: true }
        );
    } else {
        fillMessageField();
    }

    window.addEventListener(
        'load',
        fillMessageField,
        { once: true }
    );

    // Watch for Frappe adding or replacing form elements.
    const observer = new MutationObserver(function () {
        if (completed) {
            observer.disconnect();
            return;
        }

        fillMessageField();
    });

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });

    setTimeout(function () {
        observer.disconnect();
    }, 12000);
})();
    
   
/* --- KERSTEN UNIVERSAL FITMENT WIZARD (v161.0 - KERSTEN EDITION) --- */

(function() {

    // 0. SMART GATEKEEPER

    const currentUrl = window.location.href.toLowerCase();

    const currentTitle = document.title.toLowerCase();

    const currentPath = window.location.pathname;



    const isHomepage = currentPath === '/' || currentPath === '/index.html' || currentPath === '/home';

    const validContexts = [

        "sweeper", "plough", "spreader", "attachment", "weedbrush", "weed", "moss", 

        "harrow", "mower", "collector", "renovator", "linkage",

        "km", "fkm", "sch", "snow", "winter", "ub", "wkb", "easy", "zasso", "zap", "kersten"

    ];



    const isAttachmentPage = validContexts.some(k => currentUrl.includes(k) || currentTitle.includes(k));

    if (!isAttachmentPage && !isHomepage) return;



    // --- BRAND COLORS ---

    const K_RED = "#D32F2F";

    const K_ORANGE = "#FF6D00";

    const K_DARK = "#212121";

    const K_BLUE = "#0277bd";

    const K_BROWN = "#a0522d";



    // --- 1. SMART LINK ENGINE ---

    const getProductLink = (machineName) => {

        const name = machineName.toLowerCase();

        if (name.includes('km') || name.includes('fkm') || name.includes('sweeper')) return "/sweepers";

        if (name.includes('plough') || name.includes('sch') || name.includes('faulkner') || name.includes('snk')) return "/Snow-plough-series";

        if (name.includes('spreader') || name.includes('polaro') || name.includes('matev') || name.includes('sldst')) return "/Pedestrian-and-tractor-mounted-spreader";

        if (name.includes('ub') || name.includes('wkb') || name.includes('weed')) return "/weedbrush-for-tractors";

        return "/all-products";

    };



    // --- 2. SECTOR INTELLIGENCE ENGINE ---

    const getSectorBadge = (selection) => {

        const lowerSelection = selection.toLowerCase();

        const heavyBrands = ["jcb", "manitou", "merlo", "caterpillar", "bobcat", "kubota m", "claas", "k2100", "alpin"];

        const agBrands = ["fendt", "john deere", "massey", "new holland", "case ih", "valtra"];



        // Construction/Heavy Badge

        if (heavyBrands.some(brand => lowerSelection.includes(brand))) {

            return `

                <div id="sector-validation-badge" style="background:#fef2f2; border:2px solid #dc2626; border-radius:8px; padding:15px; margin-bottom:20px; display:flex; align-items:center; gap:15px; animation: fadeIn 0.5s ease-out;">

                    <div style="font-size:30px;">🏗️</div>

                    <div>

                        <strong style="color:#991b1b; display:block; font-size:15px;">Heavy-Duty Fitment Verified</strong>

                        <span style="font-size:13px; color:#991b1b;">Reinforced chassis/flange confirmed for heavy site detritus on <strong>${selection}</strong>.</span>

                    </div>

                </div>`;

        } 

        // Agricultural Badge

        if (agBrands.some(brand => lowerSelection.includes(brand))) {

            return `

                <div id="sector-validation-badge" style="background:#f0fdf4; border:2px solid #16a34a; border-radius:8px; padding:15px; margin-bottom:20px; display:flex; align-items:center; gap:15px; animation: fadeIn 0.5s ease-out;">

                    <div style="font-size:30px;">🚜</div>

                    <div>

                        <strong style="color:#166534; display:block; font-size:15px;">Agricultural Flow Optimization</strong>

                        <span style="font-size:13px; color:#166534;">System matched for high-flow hydraulics of <strong>${selection}</strong> tractors.</span>

                    </div>

                </div>`;

        }

        return '';

    };



    // --- 3. COMPLETE VEHICLE DATABASE ---

    const commonVehicles = {

        "Kersten (Two Wheel)": {

            "K820 / K820 Pro / Pro E": { 

                landingPage: "/pedestrian-two-wheel-tractor-series/kersten-k-series",

                sweeping: { front: { bracket: "Kersten Quick-Attach 35", machine: "EFKM 090 H", collector: "SSB 090 K", gully: "ASH 403237", infrastructure: [{ name: "Hydraulic Power Unit", link: "/pedestrian-two-wheel-tractor-series/kersten-k-series" }] }, rear: null }, 

                winter: { front: { bracket: "Kersten Quick-Attach 35", machine: "SCHN 100 K", infrastructure: [{ name: "Standard Hydraulics", link: "/pedestrian-two-wheel-tractor-series/kersten-k-series" }] }, rear: { bracket: "Rear Hitch", machine: "SLDST 70 HK" } },

                weedbrush: { front: { bracket: "ABF-WKM 820", machine: "WKBH II ABF", disc: "WKBH II Head", control: "Handlebar", wheel: "Support Wheel", note: "⚠️ Requires bracket ABF-WKM 820." } }

            },

            "K1500 / K1500 E": { 

                landingPage: "/pedestrian-two-wheel-tractor-series/kersten-k-series",

                sweeping: { front: { bracket: "Kersten Quick-Attach 35", machine: "EFKM 090 H", collector: "SSB 090 K", gully: "ASH 403237", infrastructure: [{ name: "Hydraulic Power Unit", link: "/pedestrian-two-wheel-tractor-series/kersten-k-series" }] }, rear: null }, 

                winter: { front: { bracket: "Kersten Quick-Attach 35", machine: "SCHN 100 K", infrastructure: [{ name: "Standard Hydraulics", link: "/pedestrian-two-wheel-tractor-series/kersten-k-series" }] }, rear: { bracket: "Rear Hitch", machine: "SLDST 70 HK" } },

                weedbrush: { front: { bracket: "ABF-WKM 1500", machine: "WKBH II ABF", disc: "WKBH II Head", control: "Handlebar", wheel: "Support Wheel", note: "⚠️ Requires bracket ABF-WKM 1500." } }

            },

            "K2100": { 

                landingPage: "/pedestrian-two-wheel-tractor-series/kersten-k-series",

                sweeping: { front: { bracket: "Kersten Quick-Attach 35", machine: "EFKM 100 K", collector: "SSB 100 K", gully: "ASH 403237", infrastructure: [{ name: "Heavy Duty Hydraulics", link: "/pedestrian-two-wheel-tractor-series/kersten-k-series" }] }, rear: null }, 

                winter: { front: { bracket: "Kersten Quick-Attach 35", machine: "SCHN 100 K", infrastructure: [{ name: "Standard Hydraulics", link: "/pedestrian-two-wheel-tractor-series/kersten-k-series" }] }, rear: { bracket: "Rear Hitch", machine: "SLDST 70 HK" } },

                weedbrush: { front: { bracket: "ABF-WKM 1500", machine: "WKBH II ABF", disc: "WKBH II Head", control: "Handlebar", wheel: "Support Wheel", note: "⚠️ Requires bracket ABF-WKM 1500 (Check Fitment)." } }

            },

            "UBS Hydro 9 / 13 / 16": { 

                landingPage: "/pedestrian-two-wheel-tractor-series/kersten-ubs-series",

                sweeping: { front: { bracket: "Quick-Attach 70", machine: "EFKM 10037 M-U 70", collector: "SSB 100 K-KR", gully: "ASH 403237", infrastructure: [{ name: "UBS PTO Drive", link: "/pedestrian-two-wheel-tractor-series/kersten-ubs-series" }] }, rear: null }, 

                winter: { front: { bracket: "Quick-Attach 70", machine: "SCHN 125 FK-M-KU 70", infrastructure: [{ name: "UBS Hydraulics", link: "/pedestrian-two-wheel-tractor-series/kersten-ubs-series" }] }, rear: { bracket: "Rear Hitch", machine: "SLDST 70 M-U 70" } },

                weedbrush: { front: { bracket: "Quick-Attach 70", machine: "WKB 60 M-U 70", disc: "60cm Fixed", control: "Handlebar", wheel: "Support Wheel", note: "Direct Mechanical PTO Drive." } }

            },

            "Alpin / Alpin Pro": { 

                landingPage: "/pedestrian-two-wheel-tractor-series/kersten-ubs-series",

                sweeping: { front: { bracket: "Quick-Attach 70", machine: "EFKM 10037 M-U 70", collector: "SSB 100 K-KR", gully: "ASH 403237", infrastructure: [{ name: "Slope Hydraulics", link: "/pedestrian-two-wheel-tractor-series/kersten-ubs-series" }] }, rear: null }, 

                winter: { front: { bracket: "Quick-Attach 70", machine: "SCHN 125 FK-M-KU 70", infrastructure: [{ name: "Slope Hydraulics", link: "/pedestrian-two-wheel-tractor-series/kersten-ubs-series" }] }, rear: { bracket: "Rear Hitch", machine: "SLDST 70 M-U 70" } },

                weedbrush: { front: { bracket: "Quick-Attach 70", machine: "WKB 60 M-U 70", disc: "60cm Fixed", control: "Handlebar", wheel: "Support Wheel", note: "Designed for steep gradient work." } }

            }

        },

        "Kubota": {

            "BX Series (BX231 / BX261)": { 

                landingPage: "/Attachments-for-Kubota-BX-Series",

                sweeping: { front: { bracket: "Kersten ABR 45 KD", machine: "KM 13045", collector: "SSB 13045", gully: "ASH 4045", infrastructure: [{ name: "Kersten Front Linkage (Cat 0)", link: "/front-linkages" }, { name: "Front PTO Kit", link: "/front-linkages" }] }, rear: { bracket: "Cat 1", machine: "HKM 12540", collector: "SSB 12540", gully: "ASH 4040" } }, 

                winter: { front: { bracket: "ABR-SCHN-KD", machine: "Kersten SCH 120 Plough", infrastructure: [{ name: "Kersten Front Linkage", link: "/front-linkages" }] }, rear: { bracket: "Cat 1 Linkage", machine: "Matev S-100 (PTO)", infrastructure: [{ name: "Rear PTO Shaft", link: "/front-linkages" }] } },

                weedbrush: { 

                    front: { bracket: "ABR-UB-KD-CAT0", machine: "UB 6080 H", disc: "BT 060 (60cm)", control: "ST-UB Joystick", wheel: "Spindle Gauge Wheel", note: "⚠️ Hybrid Drive: Uses Rear PTO to power hydraulic head." },

                    rear_kit: "Requires PTO Hydraulic Power Pack for UB 6080"

                }

            },

            "B1 Series (B1121 / B1161)": { 

                landingPage: "/Attachments-for-Kubota-B-Series",

                sweeping: { front: { bracket: "Kersten ABR 45 KD", machine: "KM 13045", collector: "SSB 13045", gully: "ASH 4045", infrastructure: [{ name: "Kersten Front Linkage", link: "/front-linkages" }, { name: "Front PTO Kit", link: "/front-linkages" }] }, rear: { bracket: "Cat 1", machine: "HKM 12540", collector: "SSB 12540", gully: "ASH 4040" } }, 

                winter: { front: { bracket: "ABR-SCHN-KD", machine: "Kersten SCH 120 Plough", infrastructure: [{ name: "Kersten Front Linkage", link: "/front-linkages" }] }, rear: { bracket: "Cat 1 Linkage", machine: "Matev S-100 (PTO)", infrastructure: [{ name: "Rear PTO Shaft", link: "/front-linkages" }] } },

                weedbrush: null 

            },

            "B2 Series (B2231 / B2261)": { 

                landingPage: "/Attachments-for-Kubota-B-Series",

                sweeping: { front: { bracket: "Kersten ABR 45 KD", machine: "KM 15045 (1.5m)", collector: "SSB 15045", gully: "ASH 4045", infrastructure: [{ name: "Kersten Front Linkage", link: "/front-linkages" }, { name: "Front PTO Kit", link: "/front-linkages" }] }, rear: { bracket: "Cat 1", machine: "HKM 12540", collector: "SSB 12540", gully: "ASH 4040" } }, 

                winter: { front: { bracket: "ABR-SCHN-KD", machine: "Kersten SCH 140 Plough", infrastructure: [{ name: "Kersten Front Linkage", link: "/front-linkages" }] }, rear: { bracket: "Cat 1 Linkage", machine: "Matev S-100 (PTO)", infrastructure: [{ name: "Rear PTO Shaft", link: "/front-linkages" }] } },

                weedbrush: { front: { bracket: "ABR-UB-KD", machine: "UB 6080 MH", disc: "BT 060 (60cm) or BT 080", control: "ST-UB Joystick", wheel: "MP-LR-UB-EASY", note: "Standard for IWM Path Edging." } }

            },

            "ST Series (ST341 / ST371)": { 

                landingPage: "/Attachments-for-Kubota-ST-Series",

                sweeping: { front: { bracket: "Kersten ABR 45 ST", machine: "KM 13045 (Front PTO)", collector: "SSB 13045", gully: "ASH 4045", infrastructure: [{ name: "Matev Cat 0 Linkage", link: "/front-linkages" }, { name: "Front PTO 2000rpm", link: "/front-linkages" }] }, rear: { bracket: "Cat 1", machine: "HKM 12540", collector: "SSB 12540", gully: "ASH 4040" } }, 

                winter: { front: { bracket: "ABR-SCHN-ST", machine: "Kersten SCH 140 Plough", infrastructure: [{ name: "Matev Cat 0 Linkage", link: "/front-linkages" }] }, rear: { bracket: "Cat 1 Linkage", machine: "Matev S-250 (PTO)", infrastructure: [{ name: "Rear PTO Shaft", link: "/front-linkages" }] } },

                weedbrush: { front: { bracket: "ABR-UB-KD", machine: "UB 6080 MH", disc: "BT 080 (80cm)", control: "ST-UB Joystick", wheel: "MP-LR-UB-EASY" } }

            },

            "L Series (L1361 / L1421)": { 

                landingPage: "/Attachments-for-Kubota-L-Series",

                sweeping: { front: { bracket: "Kersten ABR 52 KD", machine: "KM 15052", collector: "SSB 15052", gully: "ASH 4052", infrastructure: [{ name: "Front Linkage", link: "/front-linkages" }] }, rear: { bracket: "Cat 1", machine: "HKM 15052 HY", collector: "SSB 15052", gully: "ASH 4052" } }, 

                winter: { front: { bracket: "ABR-SCHN-KD", machine: "Kersten SCH 150 Plough", infrastructure: [{ name: "Front Linkage", link: "/front-linkages" }] }, rear: { bracket: "Cat 1 Linkage", machine: "Matev SPR-250 (Self-Loading)", infrastructure: [{ name: "Hydraulic Top Link", link: "/front-linkages" }] } },

                weedbrush: { front: { bracket: "ABR-UB-KD", machine: "UB 6080 MH", disc: "BT 080 (80cm)", control: "ST-UB Joystick", wheel: "MP-LR-UB-EASY" } }

            },

            "L2 Series (L2421 / L2501)": { 

                landingPage: "/Attachments-for-Kubota-L-Series",

                sweeping: { front: { bracket: "Kersten ABR 52 KD", machine: "KM 15052", collector: "SSB 15052", gully: "ASH 4052", infrastructure: [{ name: "Front Linkage", link: "/front-linkages" }] }, rear: { bracket: "Cat 1", machine: "HKM 15052 HY", collector: "SSB 15052", gully: "ASH 4052" } }, 

                winter: { front: { bracket: "ABR-SCHN-KD", machine: "Kersten SCH 150 Plough", infrastructure: [{ name: "Front Linkage", link: "/front-linkages" }] }, rear: { bracket: "Cat 1 Linkage", machine: "Matev SPR-250 (Self-Loading)", infrastructure: [{ name: "Hydraulic Top Link", link: "/front-linkages" }] } },

                weedbrush: { front: { bracket: "ABR-UB-KD", machine: "UB 6080 MH", disc: "BT 080 (80cm)", control: "ST-UB Joystick", wheel: "MP-LR-UB-EASY" } }

            },

            "LX Series (LX351 / LX401)": { 

                landingPage: "/Attachments-for-Kubota-L-Series",

                sweeping: { front: { bracket: "Kersten ABR 45 KD", machine: "KM 15045", collector: "SSB 15045", gully: "ASH 4045", infrastructure: [{ name: "Kersten Cat 1 Linkage", link: "/front-linkages" }, { name: "Front PTO", link: "/front-linkages" }] }, rear: { bracket: "Cat 1", machine: "HKM 15052 HY", collector: "SSB 15052", gully: "ASH 4052" } }, 

                winter: { front: { bracket: "ABR-SCHN-KD", machine: "Kersten SCH 140 Plough", infrastructure: [{ name: "Kersten Cat 1 Linkage", link: "/front-linkages" }] }, rear: { bracket: "Cat 1 Linkage", machine: "Matev S-250 (PTO)", infrastructure: [{ name: "Rear PTO Shaft", link: "/front-linkages" }] } },

                weedbrush: { front: { bracket: "ABR-UB-KD", machine: "UB 6080 MH", disc: "BT 080 (80cm)", control: "ST-UB Joystick", wheel: "MP-LR-UB-EASY" } }

            },

            "M Series (M4062 / M5091)": { 

                landingPage: "/fkm60-series",

                sweeping: { front: { bracket: "Kersten ABR 60 KD", machine: "FKM 22560", collector: "SSB 22560", gully: "ASH 4060", infrastructure: [{ name: "Cat 2 Front Linkage", link: "/front-linkages" }, { name: "1000rpm Front PTO", link: "/front-linkages" }] }, rear: { bracket: "Cat 2", machine: "HKM 22560 HY", collector: "SSB 22560", gully: "ASH 4060" } }, 

                winter: { front: { bracket: "ABR-SCHN-KD", machine: "Kersten SNK 270 Plough", infrastructure: [{ name: "Cat 2 Front Linkage", link: "/front-linkages" }] }, rear: { bracket: "Cat 2", machine: "Matev PDS 300+" } },

                weedbrush: { front: { bracket: "ABR-UB-UNI", machine: "UB Easy (FL/VB)", disc: "BT 080 or VB Head", control: "Cab Remote", wheel: "MP-LR-UB-EASY", note: "Verified for Highway/Verge 'Tracy's Law' Compliance." } }

            },

            "GR Series (GR1600 / GR2120)": { 

                landingPage: "/Attachments-for-Kubota-GR1600-GR2100",

                sweeping: { front: { bracket: "FKDR A-Frame", machine: "KM 11537 H-FKDR", collector: "SSB 11537", gully: "ASH 3737", infrastructure: [{ name: "FKDR Hydraulic Front Linkage Kit", link: "/front-linkages" }], note: "⚠️ HYDRAULIC CONVERSION." }, rear: null }, 

                winter: { front: { bracket: "FKDR A-Frame", machine: "Kersten SCH 120 (FKDR)", infrastructure: [{ name: "FKDR Hydraulic Front Linkage Kit", link: "/front-linkages" }] }, rear: null },

                weedbrush: { front: { bracket: "FKDR-HYDR-KUGR1600", machine: "WKB 40 (Ride-On)", disc: "40cm Fixed", control: "FKDR Control Valve", wheel: "Standard Gauge Wheel", note: "Includes FKDR Belt-Driven Hydraulic Pump." } }

            },

            "G Series (G23 / G26)": { 

                landingPage: "/Attachments-for-Kubota-G23-G26-Series",

                sweeping: { front: { bracket: "ABR 45 G-Series", machine: "KM 13045 H", collector: "SSB 13045", gully: "ASH 4045", infrastructure: [{ name: "Kersten Cat 0 Front Linkage", link: "/front-linkages" }, { name: "Kersten Auxiliary Hydraulic Kit", link: "/front-linkages" }], note: "⚠️ HYDRAULIC KIT REQUIRED." }, rear: null }, 

                winter: { front: { bracket: "ABR-SCHN-G", machine: "Kersten SCH 120", infrastructure: [{ name: "Kersten Cat 0 Front Linkage", link: "/front-linkages" }, { name: "Auxiliary Hydraulic Kit", link: "/front-linkages" }] }, rear: null },

                weedbrush: null 

            },

            "F Series (Outfront Mower)": { 

                landingPage: "/Attachments-for-Kubota-F-Series",

                sweeping: { front: { bracket: "ABR 45 F-Series", machine: "KM 15045 M (Mechanical)", collector: "SSB 15045", gully: "ASM 4045", infrastructure: [{ name: "Hydraulic Kit", link: "/front-linkages" }] }, rear: null }, 

                winter: { front: { bracket: "ABR-SCHN-F", machine: "Kersten SCH 120", infrastructure: [{ name: "Hydraulic Kit", link: "/front-linkages" }] }, rear: { bracket: "Rear Mount", machine: "Lehner Polaro 110 (12V)" } },

                weedbrush: { front: { bracket: "ABR UB FM-KUB-F", machine: "UB 6080 MH", disc: "BT 060 (60cm)", control: "ST-UB Joystick", wheel: "Integrated Gauge Wheel", note: "Mechanical-Hydraulic Hybrid: Uses Mower PTO for Brush Power." } }

            },

            "RTV (900 / X1110)": { 

                landingPage: "/Attachments-for-Kubota-RTV",

                sweeping: { front: { bracket: "Kersten ABR 45 RTV", machine: "KM 15045 H", collector: "SSB 15045", gully: "ASH 4045", infrastructure: [{ name: "Kersten Hydraulic Kit", link: "/front-linkages" }], note: "⚠️ MANDATORY: Requires Kersten Hydraulic Kit." }, rear: null }, 

                winter: { front: { bracket: "2-Inch Receiver", machine: "Faulkner Bros UTV 1.8m" }, rear: { bracket: "Bed Mount", machine: "Lehner Polaro 170" } },

                weedbrush: null

            }

        },

        "John Deere": {

            "X300 / X500 Series": { 

                landingPage: "/Attachments-for-John-Deere-X300-X500",

                sweeping: { front: { bracket: "FKDR A-Frame", machine: "KM 11537 H-FKDR", collector: "SSB 11537", gully: "ASH 3737", infrastructure: [{ name: "FKDR Hydraulic Front Linkage", link: "/front-linkages" }], note: "⚠️ HYDRAULIC CONVERSION: Requires FKDR Kit." }, rear: null }, 

                winter: { front: { bracket: "FKDR A-Frame", machine: "Kersten SCH 120 (FKDR)", infrastructure: [{ name: "FKDR Hydraulic Front Linkage", link: "/front-linkages" }] }, rear: { bracket: "Tow Behind", machine: "Matev Tow-Spreader", note: "Wheel driven." } },

                weedbrush: { front: { bracket: "FKDR-HYDR-JDX300", machine: "WKB 40 (Ride-On)", disc: "40cm Fixed", control: "FKDR Lever Control", wheel: "Standard Gauge Wheel", note: "Belt-Driven Hydraulic Conversion Kit Included." } }

            },

            "X700 Series": { 

                landingPage: "/Attachments-for-John-Deere-X700-Series",

                sweeping: { front: { bracket: "Kersten ABR 37 JD-X", machine: "KM 12537 M", collector: "SSB 12537", gully: "ASH 403237", infrastructure: [{ name: "Front Linkage & PTO", link: "/front-linkages" }] }, rear: { bracket: "Cat 1", machine: "HKM 12540", collector: "SSB 12540", gully: "ASH 4040" } }, 

                winter: { front: { bracket: "ABR-SCHN-KD", machine: "Kersten SCH 140 Plough", infrastructure: [{ name: "Front Linkage", link: "/front-linkages" }] }, rear: { bracket: "Cat 1 Linkage", machine: "Matev S-100 (PTO)", infrastructure: [{ name: "Rear PTO Shaft", link: "/front-linkages" }] } },

                weedbrush: null 

            },

            "X900 Series": { 

                landingPage: "/Attachments-for-John-Deere-X900-Series",

                sweeping: { front: { bracket: "Kersten ABR 37 JD-X", machine: "KM 12537 M", collector: "SSB 12537", gully: "ASH 403237", infrastructure: [{ name: "Front Linkage & PTO", link: "/front-linkages" }] }, rear: { bracket: "Cat 1", machine: "HKM 12540", collector: "SSB 12540", gully: "ASH 4040" } }, 

                winter: { front: { bracket: "ABR-SCHN-KD", machine: "Kersten SCH 140 Plough", infrastructure: [{ name: "Front Linkage", link: "/front-linkages" }] }, rear: { bracket: "Cat 1 Linkage", machine: "Matev S-100 (PTO)", infrastructure: [{ name: "Rear PTO Shaft", link: "/front-linkages" }] } },

                weedbrush: null

            },

            "1 Series (1026R / 1025R)": { 

                landingPage: "/Attachments-for-John-Deere-1-Series",

                sweeping: { front: { bracket: "Kersten ABR 45 US", machine: "KM 13045", collector: "SSB 13045", gully: "ASH 4045", infrastructure: [{ name: "JD Front Quick-Hitch", link: "/front-linkages" }] }, rear: { bracket: "Cat 1", machine: "HKM 12540", collector: "SSB 12540", gully: "ASH 4040" } }, 

                winter: { front: { bracket: "ABR-SCHN-US", machine: "Kersten SCH 140", infrastructure: [{ name: "JD Front Quick-Hitch", link: "/front-linkages" }] }, rear: { bracket: "Cat 1 Linkage", machine: "Matev S-100 (PTO)", infrastructure: [{ name: "Rear PTO", link: "/front-linkages" }] } },

                weedbrush: { 

                    front: { bracket: "ABR-UB-KD-CAT0", machine: "UB 6080 H", disc: "BT 060 (60cm)", control: "ST-UB Joystick", wheel: "Spindle Gauge Wheel", note: "⚠️ Hybrid Drive: Uses Rear PTO to power hydraulic head." },

                    rear_kit: "Requires PTO Hydraulic Power Pack for UB 6080"

                }

            },

            "2 Series (2026R / 2036R)": { 

                landingPage: "/Attachments-for-John-Deere-2-Series",

                sweeping: { front: { bracket: "Kersten ABR 45 KD", machine: "KM 13045 / 15045", collector: "SSB 13045", gully: "ASH 4045", infrastructure: [{ name: "Front Linkage", link: "/front-linkages" }] }, rear: { bracket: "Cat 1", machine: "HKM 12540", collector: "SSB 12540", gully: "ASH 4040" } }, 

                winter: { front: { bracket: "ABR-SCHN-KD", machine: "Kersten SCH 140 / 150", infrastructure: [{ name: "Front Linkage", link: "/front-linkages" }] }, rear: { bracket: "Cat 1 Linkage", machine: "Matev S-250 (PTO)", infrastructure: [{ name: "Rear PTO", link: "/front-linkages" }] } },

                weedbrush: { 

                    front: { bracket: "ABR-UB-KD-CAT0", machine: "UB 6080 H", disc: "BT 060 (60cm)", control: "ST-UB Joystick", wheel: "Spindle Gauge Wheel", note: "⚠️ Hybrid Drive: Uses Rear PTO to power hydraulic head." },

                    rear_kit: "Requires PTO Hydraulic Power Pack for UB 6080"

                }

            },

            "3 Series (3036E / 3038R)": { 

                landingPage: "/Attachments-for-John-Deere-3-Series",

                sweeping: { front: { bracket: "Kersten ABR 45 KD", machine: "KM 15045", collector: "SSB 15045", gully: "ASH 4045", infrastructure: [{ name: "Front Linkage", link: "/front-linkages" }] }, rear: { bracket: "Cat 1", machine: "HKM 15052", collector: "SSB 15052", gully: "ASH 4052" } }, 

                winter: { front: { bracket: "ABR-SCHN-KD", machine: "Kersten SCH 150", infrastructure: [{ name: "Front Linkage", link: "/front-linkages" }] }, rear: { bracket: "Cat 1 Linkage", machine: "Matev S-250 (PTO)", infrastructure: [{ name: "Rear PTO", link: "/front-linkages" }] } },

                weedbrush: { front: { bracket: "ABR-UB-KD", machine: "UB 6080 MH", disc: "BT 080 (80cm)", control: "ST-UB Joystick", wheel: "MP-LR-UB-EASY" } }

            },

            "4 Series (4052R / 4066R)": { 

                landingPage: "/Attachments-for-John-Deere-3-Series",

                sweeping: { front: { bracket: "Kersten ABR 52 KD", machine: "KM 15052", collector: "SSB 15052", gully: "ASH 4052", infrastructure: [{ name: "Front Linkage", link: "/front-linkages" }] }, rear: { bracket: "Cat 1", machine: "HKM 15052 HY", collector: "SSB 15052", gully: "ASH 4052" } }, 

                winter: { front: { bracket: "ABR-SCHN-KD", machine: "Kersten SCH 150 / 170", infrastructure: [{ name: "Front Linkage", link: "/front-linkages" }] }, rear: { bracket: "Cat 1 Linkage", machine: "Matev SPR-250", infrastructure: [{ name: "Rear PTO", link: "/front-linkages" }] } },

                weedbrush: { front: { bracket: "ABR-UB-UNI", machine: "UB Easy (FL/VB)", disc: "BT 080 (80cm)", control: "Cab Remote", wheel: "MP-LR-UB-EASY" } }

            },

            "5R / 6R Series": { 

                landingPage: "/fkm60-series",

                sweeping: { front: { bracket: "Kersten ABR 60 KD", machine: "FKM 22560", collector: "SSB 22560", gully: "ASH 4060", infrastructure: [{ name: "Cat 2 Front Hitch & PTO", link: "/front-linkages" }] }, rear: { bracket: "Cat 2", machine: "HKM 22560 HY", collector: "SSB 22560", gully: "ASH 4060", note: "⚠️ FLOW CHECK: 50 l/min Required." } }, 

                winter: { front: { bracket: "ABR-SCHN-KD", machine: "Kersten SNK 270 Plough", infrastructure: [{ name: "Cat 2 Front Hitch", link: "/front-linkages" }] }, rear: { bracket: "Cat 2 Linkage", machine: "Matev PDS 300+ (PTO)", infrastructure: [{ name: "Rear PTO", link: "/front-linkages" }] } },

                weedbrush: { front: { bracket: "ABR-UB-UNI (Cat 2)", machine: "UB Easy VB (Vertibrush)", disc: "Vertical Edge Head", control: "Cab Remote", wheel: "MP-LR-UB-EASY", note: "Standard for Highway Edging." } }

            },

            "F Series (Outfront)": { 

                landingPage: "/Attachments-for-John-Deere-Out-Front-Mowers",

                sweeping: { front: { bracket: "ABR 45 JD-F", machine: "KM 15045 M", collector: "SSB 15045", gully: "ASM 4045", infrastructure: [{ name: "Hydraulic Kit", link: "/front-linkages" }] }, rear: null }, 

                winter: { front: { bracket: "ABR-SCHN-JD-F", machine: "Kersten SCH 120", infrastructure: [{ name: "Hydraulic Kit", link: "/front-linkages" }] }, rear: null },

                weedbrush: { front: { bracket: "ABR-UB-FM-JD-1500", machine: "UB 6080 MH", disc: "BT 060 (60cm)", control: "ST-UB Joystick", wheel: "Integrated Gauge Wheel", note: "Utilizes JD High-Speed PTO." } }

            },

           "Gator HPX / XUV": { 

                landingPage: "/Attachments-for-John-Deere-Gator",

                sweeping: null,

                winter: { front: { bracket: "2-Inch Receiver", machine: "Faulkner Bros UTV 1.8m" }, rear: { bracket: "Bed Mount", machine: "Lehner Polaro 170 / XL" } },

                weedbrush: null

            }

        },

        "Iseki": {

            "SXG 216": { 

                landingPage: "/Attachments-for-Iseki-SXG-216",

                sweeping: { front: { bracket: "FKDR A-Frame", machine: "KM 11537 H-FKDR", collector: "SSB 11537", gully: "ASH 3737", infrastructure: [{ name: "FKDR Hydraulic Front Linkage", link: "/front-linkages" }], note: "⚠️ HYDRAULIC CONVERSION." }, rear: null }, 

                winter: { front: { bracket: "FKDR A-Frame", machine: "Kersten SCH 120 (FKDR)", infrastructure: [{ name: "FKDR Hydraulic Front Linkage", link: "/front-linkages" }] }, rear: { bracket: "Tow Behind", machine: "Matev Tow-Spreader", note: "Wheel driven." } },

                weedbrush: { front: { bracket: "FKDR-HYDR-ISSXG216", machine: "WKB 40 (Ride-On)", disc: "40cm Fixed", control: "Lever Control", wheel: "Standard Gauge Wheel" } }

            },

            "SXG 323 / 326": { 

                landingPage: "/Attachments-for-Iseki-SXG-323-326-Series",

                sweeping: { front: { bracket: "FKDR A-Frame", machine: "KM 12537 H-FKDR", collector: "SSB 12537", gully: "ASH 3737", infrastructure: [{ name: "FKDR Hydraulic Front Linkage", link: "/front-linkages" }], note: "⚠️ HYDRAULIC CONVERSION." }, rear: null }, 

                winter: { front: { bracket: "FKDR A-Frame", machine: "Kersten SCH 120 (FKDR)", infrastructure: [{ name: "FKDR Hydraulic Front Linkage", link: "/front-linkages" }] }, rear: { bracket: "Tow Behind", machine: "Matev Tow-Spreader", note: "Wheel driven." } },

                weedbrush: null 

            },

            "TXGS 24 / 2400": { 

                landingPage: "/Attachments-for-Iseki-TXG-Series",

                sweeping: { front: { bracket: "Kersten ABR 45 KD", machine: "KM 13045", collector: "SSB 13045", gully: "ASH 4045", infrastructure: [{ name: "Front Linkage", link: "/front-linkages" }] }, rear: { bracket: "Cat 1", machine: "HKM 12540", collector: "SSB 12540", gully: "ASH 4040" } }, 

                winter: { front: { bracket: "ABR-SCHN-KD", machine: "Kersten SCH 120", infrastructure: [{ name: "Front Linkage", link: "/front-linkages" }] }, rear: { bracket: "Cat 1", machine: "Matev S-100 (PTO)", infrastructure: [{ name: "Rear PTO", link: "/front-linkages" }] } },

                weedbrush: { 

                    front: { bracket: "ABR-UB-KD-CAT0", machine: "UB 6080 H", disc: "BT 060 (60cm)", control: "ST-UB Joystick", wheel: "Spindle Gauge Wheel", note: "⚠️ Hybrid Drive: Uses Rear PTO to power hydraulic head." },

                    rear_kit: "Requires PTO Hydraulic Power Pack for UB 6080"

                }

            },

            "TM Series (TM3185 / 3267)": { 

                landingPage: "/Attachments-for-Iseki-TM-Series",

                sweeping: { front: { bracket: "Kersten ABR 45 KD", machine: "KM 13045", collector: "SSB 13045", gully: "ASH 4045", infrastructure: [{ name: "Front Linkage", link: "/front-linkages" }] }, rear: { bracket: "Cat 1", machine: "HKM 12540", collector: "SSB 12540", gully: "ASH 4040" } }, 

                winter: { front: { bracket: "ABR-SCHN-KD", machine: "Kersten SCH 140", infrastructure: [{ name: "Front Linkage", link: "/front-linkages" }] }, rear: { bracket: "Cat 1", machine: "Matev S-100 (PTO)", infrastructure: [{ name: "Rear PTO", link: "/front-linkages" }] } },

                weedbrush: { 

                    front: { bracket: "ABR-UB-KD-CAT0", machine: "UB 6080 H", disc: "BT 060 (60cm)", control: "ST-UB Joystick", wheel: "Spindle Gauge Wheel", note: "⚠️ Hybrid Drive: Uses Rear PTO to power hydraulic head." },

                    rear_kit: "Requires PTO Hydraulic Power Pack for UB 6080"

                }

            },

            "TG Series (TG 6370 / 6490)": { 

                landingPage: "/Attachments-for-Iseki-TG-Series",

                sweeping: { front: { bracket: "Kersten ABR 52 KD", machine: "KM 15052", collector: "SSB 15052", gully: "ASH 4052", infrastructure: [{ name: "Cat 1/2 Front Linkage", link: "/front-linkages" }] }, rear: { bracket: "Cat 1", machine: "HKM 15052 HY", collector: "SSB 15052", gully: "ASH 4052" } }, 

                winter: { front: { bracket: "ABR-SCHN-KD", machine: "Kersten SCH 150", infrastructure: [{ name: "Front Linkage", link: "/front-linkages" }] }, rear: { bracket: "Cat 1", machine: "Matev SPR-250", infrastructure: [{ name: "Rear PTO", link: "/front-linkages" }] } },

                weedbrush: { front: { bracket: "ABR-UB-KD", machine: "UB 6080 MH", disc: "BT 080 (80cm)", control: "ST-UB Joystick", wheel: "MP-LR-UB-EASY" } }

            },

            "TH Series": { 

                landingPage: "/Attachments-for-Iseki-TH-Series",

                sweeping: { front: { bracket: "Kersten ABR 45 KD", machine: "KM 15045", collector: "SSB 15045", gully: "ASH 4045", infrastructure: [{ name: "Front Linkage", link: "/front-linkages" }] }, rear: { bracket: "Cat 1", machine: "HKM 15052", collector: "SSB 15052", gully: "ASH 4052" } }, 

                winter: { front: { bracket: "ABR-SCHN-KD", machine: "Kersten SCH 150", infrastructure: [{ name: "Front Linkage", link: "/front-linkages" }] }, rear: { bracket: "Cat 1", machine: "Matev SPR-250", infrastructure: [{ name: "Rear PTO", link: "/front-linkages" }] } },

                weedbrush: { front: { bracket: "ABR-UB-KD", machine: "UB 6080 MH", disc: "BT 080 (80cm)", control: "ST-UB Joystick", wheel: "MP-LR-UB-EASY" } }

            },

            "SF Series (Outfront)": { 

                landingPage: "/Attachments-for-Iseki-SF-Series",

                sweeping: { front: { bracket: "ABR 45 FM", machine: "KM 15045 M", collector: "SSB 15045", gully: "ASH 4045" }, rear: null }, 

                winter: { front: { bracket: "ABR-SCHN-FM", machine: "Kersten SCH 120" }, rear: null },

                weedbrush: { front: { bracket: "ABR-F-ISE-SF", machine: "UB 6080 MH", disc: "BT 060 (60cm)", control: "ST-UB Joystick", wheel: "Integrated Gauge Wheel" } }

            },

            "TLE Series": { 

                landingPage: "/Attachments-for-Iseki-TLE-Series",

                sweeping: { front: { bracket: "Kersten ABR 45 KD", machine: "KM 15045", collector: "SSB 15045", gully: "ASH 4045", infrastructure: [{ name: "Front Linkage", link: "/front-linkages" }] }, rear: { bracket: "Cat 1", machine: "HKM 15052", collector: "SSB 15052", gully: "ASH 4052" } }, 

                winter: { front: { bracket: "ABR-SCHN-KD", machine: "Kersten SCH 150", infrastructure: [{ name: "Front Linkage", link: "/front-linkages" }] }, rear: { bracket: "Cat 1", machine: "Matev SPR-250", infrastructure: [{ name: "Rear PTO", link: "/front-linkages" }] } },

                weedbrush: { front: { bracket: "ABR-UB-KD", machine: "UB 6080 MH", disc: "BT 080 (80cm)", control: "ST-UB Joystick", wheel: "MP-LR-UB-EASY" } }

            }

        },

        "Kioti": {

            "CS Series (CS 2220 / 2610)": { 

                landingPage: "/Attachments-for-Kioti-CS-Series",

                sweeping: { front: { bracket: "Kersten ABR 45 KD", machine: "KM 13045", collector: "SSB 13045", gully: "ASH 4045", infrastructure: [{ name: "Front Linkage", link: "/front-linkages" }] }, rear: { bracket: "Cat 1", machine: "HKM 12540", collector: "SSB 12540", gully: "ASH 4040" } }, 

                winter: { front: { bracket: "ABR-SCHN-KD", machine: "Kersten SCH 140", infrastructure: [{ name: "Front Linkage", link: "/front-linkages" }] }, rear: { bracket: "Cat 1", machine: "Matev S-100 (PTO)", infrastructure: [{ name: "Rear PTO", link: "/front-linkages" }] } },

                weedbrush: null 

            },

            "CX Series (CX 2510)": { 

                landingPage: "/Attachments-for-Kioti-CS-Series",

                sweeping: { front: { bracket: "Kersten ABR 45 KD", machine: "KM 13045", collector: "SSB 13045", gully: "ASH 4045", infrastructure: [{ name: "Front Linkage", link: "/front-linkages" }] }, rear: { bracket: "Cat 1", machine: "HKM 12540", collector: "SSB 12540", gully: "ASH 4040" } }, 

                winter: { front: { bracket: "ABR-SCHN-KD", machine: "Kersten SCH 140", infrastructure: [{ name: "Front Linkage", link: "/front-linkages" }] }, rear: { bracket: "Cat 1", machine: "Matev S-100 (PTO)", infrastructure: [{ name: "Rear PTO", link: "/front-linkages" }] } },

                weedbrush: null 

            },

            "CK Series (CK 2630 / 3530)": { 

                landingPage: "/Attachments-for-Kioti-CK-Series",

                sweeping: { front: { bracket: "Kersten ABR 45 KD", machine: "KM 15045", collector: "SSB 15045", gully: "ASH 4045", infrastructure: [{ name: "Front Linkage", link: "/front-linkages" }] }, rear: { bracket: "Cat 1", machine: "HKM 15052", collector: "SSB 15052", gully: "ASH 4052" } }, 

                winter: { front: { bracket: "ABR-SCHN-KD", machine: "Kersten SCH 150", infrastructure: [{ name: "Front Linkage", link: "/front-linkages" }] }, rear: { bracket: "Cat 1", machine: "Matev S-250 (PTO)", infrastructure: [{ name: "Rear PTO", link: "/front-linkages" }] } },

                weedbrush: { front: { bracket: "ABR-UB-KD", machine: "UB 6080 MH", disc: "BT 080 (80cm)", control: "ST-UB Joystick", wheel: "MP-LR-UB-EASY" } }

            },

            "DK Series (DK 4510 / 5010)": { 

                landingPage: "/Attachments-for-Kioti-CK-Series",

                sweeping: { front: { bracket: "Kersten ABR 52 KD", machine: "KM 15052", collector: "SSB 15052", gully: "ASH 4052", infrastructure: [{ name: "Front Linkage", link: "/front-linkages" }] }, rear: { bracket: "Cat 1", machine: "HKM 15052 HY", collector: "SSB 15052", gully: "ASH 4052" } }, 

                winter: { front: { bracket: "ABR-SCHN-KD", machine: "Kersten SCH 150", infrastructure: [{ name: "Front Linkage", link: "/front-linkages" }] }, rear: { bracket: "Cat 1", machine: "Matev SPR-250", infrastructure: [{ name: "Rear PTO", link: "/front-linkages" }] } },

                weedbrush: { front: { bracket: "ABR-UB-UNI", machine: "UB Easy (FL/VB)", disc: "BT 080 (80cm)", control: "Cab Remote", wheel: "MP-LR-UB-EASY" } }

            },

            "WD 1260": { 

                landingPage: "/Attachments-for-Kioti-WD-1260",

                sweeping: { front: { bracket: "ABR 45 FM", machine: "KM 13045 H" }, rear: null }, 

                winter: { front: { bracket: "ABR-SCHN-FM", machine: "Kersten SCH 120" }, rear: null },

                weedbrush: null

            }

        },

        "New Holland": {

            "Boomer 25": { 

                landingPage: "/Attachments-for-New-Holland-Boomer-25",

                sweeping: { front: { bracket: "Kersten ABR 45 KD", machine: "KM 13045", collector: "SSB 13045", gully: "ASH 4045", infrastructure: [{ name: "Front Linkage", link: "/front-linkages" }] }, rear: { bracket: "Cat 1", machine: "HKM 12540", collector: "SSB 12540", gully: "ASH 4040" } }, 

                winter: { front: { bracket: "ABR-SCHN-KD", machine: "Kersten SCH 120", infrastructure: [{ name: "Front Linkage", link: "/front-linkages" }] }, rear: { bracket: "Cat 1", machine: "Matev S-100 (PTO)", infrastructure: [{ name: "Rear PTO", link: "/front-linkages" }] } },

                weedbrush: null 

            },

            "Boomer 30 / 35": { 

                landingPage: "/Attachments-for-New-Holland-Boomer-30-35",

                sweeping: { front: { bracket: "Kersten ABR 45 KD", machine: "KM 15045", collector: "SSB 15045", gully: "ASH 4045", infrastructure: [{ name: "Front Linkage", link: "/front-linkages" }] }, rear: { bracket: "Cat 1", machine: "HKM 15052", collector: "SSB 15052", gully: "ASH 4052" } }, 

                winter: { front: { bracket: "ABR-SCHN-KD", machine: "Kersten SCH 140", infrastructure: [{ name: "Front Linkage", link: "/front-linkages" }] }, rear: { bracket: "Cat 1", machine: "Matev S-250 (PTO)", infrastructure: [{ name: "Rear PTO", link: "/front-linkages" }] } },

                weedbrush: { front: { bracket: "ABR-UB-KD", machine: "UB 6080 MH", disc: "BT 080 (80cm)", control: "ST-UB Joystick", wheel: "MP-LR-UB-EASY" } }

            },

            "Boomer 40 / 50": { 

                landingPage: "/Attachments-for-New-Holland-Boomer-40",

                sweeping: { front: { bracket: "Kersten ABR 52 KD", machine: "KM 15052", collector: "SSB 15052", gully: "ASH 4052", infrastructure: [{ name: "Front Linkage", link: "/front-linkages" }] }, rear: { bracket: "Cat 1", machine: "HKM 15052 HY", collector: "SSB 15052", gully: "ASH 4052" } }, 

                winter: { front: { bracket: "ABR-SCHN-KD", machine: "Kersten SCH 150", infrastructure: [{ name: "Front Linkage", link: "/front-linkages" }] }, rear: { bracket: "Cat 1", machine: "Matev SPR-250", infrastructure: [{ name: "Rear PTO", link: "/front-linkages" }] } },

                weedbrush: { front: { bracket: "ABR-UB-KD", machine: "UB 6080 MH", disc: "BT 080 (80cm)", control: "ST-UB Joystick", wheel: "MP-LR-UB-EASY" } }

            }

        },

        "Solis": {

            "Solis 20 / 26": { 

                landingPage: "/Compact-Tractor-Attachments-Page",

                sweeping: { front: { bracket: "Kersten ABR 45 KD", machine: "KM 13045", collector: "SSB 13045", gully: "ASH 4045", infrastructure: [{ name: "Solis Front Linkage", link: "/front-linkages" }] }, rear: { bracket: "Cat 1", machine: "HKM 12540", collector: "SSB 12540", gully: "ASH 4040" } }, 

                winter: { front: { bracket: "ABR-SCHN-KD", machine: "Kersten SCH 120", infrastructure: [{ name: "Solis Front Linkage", link: "/front-linkages" }] }, rear: { bracket: "Cat 1", machine: "Matev S-100 (PTO)", infrastructure: [{ name: "Rear PTO", link: "/front-linkages" }] } },

                weedbrush: null 

            }

        },

        "TYM / Branson": {

            "T25 / 2500": { 

                landingPage: "/Compact-Tractor-Attachments-Page",

                sweeping: { front: { bracket: "ABR 45 KD", machine: "KM 13045", collector: "SSB 13045", gully: "ASH 4045", infrastructure: [{ name: "Zuidberg/Matev Front Linkage", link: "/front-linkages" }, { name: "Front PTO", link: "/front-linkages" }] }, rear: { bracket: "Standard CAT 1", machine: "HKM 12540", collector: "SSB 12540", gully: "ASH 4040" } }, 

                winter: { front: { bracket: "ABR-SCHN-KD", machine: "Kersten SCH 140", infrastructure: [{ name: "Front Linkage", link: "/front-linkages" }] }, rear: { bracket: "Cat 1", machine: "Matev S-100 (PTO)", infrastructure: [{ name: "Rear PTO", link: "/front-linkages" }] } },

                weedbrush: null 

            },

            "F50 / 5025": { 

                landingPage: "/Compact-Tractor-Attachments-Page",

                sweeping: { front: { bracket: "ABR 45 KD", machine: "KM 15045", collector: "SSB 15045", gully: "ASH 4045", infrastructure: [{ name: "Front Linkage Cat 1", link: "/front-linkages" }] }, rear: { bracket: "Standard CAT 1", machine: "HKM 15052 HY", collector: "SSB 15052", gully: "ASH 4052" } }, 

                winter: { front: { bracket: "ABR-SCHN-KD", machine: "Kersten SCH 150", infrastructure: [{ name: "Front Linkage", link: "/front-linkages" }] }, rear: { bracket: "Cat 1", machine: "Matev SPR-250", infrastructure: [{ name: "Rear PTO", link: "/front-linkages" }] } },

                weedbrush: { front: { bracket: "ABR-UB-UNI", machine: "UB Easy (FL/VB)", disc: "BT 080 (80cm)", control: "Cab Remote", wheel: "MP-LR-UB-EASY" } }

            }

        },

        "Grillo": {

            "FD / FM Series": { 

                landingPage: "/Attachments-for-Grillo-FD-%26-FM-Series",

                sweeping: { front: { bracket: "ABR 45 GRILLO", machine: "KM 13045 HY (Hydraulic)", collector: "SSB 13045", gully: "ASH 4045", note: "⚠️ DIRECT HYDRAULIC: Connects directly to Grillo front hydraulic couplings." }, rear: null }, 

                winter: { front: { bracket: "ABR 45 GRILLO", machine: "Kersten SCH 140 HY", note: "Direct hydraulic connection." }, rear: null },

                weedbrush: { front: { bracket: "ABR-UB-FM-JD-1500", machine: "UB 6080 MH", disc: "BT 060 (60cm)", control: "ST-UB Joystick", wheel: "Integrated Gauge Wheel", note: "Utilizes JD High-Speed PTO." } }

            }

        },

        "JCB": {

            "Loadall (Q-Fit)": { 

                landingPage: "/Telehandler-Attachments-Page",

                sweeping: { front: { bracket: "Kersten ABR 60 JCB-QFIT", machine: "FKM 22560 HY", collector: "SSB 22560", gully: "ASH 4060", infrastructure: [{ name: "Hydraulic Quick-Release", link: "/front-linkages" }] }, rear: null }, 

                winter: { front: { bracket: "Kersten ABR 60 JCB-QFIT", machine: "Kersten SNK 270 HY", infrastructure: [{ name: "Hydraulic Service", link: "/front-linkages" }] }, rear: null },

                weedbrush: { front: { bracket: "ABR-UB-QFIT", machine: "UB Easy VB (Vertibrush)", disc: "80cm Vertical Head", control: "Wireless Remote Option", wheel: "MP-LR-UB-EASY", note: "Specifically for Highway Edging & Verge Hygiene." } }

            },

            "Compact (Tool Carrier)": { 

                landingPage: "/Telehandler-Attachments-Page",

                sweeping: { front: { bracket: "Kersten ABR 60 JCB-TC", machine: "FKM 22560 HY", collector: "SSB 22560", gully: "ASH 4060", infrastructure: [{ name: "Hydraulic Quick-Release", link: "/front-linkages" }] }, rear: null }, 

                winter: { front: { bracket: "Kersten ABR 60 JCB-TC", machine: "Kersten SNK 220 HY", infrastructure: [{ name: "Hydraulic Service", link: "/front-linkages" }] }, rear: null },

                weedbrush: { front: { bracket: "ABR-UB-TC", machine: "UB Easy VB (Vertibrush)", disc: "80cm Vertical Head", control: "Wireless Remote Option", wheel: "MP-LR-UB-EASY" } }

            }

        },

        "Manitou": {

            "MLT Series": { 

                landingPage: "/Telehandler-Attachments-Page",

                sweeping: { front: { bracket: "Kersten ABR 60 MANITOU", machine: "FKM 22560 HY", collector: "SSB 22560", gully: "ASH 4060", infrastructure: [{ name: "Hydraulic Quick-Release", link: "/front-linkages" }] }, rear: null }, 

                winter: { front: { bracket: "Kersten ABR 60 MANITOU", machine: "Kersten SNK 270 HY", infrastructure: [{ name: "Hydraulic Service", link: "/front-linkages" }] }, rear: null },

                weedbrush: { front: { bracket: "ABR-UB-MANITOU", machine: "UB Easy VB (Vertibrush)", disc: "80cm Vertical Head", control: "Wireless Remote Option", wheel: "MP-LR-UB-EASY" } }

            }

        },

        "Merlo": {

            "Panoramic / Turbo": { 

                landingPage: "/Telehandler-Attachments-Page",

                sweeping: { front: { bracket: "Kersten ABR 60 MERLO", machine: "FKM 22560 HY", collector: "SSB 22560", gully: "ASH 4060", infrastructure: [{ name: "Hydraulic Quick-Release", link: "/front-linkages" }] }, rear: null }, 

                winter: { front: { bracket: "Kersten ABR 60 MERLO", machine: "Kersten SNK 270 HY", infrastructure: [{ name: "Hydraulic Service", link: "/front-linkages" }] }, rear: null },

                weedbrush: { front: { bracket: "ABR-UB-MERLO", machine: "UB Easy VB (Vertibrush)", disc: "80cm Vertical Head", control: "Wireless Remote Option", wheel: "MP-LR-UB-EASY" } }

            }

        },

        "Industrial": {

            "Forklift / Telehandler": { 

                landingPage: "/Industrial-Forklift-Attachments-Page",

                sweeping: { front: { bracket: "ABR 60 FORK", machine: "KM 15060 HY", collector: "SSB 15060", gully: "ASH 4060" }, rear: null }, 

                winter: { front: { bracket: "ABR 60 FORK", machine: "Kersten SNK 220 HY" }, rear: null },

                weedbrush: null 

            }

        }

    };



    const winterOnlyVehicles = {

        "Ford": {

            "Ranger (All Models)": { 

                landingPage: "/Faulkner-Brothers-Snow-Ploughs-for-4x4s-and-Utility-Vehicles",

                winter: { 

                    front: { bracket: "2-Inch Receiver", machine: "Faulkner Bros 4x4 Plough", infrastructure: [{ name: "Faulkner Front Chassis Mount", link: "/front-linkages" }, { name: "12V Integrated Battery System", link: "/front-linkages" }] }, 

                    rear: { bracket: "Tailgate / Bed", machine: "Lehner Polaro 170 / 250 / XL", infrastructure: [{ name: "Bed Mounting Frame", link: "/front-linkages" }, { name: "Lehner In-Cab Controller", link: "/front-linkages" }] } 

                } 

            },

            "Transit (Van)": { 

                landingPage: "/Faulkner-Brothers-Snow-Ploughs-for-4x4s-and-Utility-Vehicles",

                winter: { 

                    front: { bracket: "2-Inch Receiver", machine: "Faulkner Bros 4x4 Plough", infrastructure: [{ name: "Faulkner Van Chassis Mount", link: "/front-linkages" }] }, 

                    rear: { bracket: "Tailgate", machine: "Lehner Polaro 110 (Tailgate)", infrastructure: [{ name: "Tailgate Mount", link: "/front-linkages" }] } 

                } 

            }

        },

        "Toyota": {

            "Hilux (All Models)": { 

                landingPage: "/Faulkner-Brothers-Snow-Ploughs-for-4x4s-and-Utility-Vehicles",

                winter: { 

                    front: { bracket: "2-Inch Receiver", machine: "Faulkner Bros 4x4 Plough", infrastructure: [{ name: "Faulkner Front Chassis Mount", link: "/front-linkages" }] }, 

                    rear: { bracket: "Tailgate / Bed", machine: "Lehner Polaro 170 / 250 / XL", infrastructure: [{ name: "Bed Mounting Frame", link: "/front-linkages" }] } 

                } 

            }

        },

        "Isuzu": {

            "D-Max (All Models)": { 

                landingPage: "/Faulkner-Brothers-Snow-Ploughs-for-4x4s-and-Utility-Vehicles",

                winter: { 

                    front: { bracket: "2-Inch Receiver", machine: "Faulkner Bros 4x4 Plough", infrastructure: [{ name: "Faulkner Front Chassis Mount", link: "/front-linkages" }] }, 

                    rear: { bracket: "Tailgate / Bed", machine: "Lehner Polaro 170 / 250 / XL", infrastructure: [{ name: "Bed Mounting Frame", link: "/front-linkages" }] } 

                } 

            }

        },

        "Mitsubishi": {

            "L200 (All Models)": { 

                landingPage: "/Faulkner-Brothers-Snow-Ploughs-for-4x4s-and-Utility-Vehicles",

                winter: { 

                    front: { bracket: "2-Inch Receiver", machine: "Faulkner Bros 4x4 Plough", infrastructure: [{ name: "Faulkner Front Chassis Mount", link: "/front-linkages" }] }, 

                    rear: { bracket: "Tailgate / Bed", machine: "Lehner Polaro 170 / 250 / XL", infrastructure: [{ name: "Bed Mounting Frame", link: "/front-linkages" }] } 

                } 

            }

        },

        "Land Rover": {

            "Defender 90/110": { 

                landingPage: "/Faulkner-Brothers-Snow-Ploughs-for-4x4s-and-Utility-Vehicles",

                winter: { 

                    front: { bracket: "2-Inch Receiver", machine: "Faulkner Bros 4x4 Plough", infrastructure: [{ name: "Faulkner Front Chassis Mount", link: "/front-linkages" }] }, 

                    rear: { bracket: "Bed/Tailgate", machine: "Lehner Polaro 170 / XL", infrastructure: [{ name: "Bed Mounting Frame", link: "/front-linkages" }] } 

                } 

            },

            "Discovery": { 

                landingPage: "/Faulkner-Brothers-Snow-Ploughs-for-4x4s-and-Utility-Vehicles",

                winter: { 

                    front: { bracket: "2-Inch Receiver", machine: "Faulkner Bros 4x4 Plough", infrastructure: [{ name: "Faulkner Front Chassis Mount", link: "/front-linkages" }] }, 

                    rear: { bracket: "Tailgate", machine: "Lehner Polaro 110", infrastructure: [{ name: "Tailgate Mount", link: "/front-linkages" }] } 

                } 

            }

        },

        "VW": {

            "Amarok (All Models)": { 

                landingPage: "/Faulkner-Brothers-Snow-Ploughs-for-4x4s-and-Utility-Vehicles",

                winter: { 

                    front: { bracket: "2-Inch Receiver", machine: "Faulkner Bros 4x4 Plough", infrastructure: [{ name: "Faulkner Front Chassis Mount", link: "/front-linkages" }] }, 

                    rear: { bracket: "Bed", machine: "Lehner Polaro 170 / 250 / XL", infrastructure: [{ name: "Bed Mounting Frame", link: "/front-linkages" }] } 

                } 

            }

        },

        "Nissan": {

            "Navara (All Models)": { 

                landingPage: "/Faulkner-Brothers-Snow-Ploughs-for-4x4s-and-Utility-Vehicles",

                winter: { 

                    front: { bracket: "2-Inch Receiver", machine: "Faulkner Bros 4x4 Plough", infrastructure: [{ name: "Faulkner Front Chassis Mount", link: "/front-linkages" }] }, 

                    rear: { bracket: "Bed", machine: "Lehner Polaro 170 / 250 / XL", infrastructure: [{ name: "Bed Mounting Frame", link: "/front-linkages" }] } 

                } 

            }

        }

    };



// --- 4. LOGIC & INJECTION (RED BRAND STYLING) ---

    const loadWizardLogic = (container) => {

        container.innerHTML = `

            <div id="wizard-wrapper" style="background:#f9fbf9; border:3px solid ${K_RED}; border-radius:16px; padding:30px; margin-bottom:20px; font-family:'Segoe UI', Roboto, Helvetica, Arial, sans-serif; box-shadow:0 15px 35px rgba(211, 47, 47, 0.15); position:relative; overflow:hidden;">

                <div style="position:absolute; top:0; left:0; width:100%; height:6px; background:${K_RED};"></div>

                

                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">

                    <h4 style="margin:0; color:${K_RED}; font-size:20px; font-weight:900; letter-spacing:-0.5px; text-transform:uppercase;">🚜 Professional Fitment Finder</h4>

                    ${!container.closest('.kersten-homepage-wizard') ? '<button onclick="this.closest(\'.kersten-fitment-wizard\').remove()" style="background:#eee; border:none; border-radius:50%; width:24px; height:24px; color:#666; cursor:pointer;">✕</button>' : ''}

                </div>

                

                <p style="font-size:14px; color:#444; margin-bottom:20px; line-height:1.6; font-weight:500;">Select your vehicle below to verify compatibility, check hydraulic/PTO requirements, and generate a <strong>Validated Technical Spec Sheet</strong>.</p>

                

                <div style="background:#f8f8f8; border-radius:10px; padding:6px; margin-bottom:20px; display:flex; justify-content:center; gap:10px; border:1px solid #eee;">

                    <label style="flex:1; text-align:center; padding:10px; border-radius:8px; cursor:pointer; font-weight:bold; font-size:13px; transition:0.2s;" class="mode-label">

    <input type="radio" name="app-mode" value="sweeping" checked> 🧹 Sweeping

</label>

                    <label style="flex:1; text-align:center; padding:10px; border-radius:8px; cursor:pointer; font-weight:bold; font-size:13px; transition:0.2s; color:${K_BLUE};" class="mode-label"><input type="radio" name="app-mode" value="winter"> ❄️ Winter</label>

                    <label style="flex:1; text-align:center; padding:10px; border-radius:8px; cursor:pointer; font-weight:bold; font-size:13px; transition:0.2s; color:${K_BROWN};" class="mode-label"><input type="radio" name="app-mode" value="weedbrush"> 🌿 Weed Brush</label>

                </div>

                

                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; margin-bottom:20px;">

                    <select id="t-brand" style="padding:14px; border-radius:8px; border:2px solid #ddd; background:#fff; font-size:15px; font-weight:bold; color:${K_DARK}; outline:none; transition:border-color 0.3s; width:100%;"><option value="">-- Select Brand --</option></select>

                    <select id="t-model" style="padding:14px; border-radius:8px; border:2px solid #ddd; background:#fff; font-size:15px; font-weight:bold; color:${K_DARK}; outline:none; width:100%;" disabled><option value="">-- Select Model --</option></select>

                </div>



                <div id="mount-area" style="display:block; margin-bottom:20px; background:#fff2f2; padding:15px; border-radius:10px; border:1px solid ${K_RED}44;">

                    <span style="font-size:12px; font-weight:900; color:${K_RED}; display:block; margin-bottom:12px; text-transform:uppercase; letter-spacing:1px;">Mounting Position:</span>

                   <label style="margin-right:30px; font-size:15px; cursor:pointer; font-weight:bold; color:${K_DARK};">

    <input type="radio" name="m-pos" value="front" checked> Front Mount

</label>

                    <label id="rear-label" style="font-size:15px; cursor:pointer; font-weight:bold; color:${K_DARK};"><input type="radio" name="m-pos" value="rear"> Rear Mount</label>

                </div>



                <div id="f-res" style="display:none; background:#fff; border:2px solid #eee; border-radius:12px; padding:25px; animation:wizardSlideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);"></div>

            </div>

            

            <style>

                @keyframes wizardSlideIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }

                .mode-label:has(input:checked) { background: #fff !important; box-shadow: 0 4px 10px rgba(0,0,0,0.1); border: 1px solid #ddd; }

                #t-brand:focus, #t-model:focus { border-color: ${K_RED} !important; }



                /* --- FINAL FIXED PRINT CSS (WHOLE TOOL) --- */

                @media print {

                    /* 1. Collapse the rest of the site */

                    html, body {

                        height: 0 !important;

                        overflow: hidden !important;

                        margin: 0 !important;

                        padding: 0 !important;

                    }

                    

                    body * {

                        visibility: hidden;

                    }



                    /* 2. Target the WRAPPER (everything in the tool) */

                    #wizard-wrapper {

                        visibility: visible !important;

                        position: fixed !important;

                        left: 0 !important;

                        top: 0 !important;

                        width: 100% !important;

                        height: auto !important;

                        margin: 0 !important;

                        padding: 20px !important;

                        background: white !important;

                        border: 2px solid #ccc !important; /* Lighter border for print */

                        box-shadow: none !important; /* Remove shadow for print */

                        z-index: 999999;

                        

                        page-break-inside: avoid !important;

                        break-inside: avoid !important;

                    }



                    /* 3. Make everything INSIDE the wrapper visible */

                    #wizard-wrapper * {

                        visibility: visible !important;

                    }



                    /* 4. Hide just the buttons (Print/Quote) inside the tool */

                    #wizard-wrapper button, #wizard-wrapper a {

                        display: none !important;

                    }



                    /* 5. Clean up badge */

                    #sector-validation-badge {

                        border: 1px solid #ccc !important;

                        background: none !important;

                    }

                }

            </style>

        `;



        const bSel = container.querySelector('#t-brand');

        const mSel = container.querySelector('#t-model');

        const res = container.querySelector('#f-res');

        const tgl = container.querySelector('#mount-area');

        const appRadios = container.querySelectorAll('input[name="app-mode"]');



        const getActiveDB = () => {

            const mode = container.querySelector('input[name="app-mode"]:checked').value;

            return mode === 'winter' ? { ...commonVehicles, ...winterOnlyVehicles } : commonVehicles;

        };



        const populateBrands = () => {

            const db = getActiveDB();

            const mode = container.querySelector('input[name="app-mode"]:checked').value;

            container.querySelector('#rear-label').style.display = (mode === 'weedbrush') ? 'none' : 'inline-block';



            const selectedBrand = bSel.value;

            bSel.innerHTML = '<option value="">-- Brand --</option>';

            Object.keys(db).forEach(b => bSel.innerHTML += `<option value="${b}" ${b === selectedBrand ? 'selected' : ''}>${b}</option>`);

            

            // Auto-trigger if brand is already selected (e.g. browser cache)

            if(selectedBrand && db[selectedBrand]) populateModels();

            else { mSel.innerHTML = '<option value="">-- Model --</option>'; mSel.disabled = true; res.style.display = 'none'; }

        };



        const populateModels = () => {

            const db = getActiveDB();

            const brand = bSel.value;

            mSel.innerHTML = '<option value="">-- Model --</option>';

            if (brand && db[brand]) {

                Object.keys(db[brand]).sort().forEach(m => mSel.innerHTML += `<option value="${m}">${m}</option>`);

                mSel.disabled = false;

            }

        };



        const updateDisplay = () => {

            const db = getActiveDB();

            const brand = bSel.value;

            const model = mSel.value;

            const pos = container.querySelector('input[name="m-pos"]:checked').value;

            const mode = container.querySelector('input[name="app-mode"]:checked').value;



            if (brand && model && db[brand][model]) {

                let data = db[brand][model][mode] ? db[brand][model][mode][pos] : null;



                if (!data) {

                    res.innerHTML = `<p style="color:#c0392b; font-size:15px; font-weight:bold; margin:0; text-align:center;">⚠️ Configuration not available for this mode.</p>`;

                } else {

                    let machineLabel = 'Machine';

                    let accentColor = K_RED; 

                    if (mode === 'sweeping') machineLabel = 'Sweeper';

                    if (mode === 'winter') { machineLabel = pos === 'rear' ? 'Spreader' : 'Plough'; accentColor = K_BLUE; }

                    if (mode === 'weedbrush') { machineLabel = 'Weed Brush'; accentColor = K_BROWN; }



                    const items = [`🔧 <strong>Bracket:</strong> ${data.bracket}`, `⚙️ <strong>${machineLabel}:</strong> ${data.machine}`];

                    

                    if (data.collector) items.push(`📦 <strong>Collector Box:</strong> ${data.collector}`);

                    if (data.gully) items.push(`🛠️ <strong>Gully Brush:</strong> ${data.gully}`);

                    if (data.disc) items.push(`💿 <strong>Disc Size:</strong> ${data.disc}`);

                    if (data.control) items.push(`🎮 <strong>Control:</strong> ${data.control}`);

                    if (data.wheel) items.push(`🎡 <strong>Adjustment:</strong> ${data.wheel}`);

                    if (data.infrastructure) items.push(`⚠️ <strong>Required:</strong> ${data.infrastructure.map(i => i.name).join(', ')}`);

                    

                    const productUrl = db[brand][model].landingPage || getProductLink(data.machine);

                    const fullInquiryBody = `FITMENT CHECK (${mode.toUpperCase()}): ${brand} ${model}\n\nI would like a verified quote for:\n\n- Vehicle: ${brand} ${model}\n- ${items.map(s => s.replace(/<[^>]*>/g, '')).join('\n- ')}\n\nPlease check compatibility.`;

                    const inquiryLink = `/Contact-us-2?message=${encodeURIComponent(fullInquiryBody)}`; 



                    // --- INTEGRATED SECTOR BADGE LOGIC ---

                    const sectorBadge = getSectorBadge(brand) || getSectorBadge(model);



                    res.innerHTML = `

                        <div id="print-area">

                            ${sectorBadge}

                            <div style="border-bottom: 2px solid ${accentColor}; margin-bottom: 15px; padding-bottom: 10px;">

                                <strong style="color:${accentColor}; font-size:18px;">${mode === 'winter' ? 'Winter Spec Sheet' : (mode === 'weedbrush' ? 'IWM Weed Spec Sheet' : 'Sweeper Fitment Sheet')}</strong>

                                <div style="font-size:13px; color:#666; font-weight:bold; margin-top:5px;">Verified for <strong>${brand} ${model}</strong></div>

                            </div>

                            <ul style="list-style:none; padding:0; margin:0 0 20px 0; font-size:14px; line-height:1.8; color:#333;">

                                ${items.map(i => `<li style="border-bottom:1px solid #f0f0f0; padding:4px 0;">${i}</li>`).join('')}

                            </ul>

                            ${data.note ? `<p style="font-size:12px; color:#c0392b; font-weight:bold; margin-bottom:15px; padding:10px; border:1px solid #f5c6cb; background:#f8d7da; border-radius:4px;">${data.note}</p>` : ''}

                        </div>

                        <div style="display:grid; gap:10px;">

                            <a href="${productUrl}" style="display:block; background:#fff; border:2px solid ${accentColor}; color:${accentColor}; text-align:center; padding:12px; border-radius:8px; text-decoration:none; font-weight:800; text-transform:uppercase; font-size:13px; transition:all 0.2s;">👀 View All Attachments for ${model}</a>

                            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                                <a href="${inquiryLink}" style="background:#27ae60; color:#fff; text-align:center; padding:15px; border-radius:8px; text-decoration:none; font-weight:900; text-transform:uppercase; font-size:13px; box-shadow:0 4px 10px rgba(39, 174, 96, 0.3); transition: transform 0.2s ease;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">Get a Quote for this Exact Setup &rarr;</a>
                                <button onclick="window.print()" style="background:#eee; color:#333; border:none; border-radius:8px; cursor:pointer; font-weight:900; font-size:13px; transition: background 0.2s ease;" onmouseover="this.style.background='#e0e0e0'" onmouseout="this.style.background='#eee'">🖨️ Print PDF</button>
                            </div>

                        </div>`;

                }

                res.style.display = 'block';

            }

        };



        appRadios.forEach(r => r.addEventListener('change', () => { res.style.display = 'none'; populateBrands(); }));

        bSel.onchange = () => { populateModels(); }; // Mount area now always visible by default

        mSel.onchange = updateDisplay;

        container.querySelectorAll('input[name="m-pos"]').forEach(r => r.addEventListener('change', updateDisplay));

       // --- FORCE PRE-SELECTION (FIX) ---

    // 1. Manually force the "Sweeping" radio to be checked in the DOM

    const sweepRadio = container.querySelector('input[value="sweeping"]');

    if (sweepRadio) sweepRadio.checked = true;



    // 2. Manually force "Front Mount" to be checked

    const frontRadio = container.querySelector('input[value="front"]');

    if (frontRadio) frontRadio.checked = true;



    // 3. Run the logic to populate brands based on these forced selections

    populateBrands();

};



  // --- 5. INJECTION & AUTO-FILL ---
    const injectWizard = () => {
        if (window.location.href.includes('fitment-tool-embed')) return;
        
        const excludedPaths = [
    '/weed-brush/weedo-series/weedo-ii',
    '/Products-By-Vehicle-Type',
    '/integrated-weed-management-trial-bracknell-kersten-uk-complete-weed-control',
    '/hot-air-weed-removers/unpowered-pedestrian-hot-air-weed-removers/hoaf-weed-air-50i-weed-burner-hf20000477-it6ag',
    '/non-chemical-weed-control-supply-continuity',
    '/login',
    '/gravel-path-renovators-and-graders',
    '/Salt-Spreaders-and-Ice-Management',
    '/electric-weeding-equipment',
    '/Weed-brush-attachment-series',
    '/Mounted-Collector-series',
    '/Acti-Sweep-Tractor-Mounted-Push-Brooms',
    '/Weed-brush-attachment-series',
    '/Cerruti-Snow-Blowers-For-Compact-Tractors',
    '/Front-Sweeper-to-fit-a-Kubota-BX-231',
    '/vacuum-nozzle-attachment-series',
    '/Matador-wheelbarrows',
    '/Kersten-Tractor-Mounted-Watering-Arms-for-Compact-Tractors',
    '/small-area-weed-removal-weedgo!',
    '/Products-by-Application-Type',
    '/kersten-machines',
    '/Contact-us-2',
    '/kersten-machinery-hire',
    '/the-weeds-are-not-the-problem-book',
    '/Site-Maintenance-Equipment-for-All-Seasons',
    '/Search-by-Kersten-Product-Type',
    '/national-action-plan-2025-council-guide',
    '/Kersten-Case-Studies-and-Customer-Results',
    '/Book-a-Demonstration-of-a-Kersten-Machine',
    '/Kersten-Used-Equipment-Finance-and-Trade-in',
    '/Search-By-Product-Category',
    '/about-kersten-uk-ltd',
    '/Contact-us-Optimise-Herbicide-Efficiency',
    '/api/method/',
    '/orders',
    '/cart',
    '/education-healthcare-estates-groundcare',
    '/Local-Authority-Integrated-Weed-Management-Plan',
    '/historic-buildings-heritage-estates-groundcare',
    '/grounds-maintenance-contractors-equipment-support',
    '/Kersten-Stocking-Dealers-Hire-Partners-and-Contractors'

];
    if (excludedPaths.some(path => window.location.pathname.includes(path))) return;
        
        // CHECK: If on blog, ask the controller
        if (window.location.href.includes('/blog')) {
            const ctx = window.kerstenBlogContextCache || window.getKerstenBlogContext();
            if (ctx.tool !== 'wizard') return;
        }

        const currentPath = window.location.pathname;
        const isHomepage = currentPath === '/' || currentPath === '/index.html' || currentPath === '/home';

        if (isHomepage) {
            if (document.querySelector('.kersten-homepage-wizard')) return;
            const gridSection = document.getElementById('browse-grid');
            if (gridSection) {
                const wrapper = document.createElement('div');
                wrapper.className = 'kersten-homepage-wizard';
                wrapper.id = 'fitment-wizard';
                wrapper.style.cssText = "background: #fdfdfd; padding: 60px 20px; text-align: center; border-bottom: 1px solid #eee; width: 100%; display: block; overflow: visible;";
                wrapper.innerHTML = `
                    <div style="max-width: 1250px; margin: 0 auto;">
                        <h2 style='color: #D32F2F; font-size:32px; margin-bottom: 15px; font-weight: 900; text-transform:uppercase; letter-spacing:-1px;'>🚜 Check Tractor Fitment</h2>
                        <p style='font-size: 16px; color: #666; margin: 0 auto 30px auto; max-width:600px; line-height:1.6;'>
                            Already own a tractor? Select your model below to see certified compatible attachments.
                        </p>
                        <div class="kersten-fitment-wizard"></div>
                    </div>
                `;
                gridSection.parentNode.insertBefore(wrapper, gridSection.nextSibling);
                loadWizardLogic(wrapper.querySelector('.kersten-fitment-wizard'));
                return;
            }
        }
        
        
        
        if (document.querySelector('.kersten-fitment-wizard')) return;

        // Build the visual element first
        const placeholder = document.createElement('div');
        placeholder.className = 'kersten-fitment-wizard';
        // Added 'clear: both' and 'width: 100%' to ensure it doesn't get squashed beside grid items
        placeholder.style.cssText = "margin: 60px auto 40px auto; min-height: 150px; max-width: 1200px; clear: both; width: 100%; display: block;";
        placeholder.innerHTML = `
            <div id="kersten-wizard-trigger" style="background: #fff; border: 3px dashed ${K_RED}; border-radius: 16px; padding: 40px; text-align: center; cursor: pointer; transition: transform 0.3s ease, box-shadow 0.3s ease; box-shadow: 0 10px 20px rgba(0,0,0,0.05);">
                <div style="font-size:40px; margin-bottom:15px;">🚜</div>
                <h4 style="margin:0 0 10px 0; color:${K_RED}; font-size:22px; font-weight:900; text-transform:uppercase;">Check Machine Compatibility</h4>
                <p style="color:#666; font-size:15px; margin-bottom:25px; max-width:500px; margin-left:auto; margin-right:auto;">Verify this machine against your specific tractor or vehicle model in seconds.</p>
                <button style="background: ${K_RED}; color: #fff; border: none; padding: 15px 40px; border-radius: 50px; font-weight: 900; font-size:16px; cursor: pointer; box-shadow: 0 4px 15px ${K_RED}44; animation: k-pulse 2s infinite;">Start Fitment Wizard</button>
            </div>
            <style>
                @keyframes k-pulse { 0% { box-shadow: 0 0 0 0 ${K_RED}66; } 70% { box-shadow: 0 0 0 15px ${K_RED}00; } 100% { box-shadow: 0 0 0 0 ${K_RED}00; } }
                #kersten-wizard-trigger:hover { transform: translateY(-5px); box-shadow: 0 15px 30px rgba(0,0,0,0.1); border-style: solid; }
            </style>`;

        // NEW LOGIC: Determine if this is a specific Product page or a Category page
        const isProductPage = document.querySelector('.product-price, .cart-btn, [itemprop="offers"], .item-price');

        if (isProductPage) {
            // PRODUCT PAGE: Put it high up near the specs/description
            let target = document.querySelector('table, .specification-table, .product-specs, .frappe-table') || document.querySelector('.product-description, .web-page-content') || document.querySelector('.cart-btn, .product-price');
            
            if (target && target.parentNode) {
                // FIX: Insert ABOVE the target table
                target.parentNode.insertBefore(placeholder, target);
                placeholder.querySelector('#kersten-wizard-trigger').addEventListener('click', function() { loadWizardLogic(placeholder); }, { once: true });
            }

            // ADDITION: Inject a clear CTA button right under the price to reduce bounce rate
            const priceArea = document.querySelector('.product-price, .item-price, .cart-btn');
            if (priceArea && !document.querySelector('.kersten-jump-btn')) {
                const jumpBtn = document.createElement('button');
                jumpBtn.className = 'kersten-jump-btn';
                jumpBtn.innerHTML = '🚜 Check if this fits your machine &darr;';
                jumpBtn.style.cssText = 'display:block; width:100%; max-width:300px; margin-top:15px; padding:12px; background:#D32F2F; color:white; border:none; border-radius:8px; font-weight:900; font-size:14px; cursor:pointer; text-transform:uppercase; box-shadow:0 4px 6px rgba(211,47,47,0.2); transition:transform 0.2s;';
                
                jumpBtn.onclick = (e) => {
                    e.preventDefault();
                    // Scroll smoothly to the wizard
                    placeholder.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Auto-open the wizard to save the user a click
                    const trigger = placeholder.querySelector('#kersten-wizard-trigger');
                    if (trigger) trigger.click();
                };
                
                priceArea.parentNode.insertBefore(jumpBtn, priceArea.nextSibling);
            }
        } else {
            // CATEGORY PAGE LOGIC: Intercept right before the product grid begins
            // Using the exact Bootstrap classes you identified
            const firstCard = document.querySelector('.card.card-md, .card, .item-card, .product-card');
            
            if (firstCard) {
                // Step 1: Go up from the card to find the row/grid that holds all the products
                const cardGrid = firstCard.closest('.row') || firstCard.parentNode;
                
                // Step 2: Insert the wizard immediately above that grid
                if (cardGrid && cardGrid.parentNode) {
                    cardGrid.parentNode.insertBefore(placeholder, cardGrid);
                } else {
                    firstCard.parentNode.insertBefore(placeholder, firstCard);
                }
            } else {
                // Fallback: If it's an empty category with no cards, tuck it under the H1
                const pageTitle = document.querySelector('h1');
                if (pageTitle && pageTitle.parentNode) {
                    pageTitle.parentNode.insertBefore(placeholder, pageTitle.nextSibling);
                } else {
                    let backupContainer = document.querySelector('.page_content, main') || document.body;
                    backupContainer.insertBefore(placeholder, backupContainer.firstChild);
                }
            }
            
            placeholder.querySelector('#kersten-wizard-trigger').addEventListener('click', function() { loadWizardLogic(placeholder); }, { once: true });
        }
    };
    


    // --- 6. DYNAMIC SCHEMA ENGINE ---

    const injectDynamicSchema = () => {

        if (!isAttachmentPage) return;

        const pageTitle = document.title;

        const pageH1 = document.querySelector('h1') ? document.querySelector('h1').innerText : "";

        const combinedText = (pageTitle + " " + pageH1).toLowerCase();

        const compatibleVehicles = [];

        const allDBs = { ...commonVehicles, ...winterOnlyVehicles };



        Object.keys(allDBs).forEach(brand => {

            Object.keys(allDBs[brand]).forEach(model => {

                const vehicleData = allDBs[brand][model];

                ['sweeping', 'winter', 'weedbrush'].forEach(mode => {

                    if (!vehicleData[mode]) return;

                    ['front', 'rear'].forEach(pos => {

                        const fitment = vehicleData[mode][pos];

                        if (fitment && fitment.machine) {

                            const cleanMachine = fitment.machine.split('(')[0].trim().toLowerCase();

                            if (combinedText.includes(cleanMachine) && cleanMachine.length > 3) {

                                compatibleVehicles.push({

                                    "@type": "Product",

                                    "name": `${brand} ${model}`,

                                    "brand": { "@type": "Brand", "name": brand }

                                });

                            }

                        }

                    });

                });

            });

        });



        const uniqueVehicles = Array.from(new Set(compatibleVehicles.map(v => JSON.stringify(v)))).map(s => JSON.parse(s));

        if (uniqueVehicles.length === 0) return;



        const schemaData = {

            "@context": "https://schema.org/",

            "@type": "Product",

            "name": pageH1 || pageTitle,

            "brand": { "@type": "Brand", "name": "Kersten" },

            "description": (document.querySelector('meta[name="description"]') ? document.querySelector('meta[name="description"]').content : "") || `Professional attachment compatible with ${uniqueVehicles.length} tractor models.`,

            "isAccessoryOrSparePartFor": uniqueVehicles

        };



        const script = document.createElement('script');

        script.type = "application/ld+json";

        script.text = JSON.stringify(schemaData);

        document.head.appendChild(script);

    };



    injectWizard();


    injectDynamicSchema();

    setInterval(() => { injectWizard(); }, 2000);



})();





  /* ================================================================= */

    /* [O] ORPHAN BRIDGE: PARENT MACHINE LINKER (v131.0 - BREAKOUT)      */

    /* ================================================================= */

    const injectParentMachineBridge = function() {

        const machineHubs = [

            { id: "k1500", keys: ["k1500", "k 1500", "1500 series"], url: "/kersten-k-series" },

            { id: "k2100", keys: ["k2100", "k 2100", "2100 series"], url: "/kersten-k-series" },

            { id: "ubs", keys: ["ubs", "hydro 9", "hydro 13", "hydro 16", "alpin"], url: "/Kersten-UBS-Series" },

            { id: "weedbrush", keys: ["weedbrush", "weed brush", "wkb", "weedo"], url: "/weed-brush" },

            { id: "sweeper", keys: ["sweeper", "km 45", "km 52", "fkm", "hkm", "collector"], url: "/sweepers" },

            { id: "snow", keys: ["snow", "plough", "spreader", "winter"], url: "/winter-equipment" },

            { id: "hycut", keys: ["hycut", "remote", "mower"], url: "/grass-cutting-equipment" },

            { id: "hoaf", keys: ["hoaf", "thermal", "burner"], url: "/hoaf-thermal-weed-control" },

            { id: "zasso", keys: ["zasso", "electric", "zap"], url: "/Zasso-weed-electrocution-equipment" },

            { id: "rippa", keys: ["ripagreen", "ripa", "lance"], url: "/Ripagreen-Thermal-Weed-Management-Kits" },

            { id: "matev", keys: ["matev", "trailer", "box"], url: "/search-by-manufacturer/matev-products" }

        ];



        const currentText = (document.title + " " + (document.querySelector('h1')?.innerText || "")).toLowerCase();

        const currentPath = window.location.pathname;



        const parentMatch = machineHubs.find(hub => 

            hub.keys.some(k => currentText.includes(k)) && 

            !currentPath.includes(hub.url) &&

            currentPath !== hub.url

        );



        if (parentMatch) {

            const isDeepPage = currentPath.split('/').length > 2 || 

                               currentText.includes('manual') || 

                               currentText.includes('parts') || 

                               currentText.includes('consumable') ||

                               currentText.includes('instruction');



            if (isDeepPage && !document.querySelector('.orphan-bridge-link')) {

                const bridgeDiv = document.createElement('div');

                bridgeDiv.className = 'orphan-bridge-link';

                

                // STYLE UPDATE: Force Full Width using "Breakout" technique

                bridgeDiv.style.cssText = "width: 100vw; position: relative; left: 50%; right: 50%; margin-left: -50vw; margin-right: -50vw; margin-top: 40px; margin-bottom: 20px; padding: 30px 0; background: #f0f7f4; border-top: 1px dashed #004d26; border-bottom: 1px dashed #004d26; font-family: sans-serif; text-align: center; clear: both; box-sizing: border-box;";

                

                bridgeDiv.innerHTML = `

                    <div style="max-width: 800px; margin: 0 auto; padding: 0 15px;">

                        <div style="font-weight:800; color:#004d26; margin-bottom:8px; font-size:14px; text-transform:uppercase; letter-spacing:1px;">

                            🚜 Machine Series Identified

                        </div>

                        <div style="font-size:14px; color:#555; margin-bottom:20px; line-height:1.5;">

                            This technical document belongs to the <strong>${parentMatch.keys[0].toUpperCase().replace('UBS', 'Kersten UBS').replace('K1500', 'Kersten K-Series')}</strong> range.

                        </div>

                        <a href="${parentMatch.url}" style="display:inline-block; background:#004d26; color:white; padding:10px 25px; border-radius:30px; text-decoration:none; font-weight:bold; font-size:13px; transition: all 0.2s;">

                            View Main Machine Series &rarr;

                        </a>

                    </div>

                `;



                // TARGETING FIX: Hunt for the FOOTER

                const footerTarget = document.querySelector('footer, .layout-footer, #footer, .footer-section');

                

                if (footerTarget) {

                    footerTarget.parentNode.insertBefore(bridgeDiv, footerTarget);

                } else {

                    document.body.appendChild(bridgeDiv);

                }

                

                console.log("Orphan Bridge: Linked " + currentPath + " to " + parentMatch.url);

            }

        }

    };

    

    // Trigger slightly later to ensure DOM is ready

    setTimeout(injectParentMachineBridge, 1500);
    
    


 /* --- [M] DYNAMIC FOOTER LINK INJECTOR (Site-Wide Authority Boost - 2 Rows) --- */
(function() {
    setTimeout(function() {
        // 1. Find the Main Container (Parent of the link rows)
        const footerContainer = document.querySelector('footer .footer-grouped-links');
        if (!footerContainer) return;

       // Remove previously injected footer rows so the latest link list is used
document
    .querySelectorAll(
        '.kersten-footer-seo-row, .kersten-footer-seo-row-hubs'
    )
    .forEach(function (row) {
        row.remove();
    });

        // SECTION 1: Fitment Guides (Cleanly distributed across categories)
        const priorityLinks = [
            // Kubota
            { text: "Kubota B1 / B2 Attachments", url: "/Attachments-for-Kubota-B-Series" },
            { text: "Kubota F-Series Attachments", url: "/Attachments-for-Kubota-F-Series" },
            { text: "Kubota BX Series Attachments", url: "/Attachments-for-Kubota-BX-Series" },
            // John Deere
            { text: "John Deere 1-Series Attachments", url: "/Attachments-for-John-Deere-1-Series" },
            { text: "John Deere X-Series Attachments", url: "/Attachments-for-John-Deere-X300-X500" },
            { text: "John Deere Gator Attachments", url: "/Attachments-for-John-Deere-Gator" },
            // Iseki
            { text: "Iseki SXG Attachments", url: "/Attachments-for-Iseki-SXG-323-326-Series" },
            { text: "Iseki TXGS Attachments", url: "/Attachments-for-Iseki-TXG-Series" },
            { text: "Iseki SF Series Attachments", url: "/Attachments-for-Iseki-SF-Series" },
            // Kioti & Solis
            { text: "Kioti CS Series Attachments", url: "/Attachments-for-Kioti-CS-Series" },
            { text: "Kioti CK Series Attachments", url: "/Attachments-for-Kioti-CK-Series" },
            { text: "Solis 20/26 Attachments", url: "/Compact-Tractor-Attachments-Page" }
        ];

        // SECTION 2: Highly Selective Technical Knowledge & Authority Hubs
        const authorityHubLinks = [
            // Compliance & Directives
            { text: "Weed Management 2026 Council Compliance", url: "/national-action-plan-2025-council-guide" },
            { text: "Integrated Weed Management for Amenity", url: "/integrated-weed-management-for-amenity" },
            { text: "Machine Supply Continuity", url: "/non-chemical-weed-control-supply-continuity" },
            { text: "Book: The Weeds Are Not the Problem", url: "/the-weeds-are-not-the-problem-book" },
        
            
            // Core Equipment Hubs
            { text: "Chemical-Free Weed Control Overview", url: "/search-by-applications/chemical-free-weed-control" },
            { text: "Hard Surface Weed Management", url: "/search-by-applications/detritus-types/weed-management" },
            { text: "Thermal Weed Management Hub", url: "/search-by-applications/Thermal-weed-management" },
            { text: "Mechanical Weed Removal Systems", url: "/Weed-Brushes-and-Mechanical-Weed-Removal" },
            
            // Machinery Classes
            { text: "Hot Water Weeding Machines", url: "/hot-water-weeders" },
            { text: "Hot Air Weeding Machines", url: "/hoaf-thermal-weed-control" },
            { text: "Electric Weeding Machines", url: "/electric-weeders" },
            { text: "Weed Brushes & Sweepers", url: "/weed-brush" },
            { text: "Gravel Path Renovators", url: "/gravel-path-renovator-series" },
            { text: "Kersten Machinery Hire", url: "/kersten-machinery-hire" },

            // Top-Tier High Authority Insights (Curated Selection)
            { text: "The Bracknell Trial Research Data", url: "/blog/Sweeping,%20moss%20and%20weed%20control/bracknell-weed-management-research-update" },
            { text: "The Case for Integrated Weed Management", url: "/blog/Chemical%20Free%20Weed%20Control/why-we-you-need-to-consider-integrated-weed-management" },
            { text: "Learning from Europe's IWM Success", url: "/blog/Chemical%20Free%20Weed%20Control/the-uk-is-about-ten-years-behind-europe-in-weed-management" },
            { text: "Site Maintenance Equipment For All Seasons", url: "/Site-Maintenance-Equipment-for-All-Seasons" }
        ];

        // Shared link styling helper to guarantee high contrast and smooth hovering
        const buildLinkHtml = (links) => links.map(link => `
            <a href="${link.url}" style="color: #ddd; font-size: 13px; line-height: 1.4; text-decoration: none; display: flex; align-items: flex-start; transition: color 0.2s; padding: 2px 0;" onmouseover="this.style.color='#ffcc00'" onmouseout="this.style.color='#ddd'">
                <span style="color: #004d26; margin-right: 8px; font-size: 11px; transform: translateY(1px);">&#10148;</span>
                <span style="flex: 1;">${link.text}</span>
            </a>
        `).join('');

        // 3. Create Row 1: Fitment Guides (Responsive Grid Layout)
        const newRow1 = document.createElement('div');
        newRow1.className = "row kersten-footer-seo-row";
        newRow1.style.cssText = "margin-top: 35px; padding-top: 25px; border-top: 1px solid rgba(255,255,255,0.1); width: 100%;";
        newRow1.innerHTML = `
            <div class="col-12" style="width: 100%;">
                <h5 class="footer-group-label" style="color: #ffcc00 !important; font-size: 15px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 18px;">🚜 Popular Tractor Fitment Guides</h5>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px 20px; width: 100%;">
                    ${buildLinkHtml(priorityLinks)}
                </div>
            </div>
        `;

        // 4. Create Row 2: Authority Hubs & Insights (Responsive Grid Layout)
        const newRow2 = document.createElement('div');
        newRow2.className = "row kersten-footer-seo-row-hubs";
        newRow2.style.cssText = "margin-top: 25px; padding-top: 25px; border-top: 1px dashed rgba(255,255,255,0.1); width: 100%; margin-bottom: 15px;";
        newRow2.innerHTML = `
            <div class="col-12" style="width: 100%;">
                <h5 class="footer-group-label" style="color: #ffcc00 !important; font-size: 15px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 18px;">📚 Technical Knowledge & Authority Hubs</h5>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px 20px; width: 100%;">
                    ${buildLinkHtml(authorityHubLinks)}
                </div>
            </div>
        `;

        // 5. Safely inject into the footer DOM tree
        footerContainer.appendChild(newRow1);
        footerContainer.appendChild(newRow2);
        
        console.log("Kersten SEO: Multi-row fully responsive layout successfully injected.");
    }, 2000);
})();


   

}); // <--- FINAL CLOSING BRACKET OF THE FILE

