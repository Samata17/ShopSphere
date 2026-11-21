import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import {
  FaHeart,
  FaShoppingCart,
  FaStar,
  FaTruck,
  FaShieldAlt,
  FaUndoAlt,
  FaHeadset,
  FaCheckCircle,
  FaEdit,
  FaTrash,
} from "react-icons/fa";

import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useAuth } from "../../context/AuthContext";
import { fetchProductById } from "../../api/products";
import {
  fetchProductReviews,
  checkCanReview,
  addReview,
  updateReview,
  deleteReview,
} from "../../api/reviews";
import { PLACEHOLDER_IMAGE } from "../../utils/image";
import ProductCard from "../../components/products/ProductCard";
import Spinner from "../../components/common/Spinner";

import "../../styles/productDetails.css";
import "../../styles/products.css";

const EMPTY_REVIEW_FORM = { rating: 0, title: "", comment: "" };

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      setNotFound(false);
      setActiveImageIndex(0);

      try {
        const data = await fetchProductById(id);
        setProduct(data);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const [quantity, setQuantity] = useState(1);

  /* ================= REVIEWS ================= */

  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingBreakdown, setRatingBreakdown] = useState({});
  const [totalReviews, setTotalReviews] = useState(0);
  const [reviewEligibility, setReviewEligibility] = useState(null);

  const [reviewForm, setReviewForm] = useState(EMPTY_REVIEW_FORM);
  const [hoverRating, setHoverRating] = useState(0);
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");

  const loadReviews = async () => {
    try {
      const data = await fetchProductReviews(id);
      setReviews(data.reviews);
      setAverageRating(data.averageRating);
      setRatingBreakdown(data.ratingBreakdown);
      setTotalReviews(data.totalReviews);
    } catch (err) {
      console.error("Load reviews error:", err);
    }
  };

  const loadEligibility = async () => {
    if (!isAuthenticated) {
      setReviewEligibility(null);
      return;
    }

    try {
      const data = await checkCanReview(id);
      setReviewEligibility(data);
    } catch (err) {
      console.error("Load review eligibility error:", err);
    }
  };

  useEffect(() => {
    if (!id) return;
    loadReviews();
    loadEligibility();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isAuthenticated]);

  const startWriteReview = () => {
    setIsEditingReview(false);
    setReviewForm(EMPTY_REVIEW_FORM);
    setReviewError("");
  };

  const startEditReview = () => {
    if (!reviewEligibility?.existingReview) return;
    setIsEditingReview(true);
    setReviewForm({
      rating: reviewEligibility.existingReview.rating,
      title: reviewEligibility.existingReview.title,
      comment: reviewEligibility.existingReview.comment,
    });
    setReviewError("");
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError("");

    if (reviewForm.rating === 0) {
      setReviewError("Please select a star rating.");
      return;
    }

    if (!reviewForm.title.trim() || reviewForm.title.trim().length < 3) {
      setReviewError("Please enter a review title (at least 3 characters).");
      return;
    }

    if (!reviewForm.comment.trim() || reviewForm.comment.trim().length < 5) {
      setReviewError("Please write a review of at least 5 characters.");
      return;
    }

    setSubmittingReview(true);

    try {
      if (isEditingReview && reviewEligibility?.existingReview) {
        await updateReview(reviewEligibility.existingReview.id, reviewForm);
        toast.success("Review updated");
      } else {
        await addReview({ productId: id, ...reviewForm });
        toast.success("Review submitted");
      }

      setReviewForm(EMPTY_REVIEW_FORM);
      setIsEditingReview(false);
      await Promise.all([loadReviews(), loadEligibility()]);
    } catch (err) {
      const message = err.response?.data?.message || "Could not submit your review.";
      setReviewError(message);
      toast.error(message);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!reviewEligibility?.existingReview) return;
    if (!window.confirm("Delete your review?")) return;

    try {
      await deleteReview(reviewEligibility.existingReview.id);
      setIsEditingReview(false);
      setReviewForm(EMPTY_REVIEW_FORM);
      await Promise.all([loadReviews(), loadEligibility()]);
      toast.success("Review deleted");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Could not delete your review."
      );
    }
  };

  /* ================= LOADING / NOT FOUND ================= */

  if (loading) {
    return (
      <div className="ss-page-loading">
        <Spinner size={36} label="Loading product..." />
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="product-not-found">
        <h1>Product Not Found</h1>
        <p>Sorry, we couldn't find this product.</p>

        <button type="button" onClick={() => navigate("/products")}>
          Back to Products
        </button>
      </div>
    );
  }

  const liked = isInWishlist(product.id);
  const subtotal = product.price * quantity;

  const galleryImages =
    product.images && product.images.length > 0
      ? product.images
      : [{ id: "main", url: product.image }];

  const increaseQuantity = () => {
    setQuantity((current) =>
      product.stock ? Math.min(current + 1, product.stock) : current + 1
    );
  };

  const decreaseQuantity = () => {
    setQuantity((current) => (current > 1 ? current - 1 : 1));
  };

  const handleAddToCart = async () => {
    try {
      await addToCart(product, quantity);
    } catch {
      // Failure toast is already shown by CartContext.
    }
  };

  const handleBuyNow = async () => {
    try {
      await addToCart(product, quantity);
    } catch {
      return;
    }

    navigate(isAuthenticated ? "/checkout" : "/login");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
    <div className="product-details-page">
      {/* BREADCRUMB */}

      <div className="product-breadcrumb">
        <span onClick={() => navigate("/")}>Home</span>
        <b>›</b>
        <span onClick={() => navigate("/products")}>Products</span>
        <b>›</b>
        <span>{product.category}</span>
        <b>›</b>
        <p>{product.name}</p>
      </div>

      <div className="product-details-layout">
        {/* GALLERY */}

        <div className="product-gallery">
          <div className="product-thumbnails">
            {galleryImages.map((image, index) => (
              <button
                type="button"
                key={image.id}
                className={
                  index === activeImageIndex
                    ? "product-thumbnail active"
                    : "product-thumbnail"
                }
                onClick={() => setActiveImageIndex(index)}
              >
                <img
                  src={image.url}
                  alt={product.name}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = PLACEHOLDER_IMAGE;
                  }}
                />
              </button>
            ))}
          </div>

          <div className="product-main-image">
            <img
              src={galleryImages[activeImageIndex]?.url || product.image}
              alt={product.name}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = PLACEHOLDER_IMAGE;
              }}
            />
          </div>
        </div>

        {/* INFO */}

        <div className="product-details-info">
          <span className="details-category">{product.category}</span>

          <h1>{product.name}</h1>

          <div className="details-rating">
            <div className="details-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={star}
                  style={{
                    color: star <= Math.round(averageRating) ? "#ffa41c" : "#ddd",
                  }}
                />
              ))}
            </div>

            <strong>{averageRating.toFixed(1)}</strong>
            <span>({totalReviews} Reviews)</span>
          </div>

          <div className="details-price">
            <strong>₹{product.price.toLocaleString("en-IN")}</strong>

            {product.oldPrice && (
              <>
                <del>₹{product.oldPrice.toLocaleString("en-IN")}</del>

                <span>
                  {Math.round(
                    ((product.oldPrice - product.price) / product.oldPrice) *
                      100
                  )}
                  % OFF
                </span>
              </>
            )}
          </div>

          <p className="tax-text">Inclusive of all taxes</p>

          <div className="stock-info">
            <FaCheckCircle />
            <strong>{product.stock > 0 ? "In Stock" : "Out of Stock"}</strong>
          </div>

          <p className="shipping-time">Ships in 1-2 business days</p>

          <p className="product-description">{product.description}</p>

          {product.brand && (
            <p className="product-description">
              <strong>Brand:</strong> {product.brand}
            </p>
          )}

          {product.sellerName && (
            <p className="product-description">
              <strong>Seller:</strong> {product.sellerName}
            </p>
          )}

          <div className="product-badges">
            <span>
              <FaShieldAlt />
              1 Year Warranty
            </span>

            <span>
              <FaUndoAlt />
              7 Days Replacement
            </span>
          </div>
        </div>

        {/* PURCHASE BOX */}

        <div className="purchase-box">
          <div className="purchase-row">
            <span>Price</span>
            <strong>₹{product.price.toLocaleString("en-IN")}</strong>
          </div>

          <div className="purchase-row">
            <span>Quantity</span>

            <div className="quantity-selector">
              <button type="button" onClick={decreaseQuantity}>
                −
              </button>

              <strong>{quantity}</strong>

              <button type="button" onClick={increaseQuantity}>
                +
              </button>
            </div>
          </div>

          <div className="purchase-divider" />

          <div className="purchase-row">
            <span>Subtotal</span>
            <strong>₹{subtotal.toLocaleString("en-IN")}</strong>
          </div>

          <button
            type="button"
            className="details-cart-btn"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            <FaShoppingCart />
            Add to Cart
          </button>

          <button
            type="button"
            className="buy-now-btn"
            onClick={handleBuyNow}
            disabled={product.stock === 0}
          >
            Buy Now
          </button>

          <button
            type="button"
            className={
              liked ? "details-wishlist-btn active" : "details-wishlist-btn"
            }
            onClick={handleWishlist}
          >
            <FaHeart />
            {liked ? "Added to Wishlist" : "Add to Wishlist"}
          </button>

        </div>
      </div>

      {/* REVIEWS */}

      <div style={{ maxWidth: "1200px", margin: "50px auto", padding: "0 20px" }}>
        <div style={{ marginBottom: "25px" }}>
          <h2 style={{ marginBottom: "8px", fontSize: "28px" }}>
            Customer Reviews
          </h2>

          <p style={{ color: "#666" }}>
            Share your experience with {product.name}
          </p>
        </div>

        {/* RATING BREAKDOWN */}

        {totalReviews > 0 && (
          <div className="rating-breakdown">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingBreakdown[star] || 0;
              const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

              return (
                <div className="rating-breakdown-row" key={star}>
                  <span>{star} star</span>
                  <div className="rating-breakdown-bar">
                    <div
                      className="rating-breakdown-fill"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span>{count}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* WRITE / EDIT REVIEW */}

        <div
          style={{
            padding: "25px",
            marginBottom: "35px",
            border: "1px solid #e5e5e5",
            borderRadius: "12px",
            background: "#fff",
          }}
        >
          {!isAuthenticated ? (
            <p>
              <span
                style={{ color: "#6c4cff", cursor: "pointer", fontWeight: 600 }}
                onClick={() => navigate("/login")}
              >
                Login
              </span>{" "}
              to write a review for this product.
            </p>
          ) : reviewEligibility && !reviewEligibility.hasPurchased ? (
            <p style={{ color: "#666" }}>
              You can review this product once you've purchased and received it.
            </p>
          ) : reviewEligibility?.hasReviewed && !isEditingReview ? (
            <div>
              <p style={{ marginBottom: "12px", color: "#666" }}>
                You've already reviewed this product.
              </p>

              <button
                type="button"
                onClick={startEditReview}
                style={{
                  padding: "10px 18px",
                  border: "1px solid #6c4cff",
                  borderRadius: "8px",
                  background: "#fff",
                  color: "#6c4cff",
                  fontWeight: 600,
                  cursor: "pointer",
                  marginRight: "10px",
                }}
              >
                <FaEdit style={{ marginRight: "6px" }} />
                Edit Review
              </button>

              <button
                type="button"
                onClick={handleDeleteReview}
                style={{
                  padding: "10px 18px",
                  border: "1px solid #dc3545",
                  borderRadius: "8px",
                  background: "#fff",
                  color: "#dc3545",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <FaTrash style={{ marginRight: "6px" }} />
                Delete Review
              </button>
            </div>
          ) : (
            <>
              <h3 style={{ marginTop: 0, marginBottom: "20px" }}>
                {isEditingReview ? "Edit Your Review" : "Write a Review"}
              </h3>

              <form onSubmit={handleReviewSubmit}>
                <div style={{ marginBottom: "20px" }}>
                  <label
                    style={{ display: "block", marginBottom: "10px", fontWeight: 600 }}
                  >
                    Your Rating
                  </label>

                  <div style={{ display: "flex", gap: "5px" }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() =>
                          setReviewForm((prev) => ({ ...prev, rating: star }))
                        }
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        aria-label={`${star} star rating`}
                        style={{
                          padding: 0,
                          border: "none",
                          background: "transparent",
                          color:
                            star <= (hoverRating || reviewForm.rating)
                              ? "#ffa41c"
                              : "#d5d5d5",
                          fontSize: "28px",
                          cursor: "pointer",
                        }}
                      >
                        <FaStar />
                      </button>
                    ))}
                  </div>

                  {reviewForm.rating > 0 && (
                    <span
                      style={{ display: "block", marginTop: "8px", fontSize: "14px", color: "#666" }}
                    >
                      {reviewForm.rating} out of 5
                    </span>
                  )}
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label
                    style={{ display: "block", marginBottom: "10px", fontWeight: 600 }}
                  >
                    Review Title
                  </label>

                  <input
                    type="text"
                    value={reviewForm.title}
                    onChange={(e) =>
                      setReviewForm((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="Summarize your experience..."
                    maxLength="150"
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      boxSizing: "border-box",
                      fontFamily: "inherit",
                      fontSize: "15px",
                    }}
                  />
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label
                    style={{ display: "block", marginBottom: "10px", fontWeight: 600 }}
                  >
                    Your Review
                  </label>

                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) =>
                      setReviewForm((prev) => ({ ...prev, comment: e.target.value }))
                    }
                    placeholder="Tell us what you think about this product..."
                    rows="5"
                    maxLength="1000"
                    style={{
                      width: "100%",
                      padding: "14px",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      resize: "vertical",
                      boxSizing: "border-box",
                      fontFamily: "inherit",
                      fontSize: "15px",
                    }}
                  />

                  <span
                    style={{ display: "block", marginTop: "5px", textAlign: "right", color: "#888", fontSize: "13px" }}
                  >
                    {reviewForm.comment.length}/1000
                  </span>
                </div>

                {reviewError && (
                  <p style={{ color: "#dc3545", fontSize: "13px", marginBottom: "14px" }}>
                    {reviewError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submittingReview}
                  style={{
                    padding: "12px 22px",
                    border: "none",
                    borderRadius: "8px",
                    background: "#6c4cff",
                    color: "white",
                    fontWeight: 600,
                    cursor: "pointer",
                    marginRight: "10px",
                  }}
                >
                  {submittingReview
                    ? "Submitting..."
                    : isEditingReview
                    ? "Update Review"
                    : "Submit Review"}
                </button>

                {isEditingReview && (
                  <button
                    type="button"
                    onClick={startWriteReview}
                    style={{
                      padding: "12px 22px",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      background: "#fff",
                      color: "#555",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                )}
              </form>
            </>
          )}
        </div>

        <div>
          <h3 style={{ marginBottom: "20px" }}>
            Reviews ({totalReviews})
          </h3>

          {reviews.length === 0 && (
            <p style={{ color: "#888" }}>
              No reviews yet. Be the first to review this product!
            </p>
          )}

          {reviews.map((review) => (
            <div
              key={review.id}
              style={{ padding: "22px 0", borderBottom: "1px solid #e5e5e5" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    background: "#f0edff",
                    color: "#6c4cff",
                    fontWeight: 700,
                  }}
                >
                  {review.customer_name.charAt(0).toUpperCase()}
                </div>

                <div>
                  <strong style={{ display: "block" }}>{review.customer_name}</strong>

                  <span
                    style={{ display: "block", marginTop: "3px", color: "#888", fontSize: "13px" }}
                  >
                    {new Date(review.created_at).toLocaleDateString("en-IN")}
                  </span>
                </div>
              </div>

              <div
                style={{ display: "flex", alignItems: "center", gap: "4px", margin: "14px 0 10px" }}
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    style={{
                      color: star <= review.rating ? "#ffa41c" : "#ddd",
                      fontSize: "16px",
                    }}
                  />
                ))}

                <strong style={{ marginLeft: "6px", fontSize: "14px" }}>
                  {review.rating}.0
                </strong>
              </div>

              <strong style={{ display: "block", marginBottom: "6px" }}>
                {review.title}
              </strong>

              <p style={{ margin: 0, color: "#444", lineHeight: 1.6 }}>
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* RELATED PRODUCTS */}

      {product.relatedProducts && product.relatedProducts.length > 0 && (
        <div style={{ maxWidth: "1200px", margin: "50px auto", padding: "0 20px" }}>
          <h2 style={{ marginBottom: "20px", fontSize: "28px" }}>
            Related Products
          </h2>

          <div className="products-grid">
            {product.relatedProducts.map((related) => (
              <ProductCard key={related.id} product={related} />
            ))}
          </div>
        </div>
      )}

      {/* SERVICES */}

      <div className="product-details-services">
        <div>
          <FaTruck />

          <section>
            <strong>Free Shipping</strong>
            <span>On orders over ₹999</span>
          </section>
        </div>

        <div>
          <FaShieldAlt />

          <section>
            <strong>Secure Payment</strong>
            <span>100% secure payment</span>
          </section>
        </div>

        <div>
          <FaUndoAlt />

          <section>
            <strong>Easy Returns</strong>
            <span>7-day replacement</span>
          </section>
        </div>

        <div>
          <FaHeadset />

          <section>
            <strong>Customer Support</strong>
            <span>We're here to help</span>
          </section>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
