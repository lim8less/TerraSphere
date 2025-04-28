import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestRegressor
import joblib

# Load the dataset
df = pd.read_csv("landslide_backend\landslide_data.csv")

# Extract month from date
df["Date"] = pd.to_datetime(df["Date"])
df["Month"] = df["Date"].dt.month_name()
df.drop(columns=["Date"], inplace=True)

# Generate synthetic Risk Level (%) and Landslide Chances (%) based on Rainfall and other parameters
df["RiskLevel"] = df["Rainfall"] / df["Rainfall"].max() * 100  # Normalize risk level based on rainfall
df["LandslideChances"] = np.where(df["RiskLevel"] > 60, np.random.uniform(60, 100, len(df)), np.random.uniform(0, 50, len(df)))

# Encode categorical features
label_encoders = {}
categorical_columns = ["City", "Month", "SoilType", "Slope", "Vegetation"]
for col in categorical_columns:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col])
    label_encoders[col] = le

# Define features (X) and first-stage predictions (Y1)
X = df[["City", "Month"]]
Y1 = df[["Rainfall", "Elevation", "SoilType", "Slope", "Vegetation"]]

# Train-Test Split for First Model
X_train, X_test, Y1_train, Y1_test = train_test_split(X, Y1, test_size=0.2, random_state=42)

# Train the first model
rf_first_stage = RandomForestRegressor(n_estimators=100, random_state=42)
rf_first_stage.fit(X_train, Y1_train)

# Predict on the full dataset to get values for the second model
Y1_pred = rf_first_stage.predict(X)

# Convert predicted values into DataFrame
predicted_features_df = pd.DataFrame(Y1_pred, columns=["Rainfall", "Elevation", "SoilType", "Slope", "Vegetation"])

# Use the predicted values as features (X2) and actual `RiskLevel`, `LandslideChances` as labels (Y2)
X2 = predicted_features_df
Y2 = df[["RiskLevel", "LandslideChances"]]

# Train-Test Split for Second Model
X2_train, X2_test, Y2_train, Y2_test = train_test_split(X2, Y2, test_size=0.2, random_state=42)

# Train the second model
rf_second_stage = RandomForestRegressor(n_estimators=100, random_state=42)
rf_second_stage.fit(X2_train, Y2_train)

# Save the models and label encoders
joblib.dump(rf_first_stage, "landslide_backend\landslide_first_stage.pkl")
joblib.dump(rf_second_stage, "landslide_backend\landslide_second_stage.pkl")
joblib.dump(label_encoders, "landslide_backend\label_encoders.pkl")

print("Models trained and saved successfully.")
