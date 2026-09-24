import { API_BASE } from "../config";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Minus,
  Package,
  Plus,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

type Product = {
  sid: number;
  product_name: string;
  category: string;
  quantity: number;
  unit: string;
  price_per_unit: number;
  image_url?: string;
  farmer_name?: string;
};

type CartItem = Product & {
  cart_quantity: number;
};

function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [buyerName, setBuyerName] = useState("Buyer");

  useEffect(() => {
    const storedBuyer = localStorage.getItem("buyer");

    if (!storedBuyer) {
      navigate("/login");
      return;
    }

    try {
      const buyer = JSON.parse(storedBuyer);

      setBuyerName(buyer?.name || "Buyer");

      if (!buyer?.sid) {
        return;
      }

      const cartKey = `kisanmitra_cart_${buyer.sid}`;
      const storedCart = localStorage.getItem(cartKey);

      if (!storedCart) {
        setCart([]);
        return;
      }

      const parsedCart = JSON.parse(storedCart);

      if (Array.isArray(parsedCart)) {
        setCart(parsedCart);
      }
    } catch (error) {
      console.error("CART LOAD ERROR:", error);
      setCart([]);
    }
  }, [navigate]);

  const getCartKey = () => {
    const storedBuyer = localStorage.getItem("buyer");

    if (!storedBuyer) return null;

    try {
      const buyer = JSON.parse(storedBuyer);

      if (!buyer?.sid) return null;

      return `kisanmitra_cart_${buyer.sid}`;
    } catch {
      return null;
    }
  };

  const saveCart = (updatedCart: CartItem[]) => {
    setCart(updatedCart);

    const cartKey = getCartKey();

    if (cartKey) {
      localStorage.setItem(
        cartKey,
        JSON.stringify(updatedCart)
      );
    }
  };

  const increaseQuantity = (sid: number) => {
    const updatedCart = cart.map((item) => {
      if (item.sid !== sid) return item;

      if (
        item.cart_quantity >=
        Number(item.quantity)
      ) {
        return item;
      }

      return {
        ...item,
        cart_quantity: item.cart_quantity + 1,
      };
    });

    saveCart(updatedCart);
  };

  const decreaseQuantity = (sid: number) => {
    const updatedCart = cart
      .map((item) => {
        if (item.sid !== sid) return item;

        return {
          ...item,
          cart_quantity: item.cart_quantity - 1,
        };
      })
      .filter((item) => item.cart_quantity > 0);

    saveCart(updatedCart);
  };

  const removeItem = (sid: number) => {
    saveCart(
      cart.filter((item) => item.sid !== sid)
    );
  };

  const totalItems = cart.reduce(
    (total, item) =>
      total + item.cart_quantity,
    0
  );

  const totalCost = cart.reduce(
    (total, item) =>
      total +
      Number(item.price_per_unit) *
        item.cart_quantity,
    0
  );

  const [buying, setBuying] = useState(false);

  const finalBuy = async () => {
    if (!cart.length || buying) return;

    const storedBuyer = localStorage.getItem("buyer");
    if (!storedBuyer) {
      navigate("/login");
      return;
    }

    try {
      const buyer = JSON.parse(storedBuyer);

      if (!buyer?.sid) {
        alert("Buyer information is missing. Please login again.");
        return;
      }

      setBuying(true);

      const response = await fetch(`${API_BASE}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          buyer_sid: buyer.sid,
          delivery_address: buyer.location || "Buyer address",
          items: cart.map((item) => ({
            product_sid: item.sid,
            quantity: item.cart_quantity,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to place order");
      }

      saveCart([]);
      alert(
        `Order placed successfully for ₹${Number(
          data.order?.total_amount ?? totalCost
        ).toLocaleString("en-IN")}`
      );
    } catch (error) {
      console.error("ORDER ERROR:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Unable to place order"
      );
    } finally {
      setBuying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050705] text-white">
      <main className="mx-auto min-h-screen max-w-[1250px] px-5 py-8 sm:px-8 lg:px-12">
        <button
          onClick={() =>
            navigate("/buyer-dashboard")
          }
          className="mb-8 flex items-center gap-2 rounded-xl border border-[#3f6f3f] bg-[#132013] px-4 py-2.5 text-sm font-medium text-[#8fbd8f] transition hover:bg-[#1b2d1b] hover:text-[#b4d8b4]"
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </button>

        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-[#39ff14]/75">
              BUYER CART
            </p>

            <h1 className="text-3xl font-semibold sm:text-4xl">
              {buyerName}'s Cart
            </h1>

            <p className="mt-2 text-sm text-white/35">
              Review your selected produce before buying.
            </p>
          </div>

          <div className="hidden h-12 w-12 items-center justify-center rounded-xl border border-white/[0.07] bg-[#090c09] text-[#91ad68] sm:flex">
            <ShoppingCart size={21} />
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-white/[0.06] bg-[#090c09] px-6 text-center shadow-[10px_10px_25px_rgba(0,0,0,.45)]">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0d120d] text-[#39ff14]/70 shadow-[inset_4px_4px_10px_rgba(0,0,0,.5)]">
              <ShoppingCart size={28} />
            </div>

            <h2 className="text-xl font-semibold">
              Your cart is empty
            </h2>

            <p className="mt-2 max-w-md text-sm text-white/35">
              Add products from the marketplace and they will appear here.
            </p>

            <button
              onClick={() =>
                navigate("/products")
              }
              className="mt-7 rounded-xl border border-[#7f9f5c]/40 bg-[#7f9f5c] px-6 py-3 text-sm font-semibold text-[#081007] shadow-[6px_6px_15px_rgba(0,0,0,.45)] transition hover:bg-[#91ad68] active:scale-[0.98]"
            >
              Browse Marketplace
            </button>
          </div>
        ) : (
          <div className="grid gap-7 lg:grid-cols-[1fr_350px]">
            <div className="space-y-4">
              {cart.map((item) => {
                const itemTotal =
                  Number(item.price_per_unit) *
                  item.cart_quantity;

                return (
                  <div
                    key={item.sid}
                    className="rounded-2xl border border-white/[0.07] bg-[#090c09] p-5 shadow-[7px_7px_18px_rgba(0,0,0,.4)]"
                  >
                    <div className="flex gap-5">
                      <div className="h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-[#0c100c]">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.product_name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-white/15">
                            <Package size={30} />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-lg font-semibold text-white">
                              {item.product_name}
                            </h3>

                            <p className="mt-1 text-xs capitalize text-white/30">
                              {item.category}
                            </p>

                            {item.farmer_name && (
                              <p className="mt-2 text-xs text-white/40">
                                Farmer:{" "}
                                <span className="text-white/65">
                                  {item.farmer_name}
                                </span>
                              </p>
                            )}
                          </div>

                          <button
                            onClick={() =>
                              removeItem(item.sid)
                            }
                            className="rounded-lg p-2 text-white/25 transition hover:bg-red-500/10 hover:text-red-400"
                            title="Remove item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <p className="text-xs text-white/25">
                              Price
                            </p>

                            <p className="mt-1 font-semibold text-[#39ff14]/90">
                              ₹
                              {Number(
                                item.price_per_unit
                              ).toLocaleString(
                                "en-IN"
                              )}

                              <span className="ml-1 text-[11px] font-normal text-white/30">
                                / {item.unit}
                              </span>
                            </p>
                          </div>

                          <div className="flex items-center rounded-xl border border-white/[0.08] bg-[#050605]">
                            <button
                              onClick={() =>
                                decreaseQuantity(
                                  item.sid
                                )
                              }
                              className="p-2.5 text-white/50 transition hover:text-white"
                            >
                              <Minus size={15} />
                            </button>

                            <span className="min-w-[40px] text-center text-sm font-semibold">
                              {item.cart_quantity}
                            </span>

                            <button
                              onClick={() =>
                                increaseQuantity(
                                  item.sid
                                )
                              }
                              disabled={
                                item.cart_quantity >=
                                Number(
                                  item.quantity
                                )
                              }
                              className="p-2.5 text-white/50 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-20"
                            >
                              <Plus size={15} />
                            </button>
                          </div>

                          <div className="text-right">
                            <p className="text-xs text-white/25">
                              Item Total
                            </p>

                            <p className="mt-1 text-lg font-semibold text-white">
                              ₹
                              {itemTotal.toLocaleString(
                                "en-IN"
                              )}
                            </p>
                          </div>
                        </div>

                        <p className="mt-3 text-xs text-white/25">
                          Available:{" "}
                          {Number(
                            item.quantity
                          ).toLocaleString(
                            "en-IN"
                          )}{" "}
                          {item.unit}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <aside className="h-fit rounded-2xl border border-white/[0.07] bg-[#090c09] p-6 shadow-[8px_8px_20px_rgba(0,0,0,.4)] lg:sticky lg:top-8">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.18em] text-white/25">
                  Order Summary
                </p>

                <ShoppingCart
                  size={17}
                  className="text-[#91ad68]"
                />
              </div>

              <div className="mt-7 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">
                    Products
                  </span>

                  <span className="text-white/70">
                    {cart.length}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-white/40">
                    Total Items
                  </span>

                  <span className="text-white/70">
                    {totalItems}
                  </span>
                </div>
              </div>

              <div className="my-6 border-t border-white/[0.06]" />

              <div className="flex items-end justify-between">
                <div>
                  <p className="text-sm text-white/40">
                    Final Total
                  </p>

                  <p className="mt-1 text-xs text-white/25">
                    Including all selected products
                  </p>
                </div>

                <p className="text-2xl font-semibold text-[#91ad68]">
                  ₹
                  {totalCost.toLocaleString(
                    "en-IN"
                  )}
                </p>
              </div>

              <button
                onClick={finalBuy}
                disabled={buying}
                className="mt-7 w-full rounded-xl border border-[#7f9f5c]/40 bg-[#7f9f5c] px-5 py-3.5 text-sm font-semibold text-[#081007] shadow-[6px_6px_15px_rgba(0,0,0,.45),-2px_-2px_8px_rgba(255,255,255,.02)] transition-all duration-200 hover:bg-[#91ad68] hover:shadow-[8px_8px_18px_rgba(0,0,0,.5)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {buying ? "Placing Order..." : "Final Buy"}
              </button>

              <button
                onClick={() =>
                  navigate("/products")
                }
                className="mt-3 w-full rounded-xl border border-white/[0.07] bg-[#050605] px-5 py-3 text-sm font-medium text-white/50 transition hover:bg-[#0b0d0b] hover:text-white"
              >
                Continue Shopping
              </button>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

export default Cart;