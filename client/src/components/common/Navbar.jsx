import { useState } from "react";
import {
  IconShoppingBag,
  IconShoppingCart,
  IconKey,
  IconLogOut,
  IconChevronDown,
  IconStore,
  IconShield,
  IconPackage,
} from "./Icons";

function Navbar({ user, cartCount = 0, onLogout, onOpenChangePassword, activePage, setActivePage }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const roleLabel = {
    customer: "Customer",
    seller: "Merchant Seller",
    admin: "Platform Admin",
  }[user.role] || user.role;

  const roleBadgeClass = {
    customer: "badge-customer",
    seller: "badge-seller",
    admin: "badge-admin",
  }[user.role] || "badge-customer";

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        <div className="navbar-brand" onClick={() => setActivePage?.("home")}>
          <div className="brand-logo-icon">
            <IconShoppingBag size={22} />
          </div>
          <div className="brand-text-group">
            <span className="brand-title">Everyday & Co.</span>
            <span className="brand-subtitle">Curated Living</span>
          </div>
        </div>

        {user.role === "customer" && setActivePage && (
          <nav className="navbar-nav-links" aria-label="Main Navigation">
            <button
              type="button"
              className={`nav-tab-btn ${activePage === "home" ? "active" : ""}`}
              onClick={() => setActivePage("home")}
            >
              <IconStore size={16} />
              <span>Explore</span>
            </button>
            <button
              type="button"
              className={`nav-tab-btn ${activePage === "cart" ? "active" : ""}`}
              onClick={() => setActivePage("cart")}
            >
              <span className="nav-cart-wrapper">
                <IconShoppingCart size={16} />
                {cartCount > 0 && <span className="cart-badge-bubble">{cartCount}</span>}
              </span>
              <span>Cart</span>
            </button>
            <button
              type="button"
              className={`nav-tab-btn ${activePage === "orders" ? "active" : ""}`}
              onClick={() => setActivePage("orders")}
            >
              <IconPackage size={16} />
              <span>My Orders</span>
            </button>
          </nav>
        )}

        <div className="navbar-actions">
          <div className="user-profile-menu">
            <button
              type="button"
              className="user-profile-trigger"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              aria-expanded={isDropdownOpen}
            >
              <div className="user-avatar-circle">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="user-info-text">
                <span className="user-display-name">{user.name}</span>
                <span className={`user-role-pill ${roleBadgeClass}`}>
                  {user.role === "admin" && <IconShield size={11} />}
                  {user.role === "seller" && <IconStore size={11} />}
                  {roleLabel}
                </span>
              </div>
              <IconChevronDown
                size={16}
                className={`dropdown-chevron ${isDropdownOpen ? "rotated" : ""}`}
              />
            </button>

            {isDropdownOpen && (
              <>
                <div
                  className="dropdown-overlay"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="user-dropdown-panel animate-fade-in">
                  <div className="dropdown-user-header">
                    <p className="dropdown-user-name">{user.name}</p>
                    <p className="dropdown-user-email">{user.email}</p>
                  </div>

                  <div className="dropdown-divider" />

                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onOpenChangePassword();
                    }}
                  >
                    <IconKey size={16} />
                    <span>Change Password</span>
                  </button>

                  <div className="dropdown-divider" />

                  <button
                    type="button"
                    className="dropdown-item dropdown-item-danger"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onLogout();
                    }}
                  >
                    <IconLogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
