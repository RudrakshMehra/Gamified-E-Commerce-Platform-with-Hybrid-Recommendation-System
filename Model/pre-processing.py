# ================================
# PHASE 1 – DATA PREPROCESSING
# Hybrid Recommendation System
# ================================

import pandas as pd
import numpy as np

# -------------------------------
# 1. Load Dataset
# -------------------------------

df = pd.read_csv("ecommerce_customer_data_large.csv")

print("Initial Shape:", df.shape)
print(df.head())


# -------------------------------
# 2. Basic Cleaning
# -------------------------------

# Remove duplicate columns (Age + Customer Age issue)
df = df.loc[:, ~df.columns.duplicated()]

# Keep only one age column
if "Age" in df.columns:
    df.drop(columns=["Age"], inplace=True)

# Rename for consistency
df.rename(columns={
    "Customer ID": "customer_id",
    "Purchase Date": "purchase_date",
    "Product Category": "product_category",
    "Product Price": "product_price",
    "Quantity": "quantity",
    "Total Purchase Amount": "total_purchase_amount",
    "Payment Method": "payment_method",
    "Customer Age": "customer_age",
    "Returns": "returns",
    "Customer Name": "customer_name",
    "Gender": "gender",
    "Churn": "churn"
}, inplace=True)


# -------------------------------
# 3. Data Type Conversion
# -------------------------------

df["purchase_date"] = pd.to_datetime(df["purchase_date"], errors="coerce")
df["returns"] = df["returns"].fillna(0)
df["returns"] = df["returns"].astype(int)

numeric_cols = ["product_price", "quantity", "customer_age"]
for col in numeric_cols:
    df[col] = pd.to_numeric(df[col], errors="coerce")


# -------------------------------
# 4. Drop Original Incorrect Total
# -------------------------------

df.drop(columns=["total_purchase_amount"], inplace=True)


# -------------------------------
# 5. Create Correct Total
# -------------------------------

df["correct_total"] = df["product_price"] * df["quantity"]


# -------------------------------
# 6. Remove Invalid Rows
# -------------------------------

df.dropna(subset=["customer_id", "product_category", 
                  "product_price", "quantity"], inplace=True)

df = df[df["quantity"] > 0]
df = df[df["product_price"] > 0]


print("After Cleaning Shape:", df.shape)


# -------------------------------
# 7. Create Interaction Score
# -------------------------------

# Normalize spending
df["normalized_spending"] = (
    df["correct_total"] - df["correct_total"].min()
) / (
    df["correct_total"].max() - df["correct_total"].min()
)

# Interaction Score (Weighted)
df["interaction_score"] = (
    0.6 * df["quantity"] +
    0.4 * df["normalized_spending"]
)


# Aggregate to Customer-Category Level
agg_df = df.groupby(
    ["customer_id", "product_category"]
).agg({
    "interaction_score": "sum",
    "quantity": "sum",
    "correct_total": "sum"
}).reset_index()


print("Aggregated Shape:", agg_df.shape)

# Create User-Item Matrix
user_item_matrix = agg_df.pivot_table(
    index="customer_id",
    columns="product_category",
    values="interaction_score",
    fill_value=0
)

print("User-Item Matrix Shape:", user_item_matrix.shape)


# Save Cleaned Outputs
df.to_csv("cleaned_transactions.csv", index=False)
user_item_matrix.to_csv("user_item_matrix.csv")

print("Preprocessing Complete ✅")
