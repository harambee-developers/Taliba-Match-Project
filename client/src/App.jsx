import React from "react";
<<<<<<< HEAD
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Subscription from "./pages/Subscription";
import LandingPage from "./pages/LandingPage";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import RegisterSuccess from "./pages/RegisterSuccess";

function App() {
  // Custom component to switch navbars based on the route

  return (
    <BrowserRouter>
      <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} /> {/* Landing Page */}
          <Route path="/register" element={<Register />} /> {/* Register */}
          <Route path="/subscribe" element={<Subscription />} /> {/* Subscription */}
          <Route path="/register-success" element={<RegisterSuccess />} /> {/* Subscription */}
          <Route path="/admin" element={<AdminLogin />} />{" "}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />{" "}
        </Routes>
=======
import { BrowserRouter} from "react-router-dom";
import AppLayout from "./AppLayout";

function App() {

  return (
    <BrowserRouter>
      <AppLayout/>
>>>>>>> UAT
    </BrowserRouter>
  );
}

export default App;
