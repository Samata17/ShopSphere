import {
  FaShoppingBag,
  FaShieldAlt,
  FaTruck,
  FaUndoAlt,
  FaHeadset,
  FaCheckCircle,
} from "react-icons/fa";

import "../../styles/about.css";

function About() {
  const features = [
    {
      id: 1,
      icon: <FaShieldAlt />,
      title: "Secure Shopping",
      description:
        "Shop confidently with secure transactions and reliable payment protection.",
    },
    {
      id: 2,
      icon: <FaTruck />,
      title: "Fast Delivery",
      description:
        "We aim to deliver your favorite products quickly and safely to your doorstep.",
    },
    {
      id: 3,
      icon: <FaUndoAlt />,
      title: "Easy Returns",
      description:
        "Our simple return process makes shopping convenient and worry-free.",
    },
    {
      id: 4,
      icon: <FaHeadset />,
      title: "Customer Support",
      description:
        "Our support experience is designed to help customers whenever they need assistance.",
    },
  ];

  return (
    <div className="about-page">

      {/* ================= HERO ================= */}

      <section className="about-hero">
        <div className="about-hero-content">
          <span className="about-label">ABOUT SHOPSPHERE</span>

          <h1>
            Shopping Made
            <span> Simple.</span>
          </h1>

          <p>
            ShopSphere is a modern e-commerce platform designed
            to bring products from different categories together
            in one convenient and user-friendly shopping experience.
          </p>
        </div>

        <div className="about-hero-logo">
          <div className="about-bag">
            <FaShoppingBag />
          </div>

          <h2>ShopSphere</h2>

          <p>Your World, Your Store</p>
        </div>
      </section>

      {/* ================= OUR STORY ================= */}

      <section className="about-story">
        <div className="story-content">
          <span>WHO WE ARE</span>

          <h2>Welcome to ShopSphere</h2>

          <p>
            ShopSphere was created with one simple idea — to make
            online shopping easier, faster and more convenient.
          </p>

          <p>
            From electronics and fashion to home essentials and
            beauty products, ShopSphere allows customers to explore
            a wide variety of products from one platform.
          </p>

          <div className="story-points">
            <div>
              <FaCheckCircle />
              Easy product discovery
            </div>

            <div>
              <FaCheckCircle />
              Simple and convenient shopping
            </div>

            <div>
              <FaCheckCircle />
              Multiple product categories
            </div>

            <div>
              <FaCheckCircle />
              Customer-focused experience
            </div>
          </div>
        </div>

        <div className="mission-card">
          <span>OUR MISSION</span>

          <h2>Everything You Need, One Click Away.</h2>

          <p>
            Our mission is to create a reliable digital marketplace
            where customers can discover products, compare choices,
            manage their cart and enjoy a smooth online shopping
            experience.
          </p>
        </div>
      </section>

      {/* ================= WHY SHOPSPHERE ================= */}

      <section className="why-section">
        <div className="why-heading">
          <span>WHY CHOOSE US</span>

          <h2>Why ShopSphere?</h2>

          <p>
            We're focused on making every part of your shopping
            experience simple and convenient.
          </p>
        </div>

        <div className="why-grid">
          {features.map((feature) => (
            <div
              className="why-card"
              key={feature.id}
            >
              <div className="why-icon">
                {feature.icon}
              </div>

              <h3>{feature.title}</h3>

              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

export default About;