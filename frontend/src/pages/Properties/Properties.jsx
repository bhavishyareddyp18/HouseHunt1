import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../../services/api";
import "./Properties.css";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600";

function Properties() {
  const [searchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const city = searchParams.get("city") || "";
  const type = searchParams.get("type") || "";

  useEffect(() => {
    let isMounted = true;

    const fetchProperties = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = {};
        if (city.trim()) params.city = city.trim();
        if (type.trim()) params.type = type.trim();

        const response = await api.get("/properties", { params });

        if (!isMounted) return;

        // Backend response format: { success: true, count: N, data: [...] }
        const resData = response.data;
        const propertyList = Array.isArray(resData)
          ? resData
          : Array.isArray(resData?.data)
          ? resData.data
          : [];

        setProperties(propertyList);
      } catch (err) {
        if (!isMounted) return;
        console.error("Fetch Properties Error:", err);

        if (err.response) {
          setError(
            err.response.data?.message ||
              `Server error (${err.response.status}). Could not load listings.`
          );
        } else if (err.request) {
          setError(
            "Unable to connect to HouseHunt backend. If the backend was asleep (Render free tier), it may take 30-50 seconds to spin up. Please try again."
          );
        } else {
          setError("An unexpected error occurred while loading properties.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProperties();

    return () => {
      isMounted = false;
    };
  }, [city, type]);

  return (
    <div className="container py-5" style={{ minHeight: "80vh" }}>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold">Available Properties</h2>
          {(city || type) && (
            <p className="text-muted mb-0">
              Filtered by:{" "}
              {city && <span className="badge bg-secondary me-2">City: {city}</span>}
              {type && <span className="badge bg-info text-dark">Type: {type}</span>}
            </p>
          )}
        </div>
        <Link to="/" className="btn btn-outline-primary">
          ← Back to Search
        </Link>
      </div>

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading properties from HouseHunt...</p>
        </div>
      )}

      {error && !loading && (
        <div className="alert alert-warning text-center" role="alert">
          <p className="mb-2">{error}</p>
          <button
            className="btn btn-sm btn-outline-dark"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      )}

      {!loading && properties.length === 0 && !error && (
        <div className="text-center py-5">
          <h4>No properties found matching your search.</h4>
          <p className="text-muted">Try adjusting your filters or browse all listings.</p>
          <Link to="/properties" className="btn btn-primary mt-2">
            Clear Filters
          </Link>
        </div>
      )}

      {!loading && properties.length > 0 && (
        <div className="row g-4">
          {properties.map((item) => {
            const propertyId = item._id || item.id;
            const price = item.price || item.rent;
            const displayImage =
              (Array.isArray(item.images) && item.images[0]) ||
              item.image ||
              FALLBACK_IMAGE;

            return (
              <div key={propertyId} className="col-12 col-md-6 col-lg-4">
                <div className="card h-100 shadow-sm border-0 rounded-3 overflow-hidden">
                  <img
                    src={displayImage}
                    className="card-img-top"
                    alt={item.title || "Property"}
                    style={{ height: "200px", objectFit: "cover" }}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = FALLBACK_IMAGE;
                    }}
                  />
                  <div className="card-body d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span className="badge bg-primary text-uppercase">
                        {item.type || "Rental"}
                      </span>
                      <h5 className="text-success mb-0 fw-bold">
                        ₹{price ? Number(price).toLocaleString("en-IN") : "N/A"}/mo
                      </h5>
                    </div>
                    <h5 className="card-title fw-semibold">{item.title}</h5>
                    <p className="card-text text-muted small flex-grow-1">
                      📍 {item.location || item.address || item.city || "Hyderabad"}
                    </p>
                    <Link
                      to={`/property/${propertyId}`}
                      className="btn btn-dark w-100 mt-3 text-center text-decoration-none"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Properties;
