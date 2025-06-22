import { Link } from "react-router-dom";
import barcampLogo from "./assets/barcamp-logo.png";

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <a className="navbar-brand" href="/">
          <img
            src={barcampLogo}
            alt="BarCamp Logo"
            style={{ height: "40px" }}
          />
        </a>
        <div className="navbar-nav ms-auto">
          <Link to="/login" className="nav-link">
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
