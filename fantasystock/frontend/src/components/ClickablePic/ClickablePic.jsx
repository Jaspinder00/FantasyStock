import React from "react";
import { Link } from "react-router-dom";
import "./ClickablePic.css";

function ClickablePic(props) {
  return (
    <Link className={props.design} to={props.to}>
      <div
        className={`centerPic ${props.hoverDesign}`}
        data-hover={props.hoverName}
      >
        <img
          referrerPolicy="no-referrer"
          src={props.aSrc}
          className={props.design}
          alt={props.aAlt}
        />
      </div>
    </Link>
  );
}

export default ClickablePic;
