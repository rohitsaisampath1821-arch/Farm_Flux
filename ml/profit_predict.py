import joblib
import pandas as pd

model = joblib.load("models/farmer_profit_model.pkl")
preprocessor = joblib.load("models/profit_preprocessor.pkl")

def predict_profit(
    crop,
    location,
    demand_kg,
    modal_price,
    previous_demand,
    month,
    quantity_kg,
    production_cost_per_kg,
    selling_price_per_kg,
    transport_cost,
    other_cost
):
    data = pd.DataFrame([{
        "crop": crop,
        "location": location,
        "demand_kg": demand_kg,
        "modal_price": modal_price,
        "previous_demand": previous_demand,
        "month": month,
        "quantity_kg": quantity_kg,
        "production_cost_per_kg": production_cost_per_kg,
        "selling_price_per_kg": selling_price_per_kg,
        "transport_cost": transport_cost,
        "other_cost": other_cost
    }])

    X = preprocessor.transform(data)
    prediction = model.predict(X)[0]

    return round(float(prediction), 2)