import api from "./client";
import { resolveImageUrl } from "../utils/image";

const mapProduct = (product) => ({
  id: product.id,
  name: product.name,
  category: product.category,
  categoryId: product.category_id || null,
  brand: product.brand || null,
  price: Number(product.price),
  oldPrice: product.old_price ? Number(product.old_price) : null,
  rating: product.avg_rating ? Number(product.avg_rating) : 0,
  reviewCount: product.review_count ? Number(product.review_count) : 0,
  soldCount: product.sold_count ? Number(product.sold_count) : 0,
  description: product.description,
  stock: product.stock,
  sellerId: product.seller_id,
  sellerName: product.seller_name,
  image: resolveImageUrl(product.image_url),
  images: (product.images || []).map((img) => ({
    id: img.id,
    url: resolveImageUrl(img.image_url),
    isThumbnail: !!img.is_thumbnail,
  })),
});

// Flat-array API kept for existing callers (Home/LatestProducts, Deals,
// NewArrivals, and the pre-pagination Products.jsx behavior) — none of them
// need to change how they consume the response.
export async function fetchProducts(params = {}) {
  const { data } = await api.get("/products", { params });
  return data.products.map(mapProduct);
}

// Used by the paginated Products listing page.
export async function fetchProductsPaginated(params = {}) {
  const { data } = await api.get("/products", { params });
  return {
    products: data.products.map(mapProduct),
    pagination: data.pagination,
  };
}

export async function fetchProductById(id) {
  const { data } = await api.get(`/products/${id}`);
  return {
    ...mapProduct(data.product),
    relatedProducts: (data.relatedProducts || []).map(mapProduct),
  };
}
