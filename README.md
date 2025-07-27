# Airbnb Price Prediction Application

A full-stack application for predicting Airbnb rental prices using machine learning models. The application features a FastAPI backend with trained Linear Regression and Random Forest models, and a React frontend for user interaction.

## Features

- **FastAPI Backend**: RESTful API with multiple ML model endpoints
- **React Frontend**: Modern, responsive user interface
- **Multiple Models**: Compare predictions from Linear Regression and Random Forest models
- **Real-time Predictions**: Get instant price predictions based on property details
- **Model Comparison**: Side-by-side comparison of different model predictions

## Project Structure

```
Rental Prices of AirBnb/
├── Backend/
│   ├── main.py                 # FastAPI application
│   ├── requirements.txt        # Python dependencies
│   ├── start.sh               # Backend start script
│   └── data/                  # ML models and datasets
│       ├── linear_regression_model.pkl
│       ├── random_forest_regressor_model.pkl
│       ├── Airbnb_Data.csv
│       └── dataSP23.csv
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── PricePredictionForm.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.js
│   │   └── App.css
│   ├── package.json
│   └── public/
└── README.md
```

## Setup Instructions

### Backend Setup

1. Navigate to the Backend directory:

   ```bash
   cd Backend
   ```

2. Start the FastAPI server:
   ```bash
   ./start.sh
   ```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install Node.js dependencies and Start the React development server:

```bash
npm install && npm start
```

The React app will be available at `http://localhost:3000`

## API Endpoints

### Backend API Documentation

Once the backend is running, you can access the interactive API documentation at:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Available Endpoints

- `GET /` - Root endpoint
- `GET /health` - Health check and model status
- `GET /model-info` - Information about loaded models
- `POST /predict/linear` - Predict using Linear Regression model
- `POST /predict/both` - Get predictions from both models

### Request Format

All prediction endpoints expect a JSON payload with the following structure:

```json
{
  "property_type": "Apartment",
  "room_type": "Entire home/apt",
  "amenities": "WiFi, Kitchen, Free parking",
  "accommodates": 4,
  "bathrooms": 2.0,
  "bed_type": "Real Bed",
  "cancellation_policy": "moderate",
  "cleaning_fee": true,
  "city": "New York",
  "instant_bookable": false,
  "number_of_reviews": 25,
  "review_scores_rating": 95,
  "bedrooms": 2,
  "beds": 2
}
```

### Response Format

Single model prediction response:

```json
{
  "predicted_price": 150.25,
  "model_used": "Linear Regression",
  "log_price": 5.0125
}
```

Both models comparison response:

```json
{
  "linear_regression": {
    "predicted_price": 150.25,
    "log_price": 5.0125
  },
  "random_forest": {
    "predicted_price": 148.75,
    "log_price": 5.0025
  }
}
```

## Usage

1. **Start the Backend**: Run the FastAPI server using the instructions above
2. **Start the Frontend**: Run the React app using the instructions above
3. **Fill the Form**: Enter property details in the web interface
4. **Get Predictions**: Choose from three prediction options:
   - Linear Regression only
   - Random Forest only
   - Compare both models

## Input Fields

The application requires the following property information:

- **Property Type**: Type of property (Apartment, House, etc.)
- **Room Type**: Type of room rental (Entire home/apt, Private room, Shared room)
- **City**: City where the property is located
- **Accommodates**: Number of guests the property can accommodate
- **Bedrooms**: Number of bedrooms
- **Beds**: Number of beds
- **Bathrooms**: Number of bathrooms
- **Bed Type**: Type of bed (Real Bed, Futon, etc.)
- **Cancellation Policy**: Cancellation policy type
- **Number of Reviews**: Total number of reviews
- **Review Score Rating**: Average review score (1-100)
- **Cleaning Fee**: Whether a cleaning fee is charged
- **Instant Bookable**: Whether the property is instantly bookable
- **Amenities**: List of available amenities

## Technology Stack

### Backend

- **FastAPI**: Modern, fast web framework for building APIs
- **Python**: Programming language
- **Pandas**: Data manipulation and analysis
- **Scikit-learn**: Machine learning library
- **Uvicorn**: ASGI server for running FastAPI

### Frontend

- **React**: JavaScript library for building user interfaces
- **Axios**: HTTP client for making API requests
- **CSS3**: Styling and responsive design
- **Create React App**: Build tool and development environment

## Development

### Adding New Features

1. **Backend**: Add new endpoints in `main.py`
2. **Frontend**: Add new components in `src/components/`
3. **API Service**: Update `src/services/api.js` for new endpoints

### Model Updates

To use different or updated models:

1. Save new models as `.pkl` files in the `Backend/data/` directory
2. Update the model loading code in `main.py`
3. Ensure the feature preprocessing matches your model's requirements

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure the backend CORS settings allow requests from `http://localhost:3000`
2. **Model Loading Errors**: Check that the `.pkl` files exist in the `Backend/data/` directory
3. **Port Conflicts**: Make sure ports 3000 and 8000 are available

### Error Handling

The application includes comprehensive error handling:

- Backend validation errors are displayed to users
- Network connection issues are handled gracefully
- Model prediction errors are logged and reported

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational and demonstration purposes.
