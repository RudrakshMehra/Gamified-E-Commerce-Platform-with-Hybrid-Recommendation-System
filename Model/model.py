import pandas as pd
import numpy as np
from sklearn.neighbors import NearestNeighbors

df = pd.read_csv("user_item_matrix.csv")

df.set_index("customer_id", inplace=True)

print("User-Item Matrix Shape:", df.shape)

model = NearestNeighbors(
    metric="cosine",
    algorithm="brute",
    n_neighbors=6 
)

model.fit(df.values)

print("KNN Model Trained Successfully")=

def recommend_categories(customer_id, top_n=2):
    
    if customer_id not in df.index:
        print("Customer not found")
        return None
    
    
    user_vector = df.loc[customer_id].values.reshape(1, -1)

    distances, indices = model.kneighbors(user_vector)
    
    similar_users = indices.flatten()[1:]
    
    neighbor_data = df.iloc[similar_users]
    
    mean_scores = neighbor_data.mean(axis=0)
    
    user_scores = df.loc[customer_id]
    
    recommendation_scores = mean_scores - user_scores
    
    recommended = recommendation_scores.sort_values(ascending=False)
    
    return recommended.head(top_n)


# Test
# sample_user = df.index[10]

# print(f"\nRecommendations for User {sample_user}")
# print(recommend_categories(sample_user))