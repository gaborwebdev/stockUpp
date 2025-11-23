// src/hooks/useModals.js
import { useState } from "react";

export default function useModals() {
  // Normal count popup
  const [popupOpen, setPopupOpen] = useState(false);
  const openPopup = () => setPopupOpen(true);
  const closePopup = () => setPopupOpen(false);

  // BLE popup
  const [blePopupOpen, setBlePopupOpen] = useState(false);
  const openBlePopup = () => setBlePopupOpen(true);
  const closeBlePopup = () => setBlePopupOpen(false);

  // Debug popup
  const [debugPopupOpen, setDebugPopupOpen] = useState(false);

  return {
    popupOpen,
    openPopup,
    closePopup,

    blePopupOpen,
    openBlePopup,
    closeBlePopup,

    debugPopupOpen,
    setDebugPopupOpen,
  };
}
