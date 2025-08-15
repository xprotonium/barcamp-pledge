import { useState } from "react";
import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";
import barcampBanner from "./assets/barcamp-banner.png";
import { sanitizeInput } from "./sanitize";

function Pledge() {
  const [answer1, setAnswer1] = useState("");
  const [answer2, setAnswer2] = useState("");
  const [answer3, setAnswer3] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    // Sanitize inputs before validation and submission
    const sanitizedAnswer1 = sanitizeInput(answer1);
    const sanitizedAnswer2 = sanitizeInput(answer2);
    const sanitizedAnswer3 = sanitizeInput(answer3);
    if (!sanitizedAnswer1 || !sanitizedAnswer2 || !sanitizedAnswer3) {
      setError("All fields are required.");
      return;
    }
    setError("");
    try {
      await addDoc(collection(db, "pledgeResponses"), {
        answer1: sanitizedAnswer1,
        answer2: sanitizedAnswer2,
        answer3: sanitizedAnswer3,
        timestamp: new Date(),
      });
      alert("Response submitted successfully!");
      setAnswer1("");
      setAnswer2("");
      setAnswer3("");
    } catch (error) {
      console.error("Error submitting response:", error);
    }
  };

  return (
    <div className="min-vh-100 d-flex justify-content-center align-items-center bg-light m-0 p-0">
      <div className="w-100 px-3" style={{ maxWidth: "500px" }}>
        <img
          src={barcampBanner}
          alt="BarCamp Banner"
          className="w-100 mb-3"
          style={{ borderRadius: "8px 8px 8px 8px" }}
        />
        <div className="card shadow p-3 p-md-4">
          <h3 className="mb-4 text-center">Placeholder Form Test</h3>
          <div className="justify-content-center align-items-center">
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="mb-3">
              <label htmlFor="answer1" className="form-label">
                What is your favorite color?
              </label>
              <input
                className="form-control"
                type="text"
                placeholder="e.g. Blue"
                value={answer1}
                onChange={(e) => setAnswer1(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="answer2" className="form-label">
                What city were you born in?
              </label>
              <input
                className="form-control"
                type="text"
                placeholder="e.g. New York"
                value={answer2}
                onChange={(e) => setAnswer2(e.target.value)}
              />
            </div>
            <div className="question3">
              <label htmlFor="answer3" className="form-label">
                What is your favorite hobby?
              </label>
              <input
                className="form-control"
                type="text"
                placeholder="e.g. Painting"
                value={answer3}
                onChange={(e) => setAnswer3(e.target.value)}
              />
            </div>
            <div className="d-flex justify-content-center mt-4">
              <button
                className="btn btn-primary w-100 w-md-auto"
                onClick={handleSubmit}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Pledge;
