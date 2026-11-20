import { useState } from "react";
import AdminDashboard from "./components/AdminDashboard";
import AuthForm from "./components/AuthForm";
import CustomerDashboard from "./components/CustomerDashboard";
import SellerDashboard from "./components/SellerDashboard";
import "./App.css";

function getSavedAuth() {
  const token = localStorage.getItem("token");
  const savedUser = localStorage.getItem("user");

  if (!token || !savedUser) {
    return { user: null, token: "" };
  }

  try {
    return { user: JSON.parse(savedUser), token };
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return { user: null, token: "" };
  }
}

function App() {
  const [auth, setAuth] = useState(() => getSavedAuth());
  const { user, token } = auth;

  function handleAuthSuccess(signedInUser, authToken) {
    localStorage.setItem("user", JSON.stringify(signedInUser));
    localStorage.setItem("token", authToken);
    setAuth({ user: signedInUser, token: authToken });
  }
  function handleLogout() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setAuth({ user: null, token: "" });
  }

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
        <section>
          <h1>Seller application pending</h1>
          <p>An admin must approve your seller account before you can manage products.</p>
          <button onClick={handleLogout}>Log out</button>
        </section>
      </main>
    );
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

      {user.role === "customer" && <CustomerDashboard token={token} userId={user.id || user._id}  />}
      {user.role === "seller" && <SellerDashboard token={token} />}
      {user.role === "admin" && <AdminDashboard token={token} currentUserId={user.id}  />}
    </main>
  );
}

export default App;