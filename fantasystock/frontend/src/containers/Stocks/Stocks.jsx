import React, { useMemo, useState } from "react";
import axios from "axios";
import SkeletonElement from "./SkeletonElement";
import "./Stocks.css";

function Stock(props) {
  const [data, setData] = useState([]);
  const [show, setShow] = useState(false);
  const skeleArrSize = 100;
  const skeleArr = [...Array(skeleArrSize)];

  useMemo((event) => {
    axios
      .get("/price")
      .then((response) => {
        response.data.map((ele, index) =>
          setData((oldArr) => [...oldArr, ele])
        );
      })
      .then(() => {
        setShow(true);
      })
      .catch((error) => {
        console.log(error.response.data);
        setShow(false);
      });
  }, []);

  return (
    <div>
      {
        <div>
          {show
            ? data.map((ele, index) => (
                <div className="stockCard" key={`uniqueId${index}`}>
                  <h1>{String(ele.ticker)}</h1>
                  <h2>{String(ele.name)}</h2>
                  <h2>{String(ele.sector)}</h2>
                  <h2>{String(ele.price)}</h2>
                </div>
              ))
            : skeleArr.map((ele, index) => (
                <div key={`uniqueId${index}`}>
                  <SkeletonElement type="div" />
                </div>
              ))}
        </div>
      }
    </div>
  );
}

export default Stock;
