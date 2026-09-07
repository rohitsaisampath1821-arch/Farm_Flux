from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import text
import bcrypt
from google import genai
from google.genai import types

from app.database import engine
from app.gemini import client, MODEL_NAME


app = FastAPI(
    title="KisanMitra API",
    version="1.0.0",
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# HOME
# =========================================================

@app.get("/")
def home():
    return {
        "message": "KisanMitra API is running"
    }


# =========================================================
# DATABASE TEST
# =========================================================

@app.get("/api/db-test")
def database_test():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "status": "success",
            "message": "MySQL database connected successfully"
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }


# =========================================================
# LOGIN SCHEMA
# =========================================================

class LoginRequest(BaseModel):
    email: str
    password: str


# =========================================================
# ADMIN LOGIN
# =========================================================

@app.post("/api/auth/admin/login")
def admin_login(data: LoginRequest):
    try:
        with engine.connect() as connection:
            result = connection.execute(
                text("""
                    SELECT
                        sid,
                        name,
                        email,
                        password_hash,
                        is_active
                    FROM admins
                    WHERE email = :email
                    LIMIT 1
                """),
                {
                    "email": data.email.strip().lower()
                }
            )

            admin = result.mappings().first()

        if not admin:
            return {
                "success": False,
                "message": "Invalid email or password"
            }

        if not admin["is_active"]:
            return {
                "success": False,
                "message": "This admin account is inactive"
            }

        password_valid = bcrypt.checkpw(
            data.password.encode("utf-8"),
            admin["password_hash"].encode("utf-8")
        )

        if not password_valid:
            return {
                "success": False,
                "message": "Invalid email or password"
            }

        return {
            "success": True,
            "message": "Admin login successful",
            "admin": {
                "sid": admin["sid"],
                "name": admin["name"],
                "email": admin["email"]
            }
        }

    except Exception as e:
        print("ADMIN LOGIN ERROR:", e)

        return {
            "success": False,
            "message": "Server error while logging in"
        }


# =========================================================
# BUYER SIGNUP
# =========================================================

class BuyerSignupRequest(BaseModel):
    full_name: str
    business_name: str | None = None
    email: str
    phone: str | None = None
    location: str
    password: str


@app.post("/api/buyers/signup")
def buyer_signup(data: BuyerSignupRequest):
    try:
        name = data.full_name.strip()
        email = data.email.strip().lower()
        business_name = data.business_name.strip() if data.business_name else None
        phone = data.phone.strip() if data.phone else None
        location = data.location.strip()

        if not name:
            return {"success": False, "message": "Full name is required"}

        if not email:
            return {"success": False, "message": "Email is required"}

        if not location:
            return {"success": False, "message": "Location is required"}

        if len(data.password) < 8:
            return {"success": False, "message": "Password must contain at least 8 characters"}

        with engine.connect() as connection:
            existing_buyer = connection.execute(
                text("""
                    SELECT sid FROM buyers
                    WHERE email = :email
                    LIMIT 1
                """),
                {"email": email}
            ).scalar()

        if existing_buyer:
            return {
                "success": False,
                "message": "An account with this email already exists"
            }

        password_hash = bcrypt.hashpw(
            data.password.encode("utf-8"),
            bcrypt.gensalt()
        ).decode("utf-8")

        with engine.begin() as connection:
            result = connection.execute(
                text("""
                    INSERT INTO buyers
                    (
                        name,
                        email,
                        password_hash,
                        phone,
                        business_name,
                        location,
                        status
                    )
                    VALUES
                    (
                        :name,
                        :email,
                        :password_hash,
                        :phone,
                        :business_name,
                        :location,
                        'active'
                    )
                """),
                {
                    "name": name,
                    "email": email,
                    "password_hash": password_hash,
                    "phone": phone,
                    "business_name": business_name,
                    "location": location
                }
            )

            buyer_sid = result.lastrowid

            connection.execute(
                text("""
                    INSERT INTO user_activity
                    (
                        user_type,
                        user_sid,
                        activity_type,
                        reference_sid,
                        metadata
                    )
                    VALUES
                    (
                        'buyer',
                        :buyer_sid,
                        'signup',
                        NULL,
                        :metadata
                    )
                """),
                {
                    "buyer_sid": buyer_sid,
                    "metadata": '{"source":"buyer_signup"}'
                }
            )

        return {
            "success": True,
            "message": "Buyer account created successfully",
            "buyer": {
                "sid": buyer_sid,
                "name": name,
                "email": email,
                "phone": phone,
                "business_name": business_name,
                "location": location
            }
        }

    except Exception as e:
        print("BUYER SIGNUP ERROR:", repr(e))
        return {
            "success": False,
            "message": "Unable to create buyer account"
        }


