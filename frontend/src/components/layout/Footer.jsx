import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaShoppingBag,
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaYoutube,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
} from "react-icons/fa";

import "../../styles/footer.css";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState("");

  const handleSubscribe = () => {
    if (!EMAIL_REGEX.test(newsletterEmail.trim())) {
      toast.error("Enter a valid email address");
      return;
    }

    toast.success("Subscribed! Watch your inbox for the latest offers.");
    setNewsletterEmail("");
  };

  return (
    <footer className="footer">
      <div className="footer-container">

        {/* Brand */}
        <div className="footer-column footer-brand">
          <div className="footer-logo">
            <div className="footer-logo-icon">
              <FaShoppingBag />
            </div>

            <div>
              <h2>ShopSphere</h2>
              <span>Your World, Your Store</span>
            </div>
          </div>

          <p>
            Shop your favorite products across electronics, fashion,
            lifestyle and more — all in one place.
          </p>

          <div className="social-icons">
            <a href="#" aria-label="Facebook">
              <FaFacebookF />
            </a>

            <a href="#" aria-label="Instagram">
              <FaInstagram />
            </a>

            <a href="#" aria-label="Twitter">
              <FaTwitter />
            </a>

            <a href="#" aria-label="YouTube">
              <FaYoutube />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-column">
          <h3>Quick Links</h3>

          <Link to="/">Home</Link>
          <Link to="/products">Products</Link>
          <Link to="/categories">Categories</Link>
          <Link to="/deals">Deals & Offers</Link>
          <Link to="/about">About Us</Link>
        </div>

        {/* Customer Service */}
        <div className="footer-column">
          <h3>Customer Service</h3>

          <Link to="/contact">Contact Us</Link>
          <a href="#">Help Center</a>
          <a href="#">Shipping Information</a>
          <a href="#">Returns & Refunds</a>
          <a href="#">Privacy Policy</a>
        </div>

        {/* Contact */}
        <div className="footer-column">
          <h3>Contact Us</h3>

          <div className="footer-contact">
            <FaMapMarkerAlt />
            <span>Odisha, India</span>
          </div>

          <div className="footer-contact">
            <FaPhoneAlt />
            <span>+91 98765 43210</span>
          </div>

          <div className="footer-contact">
            <FaEnvelope />
            <span>support@shopsphere.com</span>
          </div>

          <div className="newsletter">
            <p>Subscribe for latest offers</p>

            <div className="newsletter-box">
              <input
                type="email"
                placeholder="Your email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubscribe();
                }}
              />

              <button type="button" onClick={handleSubscribe}>
                Subscribe
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Footer */}

      <div className="footer-bottom">
        <p>
          © 2026 ShopSphere. All Rights Reserved.
        </p>

        <div>
          <span>Terms & Conditions</span>
          <span>Privacy Policy</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;