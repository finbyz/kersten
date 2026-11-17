// Standalone Kersten Reviews Widget — mount via #kersten-reviews-widget-root
// Optional: data-review-tag="weed|sweeper|winter|all" on root to force category

(function() {
    const reviews = [
        { tag: 'weed', stars: 5, user: 'Matthew Powers', role: 'Veolia UK', text: 'The machine would pay for itself in just 81 miles. Operators reported the effort needed was much less using the Kersten UBS 16 than by hand.' },
        { tag: 'weed', stars: 5, user: 'Scott Coughlan', role: 'Newport City Council', text: 'We are really happy with our K820. It has reduced our reliance on chemical control. We purchased two more machines to stay ahead of restrictions.' },
        { tag: 'sweeper', stars: 5, user: 'Cormac Operations', role: 'Civil Engineering', text: 'The Kersten sweeper proved highly effective in removing moss and debris from pavement edges. Critical for maintaining safe walkways.' },
        { tag: 'sweeper', stars: 5, user: 'John', role: 'Tyne Valley Garden Centre', text: 'We were spending up to 20 hours a week removing moss. I was so impressed with the demonstration, I needed the machine there and then.' },
        { tag: 'winter', stars: 5, user: 'Pocklington Council', role: 'Highways Team', text: 'The best insurance policy we have ever subscribed to. The machine handled the snow clearance very well, keeping footpaths safe.' },
        { tag: 'winter', stars: 5, user: 'Wayne Dawkins', role: 'New Forest District Council', text: 'Probably the best machine investment we have made in the last 5 years. The reliability of the Lehner spreaders is unmatched.' },
        { tag: 'all', stars: 5, user: 'Ian Low', role: 'Mitie Landscapes', text: 'Fantastic bit of machinery. It maintained the artificial pitches in summer, cleared moss with the hard brush, and is now ready for snow.' }
    ];

    function determineFilterTag(root) {
        const forced = (root.dataset.reviewTag || '').toLowerCase();
        if (forced && ['weed', 'sweeper', 'winter', 'all'].includes(forced)) return forced;

        const context = (document.title + ' ' + window.location.pathname).toLowerCase();
        if (context.includes('weed') || context.includes('moss') || context.includes('ubs')) return 'weed';
        if (context.includes('sweeper') || context.includes('clean') || context.includes('fkm')) return 'sweeper';
        if (context.includes('snow') || context.includes('ice') || context.includes('winter')) return 'winter';
        return 'all';
    }

    const loadReviewsWidget = (container) => {
        const filterTag = determineFilterTag(container);
        const selectedReviews = reviews
            .filter(r => r.tag === 'all' || r.tag === filterTag)
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);

        if (selectedReviews.length === 0) {
            container.style.display = 'none';
            return;
        }

        container.className = 'kersten-review-board kersten-reviews-widget';
        container.style.cssText = 'margin: 0; padding: 60px 0; border-top: 1px solid #eee; background: #fff; width: 100%; display: block; clear: both; position: relative; z-index: 5; box-sizing: border-box;';

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
    };

    const mountWidget = () => {
        const root = document.getElementById('kersten-reviews-widget-root');
        if (root && !root.dataset.initialized) {
            root.dataset.initialized = 'true';
            loadReviewsWidget(root);
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', mountWidget);
    } else {
        mountWidget();
    }
})();
