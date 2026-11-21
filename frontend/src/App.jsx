import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

// ================= PUBLIC PAGES =================
import Home from "./pages/public/Home";
import Products from "./pages/public/Products";
import Categories from "./pages/public/Categories";
import Deals from "./pages/public/Deals";
import About from "./pages/public/About";
import Contact from "./pages/public/Contact";
import Wishlist from "./pages/public/Wishlist";
import ProductDetails from "./pages/public/ProductDetails";
import NotFound from "./pages/public/NotFound";
import NewArrivals from "./pages/public/NewArrivals";

// ================= CUSTOMER AUTH =================
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

// ================= CUSTOMER ACCOUNT =================
import Account from "./pages/account/Account";

// ================= CART & CHECKOUT =================
import Cart from "./pages/cart/Cart";
import Checkout from "./pages/checkout/Checkout";
import Payment from "./pages/checkout/Payment";

// ================= SELLER PAGES =================
import SellerLogin from "./pages/seller/SellerLogin";
import SellerDashboard from "./pages/seller/SellerDashboard";
import SellerProducts from "./pages/seller/SellerProducts";
import AddProduct from "./pages/seller/AddProduct";
import EditProduct from "./pages/seller/EditProduct";
import SellerOrders from "./pages/seller/SellerOrders";
import SellerOrderDetails from "./pages/seller/SellerOrderDetails";

// ================= ADMIN PAGES =================
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageProducts from "./pages/admin/ManageProducts";
import ManageOrders from "./pages/admin/ManageOrders";

// ================= PROTECTED ROUTES =================
import CustomerProtectedRoute from "./components/auth/CustomerProtectedRoute";
import SellerProtectedRoute from "./components/auth/SellerProtectedRoute";
import AdminProtectedRoute from "./components/auth/AdminProtectedRoute";

