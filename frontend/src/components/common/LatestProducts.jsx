import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaHeart, FaStar } from "react-icons/fa";

import { useWishlist } from "../../context/WishlistContext";
import { useAuth } from "../../context/AuthContext";
import { fetchProducts } from "../../api/products";

function LatestProducts() {
  const navigate = useNavigate();

  const { isAuthenticated } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [products, setProducts] = useState([]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts({ sort: "newest" });
        setProducts(data.slice(0, 4));
      } catch (error) {
        console.error("Latest products fetch error:", error);
      }
    };

    loadProducts();
  }, []);

  const handleOpenProduct = (productId) => {
    navigate(`/product/${productId}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleWishlist = async (product) => {
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

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="latest-products-section">
      <div className="latest-products-header">
        <h2>Latest Products</h2>
        <Link to="/products">View All →</Link>
      </div>

      <div className="latest-products-grid">
        {products.map((product) => {
          const liked = isInWishlist(product.id);

          return (
            <div className="latest-product-card" key={product.id}>
              <button
                className={liked ? "wishlist-btn active" : "wishlist-btn"}
                type="button"
                onClick={() => handleWishlist(product)}
                aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
              >
                <FaHeart />
              </button>

              <div
                className="latest-product-image latest-product-clickable"
                onClick={() => handleOpenProduct(product.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleOpenProduct(product.id);
                  }
                }}
              >
                <img src={product.image} alt={product.name} />
              </div>

              <div className="latest-product-details">
                <span className="latest-category">{product.category}</span>

                <h3
                  className="latest-product-name-clickable"
                  onClick={() => handleOpenProduct(product.id)}
                >
                  {product.name}
                </h3>

                {product.rating > 0 && (
                  <div className="latest-rating">
                    <FaStar />
                    <span>{product.rating}</span>
                  </div>
                )}

                <div className="latest-price-row">
                  <div>
                    <strong>₹{product.price.toLocaleString("en-IN")}</strong>

                    {product.oldPrice && (
                      <del>₹{product.oldPrice.toLocaleString("en-IN")}</del>
                    )}
                  </div>

                  {product.oldPrice && (
                    <span className="discount-badge">
                      {Math.round(
                        ((product.oldPrice - product.price) /
                          product.oldPrice) *
                          100
                      )}
                      % OFF
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default LatestProducts;
