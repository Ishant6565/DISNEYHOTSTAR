import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { Login, Header, Home, Detail } from "./components";

// App
const App = () => {
  return (
    <Router>
      {/* Header */}
      <Header />
      {/* Routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/detail/:id" element={<Detail />} />
      </Routes>
    </Router>
  );
};

export default App;
