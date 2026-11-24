import Modal from "../common/Modal";
import {
  IconStore,
  IconTag,
  IconShoppingCart,
  IconPackage,
  IconShieldCheck,
  IconTruck,
} from "../common/Icons";

function ProductQuickViewModal({ product, isOpen, onClose, onAddToCart, cartQuantity }) {
  if (!product) return null;

  const isOutOfStock = product.stock <= 0;
  const isMaxInCart = cartQuantity >= product.stock;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={product.name} maxWidth="680px">
      <div className="quickview-container">
        <div className="quickview-image-wrapper">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="quickview-image"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                e.currentTarget.nextElementSibling.style.display = "flex";
              }}
            />
          ) : null}
          <div
            className="quickview-image-placeholder"
            style={{ display: product.image ? "none" : "flex" }}
          >
            <IconPackage size={48} />
            <span>Product Preview</span>
          </div>
        </div>

        <div className="quickview-details">
          <div className="quickview-meta-row">
            <span className="quickview-category-badge">
              <IconTag size={13} />
              {product.category}
            </span>
            <span
              className={`status-badge ${
                isOutOfStock ? "status-cancelled" : product.stock <= 3 ? "status-pending" : "status-delivered"
              }`}
            >
              {isOutOfStock
                ? "Out of Stock"
                : product.stock <= 3
                ? `Only ${product.stock} Left`
                : "In Stock"}
            </span>
          </div>

          <h2 className="quickview-title">{product.name}</h2>

          <div className="quickview-price-row">
            <span className="quickview-price">₹{Number(product.price).toLocaleString("en-IN")}</span>
            <span className="quickview-tax-note">Inclusive of all taxes</span>
          </div>

          <p className="quickview-description">{product.description}</p>

          <div className="quickview-seller-box">
            <IconStore size={18} />
            <div className="quickview-seller-info">
              <span className="seller-label">Fulfilled & Sold by</span>
              <span className="seller-name">
                {product.owner?.role === "admin" ? "Everyday & Co." : (product.owner?.name || "Everyday & Co.")}
              </span>
            </div>
          </div>

          <div className="quickview-perks-list">
            <div className="perk-item">
              <IconTruck size={16} />
              <span>Free Delivery on orders above ₹499</span>
            </div>
            <div className="perk-item">
              <IconShieldCheck size={16} />
              <span>100% Authentic & Quality Assured</span>
            </div>
          </div>

          <div className="quickview-actions">
            <button
              type="button"
              className="btn-primary quickview-add-btn"
              onClick={() => {
                onAddToCart(product);
              }}
              disabled={isOutOfStock || isMaxInCart}
            >
              <IconShoppingCart size={18} />
              <span>
                {isOutOfStock
                  ? "Out of Stock"
                  : isMaxInCart
                  ? `Max in Cart (${cartQuantity})`
                  : cartQuantity > 0
                  ? `Add More (${cartQuantity} in Cart)`
                  : "Add to Cart"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default ProductQuickViewModal;
