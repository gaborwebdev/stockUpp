import { useState } from "react";

const CountPopUp = ({
  itemName,
  maxCount,
  step = 1,
  onConfirm,
  onClose,
}) => {
  const [selectedButton, setSelectedButton] = useState(null);

  // Generate buttons based on step value
  const buttons = [];
  for (let i = step; i <= maxCount; i += step) {
    buttons.push(i.toFixed(step < 1 ? 1 : 0));
  }

  const handleSelectNumber = (num) => {
    setSelectedButton(num);
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
