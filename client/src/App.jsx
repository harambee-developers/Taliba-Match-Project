import React from "react";
import "./app.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Subscription from "./pages/Subscription";
import LandingPage from "./pages/LandingPage";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import RegisterSuccess from "./pages/RegisterSuccess";
import Profile from "./pages/Profile";
import ViewProfile from "./pages/ViewProfile";
import Matches from "./pages/Matches";
import Search from "./pages/Search";
import Library from "./pages/Library";
import axios from "axios";

function App() {
  
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/subscribe" element={<Subscription />} />
        <Route path="/register-success" element={<RegisterSuccess />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:userId" element={<ViewProfile />} />
        <Route path="/matches" element={<Matches />} />
        <Route path="/search" element={<Search />} />
        <Route path="/library" element={<Library />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
