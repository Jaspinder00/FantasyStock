import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./LeagueCenter.css";

function LeagueCenter() {
  const [leagues, setLeagues] = useState({});
  const [show, setShow] = useState(false);

  useEffect((event) => {
    axios
      .get(`/register/view/leagues`)
      .then((response) => {
        // console.log(response.data);
        setLeagues(response.data);
        setShow(true);
      })
      .catch((error) => {
        setShow(false);
      });
  }, []);

  return (
    <div className="LeagueCenterMain">
      <div className="LeagueCenterLeagues">
        <h1 className="LeagueCenterLeaguesHeader">Active Leagues</h1>
        {show &&
          leagues.activeLeagues.map((league, index) => (
            <Link
              className="aLeagueCenterLeagueLink"
              to={`/league/${league._id}`}
              key={index}
            >
              <div key={index} className="LeagueCenterLeague">
                <div className="aLeagueCenterLeague">{league.title}</div>
              </div>
            </Link>
          ))}
      </div>

      <div className="LeagueCenterLeagues">
        <h1 className="LeagueCenterLeaguesHeader">Passed Leagues</h1>
        {show &&
          leagues.passedLeagues.map((league, index) => (
            <Link
              className="aLeagueCenterLeagueLink"
              to={`/league/${league._id}`}
              key={index}
            >
              <div className="LeagueCenterLeague">
                <div className="aLeagueCenterLeague">{league.title}</div>
              </div>
            </Link>
          ))}
      </div>
    </div>
  );
}

export default LeagueCenter;
