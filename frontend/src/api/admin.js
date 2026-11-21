import api from "./client";

export const getAdminDashboard = async () => {
  const { data } = await api.get("/admin/dashboard");
  return data;
};

export const getAdminUsers = async () => {
  const { data } = await api.get("/admin/users");
  return data.users;
};

export const setUserActiveStatus = async (id, isActive) => {
  await api.patch(`/admin/users/${id}/status`, { isActive });
};

export const deleteAdminUser = async (id) => {
  await api.delete(`/admin/users/${id}`);
};

export const getAdminProducts = async () => {
  const { data } = await api.get("/admin/products");
  return data.products;
};

export const setProductActiveStatus = async (id, isActive) => {
  await api.patch(`/admin/products/${id}/status`, { isActive });
};

export const deleteAdminProduct = async (id) => {
  await api.delete(`/admin/products/${id}`);
};

export const getAdminOrders = async () => {
  const { data } = await api.get("/admin/orders");
  return data.orders;
};

export const updateAdminOrderStatus = async (id, status) => {
  await api.patch(`/admin/orders/${id}/status`, { status });
};
