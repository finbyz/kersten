webshop.ProductView = class ProductView extends webshop.ProductView{
    prepare_product_area_wrapper(view) {
		let left_margin = view == "list" ? "ml-2" : "";
		let top_margin = view == "list" ? "mt-6" : "mt-minus-1";
		return this.products_section.append(`
			<br>
			<div id="products-${view}-area" class="row products-list ${ top_margin } ${ left_margin }"></div>
		`);
	}
}