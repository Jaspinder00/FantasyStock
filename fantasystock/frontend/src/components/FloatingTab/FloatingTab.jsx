import React, { useMemo, useState } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { logout } from "../../redux/authState";
import "./FloatingTab.css";

function FloatingTab(props) {
  const loggedIn = useSelector((state) => state.authState.value);
  const dispatch = useDispatch();

  const handleClick = () => {
    axios
      .post("/register/logout", {})
      .then(function (response) {
        // console.log(response);
        dispatch(logout());
        window.location.replace("http://localhost:3000");
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const [color, setColor] = useState("Light");

  let clickedClass = "clicked";
  const body = document.body;
  const lightTheme = "light";
  const darkTheme = "dark";
  let theme;

  if (localStorage) {
    theme = localStorage.getItem("theme");
  }

  if (theme === lightTheme || theme === darkTheme) {
    body.classList.add(theme);
  } else {
    body.classList.add(lightTheme);
  }

  useMemo(() => {
    theme === darkTheme ? setColor("Dark") : setColor("Light");
  }, [theme]);

  const switchTheme = (e) => {
    if (theme === darkTheme) {
      body.classList.replace(darkTheme, lightTheme);
      e.target.classList.remove(clickedClass);
      localStorage.setItem("theme", "light");
      theme = lightTheme;
      setColor("Light");
    } else {
      body.classList.replace(lightTheme, darkTheme);
      e.target.classList.remove(clickedClass);
      localStorage.setItem("theme", "dark");
      theme = darkTheme;
      setColor("Dark");
    }
  };

  return (
    <div className="NavbarFloatingTab">
      <div className="NavbarFloatingTabTab" onClick={switchTheme}>
        Appearance: {color}
      </div>
      <Link className="NavbarFloatingTabTab" to="/About">
        About Us
      </Link>
      {loggedIn && (
        <div className="NavbarFloatingTabTab" onClick={handleClick}>
          Sign out
        </div>
      )}
    </div>
  );
}

export default FloatingTab;
