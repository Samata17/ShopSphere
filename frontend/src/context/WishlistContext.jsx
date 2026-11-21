import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

import { toast } from "react-toastify";

import api from "../api/client";
import { resolveImageUrl } from "../utils/image";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext();

const wishlistErrorMessage = (error) =>
  error.response?.data?.message ||
  "Unable to connect to the server. Please try again.";

const mapBackendItem = (item) => ({
  id: item.product_id,
  name: item.name,
  category: item.category,
  price: Number(item.price),
  oldPrice: item.old_price ? Number(item.old_price) : null,
  image: resolveImageUrl(item.image_url),
  stock: item.stock,
});

export function WishlistProvider({ children }) {
  const { isAuthenticated } = useAuth();

  const [wishlistItems, setWishlistItems] = useState([]);

  const fetchWishlist = useCallback(async () => {
    const { data } = await api.get("/wishlist");
    setWishlistItems(data.items.map(mapBackendItem));
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    } else {
      setWishlistItems([]);
    }
  }, [isAuthenticated, fetchWishlist]);

  // Wishlist requires an account — callers should check isAuthenticated
  // and redirect to login before invoking these.
  const addToWishlist = async (product) => {
    if (!isAuthenticated) return;

    try {
      await api.post("/wishlist", { productId: product.id });
      await fetchWishlist();
      toast.success("Added to Wishlist");
    } catch (error) {
      toast.error(wishlistErrorMessage(error));
      throw error;
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!isAuthenticated) return;

    try {
      await api.delete(`/wishlist/${productId}`);
      await fetchWishlist();
      toast.success("Removed from Wishlist");
    } catch (error) {
      toast.error(wishlistErrorMessage(error));
      throw error;
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => item.id === productId);
  };

  const toggleWishlist = async (product) => {
    if (isInWishlist(product.id)) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
