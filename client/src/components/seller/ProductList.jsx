import { useState } from "react";
import {
  IconEdit,
  IconTrash,
  IconSearch,
  IconPackage,
} from "../common/Icons";

function ProductList({
  isAdmin,
  products,
  isLoading,
  startEditing,
  deleteProduct,
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = products.filter((p) => {
    return (
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="seller-inventory-container" id={isAdmin ? "admin-products" : "seller-products"}>
      <div className="inventory-header-row">
        <div>
          <h3>{isAdmin ? "Global Product Catalog" : "Product Inventory"}</h3>
          <p className="inventory-subtitle">
            {isAdmin
              ? "Oversee, edit, or remove all live listings across merchants"
              : `Manage your ${products.length} live marketplace listings`}
          </p>
        </div>

        <div className="inventory-filter-group">
          <div className="input-with-icon" style={{ minWidth: "220px" }}>
            <span className="input-icon-left">
              <IconSearch size={16} />
            </span>
            <input
              type="text"
              placeholder="Search listings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="catalog-loading-state">
          <div className="spinner-ring" />
          <p>Loading your product listings...</p>
        </div>
      )}

      {!isLoading && products.length === 0 && (
        <div className="catalog-empty-state">
          <div className="empty-icon-circle">
            <IconPackage size={44} />
          </div>
          <h3>No products in your catalog</h3>
          <p>You haven't listed any items for sale yet. Add your first product above!</p>
        </div>
      )}

      {!isLoading && products.length > 0 && filtered.length === 0 && (
        <div className="catalog-empty-state">
          <h3>No matching inventory items found</h3>
          <p>Try searching for a different keyword or resetting filters.</p>
        </div>
      )}

      <div className="seller-products-table-wrap">
        {filtered.map((product) => {
          const isLowStock = product.stock <= 3 && product.stock > 0;
          const isOutOfStock = product.stock <= 0;

          return (
            <article className="seller-product-item-card" key={product._id}>
              <div className="seller-item-thumbnail">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.nextElementSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className="seller-thumbnail-placeholder"
                  style={{ display: product.image ? "none" : "flex" }}
                >
                  <IconPackage size={24} />
                </div>
              </div>

              <div className="seller-item-details">
                <div className="seller-item-meta-row">
                  <span className="seller-cat-tag">{product.category}</span>
                  {isAdmin && (
                    <span className="seller-owner-tag">
                      Sold by: {product.owner?.role === "admin" ? "Everyday & Co." : (product.owner?.name || "Everyday & Co.")}
                    </span>
                  )}
                </div>

                <h4 className="seller-item-title">{product.name}</h4>
                <p className="seller-item-desc">{product.description}</p>
              </div>

              <div className="seller-item-metrics">
                <div className="metric-box">
                  <span className="metric-label">Price</span>
                  <span className="metric-val price">
                    ₹{Number(product.price).toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="metric-box">
                  <span className="metric-label">Stock</span>
                  <span
                    className={`metric-val stock-val ${
                      isOutOfStock ? "out" : isLowStock ? "low" : "ok"
                    }`}
                  >
                    {product.stock} {isOutOfStock ? "(Out)" : isLowStock ? "(Low)" : "units"}
                  </span>
                </div>
              </div>

              <div className="seller-item-actions">
                <button
                  type="button"
                  className="btn-secondary item-action-btn"
                  onClick={() => startEditing(product)}
                  title="Edit Product"
                >
                  <IconEdit size={16} />
                  <span>Edit</span>
                </button>

                <button
                  type="button"
                  className="btn-ghost item-action-btn-danger"
                  onClick={() => {
                    if (
                      window.confirm(
                        `Are you sure you want to delete "${product.name}"? This action cannot be undone.`
                      )
                    ) {
                      deleteProduct(product._id);
                    }
                  }}
                  title="Delete Product"
                >
                  <IconTrash size={16} />
                  <span>Delete</span>
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export default ProductList;
