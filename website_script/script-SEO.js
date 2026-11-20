
// FRAPPE READY - everything after this was in a Frappe ready function

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


/* --- DELAYED INTELLIGENCE BLOCK (Data Scrapers & Master Entity Weld) --- */
/* This waits 4.0s for ERPNext to stabilize, then scrapes and injects */
setTimeout(function () {
    updateCTAByPrice();
    adjustForMobile();

    // 6. QUANTITATIVE MACHINE SPECIFICATION & LOGISTICS ENGINE (v123.0)
    let machineQuantitativeSpecs = [];
    let specificMachineWeightKg = 0;
    let machineWidthCm = 0;
    let machineNoiseLevelDb = 0;
    let generatedFaqs = [];

    const technicalTableRows = document.querySelectorAll('table tr, .specification-row, .product-spec-item, .tech-data-row');
    technicalTableRows.forEach(function (row) {
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
}, 2500); // Main Shell Delay



