import { useEffect, useState } from "react";
import CartPage from "./CartPage";
import OrderHistory from "./OrderHistory";
import ProductCatalog from "./ProductCatalog";

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

function CustomerDashboard({
  token,
  cart,
  setCart,
  activePage = "home",
}) {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [lastOrder, setLastOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [orderHistoryError, setOrderHistoryError] = useState("");
  const [orderHistoryMessage, setOrderHistoryMessage] = useState("");
  const [cancelingOrderId, setCancelingOrderId] = useState("");
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch("http://localhost:5001/api/products");

        if (!response.ok) {
          throw new Error("Could not load products catalog");
        }

        const data = await response.json();
        setProducts(data);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setIsLoadingProducts(false);
      }
    }

    loadProducts();
  }, []);

  useEffect(() => {
    async function loadOrders() {
      try {
        const response = await fetch("http://localhost:5001/api/orders/mine", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not load order history");
        }

        setOrders(data);
      } catch (requestError) {
        setOrderHistoryError(requestError.message);
      } finally {
        setIsLoadingOrders(false);
      }
    }

    if (token) {
      loadOrders();
    }
  }, [token]);

  function addToCart(product) {
    setCart((currentCart) => {
      const existingItem = currentCart.find((item) => item._id === product._id);

      if (existingItem) {
        if (existingItem.quantity >= product.stock) {
          return currentCart;
        }

        return currentCart.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      if (product.stock < 1) {
        return currentCart;
      }

      return [...currentCart, { ...product, quantity: 1 }];
    });
  }

  function changeQuantity(productId, change) {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item._id === productId
            ? { ...item, quantity: item.quantity + change }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function handleOrderPlaced(order) {
    setLastOrder(order);
    setCart([]);
    setOrders((currentOrders) => [order, ...currentOrders]);
  }

  async function handleCancelOrder(orderId) {
    setOrderHistoryError("");
    setOrderHistoryMessage("");
    setCancelingOrderId(orderId);

    try {
      const response = await fetch(
        `http://localhost:5001/api/orders/${orderId}/cancel`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not cancel the order");
      }

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order._id === orderId ? data.order : order
        )
      );
      setOrderHistoryMessage(data.message || "Order cancelled successfully.");
    } catch (requestError) {
      setOrderHistoryError(requestError.message);
    } finally {
      setCancelingOrderId("");
    }
  }

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const filteredProducts = products.filter((product) => {
    const search = searchTerm.trim().toLowerCase();

    const matchesSearch = [
      product.name,
      product.description,
      product.category,
    ].some((value) => value?.toLowerCase().includes(search));

    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="customer-dashboard-root">
      {activePage === "home" && (
        <ProductCatalog
          products={products}
          error={error}
          filteredProducts={filteredProducts}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          productCategories={PRODUCT_CATEGORIES}
          isLoadingProducts={isLoadingProducts}
          cart={cart}
          addToCart={addToCart}
        />
      )}

      {activePage === "cart" && (
        <CartPage
          cart={cart}
          changeQuantity={changeQuantity}
          cartTotal={cartTotal}
          token={token}
          handleOrderPlaced={handleOrderPlaced}
          lastOrder={lastOrder}
        />
      )}

      {activePage === "orders" && (
        <OrderHistory
          orders={orders}
          orderHistoryError={orderHistoryError}
          orderHistoryMessage={orderHistoryMessage}
          isLoadingOrders={isLoadingOrders}
          onCancelOrder={handleCancelOrder}
          cancelingOrderId={cancelingOrderId}
        />
      )}
    </div>
  );
}

export default CustomerDashboard;
