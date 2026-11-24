import { useEffect, useState } from "react";
import ProductForm from "./ProductForm";
import ProductList from "./ProductList";
import SellerOrders from "./SellerOrders";
import {
  IconPackage,
  IconShoppingCart,
  IconTag,
  IconPlus,
  IconAlertCircle,
  IconTruck,
} from "../common/Icons";

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
  const [activeTab, setActiveTab] = useState("inventory");
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [sellerOrders, setSellerOrders] = useState([]);
  const [ordersError, setOrdersError] = useState("");
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [isUpdatingOrderStatus, setIsUpdatingOrderStatus] = useState(false);
  const [orderStatusMessage, setOrderStatusMessage] = useState("");

  async function loadMyProducts() {
    setError("");
    try {
      const response = await fetch("http://localhost:5001/api/products/mine", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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
        currentOrders.map((order) => {
          if (order._id !== orderId) return order;
          const updatedItems = order.items.map((item) =>
            String(item.product) === String(productId)
              ? { ...item, status }
              : item
          );
          const allItemsCancelled = updatedItems.every(
            (item) => item.status === "Cancelled"
          );
          const isOrderCancelled =
            order.status === "Cancelled" || allItemsCancelled;

          const updatedSellerTotal = isOrderCancelled
            ? 0
            : updatedItems.reduce(
                (sum, item) =>
                  item.status === "Cancelled"
                    ? sum
                    : sum + item.price * item.quantity,
                0
              );

          return {
            ...order,
            status: allItemsCancelled ? "Cancelled" : order.status,
            items: updatedItems,
            sellerTotal: updatedSellerTotal,
          };
        })
      );

      setOrderStatusMessage("Product order status updated successfully.");
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
  }, [token, isAdmin]);

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
    setActiveTab("form");

    setTimeout(() => {
      const formElement = document.getElementById("seller-product-form");
      if (formElement) {
        formElement.scrollIntoView({ behavior: "smooth", block: "start" });
        const nameInput = document.getElementById("name");
        if (nameInput) {
          nameInput.focus();
        }
      }
    }, 50);
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
        setMessage("Product updated successfully.");
      } else {
        setProducts((currentProducts) => [data, ...currentProducts]);
        setMessage("Product added successfully.");
      }

      resetForm();
      setActiveTab("inventory");
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
      setMessage(data.message || "Product deleted.");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  // Calculate KPIs: Only non-cancelled orders and active items contribute to total revenue
  const activeOrders = sellerOrders.filter(
    (order) => order.status !== "Cancelled"
  );
  const totalRevenue = activeOrders.reduce((sum, order) => {
    const activeItemsRevenue = (order.items || []).reduce(
      (itemSum, item) =>
        item.status === "Cancelled"
          ? itemSum
          : itemSum + item.price * item.quantity,
      0
    );
    return sum + activeItemsRevenue;
  }, 0);
  const lowStockCount = products.filter((p) => p.stock <= 3).length;

  return (
    <div className="seller-dashboard-container">
      {!isAdmin && (
        <>
          {/* Dashboard Header & KPIs */}
          <div className="seller-header-banner">
            <div>
              <h2 className="seller-portal-title">Merchant Hub</h2>
              <p className="seller-portal-subtitle">
                Manage your store catalog, track order dispatch, and monitor sales performance
              </p>
            </div>
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                resetForm();
                setActiveTab("form");
              }}
            >
              <IconPlus size={16} />
              <span>Add New Product</span>
            </button>
          </div>

          {/* Metric KPI Cards */}
          <div className="seller-kpi-grid">
            <div className="kpi-card">
              <div className="kpi-icon-box">
                <IconPackage size={22} />
              </div>
              <div className="kpi-data">
                <span className="kpi-value">{products.length}</span>
                <span className="kpi-label">Active Products</span>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon-box">
                <IconShoppingCart size={22} />
              </div>
              <div className="kpi-data">
                <span className="kpi-value">{activeOrders.length}</span>
                <span className="kpi-label">
                  Active Orders {sellerOrders.length !== activeOrders.length && `(${sellerOrders.length} Total)`}
                </span>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon-box">
                <IconTag size={22} />
              </div>
              <div className="kpi-data">
                <span className="kpi-value">₹{totalRevenue.toLocaleString("en-IN")}</span>
                <span className="kpi-label">Total Revenue</span>
              </div>
            </div>

            <div className={`kpi-card ${lowStockCount > 0 ? "kpi-warning" : ""}`}>
              <div className="kpi-icon-box">
                <IconAlertCircle size={22} />
              </div>
              <div className="kpi-data">
                <span className="kpi-value">{lowStockCount}</span>
                <span className="kpi-label">Low Stock Alerts</span>
              </div>
            </div>
          </div>

          {/* Segmented Navigation Tabs */}
          <div className="seller-segmented-tabs">
            <button
              type="button"
              className={`seller-tab-btn ${activeTab === "inventory" ? "active" : ""}`}
              onClick={() => setActiveTab("inventory")}
            >
              <IconPackage size={17} />
              <span>Inventory & Products ({products.length})</span>
            </button>

            <button
              type="button"
              className={`seller-tab-btn ${activeTab === "form" ? "active" : ""}`}
              onClick={() => setActiveTab("form")}
            >
              <IconPlus size={17} />
              <span>{editingId ? "Edit Product" : "Add Product"}</span>
            </button>

            <button
              type="button"
              className={`seller-tab-btn ${activeTab === "orders" ? "active" : ""}`}
              onClick={() => setActiveTab("orders")}
            >
              <IconTruck size={17} />
              <span>Customer Orders ({sellerOrders.length})</span>
            </button>
          </div>
        </>
      )}

      {/* Tab Panels */}
      {(!isAdmin && activeTab === "form") || isAdmin ? (
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
      ) : null}

      {(!isAdmin && activeTab === "inventory") || isAdmin ? (
        <ProductList
          isAdmin={isAdmin}
          products={products}
          isLoading={isLoading}
          startEditing={startEditing}
          deleteProduct={deleteProduct}
        />
      ) : null}

      {!isAdmin && activeTab === "orders" && (
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
