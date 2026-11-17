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
        specificationTableRows.forEach(function (row) {
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
                if (lowerKey.includes('width')) widthCm = lowerVal.includes('mm') ? rawNum / 10 : (lowerVal.includes('m') && !lowerVal.includes('cm') ? rawNum * 100 : rawNum);
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