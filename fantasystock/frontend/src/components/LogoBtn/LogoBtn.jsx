import React from "react";
import { Link } from "react-router-dom";
import "./LogoBtn.css";

function LogoBtn(props) {
  return (
    <Link className="NavbarLogoBtn" aria-label="Logo" to="/">
      FantasyStock
    </Link>
  );
}

export default LogoBtn;
