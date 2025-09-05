import { useEffect, useState } from "react";
import { collection, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
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
  equipment?: string[];
  timestamp?: any;
  approved?: boolean;
}

function ApprovedTopics() {
  const [responses, setResponses] = useState<ResponseEntry[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || "")
      .split(",")
      .map((email: string) => email.trim())
      .filter(Boolean);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserEmail(user?.email ?? null);
      setIsAdmin(!!user?.email && adminEmails.includes(user.email as string));
    });

    const fetchApproved = async () => {
      const q = query(collection(db, "pledgeResponses"), where("approved", "==", true));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) })) as ResponseEntry[];
      setResponses(data);
    };

    fetchApproved();
    return () => unsubscribe();
  }, [navigate]);

  const handleUnapprove = async (entryId: string) => {
    try {
      const ref = doc(db, "pledgeResponses", entryId);
      await updateDoc(ref, { approved: false });
      setResponses((prev) => prev.filter((r) => r.id !== entryId));
    } catch (error) {
      console.error("Error unapproving topic:", error);
    }
  };

  const handleExportCSV = () => {
    if (responses.length === 0) return;

    const header = [
      "#",
      "Full Name",
      "Topic",
      "Track",
      "Session Format",
      "Description",
      "Timestamp",
    ];

    const rows = responses.map((entry, index) => [
      index + 1,
      (entry.fullName || "").replace(/,/g, ""),
      (entry.topic || "").replace(/,/g, ""),
      (entry.track || "").replace(/,/g, ""),
      (entry.sessionFormat || "").replace(/,/g, ""),
      (entry.description || "").replace(/,/g, ""),
      entry.timestamp?.seconds ? new Date(entry.timestamp.seconds * 1000).toLocaleString() : "",
    ]);

    const csvContent = [header, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "approved_topics.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4 anim-fade-in-up">
                <h2 className="mb-0">Approved Topics</h2>
        <div className="d-flex align-items-center gap-2">
          {userEmail && <div className="text-muted small">{userEmail}</div>}
          <button
            className="btn btn-outline-secondary"
            onClick={() => navigate("/admin")}
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {responses.length === 0 ? (
        <div className="alert alert-info">No approved topics yet.</div>
      ) : (
        <>
        {/* Desktop Table */}
        <div className="table-responsive anim-fade-in-up">
          <table className="table table-striped table-hover align-middle table-mobile-optimized">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Topic</th>
                <th>Track</th>
                <th>Format</th>
                <th>Description</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {responses.map((entry, index) => (
                <tr key={entry.id} className="anim-fade-in">
                  <td>{index + 1}</td>
                  <td title={entry.fullName || ""}>{entry.fullName || ""}</td>
                  <td title={entry.topic || ""}>{entry.topic || ""}</td>
                  <td title={entry.track || ""}>{entry.track || ""}</td>
                  <td title={entry.sessionFormat || ""}>{entry.sessionFormat || ""}</td>
                  <td className="description-cell" title={entry.description || ""}>{entry.description || ""}</td>
                  {isAdmin && (
                    <td className="actions-cell">
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
                    </td>
                  )}
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
                <span className="badge bg-success mobile-card-badge">Approved</span>
              </div>
              <div className="mobile-card-body">
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
                  <div className="mobile-card-label">Description</div>
                  <div className="mobile-card-description">{entry.description || "No description provided"}</div>
                </div>
              </div>
              {isAdmin && (
                <div className="mobile-card-actions">
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => handleUnapprove(entry.id)}
                  >
                    Unapprove
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mb-3">
          <button className="btn btn-success" onClick={handleExportCSV} disabled={responses.length === 0}>
            Export to CSV
          </button>
        </div>
        </>
      )}
    </div>
  );
}

export default ApprovedTopics;


