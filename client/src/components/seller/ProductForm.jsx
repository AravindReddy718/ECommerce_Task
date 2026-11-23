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
    <section id="seller-product-form">
    <h2>
      {isAdmin
        ? "Admin product management"
        : editingId
          ? "Edit product"
          : "Add a product"}
    </h2>

      {error && <p role="alert">{error}</p>}
      {message && <p>{message}</p>}

      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Product name</label>
        <input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
        />

        <label htmlFor="price">Price</label>
        <input
          id="price"
          name="price"
          type="number"
          min="0"
          step="0.01"
          value={formData.price}
          onChange={handleChange}
          required
        />

        <label htmlFor="category">Category</label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
        >
          <option value="" disabled>
            Select a category
          </option>

          {productCategories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <label htmlFor="image">Image URL</label>
        <input
          id="image"
          name="image"
          type="url"
          value={formData.image}
          onChange={handleChange}
        />

        <label htmlFor="stock">Stock</label>
        <input
          id="stock"
          name="stock"
          type="number"
          min="0"
          step="1"
          value={formData.stock}
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={isSaving}>
          {isSaving
            ? "Saving..."
            : editingId
              ? "Save changes"
              : "Add product"}
        </button>

        {editingId && (
          <button type="button" onClick={resetForm}>
            Cancel edit
          </button>
        )}
      </form>
    </section>
  );
}

export default ProductForm;