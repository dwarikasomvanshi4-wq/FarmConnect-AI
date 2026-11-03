
from functools import lru_cache

from transformers import pipeline


MODEL_ID = "neghani/plantvillage-mobilenetv2"
CONFIDENCE_THRESHOLD = 60.0


@lru_cache(maxsize=1)
def get_classifier():
    """Load the model once and reuse it for later predictions."""
    return pipeline(
        "image-classification",
        model=MODEL_ID,
        device=-1,  # CPU
    )


def predict_plant_disease(image_path):
    """Return AI screening results for an uploaded plant-leaf image."""
    classifier = get_classifier()
    predictions = classifier(image_path, top_k=3)

    if not predictions:
        raise ValueError("The model returned no predictions.")

    results = []

    for item in predictions:
        label = str(item["label"])
        score = float(item["score"])

        results.append({
            "label": label,
            "confidence": round(score * 100, 2),
        })

    best = results[0]

    if best["confidence"] < CONFIDENCE_THRESHOLD:
        return {
            "status": "uncertain",
            "message": (
                "The prediction has low confidence. Try a clear photo "
                "of a single plant leaf in good daylight."
            ),
            "prediction": best,
            "alternatives": results[1:],
        }

    return {
        "status": "prediction",
        "message": (
            "This is an AI-generated screening result, not a confirmed "
            "diagnosis. Results can be inaccurate. Consult an agricultural "
            "expert before applying treatment."
        ),
        "prediction": best,
        "alternatives": results[1:],
    }
