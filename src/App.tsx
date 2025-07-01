import React, { useState } from "react";
import "./App.css";
import axios from "axios";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

interface GoogleProfile {
  name: string;
  email: string;
  picture?: string;
  full_name?: string;
}

const API_URL = "https://fastapi-oauth-83ss.onrender.com/api/v1/auth";

const LoginForm: React.FC<{
  onLogin: (email: string) => void;
  setUser: React.Dispatch<React.SetStateAction<GoogleProfile | null>>;
}> = ({ onLogin, setUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleNormalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await axios.post(
        `${API_URL}/login`,
        { email, password },
        { withCredentials: true }
      );
      console.log(res.data);
      if (res.data.access_token) {
        onLogin(email);
        // localStorage.setItem("access_token", res.data.access_token);
        // localStorage.setItem("user_email", email);
        setUser(null);
        navigate("/");
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "Login failed");
    }
  };

  const handleGoogleRedirect = () => {
    window.location.href = `${API_URL}/google/login`;
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: 32 }}>
      <h2>Login</h2>
      <button onClick={handleGoogleRedirect} style={{ marginBottom: 16 }}>
        Login with Google
      </button>
      <div style={{ margin: "24px 0", textAlign: "center" }}>or</div>
      <form
        onSubmit={handleNormalLogin}
        style={{ display: "flex", flexDirection: "column", gap: 12 }}
      >
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login with Email</button>
      </form>
      <div style={{ marginTop: 12 }}>
        Don't have an account? <a href="/register">Register</a>
      </div>
      {error && <div style={{ color: "red", marginTop: 12 }}>{error}</div>}
    </div>
  );
};

const RegisterForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const res = await axios.post(
        `${API_URL}/register`,
        { email, password, full_name: fullName },
        { withCredentials: true }
      );
      if (res.data.email) {
        setSuccess("Registration successful! Please log in.");
        setTimeout(() => navigate("/login"), 1000);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registration failed");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: 32 }}>
      <h2>Register</h2>
      <form
        onSubmit={handleRegister}
        style={{ display: "flex", flexDirection: "column", gap: 12 }}
      >
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Register</button>
      </form>
      <div style={{ marginTop: 12 }}>
        Already have an account? <a href="/login">Login</a>
      </div>
      {error && <div style={{ color: "red", marginTop: 12 }}>{error}</div>}
      {success && (
        <div style={{ color: "green", marginTop: 12 }}>{success}</div>
      )}
    </div>
  );
};

const Home: React.FC<{
  user: GoogleProfile | null;
  normalUser: { email: string } | null;
  onLogout: () => void;
}> = ({ user, normalUser, onLogout }) => {
  if (!user && !normalUser) {
    return <Navigate to="/login" replace />;
  }
  return (
    <div className="App" style={{ maxWidth: 400, margin: "auto", padding: 32 }}>
      <h2>Welcome to Gref</h2>
      {user ? (
        <div>
          <h3>{user.name}</h3>
          <p>{user.email}</p>
          <button onClick={onLogout}>Logout</button>
        </div>
      ) : normalUser ? (
        <div>
          <h3>Logged in as {normalUser.email}</h3>
          <button onClick={onLogout}>Logout</button>
        </div>
      ) : null}
    </div>
  );
};

const Profile: React.FC = () => {
  const [user, setUser] = useState<GoogleProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    axios
      .get(`${API_URL}/me`, { withCredentials: true })
      .then((res) => {
        setUser(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Not authenticated");
        setLoading(false);
        navigate("/login");
      });
  }, [navigate]);

  if (loading) return <div style={{ padding: 32 }}>Loading...</div>;
  if (error) return <div style={{ padding: 32, color: "red" }}>{error}</div>;
  if (!user) return null;
  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: 32 }}>
      <h2>Profile</h2>
      <p>
        <b>Name:</b> {user.full_name || user.name}
      </p>
      <p>
        <b>Email:</b> {user.email}
      </p>
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<GoogleProfile | null>(null);

  const handleLogout = () => {
    setUser(null);
    // Clear any localStorage if needed
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_email");
  };

  const handleLogin = (email: string) => {
    // After successful login, the cookie is set by the backend
    // No need to store in localStorage
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Home user={user} normalUser={null} onLogout={handleLogout} />
          }
        />
        <Route
          path="/login"
          element={<LoginForm onLogin={handleLogin} setUser={setUser} />}
        />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
