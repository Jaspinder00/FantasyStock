import React, { useState, useMemo } from "react";
import axios from "axios";
import "./LoggedinBtn.css";
import SkeletonElement from "./SkeletonElement";

function LoggedinBtn(props) {
  const [pic, setPic] = useState("");
  const [show, setShow] = useState(false);

  useMemo((event) => {
    axios
      .get("/register/profilepicture")
      .then((response) => {
        setPic(response.data);
      })
      .then(() => {
        setShow(true);
      })
      .catch((error) => {
        setShow(false);
        console.log(error.response.data);
      });
  }, []);

  return (
    <span>
      {show ? (
        <img
          onClick={props.onClick}
          src={pic}
          referrerPolicy="no-referrer"
          className="NavbarLoggedInBtn"
          alt="profile"
        />
      ) : (
        <SkeletonElement type="divA" />
      )}
    </span>
  );
}

export default LoggedinBtn;
