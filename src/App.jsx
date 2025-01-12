import React from "react";
import FormCurrency from "./components/FormCurrency";

const App = () => {
  const apiUrl = "https://interview.switcheo.com/prices.json"; // Replace with your actual API endpoint

  return (
    <div className="center-container green-border-color">
      <h1>Currency Converter</h1>
      <FormCurrency apiUrl={apiUrl} />
    </div>
  );
};

export default App;
