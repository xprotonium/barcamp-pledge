import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Pledge from "./Pledge";
import AdminDashboard from "./AdminDashboard";
import Login from "./Login";
import PrivateRoute from "./PrivateRoute";
import Navbar from "./Navbar";

function App() {
  const adminEmails = [import.meta.env.VITE_ADMIN_EMAIL];

  return (
    <Router>
      <div>
        <Navbar />
        <Routes>
          <Route path="/" element={<Pledge />} />
          <Route
            path="/admin"
            element={
              <PrivateRoute allowedEmails={adminEmails}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
