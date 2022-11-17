import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
import "./User.css";
import { useNavigate } from "react-router-dom";

function User(props) {
  const iconCollection = [
    { name: "Crown", item: <Crown className="userIcon" /> },
    { name: "Amazon", item: <Amazon className="userIcon" /> },
    { name: "Apple", item: <Apple className="userIcon" /> },
    { name: "Google", item: <Google className="userIcon" /> },
    { name: "Ibm", item: <Ibm className="userIcon" /> },
    { name: "Intel", item: <Intel className="userIcon" /> },
    { name: "Meta", item: <Meta className="userIcon" /> },
    { name: "Microsoft", item: <Microsoft className="userIcon" /> },
    { name: "Nvidia", item: <Nvidia className="userIcon" /> },
    { name: "Tesla", item: <Tesla className="userIcon" /> },
  ];

  const { id } = useParams();
  const [user, setUser] = useState();
  const [show, setShow] = useState(false);

  const navigate = useNavigate();

  useEffect((event) => {
    axios
      .get(`/register/${id}`)
      .then((response) => {
        if (!response.data.success) {
          navigate(`/friends`);
        }
        setUser(response.data._doc);
        setShow(true);
      })
      .catch((error) => {
        setShow(false);
        console.log(error);
      });
  }, []);

  const addFriend = () => {
    axios.patch("/register/addfriend", {
      friendcode: id,
    });
    navigate(`/friends`);
  };

  return (
    <div>
      {show && (
        <div>
          <div className="userPic">
            <img src={user.photo} referrerPolicy="no-referrer" alt="profile" />
          </div>

          <h1 className="userTitle">
            {iconCollection.find((ele) => ele.name === "Crown").item}
            {user.username}
          </h1>

          <h2 className="userIDstring">{`#${user._id}`}</h2>
          <p className="userBio">{user.bio}</p>

          <input
            className="addFriendBtn"
            type="button"
            value="Add Friend :)"
            onClick={addFriend}
          />
        </div>
      )}
    </div>
  );
}

export default User;
