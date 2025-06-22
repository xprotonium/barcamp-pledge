import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/admin");
    } catch (err: any) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vh-100 d-flex justify-content-center align-items-center">
      <div className="card shadow p-5">
        <h2>Admin Login</h2>
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-floating mb-3">
            <input
              className="form-control"
              type="email"
              value={email}
              id="emailInput"
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              placeholder=" "
            />
            <label htmlFor="emailInput">Email address</label>
          </div>
          <div className="form-floating mb-3">
            <input
              className="form-control"
              type="password"
              value={password}
              id="passwordInput"
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              placeholder=" "
            />
            <label htmlFor="passwordInput">Password</label>
          </div>
          <button
            type="submit"
            className="btn btn-dark w-100"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-3 text-center">
          <a href="/" className="text-decoration-none">
            ← Back to Pledge Form
          </a>
        </div>
      </div>
    </div>
  );
}

export default Login;
