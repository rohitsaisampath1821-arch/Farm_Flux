import { API_BASE } from "../config";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Package,
  RefreshCw,
  ShoppingBasket,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";

type Product = {
  sid: number;
  product_name: string;
  category: string;
  description?: string;
  quantity: number;
  unit: string;
  price_per_unit: number;
  harvest_date?: string;
  expiry_date?: string;
  quality_grade?: string;
  image_url?: string;
  status?: string;
  farmer_name?: string;
};

type CartItem = Product & {
  cart_quantity: number;
};

function Products() {
  const navigate = useNavigate();
  const pageRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);

  const isBuyer =
    localStorage.getItem("buyerAuthenticated") === "true";

  const buyerSid = (() => {
    const storedBuyer = localStorage.getItem("buyer");

    if (!storedBuyer) return null;

    try {
      const buyer = JSON.parse(storedBuyer);
      return buyer?.sid || null;
    } catch {
      return null;
    }
  })();

  const cartKey = buyerSid
    ? `kisanmitra_cart_${buyerSid}`
    : "kisanmitra_cart";

  useEffect(() => {
    if (!isBuyer) return;

    const storedCart = localStorage.getItem(cartKey);

    if (!storedCart) return;

    try {
      const parsed = JSON.parse(storedCart);

      if (Array.isArray(parsed)) {
        setCart(parsed);
      }
    } catch {
      localStorage.removeItem(cartKey);
    }
  }, [cartKey, isBuyer]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!particlesRef.current) return;

      const particles =
        particlesRef.current.querySelectorAll(
          ".products-particle"
        );

      particles.forEach((particle) => {
        gsap.set(particle, {
          left: gsap.utils.random(1, 99) + "%",
          top:
            window.innerHeight +
            gsap.utils.random(0, 300),
          scale: gsap.utils.random(0.8, 1.8),
          opacity: gsap.utils.random(0.35, 0.8),
        });

        gsap.to(particle, {
          y: gsap.utils.random(
            -window.innerHeight - 200,
            -window.innerHeight
          ),
          x: gsap.utils.random(-120, 120),
          opacity: 0,
          duration: gsap.utils.random(7, 13),
          repeat: -1,
          delay: gsap.utils.random(0, 8),
          ease: "none",
        });
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const counter = { val: 0 };

    gsap.to(counter, {
      val: 100,
      duration: 2.5,
      ease: "power2.inOut",
      onUpdate: () => {
        setProgress(Math.round(counter.val));
      },
      onComplete: () => {
        setTimeout(() => setLoading(false), 250);
      },
    });
  }, []);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (loading || !contentRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".products-header",
        { opacity: 0, y: -25 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
        }
      );

      gsap.fromTo(
        ".product-section",
        { opacity: 0, y: 35 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.15,
          delay: 0.15,
          ease: "power3.out",
        }
      );

      gsap.fromTo(
        ".product-card",
        {
          opacity: 0,
          y: 30,
          scale: 0.97,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.55,
          stagger: 0.07,
          delay: 0.25,
          ease: "power2.out",
        }
      );

      const cards =
        contentRef.current.querySelectorAll(
          ".product-card"
        );

      cards.forEach((card) => {
        const element = card as HTMLElement;

        const enter = () => {
          gsap.to(element, {
            y: -8,
            scale: 1.02,
            boxShadow:
              "0 20px 40px rgba(0,0,0,0.2)",
            duration: 0.3,
            ease: "power2.out",
          });
        };

        const leave = () => {
          gsap.to(element, {
            y: 0,
            scale: 1,
            boxShadow:
              "7px 7px 18px rgba(0,0,0,.45), -3px -3px 10px rgba(255,255,255,.015)",
            duration: 0.3,
            ease: "power2.out",
          });
        };

        element.addEventListener(
          "mouseenter",
          enter
        );
        element.addEventListener(
          "mouseleave",
          leave
        );
      });
    }, contentRef);

    return () => ctx.revert();
  }, [loading, products]);

  async function fetchProducts() {
    try {
      setError("");

      const response = await fetch(
        `${API_BASE}/api/products`
      );

      if (!response.ok) {
        throw new Error("Unable to fetch products");
      }

      const data = await response.json();

      const productData = Array.isArray(data)
        ? data
        : Array.isArray(data.products)
          ? data.products
          : [];

      setProducts(productData);
      setSelectedProducts([]);
    } catch (err) {
      console.error(
        "PRODUCT FETCH ERROR:",
        err
      );
      setError(
        "Unable to load products from the server."
      );
    }
  }

  const toggleProduct = (sid: number) => {
    if (isBuyer) return;

    setSelectedProducts((prev) =>
      prev.includes(sid)
        ? prev.filter((id) => id !== sid)
        : [...prev, sid]
    );
  };

  const allProductsSelected =
    !isBuyer &&
    products.length > 0 &&
    products.every((product) =>
      selectedProducts.includes(product.sid)
    );

  const toggleSelectAll = () => {
    if (isBuyer) return;

    if (allProductsSelected) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(
        products.map((product) => product.sid)
      );
    }
  };

  async function deleteSelectedProducts() {
    if (
      isBuyer ||
      selectedProducts.length === 0
    )
      return;

    const confirmed = window.confirm(
      `Delete ${selectedProducts.length} selected product${
        selectedProducts.length > 1
          ? "s"
          : ""
      } permanently?`
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      setError("");

      for (const sid of selectedProducts) {
        const response = await fetch(
          `${API_BASE}/api/products/${sid}`,
          {
            method: "DELETE",
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
              "Unable to delete product"
          );
        }
      }

      setSelectedProducts([]);
      await fetchProducts();
    } catch (err) {
      console.error(
        "DELETE PRODUCT ERROR:",
        err
      );
      setError(
        "Unable to delete selected product(s)."
      );
    } finally {
      setDeleting(false);
    }
  }

  const saveCart = (updatedCart: CartItem[]) => {
    setCart(updatedCart);

    localStorage.setItem(
      cartKey,
      JSON.stringify(updatedCart)
    );
  };

  const addToCart = (product: Product) => {
    if (!isBuyer) return;

    const existing = cart.find(
      (item) => item.sid === product.sid
    );

    if (existing) {
      if (
        existing.cart_quantity >=
        Number(product.quantity)
      ) {
        alert(
          `Only ${product.quantity} ${product.unit} available.`
        );
        return;
      }

      const updatedCart = cart.map((item) =>
        item.sid === product.sid
          ? {
              ...item,
              cart_quantity:
                item.cart_quantity + 1,
            }
          : item
      );

      saveCart(updatedCart);
      return;
    }

    const updatedCart: CartItem[] = [
      ...cart,
      {
        ...product,
        cart_quantity: 1,
      },
    ];

    saveCart(updatedCart);
  };

  const buyProduct = (product: Product) => {
    addToCart(product);
    navigate("/cart");
  };

  const cartCount = cart.reduce(
    (sum, item) =>
      sum + item.cart_quantity,
    0
  );

  const vegetables = products.filter((product) =>
    product.category
      ?.toLowerCase()
      .includes("vegetable")
  );

  const fruits = products.filter((product) =>
    product.category
      ?.toLowerCase()
      .includes("fruit")
  );

  const otherProducts = products.filter(
    (product) => {
      const category =
        product.category?.toLowerCase() || "";

      return (
        !category.includes("vegetable") &&
        !category.includes("fruit")
      );
    }
  );

  const goBack = () => {
    navigate(
      isBuyer
        ? "/buyer-dashboard"
        : "/dashboard"
    );
  };

  return (
    <div
      ref={pageRef}
      className="relative min-h-screen overflow-hidden bg-[#050705] text-white"
    >
      <div
        ref={particlesRef}
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        {Array.from({ length: 70 }).map(
          (_, index) => (
            <span
              key={index}
              className="products-particle absolute h-[6px] w-[6px] rounded-full bg-[#39ff14]"
              style={{
                boxShadow:
                  "0 0 7px #39ff14, 0 0 16px #39ff14, 0 0 28px rgba(57,255,20,.55)",
              }}
            />
          )
        )}
      </div>

      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_50%_0%,rgba(40,80,35,.08),transparent_45%)]" />

      <main
        ref={contentRef}
        className="relative z-10 mx-auto min-h-screen max-w-[1450px] px-5 py-8 sm:px-8 lg:px-12"
      >
        <div className="products-header mb-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              onClick={goBack}
              className="mb-5 flex items-center gap-2 rounded-xl border border-[#3f6f3f] bg-[#132013] px-4 py-2.5 text-sm font-medium text-[#8fbd8f] transition-all duration-200 hover:bg-[#1b2d1b] hover:text-[#b4d8b4]"
            >
              <ArrowLeft size={17} />
              Back to Dashboard
            </button>

            <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-[#39ff14]/75">
              {isBuyer
                ? "BUYER MARKETPLACE"
                : "FARMER MARKETPLACE"}
            </p>

            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Products
            </h1>

            <p className="mt-2 max-w-xl text-sm text-white/45">
              {isBuyer
                ? "Browse fresh produce directly from farmers and source what your business needs."
                : "Fresh agricultural products currently available from farmers on KisanMitra."}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {isBuyer && (
              <button
                onClick={() =>
                  navigate("/cart")
                }
                className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#090c09] px-4 py-3 text-sm font-medium text-white/70 shadow-[6px_6px_16px_rgba(0,0,0,.35)] transition-all duration-200 hover:text-white"
              >
                <ShoppingCart size={16} />
                Cart

                {cartCount > 0 && (
                  <span className="rounded-full bg-[#39ff14] px-2 py-0.5 text-[10px] font-bold text-black">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {!isBuyer &&
              selectedProducts.length > 0 && (
                <button
                  onClick={
                    deleteSelectedProducts
                  }
                  disabled={deleting}
                  className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300 transition-all duration-200 hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 size={16} />

                  {deleting
                    ? "Deleting..."
                    : `Delete (${selectedProducts.length})`}
                </button>
              )}

            <button
              onClick={fetchProducts}
              disabled={deleting}
              className="flex w-fit items-center gap-2 rounded-xl border border-[#3f6f3f] bg-[#132013] px-4 py-3 text-sm font-medium text-[#8fbd8f] shadow-[6px_6px_16px_rgba(0,0,0,.35),-3px_-3px_10px_rgba(255,255,255,.015)] transition-all duration-200 hover:bg-[#1b2d1b] hover:text-[#b4d8b4] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={
                  deleting
                    ? "animate-spin"
                    : ""
                }
              />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-8 rounded-2xl border border-red-500/10 bg-[#0a0b0a] px-5 py-4 text-sm text-red-300/80 shadow-[7px_7px_18px_rgba(0,0,0,.4)]">
            {error}
          </div>
        )}

        {!loading &&
          products.length === 0 &&
          !error && (
            <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-white/[0.05] bg-[#090c09] px-6 text-center shadow-[10px_10px_25px_rgba(0,0,0,.45),-4px_-4px_12px_rgba(255,255,255,.015)]">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0d120d] text-[#39ff14]/70 shadow-[inset_4px_4px_10px_rgba(0,0,0,.5),inset_-3px_-3px_8px_rgba(255,255,255,.015)]">
                <Package size={28} />
              </div>

              <h2 className="text-xl font-semibold text-white">
                No products available
              </h2>

              <p className="mt-2 max-w-md text-sm text-white/40">
                Products added by farmers will
                appear here automatically.
              </p>
            </div>
          )}

        {!loading &&
          products.length > 0 &&
          !isBuyer && (
            <div className="mb-8 flex items-center justify-between rounded-2xl border border-white/[0.05] bg-[#090c09] px-5 py-3 shadow-[6px_6px_16px_rgba(0,0,0,.3)]">
              <label className="flex cursor-pointer items-center gap-3 text-sm text-white/55">
                <input
                  type="checkbox"
                  checked={allProductsSelected}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 cursor-pointer accent-[#39ff14]"
                />

                <span>
                  Select All Products
                </span>
              </label>

              <span className="text-xs text-white/30">
                {selectedProducts.length > 0
                  ? `${selectedProducts.length} selected`
                  : `${products.length} products`}
              </span>
            </div>
          )}

        <div className="space-y-12">
          {vegetables.length > 0 && (
            <ProductSection
              title="Vegetables"
              products={vegetables}
              icon={
                <ShoppingBasket size={19} />
              }
              selectedProducts={
                selectedProducts
              }
              toggleProduct={
                toggleProduct
              }
              isBuyer={isBuyer}
              addToCart={addToCart}
              buyProduct={buyProduct}
            />
          )}

          {fruits.length > 0 && (
            <ProductSection
              title="Fruits"
              products={fruits}
              icon={
                <ShoppingBasket size={19} />
              }
              selectedProducts={
                selectedProducts
              }
              toggleProduct={
                toggleProduct
              }
              isBuyer={isBuyer}
              addToCart={addToCart}
              buyProduct={buyProduct}
            />
          )}

          {otherProducts.length > 0 && (
            <ProductSection
              title="Other Products"
              products={otherProducts}
              icon={<Package size={19} />}
              selectedProducts={
                selectedProducts
              }
              toggleProduct={
                toggleProduct
              }
              isBuyer={isBuyer}
              addToCart={addToCart}
              buyProduct={buyProduct}
            />
          )}
        </div>
      </main>

      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050705]">
          <div className="w-[min(90%,360px)] text-center">
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#090c09] text-[#39ff14] shadow-[8px_8px_20px_rgba(0,0,0,.5),-4px_-4px_10px_rgba(255,255,255,.02)]">
                <Package size={28} />
              </div>
            </div>

            <p className="mb-3 text-xs font-semibold tracking-[0.22em] text-[#39ff14]/75">
              LOADING PRODUCTS
            </p>

            <div className="h-1.5 overflow-hidden rounded-full bg-[#111511] shadow-[inset_3px_3px_7px_rgba(0,0,0,.5)]">
              <div
                className="h-full rounded-full bg-[#39ff14] transition-[width] duration-100"
                style={{
                  width: `${progress}%`,
                  boxShadow:
                    "0 0 10px rgba(57,255,20,.45)",
                }}
              />
            </div>

            <div className="mt-3 text-xs text-white/35">
              {progress}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductSection({
  title,
  products,
  icon,
  selectedProducts,
  toggleProduct,
  isBuyer,
  addToCart,
  buyProduct,
}: {
  title: string;
  products: Product[];
  icon: React.ReactNode;
  selectedProducts: number[];
  toggleProduct: (sid: number) => void;
  isBuyer: boolean;
  addToCart: (product: Product) => void;
  buyProduct: (product: Product) => void;
}) {
  return (
    <section className="product-section">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0b100b] text-[#39ff14]/80 shadow-[4px_4px_10px_rgba(0,0,0,.4),-2px_-2px_6px_rgba(255,255,255,.015)]">
          {icon}
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white">
            {title}
          </h2>

          <p className="text-xs text-white/35">
            {products.length} product
            {products.length !== 1
              ? "s"
              : ""}{" "}
            available
          </p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.sid}
            product={product}
            selected={selectedProducts.includes(
              product.sid
            )}
            toggleProduct={
              toggleProduct
            }
            isBuyer={isBuyer}
            addToCart={addToCart}
            buyProduct={buyProduct}
          />
        ))}
      </div>
    </section>
  );
}

