import {
  FaTruck,
  FaShieldAlt,
  FaUndoAlt,
  FaHeadset,
} from "react-icons/fa";

function Services() {
  const services = [
    {
      icon: <FaTruck />,
      title: "Free Shipping",
      text: "On orders over ₹499",
    },
    {
      icon: <FaShieldAlt />,
      title: "Secure Payment",
      text: "100% secure payment",
    },
    {
      icon: <FaUndoAlt />,
      title: "Easy Returns",
      text: "30-day return policy",
    },
    {
      icon: <FaHeadset />,
      title: "24/7 Support",
      text: "We are here to help",
    },
  ];

  return (
    <section className="services-section">
      {services.map((service, index) => (
        <div className="service-item" key={index}>
          <div className="service-icon">{service.icon}</div>

          <div>
            <h4>{service.title}</h4>
            <p>{service.text}</p>
          </div>
        </div>
      ))}
    </section>
  );
}

export default Services;