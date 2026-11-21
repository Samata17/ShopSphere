import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
  FaShoppingBag,
  FaThLarge,
  FaBoxOpen,
  FaPlusCircle,
  FaBoxes,
  FaUser,
  FaSignOutAlt,
  FaSearch,
  FaBell,
  FaChevronDown,
  FaEye,
  FaCloudUploadAlt,
  FaImage,
  FaCheckCircle,
  FaArrowLeft,
  FaClipboardList,
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";
import { createSellerProduct } from "../../api/seller";
import { categories } from "../../constants/categories";

import "../../styles/addProduct.css";

const EMPTY_PRODUCT = {
  name: "",
  categoryId: "",
  brand: "",
  price: "",
  oldPrice: "",
  stock: "",
  description: "",
};

function AddProduct() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/seller/login", { replace: true });
  };

  const [product, setProduct] = useState(EMPTY_PRODUCT);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setProduct((previousProduct) => ({
      ...previousProduct,
      [name]: value,
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    const invalid = files.find((file) => !file.type.startsWith("image/"));
    if (invalid) {
      toast.error("Please select valid image files only.");
      return;
    }

    const combined = [...imageFiles, ...files].slice(0, 6);
    setImageFiles(combined);
    setImagePreviews(combined.map((file) => URL.createObjectURL(file)));
  };

  const removeImageAt = (index) => {
    const updated = imageFiles.filter((_, i) => i !== index);
    setImageFiles(updated);
    setImagePreviews(updated.map((file) => URL.createObjectURL(file)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !product.name.trim() ||
      !product.categoryId ||
      !product.price ||
      product.stock === "" ||
      !product.description.trim()
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (Number(product.price) <= 0) {
      toast.error("Price must be greater than 0.");
      return;
    }

    if (Number(product.stock) < 0) {
      toast.error("Stock cannot be negative.");
      return;
    }

    if (
      product.oldPrice &&
      Number(product.oldPrice) <= Number(product.price)
    ) {
      toast.error("The strikethrough price must be higher than the sale price.");
      return;
    }

    const formData = new FormData();
    formData.append("name", product.name.trim());
    formData.append("categoryId", product.categoryId);
    formData.append("brand", product.brand.trim());
    formData.append("price", product.price);
    if (product.oldPrice) formData.append("oldPrice", product.oldPrice);
    formData.append("stock", product.stock);
    formData.append("description", product.description.trim());
    imageFiles.forEach((file) => formData.append("images", file));

    setSubmitting(true);
    setError("");

    try {
      await createSellerProduct(formData);
      toast.success("Product added");
      navigate("/seller/products");
    } catch (err) {
      const message = err.response?.data?.message || "Could not add product";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="seller-add-layout">
      <aside className="seller-add-sidebar">
        <Link to="/seller/dashboard" className="seller-add-logo">
          <div className="seller-add-logo-icon">
            <FaShoppingBag />
          </div>

          <div>
            <h2>ShopSphere</h2>
            <span>Seller Panel</span>
          </div>
        </Link>

        <div className="seller-add-divider" />

        <p className="seller-add-menu-title">SELLER PANEL</p>

        <nav className="seller-add-menu">
          <Link to="/seller/dashboard" className="seller-add-menu-item">
            <FaThLarge />
            <span>Dashboard</span>
          </Link>

          <Link to="/seller/products" className="seller-add-menu-item">
            <FaBoxOpen />
            <span>My Products</span>
          </Link>

          <Link
            to="/seller/add-product"
            className={`seller-add-menu-item ${
              location.pathname === "/seller/add-product" ? "active" : ""
            }`}
          >
            <FaPlusCircle />
            <span>Add Product</span>
          </Link>

          <Link to="/seller/orders" className="seller-add-menu-item">
            <FaClipboardList />
            <span>Orders</span>
          </Link>

          <Link to="/products" className="seller-add-menu-item">
            <FaEye />
            <span>View Products</span>
          </Link>

          <Link to="/seller/products" className="seller-add-menu-item">
            <FaBoxes />
            <span>Inventory</span>
          </Link>

          <button type="button" className="seller-add-menu-item">
            <FaUser />
            <span>Seller Account</span>
          </button>
        </nav>

        <div className="seller-add-business-card">
          <div>
            <FaShoppingBag />
          </div>

          <strong>Grow Your Business</strong>

          <p>Add quality products and grow your ShopSphere store.</p>
        </div>

        <button
          type="button"
          className="seller-add-logout"
          onClick={handleLogout}
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </aside>

      <div className="seller-add-main">
        <header className="seller-add-topbar">
          <div className="seller-add-search">
            <FaSearch />
            <input type="text" placeholder="Search products..." />
          </div>

          <div className="seller-add-top-actions">
            <button
              type="button"
              className="seller-add-notification"
              aria-label="Notifications"
            >
              <FaBell />
              <span>2</span>
            </button>

            <div className="seller-add-account">
              <div className="seller-add-account-avatar">
                <FaUser />
              </div>

              <div className="seller-add-account-info">
                <strong>Seller Account</strong>
                <small>Seller</small>
              </div>

              <FaChevronDown />
            </div>
          </div>
        </header>

        <main className="seller-add-content">
          <div className="seller-add-heading">
            <div>
              <button
                type="button"
                className="seller-back-button"
                onClick={() => navigate("/seller/products")}
              >
                <FaArrowLeft />
                Back to Products
              </button>

              <h1>Add Product</h1>
              <p>Add a new product to your ShopSphere store.</p>
            </div>

            <Link to="/products" className="seller-view-products-btn">
              <FaEye />
              View Products
            </Link>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="seller-product-form-layout">
              <div className="seller-product-form-left">
                <section className="seller-form-card">
                  <div className="seller-form-card-heading">
                    <h2>Basic Information</h2>
                    <p>Enter the basic information about your product.</p>
                  </div>

                  <div className="seller-form-grid">
                    <div className="seller-form-field">
                      <label>
                        Product Name
                        <span>*</span>
                      </label>

                      <input
                        type="text"
                        name="name"
                        value={product.name}
                        onChange={handleChange}
                        placeholder="Enter product name"
                      />
                    </div>

                    <div className="seller-form-field">
                      <label>
                        Category
                        <span>*</span>
                      </label>

                      <select
                        name="categoryId"
                        value={product.categoryId}
                        onChange={handleChange}
                      >
                        <option value="">Select Category</option>

                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="seller-form-field">
                      <label>Brand</label>

                      <input
                        type="text"
                        name="brand"
                        value={product.brand}
                        onChange={handleChange}
                        placeholder="Enter brand name"
                      />
                    </div>
                  </div>
                </section>

                <section className="seller-form-card">
                  <div className="seller-form-card-heading">
                    <h2>Pricing & Stock</h2>
                    <p>Set product pricing and inventory.</p>
                  </div>

                  <div className="seller-form-grid">
                    <div className="seller-form-field">
                      <label>
                        Price (₹)
                        <span>*</span>
                      </label>

                      <input
                        type="number"
                        name="price"
                        value={product.price}
                        onChange={handleChange}
                        placeholder="Enter price"
                        min="1"
                      />
                    </div>

                    <div className="seller-form-field">
                      <label>Strikethrough Price (₹)</label>

                      <input
                        type="number"
                        name="oldPrice"
                        value={product.oldPrice}
                        onChange={handleChange}
                        placeholder="Optional — shows as a deal"
                        min="1"
                      />
                    </div>

                    <div className="seller-form-field">
                      <label>
                        Stock Quantity
                        <span>*</span>
                      </label>

                      <input
                        type="number"
                        name="stock"
                        value={product.stock}
                        onChange={handleChange}
                        placeholder="Enter stock quantity"
                        min="0"
                      />
                    </div>
                  </div>
                </section>

                <section className="seller-form-card">
                  <div className="seller-form-card-heading">
                    <h2>Product Details</h2>
                    <p>Provide detailed information about your product.</p>
                  </div>

                  <div className="seller-form-field">
                    <label>
                      Description
                      <span>*</span>
                    </label>

                    <textarea
                      name="description"
                      value={product.description}
                      onChange={handleChange}
                      placeholder="Enter complete product description..."
                      rows="7"
                    />
                  </div>
                </section>
              </div>

              <div className="seller-product-form-right">
                <section className="seller-form-card">
                  <div className="seller-form-card-heading">
                    <h2>Product Images</h2>
                    <p>Upload up to 6 images. The first image is used as the thumbnail.</p>
                  </div>

                  <label className="seller-product-upload">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                    />

                    <div className="seller-upload-icon">
                      <FaCloudUploadAlt />
                    </div>

                    <strong>Upload Images</strong>
                    <span>PNG, JPG or WEBP</span>
                    <small>Recommended size: 800 × 800px</small>
                  </label>

                  {imagePreviews.length > 0 && (
                    <div className="seller-image-preview-grid">
                      {imagePreviews.map((preview, index) => (
                        <div className="seller-image-preview-item" key={preview}>
                          <img src={preview} alt={`Preview ${index + 1}`} />
                          {index === 0 && (
                            <span className="seller-thumbnail-badge">Thumbnail</span>
                          )}
                          <button
                            type="button"
                            className="seller-remove-image-btn"
                            onClick={() => removeImageAt(index)}
                            aria-label="Remove image"
                          >
                            <FaImage />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <div className="seller-product-note">
                  <FaCheckCircle />

                  <div>
                    <strong>Product Information</strong>

                    <p>
                      Make sure your product details, price and stock
                      information are correct before publishing.
                    </p>
                  </div>
                </div>

                {error && (
                  <p style={{ color: "#dc3545", fontSize: "13px" }}>{error}</p>
                )}
              </div>
            </div>

            <div className="seller-product-form-actions">
              <button
                type="button"
                className="seller-product-cancel"
                onClick={() => navigate("/seller/products")}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="seller-product-submit"
                disabled={submitting}
              >
                <FaPlusCircle />
                {submitting ? "Adding..." : "Add Product"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}

export default AddProduct;
