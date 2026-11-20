// Diversify logic into constituent widgets

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