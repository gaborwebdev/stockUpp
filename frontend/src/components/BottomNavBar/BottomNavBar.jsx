import "./style.css";
import {
  MdHome,
  MdSearch,
  MdAddCircle,
  MdOutlineFolderOpen,
  MdSettings,
  MdBluetooth,
} from "react-icons/md";

import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const BottomNavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [itemWidth, setItemWidth] = useState(0);
  const navRef = useRef(null);

  /** NAV ITEMS (PATH + ICON) */
  const items = [
    { icon: <MdSettings />, label: "Settings", path: "/settings" },
    { icon: <MdOutlineFolderOpen />, label: "Search", path: "/search" },
    { icon: <MdHome />, label: "Home", path: "/" },
    { icon: <MdAddCircle />, label: "New Stock", path: "/do-stock" },
    { icon: <MdBluetooth />, label: "Bluetooth", path: "/ble-test" },
  ];

  /** FIND ACTIVE INDEX BASED ON CURRENT ROUTE */
  const activeIndex = items.findIndex((i) => i.path === location.pathname);

  /** ITEM WIDTH */
  useEffect(() => {
    if (navRef.current) {
      const width = navRef.current.offsetWidth;
      setItemWidth(width / items.length);
    }
  }, []);

  const highlightStyle = {
    width: "50px",
    height: "50px",
    transform: `translateX(${activeIndex * itemWidth + itemWidth / 2 - 25}px)`,
    transition: "transform 0.3s ease",
  };

  return (
    <div className="bottom-navbar-wrapper" ref={navRef}>
      <div className="active-bg" style={highlightStyle} />

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
