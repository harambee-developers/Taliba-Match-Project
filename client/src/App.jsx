import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Subscription from "./pages/Subscription";
import LandingPage from "./pages/LandingPage";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";

function App() {
  return (
    <BrowserRouter>
      <>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />{" "}
          {/* Default route set to LandingPage */}
          <Route path="/register" element={<Register />} />{" "}
          <Route path="/subscribe" element={<Subscription />} />{" "}
          <Route path="/admin" element={<AdminLogin />} />{" "}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />{" "}
        </Routes>
      </>
    </BrowserRouter>
  );
}

export default App;
