import joblib
import pandas as pd
import os

# Load model and feature list
model = joblib.load(
    os.path.join(os.path.dirname(__file__), "models", "demand_model.pkl")
)

features = joblib.load(
    os.path.join(os.path.dirname(__file__), "models", "features.pkl")
)


def predict_demand(
    crop,
    location,
    modal_price,
    day,
    month,
    day_of_week,
    previous_demand
):
    # Create input with default values
    input_data = pd.DataFrame(
        0,
        index=[0],
        columns=features
    )

    # Numerical features
    input_data["modal_price"] = modal_price
    input_data["day"] = day
    input_data["month"] = month
    input_data["day_of_week"] = day_of_week
    input_data["previous_demand"] = previous_demand

    # Crop
    crop_column = f"crop_{crop}"
    if crop_column in input_data.columns:
        input_data[crop_column] = 1

    # Location
    location_column = f"location_{location}"
    if location_column in input_data.columns:
        input_data[location_column] = 1

    # Prediction
    prediction = model.predict(input_data)[0]

    return prediction


# Test prediction
if __name__ == "__main__":
    prediction = predict_demand(
        crop="Tomato",
        location="Guntur",
        modal_price=40,
        day=10,
        month=9,
        day_of_week=3,
        previous_demand=50
    )

    print("Predicted demand:", prediction, "kg")