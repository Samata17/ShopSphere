import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaHeart,
  FaShoppingCart,
  FaStar,
} from "react-icons/fa";

import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useAuth } from "../../context/AuthContext";
import { PLACEHOLDER_IMAGE } from "../../utils/image";

function ProductCard({ product, badge }) {
  const navigate = useNavigate();

  // ================= AUTH =================

  const { isAuthenticated } = useAuth();

  // ================= CART =================

  const { addToCart } = useCart();

  // ================= WISHLIST =================

  const {
    toggleWishlist,
    isInWishlist,
  } = useWishlist();

  // ================= STATES =================

  const [added, setAdded] = useState(false);

  const liked = isInWishlist(product.id);

  // ================= OPEN PRODUCT =================

  const handleOpenProduct = () => {
    navigate(`/product/${product.id}`);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ================= ADD TO CART =================

  const handleAddToCart = async () => {
    try {
      await addToCart(product);

      setAdded(true);

      setTimeout(() => {
        setAdded(false);
      }, 1500);
    } catch {
      // Failure toast is already shown by CartContext.
    }
  };

  // ================= WISHLIST =================

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      await toggleWishlist(product);
    } catch {
      // Failure toast is already shown by WishlistContext.
    }
  };

  return (
    <div className="product-card">

      {/* ================= IMAGE ================= */}

      <div className="product-image-wrapper">

        {/* WISHLIST HEART */}

        <button
          type="button"
          className={
            liked
              ? "product-heart active"
              : "product-heart"
          }
          onClick={handleWishlist}
          aria-label={
            liked
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
        >
          <FaHeart />
        </button>

        {/* CLICKABLE PRODUCT IMAGE */}

        <img
          src={product.image}
          alt={product.name}
          className="product-image product-clickable"
          onClick={handleOpenProduct}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = PLACEHOLDER_IMAGE;
          }}
        />

        {product.stock === 0 ? (
          <span className="product-out-of-stock-badge">Out of Stock</span>
        ) : (
          badge && (
            <span className={`product-badge product-badge-${badge.type}`}>
              {badge.label}
            </span>
          )
        )}

      </div>

      {/* ================= PRODUCT INFO ================= */}

      <div className="product-info">

        {/* CATEGORY */}

        <p className="product-category">
          {product.category}
        </p>

        {/* CLICKABLE PRODUCT NAME */}

        <h3
          className="product-name-clickable"
          onClick={handleOpenProduct}
        >
          {product.name}
        </h3>

        {/* ================= RATING ================= */}

        {product.rating > 0 && (
          <p className="product-rating">
            <FaStar />
            {product.rating.toFixed(1)}
            {product.reviewCount > 0 && (
              <span className="product-review-count">
                ({product.reviewCount})
              </span>
            )}
          </p>
        )}

        {/* ================= PRICE ================= */}

        <div className="product-price-section">

          <p className="product-price">
            ₹{product.price}
          </p>

          {product.oldPrice && (
            <span className="product-old-price">
              ₹{product.oldPrice}
            </span>
          )}

        </div>

        {/* ================= ADD TO CART ================= */}

        <button
          type="button"
          className={
            added
              ? "add-cart-btn added"
              : "add-cart-btn"
          }
          onClick={handleAddToCart}
          disabled={added}
        >
          {added ? (
            "✓ Added to Cart"
          ) : (
            <>
              <FaShoppingCart />
              Add to Cart
            </>
          )}
        </button>

      </div>
    </div>
  );
}

export default ProductCard;