import api from "./client";

export const getSellerDashboard = async () => {
  const { data } = await api.get("/seller/dashboard");
  return data;
};

export const getSellerProducts = async () => {
  const { data } = await api.get("/seller/products");
  return data.products;
};

export const getSellerProductById = async (id) => {
  const { data } = await api.get(`/seller/products/${id}`);
  return data.product;
};

export const createSellerProduct = async (formData) => {
  const { data } = await api.post("/seller/products", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.product;
};

export const updateSellerProduct = async (id, formData) => {
  const { data } = await api.put(`/seller/products/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.product;
};

export const deleteSellerProduct = async (id) => {
  await api.delete(`/seller/products/${id}`);
};

export const getSellerOrders = async () => {
  const { data } = await api.get("/seller/orders");
  return data.orders;
};

export const getSellerOrderById = async (orderId) => {
  const { data } = await api.get(`/seller/orders/${orderId}`);
  return data.order;
};

export const updateSellerOrderItemStatus = async (itemId, status) => {
  await api.patch(`/seller/orders/items/${itemId}/status`, { status });
};
