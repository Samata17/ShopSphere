import Hero from "../../components/common/Hero";
import Services from "../../components/common/Services";
import LatestProducts from "../../components/common/LatestProducts";
import OfferBanners from "../../components/common/OfferBanners";

function Home() {
  return (
    <>
      <Hero />
      <Services />
      <LatestProducts />
      <OfferBanners />
    </>
  );
}

export default Home;