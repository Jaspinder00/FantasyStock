import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function ClickableIcons(props) {
  return (
    <div className={props.design} to={props.to} onClick={props.onClick}>
      <div className="centerIcon">
        <FontAwesomeIcon icon={props.icon} />
      </div>

      {props.name}
    </div>
  );
}

export default ClickableIcons;
