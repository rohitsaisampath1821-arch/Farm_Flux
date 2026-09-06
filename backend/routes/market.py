from fastapi import APIRouter
from sqlalchemy import text

from app.database import engine


router = APIRouter(
    prefix="/api",
    tags=["Market Intelligence"]
)


@router.get("/market-intelligence")
def get_market_intelligence():

    try:

        # =====================================================
        # 1. TOTAL AVAILABLE TOMATO SUPPLY
        # =====================================================

        with engine.connect() as connection:

            supply_result = connection.execute(
                text("""
                    SELECT
                        COALESCE(SUM(quantity), 0) AS total_supply
                    FROM products
                    WHERE
                        LOWER(product_name) = 'tomato'
                        AND status = 'available'
                """)
            )

            supply = supply_result.scalar() or 0


        # =====================================================
        # 2. HIGHEST DEMAND REGION
        # =====================================================

        with engine.connect() as connection:

            demand_result = connection.execute(
                text("""
                    SELECT
                        region,
                        predicted_demand
                    FROM demand_forecasts
                    ORDER BY
                        predicted_demand DESC,
                        forecast_date DESC
                    LIMIT 1
                """)
            )

            demand = demand_result.mappings().first()


        # =====================================================
        # 3. LATEST TOMATO MANDI PRICE
        # =====================================================

        with engine.connect() as connection:

            price_result = connection.execute(
                text("""
                    SELECT
                        market_name,
                        modal_price,
                        price_unit,
                        price_date
                    FROM mandi_prices
                    WHERE LOWER(commodity) = 'tomato'
                    ORDER BY price_date DESC
                    LIMIT 1
                """)
            )

            price = price_result.mappings().first()


        # =====================================================
        # RESPONSE
        # =====================================================

        return {
            "success": True,

            "data": {
                "supply": {
                    "commodity": "Tomato",
                    "quantity": float(supply),
                    "unit": "kg"
                },

                "demand": {
                    "region": (
                        demand["region"]
                        if demand
                        else "No data"
                    ),
                    "quantity": (
                        float(demand["predicted_demand"])
                        if demand
                        else 0
                    ),
                    "unit": (
                        "kg"
                    )
                },

                "mandi_price": {
                    "market": (
                        price["market_name"]
                        if price
                        else "No data"
                    ),
                    "price": (
                        float(price["modal_price"])
                        if price and price["modal_price"]
                        else 0
                    ),
                    "unit": (
                        price["price_unit"]
                        if price
                        else "quintal"
                    ),
                    "date": (
                        str(price["price_date"])
                        if price
                        else None
                    )
                }
            }
        }


    except Exception as e:

        print(
            "MARKET INTELLIGENCE ERROR:",
            e
        )

        return {
            "success": False,
            "message": "Unable to load market intelligence",
            "data": None
        }