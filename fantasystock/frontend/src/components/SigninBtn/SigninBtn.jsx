import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import "./SigninBtn.css";

function SigninBtn(props) {
  return (
    <a
      className="NavbarSignInUpBtn"
      href="http://localhost:5000/register/auth/google"
    >
      <FontAwesomeIcon icon={faUser} />{" "}
      <span className="NavbarSignInUpBtnText"> Sign in </span>
    </a>
  );
}

export default SigninBtn;
