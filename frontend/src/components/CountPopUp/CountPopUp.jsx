import { useState } from "react";

const CountPopUp = ({
  itemName,
  maxCount,
  multiplier,
  step = 1,
  onConfirm,
  onClose,
}) => {
  const [selectedButton, setSelectedButton] = useState(null);
  const [count, setCount] = useState(0);

  // Generate an array of numbers from 1 to maxCount
  const numbers = Array.from({ length: maxCount }, (_, i) => i + 1);

  // Generate buttons based on step value
  const buttons = [];
  for (let i = step; i <= maxCount; i += step) {
    buttons.push(i.toFixed(step < 1 ? 1 : 0));
  }
  // console.log("btns: ", buttons);

  console.log("CountPopUp props:", { maxCount, multiplier, onConfirm });

  const handleSelectNumber = (num) => {
    setSelectedButton(num);
    console.log("Selected number:", num);
  };

  return (
    <div className="popup-overlay">
      <div className="popup-inner">
        <h2>{itemName}</h2>
        <div className="number-grid">
          {buttons.map((num) => (
            <button
              key={num}
              className={
                selectedButton === num
                  ? "number-button selected"
                  : "number-button"
              }
              onClick={() => handleSelectNumber(num)}
            >
              {num}
            </button>
          ))}
        </div>
        {/* Felesleges már, talán cleanup!! */}
        {/*         <p>Max count: {maxCount}</p>
        <p>Multiplier: {multiplier}</p>
        <input type="number" min="0" max={maxCount} defaultValue="0" /> */}
        <div className="popup-buttons">
          <button
            className="confirm-button"
            onClick={() => {
              if (selectedButton) {
                onConfirm(Number(selectedButton));
              }
            }}
          >
            Confirm
          </button>
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CountPopUp;
