from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")
embedding = model.encode("I moved to Germany in 2021 to study Computer Science.")

print(f"Embedding length: {len(embedding)}")
print(embedding[:5])  # just show first 5 numbers as a sanity check