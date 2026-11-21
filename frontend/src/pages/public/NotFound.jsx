import { Link } from "react-router-dom";
import { FaHome, FaShoppingBag } from "react-icons/fa";

import "../../styles/notFound.css";

function NotFound() {
  return (
    <div className="not-found-page">
      <p className="not-found-code">404</p>

      <h1>Page Not Found</h1>

      <p>
        Sorry, the page you're looking for doesn't exist or may have been
        moved.
      </p>

      <div className="not-found-actions">
        <Link to="/">
          <FaHome />
          Back to Home
        </Link>

        <Link to="/products" className="secondary">
          <FaShoppingBag />
          Browse Products
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
