function ProductList({
  isAdmin,
  products,
  isLoading,
  startEditing,
  deleteProduct,
}) {
  return (
    <section id={isAdmin ? "admin-products" : "seller-products"}>
      <h2>{isAdmin ? "Product catalog" : "My products"}</h2>

      {isLoading && <p>Loading your products...</p>}
      {!isLoading && products.length === 0 && (
        <p>You haven’t added any products yet.</p>
      )}

      {products.map((product) => (
        <article className="seller-product-card" key={product._id}>
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="seller-product-image"
              loading="lazy"
            />
          ) : (
            <div className="seller-product-image seller-product-image-placeholder">
              No image
            </div>
          )}

          <div className="seller-product-info">
            <h3>{product.name}</h3>
            {isAdmin && (
              <p>Sold by: {product.owner?.name || "Marketplace"}</p>
            )}
            <p>Price: ₹{product.price}</p>
            <p>Stock: {product.stock}</p>
          </div>

          <div className="seller-product-actions">
            <button onClick={() => startEditing(product)}>Edit</button>
            <button onClick={() => deleteProduct(product._id)}>Delete</button>
          </div>
        </article>
      ))}
    </section>
  );
}

export default ProductList;