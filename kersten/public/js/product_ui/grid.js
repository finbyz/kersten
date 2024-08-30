webshop.ProductGrid = class ProductGrid extends webshop.ProductGrid{

    make() {
		let me = this;
		let html = ``;
	
		this.items.forEach(item => {
			let title = item.web_item_name || item.item_name || item.item_code || "";
			title =  title.length > 90 ? title.substr(0, 90) + "..." : title;
	
			// Generate HTML for product grid
			html += `<div class="col-sm-4 item-card"><div class="card text-left">`;
			html += me.get_image_html(item, title);
			html += me.get_card_body_html(item, title, me.settings);
			html += `</div></div>`;
	
			// Generate and insert structured data
			let structuredDataScript = document.createElement('script');
			structuredDataScript.type = 'application/ld+json';
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
            	"price": item.formatted_price ? parseFloat(item.formatted_price.replace(/[^0-9.-]+/g,"")) : 0,
				"url": `/${item.route || '#'}`
			}
		};
		return JSON.stringify(structured_data);
	}
}