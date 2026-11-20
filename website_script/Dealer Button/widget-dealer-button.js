// Standalone Dealer Button — mount via #kersten-dealer-button-root
// Optional: data-dealer-url on root to override link destination

(function() {
    const loadDealerButton = (container) => {
        const dealerUrl = container.dataset.dealerUrl
            || '/Kersten-Stocking-Dealers-Hire-Partners-and-Contractors';

        container.className = 'kersten-dealer-locator';
        container.style.cssText = 'margin: 20px 0; clear: both; display: block; box-sizing: border-box; width: 100%;';

        container.innerHTML = `
            <a href="${dealerUrl}"
               style="display: block; background: #004d26; color: #fff; text-align: center; padding: 16px 20px; border-radius: 8px; text-decoration: none; font-weight: 800; font-size: 15px; font-family: sans-serif; box-shadow: 0 4px 10px rgba(0, 77, 38, 0.2); transition: transform 0.2s ease, box-shadow 0.2s ease;"
               onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 15px rgba(0, 77, 38, 0.3)';"
               onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 10px rgba(0, 77, 38, 0.2)';">
                📍 Find a Local Stocking Dealer or Hire Partner &rarr;
            </a>
        `;
    };

    const mountWidget = () => {
        const root = document.getElementById('kersten-dealer-button-root');
        if (root && !root.dataset.initialized) {
            root.dataset.initialized = 'true';
            loadDealerButton(root);
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', mountWidget);
    } else {
        mountWidget();
    }
})();
