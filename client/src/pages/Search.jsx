// pages/Search.js
import React, { useState, useEffect } from "react";
import "../app.css";
import icon_placeholder from "../assets/placeholderIcon.png";
import Icon47 from "../components/icons/Icon47";
import Icon48 from "../components/icons/Icon48";
import Icon49 from "../components/icons/Icon49";
import Icon50 from "../components/icons/Icon50";
import { ethnicityOptions } from "../data/fieldData";

// Direct API connection (current implementation)
const API_BASE_URL = 'http://localhost:7777';

/* Proxy Implementation (for future reference)
   To use Vite's proxy instead of direct API connection:
   1. Remove the API_BASE_URL constant
   2. Use relative URLs in fetch calls
   3. Ensure vite.config.js has proxy settings:
      server: {
        proxy: {
          '/api': {
            target: 'http://localhost:7777',
            changeOrigin: true,
            secure: false
          }
        }
      }
*/

const Search = () => {
  const [filters, setFilters] = useState({ ageRange: "", location: "", ethnicity: "" });
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const queryParams = new URLSearchParams(filters).toString();
      console.log('Fetching profiles with params:', queryParams);
      
      const response = await fetch(`${API_BASE_URL}/api/user/search?${queryParams}`, {
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
      console.log('Received profiles:', data);
      setProfiles(data);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="search-container">
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
            <button className="more-filters-btn">
              More Filters
              <Icon49 width={30} height={30} className="filter-icon" />
            </button>
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
      {!loading && !error && profiles.length > 0 && (
        <div className="profiles-grid">
          {profiles.map((profile) => (
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
                <h3 className="profile-name">{profile.name}</h3>
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
                  <button className="view-bio">View Bio</button>
                  <Icon50 width={32} height={32} className="premium-icon" color="#1e5a8d" />
                </div>
                <button className="request-match">Request Match</button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {profiles.length > 0 && (
        <div className="pagination">
          <button className="next-page">Next Page</button>
        </div>
      )}
    </div>
  );
};

export default Search;