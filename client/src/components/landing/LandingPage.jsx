import {
  IconShoppingBag,
  IconShoppingCart,
  IconTruck,
  IconShieldCheck,
  IconStore,
  IconArrowRight,
  IconSparkles,
  IconTag,
  IconPackage,
} from "../common/Icons";

export default function LandingPage({ onNavigateToAuth, user, onGoToDashboard }) {
  const categories = [
    {
      name: "Clothing & Linen",
      tagline: "Pure natural fibres & timeless silhouettes",
      tag: "Best Sellers",
      icon: <IconShoppingBag size={22} />,
      color: "#d97706",
    },
    {
      name: "Home & Kitchen",
      tagline: "Handcrafted ceramics, stoneware & kitchenware",
      tag: "Artisanal",
      icon: <IconPackage size={22} />,
      color: "#c25e1a",
    },
    {
      name: "Daily Accessories",
      tagline: "Full-grain leather wallets, bags & carry goods",
      tag: "Handmade",
      icon: <IconTag size={22} />,
      color: "#b45309",
    },
    {
      name: "Independent Sellers",
      tagline: "Boutique brands & curated local makers",
      tag: "Community",
      icon: <IconStore size={22} />,
      color: "#9a3412",
    },
  ];

  return (
    <div className="ecom-landing">


      {/* Main Navigation */}
      <header className="ecom-header">
        <div className="ecom-header-inner">
          <div
            className="ecom-brand"
            onClick={() => (user && onGoToDashboard ? onGoToDashboard() : onNavigateToAuth("login"))}
          >
            <div className="ecom-brand-logo">
              <IconShoppingBag size={22} />
            </div>
            <div className="ecom-brand-text">
              <span className="ecom-brand-name">Everyday & Co.</span>
              <span className="ecom-brand-tagline">Curated Goods</span>
            </div>
          </div>

          <nav className="ecom-nav-links">
            <button
              type="button"
              className="ecom-nav-link"
              onClick={() => onNavigateToAuth("login")}
            >
              Collections
            </button>
            <button
              type="button"
              className="ecom-nav-link"
              onClick={() => onNavigateToAuth("login")}
            >
              Featured Goods
            </button>
            <button
              type="button"
              className="ecom-nav-link"
              onClick={() => onNavigateToAuth("register", "seller")}
            >
              Sell With Us
            </button>
          </nav>

          <div className="ecom-header-actions">
            {user ? (
              <button
                type="button"
                className="ecom-btn-primary"
                onClick={onGoToDashboard}
              >
                <span>Go to Dashboard</span>
                <IconArrowRight size={16} />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="ecom-btn-ghost"
                  onClick={() => onNavigateToAuth("login")}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  className="ecom-btn-primary"
                  onClick={() => onNavigateToAuth("register")}
                >
                  <span>Start Shopping</span>
                  <IconArrowRight size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="ecom-main">
        <section className="ecom-hero-section">
          {/* Ambient Warm Glows */}
          <div className="ecom-glow-1" aria-hidden="true" />
          <div className="ecom-glow-2" aria-hidden="true" />

          <div className="ecom-hero-container">
            {/* Left Hero Content */}
            <div className="ecom-hero-content">
              <div className="ecom-badge">
                <IconSparkles size={14} className="text-primary" />
                <span>The Modern Essentials Marketplace</span>
              </div>

              <h1 className="ecom-hero-title">
                Timeless Goods, Crafted for{" "}
                <span className="ecom-gradient-text">Everyday Living.</span>
              </h1>

              <p className="ecom-hero-desc">
                Discover mindfully designed apparel, artisanal ceramics, and
                durable accessories. Sourced directly from independent
                creators and delivered straight to your home.
              </p>

              {/* Action Buttons */}
              <div className="ecom-hero-actions">
                {user ? (
                  <button
                    type="button"
                    className="ecom-btn-cta-primary"
                    onClick={onGoToDashboard}
                  >
                    <IconShoppingCart size={18} />
                    <span>Open Marketplace</span>
                    <IconArrowRight size={16} />
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="ecom-btn-cta-primary"
                      onClick={() => onNavigateToAuth("register", "customer")}
                    >
                      <IconShoppingCart size={18} />
                      <span>Start Shopping</span>
                      <IconArrowRight size={16} />
                    </button>

                    <button
                      type="button"
                      className="ecom-btn-cta-secondary"
                      onClick={() => onNavigateToAuth("register", "seller")}
                    >
                      <IconStore size={18} />
                      <span>Become a Seller</span>
                    </button>
                  </>
                )}
              </div>

              {/* Trust Badges */}
              <div className="ecom-trust-bar">
                <div className="trust-item">
                  <IconTruck size={16} className="text-primary" />
                  <span>Free Shipping on ₹999+</span>
                </div>
                <div className="trust-item">
                  <IconShieldCheck size={16} className="text-primary" />
                  <span>Razorpay 100% Secure</span>
                </div>
              </div>
            </div>

            {/* Right Side: Curated Lifestyle Visual Showcase */}
            <div className="ecom-gallery-container">
              <div
                className="gallery-main-card"
                onClick={() => onNavigateToAuth("login")}
              >
                <img
                  src="https://i.etsystatic.com/5477623/r/il/5137da/4368289985/il_fullxfull.4368289985_iet5.jpg"
                  alt="Artisanal Stoneware & Tableware"
                  className="gallery-main-image"
                />
                <div className="gallery-main-overlay">
                  <span className="gallery-caption-tag">Artisanal Living</span>
                  <h3 className="gallery-caption-title">
                    Handmade Stoneware & Ceramics
                  </h3>
                  <p className="gallery-caption-desc">
                    Wheel-thrown by independent potters with natural non-toxic glazes.
                  </p>
                </div>
              </div>

              <div className="gallery-secondary-grid">
                <div
                  className="gallery-sub-card"
                  onClick={() => onNavigateToAuth("login")}
                >
                  <img
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHxr8f4eGmXznyPRqEtWfA34G4LzEuteE9hq-sUDqbwJDIVLrjhL3pmV4&s=10"
                    alt="Organic Linen Apparel"
                    className="gallery-sub-image"
                  />
                  <div className="gallery-sub-overlay">
                    <span className="gallery-sub-title">Organic Textiles</span>
                    <span className="gallery-sub-tag">Daily Wear</span>
                  </div>
                </div>

                <div
                  className="gallery-sub-card"
                  onClick={() => onNavigateToAuth("login")}
                >
                  <img
                    src="https://m.media-amazon.com/images/I/71xMczx517L._AC_UY1000_.jpg"
                    alt="Everyday Leather Carry"
                    className="gallery-sub-image"
                  />
                  <div className="gallery-sub-overlay">
                    <span className="gallery-sub-title">Handcrafted Carry</span>
                    <span className="gallery-sub-tag">Full-Grain</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Curated Categories Section */}
        <section className="ecom-categories-section">
          <div className="ecom-section-container">
            <div className="ecom-section-header">
              <span className="ecom-eyebrow">Explore Collections</span>
              <h2 className="ecom-section-heading">Curated for Discerning Tastes</h2>
              <p className="ecom-section-sub">
                Browse handpicked selections made with honest materials, durable
                craftsmanship, and clean design.
              </p>
            </div>

            <div className="ecom-categories-grid">
              {categories.map((cat) => (
                <div
                  key={cat.name}
                  className="ecom-category-card"
                  onClick={() => onNavigateToAuth("login")}
                >
                  <div className="category-top-row">
                    <div
                      className="category-icon-circle"
                      style={{ color: cat.color }}
                    >
                      {cat.icon}
                    </div>
                    <span className="category-pill">{cat.tag}</span>
                  </div>
                  <h3 className="category-name">{cat.name}</h3>
                  <p className="category-tagline">{cat.tagline}</p>
                  <div className="category-footer">
                    <span>Explore Products</span>
                    <IconArrowRight size={14} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Seller Banner Callout */}
        <section className="ecom-seller-banner-section">
          <div className="ecom-section-container">
            <div className="ecom-seller-banner">
              <div className="seller-banner-content">
                <span className="seller-badge">Merchant Partner Program</span>
                <h2 className="seller-title">
                  Are You a Maker or Boutique Brand?
                </h2>
                <p className="seller-desc">
                  Join hundreds of creators selling apparel, homeware,
                  and curated goods on Everyday & Co. Enjoy zero listing fees,
                  instant payouts, and a dedicated seller dashboard.
                </p>
                <div className="seller-actions">
                  <button
                    type="button"
                    className="btn-seller-cta"
                    onClick={() => onNavigateToAuth("register", "seller")}
                  >
                    <IconStore size={18} />
                    <span>Start Selling Today</span>
                    <IconArrowRight size={16} />
                  </button>
                  <span className="seller-subnote">
                    Takes under 2 minutes to apply • Zero upfront fees
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="ecom-footer">
        <div className="ecom-section-container">
          <div className="ecom-footer-grid">
            <div className="footer-brand-side">
              <div className="ecom-brand">
                <div className="ecom-brand-logo">
                  <IconShoppingBag size={20} />
                </div>
                <span className="ecom-brand-name">Everyday & Co.</span>
              </div>
              <p className="footer-about">
                Curated essentials and timeless goods for daily living.
                Supporting independent makers and conscious shoppers nationwide.
              </p>
            </div>

            <div className="footer-col">
              <span className="footer-head">Shopping</span>
              <button type="button" onClick={() => onNavigateToAuth("login")}>
                New Arrivals
              </button>
              <button type="button" onClick={() => onNavigateToAuth("login")}>
                Home & Living
              </button>
              <button type="button" onClick={() => onNavigateToAuth("login")}>
                Apparel & Textiles
              </button>
              <button type="button" onClick={() => onNavigateToAuth("login")}>
                Accessories
              </button>
            </div>

            <div className="footer-col">
              <span className="footer-head">Merchants</span>
              <button
                type="button"
                onClick={() => onNavigateToAuth("register", "seller")}
              >
                Become a Seller
              </button>
              <button type="button" onClick={() => onNavigateToAuth("login")}>
                Seller Portal Login
              </button>
              <button type="button" onClick={() => onNavigateToAuth("login")}>
                Merchant Hub
              </button>
            </div>

            <div className="footer-col">
              <span className="footer-head">Payment & Security</span>
              <div className="security-points">
                <span className="sec-tag">✓ Razorpay Integrated</span>
                <span className="sec-tag">✓ UPI, Cards & NetBanking</span>
                <span className="sec-tag">✓ SSL 256-bit Encryption</span>
              </div>
            </div>
          </div>

          <div className="footer-bottom-row">
            <p>© 2026 Everyday & Co. All rights reserved.</p>
            <div className="footer-legal">
              <span>Privacy Policy</span>
              <span>•</span>
              <span>Terms of Service</span>
              <span>•</span>
              <span>Shipping & Returns</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}