# =========================================================
# BUYER LOGIN
# =========================================================

@app.post("/api/auth/buyer/login")
def buyer_login(data: LoginRequest):
    try:
        with engine.connect() as connection:
            result = connection.execute(
                text("""
                    SELECT
                        sid,
                        name,
                        email,
                        password_hash,
                        phone,
                        business_name,
                        business_type,
                        location,
                        district,
                        state,
                        pincode,
                        status
                    FROM buyers
                    WHERE email = :email
                    LIMIT 1
                """),
                {
                    "email": data.email.strip().lower()
                }
            )

            buyer = result.mappings().first()

        if not buyer:
            return {
                "success": False,
                "message": "Invalid email or password"
            }

        if buyer["status"] == "inactive":
            return {
                "success": False,
                "message": "This buyer account is inactive"
            }

        if not buyer["password_hash"]:
            return {
                "success": False,
                "message": "Buyer account password is not configured"
            }

        password_valid = bcrypt.checkpw(
            data.password.encode("utf-8"),
            buyer["password_hash"].encode("utf-8")
        )

        if not password_valid:
            return {
                "success": False,
                "message": "Invalid email or password"
            }

        # Store login activity
        with engine.begin() as connection:
            connection.execute(
                text("""
                    INSERT INTO user_activity
                    (
                        user_type,
                        user_sid,
                        activity_type,
                        reference_sid,
                        metadata
                    )
                    VALUES
                    (
                        'buyer',
                        :user_sid,
                        'login',
                        NULL,
                        :metadata
                    )
                """),
                {
                    "user_sid": buyer["sid"],
                    "metadata": '{"source":"buyer_portal"}'
                }
            )

        return {
            "success": True,
            "message": "Buyer login successful",
            "buyer": {
                "sid": buyer["sid"],
                "name": buyer["name"],
                "email": buyer["email"],
                "phone": buyer["phone"],
                "business_name": buyer["business_name"],
                "business_type": buyer["business_type"],
                "location": buyer["location"],
                "district": buyer["district"],
                "state": buyer["state"],
                "pincode": buyer["pincode"]
            }
        }

    except Exception as e:
        print("BUYER LOGIN ERROR:", e)

        return {
            "success": False,
            "message": "Server error while logging in"
        }


# =========================================================
# PRODUCTS
# =========================================================

@app.get("/api/products")
def get_products():
    try:
        with engine.connect() as connection:
            result = connection.execute(
                text("""
                    SELECT
                        p.sid,
                        p.product_name,
                        p.category,
                        p.description,
                        p.quantity,
                        p.unit,
                        p.price_per_unit,
                        p.harvest_date,
                        p.expiry_date,
                        p.quality_grade,
                        p.image_url,
                        p.status,
                        f.name AS farmer_name
                    FROM products p
                    JOIN farmers f
                        ON f.sid = p.farmer_sid
                    WHERE p.status = 'available'
                    ORDER BY p.created_at DESC
                """)
            )

            products = [
                dict(row)
                for row in result.mappings().all()
            ]

        return {
            "success": True,
            "products": products
        }

    except Exception as e:
        print("PRODUCT FETCH ERROR:", e)

        return {
            "success": False,
            "message": "Unable to fetch products",
            "products": []
        }


# =========================================================
# ADMIN PRODUCTS - ALL PRODUCTS FROM DATABASE
# =========================================================

@app.get("/api/admin/products")
def get_admin_products():
    try:
        with engine.connect() as connection:
            result = connection.execute(
                text("""
                    SELECT
                        p.sid,
                        p.product_name,
                        p.category,
                        p.description,
                        p.quantity,
                        p.unit,
                        p.price_per_unit,
                        p.harvest_date,
                        p.expiry_date,
                        p.quality_grade,
                        p.image_url,
                        p.status,
                        p.farmer_sid,
                        f.name AS farmer_name
                    FROM products p
                    LEFT JOIN farmers f
                        ON f.sid = p.farmer_sid
                    ORDER BY p.sid DESC
                """)
            )

            products = [
                dict(row)
                for row in result.mappings().all()
            ]

        print("ADMIN PRODUCTS FOUND:", len(products))

        return {
            "success": True,
            "products": products
        }

    except Exception as e:
        print("ADMIN PRODUCT FETCH ERROR:", repr(e))

        return {
            "success": False,
            "message": str(e),
            "products": []
        }


# =========================================================
# ADD PRODUCT - ADMIN
# =========================================================

class ProductCreateRequest(BaseModel):
    product_name: str
    category: str
    description: str | None = None
    quantity: float
    unit: str
    price_per_unit: float
    harvest_date: str | None = None
    expiry_date: str | None = None
    quality_grade: str | None = None
    image_url: str | None = None
    farmer_sid: int


