import "./style.css";
import {
  MdHome,
  MdSearch,
  MdAddCircle,
  MdOutlineFolderOpen,
  MdSettings,
  MdBluetooth,
} from "react-icons/md";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const BottomNavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [ready, setReady] = useState(false);
  const [transitionEnabled, setTransitionEnabled] = useState(false);
  const [itemWidth, setItemWidth] = useState(0);
  const navRef = useRef(null);

  /** NAV ITEMS (PATH + ICON) */
  const items = [
    { icon: <MdSettings />, label: "Settings", path: "/settings" },
    { icon: <MdSearch />, label: "Search", path: "/search" },
    { icon: <MdHome />, label: "Home", path: "/" },
    { icon: <MdOutlineFolderOpen />, label: "New Stock", path: "/do-stock" },
    { icon: <MdBluetooth />, label: "Bluetooth", path: "/ble" },
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
