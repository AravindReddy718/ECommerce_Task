import { useState, useEffect } from "react";
import AdminDashboard from "./components/admin/AdminDashboard";
import AuthForm from "./components/AuthForm";
import ChangePasswordForm from "./components/ChangePasswordForm";
import CustomerDashboard from "./components/customer/CustomerDashboard";
import SellerDashboard from "./components/seller/SellerDashboard";
import Navbar from "./components/common/Navbar";
import Modal from "./components/common/Modal";
import { ToastProvider } from "./components/common/Toast";
import { IconClock, IconKey, IconLogOut } from "./components/common/Icons";

import "./styles/shared.css";
import "./styles/auth.css";
import "./styles/customer.css";
import "./styles/seller.css";
import "./styles/admin.css";

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

function getSavedCart(userId) {
  if (!userId) return [];
  try {
    const saved = localStorage.getItem(`ecommerce-cart-${userId}`);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function App() {
  const [auth, setAuth] = useState(() => getSavedAuth());
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [customerActivePage, setCustomerActivePage] = useState("home");
  const { user, token } = auth;

  // Cart state persisted per user
  const userId = user ? user.id || user._id : null;
  const [cart, setCart] = useState(() => getSavedCart(userId));

  useEffect(() => {
    if (userId) {
      localStorage.setItem(`ecommerce-cart-${userId}`, JSON.stringify(cart));
    }
  }, [cart, userId]);

  function handleAuthSuccess(signedInUser, authToken) {
    localStorage.setItem("user", JSON.stringify(signedInUser));
    localStorage.setItem("token", authToken);
    const newUserId = signedInUser.id || signedInUser._id;
    setCart(getSavedCart(newUserId));
    setAuth({ user: signedInUser, token: authToken });
  }

  function handleLogout() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setAuth({ user: null, token: "" });
    setCart([]);
  }

  // Not logged in: Show Auth page
  if (!user) {
    return (
      <ToastProvider>
        <main>
          <AuthForm onAuthSuccess={handleAuthSuccess} />
        </main>
      </ToastProvider>
    );
  }

  // Pending Seller Approval Screen
  if (user.role === "seller" && !user.sellerApproved) {
    return (
      <ToastProvider>
        <main className="app-main">
          <div className="seller-pending-container animate-fade-in">
            <div className="seller-pending-icon">
              <IconClock size={36} />
            </div>
            <h1 className="seller-pending-title">Seller Application Under Review</h1>
            <p className="seller-pending-desc">
              Welcome, <strong>{user.name}</strong>! Your merchant account application has been received and is currently being verified by a platform administrator. Once approved, you will have complete access to manage products and fulfill orders.
            </p>

            <div className="seller-pending-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowChangePassword(true)}
              >
                <IconKey size={16} />
                <span>Change Password</span>
              </button>

              <button
                type="button"
                className="btn-danger"
                onClick={handleLogout}
              >
                <IconLogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>

            <Modal
              isOpen={showChangePassword}
              onClose={() => setShowChangePassword(false)}
              title="Change Account Password"
            >
              <ChangePasswordForm
                token={token}
                onClose={() => setShowChangePassword(false)}
              />
            </Modal>
          </div>
        </main>
      </ToastProvider>
    );
  }

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <ToastProvider>
      <Navbar
        user={user}
        cartCount={totalCartCount}
        onLogout={handleLogout}
        onOpenChangePassword={() => setShowChangePassword(true)}
        activePage={customerActivePage}
        setActivePage={setCustomerActivePage}
      />

      <main className="app-main">
        {user.role === "customer" && (
          <CustomerDashboard
            token={token}
            userId={userId}
            cart={cart}
            setCart={setCart}
            activePage={customerActivePage}
            setActivePage={setCustomerActivePage}
          />
        )}

        {user.role === "seller" && (
          <SellerDashboard token={token} />
        )}

        {user.role === "admin" && (
          <AdminDashboard token={token} currentUserId={user.id || user._id} />
        )}
      </main>

      {/* Global Change Password Modal */}
      <Modal
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        title="Change Account Password"
      >
        <ChangePasswordForm
          token={token}
          onClose={() => setShowChangePassword(false)}
        />
      </Modal>
    </ToastProvider>
  );
}

export default App;