@app.post("/api/products")
def add_product(data: ProductCreateRequest):
    try:
        if data.quantity <= 0:
            return {
                "success": False,
                "message": "Quantity must be greater than zero"
            }

        if data.price_per_unit < 0:
            return {
                "success": False,
                "message": "Price cannot be negative"
            }

        with engine.begin() as connection:
            farmer = connection.execute(
                text("""
                    SELECT sid
                    FROM farmers
                    WHERE sid = :farmer_sid
                    LIMIT 1
                """),
                {
                    "farmer_sid": data.farmer_sid
                }
            ).scalar()

            if farmer is None:
                return {
                    "success": False,
                    "message": "Farmer not found"
                }

            result = connection.execute(
                text("""
                    INSERT INTO products
                    (
                        product_name,
                        category,
                        description,
                        quantity,
                        unit,
                        price_per_unit,
                        harvest_date,
                        expiry_date,
                        quality_grade,
                        image_url,
                        status,
                        farmer_sid
                    )
                    VALUES
                    (
                        :product_name,
                        :category,
                        :description,
                        :quantity,
                        :unit,
                        :price_per_unit,
                        :harvest_date,
                        :expiry_date,
                        :quality_grade,
                        :image_url,
                        'available',
                        :farmer_sid
                    )
                """),
                {
                    "product_name": data.product_name.strip(),
                    "category": data.category.strip(),
                    "description": data.description,
                    "quantity": data.quantity,
                    "unit": data.unit.strip(),
                    "price_per_unit": data.price_per_unit,
                    "harvest_date": data.harvest_date or None,
                    "expiry_date": data.expiry_date or None,
                    "quality_grade": data.quality_grade,
                    "image_url": data.image_url,
                    "farmer_sid": data.farmer_sid
                }
            )

            product_sid = result.lastrowid

        return {
            "success": True,
            "message": "Product added successfully",
            "product": {
                "sid": product_sid
            }
        }

    except Exception as e:
        print("PRODUCT ADD ERROR:", repr(e))

        return {
            "success": False,
            "message": "Unable to add product"
        }


# =========================================================
# DELETE PRODUCT
# =========================================================

@app.delete("/api/products/{product_sid}")
def delete_product(product_sid: int):
    try:
        with engine.begin() as connection:
            result = connection.execute(
                text("""
                    DELETE FROM products
                    WHERE sid = :sid
                """),
                {
                    "sid": product_sid
                }
            )

            if result.rowcount == 0:
                return {
                    "success": False,
                    "message": "Product not found"
                }

        return {
            "success": True,
            "message": "Product deleted successfully"
        }

    except Exception as e:
        print("PRODUCT DELETE ERROR:", e)

        return {
            "success": False,
            "message": "Unable to delete product"
        }


# =========================================================
# BUYERS
# =========================================================

@app.get("/api/buyers")
def get_buyers():
    try:
        with engine.connect() as connection:
            result = connection.execute(
                text("""
                    SELECT
                        sid,
                        name,
                        email,
                        phone,
                        business_name,
                        business_type,
                        location,
                        district,
                        state,
                        pincode,
                        status
                    FROM buyers
                    ORDER BY created_at DESC
                """)
            )

            buyers = [
                dict(row)
                for row in result.mappings().all()
            ]

        return {
            "success": True,
            "buyers": buyers
        }

    except Exception as e:
        print("BUYER FETCH ERROR:", repr(e))

        return {
            "success": False,
            "message": "Unable to fetch buyers",
            "buyers": []
        }


@app.delete("/api/buyers/{buyer_sid}")
def delete_buyer(buyer_sid: int):
    try:
        with engine.begin() as connection:
            result = connection.execute(
                text("""
                    DELETE FROM buyers
                    WHERE sid = :sid
                """),
                {
                    "sid": buyer_sid
                }
            )

            if result.rowcount == 0:
                return {
                    "success": False,
                    "message": "Buyer not found"
                }

        return {
            "success": True,
            "message": "Buyer deleted successfully"
        }

    except Exception as e:
        print("BUYER DELETE ERROR:", repr(e))

        return {
            "success": False,
            "message": "Unable to delete buyer",
            "error": str(e)
        }


# =========================================================
# FARMERS
# =========================================================

@app.get("/api/farmers")
def get_farmers():
    try:
        with engine.connect() as connection:
            result = connection.execute(
                text("""
                    SELECT
                        sid,
                        name,
                        phone,
                        farm_name,
                        location,
                        village,
                        district,
                        state,
                        pincode,
                        farm_size,
                        farm_size_unit,
                        status
                    FROM farmers
                    ORDER BY created_at DESC
                """)
            )

            farmers = [
                dict(row)
                for row in result.mappings().all()
            ]

        return {
            "success": True,
            "farmers": farmers
        }

    except Exception as e:
        print("FARMER FETCH ERROR:", e)

        return {
            "success": False,
            "message": "Unable to fetch farmers",
            "farmers": []
        }


