import { useState, useMemo } from "react";
import ProductQuickViewModal from "./ProductQuickViewModal";
import {
  IconSearch,
  IconShoppingCart,
  IconCheck,
  IconEye,
  IconPackage,
  IconSparkles,
  IconX,
} from "../common/Icons";

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
  const [sortBy, setSortBy] = useState("featured");
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const categoryCounts = useMemo(() => {
    const counts = { All: products.length };
    productCategories.forEach((cat) => {
      counts[cat] = products.filter((p) => p.category === cat).length;
    });
    return counts;
  }, [products, productCategories]);


  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    if (sortBy === "price-low") {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === "name-asc") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "in-stock") {
      list.sort((a, b) => b.stock - a.stock);
    }
    return list;
  }, [filteredProducts, sortBy]);

  return (
    <div className="catalog-wrapper">

      <section className="catalog-hero-banner">
        <div className="hero-content-col">
          <div className="hero-pill-badge">
            <IconSparkles size={14} />
            <span>Curated Collection • Everyday & Co.</span>
          </div>
          <h1 className="hero-headline">
            Curated For The Modern Everyday <br />
            <span className="hero-highlight">Crafted To Endure</span>
          </h1>
          <p className="hero-subtext">
            Explore timeless home essentials, lifestyle goods, apothecary, and everyday apparel from verified independent makers.
          </p>
        </div>
        <div className="hero-visual-col">
          <div className="hero-stats-badge">
            <span className="hero-stat-number">{products.length}+</span>
            <span className="hero-stat-label">Unique Products</span>
          </div>
          <div className="hero-stats-badge">
            <span className="hero-stat-number">100%</span>
            <span className="hero-stat-label">Buyer Protection</span>
          </div>
        </div>
      </section>

      <div className="category-scroll-container">
        <button
          type="button"
          className={`category-pill-btn ${selectedCategory === "All" ? "active" : ""}`}
          onClick={() => setSelectedCategory("All")}
        >
          <span>All Items</span>
          <span className="pill-count">{categoryCounts["All"] || 0}</span>
        </button>
        {productCategories.map((category) => (
          <button
            key={category}
            type="button"
            className={`category-pill-btn ${selectedCategory === category ? "active" : ""}`}
            onClick={() => setSelectedCategory(category)}
          >
            <span>{category}</span>
            <span className="pill-count">{categoryCounts[category] || 0}</span>
          </button>
        ))}
      </div>


      <div className="catalog-toolbar">
        <div className="toolbar-search-box input-with-icon">
          <span className="input-icon-left">
            <IconSearch size={18} />
          </span>
          <input
            type="text"
            placeholder="Search by product name, category, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              className="input-action-right"
              onClick={() => setSearchTerm("")}
              aria-label="Clear search"
            >
              <IconX size={16} />
            </button>
          )}
        </div>

        <div className="toolbar-sort-box">
          <label htmlFor="sort-select" className="sort-label">
            Sort by:
          </label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-dropdown"
          >
            <option value="featured">Featured / Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="in-stock">Highest Stock</option>
            <option value="name-asc">Alphabetical (A - Z)</option>
          </select>
        </div>
      </div>


      <div className="catalog-results-header">
        <p className="catalog-results-count">
          Showing <strong>{sortedProducts.length}</strong> {sortedProducts.length === 1 ? "product" : "products"}
          {selectedCategory !== "All" && ` in ${selectedCategory}`}
          {searchTerm && ` matching "${searchTerm}"`}
        </p>
      </div>


      {isLoadingProducts && (
        <div className="catalog-loading-state">
          <div className="spinner-ring" />
          <p>Curating catalog products for you...</p>
        </div>
      )}

      {error && (
        <div className="alert-box alert-error">
          <p>{error}</p>
        </div>
      )}


      {!isLoadingProducts && products.length === 0 && !error && (
        <div className="catalog-empty-state">
          <div className="empty-icon-circle">
            <IconPackage size={44} />
          </div>
          <h3>No products in marketplace yet</h3>
          <p>Sellers are currently setting up their storefronts. Check back shortly!</p>
        </div>
      )}

      {!isLoadingProducts && products.length > 0 && sortedProducts.length === 0 && (
        <div className="catalog-empty-state">
          <div className="empty-icon-circle">
            <IconSearch size={44} />
          </div>
          <h3>No matching products found</h3>
          <p>Try refining your search keyword or clearing the category filter.</p>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("All");
            }}
          >
            Reset Filters
          </button>
        </div>
      )}


      <div className="product-grid">
        {sortedProducts.map((product) => {
          const cartItem = cart.find((item) => item._id === product._id);
          const quantityInCart = cartItem ? cartItem.quantity : 0;
          const isOutOfStock = product.stock <= 0;
          const isMaxInCart = quantityInCart >= product.stock;

          return (
            <article className="product-card" key={product._id}>

              <div className="product-card-image-box">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="product-card-img"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.nextElementSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className="product-card-placeholder"
                  style={{ display: product.image ? "none" : "flex" }}
                >
                  <IconPackage size={36} />
                  <span>{product.category}</span>
                </div>


                <div className="product-card-badges-top">
                  <span className="card-badge-category">{product.category}</span>
                  {product.stock <= 3 && product.stock > 0 && (
                    <span className="card-badge-stock-warning">Only {product.stock} left</span>
                  )}
                  {isOutOfStock && (
                    <span className="card-badge-out-of-stock">Sold Out</span>
                  )}
                </div>

                <button
                  type="button"
                  className="card-quick-view-btn"
                  onClick={() => setQuickViewProduct(product)}
                  title="Quick View"
                >
                  <IconEye size={16} />
                  <span>Quick View</span>
                </button>
              </div>


              <div className="product-card-body">
                <div className="product-seller-meta">
                  <span>Sold by {product.owner?.role === "admin" ? "Everyday & Co." : (product.owner?.name || "Everyday & Co.")}</span>
                </div>

                <h3
                  className="product-card-title"
                  title={product.name}
                  onClick={() => setQuickViewProduct(product)}
                >
                  {product.name}
                </h3>

                <p className="product-card-desc">{product.description}</p>

                <div className="product-card-footer">
                  <div className="product-price-group">
                    <span className="price-currency">₹</span>
                    <span className="price-amount">
                      {Number(product.price).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <button
                    type="button"
                    className={`product-add-cart-btn ${quantityInCart > 0 ? "in-cart" : ""}`}
                    onClick={() => addToCart(product)}
                    disabled={isOutOfStock || isMaxInCart}
                    aria-label={`Add ${product.name} to cart`}
                  >
                    {isOutOfStock ? (
                      <span>Sold Out</span>
                    ) : isMaxInCart ? (
                      <span>Max in Cart ({quantityInCart})</span>
                    ) : quantityInCart > 0 ? (
                      <>
                        <IconCheck size={16} />
                        <span>In Cart ({quantityInCart})</span>
                      </>
                    ) : (
                      <>
                        <IconShoppingCart size={16} />
                        <span>Add</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>


      {quickViewProduct && (
        <ProductQuickViewModal
          product={quickViewProduct}
          isOpen={Boolean(quickViewProduct)}
          onClose={() => setQuickViewProduct(null)}
          onAddToCart={addToCart}
          cartQuantity={
            cart.find((item) => item._id === quickViewProduct._id)?.quantity || 0
          }
        />
      )}
    </div>
  );
}

export default ProductCatalog;
