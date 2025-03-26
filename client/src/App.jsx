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
import ChatApp from "./components/ChatApp";
import Match from "./components/Match";
import PendingMatches from "./components/PendingMatches";
import Profile from "./pages/Profile";
import Matches from "./pages/Matches";
import Search from "./pages/Search";
import Library from "./pages/Library";

function App() {

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
        <Route path="/chat/:conversationId" element={<ChatApp />} />{" "}
        <Route path="/matches" element={<Match />} />{" "}
        <Route path="/pending-matches" element={<PendingMatches />} />{" "}
        <Route path="/profile" element={<Profile />} />
        <Route path="/search" element={<Search />} />
        <Route path="/library" element={<Library />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
