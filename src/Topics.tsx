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
    <div className="min-vh-100 p-3 p-md-4 anim-fade-in">
      <div className="container" style={{ maxWidth: "1800px" }}>
        <div className="mb-5 text-center">
          <h1 className="mb-3 anim-fade-in-up fw-bold">Approved Topics</h1>
          <p className="lead text-muted anim-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Discover the amazing topics being presented at BarCamp Cyberjaya 2025
          </p>
        </div>

        {error && (
          <div className="alert alert-danger anim-fade-in">{error}</div>
        )}
        {!error && responses.length === 0 ? (
          <div className="card text-center">
            <div className="card-body p-5">
              <svg width="64" height="64" fill="currentColor" className="text-muted mb-3" viewBox="0 0 16 16">
                <path d="M6 .5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1H9v1.07a7.001 7.001 0 0 1 3.274 12.474l-.974-.975A6 6 0 0 0 8.5 2.18V3.5a.5.5 0 0 1-.5.5H6.5a.5.5 0 0 1-.5-.5V2.18A6 6 0 0 0 3.274 13.074l-.974.975A7.001 7.001 0 0 1 6 1.57V1.5z"/>
                <path d="M8 8a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0V9H6.5a.5.5 0 0 1 0-1H8z"/>
              </svg>
              <h4 className="text-muted">No approved topics yet</h4>
              <p className="text-muted">Check back soon for exciting presentations!</p>
            </div>
          </div>
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
                  <td className="name-cell" title={entry.fullName || ""}>{entry.fullName || ""}</td>
                  <td className="topic-cell" title={entry.topic || ""}>{entry.topic || ""}</td>
                  <td className="track-cell" title={entry.track || ""}>{entry.track || ""}</td>
                  <td className="format-cell" title={entry.sessionFormat || ""}>{entry.sessionFormat || ""}</td>
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
    </div>
  );
}

export default Topics;


