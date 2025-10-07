import "../../App.css";
import { Fragment } from "react";
import { Link } from "react-router-dom";
// import stockData from "../../items.json";
import stockData from "../../stockData.json";

const DoStock = () => {
  // let stockData = [];
  return (
    <div className="App do-stock">
      <div>
        <header className="add-buttons-group do-stock-header">
          <p>New stock</p>
          <Link to="/">
            <button className="add-buttons case">Go Back</button>
          </Link>
        </header>
        {stockData.map((item, index) => (
          <Fragment key={index}>
            <h3>Category: {item.category}</h3>
            {item.items.map((subItem, subIndex) => (
              <div className="row-in-stock" key={subIndex}>
                <div className="item-name-and-counted">
                  <div className="item-name">{subItem.itemName}</div>
                  <div className="counted-pieces">
                    <div className="title">Számolva:</div>
                    <div className="value">1 + 4 + 2 + 9 + 23</div>
                  </div>
                </div>
                <div className="left-side-group">
                  <div className="total-in-stock">
                    <div className="total-title">Total:</div>
                    <div className="total-value">{subItem.itemOnStock}</div>
                  </div>
                  <div className="add-buttons-group">
                    <button className="add-buttons bottle">Üveg</button>
                    <button className="add-buttons case">Rekesz</button>
                  </div>
                </div>
              </div>
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  );
};

export default DoStock;
