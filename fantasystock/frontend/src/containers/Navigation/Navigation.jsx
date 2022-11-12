import React from "react";
import {
  faHouse,
  faUserGroup,
  faCog,
  faFootball,
  faShoppingCart,
  faAddressCard,
  faEnvelope,
  faChartColumn,
} from "@fortawesome/free-solid-svg-icons";
import LogoBtn from "../../components/LogoBtn/LogoBtn";
import SearchBar from "../../components/SearchBar/SearchBar";
import HamburgerToggle from "../../components/HamburgerToggle/HamburgerToggle";
import ClickableIcons from "../../components/ClickableIcons/ClickableIcons";
import LoginSet from "../../components/LoginSet/LoginSet";
import { useSelector, useDispatch } from "react-redux";
import { toggle as sidebarToggler } from "../../redux/sidebarState";
import "./Navigation.css";

function Navigation(props) {
  const sidebarToggle = useSelector((state) => state.sidebarState.value);
  const dispatch = useDispatch();

  return (
    <nav className="NavbarContainerContainer">
      <div className="NavbarContainer">
        <HamburgerToggle onClick={() => dispatch(sidebarToggler())} />
        <LogoBtn />
        <LoginSet />
        <SearchBar />
      </div>

      {sidebarToggle ? (
        <div className="VerticalNavbarContainer1">
          <ClickableIcons
            to="/"
            icon={faHouse}
            name="Home"
            design="VerticalNavbarIcons1"
          />
          <ClickableIcons
            to="/stocks"
            icon={faFootball}
            name="League"
            design="VerticalNavbarIcons1"
          />
          <ClickableIcons
            to="/stocks"
            icon={faChartColumn}
            design="VerticalNavbarIcons1"
            name="Prices"
          />
          <ClickableIcons
            to="/friends"
            icon={faUserGroup}
            name="Friends"
            design="VerticalNavbarIcons1"
          />
          <ClickableIcons
            to="/store"
            icon={faShoppingCart}
            name="Store"
            design="VerticalNavbarIcons1"
          />
          <ClickableIcons
            to="/profile"
            icon={faAddressCard}
            name="Profile"
            design="VerticalNavbarIcons1"
          />
          <ClickableIcons
            to="/messagecenter"
            icon={faEnvelope}
            name="Messages"
            design="VerticalNavbarIcons1"
          />
          <ClickableIcons
            to="/settings"
            icon={faCog}
            name="Settings"
            design="VerticalNavbarIcons1"
          />
        </div>
      ) : (
        <div className="VerticalNavbarContainer2">
          <ClickableIcons
            to="/"
            icon={faHouse}
            design="VerticalNavbarIcons2"
            hoverName="Home"
            hoverDesign="hovertextright"
          />
          <ClickableIcons
            to="/league"
            icon={faFootball}
            design="VerticalNavbarIcons2"
            hoverName="League"
            hoverDesign="hovertextright"
          />
          <ClickableIcons
            to="/stocks"
            icon={faChartColumn}
            design="VerticalNavbarIcons2"
            hoverName="Prices"
            hoverDesign="hovertextright"
          />
          <ClickableIcons
            to="/friends"
            icon={faUserGroup}
            design="VerticalNavbarIcons2"
            hoverName="Friends"
            hoverDesign="hovertextright"
          />

          <ClickableIcons
            to="/store"
            icon={faShoppingCart}
            design="VerticalNavbarIcons2"
            hoverName="Store"
            hoverDesign="hovertextright"
          />
          <ClickableIcons
            to="/profile"
            icon={faAddressCard}
            design="VerticalNavbarIcons2"
            hoverName="Profile"
            hoverDesign="hovertextright"
          />
          <ClickableIcons
            to="/messagecenter"
            icon={faEnvelope}
            design="VerticalNavbarIcons2"
            hoverName="Messages"
            hoverDesign="hovertextright"
          />
          <ClickableIcons
            to="/settings"
            icon={faCog}
            design="VerticalNavbarIcons2"
            hoverName="Settings"
            hoverDesign="hovertextright"
          />
        </div>
      )}
    </nav>
  );
}

export default Navigation;
