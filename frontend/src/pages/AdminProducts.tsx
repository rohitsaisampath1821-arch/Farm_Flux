import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Package,
  RefreshCw,
  ShoppingBasket,
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

function AdminProducts() {
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

  useEffect(() => {
    if (!localStorage.getItem("admin")) {
      navigate("/login");
      return;
    }

    fetchProducts();
  }, [navigate]);

  /* ================= PARTICLE ANIMATION ================= */

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

  /* ================= 0 → 100 LOADING ================= */

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

    return () => {
      gsap.killTweensOf(counter);
    };
  }, []);

  /* ================= PRODUCT ANIMATION ================= */

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

  /* ================= DATABASE ================= */

  async function fetchProducts() {
    try {
      setError("");

      const response = await fetch(
        "http://127.0.0.1:8000/api/admin/products"
      );

      if (!response.ok) {
        throw new Error(
          "Unable to fetch products from the database."
        );
      }

      const data = await response.json();

      if (data.success === false) {
        throw new Error(
          data.message ||
            "Unable to fetch products from the database."
        );
      }

      const productData = Array.isArray(data)
        ? data
        : Array.isArray(data.products)
          ? data.products
          : [];

      setProducts(productData);
      setSelectedProducts([]);
    } catch (err) {
      console.error(
        "ADMIN PRODUCT FETCH ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load products from the server."
      );
    }
  }

  /* ================= SELECT ================= */

  const toggleProduct = (sid: number) => {
    setSelectedProducts((prev) =>
      prev.includes(sid)
        ? prev.filter((id) => id !== sid)
        : [...prev, sid]
    );
  };

  const allProductsSelected =
    products.length > 0 &&
    products.every((product) =>
      selectedProducts.includes(product.sid)
    );

  const toggleSelectAll = () => {
    if (allProductsSelected) {
      setSelectedProducts([]);
      return;
    }

    setSelectedProducts(
      products.map((product) => product.sid)
    );
  };

  /* ================= DELETE FROM DATABASE ================= */

  async function deleteSelectedProducts() {
    if (
      deleting ||
      selectedProducts.length === 0
    ) {
      return;
    }

    const confirmed = window.confirm(
      `Delete ${selectedProducts.length} selected product${
        selectedProducts.length > 1
          ? "s"
          : ""
      } permanently from the database?`
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      setError("");

      for (const sid of selectedProducts) {
        const response = await fetch(
          `http://127.0.0.1:8000/api/products/${sid}`,
          {
            method: "DELETE",
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
              `Unable to delete product ${sid}`
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
        err instanceof Error
          ? err.message
          : "Unable to delete selected product(s)."
      );
    } finally {
      setDeleting(false);
    }
  }

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

  return (
    <div
      ref={pageRef}
      className="relative min-h-screen overflow-hidden bg-[#050705] text-white"
    >
      {/* PARTICLES */}
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
        {/* HEADER */}
        <div className="products-header mb-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              onClick={() =>
                navigate("/dashboard")
              }
              className="mb-5 flex items-center gap-2 rounded-xl border border-[#3f6f3f] bg-[#132013] px-4 py-2.5 text-sm font-medium text-[#8fbd8f] transition-all duration-200 hover:bg-[#1b2d1b] hover:text-[#b4d8b4]"
            >
              <ArrowLeft size={17} />
              Back to Dashboard
            </button>

            <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-[#39ff14]/75">
              ADMIN PRODUCT MANAGEMENT
            </p>

            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Products
            </h1>

            <p className="mt-2 max-w-xl text-sm text-white/45">
              Manage all products directly from the
              KisanMitra database.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {selectedProducts.length > 0 && (
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

        {/* SELECT ALL */}
        {!loading && products.length > 0 && (
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

        {/* EMPTY */}
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
                No products were returned from the database.
              </p>
            </div>
          )}

        {/* PRODUCT GROUPS */}
        {!loading && products.length > 0 && (
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
              />
            )}
          </div>
        )}
      </main>

      {/* 0 → 100 LOADING SCREEN */}
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
}: {
  title: string;
  products: Product[];
  icon: React.ReactNode;
  selectedProducts: number[];
  toggleProduct: (sid: number) => void;
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
            in database
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
}: {
  product: Product;
  selected: boolean;
  toggleProduct: (sid: number) => void;
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
            title="Select product"
          />
        </div>

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

        <div className="mt-4 flex items-center justify-between border-t border-white/[0.05] pt-3 text-xs">
          <span className="text-white/25">
            Status
          </span>

          <span
            className={
              product.status === "available"
                ? "text-[#91ad68]"
                : "text-white/50"
            }
          >
            {product.status || "unknown"}
          </span>
        </div>
      </div>
    </article>
  );
}

export default AdminProducts;
