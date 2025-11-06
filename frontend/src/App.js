import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Pages
import DoStock from "./pages/DoStock/DoStock";
import Home from "./pages/Home/Home";
import BleTest from "./pages/BLEMeasurePopUp/BleMeasurePopup";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/do-stock" element={<DoStock />} />
        <Route path="/ble-test" element={<BleTest />} />

      </Routes>
    </Router>
  );
}

export default App;
