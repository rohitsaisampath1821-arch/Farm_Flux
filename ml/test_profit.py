import joblib
import pandas as pd

model = joblib.load("models/farmer_profit_model.pkl")
preprocessor = joblib.load("models/profit_preprocessor.pkl")

data = pd.DataFrame([{
    "crop": "Tomato",
    "location": "Guntur",
    "demand_kg": 30,
    "modal_price": 28,
    "previous_demand": 18,
    "month": 9,
    "quantity_kg": 500,
    "production_cost_per_kg": 18,
    "selling_price_per_kg": 28,
    "transport_cost": 1200,
    "other_cost": 300
}])

X = preprocessor.transform(data)
prediction = model.predict(X)[0]

print("================================")
print("FARMER PROFIT PREDICTION")
print("================================")
print("Crop: Tomato")
print("Quantity: 500 kg")
print("Predicted Profit: ₹", round(float(prediction), 2))
print("================================")