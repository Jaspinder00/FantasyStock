import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import "./SettingsBtn.css";

function SettingsBtn(props) {
  return (
    <button
      onClick={props.onClick}
      className="NavbarSettings"
      type="button"
      aria-label="Settings"
    >
      <FontAwesomeIcon icon={faEllipsisVertical} />
    </button>
  );
}

export default SettingsBtn;
