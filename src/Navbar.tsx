import { Link, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { onAuthStateChanged, signOut, updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { auth } from "./firebase";
import barcampLogo from "./assets/barcamp-logo.png";

function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNameForm, setShowNameForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nameError, setNameError] = useState("");
  const [nameSuccess, setNameSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const accountBtnRef = useRef<HTMLButtonElement | null>(null);
  const collapseRef = useRef<HTMLDivElement | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        setNewDisplayName(user.displayName || "");
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.navbar-dropdown')) {
        setShowDropdown(false);
      }
    };

    const handleViewport = () => {
      setIsMobile(window.innerWidth < 992); // Bootstrap lg breakpoint
    };

    // No manual positioning needed for the dropdown when using absolute within a relative parent

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleViewport);
    handleViewport();
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleViewport);
    };
  }, [showDropdown]);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleNameChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setNameError("");
    setNameSuccess("");

    if (!newDisplayName.trim()) {
      setNameError("Display name cannot be empty");
      setLoading(false);
      return;
    }

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setNameError("User not found");
        setLoading(false);
        return;
      }

      await updateProfile(currentUser, {
        displayName: newDisplayName.trim()
      });

      // Update local state
      setUser({ ...user, displayName: newDisplayName.trim() });
      setNameSuccess("Display name updated successfully!");
      setShowNameForm(false);
    } catch (error: any) {
      console.error("Error updating display name:", error);
      setNameError("Failed to update display name. Please try again.");
    } finally {
      setLoading(false);
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
      const currentUser = auth.currentUser;
      if (!currentUser || !user?.email) {
        setPasswordError("User not found");
        setLoading(false);
        return;
      }

      // Re-authenticate user before password change
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(currentUser, credential);

      // Update password
      await updatePassword(currentUser, newPassword);

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

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light sticky-top" style={{ zIndex: 1030 }}>
      <div className="container-fluid">
        <Link to="/" className="navbar-brand">
          <img
            src={barcampLogo}
            alt="BarCamp Logo"
            style={{ height: "clamp(28px, 5vw, 40px)", width: "auto" }}
          />
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          aria-controls="navbarSupportedContent"
          aria-expanded={menuOpen}
          aria-label="Toggle navigation"
          onClick={() => {
            setMenuOpen((v) => !v);
            setShowDropdown(false);
          }}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {(() => {
          const showCollapse = (isMobile && menuOpen) || (!isMobile);
          const animatedStyle = isMobile
            ? {
                overflow: 'hidden',
                maxHeight: menuOpen ? 600 : 0,
                opacity: menuOpen ? 1 : 0,
                transition: 'max-height 220ms ease, opacity 180ms ease'
              }
            : undefined;
          const mobileItemStyle = isMobile ? { width: '92%', maxWidth: 480, marginLeft: 'auto', marginRight: 'auto', marginBottom: 6 } : undefined;
          return (
            <div
              id="navbarSupportedContent"
              ref={collapseRef}
              className={`${isMobile ? 'navbar-collapse' : 'collapse navbar-collapse'} ${!isMobile && showCollapse ? 'show' : ''}`}
              style={animatedStyle as any}
            >
              <div className={`navbar-nav ms-auto d-flex ${isMobile ? 'flex-column align-items-stretch' : 'align-items-center'}`}>
                {/* Public link visible to everyone */}
                <Link 
                  to="/topics" 
                  className={`nav-link ${isActive('/topics') ? 'active' : ''} ${isMobile ? 'text-center' : ''}`}
                  onClick={() => setMenuOpen(false)}
                  style={mobileItemStyle as any}
                >
                  Approved Topics
                </Link>
                {user ? (
                  <>
                    <Link 
                      to="/admin" 
                      className={`nav-link ${isActive('/admin') ? 'active' : ''} ${isMobile ? 'text-center' : ''}`}
                      onClick={() => setMenuOpen(false)}
                      style={mobileItemStyle as any}
                    >
                      Admin Dashboard
                    </Link>
                    {isMobile ? (
                      <div className="w-100 mt-2 d-flex flex-column align-items-center">
                        <div className="w-100 my-2" style={{ borderTop: '1px solid rgba(0,0,0,0.12)' }}></div>
                        <div className="text-muted small mb-2 text-center w-100" style={mobileItemStyle as any}>{user?.email}</div>
                        <div className="nav flex-column w-100 align-items-center">
                          <button
                            type="button"
                            className="nav-link text-center"
                            onClick={() => {
                              setShowNameForm(true);
                              setMenuOpen(false);
                            }}
                            style={mobileItemStyle as any}
                          >
                            Change Name
                          </button>
                          <button
                            type="button"
                            className="nav-link text-center"
                            onClick={() => {
                              setShowPasswordForm(true);
                              setMenuOpen(false);
                            }}
                            style={mobileItemStyle as any}
                          >
                            Change Password
                          </button>
                          <button
                            type="button"
                            className="nav-link text-center text-danger"
                            onClick={() => {
                              handleLogout();
                              setMenuOpen(false);
                            }}
                            style={mobileItemStyle as any}
                          >
                            Logout
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="nav-item dropdown navbar-dropdown" style={{ position: 'relative' }}>
                        <button
                          className="nav-link dropdown-toggle"
                          type="button"
                          ref={accountBtnRef}
                          onClick={() => setShowDropdown(!showDropdown)}
                          aria-expanded={showDropdown}
                        >
                          {user?.displayName || "My Account"}
                        </button>
                        <div
                          className="dropdown-menu dropdown-menu-end"
                          style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            left: 'auto',
                            minWidth: 260,
                            zIndex: 2000,
                            display: showDropdown ? 'block' : 'none',
                            opacity: showDropdown ? 1 : 0,
                            transform: showDropdown ? 'translateY(0px)' : 'translateY(-6px)',
                            transition: 'opacity 140ms ease, transform 180ms ease',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                          }}
                        >
                          <div className="dropdown-item-text">
                            <small className="text-muted">{user?.email}</small>
                          </div>
                          <div className="dropdown-divider"></div>
                          <button
                            className="dropdown-item"
                            onClick={() => {
                              setShowNameForm(true);
                              setShowDropdown(false);
                            }}
                          >
                            Change Name
                          </button>
                          <button
                            className="dropdown-item"
                            onClick={() => {
                              setShowPasswordForm(true);
                              setShowDropdown(false);
                            }}
                          >
                            Change Password
                          </button>
                          <div className="dropdown-divider"></div>
                          <button
                            className="dropdown-item text-danger"
                            onClick={() => {
                              handleLogout();
                              setShowDropdown(false);
                            }}
                          >
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <Link 
                    to="/login" 
                    className={`nav-link ${isActive('/login') ? 'active fw-bold' : ''} ${isMobile ? 'w-100 text-center' : ''}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Name Change Form Modal */}
      {showNameForm && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Change Display Name</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowNameForm(false);
                    setNameError("");
                    setNameSuccess("");
                    setNewDisplayName(user?.displayName || "");
                  }}
                ></button>
              </div>
              <form onSubmit={handleNameChange}>
                <div className="modal-body">
                  {nameError && (
                    <div className="alert alert-danger">{nameError}</div>
                  )}
                  {nameSuccess && (
                    <div className="alert alert-success">{nameSuccess}</div>
                  )}
                  <div className="mb-3">
                    <label htmlFor="newDisplayName" className="form-label">
                      Display Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="newDisplayName"
                      value={newDisplayName}
                      onChange={(e) => setNewDisplayName(e.target.value)}
                      required
                      disabled={loading}
                      placeholder="Enter your display name"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowNameForm(false);
                      setNameError("");
                      setNameSuccess("");
                      setNewDisplayName(user?.displayName || "");
                    }}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? "Updating..." : "Update Name"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Password Change Form Modal */}
      {showPasswordForm && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Change Password</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordError("");
                    setPasswordSuccess("");
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                ></button>
              </div>
              <form onSubmit={handlePasswordChange}>
                <div className="modal-body">
                  {passwordError && (
                    <div className="alert alert-danger">{passwordError}</div>
                  )}
                  {passwordSuccess && (
                    <div className="alert alert-success">{passwordSuccess}</div>
                  )}
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
                </div>
                <div className="modal-footer">
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
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