# =========================================================
# DELETE FARMER LIST
# =========================================================

@app.delete("/api/farmers/{farmer_sid}")
def delete_farmer(farmer_sid: int):
    try:
        with engine.begin() as connection:
            result = connection.execute(
                text("""
                    DELETE FROM farmers
                    WHERE sid = :sid
                """),
                {
                    "sid": farmer_sid
                }
            )

            if result.rowcount == 0:
                return {
                    "success": False,
                    "message": "Farmer not found"
                }

        return {
            "success": True,
            "message": "Farmer deleted successfully"
        }

    except Exception as e:
        print("FARMER DELETE ERROR:", e)

        return {
            "success": False,
            "message": "Unable to delete farmer"
        }


# =========================================================
# ORDER SCHEMAS
# =========================================================

class OrderItemRequest(BaseModel):
    product_sid: int
    quantity: float


class CreateOrderRequest(BaseModel):
    buyer_sid: int
    delivery_address: str
    items: list[OrderItemRequest]


# =========================================================
# CREATE ORDER
# =========================================================

@app.post("/api/orders")
def create_order(data: CreateOrderRequest):
    try:
        if not data.items:
            return {
                "success": False,
                "message": "Order must contain at least one product"
            }

        with engine.begin() as connection:

            buyer = connection.execute(
                text("""
                    SELECT sid, status
                    FROM buyers
                    WHERE sid = :buyer_sid
                    LIMIT 1
                """),
                {
                    "buyer_sid": data.buyer_sid
                }
            ).mappings().first()

            if not buyer:
                return {
                    "success": False,
                    "message": "Buyer not found"
                }

            if buyer["status"] == "inactive":
                return {
                    "success": False,
                    "message": "Buyer account is inactive"
                }

            order_items = []
            total_amount = 0

            for item in data.items:

                product = connection.execute(
                    text("""
                        SELECT
                            sid,
                            product_name,
                            quantity,
                            unit,
                            price_per_unit,
                            status
                        FROM products
                        WHERE sid = :product_sid
                        FOR UPDATE
                    """),
                    {
                        "product_sid": item.product_sid
                    }
                ).mappings().first()

                if not product:
                    return {
                        "success": False,
                        "message": f"Product {item.product_sid} not found"
                    }

                if product["status"] != "available":
                    return {
                        "success": False,
                        "message": f"{product['product_name']} is not available"
                    }

                if item.quantity <= 0:
                    return {
                        "success": False,
                        "message": "Quantity must be greater than zero"
                    }

                if item.quantity > float(product["quantity"]):
                    return {
                        "success": False,
                        "message": (
                            f"Only {product['quantity']} "
                            f"{product['unit']} of "
                            f"{product['product_name']} available"
                        )
                    }

                price = float(product["price_per_unit"])
                subtotal = round(item.quantity * price, 2)

                total_amount += subtotal

                order_items.append({
                    "product_sid": product["sid"],
                    "quantity": item.quantity,
                    "price_per_unit": price,
                    "subtotal": subtotal
                })

            total_amount = round(total_amount, 2)

            order_result = connection.execute(
                text("""
                    INSERT INTO orders
                    (
                        buyer_sid,
                        total_amount,
                        status,
                        delivery_address
                    )
                    VALUES
                    (
                        :buyer_sid,
                        :total_amount,
                        'pending',
                        :delivery_address
                    )
                """),
                {
                    "buyer_sid": data.buyer_sid,
                    "total_amount": total_amount,
                    "delivery_address": data.delivery_address.strip()
                }
            )

            order_sid = order_result.lastrowid

            for item in order_items:

                connection.execute(
                    text("""
                        INSERT INTO order_items
                        (
                            order_sid,
                            product_sid,
                            quantity,
                            price_per_unit,
                            subtotal
                        )
                        VALUES
                        (
                            :order_sid,
                            :product_sid,
                            :quantity,
                            :price_per_unit,
                            :subtotal
                        )
                    """),
                    {
                        "order_sid": order_sid,
                        **item
                    }
                )

                connection.execute(
                    text("""
                        UPDATE products
                        SET quantity = quantity - :quantity,
                            status = CASE
                                WHEN quantity - :quantity <= 0
                                THEN 'inactive'
                                ELSE 'available'
                            END
                        WHERE sid = :product_sid
                    """),
                    {
                        "quantity": item["quantity"],
                        "product_sid": item["product_sid"]
                    }
                )

            connection.execute(
                text("""
                    INSERT INTO user_activity
                    (
                        user_type,
                        user_sid,
                        activity_type,
                        reference_sid,
                        metadata
                    )
                    VALUES
                    (
                        'buyer',
                        :buyer_sid,
                        'order_placed',
                        :order_sid,
                        :metadata
                    )
                """),
                {
                    "buyer_sid": data.buyer_sid,
                    "order_sid": order_sid,
                    "metadata": (
                        '{"amount":' +
                        str(total_amount) +
                        '}'
                    )
                }
            )

        return {
            "success": True,
            "message": "Order placed successfully",
            "order": {
                "sid": order_sid,
                "buyer_sid": data.buyer_sid,
                "total_amount": total_amount,
                "status": "pending"
            }
        }

    except Exception as e:
        print("ORDER CREATE ERROR:", repr(e))

        return {
            "success": False,
            "message": "Unable to place order"
        }


