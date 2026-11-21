import { useState } from "react";
import { toast } from "react-toastify";
import {
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaClock,
  FaPaperPlane,
} from "react-icons/fa";

import "../../styles/contact.css";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [success, setSuccess] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setSuccess(false);
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.subject.trim() ||
      !formData.message.trim()
    ) {
      return;
    }

    // Backend will be connected later
    setSuccess(true);
    toast.success("Message sent successfully!");

    // Clear form
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });

    // Hide success message after 3 seconds
    setTimeout(() => {
      setSuccess(false);
    }, 3000);
  };

  return (
    <div className="contact-page">

      {/* ================= HEADING ================= */}

      <div className="contact-heading">
        <span>CONTACT US</span>

        <h1>We'd Love to Hear From You</h1>

        <p>
          Have a question or need help? Send us a message and
          we'll be happy to assist you.
        </p>
      </div>

      {/* ================= CONTACT CONTAINER ================= */}

      <div className="contact-container">

        {/* ================= CONTACT INFORMATION ================= */}

        <div className="contact-info">
          <h2>Get in Touch</h2>

          <p className="contact-description">
            Our team is here to help with questions about
            products, orders and your ShopSphere experience.
          </p>

          {/* Email */}

          <div className="contact-info-item">
            <div className="contact-icon">
              <FaEnvelope />
            </div>

            <div>
              <h3>Email</h3>
              <p>support@shopsphere.com</p>
            </div>
          </div>

          {/* Phone */}

          <div className="contact-info-item">
            <div className="contact-icon">
              <FaPhoneAlt />
            </div>

            <div>
              <h3>Phone</h3>
              <p>+91 98765 43210</p>
            </div>
          </div>

          {/* Location */}

          <div className="contact-info-item">
            <div className="contact-icon">
              <FaMapMarkerAlt />
            </div>

            <div>
              <h3>Location</h3>
              <p>Odisha, India</p>
            </div>
          </div>

          {/* Support Hours */}

          <div className="contact-info-item">
            <div className="contact-icon">
              <FaClock />
            </div>

            <div>
              <h3>Support Hours</h3>
              <p>Monday – Saturday, 9 AM – 6 PM</p>
            </div>
          </div>
        </div>

        {/* ================= CONTACT FORM ================= */}

        <div className="contact-form-wrapper">
          <h2>Send a Message</h2>

          {/* Success Message */}

          {success && (
            <div className="contact-success">
              ✓ Message sent successfully!
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* NAME */}

            <div className="form-group">
              <label>Your Name</label>

              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* EMAIL */}

            <div className="form-group">
              <label>Email Address</label>

              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* ================= SUBJECT DROPDOWN ================= */}

            <div className="form-group">
              <label>Subject</label>

              <select
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
              >
                <option value="" disabled>
                  Select a subject
                </option>

                <option value="Order Issue">
                  Order Issue
                </option>

                <option value="Payment Issue">
                  Payment Issue
                </option>

                <option value="Delivery Issue">
                  Delivery Issue
                </option>

                <option value="Return / Refund">
                  Return / Refund
                </option>

                <option value="Product Inquiry">
                  Product Inquiry
                </option>

                <option value="Account Issue">
                  Account Issue
                </option>

                <option value="Other">
                  Other
                </option>
              </select>
            </div>

            {/* MESSAGE */}

            <div className="form-group">
              <label>Message</label>

              <textarea
                name="message"
                rows="5"
                placeholder="Write your message..."
                value={formData.message}
                onChange={handleChange}
                required
              />
            </div>

            {/* SUBMIT BUTTON */}

            <button
              type="submit"
              className="contact-submit"
            >
              <FaPaperPlane />
              Send Message
            </button>

          </form>
        </div>

      </div>
    </div>
  );
}

export default Contact;