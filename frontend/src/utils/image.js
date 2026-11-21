import { API_ORIGIN } from "../api/client";

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect width='300' height='300' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23aaaaaa' font-family='sans-serif' font-size='18'%3ENo Image%3C/text%3E%3C/svg%3E";

export function resolveImageUrl(imageUrl) {
  if (!imageUrl) return PLACEHOLDER_IMAGE;

  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  if (imageUrl.startsWith("/uploads/")) {
    return `${API_ORIGIN}${imageUrl}`;
  }

  // Legacy/manually-entered image_url values without a leading slash
  return PLACEHOLDER_IMAGE;
}

export { PLACEHOLDER_IMAGE };
