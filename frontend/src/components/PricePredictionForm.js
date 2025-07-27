import React, { useState, useEffect } from "react";
import { FiHome, FiDollarSign, FiTrendingUp, FiInfo, FiMail, FiCheck, FiX } from "react-icons/fi";
import { apiService } from "../services/api";
import "./PricePredictionForm.css";

const PricePredictionApp = () => {
  return (
    <div className="app-container">
      <Navbar />
      <HeroSection />
      <PricePredictionForm />
      <FeaturesSection />
      <Footer />
    </div>
  );
};

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="logo">
          <FiTrendingUp className="logo-icon" />
          <span>PricePredict</span>
        </div>

        <div className={`nav-links ${mobileMenuOpen ? "active" : ""}`}>
          <a href="#home" className="nav-link active">
            <FiHome className="nav-icon" /> Home
          </a>
          <a href="#predict" className="nav-link">
            <FiDollarSign className="nav-icon" /> Predict
          </a>
          <a href="#features" className="nav-link">
            <FiInfo className="nav-icon" /> Features
          </a>
          <a href="#contact" className="nav-link">
            <FiMail className="nav-icon" /> Contact
          </a>
        </div>

        <button className="mobile-menu-button" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <FiX /> : <span>&#9776;</span>}
        </button>
      </div>
    </nav>
  );
};