# =========================================================
# USER ACTIVITY SCHEMA
# =========================================================

class ActivityRequest(BaseModel):
    user_type: str
    user_sid: int
    activity_type: str
    reference_sid: int | None = None
    metadata: str | None = None


# =========================================================
# CREATE USER ACTIVITY
# =========================================================

@app.post("/api/activity")
def create_activity(data: ActivityRequest):
    try:
        if data.user_type not in ["buyer", "farmer", "admin"]:
            return {
                "success": False,
                "message": "Invalid user type"
            }

        if not data.activity_type.strip():
            return {
                "success": False,
                "message": "Activity type is required"
            }

        metadata = data.metadata or "{}"

        with engine.begin() as connection:
            result = connection.execute(
                text("""
                    INSERT INTO user_activity
                    (
                        user_type,
                        user_sid,
                        activity_type,
                        reference_sid,
                        metadata
                    )
                    VALUES
                    (
                        :user_type,
                        :user_sid,
                        :activity_type,
                        :reference_sid,
                        :metadata
                    )
                """),
                {
                    "user_type": data.user_type,
                    "user_sid": data.user_sid,
                    "activity_type": data.activity_type.strip(),
                    "reference_sid": data.reference_sid,
                    "metadata": metadata
                }
            )

            activity_sid = result.lastrowid

        return {
            "success": True,
            "activity": {
                "sid": activity_sid
            }
        }

    except Exception as e:
        print("ACTIVITY CREATE ERROR:", repr(e))

        return {
            "success": False,
            "message": "Unable to store activity"
        }


# =========================================================
# BUYER ANALYTICS
# =========================================================

