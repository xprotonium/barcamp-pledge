import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
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
  approved?: boolean;
}

function AdminDashboard() {
  const [responses, setResponses] = useState<ResponseEntry[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
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

  const handleApprove = async (entryId: string) => {
    try {
      const ref = doc(db, "pledgeResponses", entryId);
      await updateDoc(ref, { approved: true });
      setResponses((prev) => prev.map((r) => (r.id === entryId ? { ...r, approved: true } : r)));
    } catch (error) {
      console.error("Error approving topic:", error);
    }
  };

  const handleUnapprove = async (entryId: string) => {
    try {
      const ref = doc(db, "pledgeResponses", entryId);
      await updateDoc(ref, { approved: false });
      setResponses((prev) => prev.map((r) => (r.id === entryId ? { ...r, approved: false } : r)));
    } catch (error) {
      console.error("Error unapproving topic:", error);
    }
  };

  const handleDelete = async (entryId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this submission? This cannot be undone.");
    if (!confirmed) return;
    try {
      const ref = doc(db, "pledgeResponses", entryId);
      await deleteDoc(ref);
      setResponses((prev) => prev.filter((r) => r.id !== entryId));
    } catch (error) {
      console.error("Error deleting submission:", error);
    }
  };


  return (
    <div className="container mt-4">
      <div className="admin-header anim-fade-in-up">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
          <h2 className="mb-2 mb-md-0">Pledge Submissions</h2>
        </div>
      </div>

      {responses.length === 0 ? (
        <div className="alert alert-info anim-fade-in">No pledge responses yet.</div>
      ) : (
        <>
        
        
        {/* Desktop Table */}
        <div className="table-responsive anim-fade-in-up">
        <table className="table table-striped table-hover align-middle table-mobile-optimized">
          <thead>
            <tr>
              <th>#</th>
              <th>Registered</th>
              <th>Full Name</th>
              <th>Phone</th>
              <th>Topic</th>
              <th>Track</th>
              <th>Description</th>
              <th>Format</th>
              <th>Equipment</th>
              <th>Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {responses.map((entry, index) => (
              <tr key={entry.id} className="anim-fade-in">
                <td>{index + 1}</td>
                <td title={entry.registered || ""}>{entry.registered || ""}</td>
                <td title={entry.fullName || ""}>{entry.fullName || ""}</td>
                <td title={entry.phoneNumber || ""}>{entry.phoneNumber || ""}</td>
                <td title={entry.topic || ""}>{entry.topic || ""}</td>
                <td title={entry.track || ""}>{entry.track || ""}</td>
                <td className="description-cell" title={entry.description || ""}>{entry.description || ""}</td>
                <td title={entry.sessionFormat || ""}>{entry.sessionFormat || ""}</td>
                <td title={entry.equipment?.join(", ") || ""}>{entry.equipment?.join(", ") || ""}</td>
                <td title={entry.timestamp?.seconds ? new Date(entry.timestamp.seconds * 1000).toLocaleString() : ""}>
                  {entry.timestamp?.seconds
                    ? new Date(entry.timestamp.seconds * 1000).toLocaleDateString()
                    : ""}
                </td>
                <td className="actions-cell">
                  {entry.approved ? (
                    <div className="d-flex align-items-center gap-2">
                      <span className="badge bg-success">Approved</span>
                      <button
                        className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center justify-content-center"
                        title="Unapprove"
                        onClick={() => handleUnapprove(entry.id)}
                        style={{ width: 28, height: 28 }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                        </svg>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger d-inline-flex align-items-center justify-content-center"
                        title="Delete"
                        onClick={() => handleDelete(entry.id)}
                        style={{ width: 28, height: 28 }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M5.5 5.5a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0v-6a.5.5 0 0 1 .5-.5zm2.5.5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0v-6zm2-.5a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0v-6a.5.5 0 0 1 .5-.5z"/>
                          <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1 0-2H5h6h2.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3a.5.5 0 0 0 0 1H5h6h2.5a.5.5 0 0 0 0-1H11 5 2.5z"/>
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="d-flex align-items-center gap-2">
                      <button
                        className="btn btn-sm btn-outline-success d-inline-flex align-items-center justify-content-center"
                        title="Approve"
                        onClick={() => handleApprove(entry.id)}
                        style={{ width: 28, height: 28 }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M13.485 1.929a1.5 1.5 0 0 1 0 2.121l-6.364 6.364a1.5 1.5 0 0 1-2.121 0L.793 6.227a1 1 0 1 1 1.414-1.414l2.536 2.536a.5.5 0 0 0 .707 0l5.657-5.657a1.5 1.5 0 0 1 2.121 0z"/>
                        </svg>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger d-inline-flex align-items-center justify-content-center"
                        title="Delete"
                        onClick={() => handleDelete(entry.id)}
                        style={{ width: 28, height: 28 }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M5.5 5.5a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0v-6a.5.5 0 0 1 .5-.5zm2.5.5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0v-6zm2-.5a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0v-6a.5.5 0 0 1 .5-.5z"/>
                          <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1 0-2H5h6h2.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3a.5.5 0 0 0 0 1H5h6h2.5a.5.5 0 0 0 0-1H11 5 2.5z"/>
                        </svg>
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        {/* Mobile Cards */}
        <div className="mobile-cards anim-fade-in-up">
          {responses.map((entry, index) => (
            <div key={entry.id} className="mobile-card anim-fade-in">
              <div className="mobile-card-header">
                <h6 className="mobile-card-title">#{index + 1} - {entry.fullName || "Unknown"}</h6>
                {entry.approved ? (
                  <span className="badge bg-success mobile-card-badge">Approved</span>
                ) : (
                  <span className="badge bg-secondary mobile-card-badge">Pending</span>
                )}
              </div>
              <div className="mobile-card-body">
                <div className="mobile-card-row">
                  <div className="mobile-card-label">Registered</div>
                  <div className="mobile-card-value">{entry.registered || "N/A"}</div>
                </div>
                <div className="mobile-card-row">
                  <div className="mobile-card-label">Phone</div>
                  <div className="mobile-card-value">{entry.phoneNumber || "N/A"}</div>
                </div>
                <div className="mobile-card-row">
                  <div className="mobile-card-label">Topic</div>
                  <div className="mobile-card-value">{entry.topic || "N/A"}</div>
                </div>
                <div className="mobile-card-row">
                  <div className="mobile-card-label">Track</div>
                  <div className="mobile-card-value">{entry.track || "N/A"}</div>
                </div>
                <div className="mobile-card-row">
                  <div className="mobile-card-label">Session Format</div>
                  <div className="mobile-card-value">{entry.sessionFormat || "N/A"}</div>
                </div>
                <div className="mobile-card-row">
                  <div className="mobile-card-label">Equipment</div>
                  <div className="mobile-card-value">{entry.equipment?.join(", ") || "None"}</div>
                </div>
                <div className="mobile-card-row">
                  <div className="mobile-card-label">Description</div>
                  <div className="mobile-card-description">{entry.description || "No description provided"}</div>
                </div>
                <div className="mobile-card-row">
                  <div className="mobile-card-label">Submitted</div>
                  <div className="mobile-card-value">
                    {entry.timestamp?.seconds
                      ? new Date(entry.timestamp.seconds * 1000).toLocaleString()
                      : "Unknown"}
                  </div>
                </div>
              </div>
              <div className="mobile-card-actions">
                {entry.approved ? (
                  <>
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => handleUnapprove(entry.id)}
                    >
                      Unapprove
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(entry.id)}
                    >
                      Delete
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="btn btn-sm btn-outline-success"
                      onClick={() => handleApprove(entry.id)}
                    >
                      Approve
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(entry.id)}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
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
