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
    <div className="StockPricesContainer">
      {
        <table id="StockPrices">
          <tbody>
            {show
              ? data.map((ele, index) => (
                  <tr className="StockPriceRow" key={index}>
                    <td className="StockPriceTicker">{String(ele.ticker)}</td>
                    <td className="StockPriceName">{String(ele.name)}</td>
                    <td className="StockPriceSector">{String(ele.sector)}</td>
                    <td className="StockPricePrice">{String(ele.price)}</td>
                  </tr>
                ))
              : skeleArr.map((ele, index) => (
                  <tr key={`uniqueId${index}`}>
                    <td>
                      <SkeletonElement type="trThing" />
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      }
    </div>
  );
}

export default Stock;