function ProductCard({
  product,
  selected,
  toggleProduct,
  isBuyer,
  addToCart,
  buyProduct,
}: {
  product: Product;
  selected: boolean;
  toggleProduct: (sid: number) => void;
  isBuyer: boolean;
  addToCart: (product: Product) => void;
  buyProduct: (product: Product) => void;
}) {
  return (
    <article
      className={`product-card overflow-hidden rounded-2xl border bg-[#090c09] shadow-[7px_7px_18px_rgba(0,0,0,.45),-3px_-3px_10px_rgba(255,255,255,.015)] ${
        selected
          ? "border-[#39ff14]/40"
          : "border-white/[0.05]"
      }`}
    >
      <div className="relative h-48 overflow-hidden bg-[#0c100c]">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.product_name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-white/15">
            <Package
              size={42}
              strokeWidth={1.2}
            />
          </div>
        )}

        {!isBuyer && (
          <div className="absolute left-3 top-3">
            <input
              type="checkbox"
              checked={selected}
              onChange={() =>
                toggleProduct(
                  product.sid
                )
              }
              className="h-5 w-5 cursor-pointer accent-[#39ff14]"
            />
          </div>
        )}

        {product.quality_grade && (
          <span className="absolute right-3 top-3 rounded-lg bg-[#070907]/90 px-2.5 py-1 text-[11px] font-medium text-[#39ff14]/80">
            Grade {product.quality_grade}
          </span>
        )}
      </div>

      <div className="p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-white">
              {product.product_name}
            </h3>

            <p className="mt-1 text-xs capitalize text-white/35">
              {product.category}
            </p>
          </div>

          <div className="text-right">
            <p className="text-lg font-semibold text-[#39ff14]/90">
              ₹
              {Number(
                product.price_per_unit
              ).toLocaleString("en-IN")}
            </p>

            <p className="text-[11px] text-white/30">
              / {product.unit || "unit"}
            </p>
          </div>
        </div>

        {product.description && (
          <p className="mb-4 line-clamp-2 text-sm leading-5 text-white/40">
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between border-t border-white/[0.05] pt-4 text-xs">
          <div>
            <p className="text-white/25">
              Available
            </p>

            <p className="mt-1 font-medium text-white/65">
              {Number(
                product.quantity
              ).toLocaleString("en-IN")}{" "}
              {product.unit}
            </p>
          </div>

          {product.farmer_name && (
            <div className="text-right">
              <p className="text-white/25">
                Farmer
              </p>

              <p className="mt-1 max-w-[120px] truncate font-medium text-white/65">
                {product.farmer_name}
              </p>
            </div>
          )}
        </div>

        {isBuyer && (
          <div className="mt-5 grid grid-cols-2 gap-2.5">
            <button
              onClick={() =>
                buyProduct(product)
              }
              className="rounded-xl border border-[#7f9f5c]/40 bg-[#7f9f5c] px-3 py-3 text-sm font-semibold text-[#081007] shadow-[5px_5px_12px_rgba(0,0,0,.45),-2px_-2px_7px_rgba(255,255,255,.02)] transition-all duration-200 hover:bg-[#91ad68] hover:shadow-[7px_7px_16px_rgba(0,0,0,.5)] active:scale-[0.98]"
            >
              Buy
            </button>

            <button
              onClick={() =>
                addToCart(product)
              }
              className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-[#050605] px-3 py-3 text-sm font-medium text-white/70 transition-all duration-200 hover:border-white/[0.14] hover:bg-[#0b0d0b] hover:text-white active:scale-[0.98]"
            >
              <ShoppingCart size={15} />
              Add to Cart
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

export default Products;