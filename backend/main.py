from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
import joblib
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Airbnb Price Prediction API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # React app URL
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Load the trained models with joblib
def load_model_safely(model_path: str, model_name: str):
    """
    Safely load a model using joblib
    """
    try:
        model = joblib.load(model_path)
        logger.info(f"{model_name} loaded successfully with joblib")
        return model
    except Exception as e:
        logger.error(f"Failed to load {model_name}: {e}")
        return None


# Load model
linear_model = load_model_safely(
    "data/linear_regression_model.pkl", "Linear regression model"
)


# Load unique values from text file instead of full dataset
def load_unique_values():
    """
    Load unique values from unique_values.txt file
    """
    try:
        with open("data/unique_values.txt", "r") as file:
            content = file.read()
            # Execute the content to get the data_dict
            local_vars = {}
            exec(content, {}, local_vars)
            data_dict = local_vars["data_dict"]
            logger.info("Unique values loaded successfully from unique_values.txt")
            return data_dict
    except Exception as e:
        logger.warning(f"Could not load unique_values.txt: {e}")
        logger.info("Using fallback default values")
        # Fallback values
        return {
            "property_type": ["Apartment", "House", "Condominium", "Loft", "Other"],
            "room_type": ["Entire home/apt", "Private room", "Shared room"],
            "bed_type": ["Real Bed", "Futon", "Pull-out Sofa", "Couch"],
            "cancellation_policy": ["strict", "moderate", "flexible"],
            "city": ["NYC", "SF", "DC", "LA", "Chicago", "Boston"],
            "accommodates": [1, 2, 3, 4, 5, 6, 7, 8],
            "bathrooms": [0.5, 1.0, 1.5, 2.0, 2.5, 3.0],
            "bedrooms": [0, 1, 2, 3, 4, 5],
            "beds": [1, 2, 3, 4, 5, 6],
            "amenities_count": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        }


# Load unique values
unique_values_data = load_unique_values()


class PredictionRequest(BaseModel):
    property_type: str
    room_type: str
    amenities_count: int
    accommodates: int
    bathrooms: float
    bed_type: str
    cancellation_policy: str
    cleaning_fee: bool
    city: str
    instant_bookable: bool
    bedrooms: int
    beds: int


class PredictionResponse(BaseModel):
    predicted_price: float
    model_used: str
    log_price: float


def preprocess_features(data: PredictionRequest) -> pd.DataFrame:
    """
    Preprocess the input features to match the training data format
    """
    # Convert the request to a dictionary with exact column names and order from training
    features = {
        "property_type": data.property_type,
        "room_type": data.room_type,
        "accommodates": data.accommodates,
        "bathrooms": data.bathrooms,
        "bed_type": data.bed_type,
        "cancellation_policy": data.cancellation_policy,
        "cleaning_fee": 1 if data.cleaning_fee else 0,
        "city": data.city,
        "instant_bookable": 1 if data.instant_bookable else 0,
        "bedrooms": data.bedrooms,
        "beds": data.beds,
        "amenities_count": data.amenities_count,
    }

    # Create DataFrame
    df = pd.DataFrame([features])

    # Use unique values data to get consistent categorical encoding
    if unique_values_data is not None:
        categorical_columns = [
            "property_type",
            "room_type",
            "bed_type",
            "cancellation_policy",
            "city",
        ]

        for col in categorical_columns:
            if col in df.columns and col in unique_values_data:
                # Get all unique values from training data
                training_categories = unique_values_data[col]
                # Create categorical with categories from training data
                df[col] = pd.Categorical(df[col], categories=training_categories).codes
                # Handle unknown categories (set to -1 or most frequent category)
                if df[col].iloc[0] == -1:
                    # If category not found, use the first category from training
                    df[col] = pd.Categorical(
                        [training_categories[0]], categories=training_categories
                    ).codes[0]
    else:
        # Fallback to simple categorical encoding if unique values not available
        categorical_columns = [
            "property_type",
            "room_type",
            "bed_type",
            "cancellation_policy",
            "city",
        ]

        for col in categorical_columns:
            if col in df.columns:
                df[col] = pd.Categorical(df[col]).codes

    return df


@app.get("/")
async def root():
    return {"message": "Airbnb Price Prediction API", "status": "running"}


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "linear_model_loaded": linear_model is not None,
    }


