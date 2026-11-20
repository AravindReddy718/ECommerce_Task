import { useEffect, useState } from "react";
import CheckoutForm from "./CheckoutForm";
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

function CustomerDashboard({ token, userId }) {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem(`ecommerce-cart-${userId}`);
      const parsedCart = savedCart ? JSON.parse(savedCart) : [];
      return Array.isArray(parsedCart) ? parsedCart : [];
    } catch {
      return [];
    }
  });
  const [lastOrder, setLastOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [orderHistoryError, setOrderHistoryError] = useState("");
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [activePage, setActivePage] = useState("home");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    localStorage.setItem(
      `ecommerce-cart-${userId}`,
      JSON.stringify(cart)
    );
  }, [cart, userId]);

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch("http://localhost:5001/api/products");

        if (!response.ok) {
          throw new Error("Could not load products");
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

  loadOrders();
}, [token]);

  function addToCart(product) {
    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) => item._id === product._id
      );

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
    <div>
      {error && <p role="alert">{error}</p>}
      <nav>
        <button onClick={() => setActivePage("home")}>Home</button>
        <button onClick={() => setActivePage("cart")}>
          Cart ({cart.length})
        </button>
        <button onClick={() => setActivePage("orders")}>My Orders</button>
      </nav>

      {activePage === "home" && (
      <section>
        <h2>Products</h2>
        <input
          type="search"
          placeholder="Search products"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />

        <select
          value={selectedCategory}
          onChange={(event) => setSelectedCategory(event.target.value)}
        >
          <option value="All">All categories</option>
          {PRODUCT_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        {isLoadingProducts && <p>Loading products...</p>}
        {!isLoadingProducts && products.length === 0 && !error && (
          <p>No products found.</p>
        )}

        {filteredProducts.map((product) => {
          const cartItem = cart.find((item) => item._id === product._id);
          const quantityInCart = cartItem ? cartItem.quantity : 0;

          return (
            <article key={product._id}>
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <p>Category: {product.category}</p>
              <p>Sold by: {product.owner?.name || "Marketplace"}</p>
              <p>Price: ₹{product.price}</p>
              <p>{product.stock > 0 ? "In stock" : "Out of stock"}</p>
              <button
                onClick={() => addToCart(product)}
                disabled={quantityInCart >= product.stock}
              >
                {product.stock === 0
                  ? "Out of stock"
                  : quantityInCart > 0
                    ? "Added to cart"
                    : "Add to cart"}
              </button>
            </article>
          );
        })}

         {products.length > 0 && filteredProducts.length === 0 && (
        <p>No products match your search or category.</p>
      )}

      </section>
      )}

     
      {activePage === "cart" && (
        <>
          <section>
            <h2>Cart</h2>

        {cart.length === 0 && <p>Your cart is empty.</p>}

        {cart.map((item) => (
          <article key={item._id}>
            <p>
              {item.name} — ₹{item.price} each
            </p>
            <button onClick={() => changeQuantity(item._id, -1)}>
              Remove one
            </button>
            <span> Quantity: {item.quantity} </span>
            <button
              onClick={() => {
                if (item.quantity < item.stock) {
                  changeQuantity(item._id, 1);
                }
              }}
              disabled={item.quantity >= item.stock}
            >
              Add one
            </button>
          </article>
        ))}

        <p>Total: ₹{cartTotal}</p>
      </section>
       

      <CheckoutForm
        cart={cart}
        token={token}
        onOrderPlaced={handleOrderPlaced}
      />

      {lastOrder && (
        <section>
          <h2>Order placed</h2>
          <p>Order ID: {lastOrder._id}</p>
          <p>Status: {lastOrder.status}</p>
          <p>Total: ₹{lastOrder.total}</p>
        </section>
      )}
       </>
    )}
    {activePage === "orders" && (
      <section>
        <h2>My orders</h2>

        {orderHistoryError && <p role="alert">{orderHistoryError}</p>}
        {isLoadingOrders && <p>Loading order history...</p>}

        {!isLoadingOrders && orders.length === 0 && !orderHistoryError && (
          <p>You haven’t placed any orders yet.</p>
        )}

        {orders.map((order) => (
          <article key={order._id}>
            <h3>Order {order._id}</h3>
            <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
            <p>Status: {order.status}</p>
            <p>Total: ₹{order.total}</p>
            <p>Delivery address: {order.shippingAddress}</p>

            {order.items.map((item) => (
            <div key={`${order._id}-${item.product}`}>
              <p>
                {item.name} × {item.quantity}
              </p>
              <p>Item status: {item.status || order.status || "Pending"}</p>
            </div>
          ))}
          </article>
        ))}
      </section>
    )}
    </div>
  );
}

export default CustomerDashboard;