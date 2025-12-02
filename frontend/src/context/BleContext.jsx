// src/context/BleContext.jsx
import React, { createContext, useContext } from "react";
import useBleMeasure from "../hooks/useBleMeasure";

const BleContext = createContext(null);

export const BleProvider = ({ children }) => {
  const ble = useBleMeasure();

  // csak a BLE állapot és műveletek
  const value = {
    status: ble.status, // idle | connecting | connected | error
    deviceName: ble.deviceName,
    error: ble.error,
    raw: ble.raw,
    net: ble.net,
    cl: ble.cl,
    connect: ble.connect,
    disconnect: ble.disconnect,
  };

  return <BleContext.Provider value={value}>{children}</BleContext.Provider>;
};

export const useBle = () => {
  const ctx = useContext(BleContext);
  if (!ctx) throw new Error("useBle must be used inside a BleProvider");
  return ctx;
};