@app.get("/form-options")
async def get_form_options():
    """
    Get unique values from the unique_values.txt file for form dropdowns
    """
    if unique_values_data is None:
        raise HTTPException(status_code=500, detail="Unique values data not loaded")

    try:
        options = {}

        # Get unique values for categorical columns
        categorical_columns = [
            "property_type",
            "room_type",
            "bed_type",
            "cancellation_policy",
            "city",
        ]

        for column in categorical_columns:
            if column in unique_values_data:
                # Get unique values and sort
                unique_values = unique_values_data[column]
                options[column] = sorted([str(val) for val in unique_values])
            else:
                logger.warning(f"Column {column} not found in unique values data")
                options[column] = []

        # Use hardcoded amenities list
        hardcoded_amenities = [
            "air_conditioning",
            "carbon_monoxide_detector",
            "essentials",
            "hangers",
            "heating",
            "kitchen",
            "shampoo",
            "smoke_detector",
            "tv",
            "wireless_internet",
        ]
        options["amenities_list"] = sorted(hardcoded_amenities)

        # Get numeric ranges for validation
        numeric_columns = [
            "accommodates",
            "bathrooms",
            "bedrooms",
            "beds",
            "amenities_count",
        ]
        ranges = {}

        for column in numeric_columns:
            if column in unique_values_data:
                values = unique_values_data[column]
                numeric_values = [float(v) for v in values if v is not None]
                if numeric_values:
                    ranges[column] = {
                        "min": int(min(numeric_values)),
                        "max": int(max(numeric_values)),
                        "median": float(
                            sorted(numeric_values)[len(numeric_values) // 2]
                        ),
                    }
                else:
                    ranges[column] = {"min": 1, "max": 10, "median": 2}
            else:
                ranges[column] = {"min": 1, "max": 10, "median": 2}

        return {
            "categorical_options": options,
            "numeric_ranges": ranges,
            "total_records": "N/A (using unique values)",
        }

    except Exception as e:
        logger.error(f"Error getting form options: {e}")
        raise HTTPException(
            status_code=500, detail=f"Error processing unique values: {str(e)}"
        )


@app.post("/predict/linear", response_model=PredictionResponse)
async def predict_linear(request: PredictionRequest):
    """
    Predict Airbnb price using Linear Regression model
    """
    if linear_model is None:
        raise HTTPException(
            status_code=500, detail="Linear regression model not loaded"
        )

    try:
        # Preprocess features
        features_df = preprocess_features(request)

        # Make prediction (this will be log_price)
        log_price_pred = linear_model.predict(features_df)[0]

        # Convert back to actual price
        predicted_price = np.exp(log_price_pred)

        return PredictionResponse(
            predicted_price=round(predicted_price, 2),
            model_used="Linear Regression",
            log_price=round(log_price_pred, 4),
        )

    except Exception as e:
        logger.error(f"Error in linear prediction: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@app.post("/predict/both", response_model=dict)
async def predict_both(request: PredictionRequest):
    """
    Get prediction from linear regression model
    """
    results = {}

    if linear_model is not None:
        try:
            features_df = preprocess_features(request)
            log_price_linear = linear_model.predict(features_df)[0]
            results["linear_regression"] = {
                "predicted_price": round(np.exp(log_price_linear), 2),
                "log_price": round(log_price_linear, 4),
            }
        except Exception as e:
            results["linear_regression"] = {"error": str(e)}

    if not results:
        raise HTTPException(
            status_code=500, detail="No models available for prediction"
        )

    return results


@app.get("/model-info")
async def get_model_info():
    """
    Get information about the loaded model
    """
    info = {
        "linear_regression": {
            "loaded": linear_model is not None,
            "type": "Linear Regression",
        },
    }

    # Add feature information if model has feature_names_in_ attribute
    if linear_model is not None and hasattr(linear_model, "feature_names_in_"):
        info["linear_regression"][
            "expected_features"
        ] = linear_model.feature_names_in_.tolist()

    # Add unique values information
    if unique_values_data is not None:
        info["unique_values_columns"] = list(unique_values_data.keys())
        info["data_source"] = "unique_values.txt"
    else:
        info["data_source"] = "fallback_values"

    return info


@app.get("/debug-features")
async def debug_features():
    """
    Debug endpoint to show feature processing
    """
    if unique_values_data is None:
        raise HTTPException(status_code=500, detail="Unique values data not loaded")

    # Show available columns from unique values
    feature_columns = list(unique_values_data.keys())

    sample_data = {
        "unique_values_columns": feature_columns,
        "categorical_columns": [
            "property_type",
            "room_type",
            "bed_type",
            "cancellation_policy",
            "city",
            "amenities_list",
        ],
        "numeric_columns": [
            "accommodates",
            "bathrooms",
            "cleaning_fee",
            "instant_bookable",
            "bedrooms",
            "beds",
            "amenities_count",
        ],
    }

    # Show unique values for categorical columns (first 10 for each)
    for col in [
        "property_type",
        "room_type",
        "bed_type",
        "cancellation_policy",
        "city",
    ]:
        if col in unique_values_data:
            unique_vals = unique_values_data[col][:10]  # First 10 values
            sample_data[f"{col}_sample_values"] = unique_vals

    return sample_data


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
