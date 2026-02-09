import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler, LabelEncoder
import joblib

# ===============================
# CONFIGURATION
# ===============================
DATA_PATH = "human_vital_sign_dataset.csv"   # raw dataset
SEQ_LENGTH = 10                       # timesteps for LSTM
OUTPUT_X = "X.npy"
OUTPUT_Y = "y.npy"
SCALER_PATH = "scaler.save"

# ===============================
# LOAD DATA
# ===============================
df = pd.read_csv(DATA_PATH)
print("Initial Shape:", df.shape)

# ===============================
# BASIC VALIDATION
# ===============================
print("\nMissing Values:")
print(df.isnull().sum())

# ===============================
# TIMESTAMP PROCESSING
# ===============================
df["Timestamp"] = pd.to_datetime(df["Timestamp"])
df = df.sort_values(by=["Patient ID", "Timestamp"])

# ===============================
# ENCODE CATEGORICAL FEATURES
# ===============================
df["Gender"] = LabelEncoder().fit_transform(df["Gender"])
df["Risk Category"] = LabelEncoder().fit_transform(df["Risk Category"])

# ===============================
# FEATURE SELECTION
# ===============================
FEATURE_COLUMNS = [
    "Heart Rate",
    "Respiratory Rate",
    "Body Temperature",
    "Oxygen Saturation",
    "Systolic Blood Pressure",
    "Diastolic Blood Pressure",
    "Age",
    "Gender",
    "Weight (kg)",
    "Height (m)",
    "Derived_HRV",
    "Derived_Pulse_Pressure",
    "Derived_BMI",
    "Derived_MAP"
]

TARGET_COLUMN = "Risk Category"

# ===============================
# SCALING
# ===============================
scaler = MinMaxScaler()
df[FEATURE_COLUMNS] = scaler.fit_transform(df[FEATURE_COLUMNS])

# Save scaler for inference
joblib.dump(scaler, SCALER_PATH)

# ===============================
# LSTM SEQUENCE CREATION (GLOBAL)
# ===============================
X, y = [], []

feature_data = df[FEATURE_COLUMNS].values
target_data = df[TARGET_COLUMN].values

for i in range(len(feature_data) - SEQ_LENGTH):
    X.append(feature_data[i:i + SEQ_LENGTH])
    y.append(target_data[i + SEQ_LENGTH])

X = np.array(X)
y = np.array(y)


# ===============================
# SAVE PROCESSED DATA
# ===============================
np.save(OUTPUT_X, X)
np.save(OUTPUT_Y, y)

# ===============================
# FINAL LOGS
# ===============================
print("\nPreprocessing Completed Successfully")
print("Sequence Length:", SEQ_LENGTH)
print("X shape:", X.shape)
print("y shape:", y.shape)
print("Scaler saved as:", SCALER_PATH)
