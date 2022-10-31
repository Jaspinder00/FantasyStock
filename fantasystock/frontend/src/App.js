import "./App.css";
import Home from "./containers/Home/Home";
import Stocks from "./containers/Stocks/Stocks";
import Navigation from "./containers/Navigation/Navigation";
import Unauthorized from "./containers/Unauthenticated/Unauthenticated";
import About from "./containers/About/About";
import Settings from "./containers/Settings/Settings";
import Profile from "./containers/Profile/Profile";
import React, { useMemo } from "react";
import { Route, Routes } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { login, logout } from "./redux/authState";
import axios from "axios";
import DarkMode from "./helpers/DarkMode";

function App() {
  const dispatch = useDispatch();
  const loggedIn = useSelector((state) => state.authState.value);
  DarkMode();

  useMemo(() => {
    axios
      .get("/register/checkAuthentication")
      .then((res) => {
        res.data.authenticated ? dispatch(login()) : dispatch(logout());
      })
      .catch((error) => {
        dispatch(logout());
      });
  }, [dispatch]);

  return (
    <div className="App">
      {loggedIn && <Navigation />}
      <main className="App-header">
        <Routes>
          {loggedIn ? (
            <Route path="/" element={<Home />} />
          ) : (
            <Route path="/" element={<Unauthorized />} />
          )}
          {loggedIn ? (
            <Route path="/loggedin" element={<Home />} />
          ) : (
            <Route path="/loggedin" element={<Unauthorized />} />
          )}
          {loggedIn ? (
            <Route path="/about" element={<About />} />
          ) : (
            <Route path="/about" element={<Unauthorized />} />
          )}
          {loggedIn ? (
            <Route path="/profile" element={<Profile />} />
          ) : (
            <Route path="/profile" element={<Unauthorized />} />
          )}
          {loggedIn ? (
            <Route path="/settings" element={<Settings />} />
          ) : (
            <Route path="/settings" element={<Unauthorized />} />
          )}
          {loggedIn ? (
            <Route path="/stocks" element={<Stocks />} />
          ) : (
            <Route path="/stocks" element={<Unauthorized />} />
          )}
        </Routes>
      </main>
    </div>
  );
}

export default App;