const HeroSection = () => {
  return (
    <section className="hero-section" id="home">
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title">Smart Airbnb Price Predictions</h1>
          <p className="hero-subtitle">Leverage machine learning to get accurate price estimates for your rental properties. Our advanced algorithms analyze market trends to give you the competitive edge.</p>
          <div className="hero-buttons">
            <a href="#predict" className="primary-button">
              Try Predictor
            </a>
            <a href="#features" className="secondary-button">
              Learn More
            </a>
          </div>
        </div>
        <div className="hero-image">
          <div className="image-placeholder">
            <div className="data-visualization-animation"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

const FeaturesSection = () => {
  return (
    <section className="features-section" id="features">
      <div className="section-container">
        <h2 className="section-title">Why Choose Our Predictor</h2>
        <p className="section-subtitle">Powered by cutting-edge machine learning models</p>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <FiTrendingUp />
            </div>
            <h3>Machine Learning Accuracy</h3>
            <p>Get accurate predictions using our linear regression model trained on comprehensive market data.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <FiCheck />
            </div>
            <h3>Real-time Analysis</h3>
            <p>Get instant predictions based on current market data and property specifications.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <FiDollarSign />
            </div>
            <h3>Market Insights</h3>
            <p>Understand how different factors impact your property's potential rental value.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="footer" id="contact">
      <div className="footer-container">
        <div className="footer-column">
          <div className="logo">
            <FiTrendingUp className="logo-icon" />
            <span>PricePredict</span>
          </div>
          <p className="footer-description">Advanced property price prediction using machine learning models.</p>
        </div>

        <div className="footer-column">
          <h4>Quick Links</h4>
          <ul className="footer-links">
            <li>
              <a href="#home">Home</a>
            </li>
            <li>
              <a href="#predict">Predictor</a>
            </li>
            <li>
              <a href="#features">Features</a>
            </li>
            <li>
              <a href="#contact">Contact</a>
            </li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Contact Us</h4>
          <ul className="footer-contact">
            <li>info@pricepredict.com</li>
            <li>+1 (555) 123-4567</li>
            <li>123 Data Science Ave, Tech City</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} PricePredict. All rights reserved.</p>
      </div>
    </footer>
  );
};

const PricePredictionForm = () => {
  const [formData, setFormData] = useState({
    property_type: "",
    room_type: "",
    amenities_list: "",
    amenities_count: 0,
    accommodates: 1,
    bathrooms: 1,
    bed_type: "",
    cancellation_policy: "",
    cleaning_fee: false,
    city: "",
    instant_bookable: false,
    bedrooms: 1,
    beds: 1,
  });

  const [formOptions, setFormOptions] = useState({
    property_type: [],
    room_type: [],
    bed_type: [],
    cancellation_policy: [],
    city: [],
    amenities_list: [],
  });
  const [numericRanges, setNumericRanges] = useState({});
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [optionsLoading, setOptionsLoading] = useState(true);

  // Fetch form options from backend
  useEffect(() => {
    const fetchFormOptions = async () => {
      try {
        setOptionsLoading(true);
        const data = await apiService.getFormOptions();
        setFormOptions(data.categorical_options);
        setNumericRanges(data.numeric_ranges);

        // Set default values based on ranges
        if (data.numeric_ranges) {
          setFormData((prev) => ({
            ...prev,
            accommodates: data.numeric_ranges.accommodates?.median || 2,
            bathrooms: data.numeric_ranges.bathrooms?.median || 1,
            bedrooms: data.numeric_ranges.bedrooms?.median || 1,
            beds: data.numeric_ranges.beds?.median || 1,
            amenities_count: data.numeric_ranges.amenities_count?.median || 3,
          }));
        }
      } catch (err) {
        console.error("Error fetching form options:", err);
        setError("Failed to load form options. Using fallback values.");
        // Set fallback options
        setFormOptions({
          property_type: ["Apartment", "House", "Other"],
          room_type: ["Entire home/apt", "Private room", "Shared room"],
          bed_type: ["Real Bed", "Futon", "Couch"],
          cancellation_policy: ["flexible", "moderate", "strict"],
          city: ["New York", "Los Angeles", "Chicago"],
          amenities_list: ["air_conditioning", "carbon_monoxide_detector", "essentials", "hangers", "heating", "kitchen", "shampoo", "smoke_detector", "tv", "wireless_internet"],
        });
      } finally {
        setOptionsLoading(false);
      }
    };

    fetchFormOptions();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAmenityChange = (e) => {
    const { value, checked } = e.target;
    const currentAmenities = formData.amenities_list ? formData.amenities_list.split(", ") : [];

    let newAmenities;
    if (checked) {
      newAmenities = [...currentAmenities, value];
    } else {
      newAmenities = currentAmenities.filter((amenity) => amenity !== value);
    }

    setFormData((prev) => ({
      ...prev,
      amenities_list: newAmenities.join(", "),
      amenities_count: newAmenities.length,
    }));
  };

  const handlePredict = async (modelType) => {
    setLoading(true);
    setError(null);
    setPredictions(null);

    try {
      let result;
      switch (modelType) {
        case "linear":
          result = await apiService.predictLinear(formData);
          break;
        case "both":
          result = await apiService.predictBoth(formData);
          break;
        default:
          throw new Error("Invalid model type");
      }

      setPredictions({ type: modelType, data: result });
    } catch (err) {
      setError(err.message || "Prediction failed");
    } finally {
      setLoading(false);
    }
  };

  const renderSingleResult = (result) => (
    <div className="result-card">
      <h3>Price Prediction</h3>
      <div className="price-display">${result.predicted_price}</div>
      <div className="model-info">Model: {result.model_used}</div>
      <div className="model-info">Log Price: {result.log_price}</div>
    </div>
  );

  const renderComparisonResults = (results) => (
    <div className="comparison-results">
      {results.linear_regression && !results.linear_regression.error && (
        <div className="result-card">
          <h3>Linear Regression</h3>
          <div className="price-display">${results.linear_regression.predicted_price}</div>
          <div className="model-info">Log Price: {results.linear_regression.log_price}</div>
        </div>
      )}
      {results.linear_regression?.error && <div className="error">Linear Regression Error: {results.linear_regression.error}</div>}
    </div>
  );

  return (
    <section className="prediction-section" id="predict">
      <div className="section-container">
        <div className="prediction-form">
          <div className="form-header">
            <h2>
              <FiHome className="form-icon" /> Property Details
            </h2>
            <p>Enter your property information to get an accurate price prediction</p>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Property Type *</label>
              <select name="property_type" value={formData.property_type} onChange={handleInputChange} required disabled={optionsLoading}>
                <option value="">{optionsLoading ? "Loading..." : "Select property type"}</option>
                {formOptions.property_type?.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Room Type *</label>
              <select name="room_type" value={formData.room_type} onChange={handleInputChange} required disabled={optionsLoading}>
                <option value="">{optionsLoading ? "Loading..." : "Select room type"}</option>
                {formOptions.room_type?.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>City *</label>
              <select name="city" value={formData.city} onChange={handleInputChange} required disabled={optionsLoading}>
                <option value="">{optionsLoading ? "Loading..." : "Select city"}</option>
                {formOptions.city?.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Accommodates *</label>
              <input type="number" name="accommodates" value={formData.accommodates} onChange={handleInputChange} min={numericRanges.accommodates?.min || 1} max={numericRanges.accommodates?.max || 20} required />
              {numericRanges.accommodates && (
                <small style={{ color: "#666", fontSize: "12px" }}>
                  Range: {numericRanges.accommodates.min} - {numericRanges.accommodates.max}
                </small>
              )}
            </div>

            <div className="form-group">
              <label>Bedrooms *</label>
              <input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleInputChange} min={numericRanges.bedrooms?.min || 0} max={numericRanges.bedrooms?.max || 10} required />
              {numericRanges.bedrooms && (
                <small style={{ color: "#666", fontSize: "12px" }}>
                  Range: {numericRanges.bedrooms.min} - {numericRanges.bedrooms.max}
                </small>
              )}
            </div>

            <div className="form-group">
              <label>Beds *</label>
              <input type="number" name="beds" value={formData.beds} onChange={handleInputChange} min={numericRanges.beds?.min || 1} max={numericRanges.beds?.max || 20} required />
              {numericRanges.beds && (
                <small style={{ color: "#666", fontSize: "12px" }}>
                  Range: {numericRanges.beds.min} - {numericRanges.beds.max}
                </small>
              )}
            </div>

            <div className="form-group">
              <label>Bathrooms *</label>
              <input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleInputChange} min={numericRanges.bathrooms?.min || 0.5} max={numericRanges.bathrooms?.max || 10} step="0.5" required />
              {numericRanges.bathrooms && (
                <small style={{ color: "#666", fontSize: "12px" }}>
                  Range: {numericRanges.bathrooms.min} - {numericRanges.bathrooms.max}
                </small>
              )}
            </div>

            <div className="form-group">
              <label>Bed Type *</label>
              <select name="bed_type" value={formData.bed_type} onChange={handleInputChange} required disabled={optionsLoading}>
                <option value="">{optionsLoading ? "Loading..." : "Select bed type"}</option>
                {formOptions.bed_type?.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Cancellation Policy *</label>
              <select name="cancellation_policy" value={formData.cancellation_policy} onChange={handleInputChange} required disabled={optionsLoading}>
                <option value="">{optionsLoading ? "Loading..." : "Select cancellation policy"}</option>
                {formOptions.cancellation_policy?.map((policy) => (
                  <option key={policy} value={policy}>
                    {policy}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group checkbox-group">
              <input type="checkbox" name="cleaning_fee" checked={formData.cleaning_fee} onChange={handleInputChange} />
              <label>Cleaning Fee</label>
            </div>

            <div className="form-group checkbox-group">
              <input type="checkbox" name="instant_bookable" checked={formData.instant_bookable} onChange={handleInputChange} />
              <label>Instant Bookable</label>
            </div>
          </div>

          <div className="form-group">
            <label>Amenities (Select all that apply)</label>
            {optionsLoading ? (
              <div className="loading">Loading amenities...</div>
            ) : (
              <div>
                <div className="amenities-grid">
                  {formOptions.amenities_list?.map((amenity) => (
                    <div key={amenity} className="checkbox-group">
                      <input type="checkbox" value={amenity} checked={formData.amenities_list.includes(amenity)} onChange={handleAmenityChange} />
                      <label>{amenity.replace(/_/g, " ")}</label>
                    </div>
                  ))}
                </div>
                <div className="amenities-summary">
                  <strong>Selected Amenities Count: {formData.amenities_count}</strong>
                  {formData.amenities_list && <div style={{ marginTop: "5px", fontSize: "14px", opacity: 0.9 }}>Selected: {formData.amenities_list || "None"}</div>}
                </div>
              </div>
            )}
          </div>

          <div className="predict-buttons">
            <button className="predict-btn linear" onClick={() => handlePredict("linear")} disabled={loading || optionsLoading || !formData.property_type || !formData.room_type || !formData.city}>
              Predict with Linear Regression
            </button>
            <button className="predict-btn both" onClick={() => handlePredict("both")} disabled={loading || optionsLoading || !formData.property_type || !formData.room_type || !formData.city}>
              Get Prediction
            </button>
          </div>

          {optionsLoading && (
            <div className="loading">
              <div className="spinner"></div>
              Loading form options from dataset...
            </div>
          )}

          {loading && (
            <div className="loading">
              <div className="spinner"></div>
              Generating prediction...
            </div>
          )}

          {error && <div className="error">Error: {error}</div>}

          {predictions && (
            <div className="results">
              <h3>Prediction Results</h3>
              {predictions.type === "both" ? renderComparisonResults(predictions.data) : renderSingleResult(predictions.data)}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PricePredictionApp;