@app.get("/api/buyers/{buyer_sid}/analytics")
def buyer_analytics(buyer_sid: int):
    try:
        with engine.connect() as connection:

            buyer = connection.execute(
                text("""
                    SELECT sid, name
                    FROM buyers
                    WHERE sid = :buyer_sid
                    LIMIT 1
                """),
                {
                    "buyer_sid": buyer_sid
                }
            ).mappings().first()

            if not buyer:
                return {
                    "success": False,
                    "message": "Buyer not found"
                }

            summary = connection.execute(
                text("""
                    SELECT
                        COALESCE(
                            SUM(
                                CASE
                                    WHEN status != 'cancelled'
                                    THEN total_amount
                                    ELSE 0
                                END
                            ),
                            0
                        ) AS total_spent,

                        COUNT(
                            CASE
                                WHEN status != 'cancelled'
                                THEN sid
                            END
                        ) AS total_orders
                    FROM orders
                    WHERE buyer_sid = :buyer_sid
                """),
                {
                    "buyer_sid": buyer_sid
                }
            ).mappings().first()

            total_quantity = connection.execute(
                text("""
                    SELECT
                        COALESCE(SUM(oi.quantity), 0)
                    FROM order_items oi
                    JOIN orders o
                        ON oi.order_sid = o.sid
                    WHERE o.buyer_sid = :buyer_sid
                    AND o.status != 'cancelled'
                """),
                {
                    "buyer_sid": buyer_sid
                }
            ).scalar()

            monthly_spending = connection.execute(
                text("""
                    SELECT
                        DATE_FORMAT(
                            o.order_date,
                            '%b'
                        ) AS month,

                        DATE_FORMAT(
                            o.order_date,
                            '%Y-%m'
                        ) AS month_key,

                        COALESCE(
                            SUM(o.total_amount),
                            0
                        ) AS amount

                    FROM orders o

                    WHERE o.buyer_sid = :buyer_sid
                    AND o.status != 'cancelled'
                    AND o.order_date >= DATE_SUB(
                        CURDATE(),
                        INTERVAL 5 MONTH
                    )

                    GROUP BY month_key, month
                    ORDER BY month_key
                """),
                {
                    "buyer_sid": buyer_sid
                }
            ).mappings().all()

            categories = connection.execute(
                text("""
                    SELECT
                        p.category AS name,

                        ROUND(
                            SUM(oi.subtotal) * 100 /
                            NULLIF(
                                (
                                    SELECT SUM(oi2.subtotal)
                                    FROM order_items oi2
                                    JOIN orders o2
                                        ON oi2.order_sid = o2.sid
                                    WHERE o2.buyer_sid = :buyer_sid
                                    AND o2.status != 'cancelled'
                                ),
                                0
                            ),
                            1
                        ) AS percentage

                    FROM order_items oi

                    JOIN orders o
                        ON oi.order_sid = o.sid

                    JOIN products p
                        ON oi.product_sid = p.sid

                    WHERE o.buyer_sid = :buyer_sid
                    AND o.status != 'cancelled'

                    GROUP BY p.category
                    ORDER BY percentage DESC
                """),
                {
                    "buyer_sid": buyer_sid
                }
            ).mappings().all()

            top_products = connection.execute(
                text("""
                    SELECT
                        p.product_name AS name,
                        COALESCE(
                            SUM(oi.quantity),
                            0
                        ) AS quantity

                    FROM order_items oi

                    JOIN orders o
                        ON oi.order_sid = o.sid

                    JOIN products p
                        ON oi.product_sid = p.sid

                    WHERE o.buyer_sid = :buyer_sid
                    AND o.status != 'cancelled'

                    GROUP BY
                        p.sid,
                        p.product_name

                    ORDER BY quantity DESC
                    LIMIT 5
                """),
                {
                    "buyer_sid": buyer_sid
                }
            ).mappings().all()

            order_status = connection.execute(
                text("""
                    SELECT
                        status AS name,

                        ROUND(
                            COUNT(*) * 100 /
                            NULLIF(
                                (
                                    SELECT COUNT(*)
                                    FROM orders
                                    WHERE buyer_sid = :buyer_sid
                                ),
                                0
                            ),
                            1
                        ) AS percentage

                    FROM orders

                    WHERE buyer_sid = :buyer_sid

                    GROUP BY status
                    ORDER BY percentage DESC
                """),
                {
                    "buyer_sid": buyer_sid
                }
            ).mappings().all()

            activity_summary = connection.execute(
                text("""
                    SELECT
                        activity_type AS name,
                        COUNT(*) AS count

                    FROM user_activity

                    WHERE user_type = 'buyer'
                    AND user_sid = :buyer_sid

                    GROUP BY activity_type
                    ORDER BY count DESC
                """),
                {
                    "buyer_sid": buyer_sid
                }
            ).mappings().all()

            monthly_activity = connection.execute(
                text("""
                    SELECT
                        DATE_FORMAT(
                            created_at,
                            '%b'
                        ) AS month,

                        DATE_FORMAT(
                            created_at,
                            '%Y-%m'
                        ) AS month_key,

                        COUNT(*) AS activity_count

                    FROM user_activity

                    WHERE user_type = 'buyer'
                    AND user_sid = :buyer_sid
                    AND created_at >= DATE_SUB(
                        CURDATE(),
                        INTERVAL 5 MONTH
                    )

                    GROUP BY month_key, month
                    ORDER BY month_key
                """),
                {
                    "buyer_sid": buyer_sid
                }
            ).mappings().all()

            recent_orders = connection.execute(
                text("""
                    SELECT
                        o.sid,
                        o.order_date,
                        o.total_amount,
                        o.status,
                        COUNT(oi.sid) AS item_count

                    FROM orders o

                    LEFT JOIN order_items oi
                        ON oi.order_sid = o.sid

                    WHERE o.buyer_sid = :buyer_sid

                    GROUP BY
                        o.sid,
                        o.order_date,
                        o.total_amount,
                        o.status

                    ORDER BY o.order_date DESC
                    LIMIT 8
                """),
                {
                    "buyer_sid": buyer_sid
                }
            ).mappings().all()

            total_activity = connection.execute(
                text("""
                    SELECT COUNT(*)
                    FROM user_activity
                    WHERE user_type = 'buyer'
                    AND user_sid = :buyer_sid
                """),
                {
                    "buyer_sid": buyer_sid
                }
            ).scalar()

        total_spent = float(
            summary["total_spent"] or 0
        )

        total_orders = int(
            summary["total_orders"] or 0
        )

        total_quantity = float(
            total_quantity or 0
        )

        average_order = (
            total_spent / total_orders
            if total_orders > 0
            else 0
        )

        return {
            "success": True,

            "buyer": {
                "sid": buyer["sid"],
                "name": buyer["name"]
            },

            "summary": {
                "total_spent": round(
                    total_spent,
                    2
                ),
                "total_orders": total_orders,
                "total_quantity": total_quantity,
                "average_order": round(
                    average_order,
                    2
                ),
                "total_activity": int(
                    total_activity or 0
                )
            },

            "monthly_spending": [
                {
                    "month": row["month"],
                    "amount": float(
                        row["amount"] or 0
                    )
                }
                for row in monthly_spending
            ],

            "categories": [
                {
                    "name": row["name"],
                    "percentage": float(
                        row["percentage"] or 0
                    )
                }
                for row in categories
            ],

            "top_products": [
                {
                    "name": row["name"],
                    "quantity": float(
                        row["quantity"] or 0
                    )
                }
                for row in top_products
            ],

            "order_status": [
                {
                    "name": row["name"],
                    "percentage": float(
                        row["percentage"] or 0
                    )
                }
                for row in order_status
            ],

            "activity_summary": [
                {
                    "name": row["name"],
                    "count": int(
                        row["count"] or 0
                    )
                }
                for row in activity_summary
            ],

            "monthly_activity": [
                {
                    "month": row["month"],
                    "activity_count": int(
                        row["activity_count"] or 0
                    )
                }
                for row in monthly_activity
            ],

            "recent_orders": [
                {
                    "sid": row["sid"],
                    "order_date": (
                        row["order_date"].isoformat()
                        if row["order_date"]
                        else None
                    ),
                    "total_amount": float(
                        row["total_amount"] or 0
                    ),
                    "status": row["status"],
                    "item_count": int(
                        row["item_count"] or 0
                    )
                }
                for row in recent_orders
            ]
        }

    except Exception as e:
        print("BUYER ANALYTICS ERROR:", repr(e))

        return {
            "success": False,
            "message": "Unable to load buyer analytics"
        }


