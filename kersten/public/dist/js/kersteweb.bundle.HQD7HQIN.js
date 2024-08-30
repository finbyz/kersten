(() => {
  // ../kersten/kersten/public/js/product_ui/views.js
  webshop.ProductView = class ProductView extends webshop.ProductView {
    constructor(options) {
      Object.assign(this, options);
      this.preference = this.view_type;
      this.make();
    }
    prepare_product_area_wrapper(view) {
      console.log("prepare_product_area_wrapper");
      let left_margin = view == "list" ? "ml-2" : "";
      let top_margin = view == "list" ? "mt-6" : "mt-minus-1";
      return this.products_section.append(`
			<br>
			<div id="products-${view}-area" class="row products-list ${top_margin} ${left_margin}"></div>
		`);
    }
  };
})();
//# sourceMappingURL=kersteweb.bundle.HQD7HQIN.js.map
