import "./App.css";
import Home from "./containers/Home/Home";
import Stocks from "./containers/Stocks/Stocks";
import Navigation from "./containers/Navigation/Navigation";
import Unauthorized from "./containers/Unauthenticated/Unauthenticated";
import About from "./containers/About/About";
import Friends from "./containers/Friends/Friends";
import Settings from "./containers/Settings/Settings";
import Profile from "./containers/Profile/Profile";
import Store from "./containers/Store/Store";
import MessageCenter from "./containers/MessageCenter/MessageCenter";
import User from "./containers/User/User";
import LeagueCenter from "./containers/LeagueCenter/LeagueCenter";
import CreateLeague from "./containers/CreateLeague/CreateLeague";
import SearchLeague from "./containers/SearchLeague/SearchLeague";
import League from "./containers/League/League";
import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { login, logout } from "./redux/authState";
import axios from "axios";
import DarkMode from "./helpers/DarkMode";

function App() {
  const dispatch = useDispatch();
  const loggedIn = useSelector((state) => state.authState.value);
  DarkMode();

  useEffect(() => {
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
            <Route path="/store" element={<Store />} />
          ) : (
            <Route path="/store" element={<Unauthorized />} />
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
          {loggedIn ? (
            <Route path="/friends" element={<Friends />} />
          ) : (
            <Route path="/friends" element={<Unauthorized />} />
          )}
          {loggedIn ? (
            <Route path="/messagecenter" element={<MessageCenter />} />
          ) : (
            <Route path="/messagecenter" element={<Unauthorized />} />
          )}
          {loggedIn ? (
            <Route path="/user/:id" element={<User />} />
          ) : (
            <Route path="/user/:id" element={<Unauthorized />} />
          )}
          {loggedIn ? (
            <Route path="/league" element={<LeagueCenter />} />
          ) : (
            <Route path="/league" element={<Unauthorized />} />
          )}
          {loggedIn ? (
            <Route path="/loggedin" element={<Home />} />
          ) : (
            <Route path="/loggedin" element={<Unauthorized />} />
          )}
          {loggedIn ? (
            <Route path="/league/create" element={<CreateLeague />} />
          ) : (
            <Route path="/league/create" element={<Unauthorized />} />
          )}
          {loggedIn ? (
            <Route path="/league/search" element={<SearchLeague />} />
          ) : (
            <Route path="/league/search" element={<Unauthorized />} />
          )}
          {loggedIn ? (
            <Route path="/league/:id" element={<League />} />
          ) : (
            <Route path="/league/:id" element={<Unauthorized />} />
          )}
        </Routes>
      </main>
    </div>
  );
}

export default App;
