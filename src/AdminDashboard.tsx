import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import {
  signOut,
  onAuthStateChanged,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { db, auth } from "./firebase";
import { useNavigate } from "react-router-dom";

interface ResponseEntry {
  id: string;
  registered?: string;
  fullName?: string;
  phoneNumber?: string;
  topic?: string;
  track?: string;
  description?: string;
  sessionFormat?: string;
  otherFormat?: string;
  equipment?: string[];
  otherEquipment?: string;
  timestamp?: any;
}

function AdminDashboard() {
  const [responses, setResponses] = useState<ResponseEntry[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
        console.log("Admin dashboard - User authenticated:", user.email);
      } else {
        console.log("Admin dashboard - No user, redirecting to login");
        navigate("/login");
      }
    });

    // Fetch pledge responses
    const fetchData = async () => {
      try {
        const snapshot = await getDocs(collection(db, "pledgeResponses"));
        const data: ResponseEntry[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ResponseEntry[];
        setResponses(data);
        console.log("Fetched", data.length, "responses");
      } catch (error) {
        console.error("Error fetching responses:", error);
      }
    };
    fetchData();

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPasswordError("");
    setPasswordSuccess("");

    // Validation
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user || !userEmail) {
        setPasswordError("User not found");
        setLoading(false);
        return;
      }

      // Re-authenticate user before password change
      const credential = EmailAuthProvider.credential(
        userEmail,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);

      setPasswordSuccess("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);
    } catch (error: any) {
      console.error("Error updating password:", error);
      if (error.code === "auth/wrong-password") {
        setPasswordError("Current password is incorrect");
      } else if (error.code === "auth/weak-password") {
        setPasswordError("New password is too weak");
      } else {
        setPasswordError("Failed to update password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {

    if (responses.length === 0) return;

    const header = [
      "#",
      "Registered",
      "Full Name",
      "Phone Number",
      "Topic",
      "Track",
      "Description",
      "Session Format",
      "Equipment",
      "Timestamp",
    ];
    const rows = responses.map((entry, index) => [
      index + 1,
      (entry.registered || "").replace(/,/g, ""),
      (entry.fullName || "").replace(/,/g, ""),
      (entry.phoneNumber || "").replace(/,/g, ""),
      (entry.topic || "").replace(/,/g, ""),
      (entry.track || "").replace(/,/g, ""),
      (entry.description || "").replace(/,/g, ""),
      (entry.sessionFormat || "").replace(/,/g, ""),
      (entry.equipment?.join("; ") || "").replace(/,/g, ""),
      entry.timestamp?.seconds
        ? new Date(entry.timestamp.seconds * 1000).toLocaleString()
        : "",
    ]);

    const csvContent =
      [header, ...rows].map((row) => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "pledge_submissions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Pledge Submissions</h2>
        <div>
          <span className="me-3">Logged in as: {userEmail}</span>
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="btn btn-outline-primary me-2"
          >
            Change Password
          </button>
          <button onClick={handleLogout} className="btn btn-outline-danger">
            Logout
          </button>
        </div>
      </div>

      {/* Password Change Form */}
      {showPasswordForm && (
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title">Change Password</h5>
            {passwordError && (
              <div className="alert alert-danger">{passwordError}</div>
            )}
            {passwordSuccess && (
              <div className="alert alert-success">{passwordSuccess}</div>
            )}
            <form onSubmit={handlePasswordChange}>
              <div className="mb-3">
                <label htmlFor="currentPassword" className="form-label">
                  Current Password
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="newPassword" className="form-label">
                  New Password
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="d-flex gap-2">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update Password"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordError("");
                    setPasswordSuccess("");
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {responses.length === 0 ? (
        <div className="alert alert-info">No pledge responses yet.</div>
      ) : (
        <>
        
        
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>#</th>
              <th>Registered</th>
              <th>Full Name</th>
              <th>Phone Number</th>
              <th>Topic</th>
              <th>Track</th>
              <th>Description</th>
              <th>Session Format</th>
              <th>Equipment</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {responses.map((entry, index) => (
              <tr key={entry.id}>
                <td>{index + 1}</td>
                <td>{entry.registered || ""}</td>
                <td>{entry.fullName || ""}</td>
                <td>{entry.phoneNumber || ""}</td>
                <td>{entry.topic || ""}</td>
                <td>{entry.track || ""}</td>
                <td style={{whiteSpace: "pre-wrap"}}>{entry.description || ""}</td>
                <td>{entry.sessionFormat || ""}</td>
                <td>{entry.equipment?.join(", ") || ""}</td>
                <td>
                  {entry.timestamp?.seconds
                    ? new Date(entry.timestamp.seconds * 1000).toLocaleString()
                    : ""}
                </td>
              </tr>
            ))}
          </tbody>
          
        </table>
        <div className="mb-3">
          <button className="btn btn-success" onClick={handleExportCSV}>
              Export to CSV
          </button>
        </div>
        </>
      )}
    </div>
  );
}

export default AdminDashboard;
