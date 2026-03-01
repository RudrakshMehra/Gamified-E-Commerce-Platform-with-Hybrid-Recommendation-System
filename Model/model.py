import pandas as pd
import numpy as np
from sklearn.neighbors import NearestNeighbors

df = pd.read_csv("user_item_matrix.csv")

# Set customer_id as index
df.set_index("customer_id", inplace=True)

print("User-Item Matrix Shape:", df.shape)


# Train KNN Model
model = NearestNeighbors(
    metric="cosine",
    algorithm="brute",
    n_neighbors=6  # 1 user + 5 similar users
)

model.fit(df.values)

print("KNN Model Trained Successfully")


# ==============================
# 3️⃣ Recommendation Function
# ==============================

def recommend_categories(customer_id, top_n=2):
    
    if customer_id not in df.index:
        print("Customer not found")
        return None
    
    # Get user vector
    user_vector = df.loc[customer_id].values.reshape(1, -1)
    
    # Find similar users
    distances, indices = model.kneighbors(user_vector)
    
    # Remove the first one (itself)
    similar_users = indices.flatten()[1:]
    
    # Aggregate scores
    neighbor_data = df.iloc[similar_users]
    
    mean_scores = neighbor_data.mean(axis=0)
    
    # Remove categories user already strongly interacts with
    user_scores = df.loc[customer_id]
    
    recommendation_scores = mean_scores - user_scores
    
    # Sort
    recommended = recommendation_scores.sort_values(ascending=False)
    
    return recommended.head(top_n)


# ==============================
# 4️⃣ Example Test
# ==============================

sample_user = df.index[10]

print(f"\nRecommendations for User {sample_user}")
print(recommend_categories(sample_user))