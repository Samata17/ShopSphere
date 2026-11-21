import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";

import { toast } from "react-toastify";

import api from "../api/client";
import { resolveImageUrl } from "../utils/image";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

const cartErrorMessage = (error) =>
  error.response?.data?.message ||
  "Unable to connect to the server. Please try again.";

const GUEST_CART_KEY = "shopsphere-cart";

const loadGuestCart = () => {
  try {
    const saved = localStorage.getItem(GUEST_CART_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const saveGuestCart = (items) => {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
};

const mapBackendItem = (item) => ({
  id: item.product_id,
  name: item.name,
  category: item.category,
  price: Number(item.price),
  oldPrice: item.old_price ? Number(item.old_price) : null,
  image: resolveImageUrl(item.image_url),
  stock: item.stock,
  quantity: item.quantity,
});

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();

  const [cartItems, setCartItems] = useState(loadGuestCart);
  const previouslyAuthenticated = useRef(false);

  // ==========================================
  // FETCH BACKEND CART
  // ==========================================

  const fetchCart = useCallback(async () => {
    const { data } = await api.get("/cart");
    setCartItems(data.items.map(mapBackendItem));
  }, []);

  useEffect(() => {
    const syncOnAuthChange = async () => {
      if (isAuthenticated && !previouslyAuthenticated.current) {
        // Just logged in — merge any guest cart into the backend cart.
        const guestItems = loadGuestCart();

        if (guestItems.length > 0) {
          await api.post("/cart/merge", {
            items: guestItems.map((item) => ({
              productId: item.id,
              quantity: item.quantity,
            })),
          });
          localStorage.removeItem(GUEST_CART_KEY);
        }

        await fetchCart();
      } else if (!isAuthenticated && previouslyAuthenticated.current) {
        // Just logged out — fall back to (now empty) guest cart.
        setCartItems(loadGuestCart());
      } else if (isAuthenticated) {
        await fetchCart();
      }

      previouslyAuthenticated.current = isAuthenticated;
    };

    syncOnAuthChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Persist guest cart to localStorage whenever it changes (guest mode only).
  useEffect(() => {
    if (!isAuthenticated) {
      saveGuestCart(cartItems);
    }
  }, [cartItems, isAuthenticated]);

  // ==========================================
  // ADD TO CART
  // ==========================================

  const addToCart = async (product, quantity = 1) => {
    const alreadyInCart = cartItems.some((item) => item.id === product.id);

    try {
      if (isAuthenticated) {
        await api.post("/cart", { productId: product.id, quantity });
        await fetchCart();
      } else {
        setCartItems((currentItems) => {
          const existingItem = currentItems.find((item) => item.id === product.id);

          if (existingItem) {
            return currentItems.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          }

          return [...currentItems, { ...product, quantity }];
        });
      }

      if (alreadyInCart) {
        toast.warn("Product already in cart — quantity increased");
      } else {
        toast.success("Product added to cart");
      }
    } catch (error) {
      toast.error(`Failed to add product to cart: ${cartErrorMessage(error)}`);
      throw error;
    }
  };

  // ==========================================
  // REMOVE FROM CART
  // ==========================================

  const removeFromCart = async (id) => {
    try {
      if (isAuthenticated) {
        await api.delete(`/cart/${id}`);
        await fetchCart();
      } else {
        setCartItems((currentItems) =>
          currentItems.filter((item) => item.id !== id)
        );
      }

      toast.success("Product removed from cart");
    } catch (error) {
      toast.error(cartErrorMessage(error));
      throw error;
    }
  };

  // ==========================================
  // INCREASE / DECREASE QUANTITY
  // ==========================================

  const increaseQuantity = async (id) => {
    try {
      if (isAuthenticated) {
        await api.post("/cart", { productId: id, quantity: 1 });
        await fetchCart();
        return;
      }

      setCartItems((currentItems) =>
        currentItems.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } catch (error) {
      toast.error(cartErrorMessage(error));
      throw error;
    }
  };

  const decreaseQuantity = async (id) => {
    const currentItem = cartItems.find((item) => item.id === id);
    if (!currentItem) return;

    const newQuantity = currentItem.quantity - 1;

    try {
      if (isAuthenticated) {
        if (newQuantity < 1) {
          await api.delete(`/cart/${id}`);
        } else {
          await api.put(`/cart/${id}`, { quantity: newQuantity });
        }
        await fetchCart();
        return;
      }

      setCartItems((currentItems) =>
        currentItems
          .map((item) =>
            item.id === id ? { ...item, quantity: item.quantity - 1 } : item
          )
          .filter((item) => item.quantity > 0)
      );
    } catch (error) {
      toast.error(cartErrorMessage(error));
      throw error;
    }
  };

  // ==========================================
  // CLEAR CART
  // ==========================================

  const clearCart = async () => {
    if (isAuthenticated) {
      await api.delete("/cart");
      setCartItems([]);
      return;
    }

    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        refreshCart: isAuthenticated ? fetchCart : async () => {},
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
