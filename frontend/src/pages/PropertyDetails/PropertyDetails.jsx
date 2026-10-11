// src/pages/Properties/PropertyDetails.jsx

import "./PropertyDetails.css";

import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";

import {
  FaBed,
  FaBath,
  FaMapMarkerAlt,
  FaHeart,
  FaShareAlt,
  FaEye,
  FaCar,
  FaWifi,
  FaPaw,
  FaVideo,
  FaCalendarAlt,
  FaComments,
  FaStar,
  FaMapMarkedAlt,
  FaBalanceScale,
  FaPhone,
  FaEnvelope
} from "react-icons/fa";

import PropertyMap from "../../components/maps/PropertyMap";
import NearbyPlaces from "../../components/maps/NearbyPlaces";
import PropertyRating from "../../components/property/PropertyRating";
import PropertyReviewForm from "../../components/property/PropertyReviewForm";
import ViewCounter from "../../components/property/ViewCounter";
import ShareProperty from "../../components/property/ShareProperty";

import api from "../../services/api";
import BookingForm
from "../../components/booking/BookingForm";

import SimilarProperties from "../../components/property/SimilarProperties";
import RecommendedProperties from "../../components/property/RecommendedProperties";

function PropertyDetails() {

  const { id } = useParams();

  const [activeImage, setActiveImage] =
    useState(0);

  const [isFavourite, setIsFavourite] =
    useState(false);

  const [compare, setCompare] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const defaultProperty = {
    _id: id,
    title: "Luxury Villa",
    rent: 45000,
    price: 45000,
    city: "Hyderabad",
    state: "Telangana",
    address: "Banjara Hills Road No 12",
    bedrooms: 4,
    bathrooms: 3,
    views: 2350,
    rating: 4.8,
    status: "Available",
    lat: 17.3850,
    lng: 78.4867,
    virtualTour: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    description: "Beautiful luxury villa with modern amenities and premium interiors. Perfect for families looking for comfort and convenience.",
    images: [
      "https://images.unsplash.com/photo-1613977257363-707ba9348227",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c",
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994",
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be"
    ],
    amenities: ["Parking", "WiFi", "Pet Friendly", "Power Backup", "Security", "Gym"],
    owner: {
      name: "Rahul Sharma",
      email: "rahul@gmail.com",
      phone: "+91 9876543210",
      image: "https://randomuser.me/api/portraits/men/32.jpg"
    }
  };

  const [property, setProperty] = useState(defaultProperty);
  const [propertyLoading, setPropertyLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchProperty = async () => {
      try {
        const res = await api.get(`/properties/${id}`);
        const data = res.data?.data || res.data;
        if (isMounted && data) {
          setProperty({
            ...defaultProperty,
            ...data,
            _id: String(data._id || id),
            rent: data.rent || data.price || defaultProperty.rent,
            price: data.price || data.rent || defaultProperty.price,
            images: Array.isArray(data.images) && data.images.length > 0 ? data.images : defaultProperty.images,
            amenities: Array.isArray(data.amenities) && data.amenities.length > 0 ? data.amenities : defaultProperty.amenities,
            owner: data.owner || defaultProperty.owner
          });
        }
      } catch (err) {
        console.warn("Using default property view:", err.message);
      } finally {
        if (isMounted) setPropertyLoading(false);
      }
    };
    fetchProperty();
    return () => { isMounted = false; };
  }, [id]);

  useEffect(() => {

    const viewed = JSON.parse(

      localStorage.getItem(
        "recentProperties"
      )

    ) || [];

    const alreadyViewed =

      viewed.some(

        item =>

          item._id ===
          property._id

      );

    if (!alreadyViewed) {

      viewed.push(property);

      localStorage.setItem(

        "recentProperties",

        JSON.stringify(viewed)

      );

    }

  }, [property._id]);

  const toggleWishlist = () => {

    setIsFavourite(
      !isFavourite
    );

    alert(

      isFavourite

        ? "Removed from Wishlist"

        : "Added to Wishlist"

    );

  };

  const toggleCompare = () => {

    setCompare(
      !compare
    );

    alert(

      compare

        ? "Removed from Compare"

        : "Added to Compare"

    );

  };

  const shareProperty = async () => {

    if (
      navigator.share
    ) {

      await navigator.share({

        title:
          property.title,

        text:
          "Check out this property on HouseHunt!",

        url:
          window.location.href

      });

    }

    else {

      navigator.clipboard.writeText(

        window.location.href

      );

      alert(
        "Link copied to clipboard!"
      );

    }

  };

  const requestVisit = async () => {

    try {

      setLoading(true);

      alert(
        "Visit request sent successfully."
      );

    }

    catch (error) {

      alert(
        "Failed to send request."
      );

    }

    finally {

      setLoading(false);

    }

  };

  const requestRental = async () => {

    try {

      setLoading(true);

      alert(
        "Rental request sent."
      );

    }

    catch (error) {

      alert(
        "Request failed."
      );

    }

    finally {

      setLoading(false);

    }

  };

  return (

    <div className="property-details-page">

      <div className="container py-4">

        {/* HEADER */}

        <div
          className="
          property-header
          mb-4
          "
        >

          <div>

            <h1>

              {
                property.title
              }

            </h1>

            <PropertyRating
              rating={
                property.rating
               }
            />

            <p>

              <FaMapMarkerAlt />

              {" "}

              {
                property.address
              },

              {" "}

              {
                property.city
              },

              {" "}

              {
                property.state
              }

            </p>

          </div>

          <div
            className="
            action-buttons
            "
          >

            <button

              className="
              btn btn-light me-2
              "

              onClick={
                toggleWishlist
              }

            >

              <FaHeart />

              {" "}

              {

                isFavourite

                  ? "Saved"

                  : "Save"

              }

            </button>

            <button

              className="
              btn btn-light me-2
              "

              onClick={
                toggleCompare
              }

            >

              <FaBalanceScale />

              {" "}

              Compare

            </button>

            <ShareProperty
              title={
                property.title
              }
            />

          </div>

        </div>

        {/* GALLERY */}

        <div className="row">

          <div className="col-lg-8">

            <img

              src={
                property.images[
                  activeImage
                ]
              }

              alt="property"

              className="
              main-property-image
              "

            />

            <div
              className="
              thumbnail-wrapper
              "
            >

              {

                property.images.map(

                  (
                    image,
                    index
                  ) => (

                    <img

                      key={index}

                      src={image}

                      alt="thumb"

                      className={

                        activeImage ===
                        index

                          ? "thumbnail active"

                          : "thumbnail"

                      }

                      onClick={() =>

                        setActiveImage(
                          index
                        )

                      }

                    />

                  )

                )

              }

            </div>

          </div>

          {/* PRICE CARD */}

          <div className="col-lg-4">

            <div
              className="
              price-card
              "
            >

              <h2>

                ₹

                {
                  property.rent
                }

                /month

              </h2>

              <div
                className="
                quick-info
                "
              >

                <span>

                  <FaBed />

                  {" "}

                  {
                    property.bedrooms
                  }

                </span>

                <span>

                  <FaBath />

                  {" "}

                  {
                    property.bathrooms
                  }

                </span>

                <ViewCounter
                  views={
                   property.views
                  }
                />

              </div>

              <button

                className="
                btn btn-primary
                w-100 mt-3
                "

                onClick={
                  requestVisit
                }

                disabled={
                  loading
                }

              >

                Request Visit

              </button>

              <button

                className="
                btn btn-success
                w-100 mt-3
                "

                onClick={
                  requestRental
                }

                disabled={
                  loading
                }

              >

                Request Rental

              </button>

              <div
                className="
                mt-3 text-center
                "
              >

                <span
                  className="
                  badge bg-success
                  "
                >

                  {
                    property.status
                  }

                </span>

              </div>

            </div>

          </div>

        </div>
                {/* DESCRIPTION */}

        <section
          className="
          details-section
          "
        >

          <h3>

            Description

          </h3>

          <p>

            {
              property.description
            }

          </p>

        </section>

        {/* AMENITIES */}

        <section
          className="
          details-section
          "
        >

          <h3>

            Amenities

          </h3>

          <div
            className="
            amenities-grid
            "
          >

            <div>

              <FaCar />

              {" "}

              Parking

            </div>

            <div>

              <FaWifi />

              {" "}

              WiFi

            </div>

            <div>

              <FaPaw />

              {" "}

              Pets Allowed

            </div>

            {

              property.amenities.map(

                (
                  amenity,
                  index
                ) => (

                  <div
                    key={index}
                  >

                    {
                      amenity
                    }

                  </div>

                )

              )

            }

          </div>

        </section>

        {/* OWNER DETAILS */}

        <section
          className="
          details-section
          "
        >

          <h3>

            Property Owner

          </h3>

          <div
            className="
            owner-card
            "
          >

            <img

              src={
                property.owner.image
              }

              alt="owner"

            />

            <div>

              <h5>

                {
                  property.owner
                    .name
                }

              </h5>

              <p>

                {
                  property.owner
                    .email
                }

              </p>

              <p>

                {
                  property.owner
                    .phone
                }

              </p>

              <div
                className="
                mt-3
                "
              >

                <button

                  className="
                  btn btn-primary
                  me-2
                  "

                >

                  <FaComments />

                  {" "}

                  Chat Owner

                </button>

                <button

                  className="
                  btn btn-success
                  me-2
                  "

                >

                  <FaPhone />

                  {" "}

                  Call

                </button>

                <button

                  className="
                  btn btn-warning
                  "

                >

                  <FaEnvelope />

                  {" "}

                  Email

                </button>

              </div>

            </div>

          </div>

        </section>

        {/* PROPERTY LOCATION */}

        <section
          className="
          details-section
          "
        >

          <h3>

            <FaMapMarkedAlt />

            {" "}

            Property Location

          </h3>

          <PropertyMap

            properties={[
              property
            ]}

          />

        </section>

        {/* NEARBY PLACES */}

        <section
          className="
          details-section
          "
        >

          <h3>

            Nearby Facilities

          </h3>

          <NearbyPlaces

            lat={
              property.lat
            }

            lng={
              property.lng
            }

          />

        </section>
                {/* VIRTUAL TOUR */}

        <section
          className="
          details-section
          "
        >

          <h3>

            <FaVideo />

            {" "}

            Virtual Property Tour

          </h3>

          <div
            className="
            virtual-tour-box
            "
          >

            <iframe

              width="100%"

              height="450"

              src={
                property.virtualTour
              }

              title="
              Virtual Tour
              "

              allowFullScreen

              style={{
                border: 0,
                borderRadius: "12px"
              }}

            />

          </div>

        </section>

        {/* AVAILABILITY */}

<section
  className="
  details-section
  "
>
     <Link to="/map">View Nearby Map</Link>
  <h3>

    <FaCalendarAlt />

    {" "}

    Availability

  </h3>

  <div
    className="
    card p-3
    "
  >

    <h5>

      Current Status

    </h5>

    <span
      className="
      badge bg-success
      fs-6
      "
    >

      Available Immediately

    </span>

    <p className="mt-3">

      Property is ready
      for immediate move-in.

    </p>

  </div>

  <BookingForm
    propertyId={
      property._id
    }
  />

</section>

        {/* REVIEWS */}

        <section
  className="
  details-section
  text-center
  "
>

  <h4>

    Love this property?

  </h4>

  <ShareProperty
    title={
      property.title
    }
  />

</section>
        {/* PROPERTY INSIGHTS */}

        <section
          className="
          details-section
          "
        >

          <h3>

            Property Insights

          </h3>

          <div className="row">

            <div className="col-md-4">

              <div
                className="
                card p-3
                text-center
                "
              >

                <FaEye
                  size={28}
                />

                <h4 className="mt-2">

                  {
                    property.views
                  }

                </h4>

                <p>

                  Total Views

                </p>

              </div>

            </div>

            <div className="col-md-4">

              <div
                className="
                card p-3
                text-center
                "
              >

                <FaHeart
                  size={28}
                />

                <h4 className="mt-2">

                  156

                </h4>

                <p>

                  Saved by Users

                </p>

              </div>

            </div>

            <div className="col-md-4">

              <div
                className="
                card p-3
                text-center
                "
              >

                <FaStar
                  size={28}
                />

                <h4 className="mt-2">

                  {
                    property.rating
                  }

                </h4>

                <p>

                  Average Rating

                </p>

              </div>

            </div>

          </div>

        </section>

        {/* SIMILAR PROPERTIES */}

        <section
          className="
          details-section
          "
        >

          <h3>

            Similar Properties

          </h3>

          <SimilarProperties

            propertyId={
              property._id
            }

          />

        </section>

        {/* AI RECOMMENDATIONS */}

        <section
          className="
          details-section
          "
        >

          <h3>

            Recommended For You

          </h3>

          <RecommendedProperties

  properties={[

    {

      _id: "11",

      title: "Villa One",

      rent: 30000,

      city: "Hyderabad",

      bedrooms: 3,

      bathrooms: 2,

      image:
        "https://images.unsplash.com/photo-1568605114967-8130f3a36994"

    },

    {

      _id: "12",

      title: "Luxury Apartment",

      rent: 25000,

      city: "Hyderabad",

      bedrooms: 2,

      bathrooms: 2,

      image:
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c"

    }

  ]}

/>

        </section>

        {/* SHARE PROPERTY */}

        <section
          className="
          details-section
          text-center
          "
        >

          <h4>

            Love this property?

          </h4>

          <button

            className="
            btn btn-primary
            me-3
            "

            onClick={
              shareProperty
            }

          >

            <FaShareAlt />

            {" "}

            Share Listing

          </button>

          <button

            className={`
              btn
              ${
                isFavourite
                  ? "btn-danger"
                  : "btn-outline-danger"
              }
            `}

            onClick={
              toggleWishlist
            }

          >

            <FaHeart />

            {" "}

            {

              isFavourite

                ? "Saved"

                : "Add to Wishlist"

            }

          </button>

        </section>

      </div>

    </div>

  );

}

export default PropertyDetails;