# =========================================================
# COMPLAINT SCHEMA
# =========================================================

class ComplaintRequest(BaseModel):
    user_type: str
    user_sid: int
    category: str
    subject: str
    description: str


# =========================================================
# CREATE COMPLAINT
# =========================================================

@app.post("/api/complaints")
def create_complaint(data: ComplaintRequest):
    try:
        if data.user_type not in ["buyer", "farmer"]:
            return {
                "success": False,
                "message": "Invalid user type"
            }

        if not data.category.strip():
            return {
                "success": False,
                "message": "Complaint category is required"
            }

        if not data.subject.strip():
            return {
                "success": False,
                "message": "Complaint subject is required"
            }

        if not data.description.strip():
            return {
                "success": False,
                "message": "Complaint description is required"
            }

        with engine.begin() as connection:
            result = connection.execute(
                text("""
                    INSERT INTO complaints
                    (
                        user_type,
                        user_sid,
                        category,
                        subject,
                        description
                    )
                    VALUES
                    (
                        :user_type,
                        :user_sid,
                        :category,
                        :subject,
                        :description
                    )
                """),
                {
                    "user_type": data.user_type,
                    "user_sid": data.user_sid,
                    "category": data.category.strip(),
                    "subject": data.subject.strip(),
                    "description": data.description.strip()
                }
            )

            complaint_sid = result.lastrowid

            connection.execute(
                text("""
                    INSERT INTO user_activity
                    (
                        user_type,
                        user_sid,
                        activity_type,
                        reference_sid,
                        metadata
                    )
                    VALUES
                    (
                        :user_type,
                        :user_sid,
                        'complaint_submitted',
                        :reference_sid,
                        '{}'
                    )
                """),
                {
                    "user_type": data.user_type,
                    "user_sid": data.user_sid,
                    "reference_sid": complaint_sid
                }
            )

        return {
            "success": True,
            "message": "Complaint submitted successfully",
            "complaint": {
                "sid": complaint_sid
            }
        }

    except Exception as e:
        print("COMPLAINT CREATE ERROR:", e)

        return {
            "success": False,
            "message": "Unable to submit complaint"
        }


# =========================================================
# GET ALL COMPLAINTS
# =========================================================

@app.get("/api/complaints")
def get_complaints():
    try:
        with engine.connect() as connection:
            result = connection.execute(
                text("""
                    SELECT
                        c.sid,
                        c.user_type,
                        c.user_sid,
                        c.category,
                        c.subject,
                        c.description,
                        c.status,
                        c.admin_response,
                        c.created_at,
                        c.updated_at,

                        CASE
                            WHEN c.user_type = 'buyer'
                                THEN b.name
                            WHEN c.user_type = 'farmer'
                                THEN f.name
                            ELSE 'Unknown User'
                        END AS user_name,

                        CASE
                            WHEN c.user_type = 'buyer'
                                THEN b.email
                            ELSE NULL
                        END AS user_email

                    FROM complaints c

                    LEFT JOIN buyers b
                        ON c.user_type = 'buyer'
                        AND c.user_sid = b.sid

                    LEFT JOIN farmers f
                        ON c.user_type = 'farmer'
                        AND c.user_sid = f.sid

                    ORDER BY c.created_at DESC
                """)
            )

            complaints = [
                dict(row)
                for row in result.mappings().all()
            ]

        return {
            "success": True,
            "complaints": complaints
        }

    except Exception as e:
        print("COMPLAINT FETCH ERROR:", e)

        return {
            "success": False,
            "message": "Unable to fetch complaints",
            "complaints": []
        }


