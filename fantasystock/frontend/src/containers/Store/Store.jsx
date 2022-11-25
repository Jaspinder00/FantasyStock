import React, { useMemo, useState } from "react";
import axios from "axios";
import { ReactComponent as Crown } from "../../assets/crown.svg";
import { ReactComponent as Amazon } from "../../assets/amazon.svg";
import { ReactComponent as Apple } from "../../assets/apple.svg";
import { ReactComponent as Google } from "../../assets/google.svg";
import { ReactComponent as Ibm } from "../../assets/ibm.svg";
import { ReactComponent as Intel } from "../../assets/intel.svg";
import { ReactComponent as Meta } from "../../assets/meta.svg";
import { ReactComponent as Microsoft } from "../../assets/microsoft.svg";
import { ReactComponent as Nvidia } from "../../assets/nvidia.svg";
import { ReactComponent as Tesla } from "../../assets/tesla.svg";
import "./Store.css";

function Store() {
  const iconCollection = [
    { name: "crown", item: <Crown className="iconShow" /> },
    { name: "amazon", item: <Amazon className="iconShow" /> },
    { name: "apple", item: <Apple className="iconShow" /> },
    { name: "google", item: <Google className="iconShow" /> },
    { name: "ibm", item: <Ibm className="iconShow" /> },
    { name: "intel", item: <Intel className="iconShow" /> },
    { name: "meta", item: <Meta className="iconShow" /> },
    { name: "microsoft", item: <Microsoft className="iconShow" /> },
    { name: "nvidia", item: <Nvidia className="iconShow" /> },
    { name: "tesla", item: <Tesla className="iconShow" /> },
  ];

  const [data, setData] = useState([]);
  const [currency, setCurrency] = useState("");
  const [currencyMsg, setCurrencyMsg] = useState("");
  const [show, setShow] = useState(false);

  const updateStore = () => {
    axios
      .get("/store")
      .then((response) => {
        // console.log(response.data);
        setData(response.data.yourInv);
        setCurrency(response.data.currency);
        setCurrencyMsg(response.data.currency);
      })
      .then(() => {
        setShow(true);
      })
      .catch((error) => {
        console.log(error.response.data);
        setShow(false);
      });
  };

  useMemo((event) => {
    updateStore();
  }, []);

  return (
    <>
      <div className="storeCurrency">
        Currency:{" "}
        <span style={{ color: currency !== currencyMsg && "orange" }}>
          {currencyMsg}
        </span>
      </div>
      <div className="iconContainer">
        {data.map((data, index) => (
          <div className="iconCard" key={`uniqueId${index}`}>
            {iconCollection.find((ele) => ele.name === data.name).item}
            <div className="iconName">{data.name}</div>
            <div className="iconPrice">{data.price}</div>
            <input
              type="button"
              value="Buy"
              className="iconBuy"
              onMouseOver={() => {
                setCurrencyMsg(`${currency - data.price}`);
              }}
              onMouseLeave={() => {
                setCurrencyMsg(currency);
              }}
              onClick={() => {
                // console.log(data.name);

                axios
                  .patch("/store/buy", {
                    item: data.name,
                  })
                  .then((e) => {
                    updateStore();
                  });
              }}
            />
          </div>
        ))}
      </div>
    </>
  );
}
export default Store;
