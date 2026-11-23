import { useEffect, useState } from "react";
import ProductForm from "./ProductForm";
import ProductList from "./ProductList";
import SellerOrders from "./SellerOrders";
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
    <div className="seller-dashboard">
      {!isAdmin && (
        <nav className="seller-nav" aria-label="Seller dashboard">
          <a href="#seller-product-form">Product Form</a>
          <a href="#seller-products">My Products</a>
          <a href="#seller-orders">My Orders</a>
        </nav>
      )}

      {!isAdmin && (
        <h2 className="seller-dashboard-title">Seller dashboard</h2>
      )}

      <ProductForm
        isAdmin={isAdmin}
        editingId={editingId}
        formData={formData}
        error={error}
        message={message}
        isSaving={isSaving}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        resetForm={resetForm}
        productCategories={PRODUCT_CATEGORIES}
      />

      <ProductList
        isAdmin={isAdmin}
        products={products}
        isLoading={isLoading}
        startEditing={startEditing}
        deleteProduct={deleteProduct}
      />

        {!isAdmin && (
          <SellerOrders
            sellerOrders={sellerOrders}
            ordersError={ordersError}
            isLoadingOrders={isLoadingOrders}
            orderStatusMessage={orderStatusMessage}
            isUpdatingOrderStatus={isUpdatingOrderStatus}
            updateItemStatus={updateItemStatus}
          />
        )}

    </div>
  );
}

export default SellerDashboard;