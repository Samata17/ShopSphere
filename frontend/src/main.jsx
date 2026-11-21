import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";

import "./styles/global.css";
import "bootstrap/dist/css/bootstrap.min.css";

// ================= CONTEXT =================

import {
  AuthProvider,
} from "./context/AuthContext";

import {
  CartProvider,
} from "./context/CartContext";

import {
  WishlistProvider,
} from "./context/WishlistContext";

import {
  OrderProvider,
} from "./context/OrderContext";

import {
  AddressProvider,
} from "./context/AddressContext";

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>

    <AuthProvider>

      <WishlistProvider>

        <CartProvider>

          <OrderProvider>

            <AddressProvider>

              <App />

            </AddressProvider>

          </OrderProvider>

        </CartProvider>

      </WishlistProvider>

    </AuthProvider>

  </React.StrictMode>
);