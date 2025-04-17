// pages/Search.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../app.css";
import icon_placeholder from "../assets/placeholderIcon.png";
import Icon47 from "../components/icons/Icon47";
import Icon48 from "../components/icons/Icon48";
import Icon49 from "../components/icons/Icon49";
import Icon50 from "../components/icons/Icon50";
import { ethnicityOptions } from "../data/fieldData";
import MessageModal from "../components/modals/MessageModal";
import { useAuth } from "../components/contexts/AuthContext";
import Alert from "../components/Alert";
import { useAlert } from "../components/contexts/AlertContext";
import FilterModal from "../components/modals/FilterModal";
import { useSocket } from "../components/contexts/SocketContext";

const Search = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate()

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null)

  const { user } = useAuth()
  const { socket } = useSocket()
  const { showAlert, alert } = useAlert()

  const [filters, setFilters] = useState({ ageRange: "", location: "", ethnicity: "", senderId: user?._id, alreadyMatched: false });
  const [pendingFilters, setPendingFilters] = useState(filters);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams(filters).toString();
      console.log('Fetching profiles with params:', queryParams);

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/search?${queryParams}`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.table('Received profiles:', data);

      setProfiles(data);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMatchRequest = async (profileId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/match/send-request`,
        {
          method: "POST",
          credentials: "include",
          headers: { 'Accept': 'application/json', "Content-Type": "application/json", },
          body: JSON.stringify({ sender_id: user.userId, receiver_id: profileId })
        }
      )
      if (!response.ok) {
        throw new Error("Failed to send match request");
      }

      const data = await response.json();

      const requestObject = {
        text: `${user.firstName} sent you a match request!`,
        type: "match",
        receiver_id: profileId,
        sender_id: user.userId
      }

      if (socket) {
        socket.emit("notification", requestObject);
      } else {
        console.warn("Socket is not connected, cannot send notification event.");
      }

      showAlert("Match request sent", 'success')
      console.log("Match request sent:", data);
    } catch (error) {
      showAlert("Error sending match request", 'error')
      console.error("Error sending match request:", error);
    }

  }

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleViewBio = (userId) => {
    console.log('Viewing profile with ID:', userId); // Debug log
    navigate(`/profile/${userId}`);
  };

  const countActiveFilters = () => {
    return Object.values(filters).filter(value => value !== "").length;
  };

  // Filter profiles based on logged-in user gender
  // Assumption: Each profile has a 'gender' property.
  const visibleProfiles =
    user && user.gender
      ? profiles.filter(profile => profile.gender !== user.gender)
      : profiles;

  console.log(profiles)
  
  return (
    <div className="search-container">
      {/* Render alert component */}
      {alert && <Alert />}
      <h1 className="search-title"></h1>

      {/* Filters */}
      <div className="filters-container">
        <div className="filter-row">
          <div className="filter-group">
            <label>Age Range</label>
            <div className="custom-select">
              <select name="ageRange" value={filters.ageRange} onChange={handleFilterChange}>
                <option value="">Select</option>
                <option value="18-25">18-25</option>
                <option value="26-35">26-35</option>
                <option value="36-45">36-45</option>
                <option value="46-55">46-55</option>
              </select>
              <span className="select-arrow">▼</span>
            </div>
          </div>

          <div className="filter-group">
            <label>Location</label>
            <div className="custom-select">
              <select name="location" value={filters.location} onChange={handleFilterChange}>
                <option value="">Select</option>
                <option value="London">London</option>
                <option value="Birmingham">Birmingham</option>
                <option value="Manchester">Manchester</option>
                <option value="Leeds">Leeds</option>
              </select>
              <span className="select-arrow">▼</span>
            </div>
          </div>

          <div className="filter-group">
            <label>Ethnicity</label>
            <div className="custom-select">
              <select name="ethnicity" value={filters.ethnicity} onChange={handleFilterChange}>
                <option value="">Select</option>
                {ethnicityOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <span className="select-arrow">▼</span>
            </div>
          </div>

          <div className="more-filters-container">
            <button className="more-filters-btn flex items-center gap-2 relative" onClick={() => setIsFilterModalOpen(true)}>
              More Filters
              {countActiveFilters() > 0 && (
                <span className="absolute -top-2 -right-2 bg-rose-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                  {countActiveFilters()}
                </span>
              )}
              <Icon49 width={30} height={30} className="filter-icon" />
            </button>
            <FilterModal
              isOpen={isFilterModalOpen}
              onClose={() => setIsFilterModalOpen(false)}
              filters={pendingFilters}
              onChange={(e) =>
                setPendingFilters((prev) => ({
                  ...prev,
                  [e.target.name]: e.target.value,
                }))
              }
              onApply={() => { setFilters(pendingFilters); fetchProfiles(); }}
            />
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && <div className="error">Error: {error}</div>}

      {/* Loading State */}
      {loading && <div className="loading">Loading profiles...</div>}

      {/* No Results State */}
      {!loading && !error && profiles.length === 0 && (
        <div className="no-results">No profiles found matching your criteria</div>
      )}

      {/* Profiles Grid */}
      {!loading && !error && visibleProfiles.length > 0 && (
        <div className="profiles-grid">
          {visibleProfiles.map((profile) => (
            <div key={profile.id} className="profile-card">
              <div className="age-badge">{profile.age || 'N/A'}</div>
              <div className="profile-left">
                <img
                  src={profile.image || icon_placeholder}
                  alt="Profile"
                  className="profile-icon"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = icon_placeholder;
                  }}
                />
              </div>

              <div className="profile-center">
                <h3 className="profile-name">{profile.firstName} {profile.lastName}</h3>
                <div className="profile-detail">
                  <Icon47 width={44} height={44} className="detail-icon" style={{ marginRight: '-6px' }} />
                  <span>{profile.location || 'Location not specified'}</span>
                </div>
                <div className="profile-detail">
                  <Icon48 width={44} height={44} className="detail-icon" style={{ marginRight: '-6px' }} />
                  <span>{profile.nationality || 'Nationality not specified'}</span>
                </div>
              </div>

              <div className="profile-right">
                <div className="bio-container">
                  <button 
                    className="view-bio"
                    onClick={() => handleViewBio(profile.id)}
                  >
                    View Bio
                  </button>
                  <Icon50 width={24} height={24} className="premium-icon" color="#1e5a8d" />
                </div>
                <button className="request-match" 
                onClick={() => { setIsOpen(true); setSelectedProfile(profile.id); }} 
                disabled={profile.hasPendingRequest}>
                {profile.hasPendingRequest ? "Pending...." : "Request Match"}
                </button>
                <MessageModal
                  isOpen={isOpen}
                  onClose={() => setIsOpen(false)}
                  title="Match Request Confirmation"
                  onConfirm={() => {
                    handleMatchRequest(selectedProfile)
                    setIsOpen(false);
                  }}
                  text="You are about to submit a match request. Would you like to continue?"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {visibleProfiles.length > 0 && (
        <div className="pagination">
          <button className="next-page">Next Page</button>
        </div>
      )}
    </div>
  );
};

export default Search;