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
  materialLink?: string;
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
    otherEquipment: "",
    materialLink: ""
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
    const { registered, fullName, phoneNumber, topic, track, description, sessionFormat, otherFormat, equipment, materialLink } = formData;
    
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

    // Validate link if provided (optional field)
    if (materialLink) {
      const urlOk = /^(https?:\/\/).+/.test(materialLink.trim());
      if (!urlOk) {
        setError("Please provide a valid URL starting with http or https.");
        return;
      }
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

      if (materialLink?.trim()) {
        (submissionData as any).materials = { type: "link", url: materialLink.trim() };
      }

      await addDoc(collection(db, "pledgeResponses"), submissionData);
      setSubmitted(true);
    } catch (error: any) {
      console.error("Error submitting response:", error);
      setError(error?.message || "An error occurred while submitting your response. Please try again.");
    }
  };

  if (submitted) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center bg-light m-0 p-0 anim-fade-in">
        <div className="w-100 px-3" style={{ maxWidth: "600px" }}>
          <div className="card shadow p-4 text-center anim-scale-in">
            <h3 className="text-success mb-4">Thank You!</h3>
            <p>Your BarCamp Cyberjaya 2025 pledge form has been submitted successfully.</p>
            <p>We'll review your submission and get back to you soon.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light m-0 p-3 p-md-4 anim-fade-in">
      <div className="container" style={{ maxWidth: "800px" }}>
        <div className="text-center mb-4">
          <img
            src={barcampBanner}
            alt="BarCamp Banner"
            className="img-fluid rounded anim-fade-in-up"
            style={{ maxHeight: '200px' }}
          />
          <h2 className="mt-4 anim-fade-in-up" style={{ animationDelay: '80ms' }}>BarCamp Cyberjaya 2025 Pledge Form</h2>
        </div>
        
        <div className="card shadow p-3 p-md-4 anim-scale-in">
          {error && <div className="alert alert-danger anim-fade-in">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            {/* Question 1 */}
            <div className="mb-4 anim-fade-in-up" style={{ animationDelay: '40ms' }}>
              <label className="form-label fw-bold">1. Before proceeding, have you registered first for BarCamp Cyberjaya 2025? <span className="text-danger">*</span></label>
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
              {formData.registered === "No" && (
                <div className="alert alert-info mt-2 anim-fade-in" style={{ backgroundColor: '#e9f4ff', borderColor: '#cfe7ff' }}>
                  <small>
                    Do not forget to register through this link: {" "}
                    <a href="https://luma.com/383ji31c?tk=UZDCSO" target="_blank" rel="noreferrer">
                      https://luma.com/383ji31c?tk=UZDCSO
                    </a>
                  </small>
                </div>
              )}
            </div>

            {/* Question 2 */}
            <div className="mb-4 anim-fade-in-up" style={{ animationDelay: '80ms' }}>
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
            <div className="mb-4 anim-fade-in-up" style={{ animationDelay: '120ms' }}>
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
            <div className="mb-4 anim-fade-in-up" style={{ animationDelay: '160ms' }}>
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
            <div className="mb-4 anim-fade-in-up" style={{ animationDelay: '200ms' }}>
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
            <div className="mb-4 anim-fade-in-up" style={{ animationDelay: '240ms' }}>
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
            <div className="mb-4 anim-fade-in-up" style={{ animationDelay: '280ms' }}>
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
                    className="form-control mt-2 anim-fade-in"
                    name="otherFormat"
                    value={formData.otherFormat}
                    onChange={handleChange}
                    placeholder="Please specify session format"
                  />
                )}
              </div>
            </div>

            {/* Question 8 */}
            <div className="mb-4 anim-fade-in-up" style={{ animationDelay: '320ms' }}>
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
                    className="form-control mt-2 anim-fade-in"
                    name="otherEquipment"
                    value={formData.otherEquipment}
                    onChange={handleChange}
                    placeholder="Please specify equipment"
                  />
                )}
              </div>
            </div>

            {/* Question 9 */}
            <div className="mb-4 anim-fade-in-up" style={{ animationDelay: '340ms' }}>
              <label className="form-label fw-bold">9. Slide deck or resource link (optional)</label>
              <input
                type="url"
                className="form-control mt-2 anim-fade-in"
                name="materialLink"
                placeholder="https://example.com/your-slides"
                value={formData.materialLink}
                onChange={handleChange}
              />
              <div className="form-text">Provide a public link to your slides or resources.</div>
            </div>

            <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-4 anim-fade-in-up" style={{ animationDelay: '360ms' }}>
              <button type="submit" className="btn btn-primary px-4 transition-base">
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
