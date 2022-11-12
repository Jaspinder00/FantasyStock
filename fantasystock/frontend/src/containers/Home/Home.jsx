import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Home.css";

function Home() {
  const [articles, setArticles] = useState([]);

  useEffect((event) => {
    axios
      .get(`/news`)
      .then((response) => {
        setArticles(response.data);
        // console.log(response.data);
      })
      .catch((error) => {});
  }, []);

  return (
    <div className="homePage">
      {articles.map((article, index) => (
        <div className="articleCard" key={`uniqueId${index}`}>
          <img
            className="articleCardImage"
            src={article.urlToImage}
            alt="Article"
          />{" "}
          {article.title}
        </div>
      ))}
    </div>
  );
}

export default Home;
