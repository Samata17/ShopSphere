import { Link } from "react-router-dom";

import headphones from "../../assets/products/headphones.png";
import backpack from "../../assets/products/backpack.png";

function OfferBanners() {
  return (
    <section className="offer-banners">

      <div className="offer-card electronics-offer">
        <div className="offer-text">
          <span>Special Offer</span>
          <h3>Up to 60% Off</h3>
          <p>On Electronics</p>

          <Link to="/products">Shop Now</Link>
        </div>

        <img src={headphones} alt="Electronics Offer" />
      </div>

      <div className="offer-card fashion-offer">
        <div className="offer-text">
          <span>Fashion Sale</span>
          <h3>Min. 40% Off</h3>
          <p>On Top Brands</p>

          <Link to="/products">Explore Now</Link>
        </div>

        <img src={backpack} alt="Fashion Offer" />
      </div>

      <div className="offer-card home-offer">
        <div className="offer-text">
          <span>Home Essentials</span>
          <h3>Up to 30% Off</h3>
          <p>Make Your Home Better</p>

          <Link to="/products">Shop Now</Link>
        </div>

        <div className="home-offer-icon">🪴</div>
      </div>

    </section>
  );
}

export default OfferBanners;