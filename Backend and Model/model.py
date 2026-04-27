import pandas as pd
import numpy as np
from sklearn.neighbors import NearestNeighbors
from sklearn.metrics.pairwise import cosine_similarity

df = pd.read_csv("cleaned_transactions.csv")

df.rename(columns={"000customer_id": "customer_id"}, inplace=True)

def create_subcategory(row):
    cat = row['product_category']
    price = row['product_price']

    if cat == 'Electronics':
        if price > 50000:
            return 'Laptop'
        elif price > 20000:
            return 'Mobile'
        else:
            return 'Accessories'

    elif cat == 'Clothing':
        if row['gender'] == 'Male':
            return 'Men'
        elif row['gender'] == 'Female':
            return 'Women'
        else:
            return 'Sports'

    elif cat == 'Home':
        if price > 10000:
            return 'Furniture'
        elif price > 3000:
            return 'Kitchen'
        else:
            return 'Decor'

    else:
        return 'Other'

df['subcategory'] = df.apply(create_subcategory, axis=1)

df = df[df['subcategory'] != 'Other']

df['interaction'] = (
    df['interaction_score'] +
    df['normalized_spending'] * 2 +
    df['quantity'] * 1.5 -
    df['returns'] * 3
)

user_item_matrix = df.pivot_table(
    index='customer_id',
    columns='subcategory',
    values='interaction',
    aggfunc='sum',
    fill_value=0
)

print("User-Item Matrix Shape:", user_item_matrix.shape)

knn_model = NearestNeighbors(metric='cosine', algorithm='brute')
knn_model.fit(user_item_matrix)

# print("KNN Model Trained Successfully")

# CONTENT-BASED MATRIX

# Aggregate product features per subcategory
content_matrix = df.groupby('subcategory')[[
    'product_price', 'normalized_spending', 'quantity', 'customer_age'
]].mean()

# Compute similarity between subcategories
content_similarity = cosine_similarity(content_matrix)

content_sim_df = pd.DataFrame(
    content_similarity,
    index=content_matrix.index,
    columns=content_matrix.index
)

# HYBRID RECOMMENDATION
def recommend_for_user(user_id, top_n=3):
    if user_id not in user_item_matrix.index:
        return "User not found"

    # ---------- KNN PART ----------
    user_vector = user_item_matrix.loc[[user_id]]

    distances, indices = knn_model.kneighbors(user_vector, n_neighbors=10)

    similar_users = user_item_matrix.iloc[indices.flatten()]

    knn_scores = similar_users.mean(axis=0)

    user_data = user_item_matrix.loc[user_id]

    # Penalize already interacted
    knn_scores = knn_scores - user_data * 0.3

    # ---------- CONTENT PART ----------
    interacted_items = user_data[user_data > 0].index

    content_scores = pd.Series(0, index=user_item_matrix.columns)

    for item in interacted_items:
        content_scores += content_sim_df[item]

    if len(interacted_items) > 0:
        content_scores = content_scores / len(interacted_items)
    
    # Normalize KNN
    if knn_scores.sum() != 0:
        knn_scores = knn_scores / knn_scores.sum()

    # Normalize Content
    if content_scores.sum() != 0:
        content_scores = content_scores / content_scores.sum()

    # ---------- HYBRID COMBINATION ----------
    hybrid_scores = 0.6 * knn_scores + 0.4 * content_scores

    # Fallback if all zero
    if (hybrid_scores <= 0).all():
        hybrid_scores = user_item_matrix.mean(axis=0)

    # Normalize
    if hybrid_scores.sum() != 0:
        hybrid_scores = hybrid_scores / hybrid_scores.sum()

    # Remove zero/negative
    hybrid_scores = hybrid_scores[hybrid_scores > 0]

    # Ensure enough results
    if len(hybrid_scores) < top_n:
        fallback = user_item_matrix.mean(axis=0)
        hybrid_scores = fallback.sort_values(ascending=False)

    return hybrid_scores.sort_values(ascending=False).head(top_n)

# TEST
# user_id = df['customer_id'].iloc[0]

# recommendations = recommend_for_user(user_id)

# print(f"\nHYBRID Recommendations for User {user_id}:\n")
# print(recommendations)