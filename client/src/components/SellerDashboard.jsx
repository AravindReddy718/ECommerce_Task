import { useEffect, useState } from "react";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  category: "",
  image: "",
  stock: "",
};

function SellerDashboard({ token, isAdmin = false }) {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  async function loadMyProducts() {
    setError("");

    try {
      const response = await fetch(
        "http://localhost:5001/api/products/mine",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not load your products");
      }

      setProducts(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadMyProducts();
  }, [token]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  function resetForm() {
    setFormData(emptyForm);
    setEditingId(null);
  }

  function startEditing(product) {
    setFormData({
      name: product.name,
      description: product.description,
      price: String(product.price),
      category: product.category,
      image: product.image || "",
      stock: String(product.stock),
    });
    setEditingId(product._id);
    setError("");
    setMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSaving(true);

    const productData = {
      ...formData,
      price: Number(formData.price),
      stock: Number(formData.stock),
    };

    const url = editingId
      ? `http://localhost:5001/api/products/${editingId}`
      : "http://localhost:5001/api/products";

    try {
      const response = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not save the product");
      }

      if (editingId) {
        setProducts((currentProducts) =>
          currentProducts.map((product) =>
            product._id === data._id ? data : product
          )
        );
        setMessage("Product updated.");
      } else {
        setProducts((currentProducts) => [data, ...currentProducts]);
        setMessage("Product added.");
      }

      resetForm();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteProduct(productId) {
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `http://localhost:5001/api/products/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not delete the product");
      }

      setProducts((currentProducts) =>
        currentProducts.filter((product) => product._id !== productId)
      );
      setMessage(data.message);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <div>
      <section>
        <h2>{isAdmin ? "Admin product management" : "Seller dashboard"}</h2>
        <h3>{editingId ? "Edit product" : "Add a product"}</h3>

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
          <input
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          />

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

      <section>
        <h2>{isAdmin ? "Product catalog" : "My products"}</h2>

        {isLoading && <p>Loading your products...</p>}
        {!isLoading && products.length === 0 && (
          <p>You haven’t added any products yet.</p>
        )}

        {products.map((product) => (
          <article key={product._id}>
            <h3>{product.name}</h3>
            <p>Price: ₹{product.price}</p>
            <p>Stock: {product.stock}</p>
            <button onClick={() => startEditing(product)}>Edit</button>
            <button onClick={() => deleteProduct(product._id)}>Delete</button>
          </article>
        ))}
      </section>
    </div>
  );
}

export default SellerDashboard;