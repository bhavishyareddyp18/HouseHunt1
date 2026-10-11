import "./FeaturedProperties.css";

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaBed, FaBath, FaMapMarkerAlt } from "react-icons/fa";

function FeaturedProperties() {

  const featuredProperties = [

    {
      id: 1,
      title: "Luxury Villa",
      city: "Hyderabad",
      price: "₹45,000 / month",
      beds: 4,
      baths: 3,
      image:
        "https://images.unsplash.com/photo-1613977257363-707ba9348227"
    },

    {
      id: 2,
      title: "Modern Apartment",
      city: "Bangalore",
      price: "₹28,000 / month",
      beds: 2,
      baths: 2,
      image:
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85"
    },

    {
      id: 3,
      title: "Family House",
      city: "Vijayawada",
      price: "₹22,000 / month",
      beds: 3,
      baths: 2,
      image:
        "https://images.unsplash.com/photo-1570129477492-45c003edd2be"
    }

  ];

  return (

    <section className="featured-section">

      <div className="container">

        <div className="section-heading">

          <h2>Featured Properties</h2>

          <p>
            Explore some of our most
            popular rental properties.
          </p>

        </div>

        <div className="row">

          {
            featuredProperties.map(
              (property) => (

                <div
                  key={property.id}
                  className="col-lg-4 col-md-6 mb-4"
                >

                  <motion.div

                    whileHover={{
                      y: -10
                    }}

                    className="property-card"
                  >

                    <img
                      src={property.image}
                      alt={property.title}
                    />

                    <div className="property-content">

                      <h4>
                        {property.title}
                      </h4>

                      <p className="location">

                        <FaMapMarkerAlt />

                        {" "}
                        {property.city}

                      </p>

                      <h5>
                        {property.price}
                      </h5>

                      <div className="property-info">

                        <span>

                          <FaBed />

                          {" "}
                          {property.beds}

                        </span>

                        <span>

                          <FaBath />

                          {" "}
                          {property.baths}

                        </span>

                      </div>

                      <Link
                        to={`/property/${property.id}`}
                        className="btn view-btn text-center text-decoration-none"
                      >
                        View Details
                      </Link>

                    </div>

                  </motion.div>

                </div>
              )
            )
          }

        </div>

      </div>

    </section>

  );
}

export default FeaturedProperties;