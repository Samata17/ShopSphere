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

const OrderContext = createContext();

const orderErrorMessage = (error) =>
  error.response?.data?.message ||
  "Unable to connect to the server. Please try again.";

const mapOrder = (order) => ({
  id: order.order_number,
  dbId: order.id,
  orderDate: order.created_at,
  status: order.status,
  paymentStatus: order.payment_status,
  paymentMethod: order.payment_method,
  customer: {
    fullName: order.shipping_name,
    phone: order.shipping_phone,
  },
  shippingAddress: {
    address: order.shipping_address,
    city: order.shipping_city,
    state: order.shipping_state,
    pincode: order.shipping_pincode,
  },
  items: (order.items || []).map((item) => ({
    id: item.id,
    name: item.product_name,
    image: resolveImageUrl(item.product_image),
    category: "",
    quantity: item.quantity,
    price: Number(item.price),
    itemStatus: item.item_status,
  })),
  subtotal: Number(order.subtotal),
  shipping: Number(order.shipping_fee),
  total: Number(order.total),
});

export function OrderProvider({ children }) {
  const { isAuthenticated, hasRole } = useAuth();

  const [orders, setOrders] = useState([]);

  const fetchOrders = useCallback(async () => {
    const { data } = await api.get("/orders");
    setOrders(data.orders.map(mapOrder));
  }, []);

  useEffect(() => {
    if (isAuthenticated && hasRole("CUSTOMER")) {
      fetchOrders();
    } else {
      setOrders([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const checkout = async (addressId, paymentMethod) => {
    try {
      const { data } = await api.post("/orders/checkout", {
        addressId,
        paymentMethod,
      });

      await fetchOrders();
      toast.success("Order placed successfully");
      return data.order;
    } catch (error) {
      toast.error(orderErrorMessage(error));
      throw error;
    }
  };

  const getOrderById = (orderNumber) => {
    return orders.find((order) => order.id === orderNumber);
  };

  const cancelOrder = async (dbId) => {
    try {
      await api.patch(`/orders/${dbId}/cancel`);
      await fetchOrders();
      toast.success("Order cancelled");
    } catch (error) {
      toast.error(orderErrorMessage(error));
      throw error;
    }
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        checkout,
        getOrderById,
        cancelOrder,
        refreshOrders: fetchOrders,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);

  if (!context) {
    throw new Error("useOrders must be used inside OrderProvider");
  }

  return context;
}
