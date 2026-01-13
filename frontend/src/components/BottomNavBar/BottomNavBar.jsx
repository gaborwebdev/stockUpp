import "./style.css";
import {
  MdHome,
  MdSearch,
  MdAddCircle,
  MdOutlineFolderOpen,
  MdSettings,
  MdBluetooth,
} from "react-icons/md";
import { RiListSettingsLine } from "react-icons/ri";
import { PiListMagnifyingGlassBold } from "react-icons/pi";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useBle } from "../../context/BleContext";

const BottomNavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [ready, setReady] = useState(false);
  const [transitionEnabled, setTransitionEnabled] = useState(false);
  const [itemWidth, setItemWidth] = useState(0);
  const navRef = useRef(null);

  const { status } = useBle();
  const bleColor =
    status === "connected"
      ? "#4caf50" // zöld
      : status === "connecting"
      ? "#ff9800" // narancs
      : "#f44336"; // piros (disconnected / error)

  /** NAV ITEMS (PATH + ICON) */
  const items = [
    { icon: <MdSettings />, label: "Settings", path: "/settings" },
    { icon: <PiListMagnifyingGlassBold />, label: "Search", path: "/search" },
    { icon: <MdHome />, label: "Home", path: "/" },
    { icon: <MdOutlineFolderOpen />, label: "New Stock", path: "/do-stock" },
    {
      icon: <MdBluetooth style={{ color: bleColor }} />,
      label: "Bluetooth",
      path: "/ble",
    },
  ];

  /** FIND ACTIVE INDEX BASED ON CURRENT ROUTE */
  let activeIndex = items.findIndex((i) => i.path === location.pathname);
  if (activeIndex === -1) activeIndex = 0;

  /** ITEM WIDTH */
  useLayoutEffect(() => {
    if (navRef.current) {
      requestAnimationFrame(() => {
        const width = navRef.current.offsetWidth;
        setItemWidth(width / items.length);
      });
    }
  }, []);

  useEffect(() => {
    if (itemWidth > 0) {
      requestAnimationFrame(() => setReady(true));
    }
  }, [itemWidth]);

  /** ANIMATION CORRECTION*/
  useEffect(() => {
    if (itemWidth > 0) {
      const t = setTimeout(() => setTransitionEnabled(true), 50);
      return () => clearTimeout(t);
    }
  }, [itemWidth]);

  const highlightStyle = {
    width: "50px",
    height: "50px",
    transform: `translateX(${activeIndex * itemWidth + itemWidth / 2 - 25}px)`,
    transition: transitionEnabled ? "transform 0.35s ease" : "none",
  };

  return (
    <div className="bottom-navbar-wrapper" ref={navRef}>
      <div
        className={`active-bg ${ready ? "" : "hidden"}`}
        style={highlightStyle}
      />

      {items.map((item, index) => (
        <div
          key={index}
          className={`nav-item ${index === activeIndex ? "active" : ""}`}
          onClick={() => navigate(item.path)}
        >
          {item.icon}
        </div>
      ))}
    </div>
  );
};

export default BottomNavBar;
