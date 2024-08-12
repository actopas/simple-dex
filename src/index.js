/*
 * @Describle:
 * @Author: actopas <fishmooger@gmail.com>
 * @Date: 2024-08-11 16:42:24
 * @LastEditors: actopas
 * @LastEditTime: 2024-08-11 22:55:11
 */
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
