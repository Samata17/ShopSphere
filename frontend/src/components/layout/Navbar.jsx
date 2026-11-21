import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import {
  FaShoppingBag,
  FaShoppingCart,
  FaUser,
  FaBars,
  FaSearch,
  FaTruck,
  FaChevronDown,
  FaHeart,
  FaThLarge,
  FaSignOutAlt,
  FaTimes,
} from "react-icons/fa";

import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useAuth } from "../../context/AuthContext";
import { categories } from "../../constants/categories";

import "../../styles/navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  // ================= AUTH =================

  const { isAuthenticated, user, logout } = useAuth();

  // ================= CART =================

  const { cartItems } = useCart();

  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // ================= WISHLIST =================

  const { wishlistItems } = useWishlist();

  const wishlistCount = wishlistItems.length;

  // ================= SEARCH =================

  const [searchTerm, setSearchTerm] = useState("");

  // ================= CATEGORY DROPDOWN =================

  const [categoryOpen, setCategoryOpen] = useState(false);

  const categoryMenuRef = useRef(null);

  // ================= CLOSE DROPDOWN OUTSIDE =================

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        categoryMenuRef.current &&
        !categoryMenuRef.current.contains(event.target)
      ) {
        setCategoryOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // ================= MOBILE MENU =================

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // ================= HANDLE SEARCH =================

  const handleSearch = () => {
    const search = searchTerm.trim();

    if (search) {
      navigate(`/products?search=${encodeURIComponent(search)}`);
    } else {
      navigate("/products");
    }
  };

  // ================= HANDLE CATEGORY =================

  const handleCategoryClick = (category) => {
    setCategoryOpen(false);

    navigate(`/products?category=${encodeURIComponent(category)}`);
  };

  // ================= HANDLE LOGOUT =================

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      {/* =========================================
          TOP OFFER BAR
      ========================================= */}

      <div className="offer-topbar">
        <div className="offer-topbar-content">
          <span>
            <FaTruck />
            Free Shipping on orders above ₹999
          </span>

          <div className="topbar-links">
            <span>Track Order</span>
            <span>Help & Support</span>
            <span>Offers</span>
          </div>
        </div>
      </div>

      {/* =========================================
          MAIN HEADER
      ========================================= */}

      <header className="main-header">
        {/* MOBILE MENU TOGGLE */}

        <button
          type="button"
          className="mobile-menu-toggle"
          aria-label="Menu"
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((previous) => !previous)}
        >
          <FaBars />
        </button>

        {/* LOGO */}

        <Link to="/" className="brand">
          <div className="brand-icon">
            <FaShoppingBag />
          </div>

          <div>
            <h2>ShopSphere</h2>
            <p>Your World, Your Store</p>
          </div>
        </Link>

        {/* SEARCH */}

        <div className="header-search">
          <input
            type="text"
            placeholder="Search for products, brands and more..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />

          <button type="button" aria-label="Search" onClick={handleSearch}>
            <FaSearch />
          </button>
        </div>

        {/* =========================================
            HEADER ACTIONS
        ========================================= */}

        <div className="header-actions">
          {/* ACCOUNT */}

          {isAuthenticated ? (
            <Link to="/account" className="header-action">
              <FaUser />

              <div>
                <small>Hello, {user?.name?.split(" ")[0] || "there"}</small>
                <strong>My Account</strong>
              </div>
            </Link>
          ) : (
            <Link to="/login" className="header-action">
              <FaUser />

              <div>
                <small>Hello, Sign in</small>
                <strong>Login / Register</strong>
              </div>
            </Link>
          )}

          {isAuthenticated && (
            <button
              type="button"
              className="header-action logout-action"
              onClick={handleLogout}
              aria-label="Logout"
              title="Logout"
            >
              <FaSignOutAlt />
            </button>
          )}

          {/* WISHLIST */}

          <Link to="/wishlist" className="wishlist-header" aria-label="Wishlist">
            <div className="wishlist-icon-wrapper">
              <FaHeart />

              {wishlistCount > 0 && (
                <span className="wishlist-count">{wishlistCount}</span>
              )}
            </div>
          </Link>

          {/* CART */}

          <Link to="/cart" className="cart-header">
            <div className="cart-icon-wrapper">
              <FaShoppingCart />

              {cartCount > 0 && (
                <span className="cart-count">{cartCount}</span>
              )}
            </div>

            <div>
              <small>My Cart</small>

              <strong>₹{cartTotal.toLocaleString("en-IN")}</strong>
            </div>
          </Link>
        </div>
      </header>

      {/* =========================================
          NAVIGATION
      ========================================= */}

      <nav className="main-nav">
        <div className="main-nav-content">
          {/* =====================================
              ALL CATEGORIES BUTTON
          ===================================== */}

          <div className="categories-dropdown" ref={categoryMenuRef}>
            <button
              type="button"
              className={`all-categories-btn ${categoryOpen ? "open" : ""}`}
              onClick={() => setCategoryOpen((previous) => !previous)}
              aria-expanded={categoryOpen}
            >
              <FaBars />

              <span>All Categories</span>

              <FaChevronDown className="category-arrow" />
            </button>

            {/* CATEGORY DROPDOWN */}

            {categoryOpen && (
              <div className="categories-dropdown-menu">
                {categories.map((category) => (
                  <button
                    type="button"
                    className="category-dropdown-item"
                    key={category.id}
                    onClick={() => handleCategoryClick(category.name)}
                  >
                    <span className="category-dropdown-icon">
                      {category.icon}
                    </span>

                    <span>{category.name}</span>
                  </button>
                ))}

                <div className="category-dropdown-divider" />

                <button
                  type="button"
                  className="category-dropdown-item view-all-category"
                  onClick={() => {
                    setCategoryOpen(false);
                    navigate("/categories");
                  }}
                >
                  <span className="category-dropdown-icon">
                    <FaThLarge />
                  </span>

                  <span>View All Categories</span>
                </button>
              </div>
            )}
          </div>

          {/* =====================================
              NAVIGATION LINKS
          ===================================== */}
          <div className="nav-links">
            <Link to="/">Home</Link>

            <Link to="/deals">Deals</Link>

            <Link to="/new-arrivals">New Arrivals</Link>

            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/products?category=${encodeURIComponent(category.name)}`}
              >
                {category.name}
              </Link>
            ))}

            <Link to="/about">About Us</Link>

            <Link to="/contact">Contact Us</Link>
          </div>
        </div>
      </nav>

      {/* =========================================
          MOBILE MENU
      ========================================= */}

      {mobileMenuOpen && (
        <div
          className="mobile-nav-overlay"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="mobile-nav-panel"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mobile-nav-panel-header">
              <span>Menu</span>

              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="mobile-nav-links">
              <Link to="/">Home</Link>
              <Link to="/deals">Deals</Link>
              <Link to="/new-arrivals">New Arrivals</Link>

              <div className="mobile-nav-divider" />
              <span className="mobile-nav-section-label">Categories</span>

              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/products?category=${encodeURIComponent(category.name)}`}
                >
                  <span className="mobile-nav-icon">{category.icon}</span>
                  {category.name}
                </Link>
              ))}

              <Link to="/categories" className="mobile-nav-view-all">
                <FaThLarge />
                View All Categories
              </Link>

              <div className="mobile-nav-divider" />

              <Link to="/about">About Us</Link>
              <Link to="/contact">Contact Us</Link>

              <div className="mobile-nav-divider" />

              {isAuthenticated ? (
                <>
                  <Link to="/account">My Account</Link>
                  <button
                    type="button"
                    className="mobile-nav-logout"
                    onClick={handleLogout}
                  >
                    <FaSignOutAlt />
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/login">Login / Register</Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
