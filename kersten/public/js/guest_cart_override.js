frappe.provide("webshop.webshop.shopping_cart");

(function () {
    const STORAGE_KEY = "kersten_pending_cart_item";
    const LAST_VISITED_KEY = "last_visited";

    console.log("[Kersten] Guest Cart Override script loaded.");

    // Resolve a human-readable item name from the page for a given item code.
    // The cart API only echoes back the item_code, so we capture the name from
    // the DOM at click time and carry it through to the post-login message.
    function getItemName(item_code, btn) {
        // 1. From the clicked button's own card (listing / wishlist).
        if (btn) {
            const card = btn.closest(".item-card, .wishlist-card");
            if (card) {
                const t = card.querySelector(".product-title");
                if (t && t.textContent.trim()) return t.textContent.trim();
            }
        }
        // 2. Product detail page has a single titled name element.
        const detail = document.querySelector(".product-title[itemprop='name'], .product-title");
        if (detail && detail.textContent.trim()) return detail.textContent.trim();
        // 3. Fallback: find any element carrying this item code and look for a nearby title.
        if (item_code) {
            const els = document.querySelectorAll("[data-item-code]");
            for (const el of els) {
                if (el.dataset.itemCode === item_code) {
                    const card = el.closest(".item-card, .wishlist-card");
                    const t = card && card.querySelector(".product-title");
                    if (t && t.textContent.trim()) return t.textContent.trim();
                }
            }
        }
        return null;
    }

    function saveGuestIntent(opts) {
        try {
            // opts can be a single item or an array of items
            let itemsToSave = Array.isArray(opts) ? opts : [opts];

            // map them to ensure correct format
            let intentArray = itemsToSave.map(item => ({
                item_code: item.item_code,
                item_name: item.item_name || getItemName(item.item_code, item.btn),
                qty: item.qty || 1,
                additional_notes: item.additional_notes,
                with_items: item.with_items || 0
            }));

            localStorage.setItem(STORAGE_KEY, JSON.stringify(intentArray));
            localStorage.setItem(LAST_VISITED_KEY, window.location.pathname);
            console.log("[Kersten] Saved pending cart items for guest:", intentArray);
        } catch (e) {
            console.error("[Kersten] Could not write to localStorage:", e);
        }
    }

    function redirectToLogin() {
        frappe.call('webshop.webshop.api.get_guest_redirect_on_action').then((res) => {
            window.location.href = res.message || "/login";
        });
    }

    // --- 1. Intercept the click itself, on document, in the CAPTURE phase.
    document.addEventListener("click", function (e) {
        if (frappe.session.user !== "Guest") return;

        // Check for Add All to Cart button
        const addAllBtn = e.target.closest("#btn-add-all-to-cart, .btn-add-all-to-cart");
        if (addAllBtn) {
            console.log("[Kersten] Guest clicked Add All to Cart, intercepting.");
            e.stopImmediatePropagation();
            e.preventDefault();

            const items = [];
            const seen = {};
            document.querySelectorAll(".btn-add-to-cart-list[data-item-code]:not(.go-to-cart):not(.go-to-cart-grid):not(.hidden)").forEach(function (el) {
                const code = el.dataset.itemCode;
                if (code && !seen[code]) {
                    seen[code] = true;
                    items.push({ item_code: code, item_name: getItemName(code, el), qty: 1 });
                }
            });

            if (items.length > 0) {
                saveGuestIntent(items);
                redirectToLogin();
            } else {
                frappe.show_alert({
                    message: __("No items available to add."),
                    indicator: "orange",
                });
            }
            return;
        }

        // Check for individual Add to Cart buttons
        const btn = e.target.closest(".btn-add-to-cart, [data-action='btn_add_to_cart'], .btn-add-to-cart-list");
        if (!btn) return;

        console.log("[Kersten] Guest clicked Add to Cart, intercepting.", btn);

        const item_code = btn.dataset.itemCode || window.item_code;
        let qty = 1;
        const qtyInput = document.querySelector("#item-spinner .cart-qty, .cart-qty");
        if (qtyInput && qtyInput.value) qty = qtyInput.value;

        // Stop this click from ever reaching webshop's own delegated handler.
        e.stopImmediatePropagation();
        e.preventDefault();

        saveGuestIntent({ item_code, qty, btn });
        redirectToLogin();
    }, true); // true = capture phase

    // --- 2. Fallback: also patch update_cart directly
    function applyOverride() {
        const cart = webshop.webshop.shopping_cart;
        if (!cart || !cart.update_cart) {
            setTimeout(applyOverride, 300);
            return;
        }
        if (cart._kersten_overridden) return;

        const original_update_cart = cart.update_cart;
        cart.update_cart = function (opts) {
            console.log("[Kersten] update_cart called for user:", frappe.session.user, opts);
            if (frappe.session.user === "Guest") {
                saveGuestIntent(opts);
                redirectToLogin();
                return;
            }
            return original_update_cart.call(cart, opts);
        };
        cart._kersten_overridden = true;
        console.log("[Kersten] update_cart patched as fallback.");
    }
    applyOverride();

    // --- 3. On login, re-add the pending item(s).
    function checkPendingCart() {
        if (!frappe.session.user || frappe.session.user === "Guest") return;

        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            console.log("[Kersten] No pending cart item found for logged-in user.");
            return;
        }
        localStorage.removeItem(STORAGE_KEY); // clear immediately to avoid loops

        let pendingArray;
        try {
            pendingArray = JSON.parse(raw);
            // Handle legacy format (single object)
            if (!Array.isArray(pendingArray)) {
                pendingArray = [pendingArray];
            }
        } catch (e) {
            console.error("[Kersten] Corrupt pending cart item, discarding.", e);
            return;
        }

        if (pendingArray.length === 0) return;

        function process() {
            const cart = webshop.webshop.shopping_cart;
            if (!cart || !cart.update_cart) {
                setTimeout(process, 300);
                return;
            }

            console.log("[Kersten] Re-adding pending items after login:", pendingArray);

            let added = 0;
            let failed = 0;
            let added_items = [];

            const processNext = (index) => {
                if (index >= pendingArray.length) {
                    // All done
                    if (added > 0) {
                        let itemList = added_items.map(name => `<b>${name}</b>`).join(", ");
                        let msg = __("{0} successfully added to the cart.", [itemList]);
                        if (failed > 0) {
                            msg += "<br><span class='text-muted'>" + __("{0} items failed.", [failed]) + "</span>";
                        }

                        frappe.msgprint({
                            title: __('Added to Cart'),
                            message: msg,
                            indicator: 'green'
                        });
                        cart.set_cart_count(true);
                    }
                    return;
                }

                const pending = pendingArray[index];
                cart.update_cart({
                    item_code: pending.item_code,
                    qty: pending.qty || 1,
                    additional_notes: pending.additional_notes,
                    with_items: pending.with_items,
                    callback: function (r) {
                        if (!r.exc) {
                            added++;
                            // item_name was captured from the page at click time;
                            // fall back to item_code only if it wasn't available.
                            added_items.push(pending.item_name || pending.item_code);
                        } else {
                            failed++;
                            console.error("[Kersten] Error adding pending item:", r.exc);
                        }
                        processNext(index + 1);
                    }
                });
            };

            processNext(0);
        }
        process();
    }

    frappe.ready(checkPendingCart);
})();