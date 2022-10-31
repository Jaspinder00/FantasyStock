import React from "react";
import axios from "axios";
import "./Settings.css";

function Settings(props) {
  const sendDelete = async () => {
    await axios.delete("/register/delete").catch((err) => {
      window.location.replace("http://localhost:3000");
    });
  };

  return (
    <div>
      <button className="deleteBtn" type="button" onClick={sendDelete}>
        Delete Account :(
      </button>
    </div>
  );
}

export default Settings;
