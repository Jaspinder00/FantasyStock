import React, { useState, useEffect } from "react";
import SigninBtn from "../../components/SigninBtn/SigninBtn";
import "./Unauthenticated.css";

function Stock(props) {
  return (
    <div className="unauthContainer">
      <h1 className="unauthH1">FantasyStock</h1>
      <SigninBtn />
    </div>
  );
}

export default Stock;
