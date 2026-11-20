// Standalone Kersten Tech Profiler — mount via #kersten-tech-profiler-root
// Place on product pages (ploughs, spreaders, sweepers, snow blowers, gravel renovators).
// Scrapes specification tables on the page for width/weight/capacity data.

(function() {
    const tractorWidths = [
        { name: 'Solis 20/26', width: 105 },
        { name: 'Kubota BX Series', width: 114 },
        { name: 'John Deere 1-Series', width: 120 },
        { name: 'Iseki TXGS 24', width: 122 },
        { name: 'New Holland Boomer 25', width: 125 },
        { name: 'Kubota B1 Series', width: 127 },
        { name: 'Kubota B2 Series', width: 130 },
        { name: 'John Deere 2-Series', width: 135 },
        { name: 'Kubota LX Series', width: 135 },
        { name: 'Kioti CS Series', width: 118 },
        { name: 'Kioti CX Series', width: 125 },
        { name: 'Kioti CK Series', width: 138 },
        { name: 'Farmtrac 22', width: 105 },
        { name: 'Farmtrac 26', width: 110 },
        { name: 'Iseki TM Series', width: 110 },
        { name: 'Iseki TH Series', width: 130 },
        { name: 'Kubota L1/L2 Series', width: 145 },
        { name: 'John Deere 3-Series', width: 150 },
        { name: 'New Holland Boomer 35/40', width: 150 },
        { name: 'John Deere 4-Series', width: 175 },
        { name: 'Kubota M-Series', width: 190 },
        { name: 'John Deere 5-Series', width: 200 }
    ];

    function clean(str) {
        return (str || '').toLowerCase().replace(/[^a-z0-9\sø]/g, '');
    }

    function detectProductContext(root) {
        const urlContext = window.location.href.toLowerCase();
        const forcedType = (root.dataset.productType || '').toLowerCase();

        return {
            isHeavyDuty: urlContext.includes('snk') || urlContext.includes('fkm') || urlContext.includes('hkm') || urlContext.includes('heavy'),
            isStandard: urlContext.includes('sch') || urlContext.includes('km') || urlContext.includes('light'),
            isPlough: forcedType === 'plough' || urlContext.includes('plough') || urlContext.includes('snow') || urlContext.includes('blade'),
            isSpreader: forcedType === 'spreader' || urlContext.includes('spreader') || urlContext.includes('polaro'),
            isPowerUnit: forcedType === 'power-unit' || urlContext.includes('machine') || (urlContext.includes('hydro') && !urlContext.includes('plough'))
        };
    }

    function harvestSpecs() {
        const specs = { width: 0, weight: 0, capacity: 0, hp: 0, height: 0, features: [] };
        let widthScore = 0;
        const pageTitleRaw = document.title;

        document.querySelectorAll('tr').forEach(row => {
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
            if (valClean.includes('spring') || valClean.includes('trip')) specs.features.push('Spring-Loaded Trip');
            if (valClean.includes('rubber') || valClean.includes('ureth')) specs.features.push('Quiet Urethane Edge');
        });

        if (specs.width === 0) {
            const titleMatch = pageTitleRaw.match(/(\d+)\s*(cm|mm|m)/i);
            if (titleMatch) {
                const num = parseFloat(titleMatch[1]);
                const unit = titleMatch[2].toLowerCase();
                if (unit === 'mm') specs.width = num / 10;
                else if (unit === 'cm') specs.width = num;
                else if (unit === 'm') specs.width = num * 100;
            }
        }

        return specs;
    }

    function buildProfileHtml(specs, context) {
        const { isHeavyDuty, isStandard, isPlough, isSpreader, isPowerUnit } = context;
        let sentA = '';
        let sentB = '';
        let sentC = '';
        let validMatches = [];
        let matchNote = '';
        let badge = '';

        if (isHeavyDuty || specs.weight > 250) {
            badge = '<span style="background:#2c3e50; color:white; padding:4px 10px; border-radius:4px; font-size:11px; font-weight:800; letter-spacing:1px;">🛡️ MUNICIPAL / HEAVY DUTY</span>';
            sentC = '<strong>Series Note:</strong> This is a "Heavy Duty" variant, featuring reinforced chassis components and higher-grade steel for continuous municipal or contracting operations.';
        } else if (isStandard || specs.weight < 250) {
            badge = '<span style="background:#27ae60; color:white; padding:4px 10px; border-radius:4px; font-size:11px; font-weight:800; letter-spacing:1px;">🏡 COMPACT / ESTATE SERIES</span>';
            sentC = '<strong>Series Note:</strong> This "Compact Series" model is optimized for weight-sensitivity, allowing professional performance on smaller tractors without overloading the rear axle.';
        }

        if (!isSpreader && !isPowerUnit && specs.width > 0) {
            const effectiveWidth = isPlough ? Math.round(specs.width * 0.88) : specs.width;
            const minTractorWidth = effectiveWidth - 30;
            const maxTractorWidth = effectiveWidth;

            validMatches = tractorWidths
                .filter(t => t.width >= minTractorWidth && t.width <= maxTractorWidth)
                .map(t => `${t.name} (${t.width}cm)`);

            matchNote = `*Matches based on effective working width of ${effectiveWidth}cm (Ideal Track Width: ${minTractorWidth}-${maxTractorWidth}cm).`;

            if (specs.width <= 140) {
                sentA = `With a working width of <strong>${specs.width}cm</strong>, this model is the definitive "Path-Master," calibrated to clear standard 1.2m UK footpaths.`;
            } else if (specs.width <= 175) {
                sentA = `Spanning <strong>${specs.width}cm</strong>, this unit enters the "Utility Class," designed to mask the wheel track of modern compact tractors (25hp+).`;
            } else {
                sentA = `At <strong>${specs.width}cm</strong>, this machine is built for "Municipal Productivity," covering estate roads rapidly.`;
            }

            if (isPlough) {
                sentA = `<strong>❄️ Winter Clearing Physics:</strong> While the total blade width is <strong>${specs.width}cm</strong>, the effective clearing path when angled (30°) is approximately <strong>${effectiveWidth}cm</strong>.`;
            }
        } else if (isSpreader && specs.capacity > 0) {
            const bags = Math.floor(specs.capacity / 25);
            sentA = `With a hopper capacity of <strong>${specs.capacity} Litres</strong>, this unit accepts approximately <strong>${bags} x 25kg bags</strong> of salt.`;
            badge = '<span style="background:#2980b9; color:white; padding:4px 10px; border-radius:4px; font-size:11px; font-weight:800; letter-spacing:1px;">❄️ WINTER LOGISTICS</span>';
        }

        if (!sentA) return null;

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

        return `
            <div id="dynamic-app-profile" class="kersten-tech-profiler" style="background:#fdfdfd; border-left:4px solid #004d26; border:1px solid #e0e0e0; border-left-width:4px; padding:25px; margin-bottom:25px; border-radius:4px; font-family:'Inter', sans-serif; animation: kerstenTechProfilerFadeIn 0.5s ease-in-out;">
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
            </div>
            <style>@keyframes kerstenTechProfilerFadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }</style>
        `;
    }

    function loadTechProfiler(root) {
        const context = detectProductContext(root);
        const specs = harvestSpecs();

        if (specs.width === 0 && !context.isSpreader && !context.isPowerUnit) {
            root.style.display = 'none';
            return;
        }

        const html = buildProfileHtml(specs, context);
        if (!html) {
            root.style.display = 'none';
            return;
        }

        root.innerHTML = html;
    }

    const mountWidget = () => {
        const root = document.getElementById('kersten-tech-profiler-root');
        if (root && !root.dataset.initialized) {
            root.dataset.initialized = 'true';
            loadTechProfiler(root);
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', mountWidget);
    } else {
        mountWidget();
    }
})();
