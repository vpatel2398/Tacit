"""
Free Embedding Service — Gradio version (EASIEST for Hugging Face Spaces)

This is the SIMPLEST way to deploy. Steps:
1. Go to huggingface.co/new-space
2. Name it "knowledge-layer-embeddings", SDK = "Gradio", hardware = "CPU basic" (free)
3. Upload this file as app.py + the requirements.txt
4. Wait ~2 min for it to build
5. Your embedding endpoint will be:
   https://YOUR-USERNAME-knowledge-layer-embeddings.hf.space/api/embed

The Gradio app exposes an API automatically. Next.js calls it via the /run/predict endpoint.
"""

import gradio as gr
from sentence_transformers import SentenceTransformer

# Load model once (free, CPU, ~80MB)
model = SentenceTransformer("all-MiniLM-L6-v2")


def embed_texts(texts_json):
    """
    Takes a JSON string list of texts, returns list of 384-dim embeddings.
    Input: '["text one", "text two"]'
    Output: [[0.1, 0.2, ...], [0.3, 0.4, ...]]
    """
    import json
    texts = json.loads(texts_json)
    embeddings = model.encode(texts, normalize_embeddings=True).tolist()
    return json.dumps(embeddings)


demo = gr.Interface(
    fn=embed_texts,
    inputs=gr.Textbox(label="Texts (JSON array)"),
    outputs=gr.Textbox(label="Embeddings (JSON)"),
    title="Knowledge Layer Embeddings",
    description="all-MiniLM-L6-v2 — 384 dimensions — free",
    api_name="embed",
)

if __name__ == "__main__":
    demo.launch()
