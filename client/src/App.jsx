import { useState } from "react";
import AdminDashboard from "./components/AdminDashboard";
import AuthForm from "./components/AuthForm";
import CustomerDashboard from "./components/CustomerDashboard";
import SellerDashboard from "./components/SellerDashboard";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");

  function handleAuthSuccess(signedInUser, authToken) {
    setUser(signedInUser);
    setToken(authToken);
  }

  function handleLogout() {
    setUser(null);
    setToken("");
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

      {user.role === "customer" && <CustomerDashboard token={token} />}
      {user.role === "seller" && <SellerDashboard token={token} />}
      {user.role === "admin" && <AdminDashboard token={token} currentUserId={user.id}  />}
    </main>
  );
}

export default App;