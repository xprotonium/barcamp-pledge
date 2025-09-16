import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase";

interface ResponseEntry {
  id: string;
  fullName?: string;
  topic?: string;
  track?: string;
  description?: string;
  sessionFormat?: string;
}

function Topics() {
  const [responses, setResponses] = useState<ResponseEntry[]>([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchApproved = async () => {
      try {
        setError("");
        const q = query(collection(db, "pledgeResponses"), where("approved", "==", true));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) })) as ResponseEntry[];
        setResponses(data);
      } catch (err) {
        console.error("Error loading topics:", err);
        setError("Unable to load topics. Please try again later.");
      }
    };

    fetchApproved();
  }, []);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4 anim-fade-in-up">
        <h2 className="mb-0">Approved Topics</h2>
      </div>

      {error && (
        <div className="alert alert-danger anim-fade-in">{error}</div>
      )}
      {!error && responses.length === 0 ? (
        <div className="alert alert-info">No topics yet.</div>
      ) : !error ? (
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
                  <div className="mobile-card-label">Format</div>
                  <div className="mobile-card-value">{entry.sessionFormat || "N/A"}</div>
                </div>
                <div className="mobile-card-row">
                  <div className="mobile-card-label">Description</div>
                  <div className="mobile-card-description">{entry.description || "No description provided"}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        </>
      ) : null}
    </div>
  );
}

export default Topics;


