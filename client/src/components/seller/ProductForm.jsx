import {
  IconPlus,
  IconEdit,
  IconX,
  IconPackage,
  IconAlertCircle,
  IconCheckCircle,
} from "../common/Icons";

function ProductForm({
  isAdmin,
  editingId,
  formData,
  error,
  message,
  isSaving,
  handleChange,
  handleSubmit,
  resetForm,
  productCategories,
}) {
  return (
    <div className="product-form-layout" id="seller-product-form">
      {/* Left Column: Form inputs */}
      <div className="product-form-card">
        <div className="product-form-header">
          <div>
            <h3>
              {isAdmin
                ? "Admin Product Management"
                : editingId
                ? "Edit Product Details"
                : "Add New Product"}
            </h3>
            <p className="form-subtitle">
              {editingId
                ? "Update your product listing details, pricing, or available inventory."
                : "List a new item to sell in the marketplace."}
            </p>
          </div>

          {editingId && (
            <button
              type="button"
              className="btn-ghost"
              onClick={resetForm}
              title="Cancel editing"
            >
              <IconX size={16} />
              <span>Cancel Edit</span>
            </button>
          )}
        </div>

        {error && (
          <div className="alert-box alert-error" role="alert">
            <IconAlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="alert-box alert-success" role="status">
            <IconCheckCircle size={18} />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="product-editor-form">
          <div className="form-group">
            <label htmlFor="name">Product Title</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="e.g. Wireless Noise-Cancelling Headphones"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Detailed Description</label>
            <textarea
              id="description"
              name="description"
              placeholder="Highlight key materials, dimensions, features, and warranties..."
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="price">Price (₹)</label>
              <input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="2499.00"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="stock">Inventory Stock</label>
              <input
                id="stock"
                name="stock"
                type="number"
                min="0"
                step="1"
                placeholder="25"
                value={formData.stock}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="" disabled>
                  Select product category
                </option>
                {productCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="image">Image Web URL (Optional)</label>
              <input
                id="image"
                name="image"
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={formData.image}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-actions-row">
            {editingId && (
              <button type="button" className="btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            )}

            <button type="submit" className="btn-primary" disabled={isSaving}>
              {editingId ? <IconEdit size={16} /> : <IconPlus size={16} />}
              <span>
                {isSaving
                  ? "Saving Product..."
                  : editingId
                  ? "Save Product Changes"
                  : "Publish Product Listing"}
              </span>
            </button>
          </div>
        </form>
      </div>

      {/* Right Column: Live Card Preview */}
      <div className="product-preview-card-wrap">
        <span className="preview-label">Live Marketplace Preview</span>
        <div className="product-card preview-card-box">
          <div className="product-card-image-box">
            {formData.image ? (
              <img
                src={formData.image}
                alt={formData.name || "Preview"}
                className="product-card-img"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.nextElementSibling.style.display = "flex";
                }}
              />
            ) : null}
            <div
              className="product-card-placeholder"
              style={{ display: formData.image ? "none" : "flex" }}
            >
              <IconPackage size={36} />
              <span>{formData.category || "Sample Category"}</span>
            </div>
            <div className="product-card-badges-top">
              <span className="card-badge-category">
                {formData.category || "Category"}
              </span>
            </div>
          </div>

          <div className="product-card-body">
            <div className="product-seller-meta">
              <span>{isAdmin ? "Sold by Everyday & Co." : "Your Storefront"}</span>
            </div>
            <h4 className="product-card-title">
              {formData.name || "Product Title Preview"}
            </h4>
            <p className="product-card-desc">
              {formData.description ||
                "A brief product description will be showcased here for buyers."}
            </p>
            <div className="product-card-footer">
              <div className="product-price-group">
                <span className="price-currency">₹</span>
                <span className="price-amount">
                  {formData.price ? Number(formData.price).toLocaleString("en-IN") : "0"}
                </span>
              </div>
              <span className="preview-stock-badge">
                Stock: {formData.stock || "0"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductForm;
