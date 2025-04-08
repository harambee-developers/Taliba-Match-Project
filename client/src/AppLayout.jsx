import React from "react";
import { Routes, Route, useLocation, Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import Subscription from "./pages/Subscription";
import LandingPage from "./pages/LandingPage";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import RegisterSuccess from "./pages/RegisterSuccess";
import ChatApp from "./components/ChatApp";
import Match from "./pages/Match";
import PendingMatches from "./pages/PendingMatches";
import Profile from "./pages/Profile";
import Search from "./pages/Search";
import Library from "./pages/Library";
import OnlineUserNotification from "./components/OnlineUserNotification";
import MessageNotification from "./components/MessageNotification";
import { ChatEventsProvider } from "./components/contexts/ChatEventsContext";

function ChatLayout() {
  // Wrap only the chat-related routes in ChatEventsProvider
  return (
    <ChatEventsProvider>
      <Outlet />
    </ChatEventsProvider>
  );
}

function AppLayout() {
  const location = useLocation(); // Get current route

  // Hide navbar if the user is in the chat page
  const hideNavbar = location.pathname.startsWith("/chat");

  return (
    <>
      {!hideNavbar && <Navbar />} {/* Conditionally render Navbar */}
      <OnlineUserNotification />
      <MessageNotification />

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/subscribe" element={<Subscription />} />
        <Route path="/register-success" element={<RegisterSuccess />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/pending-matches" element={<PendingMatches />} />
        <Route element={<ChatLayout/>}>
          <Route path="/chat/:conversationId" element={<ChatApp />} />
          <Route path="/matches" element={<Match />} />
        </Route>
        <Route path="/profile" element={<Profile />} />
        <Route path="/search" element={<Search />} />
        <Route path="/library" element={<Library />} />
      </Routes>
    </>
  );
}

export default AppLayout;
