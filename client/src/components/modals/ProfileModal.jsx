import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  salahPatternOptions,
  madhabOptions,
  sectOptions,
  ethnicityOptions,
  quranMemorizationOptions,
  dressStyleOptions,
  polygamyOptions
} from "../../data/fieldData";

const ProfileModal = ({ isOpen, onClose, userId, photoUrl }) => {
  const [currentCard, setCurrentCard] = useState(0);
  const [profileData, setProfileData] = useState({
    // Card 1 - Personal Details
    firstName: "",
    lastName: "",
    ethnicity: "",
    nationality: "",
    language: [],

    // Card 2 - About Yourself
    bio: "",
    personality: "",
    dealBreakers: "",

    // Card 3 - Your Faith
    sect: "",
    madhab: "",
    salahPattern: "",
    quranMemorization: "",
    dressingStyle: "",
    openToPolygamy: "",
    islamicAmbitions: "",
    islamicBooks: "",

    // Card 4 - Life Situation
    children: "",
    occupation: "",
    location: "",
    openToHijrah: "",
    hijrahDestination: "",
    maritalStatus: "",
    revert: "",

    // Card 5 - Appearance
    weight: "",
    height: "",
    appearancePreference: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!userId || userId === 'undefined' || !isOpen) {
          return;
        }

        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/user/profile/${userId}`, {
          withCredentials: true
        });
        setProfileData(response.data);
        setLoading(false);
      } catch (err) {
        if (err.response?.status === 404) {
          setError("Profile not found");
        } else if (err.response?.status === 400) {
          setError(err.response.data.message || "Invalid profile ID");
        } else {
          setError("Failed to load profile. Please try again.");
          console.error("Error loading profile:", err);
        }
        setLoading(false);
      }
    };

    if (isOpen) {
      setCurrentCard(0);
      fetchProfile();
    }
  }, [userId, isOpen]);

  const nextCard = () => {
    setCurrentCard((prev) => Math.min(prev + 1, 4));
  };

  const prevCard = () => {
    setCurrentCard((prev) => Math.max(prev - 1, 0));
  };

  const cardTitles = [
    "Personal Details",
    "About Yourself",
    "Your Faith",
    "Life Situation",
    "Appearance"
  ];

  console.log(profileData)

  const renderCardContent = () => {
    const viewClasses = "p-4 theme-bg rounded-xl";

    switch (currentCard) {
      case 0:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profile Image and Name */}
            <div className="flex items-center space-x-4">
              <div className="w-32 h-32 rounded-full overflow-hidden theme-border">
                <img
                  src={photoUrl}
                  alt={`${profileData.firstName} ${profileData.lastName}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-2xl font-semibold text-gray-800">
                {profileData.firstName} {profileData.lastName}
              </p>
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Ethnicity
              </label>
              <div className={viewClasses}>
                {profileData.ethnicity && profileData.ethnicity.length > 0
                  ? profileData.ethnicity.join(', ')
                  : "Not specified"}
              </div>
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Nationality
              </label>
              <div className={viewClasses}>
                {profileData.nationality || "Not specified"}
              </div>
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Languages
              </label>
              <div className={viewClasses}>
                {profileData.language && profileData.language.length > 0
                  ? profileData.language.join(', ')
                  : "Not specified"}
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <>
            <div className="mb-6">
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Bio
              </label>
              <div className={`${viewClasses} min-h-[100px]`}>
                {profileData.bio || "Not specified"}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Personality
              </label>
              <div className={`${viewClasses} min-h-[100px]`}>
                {profileData.personality || "Not specified"}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Deal Breakers & Non-Negotiables
              </label>
              <div className={`${viewClasses} min-h-[100px]`}>
                {profileData.dealBreakers || "Not specified"}
              </div>
            </div>
          </>
        );

      case 2:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Sect
              </label>
              <div className={viewClasses}>
                {sectOptions.find(opt => opt.value === profileData.sect)?.label || "Not specified"}
              </div>
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Madhab
              </label>
              <div className={viewClasses}>
                {madhabOptions.find(opt => opt.value === profileData.madhab)?.label || "Not specified"}
              </div>
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Pattern of Salah
              </label>
              <div className={viewClasses}>
                {salahPatternOptions.find(opt => opt.value === profileData.salahPattern)?.label || "Not specified"}
              </div>
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Quran Memorisation
              </label>
              <div className={viewClasses}>
                {quranMemorizationOptions.find(opt => opt.value === profileData.quranMemorization)?.label || "Not specified"}
              </div>
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Dressing Style
              </label>
              <div className={viewClasses}>
                {dressStyleOptions.find(opt => opt.value === profileData.dressingStyle)?.label || "Not specified"}
              </div>
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Open to Polygamy
              </label>
              <div className={viewClasses}>
                {polygamyOptions.find(opt => opt.value === profileData.openToPolygamy)?.label || "Not specified"}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Islamic Books/Mutuun Studied
              </label>
              <div className={`${viewClasses} min-h-[100px]`}>
                {profileData.islamicBooks || "Not specified"}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Islamic Ambitions
              </label>
              <div className={`${viewClasses} min-h-[100px]`}>
                {profileData.islamicAmbitions || "Not specified"}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Children
              </label>
              <div className={viewClasses}>
                {profileData.children === "yes" ? "Yes" : profileData.children === "no" ? "No" : "Not specified"}
              </div>
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Occupation
              </label>
              <div className={viewClasses}>
                {profileData.occupation || "Not specified"}
              </div>
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Location
              </label>
              <div className={viewClasses}>
                {profileData.location || "Not specified"}
              </div>
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Open to Making Hijrah
              </label>
              <div className={viewClasses}>
                {profileData.openToHijrah === "yes" ? "Yes" : profileData.openToHijrah === "no" ? "No" : "Not specified"}
              </div>
            </div>

            {profileData.openToHijrah === "yes" && (
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  Hijrah Destination
                </label>
                <div className={viewClasses}>
                  {profileData.hijrahDestination || "Not specified"}
                </div>
              </div>
            )}

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Married
              </label>
              <div className={viewClasses}>
                {profileData.maritalStatus === "yes" ? "Yes" : profileData.maritalStatus === "no" ? "No" : "Not specified"}
              </div>
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Revert
              </label>
              <div className={viewClasses}>
                {profileData.revert === "yes" ? "Yes" : profileData.revert === "no" ? "No" : "Not specified"}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Height (cm)
              </label>
              <div className={viewClasses}>
                {profileData.height ? `${profileData.height} cm` : "Not specified"}
              </div>
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Weight (kg)
              </label>
              <div className={viewClasses}>
                {profileData.weight ? `${profileData.weight} kg` : "Not specified"}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Describe Your Appearance Preferences
              </label>
              <div className={`${viewClasses} min-h-[100px]`}>
                {profileData.appearancePreference || "Not specified"}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>&#8203;

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            {loading ? (
              <div className="text-center p-8">Loading profile information...</div>
            ) : error ? (
              <div className="text-center p-8 text-red-500">{error}</div>
            ) : (
              <div>
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-[#4A0635] mb-4">
                    {cardTitles[currentCard]}
                  </h3>
                  {renderCardContent()}
                </div>

                <div className="flex justify-between items-center mt-8">
                  <button
                    onClick={prevCard}
                    disabled={currentCard === 0}
                    className={`px-4 py-2 rounded-full ${currentCard === 0
                        ? "bg-gray-200 cursor-not-allowed"
                        : "theme-btn"
                      } transition-colors`}
                  >
                    Previous
                  </button>
                  <div className="flex gap-2">
                    {cardTitles.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentCard(index)}
                        className={`w-3 h-3 rounded-full ${currentCard === index ? "theme-btn" : "bg-gray-300"
                          }`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={nextCard}
                    disabled={currentCard === 4}
                    className={`px-4 py-2 rounded-full ${currentCard === 4
                        ? "bg-gray-200 cursor-not-allowed"
                        : "theme-btn"
                      } transition-colors`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal; 