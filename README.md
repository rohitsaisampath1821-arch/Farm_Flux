# KisanMitra Backend Routes

These route modules match the backend route structure visible in the project:

- chatbot.py
- demand.py
- logistics.py
- market.py
- orders.py
- prices.py
- products.py
- users.py

## Important

These files are a clean route scaffold. They do not replace the existing database/Gemini logic in `main.py` automatically.

After placing them in `backend/app/routes/`, register the routers in `main.py`, for example:

```python
from app.routes.chatbot import router as chatbot_router
from app.routes.demand import router as demand_router
from app.routes.logistics import router as logistics_router
from app.routes.market import router as market_router
from app.routes.orders import router as orders_router
from app.routes.prices import router as prices_router
from app.routes.products import router as products_router
from app.routes.users import router as users_router

app.include_router(chatbot_router)
app.include_router(demand_router)
app.include_router(logistics_router)
app.include_router(market_router)
app.include_router(orders_router)
app.include_router(prices_router)
app.include_router(products_router)
app.include_router(users_router)
```

If your current `main.py` already contains these endpoints, do not register duplicate routes until the old endpoints are moved/removed.
