import React, { useState, useEffect } from "react";
import { useAuth } from "../components/contexts/AuthContext";
import axios from "axios";
import Select from 'react-select';
import { customSelectStyles } from "../styles/selectStyles";
import { 
  salahPatternOptions, 
  madhabOptions, 
  sectOptions, 
  ethnicityOptions, 
  countries,
  quranMemorizationOptions,
  dressStyleOptions,
  polygamyOptions,
  languages,
  yesNoOptions 
} from "../data/fieldData";

const Profile = () => {
  const { user } = useAuth();
  const [currentCard, setCurrentCard] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    // Card 1 - Personal Details
    userName: "",
    firstName: "",
    lastName: "",
    dob: "",
    email: "",
    phone: "",
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
    if (user) {
      setProfileData({
        // Card 1 - Personal Details
        userName: user.userName || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : "",
        email: user.email || "",
        phone: user.phone || "",
        ethnicity: user.ethnicity || "",
        nationality: user.nationality || "",
        language: user.profile?.language || [],

        // Card 2 - About Yourself
        bio: user.profile?.bio || "",
        personality: user.profile?.personality || "",
        dealBreakers: user.profile?.dealBreakers || "",

        // Card 3 - Your Faith
        sect: user.sect || "",
        madhab: user.profile?.madhab || "",
        salahPattern: user.profile?.salahPattern || "",
        quranMemorization: user.profile?.quranMemorization || "",
        dressingStyle: user.profile?.dressingStyle || "",
        openToPolygamy: user.profile?.openToPolygamy || "",
        islamicAmbitions: user.profile?.islamicAmbitions || "",
        islamicBooks: user.profile?.islamicBooks || "",

        // Card 4 - Life Situation
        children: user.profile?.children || "",
        occupation: user.occupation || "",
        location: user.location || "",
        openToHijrah: user.profile?.openToHijrah || "",
        hijrahDestination: user.profile?.hijrahDestination || "",
        maritalStatus: user.maritalStatus || "",
        revert: user.profile?.revert || "",

        // Card 5 - Appearance
        weight: user.profile?.weight || "",
        height: user.profile?.height || "",
        appearancePreference: user.profile?.appearancePreference || "",
      });
      setLoading(false);
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLanguageChange = (selectedOptions) => {
    setProfileData(prev => ({
      ...prev,
      language: selectedOptions ? selectedOptions.map(option => option.value) : []
    }));
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/profile`,
        profileData,
        { withCredentials: true }
      );
      if (response.status === 200) {
        setIsEditing(false);
      }
    } catch (err) {
      setError("Failed to update profile. Please try again.");
      console.error("Error updating profile:", err);
    }
  };

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

  const renderCardContent = () => {
    const commonClasses = "w-full p-4 border-2 border-[#FFE1F3] rounded-xl focus:outline-none focus:border-[#E01D42] transition-colors";
    const viewClasses = "p-4 bg-[#FFF1FE] rounded-xl";

    switch(currentCard) {
      case 0:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                First Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="firstName"
                  value={profileData.firstName}
                  onChange={handleInputChange}
                  className={commonClasses}
                  placeholder="Your first name..."
                />
              ) : (
                <div className={viewClasses}>
                  {profileData.firstName || "Not specified"}
                </div>
              )}
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Surname
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="lastName"
                  value={profileData.lastName}
                  onChange={handleInputChange}
                  className={commonClasses}
                  placeholder="Your surname..."
                />
              ) : (
                <div className={viewClasses}>
                  {profileData.lastName || "Not specified"}
                </div>
              )}
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Date of Birth
              </label>
              {isEditing ? (
                <input
                  type="date"
                  name="dob"
                  value={profileData.dob}
                  onChange={handleInputChange}
                  className={commonClasses}
                />
              ) : (
                <div className={viewClasses}>
                  {profileData.dob ? new Date(profileData.dob).toLocaleDateString() : "Not specified"}
                </div>
              )}
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleInputChange}
                  className={commonClasses}
                  placeholder="Your email..."
                />
              ) : (
                <div className={viewClasses}>
                  {profileData.email || "Not specified"}
                </div>
              )}
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Mobile Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleInputChange}
                  className={commonClasses}
                  placeholder="Your mobile number..."
                />
              ) : (
                <div className={viewClasses}>
                  {profileData.phone || "Not specified"}
                </div>
              )}
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Ethnicity
              </label>
              {isEditing ? (
                <select
                  name="ethnicity"
                  value={profileData.ethnicity}
                  onChange={handleInputChange}
                  className={commonClasses}
                >
                  <option value="">Select Ethnicity</option>
                  {ethnicityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <div className={viewClasses}>
                  {ethnicityOptions.find(opt => opt.value === profileData.ethnicity)?.label || "Not specified"}
                </div>
              )}
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Nationality
              </label>
              {isEditing ? (
                <select
                  name="nationality"
                  value={profileData.nationality}
                  onChange={handleInputChange}
                  className={commonClasses}
                >
                  <option value="">Select Nationality</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              ) : (
                <div className={viewClasses}>
                  {profileData.nationality || "Not specified"}
                </div>
              )}
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Languages
              </label>
              {isEditing ? (
                <Select
                  isMulti
                  name="language"
                  value={languages
                    .filter(lang => profileData.language.includes(lang))
                    .map(lang => ({ value: lang, label: lang }))}
                  onChange={handleLanguageChange}
                  options={languages.map(lang => ({ value: lang, label: lang }))}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  placeholder="Select languages..."
                  isSearchable={true}
                  styles={customSelectStyles}
                />
              ) : (
                <div className={viewClasses}>
                  {profileData.language && profileData.language.length > 0 
                    ? profileData.language.join(', ') 
                    : "Not specified"}
                </div>
              )}
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
              {isEditing ? (
                <textarea
                  name="bio"
                  value={profileData.bio}
                  onChange={handleInputChange}
                  className={commonClasses}
                  rows="4"
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <div className={`${viewClasses} min-h-[100px]`}>
                  {profileData.bio || "Not specified"}
                </div>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Personality
              </label>
              {isEditing ? (
                <textarea
                  name="personality"
                  value={profileData.personality}
                  onChange={handleInputChange}
                  className={commonClasses}
                  rows="4"
                  placeholder="Describe your personality..."
                />
              ) : (
                <div className={`${viewClasses} min-h-[100px]`}>
                  {profileData.personality || "Not specified"}
                </div>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Deal Breakers & Non-Negotiables
              </label>
              {isEditing ? (
                <textarea
                  name="dealBreakers"
                  value={profileData.dealBreakers}
                  onChange={handleInputChange}
                  className={commonClasses}
                  rows="4"
                  placeholder="List your deal breakers..."
                />
              ) : (
                <div className={`${viewClasses} min-h-[100px]`}>
                  {profileData.dealBreakers || "Not specified"}
                </div>
              )}
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
              {isEditing ? (
                <select
                  name="sect"
                  value={profileData.sect}
                  onChange={handleInputChange}
                  className={commonClasses}
                >
                  <option value="">Select Sect</option>
                  {sectOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <div className={viewClasses}>
                  {sectOptions.find(opt => opt.value === profileData.sect)?.label || "Not specified"}
                </div>
              )}
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Madhab
              </label>
              {isEditing ? (
                <select
                  name="madhab"
                  value={profileData.madhab}
                  onChange={handleInputChange}
                  className={commonClasses}
                >
                  <option value="">Select Madhab</option>
                  {madhabOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <div className={viewClasses}>
                  {madhabOptions.find(opt => opt.value === profileData.madhab)?.label || "Not specified"}
                </div>
              )}
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Pattern of Salah
              </label>
              {isEditing ? (
                <select
                  name="salahPattern"
                  value={profileData.salahPattern}
                  onChange={handleInputChange}
                  className={commonClasses}
                >
                  <option value="">Select Salah Pattern</option>
                  {salahPatternOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <div className={viewClasses}>
                  {salahPatternOptions.find(opt => opt.value === profileData.salahPattern)?.label || "Not specified"}
                </div>
              )}
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Quran Memorisation
              </label>
              {isEditing ? (
                <select
                  name="quranMemorization"
                  value={profileData.quranMemorization}
                  onChange={handleInputChange}
                  className={commonClasses}
                >
                  <option value="">Select Quran Memorisation Level</option>
                  {quranMemorizationOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <div className={viewClasses}>
                  {quranMemorizationOptions.find(opt => opt.value === profileData.quranMemorization)?.label || "Not specified"}
                </div>
              )}
            </div>

            {user?.gender === 'female' && (
              <>
                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    Dressing Style
                  </label>
                  {isEditing ? (
                    <select
                      name="dressingStyle"
                      value={profileData.dressingStyle}
                      onChange={handleInputChange}
                      className={commonClasses}
                    >
                      <option value="">Select Dressing Style</option>
                      {dressStyleOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className={viewClasses}>
                      {dressStyleOptions.find(opt => opt.value === profileData.dressingStyle)?.label || "Not specified"}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    Open to Polygamy
                  </label>
                  {isEditing ? (
                    <select
                      name="openToPolygamy"
                      value={profileData.openToPolygamy}
                      onChange={handleInputChange}
                      className={commonClasses}
                    >
                      <option value="">Select Option</option>
                      {polygamyOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className={viewClasses}>
                      {polygamyOptions.find(opt => opt.value === profileData.openToPolygamy)?.label || "Not specified"}
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="md:col-span-2">
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Islamic Books/Mutuun Studied
              </label>
              {isEditing ? (
                <textarea
                  name="islamicBooks"
                  value={profileData.islamicBooks}
                  onChange={handleInputChange}
                  className={commonClasses}
                  rows="4"
                  placeholder="List the Islamic books and mutuun you have studied..."
                />
              ) : (
                <div className={`${viewClasses} min-h-[100px]`}>
                  {profileData.islamicBooks || "Not specified"}
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Islamic Ambitions
              </label>
              {isEditing ? (
                <textarea
                  name="islamicAmbitions"
                  value={profileData.islamicAmbitions}
                  onChange={handleInputChange}
                  className={commonClasses}
                  rows="4"
                  placeholder="Your Islamic ambitions..."
                />
              ) : (
                <div className={`${viewClasses} min-h-[100px]`}>
                  {profileData.islamicAmbitions || "Not specified"}
                </div>
              )}
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
              {isEditing ? (
                <select
                  name="children"
                  value={profileData.children}
                  onChange={handleInputChange}
                  className={commonClasses}
                >
                  {yesNoOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <div className={viewClasses}>
                  {profileData.children === "yes" ? "Yes" : profileData.children === "no" ? "No" : "Not specified"}
                </div>
              )}
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Occupation
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="occupation"
                  value={profileData.occupation}
                  onChange={handleInputChange}
                  className={commonClasses}
                  placeholder="Your occupation..."
                />
              ) : (
                <div className={viewClasses}>
                  {profileData.occupation || "Not specified"}
                </div>
              )}
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Location
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="location"
                  value={profileData.location}
                  onChange={handleInputChange}
                  className={commonClasses}
                  placeholder="Your location..."
                />
              ) : (
                <div className={viewClasses}>
                  {profileData.location || "Not specified"}
                </div>
              )}
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Open to Making Hijrah
              </label>
              {isEditing ? (
                <select
                  name="openToHijrah"
                  value={profileData.openToHijrah}
                  onChange={handleInputChange}
                  className={commonClasses}
                >
                  {yesNoOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <div className={viewClasses}>
                  {profileData.openToHijrah === "yes" ? "Yes" : profileData.openToHijrah === "no" ? "No" : "Not specified"}
                </div>
              )}
            </div>

            {(isEditing ? profileData.openToHijrah === "yes" : profileData.openToHijrah === "yes") && (
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  Hijrah Destination
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="hijrahDestination"
                    value={profileData.hijrahDestination}
                    onChange={handleInputChange}
                    className={commonClasses}
                    placeholder="Your preferred hijrah destination..."
                  />
                ) : (
                  <div className={viewClasses}>
                    {profileData.hijrahDestination || "Not specified"}
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Married
              </label>
              {isEditing ? (
                <select
                  name="maritalStatus"
                  value={profileData.maritalStatus}
                  onChange={handleInputChange}
                  className={commonClasses}
                >
                  {yesNoOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <div className={viewClasses}>
                  {profileData.maritalStatus === "yes" ? "Yes" : profileData.maritalStatus === "no" ? "No" : "Not specified"}
                </div>
              )}
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Revert
              </label>
              {isEditing ? (
                <select
                  name="revert"
                  value={profileData.revert}
                  onChange={handleInputChange}
                  className={commonClasses}
                >
                  {yesNoOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <div className={viewClasses}>
                  {profileData.revert === "yes" ? "Yes" : profileData.revert === "no" ? "No" : "Not specified"}
                </div>
              )}
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
              {isEditing ? (
                <input
                  type="number"
                  name="height"
                  value={profileData.height}
                  onChange={handleInputChange}
                  className={commonClasses}
                  placeholder="Your height in centimeters..."
                  min="100"
                  max="250"
                />
              ) : (
                <div className={viewClasses}>
                  {profileData.height ? `${profileData.height} cm` : "Not specified"}
                </div>
              )}
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Weight (kg)
              </label>
              {isEditing ? (
                <input
                  type="number"
                  name="weight"
                  value={profileData.weight}
                  onChange={handleInputChange}
                  className={commonClasses}
                  placeholder="Your weight in kilograms..."
                  min="30"
                  max="200"
                />
              ) : (
                <div className={viewClasses}>
                  {profileData.weight ? `${profileData.weight} kg` : "Not specified"}
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Describe Your Appearance Preferences
              </label>
              {isEditing ? (
                <textarea
                  name="appearancePreference"
                  value={profileData.appearancePreference}
                  onChange={handleInputChange}
                  className={commonClasses}
                  rows="4"
                  placeholder="Describe your preferences regarding physical appearance (e.g., height, build, complexion)..."
                />
              ) : (
                <div className={`${viewClasses} min-h-[100px]`}>
                  {profileData.appearancePreference || "Not specified"}
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#FFF1FE] p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-[#4A0635]">My Profile</h1>
          <div className="flex items-center gap-4">
            {isEditing ? (
              <button
                onClick={handleSubmit}
                className="bg-[#E01D42] text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-[#FF1F5A] transition-colors"
              >
                Save Changes
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-[#E01D42] text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-[#FF1F5A] transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="p-8">
            <div className="flex justify-between items-start mb-8">
              <h2 className="text-2xl font-semibold">
                {profileData.userName} {user?.gender === 'male' ? '♂' : '♀'}
              </h2>
              <div className="text-3xl font-arabic text-[#4A0635]">
                السَّلامُ عَلَيْكُم
              </div>
            </div>

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
                className={`px-4 py-2 rounded-full ${
                  currentCard === 0
                    ? "bg-gray-200 cursor-not-allowed"
                    : "bg-[#E01D42] text-white hover:bg-[#FF1F5A]"
                } transition-colors`}
              >
                Previous
              </button>
              <div className="flex gap-2">
                {cardTitles.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentCard(index)}
                    className={`w-3 h-3 rounded-full ${
                      currentCard === index ? "bg-[#E01D42]" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={nextCard}
                disabled={currentCard === 4}
                className={`px-4 py-2 rounded-full ${
                  currentCard === 4
                    ? "bg-gray-200 cursor-not-allowed"
                    : "bg-[#E01D42] text-white hover:bg-[#FF1F5A]"
                } transition-colors`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;