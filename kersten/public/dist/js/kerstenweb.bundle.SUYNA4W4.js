(() => {
  // ../kersten/kersten/public/js/product_ui/views.js
  webshop.ProductView = class ProductView extends webshop.ProductView {
    prepare_product_area_wrapper(view) {
      let left_margin = view == "list" ? "ml-2" : "";
      let top_margin = view == "list" ? "mt-6" : "mt-minus-1";
      return this.products_section.append(`
			<br>
			<div id="products-${view}-area" class="row products-list ${top_margin} ${left_margin}"></div>
		`);
    }
  };

  // ../kersten/kersten/public/js/product_ui/grid.js
  webshop.ProductGrid = class ProductGrid extends webshop.ProductGrid {
    make() {
      let me = this;
      let html = ``;
      this.items.forEach((item) => {
        let title = item.web_item_name || item.item_name || item.item_code || "";
        title = title.length > 90 ? title.substr(0, 90) + "..." : title;
        html += `<div class="col-sm-4 item-card"><div class="card text-left">`;
        html += me.get_image_html(item, title);
        html += me.get_card_body_html(item, title, me.settings);
        html += `</div></div>`;
        let structuredDataScript = document.createElement("script");
        structuredDataScript.type = "application/ld+json";
        structuredDataScript.text = me.get_structured_data(item);
        document.head.appendChild(structuredDataScript);
      });
      let $product_wrapper = this.products_section;
      $product_wrapper.append(html);
    }
    get_structured_data(item) {
      let structured_data = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": item.web_item_name || item.item_name || item.item_code || "",
        "image": window.location.href + item.website_image || "",
        "description": item.description || "",
        "sku": item.item_code || "",
        "offers": {
          "@type": "Offer",
          "priceCurrency": item.currency || "USD",
          "price": item.formatted_price ? parseFloat(item.formatted_price.replace(/[^0-9.-]+/g, "")) : 0,
          "url": `/${item.route || "#"}`
        }
      };
      return JSON.stringify(structured_data);
    }
  };

  // ../kersten/kersten/public/js/guest_cart_override.js
  frappe.provide("webshop.webshop.shopping_cart");
  (function() {
    const STORAGE_KEY = "kersten_pending_cart_item";
    const LAST_VISITED_KEY = "last_visited";
    console.log("[Kersten] Guest Cart Override script loaded.");
    function getItemName(item_code, btn) {
      if (btn) {
        const card = btn.closest(".item-card, .wishlist-card");
        if (card) {
          const t = card.querySelector(".product-title");
          if (t && t.textContent.trim())
            return t.textContent.trim();
        }
      }
      const detail = document.querySelector(".product-title[itemprop='name'], .product-title");
      if (detail && detail.textContent.trim())
        return detail.textContent.trim();
      if (item_code) {
        const els = document.querySelectorAll("[data-item-code]");
        for (const el of els) {
          if (el.dataset.itemCode === item_code) {
            const card = el.closest(".item-card, .wishlist-card");
            const t = card && card.querySelector(".product-title");
            if (t && t.textContent.trim())
              return t.textContent.trim();
          }
        }
      }
      return null;
    }
    function saveGuestIntent(opts) {
      try {
        let itemsToSave = Array.isArray(opts) ? opts : [opts];
        let intentArray = itemsToSave.map((item) => ({
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
      frappe.call("webshop.webshop.api.get_guest_redirect_on_action").then((res) => {
        window.location.href = res.message || "/login";
      });
    }
    document.addEventListener("click", function(e) {
      if (frappe.session.user !== "Guest")
        return;
      const addAllBtn = e.target.closest("#btn-add-all-to-cart, .btn-add-all-to-cart");
      if (addAllBtn) {
        console.log("[Kersten] Guest clicked Add All to Cart, intercepting.");
        e.stopImmediatePropagation();
        e.preventDefault();
        const items = [];
        const seen = {};
        document.querySelectorAll(".btn-add-to-cart-list[data-item-code]:not(.go-to-cart):not(.go-to-cart-grid):not(.hidden)").forEach(function(el) {
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
            indicator: "orange"
          });
        }
        return;
      }
      const btn = e.target.closest(".btn-add-to-cart, [data-action='btn_add_to_cart'], .btn-add-to-cart-list");
      if (!btn)
        return;
      console.log("[Kersten] Guest clicked Add to Cart, intercepting.", btn);
      const item_code = btn.dataset.itemCode || window.item_code;
      let qty = 1;
      const qtyInput = document.querySelector("#item-spinner .cart-qty, .cart-qty");
      if (qtyInput && qtyInput.value)
        qty = qtyInput.value;
      e.stopImmediatePropagation();
      e.preventDefault();
      saveGuestIntent({ item_code, qty, btn });
      redirectToLogin();
    }, true);
    function applyOverride() {
      const cart = webshop.webshop.shopping_cart;
      if (!cart || !cart.update_cart) {
        setTimeout(applyOverride, 300);
        return;
      }
      if (cart._kersten_overridden)
        return;
      const original_update_cart = cart.update_cart;
      cart.update_cart = function(opts) {
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
    function checkPendingCart() {
      if (!frappe.session.user || frappe.session.user === "Guest")
        return;
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        console.log("[Kersten] No pending cart item found for logged-in user.");
        return;
      }
      localStorage.removeItem(STORAGE_KEY);
      let pendingArray;
      try {
        pendingArray = JSON.parse(raw);
        if (!Array.isArray(pendingArray)) {
          pendingArray = [pendingArray];
        }
      } catch (e) {
        console.error("[Kersten] Corrupt pending cart item, discarding.", e);
        return;
      }
      if (pendingArray.length === 0)
        return;
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
            if (added > 0) {
              let itemList = added_items.map((name) => `<b>${name}</b>`).join(", ");
              let msg = __("{0} successfully added to the cart.", [itemList]);
              if (failed > 0) {
                msg += "<br><span class='text-muted'>" + __("{0} items failed.", [failed]) + "</span>";
              }
              frappe.msgprint({
                title: __("Added to Cart"),
                message: msg,
                indicator: "green"
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
            callback: function(r) {
              if (!r.exc) {
                added++;
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
})();
//# sourceMappingURL=kerstenweb.bundle.SUYNA4W4.js.map
