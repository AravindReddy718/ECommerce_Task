function ProductCatalog({
  products,
  error,
  filteredProducts,
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  productCategories,
  isLoadingProducts,
  cart,
  addToCart,
}) {
  return (
    <section className="product-catalog">
      <h2>Products</h2>

      <div className="product-filters">
        <input
          type="search"
          placeholder="Search products"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />

        <select
          value={selectedCategory}
          onChange={(event) => setSelectedCategory(event.target.value)}
        >
          <option value="All">All categories</option>
          {productCategories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {isLoadingProducts && <p>Loading products...</p>}
      {!isLoadingProducts && products.length === 0 && !error && (
        <p>No products found.</p>
      )}

      <div className="product-grid">
        {filteredProducts.map((product) => {
          const cartItem = cart.find((item) => item._id === product._id);
          const quantityInCart = cartItem ? cartItem.quantity : 0;

          return (
            <article className="product-card" key={product._id}>
              {product.image && (
                <img
                  src={product.image}
                  alt={product.name}
                  className="product-image"
                  loading="lazy"
                />
              )}

              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <p>Category: {product.category}</p>
              <p>Sold by: {product.owner?.name || "Marketplace"}</p>
              <p>Price: ₹{product.price}</p>
              <p>{product.stock > 0 ? "In stock" : "Out of stock"}</p>

              <button
                onClick={() => addToCart(product)}
                disabled={quantityInCart >= product.stock}
              >
                {product.stock === 0
                  ? "Out of stock"
                  : quantityInCart > 0
                    ? "Added to cart"
                    : "Add to cart"}
              </button>
            </article>
          );
        })}
      </div>

      {products.length > 0 && filteredProducts.length === 0 && (
        <p>No products match your search or category.</p>
      )}
    </section>
  );
}

export default ProductCatalog;