function AppContent() {
  const location = useLocation();

  // =========================================
  // CHECK CURRENT PAGE TYPE
  // =========================================

  const isCustomerAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/forgot-password" ||
    location.pathname === "/reset-password";

  const isSellerPage =
    location.pathname.startsWith("/seller");

  const isAdminPage =
    location.pathname.startsWith("/admin");

  // Customer Navbar/Footer should NOT appear
  // on login/register/seller/admin pages.

  const showCustomerLayout =
    !isCustomerAuthPage &&
    !isSellerPage &&
    !isAdminPage;

  return (
    <>
      {/* =========================================
          CUSTOMER NAVBAR
      ========================================= */}

      {showCustomerLayout && <Navbar />}

      <Routes>

        {/* =========================================
            PUBLIC HOME
        ========================================= */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/home"
          element={<Home />}
        />

        {/* =========================================
            CUSTOMER LOGIN / REGISTER
        ========================================= */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        {/* =========================================
            PUBLIC PRODUCTS
        ========================================= */}

        <Route
          path="/products"
          element={<Products />}
        />

        <Route
          path="/product/:id"
          element={<ProductDetails />}
        />

        {/* =========================================
            PUBLIC CATEGORIES
        ========================================= */}

        <Route
          path="/categories"
          element={<Categories />}
        />

        {/* =========================================
            PUBLIC DEALS
        ========================================= */}

        <Route
          path="/deals"
          element={<Deals />}
        />

        {/* =========================================
            NEW ARRIVALS
        ========================================= */}

        <Route
          path="/new-arrivals"
          element={<NewArrivals />}
        />

        {/* =========================================
            ABOUT
        ========================================= */}

        <Route
          path="/about"
          element={<About />}
        />

        {/* =========================================
            CONTACT
        ========================================= */}

        <Route
          path="/contact"
          element={<Contact />}
        />

        {/* =========================================
            WISHLIST
        ========================================= */}

        <Route
          path="/wishlist"
          element={<Wishlist />}
        />

        {/* =========================================
            CART
        ========================================= */}

        <Route
          path="/cart"
          element={<Cart />}
        />

        {/* =====================================================
            CUSTOMER PROTECTED ACCOUNT
        ===================================================== */}

        <Route
          path="/account"
          element={
            <CustomerProtectedRoute>
              <Account />
            </CustomerProtectedRoute>
          }
        />

        {/* =====================================================
            CUSTOMER PROTECTED ORDERS
        ===================================================== */}

        <Route
          path="/orders"
          element={
            <CustomerProtectedRoute>
              <Navigate
                to="/account?tab=orders"
                replace
              />
            </CustomerProtectedRoute>
          }
        />

        {/* =====================================================
            CUSTOMER PROTECTED CHECKOUT
        ===================================================== */}

        <Route
          path="/checkout"
          element={
            <CustomerProtectedRoute>
              <Checkout />
            </CustomerProtectedRoute>
          }
        />

        {/* =====================================================
            CUSTOMER PROTECTED PAYMENT
        ===================================================== */}

        <Route
          path="/payment"
          element={
            <CustomerProtectedRoute>
              <Payment />
            </CustomerProtectedRoute>
          }
        />

        {/* =====================================================
            SELLER LOGIN
            PUBLIC - Seller must be able to reach login
        ===================================================== */}

        <Route
          path="/seller/login"
          element={<SellerLogin />}
        />

        {/* =====================================================
            PROTECTED SELLER DASHBOARD
        ===================================================== */}

        <Route
          path="/seller/dashboard"
          element={
            <SellerProtectedRoute>
              <SellerDashboard />
            </SellerProtectedRoute>
          }
        />

        {/* =====================================================
            PROTECTED SELLER PRODUCTS
        ===================================================== */}

        <Route
          path="/seller/products"
          element={
            <SellerProtectedRoute>
              <SellerProducts />
            </SellerProtectedRoute>
          }
        />

        {/* =====================================================
            PROTECTED SELLER ADD PRODUCT
        ===================================================== */}

        <Route
          path="/seller/add-product"
          element={
            <SellerProtectedRoute>
              <AddProduct />
            </SellerProtectedRoute>
          }
        />

        {/* =====================================================
            PROTECTED SELLER EDIT PRODUCT
        ===================================================== */}

        <Route
          path="/seller/edit-product/:id"
          element={
            <SellerProtectedRoute>
              <EditProduct />
            </SellerProtectedRoute>
          }
        />

        {/* =====================================================
            PROTECTED SELLER ORDERS
        ===================================================== */}

        <Route
          path="/seller/orders"
          element={
            <SellerProtectedRoute>
              <SellerOrders />
            </SellerProtectedRoute>
          }
        />

        {/* =====================================================
            PROTECTED SELLER ORDER DETAILS
        ===================================================== */}

        <Route
          path="/seller/orders/:id"
          element={
            <SellerProtectedRoute>
              <SellerOrderDetails />
            </SellerProtectedRoute>
          }
        />

        {/* =====================================================
            ADMIN LOGIN
            PUBLIC - Admin must be able to reach login
        ===================================================== */}

        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />

        {/* =====================================================
            PROTECTED ADMIN DASHBOARD
        ===================================================== */}

        <Route
          path="/admin/dashboard"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />

        {/* =====================================================
            PROTECTED ADMIN USERS
        ===================================================== */}

        <Route
          path="/admin/users"
          element={
            <AdminProtectedRoute>
              <ManageUsers />
            </AdminProtectedRoute>
          }
        />

        {/* =====================================================
            PROTECTED ADMIN PRODUCTS
        ===================================================== */}

        <Route
          path="/admin/products"
          element={
            <AdminProtectedRoute>
              <ManageProducts />
            </AdminProtectedRoute>
          }
        />

        {/* =====================================================
            PROTECTED ADMIN ORDERS
        ===================================================== */}

        <Route
          path="/admin/orders"
          element={
            <AdminProtectedRoute>
              <ManageOrders />
            </AdminProtectedRoute>
          }
        />

        {/* =========================================
            404 PAGE
        ========================================= */}

        <Route
          path="*"
          element={<NotFound />}
        />

      </Routes>

      {/* =========================================
          CUSTOMER FOOTER
      ========================================= */}

      {showCustomerLayout && <Footer />}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="colored"
      />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;