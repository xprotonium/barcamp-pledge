import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import Navbar from "./Navbar";
import LoadingSpinner from "./LoadingSpinner";

// Lazy load all components for better performance
const Pledge = lazy(() => import("./Pledge"));
const Login = lazy(() => import("./Login"));
const PrivateRoute = lazy(() => import("./PrivateRoute"));
const AdminDashboard = lazy(() => import("./AdminDashboard"));
const ApprovedTopics = lazy(() => import("./ApprovedTopics"));

function App() {
  const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || "")
    .split(",")
    .map((email: string) => email.trim())
    .filter(Boolean);

  return (
    <Router>
      <div>
        <Navbar />
        <Routes>
          <Route 
            path="/" 
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <Pledge />
              </Suspense>
            } 
          />
          <Route 
            path="/approved" 
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <ApprovedTopics />
              </Suspense>
            } 
          />
          <Route
            path="/admin"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <PrivateRoute allowedEmails={adminEmails}>
                  <AdminDashboard />
                </PrivateRoute>
              </Suspense>
            }
          />
          <Route 
            path="/login" 
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <Login />
              </Suspense>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
