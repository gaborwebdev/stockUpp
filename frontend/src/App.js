import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Pages
import DoStock from "./pages/DoStock/DoStock";
import Home from "./pages/Home/Home";

//import stockData from "./items.json";

function App() {
  console.log("hello");

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/do-stock" element={<DoStock />} />
      </Routes>
    </Router>
  );
}

export default App;
