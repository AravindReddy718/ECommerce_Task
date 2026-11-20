import { useEffect, useState } from "react";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  category: "",
  image: "",
  stock: "",
};
const PRODUCT_CATEGORIES = [
  "Clothing",
  "Accessories",
  "Electronics",
  "Home & Kitchen",
  "Footwear",
  "Beauty",
  "Sports & Outdoors",
  "Books",
];

function SellerDashboard({ token, isAdmin = false }) {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [sellerOrders, setSellerOrders] = useState([]); 
  const [ordersError,setOrdersError]= useState("");
  const [isLoadingOrders, setIsLoadingOrders] =useState(true);
  const [isUpdatingOrderStatus, setIsUpdatingOrderStatus] = useState(false);
  const [orderStatusMessage, setOrderStatusMessage] = useState("");

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

  async function loadSellerOrders() {
  try {
    const response = await fetch("http://localhost:5001/api/orders/seller", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Could not load seller orders");
    }

    setSellerOrders(data);
  } catch (requestError) {
    setOrdersError(requestError.message);
  } finally {
    setIsLoadingOrders(false);
  }
  }

  async function updateItemStatus(orderId, productId, status) {
  setOrdersError("");
  setOrderStatusMessage("");
  setIsUpdatingOrderStatus(true);

  try {
    const response = await fetch(
      `http://localhost:5001/api/orders/${orderId}/items/${productId}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Could not update item status");
    }

    setSellerOrders((currentOrders) =>
      currentOrders.map((order) =>
        order._id === orderId
          ? {
              ...order,
              items: order.items.map((item) =>
                String(item.product) === String(productId)
                  ? { ...item, status }
                  : item
              ),
            }
          : order
      )
    );

    setOrderStatusMessage("Product order status updated.");
  } catch (requestError) {
    setOrdersError(requestError.message);
  } finally {
    setIsUpdatingOrderStatus(false);
  }
}


  useEffect(() => {
    loadMyProducts();
  }, [token]);

  useEffect(() => {
    if (!isAdmin) {
      loadSellerOrders();
    }
  }, [token ,isAdmin]);

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

            {PRODUCT_CATEGORIES.map((category) => (
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
      {!isAdmin && (
        <section>
          <h2>Orders for my products</h2>
          {orderStatusMessage && <p>{orderStatusMessage}</p>}

          {ordersError && <p role="alert">{ordersError}</p>}
          {isLoadingOrders && <p>Loading orders...</p>}

          {!isLoadingOrders &&
            !ordersError &&
            sellerOrders.length === 0 && <p>No orders for your products yet.</p>}

          {sellerOrders.map((order) => (
            <article key={order._id}>
              <h3>Order from {order.customerName}</h3>
              <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
              <p>Your portion of order: ₹{order.sellerTotal}</p>

              {order.items.map((item) => (
                <div key={`${order._id}-${item.product}`}>
                  <p>
                    {item.name} × {item.quantity}
                  </p>
                  <p>Current status: {item.status || order.status || "Pending"}</p>

                  <label htmlFor={`status-${order._id}-${item.product}`}>
                    Update status
                  </label>
                  <select
                    id={`status-${order._id}-${item.product}`}
                    value={item.status || order.status || "Pending"}
                    onChange={(event) =>
                      updateItemStatus(order._id, item.product, event.target.value)
                    }
                    disabled={isUpdatingOrderStatus}
                  >
                    <option value="Pending" disabled>
                      Pending
                    </option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              ))}
            </article>
          ))}
        </section>
      )}

    </div>
  );
}

export default SellerDashboard;