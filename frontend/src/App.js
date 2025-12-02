import "./variables.css";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Pages
import Home from "./pages/Home/Home";
import Search from "./pages/Search/Search";
import DoStock from "./pages/DoStock/DoStock";
import Settings from "./pages/Settings/Settings";
import Ble from "./pages/Ble/Ble";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/search" element={<Search />} />
        <Route path="/do-stock" element={<DoStock />} />
        <Route path="/ble" element={<Ble />} />
      </Routes>
    </Router>
  );
}

export default App;
