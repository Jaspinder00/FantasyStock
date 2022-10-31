import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import "./HamburgerToggle.css";

function HamburgerToggle(props) {
  return (
    <div
      aria-label="Toggle navigation"
      className="NavbarHamburgerMenu"
      onClick={props.onClick}
    >
      <FontAwesomeIcon icon={faBars} />
    </div>
  );
}

export default HamburgerToggle;
