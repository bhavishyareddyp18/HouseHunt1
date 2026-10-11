import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import useAuth from "../../hooks/useAuth";

function Login() {

  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [rememberMe, setRememberMe] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");
    setLoading(true);

    try {

      const response = await api.post(
        "/auth/login",
        formData
      );

      const data = response.data;

      // Store in auth context and storage
      login(data.user, data.token, rememberMe);

      // Redirect based on role

      if (data.user.role === "admin") {

        navigate("/admin-dashboard");

      } else if (
        data.user.role === "owner"
      ) {

        navigate("/owner-dashboard");

      } else if (
        data.user.role === "agent"
      ) {

        navigate("/agent-dashboard");

      } else {

        navigate("/user-dashboard");

      }

    } catch (err) {

      setError(

        err.response?.data?.message ||

        "Login failed. Please try again."

      );

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="container py-5">

      <div className="row justify-content-center">

        <div className="col-md-6 col-lg-5">

          <div className="card shadow p-4">

            <h2 className="text-center mb-4">

              Login

            </h2>

            {error && (

              <div className="alert alert-danger">

                {error}

              </div>

            )}

            <form onSubmit={handleSubmit}>

              {/* Email */}

              <div className="mb-3">

                <label className="form-label">

                  Email

                </label>

                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />

              </div>

              {/* Password */}

              <div className="mb-3">

                <label className="form-label">

                  Password

                </label>

                <input
                  type="password"
                  name="password"
                  className="form-control"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />

              </div>

              {/* Remember Me */}

              <div className="form-check mb-3">

                <input
                  type="checkbox"
                  className="form-check-input"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={() =>
                    setRememberMe(
                      !rememberMe
                    )
                  }
                />

                <label
                  htmlFor="rememberMe"
                  className="form-check-label"
                >

                  Remember Me

                </label>

              </div>

              {/* Forgot Password */}

              <div className="text-end mb-3">

                <Link
                  to="/forgot-password"
                  className="text-decoration-none"
                >

                  Forgot Password?

                </Link>

              </div>

              {/* Login Button */}

              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={loading}
              >

                {loading
                  ? "Logging in..."
                  : "Login"}

              </button>

            </form>

            <hr />

            <p className="text-center">

              Don't have an account?

              {" "}

              <Link to="/register">

                Register

              </Link>

            </p>

          </div>

        </div>

      </div>

    </div>

  );

}

export default Login;