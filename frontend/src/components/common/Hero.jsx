import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

// ================= HERO IMAGES =================

import heroProducts from "../../assets/hero/hero-products.png";
import heroElectronics from "../../assets/hero/hero-electronics.png";
import heroSunglasses from "../../assets/hero/hero-sunglasses.png";
import heroAirFryer from "../../assets/hero/hero-airfryer.png";

// ================= CSS =================

import "../../styles/home.css";

function Hero() {
  // ================= SLIDES =================

  const slides = [
    {
      id: 1,
      badge: "BIG SAVINGS",
      title: "Upgrade Your World",
      highlight: "With The Best Deals",
      description:
        "Discover top-quality products across electronics, fashion, home & more. Shop now and enjoy exclusive offers!",
      image: heroProducts,
      buttonText: "Shop Now →",
      link: "/products",
    },

    {
      id: 2,
      badge: "SMART TECHNOLOGY",
      title: "Discover The Latest",
      highlight: "Electronics & Gadgets",
      description:
        "Upgrade your everyday life with smartphones, smart devices and modern technology.",
      image: heroElectronics,
      buttonText: "Explore Electronics →",
      link: "/products?category=Electronics",
    },

    {
      id: 3,
      badge: "NEW COLLECTION",
      title: "Style That Makes",
      highlight: "You Stand Out",
      description:
        "Discover stylish sunglasses designed to complete your everyday look.",
      image: heroSunglasses,
      buttonText: "Shop Fashion →",
      link: "/products?category=Fashion",
    },

    {
      id: 4,
      badge: "HOME ESSENTIALS",
      title: "Make Your Home",
      highlight: "Better Every Day",
      description:
        "Discover useful home and kitchen products designed to make everyday living easier.",
      image: heroAirFryer,
      buttonText: "Explore Home →",
      link: "/products?category=Home%20%26%20Living",
    },
  ];

  // ================= CURRENT SLIDE =================

  const [currentSlide, setCurrentSlide] = useState(0);

  // ================= AUTO CAROUSEL =================

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((current) =>
        current === slides.length - 1
          ? 0
          : current + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  // ================= NEXT =================

  const nextSlide = () => {
    setCurrentSlide((current) =>
      current === slides.length - 1
        ? 0
        : current + 1
    );
  };

  // ================= PREVIOUS =================

  const previousSlide = () => {
    setCurrentSlide((current) =>
      current === 0
        ? slides.length - 1
        : current - 1
    );
  };

  const slide = slides[currentSlide];

  return (
    <section className="shop-hero">

      {/* ================= LEFT CONTENT ================= */}

      <div
        className="hero-content"
        key={`content-${slide.id}`}
      >
        <span className="hero-badge">
          {slide.badge}
        </span>

        <h1>
          {slide.title}

          <span>{slide.highlight}</span>
        </h1>

        <p>{slide.description}</p>

        <Link
          to={slide.link}
          className="hero-shop-btn"
        >
          {slide.buttonText}
        </Link>
      </div>

      {/* ================= IMAGE ================= */}

      <div
        className="hero-product-area"
        key={`product-${slide.id}`}
      >
        <div className="hero-circle" />

        <img
          src={slide.image}
          alt={slide.title}
          className={
            slide.id === 1
              ? "hero-carousel-image hero-first-image"
              : "hero-carousel-image"
          }
        />
      </div>

      {/* ================= LEFT ARROW ================= */}

      <button
        type="button"
        className="hero-arrow hero-arrow-left"
        onClick={previousSlide}
        aria-label="Previous slide"
      >
        <FaChevronLeft />
      </button>

      {/* ================= RIGHT ARROW ================= */}

      <button
        type="button"
        className="hero-arrow hero-arrow-right"
        onClick={nextSlide}
        aria-label="Next slide"
      >
        <FaChevronRight />
      </button>

      {/* ================= DOTS ================= */}

      <div className="hero-dots">
        {slides.map((item, index) => (
          <button
            type="button"
            key={item.id}
            onClick={() => setCurrentSlide(index)}
            className={
              currentSlide === index
                ? "hero-dot active"
                : "hero-dot"
            }
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

    </section>
  );
}

export default Hero;