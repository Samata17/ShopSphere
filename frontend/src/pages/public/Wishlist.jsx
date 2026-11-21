import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";

import {
  FaHeart,
  FaShoppingCart,
  FaTrash,
} from "react-icons/fa";

import "../../styles/wishlist.css";

function Wishlist() {
  const {
    wishlistItems,
    removeFromWishlist,
  } = useWishlist();

  const { addToCart } = useCart();

  const navigate = useNavigate();

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  return (
    <div className="wishlist-page">

      {/* ================= HEADING ================= */}

      <div className="wishlist-heading">
        <div className="wishlist-title-icon">
          <FaHeart />
        </div>

        <h1>My Wishlist</h1>

        <p>
          Save your favorite products and shop them later.
        </p>
      </div>

      {/* ================= EMPTY WISHLIST ================= */}

      {wishlistItems.length === 0 ? (
        <div className="wishlist-empty">

          <div className="empty-heart">
            <FaHeart />
          </div>

          <h2>Your wishlist is empty</h2>

          <p>
            Products you save to your wishlist will
            appear here.
          </p>

          <button
            type="button"
            onClick={() => navigate("/products")}
          >
            Explore Products
          </button>

        </div>
      ) : (

        /* ================= WISHLIST PRODUCTS ================= */

        <div className="wishlist-grid">

          {wishlistItems.map((product) => (

            <div
              className="wishlist-card"
              key={product.id}
            >

              {/* REMOVE BUTTON */}

              <button
                type="button"
                className="wishlist-remove"
                onClick={() =>
                  removeFromWishlist(product.id)
                }
                aria-label="Remove from wishlist"
              >
                <FaTrash />
              </button>

              {/* PRODUCT IMAGE */}

              <div className="wishlist-image">
                <img
                  src={product.image}
                  alt={product.name}
                />
              </div>

              {/* PRODUCT INFORMATION */}

              <div className="wishlist-info">

                <p className="wishlist-category">
                  {product.category}
                </p>

                <h3>{product.name}</h3>

                {product.rating && (
                  <p className="wishlist-rating">
                    ⭐ {product.rating}
                  </p>
                )}

                <div className="wishlist-price">

                  <strong>
                    ₹{product.price}
                  </strong>

                  {product.oldPrice && (
                    <span>
                      ₹{product.oldPrice}
                    </span>
                  )}

                </div>

                {/* ADD TO CART */}

                <button
                  type="button"
                  className="wishlist-cart-btn"
                  onClick={() =>
                    handleAddToCart(product)
                  }
                >
                  <FaShoppingCart />
                  Add to Cart
                </button>

              </div>
            </div>

          ))}

        </div>
      )}

    </div>
  );
}

export default Wishlist;