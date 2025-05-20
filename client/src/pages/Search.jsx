// pages/Search.js
import React, { useState, useEffect, useCallback, useRef } from "react";
import Icon47 from "../components/icons/Icon47";
import Icon48 from "../components/icons/Icon48";
import Icon49 from "../components/icons/Icon49";
import Icon50 from "../components/icons/Icon50";
import { ethnicityOptions, countries } from "../data/fieldData";
import MessageModal from "../components/modals/MessageModal";
import { useAuth } from "../components/contexts/AuthContext";
import Alert from "../components/Alert";
import { useAlert } from "../components/contexts/AlertContext";
import FilterModal from "../components/modals/FilterModal";
import { useSocket } from "../components/contexts/SocketContext";
import ProfileModal from "../components/modals/ProfileModal";
import { useDebouncedCallback } from "use-debounce";
import { useNavigate } from "react-router-dom";
import Select from "react-select";

function ProfileImage({ src, alt, fallback }) {
  const [errored, setErrored] = useState(false);

  // Only use fallback after the first error
  const imgSrc = errored ? fallback : src;

  return (
    <img
      src={imgSrc}
      alt={alt}
      onError={() => {
        if (!errored) {
          setErrored(true);
        }
      }}
      className="w-24 h-24 rounded-full object-cover"
      loading="lazy"
    />
  );
}

