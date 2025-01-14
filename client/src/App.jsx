import React from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Subscription from "./pages/Subscription";
import LandingPage from "./pages/LandingPage";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";
import LandingNavbar from "./components/LandingNavbar"; // Import LandingNavbar

function App() {
  // Custom component to switch navbars based on the route
  const Layout = ({ children }) => {
    const location = useLocation();

    // Conditional rendering of Navbar
    const isLandingPage = location.pathname === "/";

    return (
      <>
        {isLandingPage ? <LandingNavbar /> : <Navbar />}
        {children}
      </>
    );
  };

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} /> {/* Landing Page */}
          <Route path="/register" element={<Register />} /> {/* Register */}
          <Route path="/subscribe" element={<Subscription />} /> {/* Subscription */}
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
