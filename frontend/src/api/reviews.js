import api from "./client";

export async function fetchProductReviews(productId) {
  const { data } = await api.get(`/products/${productId}/reviews`);
  return data;
}

export async function checkCanReview(productId) {
  const { data } = await api.get(`/reviews/can-review/${productId}`);
  return data;
}

export async function addReview({ productId, rating, title, comment }) {
  const { data } = await api.post("/reviews", { productId, rating, title, comment });
  return data.review;
}

export async function updateReview(reviewId, { rating, title, comment }) {
  const { data } = await api.put(`/reviews/${reviewId}`, { rating, title, comment });
  return data.review;
}

export async function deleteReview(reviewId) {
  await api.delete(`/reviews/${reviewId}`);
}
