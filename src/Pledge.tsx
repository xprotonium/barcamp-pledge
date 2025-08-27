import { useState } from "react";
import type { ChangeEvent, FormEvent, ReactElement } from "react";
import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import type { DocumentData } from "firebase/firestore";
import barcampBanner from "./assets/barcamp-banner.png";
// import { sanitizeInput } from "./sanitize"; // Commented out as it's not being used

interface FormData {
  registered: string;
  fullName: string;
  phoneNumber: string;
  topic: string;
  track: string;
  description: string;
  sessionFormat: string;
  otherFormat: string;
  equipment: string[];
  otherEquipment: string;
}

function Pledge(): ReactElement {
  const [formData, setFormData] = useState<FormData>({
    registered: "",
    fullName: "",
    phoneNumber: "",
    topic: "",
    track: "",
    description: "",
    sessionFormat: "",
    otherFormat: "",
    equipment: [],
    otherEquipment: ""
  });
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: FormData) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData((prev: FormData) => ({
      ...prev,
      equipment: checked
        ? [...prev.equipment, value]
        : prev.equipment.filter((item) => item !== value)
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate required fields
    const { registered, fullName, phoneNumber, topic, track, description, sessionFormat, otherFormat, equipment } = formData;
    
    if (!registered || !fullName || !phoneNumber || !topic || !track || !description || !sessionFormat) {
      setError("Please fill in all required fields.");
      return;
    }

    if (sessionFormat === "other" && !otherFormat) {
      setError("Please specify the session format.");
      return;
    }

    if (equipment.includes("other") && !formData.otherEquipment) {
      setError("Please specify the other equipment needed.");
      return;
    }

    setError("");
    
    try {
      const submissionData: DocumentData = {
        ...formData,
        timestamp: serverTimestamp(),
        // If session format is 'other', use the custom value
        sessionFormat: sessionFormat === "other" ? otherFormat : sessionFormat,
        // Add other equipment to equipment array if specified
        equipment: equipment.includes("other") 
          ? [...equipment.filter((item: string) => item !== "other"), `Other: ${formData.otherEquipment}`]
          : equipment
      };

      await addDoc(collection(db, "pledgeResponses"), submissionData);
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting response:", error);
      setError("An error occurred while submitting your response. Please try again.");
    }
  };

  if (submitted) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center bg-light m-0 p-0">
        <div className="w-100 px-3" style={{ maxWidth: "600px" }}>
          <div className="card shadow p-4 text-center">
            <h3 className="text-success mb-4">Thank You!</h3>
            <p>Your BarCamp 2025 pledge form has been submitted successfully.</p>
            <p>We'll review your submission and get back to you soon.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light m-0 p-3 p-md-4">
      <div className="container" style={{ maxWidth: "800px" }}>
        <div className="text-center mb-4">
          <img
            src={barcampBanner}
            alt="BarCamp Banner"
            className="img-fluid rounded"
            style={{ maxHeight: '200px' }}
          />
          <h2 className="mt-4">BarCamp 2025 Pledge Form</h2>
        </div>
        
        <div className="card shadow p-3 p-md-4">
          {error && <div className="alert alert-danger">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            {/* Question 1 */}
            <div className="mb-4">
              <label className="form-label fw-bold">1. Before proceeding, have you registered first for BarCamp 2025? <span className="text-danger">*</span></label>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="registered"
                  id="registeredYes"
                  value="Yes"
                  checked={formData.registered === "Yes"}
                  onChange={handleChange}
                  required
                />
                <label className="form-check-label" htmlFor="registeredYes">
                  Yes
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="registered"
                  id="registeredNo"
                  value="No"
                  checked={formData.registered === "No"}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="registeredNo">
                  No
                </label>
              </div>
            </div>

            {/* Question 2 */}
            <div className="mb-4">
              <label htmlFor="fullName" className="form-label fw-bold">2. Your full name <span className="text-danger">*</span></label>
              <input
                type="text"
                className="form-control"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            {/* Question 3 */}
            <div className="mb-4">
              <label htmlFor="phoneNumber" className="form-label fw-bold">3. Your phone number <span className="text-danger">*</span></label>
              <input
                type="tel"
                className="form-control"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
            </div>

            {/* Question 4 */}
            <div className="mb-4">
              <label htmlFor="topic" className="form-label fw-bold">4. What is your topic? <span className="text-danger">*</span></label>
              <input
                type="text"
                className="form-control"
                id="topic"
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                required
              />
            </div>

            {/* Question 5 */}
            <div className="mb-4">
              <label className="form-label fw-bold">5. Track <span className="text-danger">*</span></label>
              <select 
                className="form-select" 
                name="track" 
                value={formData.track}
                onChange={handleChange}
                required
              >
                <option value="">Select a track</option>
                <option value="Science Technology">Science Technology</option>
                <option value="General">General</option>
                <option value="Creative">Creative</option>
              </select>
            </div>

            {/* Question 6 */}
            <div className="mb-4">
              <label htmlFor="description" className="form-label fw-bold">6. Brief description about your topic: <span className="text-danger">*</span></label>
              <textarea
                className="form-control"
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            {/* Question 7 */}
            <div className="mb-4">
              <label className="form-label fw-bold">7. Session format (select one): <span className="text-danger">*</span></label>
              <div className="mb-2">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="sessionFormat"
                    id="discussion"
                    value="Discussion"
                    checked={formData.sessionFormat === "Discussion"}
                    onChange={handleChange}
                    required
                  />
                  <label className="form-check-label" htmlFor="discussion">
                    Discussion
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="sessionFormat"
                    id="presentation"
                    value="Presentation / semi-talk"
                    checked={formData.sessionFormat === "Presentation / semi-talk"}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="presentation">
                    Presentation / semi-talk
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="sessionFormat"
                    id="otherFormatRadio"
                    value="other"
                    checked={formData.sessionFormat === "other"}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="otherFormatRadio">
                    Other (please specify):
                  </label>
                </div>
                {formData.sessionFormat === "other" && (
                  <input
                    type="text"
                    className="form-control mt-2"
                    name="otherFormat"
                    value={formData.otherFormat}
                    onChange={handleChange}
                    placeholder="Please specify session format"
                  />
                )}
              </div>
            </div>

            {/* Question 8 */}
            <div className="mb-4">
              <label className="form-label fw-bold">8. Equipment needs: (tick all that apply)</label>
              <div className="ms-3">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="laptop"
                    name="equipment"
                    value="Laptop screen sharing"
                    checked={formData.equipment.includes("Laptop screen sharing")}
                    onChange={handleCheckboxChange}
                  />
                  <label className="form-check-label" htmlFor="laptop">
                    Laptop screen sharing
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="mic"
                    name="equipment"
                    value="Extra mic(s)"
                    checked={formData.equipment.includes("Extra mic(s)")}
                    onChange={handleCheckboxChange}
                  />
                  <label className="form-check-label" htmlFor="mic">
                    Extra mic(s)
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="speakers"
                    name="equipment"
                    value="Speakers / sound system"
                    checked={formData.equipment.includes("Speakers / sound system")}
                    onChange={handleCheckboxChange}
                  />
                  <label className="form-check-label" htmlFor="speakers">
                    Speakers / sound system
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="otherEquipmentCheckbox"
                    name="equipment"
                    value="other"
                    checked={formData.equipment.includes("other")}
                    onChange={handleCheckboxChange}
                  />
                  <label className="form-check-label" htmlFor="otherEquipmentCheckbox">
                    Other (please specify):
                  </label>
                </div>
                {formData.equipment.includes("other") && (
                  <input
                    type="text"
                    className="form-control mt-2"
                    name="otherEquipment"
                    value={formData.otherEquipment}
                    onChange={handleChange}
                    placeholder="Please specify equipment"
                  />
                )}
              </div>
            </div>

            <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-4">
              <button type="submit" className="btn btn-primary px-4">
                Submit Pledge
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Pledge;
