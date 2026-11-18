import { useEffect, useState } from "react";
import AdminPanel from "./components/AdminPanel";
import AuthForm from "./components/AuthForm";
import CheckoutForm from "./components/CheckoutForm";
import "./App.css";

function App() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [lastOrder, setLastOrder] = useState(null);
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  

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

  function handleAuthSuccess(signedInUser, authToken) {
    setUser(signedInUser);
    setToken(authToken);
    setError("");
  }

  function handleLogout() {
    setUser(null);
    setToken("");
    setCart([]);
  }

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

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (!user) {
    return (
      <main>
        <AuthForm onAuthSuccess={handleAuthSuccess} />
      </main>
    );
  }

  if (user.role === "seller" && !user.sellerApproved) {
    return (
      <main>
        <h1>Seller application pending</h1>
        <p>
          You are signed in, but an admin must approve your seller account
          before you can manage products.
        </p>
        <button onClick={handleLogout}>Log out</button>
      </main>
    );
  }

  function handleOrderPlaced(order) {
    setLastOrder(order);
    setCart([]);
  }
  return (
    <main>
      <header>
        <h1>My Online Shop</h1>
        <p>
          Signed in as {user.name} ({user.role})
        </p>
        <button onClick={handleLogout}>Log out</button>
      </header>
      {user.role === "admin" && <AdminPanel token={token} />}
      {error && <p role="alert">{error}</p>}

      <section>
        <h2>Products</h2>

        {isLoadingProducts && <p>Loading products...</p>}
        {!isLoadingProducts && products.length === 0 && !error && (
          <p>No products found.</p>
        )}

        {products.map((product) => {
          const cartItem = cart.find((item) => item._id === product._id);
          const quantityInCart = cartItem ? cartItem.quantity : 0;

          return (
            <article key={product._id}>
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <p>Category: {product.category}</p>
              <p>Price: ₹{product.price}</p>
              <p>In stock: {product.stock}</p>
              <button
                onClick={() => addToCart(product)}
                disabled={quantityInCart >= product.stock}
              >
                Add to cart
              </button>
            </article>
          );
        })}
      </section>
      {user.role === "customer" && (
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
      )}
      {user.role === "customer" && (
        <CheckoutForm
          cart={cart}
          token={token}
          onOrderPlaced={handleOrderPlaced}
        />
      )}

      {lastOrder && (
        <section>
          <h2>Order placed</h2>
          <p>Order ID: {lastOrder._id}</p>
          <p>Status: {lastOrder.status}</p>
          <p>Total: ₹{lastOrder.total}</p>
        </section>
      )}
    </main>
  );
}

export default App;