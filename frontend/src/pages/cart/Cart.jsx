import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";

function Cart() {
  const navigate = useNavigate();

  const {
    cartItems,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
  } = useCart();

  // Calculate total cart price
  const totalPrice = cartItems.reduce(
    (total, item) =>
      total + item.price * item.quantity,
    0
  );

  return (
    <div
      style={{
        padding: "60px 8%",
        minHeight: "500px",
      }}
    >
      {/* ================= HEADING ================= */}

      <h1
        style={{
          textAlign: "center",
          marginBottom: "40px",
          color: "#29253e",
        }}
      >
        Shopping Cart
      </h1>

      {/* ================= EMPTY CART ================= */}

      {cartItems.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
          }}
        >
          <h2
            style={{
              color: "#333",
              marginBottom: "10px",
            }}
          >
            Your cart is currently empty.
          </h2>

          <p
            style={{
              color: "#888",
              marginBottom: "25px",
            }}
          >
            Add some products to your cart and
            they will appear here.
          </p>

          <button
            onClick={() => navigate("/products")}
            style={{
              background: "#7045e7",
              color: "white",
              border: "none",
              padding: "12px 25px",
              borderRadius: "7px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <>
          {/* ================= CART PRODUCTS ================= */}

          {cartItems.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "25px",
                padding: "20px",
                marginBottom: "20px",
                border: "1px solid #eee",
                borderRadius: "12px",
                background: "#fff",
              }}
            >
              {/* Product Image */}

              <img
                src={item.image}
                alt={item.name}
                style={{
                  width: "120px",
                  height: "120px",
                  objectFit: "contain",
                }}
              />

              {/* Product Information */}

              <div
                style={{
                  flex: 1,
                }}
              >
                <h3
                  style={{
                    marginBottom: "7px",
                    color: "#29253e",
                  }}
                >
                  {item.name}
                </h3>

                <p
                  style={{
                    color: "#888",
                    marginBottom: "7px",
                  }}
                >
                  {item.category}
                </p>

                <strong
                  style={{
                    color: "#7045e7",
                  }}
                >
                  ₹{item.price}
                </strong>
              </div>

              {/* ================= QUANTITY ================= */}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    decreaseQuantity(item.id)
                  }
                  style={{
                    width: "32px",
                    height: "32px",
                    border: "1px solid #ddd",
                    background: "#fff",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  −
                </button>

                <strong>
                  {item.quantity}
                </strong>

                <button
                  type="button"
                  onClick={() =>
                    increaseQuantity(item.id)
                  }
                  style={{
                    width: "32px",
                    height: "32px",
                    border: "1px solid #ddd",
                    background: "#fff",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  +
                </button>
              </div>

              {/* Product Subtotal */}

              <strong
                style={{
                  minWidth: "90px",
                  textAlign: "center",
                  color: "#29253e",
                }}
              >
                ₹{item.price * item.quantity}
              </strong>

              {/* Remove */}

              <button
                type="button"
                onClick={() =>
                  removeFromCart(item.id)
                }
                style={{
                  background: "#fff",
                  color: "#e34b4b",
                  border: "1px solid #e34b4b",
                  padding: "8px 14px",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Remove
              </button>
            </div>
          ))}

          {/* ================= CART TOTAL ================= */}

          <div
            style={{
              marginTop: "35px",
              paddingTop: "25px",
              borderTop: "1px solid #eee",
              textAlign: "right",
            }}
          >
            <p
              style={{
                color: "#888",
                marginBottom: "5px",
              }}
            >
              Cart Total
            </p>

            <h2
              style={{
                color: "#29253e",
                marginBottom: "20px",
              }}
            >
              ₹{totalPrice}
            </h2>

            {/* Continue Shopping */}

            <button
              type="button"
              onClick={() =>
                navigate("/products")
              }
              style={{
                background: "#fff",
                color: "#7045e7",
                border: "1px solid #7045e7",
                padding: "13px 25px",
                borderRadius: "7px",
                cursor: "pointer",
                marginRight: "10px",
                fontWeight: "600",
              }}
            >
              Continue Shopping
            </button>

            {/* Proceed to Checkout */}

            <button
              type="button"
              onClick={() =>
                navigate("/checkout")
              }
              style={{
                background: "#7045e7",
                color: "white",
                border: "none",
                padding: "14px 30px",
                borderRadius: "7px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;