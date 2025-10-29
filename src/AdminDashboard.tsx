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
  materials?: { type?: string; url?: string; name?: string };
}

function AdminDashboard() {
  const [responses, setResponses] = useState<ResponseEntry[]>([]);
  const [filter, setFilter] = useState<"all" | "approved">("all");
  const [isExporting, setIsExporting] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
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




  const handleExportCSV = async () => {
    const filtered = filter === "approved" ? responses.filter((r) => r.approved) : responses;
    if (filtered.length === 0) {
      setToast({
        message: "No data to export",
        type: 'error'
      });
      return;
    }

    setIsExporting(true);

    try {
      // Helper function to escape CSV values
      const escapeCSV = (value: string | number | undefined): string => {
        if (value === undefined || value === null) return "";
        const str = String(value);
        // If the value contains commas, quotes, or newlines, wrap it in quotes and escape internal quotes
        if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const header = [
        "Number",
        "Registered",
        "Full Name",
        "Phone Number",
        "Topic",
        "Track", 
        "Description",
        "Session Format",
        "Equipment",
        "Materials URL",
        "Approved",
        "Submission Date"
      ];

      const rows = filtered.map((entry, index) => [
        escapeCSV(index + 1),
        escapeCSV(entry.registered || ""),
        escapeCSV(entry.fullName || ""),
        escapeCSV(entry.phoneNumber || ""),
        escapeCSV(entry.topic || ""),
        escapeCSV(entry.track || ""),
        escapeCSV(entry.description || ""),
        escapeCSV(entry.sessionFormat || ""),
        escapeCSV(entry.equipment?.join("; ") || ""),
        escapeCSV(entry.materials?.url || ""),
        escapeCSV(entry.approved ? "Yes" : "No"),
        escapeCSV(entry.timestamp?.seconds 
          ? new Date(entry.timestamp.seconds * 1000).toLocaleString()
          : "")
      ]);

      // Create CSV content with UTF-8 BOM for proper Excel support
      const csvContent = "\ufeff" + [header.join(","), ...rows.map(row => row.join(","))].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      
      // Generate filename with current date
      const currentDate = new Date().toISOString().split('T')[0];
      const filterText = filter === "approved" ? "approved" : "all";
      link.setAttribute("download", `barcamp-pledge-submissions-${filterText}-${currentDate}.csv`);
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL object
      URL.revokeObjectURL(url);
      
      console.log(`Successfully exported ${filtered.length} submissions to CSV`);
      
      // Show success toast
      setToast({
        message: `Successfully exported ${filtered.length} submissions to CSV`,
        type: 'success'
      });
      
      // Brief delay to show the loading state
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error("Error exporting CSV:", error);
      setToast({
        message: "Error exporting CSV. Please try again.",
        type: 'error'
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

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
    <div className="min-vh-100 p-3 p-md-4 anim-fade-in">
      {/* Toast Notification */}
      {toast && (
        <div 
          className={`position-fixed top-0 end-0 m-3 alert ${toast.type === 'success' ? 'alert-success' : 'alert-danger'} alert-dismissible anim-fade-in`}
          style={{ zIndex: 1050, maxWidth: '400px' }}
          role="alert"
        >
          <div className="d-flex align-items-center">
            {toast.type === 'success' ? (
              <svg width="20" height="20" fill="currentColor" className="me-2 text-success">
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.061L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
              </svg>
            ) : (
              <svg width="20" height="20" fill="currentColor" className="me-2 text-danger">
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
              </svg>
            )}
            {toast.message}
          </div>
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setToast(null)}
            aria-label="Close"
          ></button>
        </div>
      )}
      
      <div className="container-fluid" style={{ maxWidth: "1800px" }}>
        <div className="admin-header-modern mb-5">
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center">
            <div className="mb-3 mb-lg-0">
              <h1 className="mb-2 fw-bold anim-fade-in-up">Admin Dashboard</h1>
              <p className="text-muted mb-0 anim-fade-in-up" style={{ animationDelay: '0.1s' }}>
                Manage pledge submissions and approvals
              </p>
            </div>
            <div className="admin-actions d-flex flex-column flex-sm-row gap-3">
              <div className="d-flex align-items-center gap-2">
                <label htmlFor="filterSelect" className="form-label mb-0 fw-semibold">Filter:</label>
                <select
                  id="filterSelect"
                  className="form-select"
                  style={{ minWidth: "150px" }}
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as "all" | "approved")}
                >
                  <option value="all">All Submissions</option>
                  <option value="approved">Approved Only</option>
                </select>
              </div>
              <button 
                className="btn btn-outline-primary"
                onClick={handleExportCSV}
                disabled={responses.length === 0 || isExporting}
              >
                {isExporting ? (
                  <>
                    <div className="spinner-border spinner-border-sm me-2" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    Exporting...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" fill="currentColor" className="me-2">
                      <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                      <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                    </svg>
                    Export CSV
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {responses.length === 0 ? (
          <div className="card text-center">
            <div className="card-body p-5">
              <svg width="64" height="64" fill="currentColor" className="text-muted mb-3" viewBox="0 0 16 16">
                <path d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4.414A2 2 0 0 0 3 11.586l-2 2V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12.793a.5.5 0 0 0 .854.353l2.853-2.853A1 1 0 0 1 4.414 12H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                <path d="M3 3.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zM3 6a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 6zm0 2.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z"/>
              </svg>
              <h4 className="text-muted">No submissions yet</h4>
              <p className="text-muted">Pledge submissions will appear here once people start submitting.</p>
            </div>
          </div>
        ) : (
          <>
          
          {/* Desktop Table */}
          <div className="table-responsive anim-fade-in-up">
            <table className="table table-striped table-hover align-middle table-mobile-optimized admin-table">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>#</th>
                  <th style={{ width: '80px' }}>Registered</th>
                  <th style={{ width: '150px' }}>Full Name</th>
                  <th style={{ width: '120px' }}>Phone</th>
                  <th style={{ width: '200px' }}>Topic</th>
                  <th style={{ width: '100px' }}>Track</th>
                  <th style={{ width: '250px' }}>Description</th>
                  <th style={{ width: '120px' }}>Format</th>
                  <th style={{ width: '150px' }}>Equipment</th>
                  <th style={{ width: '100px' }}>Materials</th>
                  <th style={{ width: '120px' }}>Time</th>
                  <th style={{ width: '150px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(filter === "approved" ? responses.filter((r) => r.approved) : responses).map((entry, index) => (
                  <tr key={entry.id} className="anim-fade-in">
                    <td>{index + 1}</td>
                    <td className="registered-cell" title={entry.registered || ""}>{entry.registered || ""}</td>
                    <td className="name-cell" title={entry.fullName || ""}>{entry.fullName || ""}</td>
                    <td className="phone-cell" title={entry.phoneNumber || ""}>{entry.phoneNumber || ""}</td>
                    <td className="topic-cell" title={entry.topic || ""}>{entry.topic || ""}</td>
                    <td className="track-cell" title={entry.track || ""}>{entry.track || ""}</td>
                    <td className="description-cell" title={entry.description || ""}>{entry.description || ""}</td>
                    <td className="format-cell" title={entry.sessionFormat || ""}>{entry.sessionFormat || ""}</td>
                    <td className="equipment-cell" title={entry.equipment?.join(", ") || ""}>{entry.equipment?.join(", ") || ""}</td>
                    <td className="materials-cell">
                  {entry.materials?.url ? (
                    <a
                      href={entry.materials.url}
                      target="_blank"
                      rel="noreferrer"
                      title={entry.materials.url}
                    >
                      {entry.materials.type === "file"
                        ? (entry.materials.name || "View file")
                        : "Open link"}
                    </a>
                  ) : (
                    <span className="text-muted">None</span>
                  )}
                </td>
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
          {(filter === "approved" ? responses.filter((r) => r.approved) : responses).map((entry, index) => (
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
                  <div className="mobile-card-label">Materials</div>
                  <div className="mobile-card-value">
                    {entry.materials?.url ? (
                      <a href={entry.materials.url} target="_blank" rel="noreferrer">
                        {entry.materials.type === "file" ? (entry.materials.name || "View file") : "Open link"}
                      </a>
                    ) : (
                      "None"
                    )}
                  </div>
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
        </>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