const Search = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null)
  const [remainingConnects, setRemainingConnects] = useState(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const { user } = useAuth()
  const { socket } = useSocket()
  const { showAlert, alert } = useAlert()
  const navigate = useNavigate()

  const initialFilters = {
    ageRange: "", 
    location: "", 
    ethnicity: "", 
    senderId: user?._id, 
    alreadyMatched: false,
    revert: "",
    salahPattern: "",
    occupation: "",
    maritalStatus: "",
    sect: "",
    quranMemorization: "",
    hasChildren: ""
  };

  const [filters, setFilters] = useState(initialFilters);
  const [pendingFilters, setPendingFilters] = useState(filters);
  const abortControllerRef = useRef(null);

  // Fetch remaining when modal opens
  useEffect(() => {
    if (!isOpen) return;
    fetchRemaining()
  }, [isOpen]);

  const fetchRemaining = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/match/remaining-requests/${user?.userId}`,
        { credentials: 'include' }
      );
      const { remaining } = await res.json();
      setRemainingConnects(remaining);
      return remaining;
    } catch {
      setRemainingConnects(0);
      return 0;
    }
  };

  const fetchProfiles = useCallback(async () => {
    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/search?${queryParams}`,
        {
          credentials: "include",
          headers: { Accept: "application/json" },
          signal: controller.signal,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      setProfiles(data);
    } catch (err) {
      // Only treat real errors; ignore aborts
      if (err.name !== "AbortError") {
        console.error("Fetch error:", err);
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Wrap fetchProfiles so that it only actually runs after 300 ms of silence
  const debouncedFetch = useDebouncedCallback(fetchProfiles, 300);

  const handleMatchRequest = async (profileId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/match/send-request`,
        {
          method: "POST",
          credentials: "include",
          headers: { 'Accept': 'application/json', "Content-Type": "application/json", },
          body: JSON.stringify({ sender_id: user?.userId, receiver_id: profileId })
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
    debouncedFetch();
    return () => {
      debouncedFetch.cancel();
      abortControllerRef.current?.abort();
    };
  }, [filters, debouncedFetch]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleViewBio = (profile) => {
    setSelectedProfileId(profile.id);
    setSelectedProfile(profile); // this will be used to get the image
    setIsProfileModalOpen(true);
  };

  // Determine if they're on basic
  const isBasic = user?.subscription?.status !== 'active';

  // Build the modal text
  const modalText = `You are about to submit a match request. Would you like to continue?`

  const countActiveFilters = () => {
    // Skip system-managed fields like senderId and alreadyMatched
    const systemFields = ['senderId', 'alreadyMatched'];
    return Object.entries(filters)
      .filter(([key, value]) => !systemFields.includes(key) && value !== "")
      .length;
  };

  // Filter profiles based on logged-in user gender
  // Assumption: Each profile has a 'gender' property.
  const visibleProfiles =
    user && user.gender
      ? profiles.filter(profile => profile.gender !== user.gender)
      : profiles;

  const fallbackUrl =
    user?.gender === "Male"
      ? "/icon_woman6.png"
      : "/icon_man5.png";

  // Helper function to get proper image URL
  const getProfileImageUrl = (profile) => {
    if (!profile.image) {
      return fallbackUrl;
    }

    // Handle avatar icons (SVG files)
    if (profile.image.includes('icon_') && profile.image.endsWith('.png')) {
      return `/${profile.image}`;
    }

    // Handle URLs that already have http/https
    if (profile.image.startsWith('http')) {
      return profile.image;
    }

    // Handle relative paths from uploads directory
    if (profile.image.startsWith('/uploads/')) {
      return `${import.meta.env.VITE_BACKEND_URL}${profile.image}`;
    }

    // Default case: prepend with backend URL if it's a relative path
    return `${import.meta.env.VITE_BACKEND_URL}/${profile.image}`;
  };

  const handleClearFilters = () => {
    // Keep system fields, clear everything else
    const clearedFilters = {
      ...initialFilters,
      senderId: filters.senderId,
      alreadyMatched: filters.alreadyMatched
    };
    setPendingFilters(clearedFilters);
    setFilters(clearedFilters);
    setIsFilterModalOpen(false);
  };

  const pinkSelectStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: '#FFF6FB',
      borderColor: '#d1d5db',
      color: '#E01D42',
      minHeight: '48px',
      borderRadius: '0.75rem',
      borderWidth: '2px',
      boxShadow: state.isFocused ? '0 0 0 0.5px #FFE1F3' : undefined,
      '&:hover': { borderColor: '#E01D42' }
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? '#E01D42'
        : state.isFocused
        ? '#FFE1F3'
        : '#FFF6FB',
      color: state.isSelected
        ? '#FFF'
        : '#4A0635',
      '&:hover': {
        backgroundColor: '#FFE1F3',
        color: '#4A0635',
      },
    }),
    multiValue: (base) => ({ ...base, backgroundColor: '#FFE1F3', borderRadius: '0.5rem' }),
    multiValueLabel: (base) => ({ ...base, color: '#4A0635', padding: '2px 8px' }),
    multiValueRemove: (base) => ({ ...base, color: '#E01D42', ':hover': { backgroundColor: '#E01D42', color: 'white' } }),
    menu: (base) => ({ ...base, zIndex: 9999 })
  };
  const blueSelectStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: '#F0F6FF',
      borderColor: '#d1d5db',
      color: '#1A495D',
      minHeight: '48px',
      borderRadius: '0.75rem',
      borderWidth: '2px',
      boxShadow: state.isFocused ? '0 0 0 0.5px #B3D8FF' : undefined,
      '&:hover': { borderColor: '#1A495D' }
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? '#1A495D'
        : state.isFocused
        ? '#B3D8FF'
        : '#F0F6FF',
      color: state.isSelected
        ? '#FFF'
        : '#1A495D',
      '&:hover': {
        backgroundColor: '#B3D8FF',
        color: '#1A495D',
      },
    }),
    multiValue: (base) => ({ ...base, backgroundColor: '#B3D8FF', borderRadius: '0.5rem' }),
    multiValueLabel: (base) => ({ ...base, color: '#1A495D', padding: '2px 8px' }),
    multiValueRemove: (base) => ({ ...base, color: '#1A495D', ':hover': { backgroundColor: '#1A495D', color: 'white' } }),
    menu: (base) => ({ ...base, zIndex: 9999 })
  };
  const genderSelectStyles = user?.gender?.toLowerCase() === 'female' ? pinkSelectStyles : blueSelectStyles;

  return (
    <div className="px-4 py-6 max-w-[1600px] mx-auto min-h-screen">
      {alert && <Alert />}

      <h1 className="text-left text-2xl font-bold mb-6">Search</h1>

      {/* Filters */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
          {/* Age Range */}
          <div className="flex flex-col flex-1">
            <label className="text-sm mb-1">Age Range</label>
            <div className="relative">
              <select
                name="ageRange"
                value={filters.ageRange}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none theme-bg"
              >
                <option value="">Select</option>
                <option value="18-25">18-25</option>
                <option value="26-35">26-35</option>
                <option value="36-45">36-45</option>
                <option value="46-55">46-55</option>
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">▼</span>
            </div>
          </div>

          {/* Location */}
          <div className="flex flex-col flex-1">
            <label className="text-sm mb-1">Location</label>
            <div className="relative">
              <select
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none theme-bg"
              >
                <option value="">Select</option>
                {countries.map(country => (
                  <option key={country.code} value={country.label}>
                    {country.label}
                  </option>
                ))}
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">▼</span>
            </div>
          </div>

          {/* Ethnicity */}
          <div className="flex flex-col flex-1">
            <label className="text-sm mb-1">Ethnicity</label>
            <div className="relative">
              <Select
                isMulti
                name="ethnicity"
                value={filters.ethnicity ? filters.ethnicity.map(eth => ({ value: eth, label: eth })) : null}
                onChange={(selectedOptions) => handleFilterChange({
                  target: {
                    name: 'ethnicity',
                    value: selectedOptions ? selectedOptions.map(option => option.value) : []
                  }
                })}
                options={ethnicityOptions}
                className="react-select-container"
                classNamePrefix="react-select"
                placeholder="Select ethnicities..."
                isSearchable={true}
                styles={genderSelectStyles}
              />
            </div>
          </div>

          {/* More Filters Button */}
          <div className="flex items-end">
            <button
              className="relative flex items-center gap-2 text-base px-3 py-2"
              onClick={() => {
                setPendingFilters({...filters}); // Reset pending filters to current filters
                if (!isBasic && user?.subscription.type === "platinum") setIsFilterModalOpen(true);
                else setIsUpgradeModalOpen(true)
              }
              }
            >
              More Filters
              {countActiveFilters() > 0 && (
                <span className="absolute -top-1 -right-2 bg-rose-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                  {countActiveFilters()}
                </span>
              )}
              <Icon49 width={24} height={24} className={'hover:bg-red-500'} />
            </button>
          </div>
        </div>
      </div>

      {/* State Displays */}
      {error && <div className="text-center p-4 text-red-500 bg-red-100 rounded mb-4">Error: {error}</div>}
      {loading && <div className="text-center p-4 text-gray-600">Loading profiles...</div>}
      {!loading && !error && profiles.length === 0 && (
        <div className="text-center p-6 text-gray-600 bg-gray-100 rounded mb-4">No profiles found matching your criteria</div>
      )}

      {/* Profiles */}
      {!loading && !error && visibleProfiles.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

          {visibleProfiles.map((profile) => {

            const locationCountry = countries.find(c => c.label === profile.location);
            const nationalityCountry = countries.find(c => c.label === profile.nationality);

            return (
              <div
                key={profile.id}
                className="relative flex flex-col sm:flex-row items-start sm:items-center rounded-lg p-4 theme-bg theme-border space-y-4 sm:space-y-0 sm:space-x-4"
              >
                {/* Age badge */}
                <div className="absolute left-4 -top-4 bg-white border-2 text-black w-9 h-9 flex items-center justify-center rounded-full font-bold text-sm">
                  {profile.age || 'N/A'}
                </div>

                {/* MOBILE: avatar + name & stacked subtext */}
                <div className="flex flex-col w-full sm:hidden">
                  <div className="flex items-center gap-4">
                    <ProfileImage
                      src={getProfileImageUrl(profile)}
                      alt="Profile"
                      fallback={fallbackUrl}
                    />
                    <h3 className="text-base font-semibold truncate flex-1">{profile.name}</h3>
                  </div>
                  <div className="mt-2 flex flex-col text-sm text-gray-600 space-y-1">
                    <div className="flex items-center gap-1 truncate">
                    {locationCountry?.code ? (
                      <img
                        src={`https://flagcdn.com/w40/${locationCountry.code.toLowerCase()}.png`}
                        alt={`${locationCountry.label} flag`}
                        width={20}
                        height={15}
                        className="rounded-sm"
                      />
                    ) : (
                      <span>🌍</span>
                    )}
                      <span className="truncate">
                        {typeof profile.location === 'object' 
                          ? `${profile.location.city || ''}${profile.location.city && profile.location.country ? ', ' : ''}${profile.location.country || ''}`
                          : profile.location || 'Location not specified'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 truncate">
                    {nationalityCountry?.code ? (
                      <img
                        src={`https://flagcdn.com/w40/${nationalityCountry.code.toLowerCase()}.png`}
                        alt={`${nationalityCountry.label} flag`}
                        width={20}
                        height={15}
                        className="rounded-sm"
                      />
                    ) : (
                      <span>🌐</span>
                    )}
                      <span className="truncate">{profile.nationality || 'Nationality not specified'}</span>
                    </div>
                  </div>
                </div>

                {/* DESKTOP (sm+): original avatar + center info */}
                <div className="hidden sm:flex flex-shrink-0">
                  <ProfileImage
                    src={getProfileImageUrl(profile)}
                    alt="Profile"
                    fallback={fallbackUrl}
                  />
                </div>
                <div className="hidden sm:flex flex-1 flex-col gap-1 min-w-0">
                  <h3 className="text-base font-semibold truncate">{profile.name}</h3>
                  <div className="flex items-center gap-2 text-sm truncate">
                    {locationCountry?.code ? (
                      <img
                        src={`https://flagcdn.com/w40/${locationCountry.code.toLowerCase()}.png`}
                        alt={`${locationCountry.label} flag`}
                        width={20}
                        height={15}
                        className="rounded-sm"
                      />
                    ) : (
                      <span>🌍</span>
                    )}
                    <span className="truncate">
                      {typeof profile.location === 'object' 
                        ? `${profile.location.city || ''}${profile.location.city && profile.location.country ? ', ' : ''}${profile.location.country || ''}`
                        : profile.location || 'Location not specified'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm truncate">
                    {nationalityCountry?.code ? (
                      <img
                        src={`https://flagcdn.com/w40/${nationalityCountry.code.toLowerCase()}.png`}
                        alt={`${nationalityCountry.label} flag`}
                        width={20}
                        height={15}
                        className="rounded-sm"
                      />
                    ) : (
                      <span>🌐</span>
                    )}
                    <span className="truncate">{profile.nationality || 'Nationality not specified'}</span>
                  </div>
                </div>

                {/* Actions (all sizes) */}
                <div className="flex flex-col items-start gap-2 w-full sm:w-auto">
                  {/* View Bio + Icon */}
                  <div className="flex items-center w-full sm:w-auto gap-2">
                    <button
                      onClick={() => handleViewBio(profile)}
                      className="flex-1 text-white text-sm px-3 py-1 rounded theme-btn text-center"
                    >
                      View Bio
                    </button>
                    <Icon50 width={20} height={20} color="#1e5a8d" />
                  </div>

                  {/* Request Match */}
                  <button
                    onClick={async () => {
                      setSelectedProfile(profile.id);
                      setIsOpen(true);
                    }}
                    disabled={profile.hasPendingRequest}
                    className={`
      text-white text-sm px-3 py-1 rounded w-full sm:w-[130px]
      ${profile.hasPendingRequest
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'theme-btn'
                      }
    `}
                  >
                    {profile.hasPendingRequest ? 'Pending...' : 'Request Match'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userId={selectedProfileId}
        photoUrl={selectedProfile ? getProfileImageUrl(selectedProfile) : fallbackUrl}
      />

      {/* Filter Modal */}
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
        onApply={() => {
          setFilters(pendingFilters);
          setIsFilterModalOpen(false);
          debouncedFetch();
        }}
        onClear={handleClearFilters}
      />

      {/* Upgrade Prompt Modal */}
      <MessageModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        title="Restricted Feature!"
        text="Upgrade to a Gold or Platinum plan to use this feature."
        onConfirm={() => {
          // send them to /subscribe
          navigate('/subscribe');
        }}
        confirmText="View Pricing"
      />

      {/* Message Modal */}
      <MessageModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Match Request Confirmation"
        onConfirm={() => {
          handleMatchRequest(selectedProfile);
          setIsOpen(false);
        }}
        text={modalText}
      />
    </div>
  );
};

export default Search;