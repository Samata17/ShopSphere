import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

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
  FaSave,
  FaEdit,
  FaClipboardList,
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";
import { getSellerProductById, updateSellerProduct } from "../../api/seller";
import { categories } from "../../constants/categories";
import { resolveImageUrl } from "../../utils/image";

import "../../styles/editProduct.css";
import "../../styles/addProduct.css";

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/seller/login", { replace: true });
  };

  const [product, setProduct] = useState(null);
  const [existingImages, setExistingImages] = useState([]);
  const [removedImageIds, setRemovedImageIds] = useState([]);
  const [newThumbnailId, setNewThumbnailId] = useState(null);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const data = await getSellerProductById(id);

        setProduct({
          name: data.name,
          categoryId: data.category_id || "",
          brand: data.brand || "",
          price: data.price,
          oldPrice: data.old_price || "",
          stock: data.stock,
          description: data.description || "",
        });

        setExistingImages(data.images || []);
      } catch (err) {
        setError(err.response?.data?.message || "Could not load product");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

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

    const remainingSlots =
      6 - (existingImages.length - removedImageIds.length) - newImageFiles.length;
    const accepted = files.slice(0, Math.max(0, remainingSlots));

    const combined = [...newImageFiles, ...accepted];
    setNewImageFiles(combined);
    setNewImagePreviews(combined.map((file) => URL.createObjectURL(file)));
  };

  const removeNewImageAt = (index) => {
    const updated = newImageFiles.filter((_, i) => i !== index);
    setNewImageFiles(updated);
    setNewImagePreviews(updated.map((file) => URL.createObjectURL(file)));
  };

  const removeExistingImage = (imageId) => {
    setRemovedImageIds((prev) => [...prev, imageId]);
    if (newThumbnailId === imageId) setNewThumbnailId(null);
  };

  const visibleExistingImages = existingImages.filter(
    (img) => !removedImageIds.includes(img.id)
  );

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
    formData.append("oldPrice", product.oldPrice || "");
    formData.append("stock", product.stock);
    formData.append("description", product.description.trim());
    if (removedImageIds.length > 0) {
      formData.append("removeImageIds", removedImageIds.join(","));
    }
    if (newThumbnailId) {
      formData.append("thumbnailImageId", newThumbnailId);
    }
    newImageFiles.forEach((file) => formData.append("images", file));

    setSubmitting(true);
    setError("");

    try {
      await updateSellerProduct(id, formData);
      toast.success("Product updated");
      navigate("/seller/products");
    } catch (err) {
      const message = err.response?.data?.message || "Could not update product";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return null;
  }

  if (!product) {
    return (
      <div style={{ padding: "60px", textAlign: "center" }}>
        <h2>Product not found</h2>
        <p>{error}</p>

        <Link to="/seller/products">Back to Products</Link>
      </div>
    );
  }

  return (
    <div className="seller-edit-layout">
      <aside className="seller-edit-sidebar">
        <Link to="/seller/dashboard" className="seller-edit-logo">
          <div className="seller-edit-logo-icon">
            <FaShoppingBag />
          </div>

          <div>
            <h2>ShopSphere</h2>
            <span>Seller Panel</span>
          </div>
        </Link>

        <div className="seller-edit-divider" />

        <p className="seller-edit-menu-title">SELLER PANEL</p>

        <nav className="seller-edit-menu">
          <Link to="/seller/dashboard" className="seller-edit-menu-item">
            <FaThLarge />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/seller/products"
            className={`seller-edit-menu-item ${
              location.pathname === "/seller/products" ? "active" : ""
            }`}
          >
            <FaBoxOpen />
            <span>My Products</span>
          </Link>

          <Link to="/seller/add-product" className="seller-edit-menu-item">
            <FaPlusCircle />
            <span>Add Product</span>
          </Link>

          <Link to="/seller/orders" className="seller-edit-menu-item">
            <FaClipboardList />
            <span>Orders</span>
          </Link>

          <Link to="/products" className="seller-edit-menu-item">
            <FaEye />
            <span>View Products</span>
          </Link>

          <Link to="/seller/products" className="seller-edit-menu-item">
            <FaBoxes />
            <span>Inventory</span>
          </Link>

          <button type="button" className="seller-edit-menu-item">
            <FaUser />
            <span>Seller Account</span>
          </button>
        </nav>

        <div className="seller-edit-business-card">
          <div>
            <FaEdit />
          </div>

          <strong>Product Management</strong>

          <p>Keep your product information, pricing and inventory updated.</p>
        </div>

        <button
          type="button"
          className="seller-edit-logout"
          onClick={handleLogout}
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </aside>

      <div className="seller-edit-main">
        <header className="seller-edit-topbar">
          <div className="seller-edit-search">
            <FaSearch />
            <input type="text" placeholder="Search products..." />
          </div>

          <div className="seller-edit-top-actions">
            <button
              type="button"
              className="seller-edit-notification"
              aria-label="Notifications"
            >
              <FaBell />
              <span>2</span>
            </button>

            <div className="seller-edit-account">
              <div className="seller-edit-account-avatar">
                <FaUser />
              </div>

              <div className="seller-edit-account-info">
                <strong>Seller Account</strong>
                <small>Seller</small>
              </div>

              <FaChevronDown />
            </div>
          </div>
        </header>

        <main className="seller-edit-content">
          <div className="seller-edit-heading">
            <div>
              <button
                type="button"
                className="seller-edit-back"
                onClick={() => navigate("/seller/products")}
              >
                <FaArrowLeft />
                Back to Products
              </button>

              <span>PRODUCT MANAGEMENT</span>
              <h1>Edit Product</h1>
              <p>Update product information, pricing and inventory.</p>
            </div>

            <div className="seller-edit-product-id">
              Product ID
              <strong>#{id}</strong>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="seller-edit-form-layout">
              <div className="seller-edit-form-left">
                <section className="seller-edit-card">
                  <div className="seller-edit-card-heading">
                    <div className="seller-edit-card-icon">
                      <FaBoxOpen />
                    </div>

                    <div>
                      <h2>Basic Information</h2>
                      <p>Update the basic product information.</p>
                    </div>
                  </div>

                  <div className="seller-edit-form-grid">
                    <div className="seller-edit-field">
                      <label>
                        Product Name
                        <span>*</span>
                      </label>

                      <input
                        type="text"
                        name="name"
                        value={product.name}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="seller-edit-field">
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

                    <div className="seller-edit-field">
                      <label>Brand</label>

                      <input
                        type="text"
                        name="brand"
                        value={product.brand}
                        onChange={handleChange}
                        placeholder="Enter brand"
                      />
                    </div>
                  </div>
                </section>

                <section className="seller-edit-card">
                  <div className="seller-edit-card-heading">
                    <div className="seller-edit-card-icon">₹</div>

                    <div>
                      <h2>Pricing & Inventory</h2>
                      <p>Update price and stock.</p>
                    </div>
                  </div>

                  <div className="seller-edit-form-grid">
                    <div className="seller-edit-field">
                      <label>
                        Price (₹)
                        <span>*</span>
                      </label>

                      <input
                        type="number"
                        name="price"
                        value={product.price}
                        onChange={handleChange}
                        min="1"
                      />
                    </div>

                    <div className="seller-edit-field">
                      <label>Strikethrough Price (₹)</label>

                      <input
                        type="number"
                        name="oldPrice"
                        value={product.oldPrice}
                        onChange={handleChange}
                        min="1"
                        placeholder="Optional — shows as a deal"
                      />
                    </div>

                    <div className="seller-edit-field">
                      <label>
                        Stock Quantity
                        <span>*</span>
                      </label>

                      <input
                        type="number"
                        name="stock"
                        value={product.stock}
                        onChange={handleChange}
                        min="0"
                      />
                    </div>
                  </div>
                </section>

                <section className="seller-edit-card">
                  <div className="seller-edit-card-heading">
                    <div className="seller-edit-card-icon">
                      <FaEdit />
                    </div>

                    <div>
                      <h2>Product Description</h2>
                      <p>Update detailed product information.</p>
                    </div>
                  </div>

                  <div className="seller-edit-field">
                    <label>
                      Description
                      <span>*</span>
                    </label>

                    <textarea
                      name="description"
                      value={product.description}
                      onChange={handleChange}
                      rows="7"
                    />
                  </div>
                </section>
              </div>

              <div className="seller-edit-form-right">
                <section className="seller-edit-card">
                  <div className="seller-edit-card-heading">
                    <div className="seller-edit-card-icon">
                      <FaImage />
                    </div>

                    <div>
                      <h2>Product Images</h2>
                      <p>Manage existing images or add up to 6 total.</p>
                    </div>
                  </div>

                  {visibleExistingImages.length > 0 && (
                    <div className="seller-image-preview-grid">
                      {visibleExistingImages.map((img) => {
                        const isThumbnail = newThumbnailId
                          ? newThumbnailId === img.id
                          : !!img.is_thumbnail;

                        return (
                          <div className="seller-image-preview-item" key={img.id}>
                            <img
                              src={resolveImageUrl(img.image_url)}
                              alt={product.name}
                            />

                            {isThumbnail && (
                              <span className="seller-thumbnail-badge">Thumbnail</span>
                            )}

                            {!isThumbnail && (
                              <button
                                type="button"
                                className="seller-set-thumbnail-btn"
                                onClick={() => setNewThumbnailId(img.id)}
                              >
                                Set as Thumbnail
                              </button>
                            )}

                            <button
                              type="button"
                              className="seller-remove-image-btn"
                              onClick={() => removeExistingImage(img.id)}
                              aria-label="Remove image"
                            >
                              <FaImage />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <label className="seller-edit-upload">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                    />

                    <div className="seller-edit-upload-icon">
                      <FaCloudUploadAlt />
                    </div>

                    <strong>Add More Images</strong>
                    <span>Click to select images</span>
                    <small>PNG, JPG or WEBP</small>
                  </label>

                  {newImagePreviews.length > 0 && (
                    <div className="seller-image-preview-grid">
                      {newImagePreviews.map((preview, index) => (
                        <div className="seller-image-preview-item" key={preview}>
                          <img src={preview} alt={`New ${index + 1}`} />
                          <button
                            type="button"
                            className="seller-remove-image-btn"
                            onClick={() => removeNewImageAt(index)}
                            aria-label="Remove image"
                          >
                            <FaImage />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <div className="seller-edit-info-note">
                  <FaCheckCircle />

                  <div>
                    <strong>Before Updating</strong>

                    <p>
                      Check the product name, price, stock and description
                      before saving your changes.
                    </p>
                  </div>
                </div>

                {error && (
                  <p style={{ color: "#dc3545", fontSize: "13px" }}>{error}</p>
                )}
              </div>
            </div>

            <div className="seller-edit-actions">
              <button
                type="button"
                className="seller-edit-cancel"
                onClick={() => navigate("/seller/products")}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="seller-edit-save"
                disabled={submitting}
              >
                <FaSave />
                {submitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}

export default EditProduct;
