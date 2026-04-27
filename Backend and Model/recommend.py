import pandas as pd
import numpy as np
from sklearn.neighbors import NearestNeighbors
from sklearn.metrics.pairwise import cosine_similarity
from flask import Flask, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# ─────────────────────────────────────────
# LOAD & PREPARE DATA
# ─────────────────────────────────────────

CSV_PATH = os.getenv("CLEANED_CSV", "cleaned_transactions.csv")

try:
    df = pd.read_csv(CSV_PATH)
    df.rename(columns={"000customer_id": "customer_id"}, inplace=True)
    DATA_LOADED = True
except FileNotFoundError:
    print(f"[WARN] '{CSV_PATH}' not found. /recommend will return errors until the file is present.")
    df = None
    DATA_LOADED = False


def create_subcategory(row):
    cat   = row["product_category"]
    price = row["product_price"]

    if cat == "Electronics":
        if price > 50000:
            return "Laptop"
        elif price > 20000:
            return "Mobile"
        else:
            return "Accessories"

    elif cat == "Clothing":
        if row["gender"] == "Male":
            return "Men"
        elif row["gender"] == "Female":
            return "Women"
        else:
            return "Sports"

    elif cat == "Home":
        if price > 10000:
            return "Furniture"
        elif price > 3000:
            return "Kitchen"
        else:
            return "Decor"

    return "Other"


def build_model(dataframe):
    dataframe["subcategory"] = dataframe.apply(create_subcategory, axis=1)
    dataframe = dataframe[dataframe["subcategory"] != "Other"].copy()

    dataframe["interaction"] = (
        dataframe["interaction_score"]
        + dataframe["normalized_spending"] * 2
        + dataframe["quantity"] * 1.5
        - dataframe["returns"] * 3
    )

    uim = dataframe.pivot_table(
        index="customer_id",
        columns="subcategory",
        values="interaction",
        aggfunc="sum",
        fill_value=0,
    )

    knn = NearestNeighbors(metric="cosine", algorithm="brute")
    knn.fit(uim)

    content_matrix = dataframe.groupby("subcategory")[[
        "product_price", "normalized_spending", "quantity", "customer_age"
    ]].mean()

    content_sim = cosine_similarity(content_matrix)
    content_sim_df = pd.DataFrame(
        content_sim,
        index=content_matrix.index,
        columns=content_matrix.index,
    )

    return uim, knn, content_sim_df, dataframe


if DATA_LOADED:
    user_item_matrix, knn_model, content_sim_df, df = build_model(df)
    print(f"[INFO] Model ready. Users: {user_item_matrix.shape[0]}, Subcategories: {user_item_matrix.shape[1]}")


# ─────────────────────────────────────────
# RECOMMENDATION LOGIC
# ─────────────────────────────────────────

def recommend_for_user(user_id, top_n=3):
    if user_id not in user_item_matrix.index:
        return None, "User not found"

    user_vector = user_item_matrix.loc[[user_id]]
    distances, indices = knn_model.kneighbors(user_vector, n_neighbors=10)

    similar_users = user_item_matrix.iloc[indices.flatten()]
    knn_scores    = similar_users.mean(axis=0)
    user_data     = user_item_matrix.loc[user_id]

    knn_scores = knn_scores - user_data * 0.3

    interacted_items = user_data[user_data > 0].index
    content_scores   = pd.Series(0.0, index=user_item_matrix.columns)

    for item in interacted_items:
        if item in content_sim_df.columns:
            content_scores += content_sim_df[item]

    if len(interacted_items) > 0:
        content_scores = content_scores / len(interacted_items)

    if knn_scores.sum() != 0:
        knn_scores = knn_scores / knn_scores.sum()

    if content_scores.sum() != 0:
        content_scores = content_scores / content_scores.sum()

    hybrid_scores = 0.6 * knn_scores + 0.4 * content_scores

    if (hybrid_scores <= 0).all():
        hybrid_scores = user_item_matrix.mean(axis=0)

    if hybrid_scores.sum() != 0:
        hybrid_scores = hybrid_scores / hybrid_scores.sum()

    hybrid_scores = hybrid_scores[hybrid_scores > 0]

    if len(hybrid_scores) < top_n:
        hybrid_scores = user_item_matrix.mean(axis=0).sort_values(ascending=False)

    result = hybrid_scores.sort_values(ascending=False).head(top_n)
    return result, None


# ─────────────────────────────────────────
# ROUTES
# ─────────────────────────────────────────

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "data_loaded": DATA_LOADED,
        "users": int(user_item_matrix.shape[0]) if DATA_LOADED else 0,
        "subcategories": list(user_item_matrix.columns) if DATA_LOADED else [],
    })


@app.route("/recommend", methods=["GET"])
def recommend():
    if not DATA_LOADED:
        return jsonify({"error": "Model data not loaded. Run preprocessing first."}), 503

    user_id = request.args.get("user_id")
    top_n   = request.args.get("top_n", 3)

    if not user_id:
        return jsonify({"error": "user_id query param is required"}), 400

    # user_id may be numeric in the CSV
    try:
        user_id = int(user_id)
    except ValueError:
        pass  # keep as string if non-numeric

    try:
        top_n = int(top_n)
        top_n = max(1, min(top_n, 10))   # clamp 1-10
    except ValueError:
        top_n = 3

    scores, err = recommend_for_user(user_id, top_n)

    if err:
        return jsonify({"error": err}), 404

    recommendations = [
        {"subcategory": str(sub), "score": round(float(score), 4)}
        for sub, score in scores.items()
    ]

    return jsonify({
        "user_id": user_id,
        "top_n": top_n,
        "recommendations": recommendations,
    })


@app.route("/users", methods=["GET"])
def list_users():
    """Returns a sample of available user IDs — useful for testing."""
    if not DATA_LOADED:
        return jsonify({"error": "Model data not loaded."}), 503

    sample = user_item_matrix.index[:20].tolist()
    return jsonify({"sample_user_ids": sample, "total_users": len(user_item_matrix)})


# ─────────────────────────────────────────
# ENTRY POINT
# ─────────────────────────────────────────

if __name__ == "__main__":
    port = int(os.getenv("FLASK_PORT", 8000))
    app.run(host="0.0.0.0", port=port, debug=False)
