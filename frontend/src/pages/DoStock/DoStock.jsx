import "../../App.css";

import CountPopUp from "../../components/CountPopUp/CountPopUp";

import { Fragment, useState } from "react";
import { Link } from "react-router-dom";
// import stockData from "../../items.json";
import stockData from "../../updated.json";

const DoStock = () => {
  // let stockData = [];

  // minden itemName-hez egy objektumot csinálok,
  // amiben az üveg/pod/cl/L és case/csomag értékeket tárolom
  const [stockCounts, setStockCounts] = useState(() => {
    const initial = {};
    stockData.forEach((cat) => {
      cat.items.forEach((item) => {
        initial[item.itemName] = {};
      });
    });
    return initial;
  });

  // a popup megjelenítéséhez
  const [popupOpen, setPopupOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [currentType, setCurrentType] = useState(null);

  const handleConfirm = (count) => {
    // TESTING
    //console.log("Confirmed:", currentItem.itemName, currentType);
    //setPopupOpen(false);

    if (!currentItem || !currentType) return;

    setStockCounts((prev) => {
      const newCounts = { ...prev };

      // Ha az item még nincs az objektumban
      if (!newCounts[currentItem.itemName]) {
        newCounts[currentItem.itemName] = {};
      }

      // Ha az adott típushoz (pl. bottle) még nincs tömb
      if (!newCounts[currentItem.itemName][currentType]) {
        newCounts[currentItem.itemName][currentType] = [];
      }

      // Hozzáadjuk a kiválasztott számot
      newCounts[currentItem.itemName][currentType].push(count);

      return newCounts;
    });

    setPopupOpen(false);
  };

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
                    <div className="value">
                      {stockCounts[subItem.itemName] &&
                      Object.entries(stockCounts[subItem.itemName]).length >
                        0 ? (
                        Object.entries(stockCounts[subItem.itemName]).map(
                          ([type, values]) => (
                            <div key={type}>
                              <strong>{type}:</strong> {values.join(" + ")}
                            </div>
                          )
                        )
                      ) : (
                        <span>-</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="left-side-group">
                  <div className="total-in-stock">
                    <div className="total-title">Total:</div>
                    <div className="total-value">
                      {(() => {
                        const itemCounts = stockCounts[subItem.itemName];
                        if (!itemCounts) return subItem.itemOnStock || 0;

                        let total = 0;
                        for (const [type, counts] of Object.entries(
                          itemCounts
                        )) {
                          const multiplier =
                            subItem.measurementType[type]?.multiplier || 1;
                          const sum = counts.reduce((a, b) => a + b, 0);
                          total += sum * multiplier;
                        }

                        return total;
                      })()}
                    </div>
                  </div>
                  <div className="add-buttons-group">
                    {subItem.measurementType &&
                      Object.entries(subItem.measurementType).map(
                        ([type, config]) => (
                          <div key={type}>
                            <button
                              className="add-buttons bottle"
                              onClick={() => {
                                setCurrentItem(subItem);
                                setCurrentType(type);
                                setPopupOpen(true);
                              }}
                            >
                              {type}
                            </button>
                          </div>
                        )
                      )}

                    {/*                     <button
                      className="add-buttons bottle"
                      onClick={() => {
                        setCurrentItem(subItem);
                        setCurrentType("bottle");
                        setPopupOpen(true);
                      }}
                    >
                      Üveg
                    </button>
                    <button
                      className="add-buttons case"
                      onClick={() => {
                        setCurrentItem(subItem);
                        setCurrentType("crate");
                        setPopupOpen(true);
                      }}
                    >
                      Rekesz
                    </button> */}

                    {/*  */}
                  </div>
                </div>
              </div>
            ))}
          </Fragment>
        ))}
      </div>
      {popupOpen && currentItem && (
        <CountPopUp
          itemName={currentItem.itemName}
          maxCount={currentItem.measurementType[currentType].maxCount}
          multiplier={currentItem.measurementType[currentType].multiplier}
          step={currentItem.measurementType[currentType].step}
          onConfirm={handleConfirm}
          onClose={() => setPopupOpen(false)}
        />
      )}
    </div>
  );
};

export default DoStock;
