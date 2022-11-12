import React, { useEffect, useState } from "react";
import axios from "axios";
import "./SearchLeague.css";
import { Link } from "react-router-dom";

function SearchLeague() {
  const [results, setResults] = useState([]);

  useEffect((event) => {
    axios
      .get(`/league/search?page=1`)
      .then((response) => {
        setResults(response.data);
      })
      .catch((error) => console.log(error));
  }, []);

  return (
    <div className="searchResultContainer">
      {results.map((league, index) => {
        return (
          <Link
            className="searchResult"
            key={index}
            to={`/league/${league._id}`}
          >
            <div className="searchResultTitle">{league.title}</div>
            <div className="searchResultHost">{`Host: ${league.host}`}</div>
          </Link>
        );
      })}
    </div>
  );
}

export default SearchLeague;
