import "../../App.css";
// import stockData from "./items.json";

import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Stock Management App v0.1v2</h1>
        <div className="add-buttons-group">
          <Link to="/do-stock">
            <button className="do-stock-button">Do Stock</button>
          </Link>
          <Link to="/edit-items">
            <button className="edit-items-button">Edit Items</button>
          </Link>
          <Link to="/ble-test">
            <button className="edit-items-button">BLE Test</button>
          </Link>
        </div>
      </header>
    </div>
  );
};

export default Home;
