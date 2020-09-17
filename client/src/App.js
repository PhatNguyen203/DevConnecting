import React, { Fragment } from "react";
import Navigation from "./components/layout/Navigation";
import Landing from "./components/layout/Landing";
import "./App.css";

const App = () => {
  return (
    <Fragment>
      <Navigation />
      <Landing />
    </Fragment>
  );
};

export default App;