# =========================================================
# KISANMITRA BOT
# GEMINI + GOOGLE SEARCH
# =========================================================

class KisanBotRequest(BaseModel):
    message: str


@app.post("/api/kisan-bot/chat")
def kisan_bot_chat(data: KisanBotRequest):
    try:
        message = data.message.strip()

        if not message:
            return {
                "success": False,
                "message": "Message cannot be empty"
            }

        bot_rules = """
        You are KisanBot, an AI assistant for the KisanMitra platform. 
        Your ONLY purpose is to help farmers and buyers with topics related to:
        - Agriculture, farming techniques, and crop management
        - Market prices for vegetables, fruits, herbs, and spices
        - Agricultural logistics and supply chain
        - Using the KisanMitra platform
        
        CRITICAL RULE: If a user asks a question about ANY topic unrelated to agriculture 
        (e.g., politics, movies, general programming, sports, etc.), you MUST politely 
        decline to answer and remind them that you are an agricultural assistant.
        """

        chat = client.chats.create(
            model=MODEL_NAME,
            config=types.GenerateContentConfig(
                system_instruction=bot_rules,
                temperature=0.3,
            )
        )
        response = chat.send_message(message)

        reply = response.text

        if not reply or not reply.strip():
            print("GEMINI EMPTY RESPONSE:", response)

            return {
                "success": False,
                "message": "Gemini returned an empty response"
            }

        return {
            "success": True,
            "reply": reply.strip()
        }

    except Exception as e:
        print("========================================")
        print("GEMINI ERROR:", repr(e))
        print("========================================")

        return {
            "success": False,
            "message": "Unable to connect to KisanMitra Bot"
        }
    # =========================================================
# GET ALL ORDERS - ADMIN
# =========================================================

@app.get("/api/admin/orders")
def get_admin_orders():
    try:
        with engine.connect() as connection:
            result = connection.execute(
                text("""
                    SELECT
                        o.sid,
                        o.buyer_sid,
                        b.name AS buyer_name,
                        b.business_name,
                        o.total_amount,
                        o.status,
                        o.delivery_address,
                        o.order_date,

                        COUNT(oi.sid) AS item_count,

                        COALESCE(
                            SUM(oi.quantity),
                            0
                        ) AS total_quantity

                    FROM orders o

                    LEFT JOIN buyers b
                        ON b.sid = o.buyer_sid

                    LEFT JOIN order_items oi
                        ON oi.order_sid = o.sid

                    GROUP BY
                        o.sid,
                        o.buyer_sid,
                        b.name,
                        b.business_name,
                        o.total_amount,
                        o.status,
                        o.delivery_address,
                        o.order_date

                    ORDER BY o.order_date DESC
                """)
            )

            orders = [
                dict(row)
                for row in result.mappings().all()
            ]

        return {
            "success": True,
            "orders": orders
        }

    except Exception as e:
        print("ADMIN ORDERS FETCH ERROR:", repr(e))

        return {
            "success": False,
            "message": "Unable to fetch orders",
            "orders": []
        }
    # =========================================================
# DELETE ORDER IN ORDERS
# =========================================================

@app.delete("/api/orders/{order_sid}")
def delete_order(order_sid: int):
    try:
        with engine.begin() as connection:

            # Check whether order exists
            order = connection.execute(
                text("""
                    SELECT sid
                    FROM orders
                    WHERE sid = :order_sid
                    LIMIT 1
                """),
                {
                    "order_sid": order_sid
                }
            ).scalar()

            if order is None:
                return {
                    "success": False,
                    "message": "Order not found"
                }

            # Delete order items first
            connection.execute(
                text("""
                    DELETE FROM order_items
                    WHERE order_sid = :order_sid
                """),
                {
                    "order_sid": order_sid
                }
            )

            # Delete the order
            connection.execute(
                text("""
                    DELETE FROM orders
                    WHERE sid = :order_sid
                """),
                {
                    "order_sid": order_sid
                }
            )

        return {
            "success": True,
            "message": "Order deleted successfully"
        }

    except Exception as e:
        print("ORDER DELETE ERROR:", repr(e))

        return {
            "success": False,
            "message": "Unable to delete order"
        }
