
from functools import lru_cache

from transformers import pipeline


MODEL_ID = "neghani/plantvillage-mobilenetv2"


@lru_cache(maxsize=1)
def get_classifier():
    """Load the model once and reuse it for later predictions."""
    return pipeline(
        "image-classification",
        model=MODEL_ID,
        device=-1,  # CPU
    )


def predict_plant_disease(image_path):
    classifier = get_classifier()
    predictions = classifier(image_path, top_k=3)

    if not predictions:
        raise ValueError("The model returned no predictions.")

    results = []

    for item in predictions:
        label = item["label"]
        score = float(item["score"])

        # The selected model is intended for tomato leaf categories.
        results.append({
            "label": label,
            "confidence": round(score * 100, 2),
        })

    best = results[0]

    # Treat low-confidence results as uncertain rather than a diagnosis.
    if best["confidence"] < 60:
        return {
            "status": "uncertain",
            "message": (
                "The result is uncertain. Try a clear photo of one "
                "tomato leaf in good daylight."
            ),
            "prediction": best,
            "alternatives": results[1:],
        }

    return {
        "status": "prediction",
        "message": (
            "This is an AI screening result, not a confirmed diagnosis. "
            "Consult an agricultural expert before applying treatment."
        ),
        "prediction": best,
        "alternatives": results[1:],
    }
