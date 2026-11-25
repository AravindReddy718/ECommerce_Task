import { useState, useEffect } from "react";
import AdminDashboard from "./components/admin/AdminDashboard";
import AuthForm from "./components/AuthForm";
import LandingPage from "./components/landing/LandingPage";
import ChangePasswordForm from "./components/ChangePasswordForm";
import CustomerDashboard from "./components/customer/CustomerDashboard";
import SellerDashboard from "./components/seller/SellerDashboard";
import Navbar from "./components/common/Navbar";
import Modal from "./components/common/Modal";
import { ToastProvider } from "./components/common/Toast";
import { IconClock, IconKey, IconLogOut } from "./components/common/Icons";

import "./styles/shared.css";
import "./styles/landing.css";
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

function parseCurrentRoute() {
  const path = window.location.pathname.toLowerCase();
  if (path === "/login") {
    return { view: "auth", mode: "login" };
  }
  if (path === "/signup" || path === "/register") {
    return { view: "auth", mode: "register" };
  }
  if (path === "/forgot-password") {
    return { view: "auth", mode: "forgot-password" };
  }
  if (path === "/reset-password") {
    return { view: "auth", mode: "reset-password" };
  }
  if (path === "/landing") {
    return { view: "landing", mode: "login" };
  }
  // Default root '/'
  return { view: "root", mode: "login" };
}

function App() {
  const [auth, setAuth] = useState(() => getSavedAuth());
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [customerActivePage, setCustomerActivePage] = useState("home");
  const [route, setRoute] = useState(() => parseCurrentRoute());
  const { user, token } = auth;

  // Listen to browser popstate (back/forward buttons)
  useEffect(() => {
    function handlePopState() {
      setRoute(parseCurrentRoute());
    }
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Cart state persisted per user
  const userId = user ? user.id || user._id : null;
  const [cart, setCart] = useState(() => getSavedCart(userId));

  useEffect(() => {
    if (userId) {
      localStorage.setItem(`ecommerce-cart-${userId}`, JSON.stringify(cart));
    }
  }, [cart, userId]);

  function navigateTo(path, newRoute) {
    window.history.pushState({}, "", path);
    setRoute(newRoute);
  }

  function handleNavigateToAuth(mode = "login", initialRole = "customer") {
    const path = mode === "register" ? "/register" : "/login";
    navigateTo(path, { view: "auth", mode, initialRole });
  }

  function handleBackToLanding() {
    navigateTo("/", { view: "landing", mode: "login" });
  }

  function handleGoToDashboard() {
    navigateTo("/dashboard", { view: "dashboard", mode: "login" });
  }

  function handleAuthSuccess(signedInUser, authToken) {
    localStorage.setItem("user", JSON.stringify(signedInUser));
    localStorage.setItem("token", authToken);
    const newUserId = signedInUser.id || signedInUser._id;
    setCart(getSavedCart(newUserId));
    setAuth({ user: signedInUser, token: authToken });
    navigateTo("/dashboard", { view: "dashboard", mode: "login" });
  }

  function handleLogout() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setAuth({ user: null, token: "" });
    setCart([]);
    navigateTo("/", { view: "landing", mode: "login" });
  }

  // Determine whether to show Landing Page:
  // 1. Explicitly on /landing, OR
  // 2. Not logged in and on root '/' or route.view is 'landing'
  const isLandingView =
    route.view === "landing" ||
    (!user && route.view !== "auth");

  if (isLandingView) {
    return (
      <ToastProvider>
        <LandingPage
          user={user}
          onNavigateToAuth={handleNavigateToAuth}
          onGoToDashboard={handleGoToDashboard}
        />
      </ToastProvider>
    );
  }

  // Not logged in: Show Auth page (login or register)
  if (!user) {
    return (
      <ToastProvider>
        <main>
          <AuthForm
            onAuthSuccess={handleAuthSuccess}
            initialMode={route.mode}
            initialRole={route.initialRole || "customer"}
            onBackToLanding={handleBackToLanding}
          />
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
        onViewLanding={() => navigateTo("/landing", { view: "landing", mode: "login" })}
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