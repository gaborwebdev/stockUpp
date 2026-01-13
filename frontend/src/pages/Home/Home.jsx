import "../../App.css";
// import stockData from "./items.json";

import { Link } from "react-router-dom";
import BottomNavBar from "../../components/BottomNavBar/BottomNavBar";

const Home = () => {
  return (
    <div className="App">
      <BottomNavBar />
      <header className="App-header">
        <h1>StandikApp</h1>
        <div className="add-buttons-group">
          <Link to="/edit-items">
            <button className="edit-items-button">Edit Items</button>
          </Link>
        </div>
        <div className="color-test">
          <div className="row">
            <div className="color one">
              custom-bgc
              <div className="text colors">
                <p className="text-primary">Text: Primary</p>
                <p className="text-secondary">Text: Secondary</p>
                <p className="text-tertiary">Text: Tertiary</p>
              </div>
            </div>
            <div className="color primary">
              color Primary
              <div className="text colors">
                <p className="text-primary">Text: Primary</p>
                <p className="text-secondary">Text: Secondary</p>
                <p className="text-tertiary">Text: Tertiary</p>
              </div>
            </div>
            <div className="color primary-dark">
              color Primary Dark
              <div className="text colors">
                <p className="text-primary">Text: Primary</p>
                <p className="text-secondary">Text: Secondary</p>
                <p className="text-tertiary">Text: Tertiary</p>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="color two">
              custom-surf/card
              <div className="text colors">
                <p className="text-primary">Text: Primary</p>
                <p className="text-secondary">Text: Secondary</p>
                <p className="text-tertiary">Text: Tertiary</p>
              </div>
            </div>
            <div className="color secondary">
              color Secondary
              <div className="text colors">
                <p className="text-primary">Text: Primary</p>
                <p className="text-secondary">Text: Secondary</p>
                <p className="text-tertiary">Text: Tertiary</p>
              </div>
            </div>
            <div className="color secondary-dark">
              color Secondary Dark
              <div className="text colors">
                <p className="text-primary">Text: Primary</p>
                <p className="text-secondary">Text: Secondary</p>
                <p className="text-tertiary">Text: Tertiary</p>
              </div>
            </div>
          </div>
          <div className="color navbar-test">
            navbar test
            <div className="nav-wrapper">
              <div className="color nav-active">NAV AcTiVe</div>
              <div className="color nav-inactive">NAV InACTIVE</div>
            </div>
          </div>
        </div>
      </header>
      <BottomNavBar />
    </div>
  );
};

export default Home;
