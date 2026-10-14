import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Home() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get("/customers/me");

        setUser(response.data);
      } catch (error) {
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  if (loading) {
    return (
      <div className="home-container">
        <div className="home-card">
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="home-container">
      <div className="home-card">
        <h1>Welcome to ShopKart!</h1>

        <p className="home-subtitle">
          You are successfully logged in.
        </p>

        <div className="profile-box">
          <h2>My Profile</h2>

          <p>
            <strong>Name:</strong> {user.fullName}
          </p>

          <p>
            <strong>Email:</strong> {user.email}
          </p>

          <p>
            <strong>Phone:</strong> {user.phone}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Home;