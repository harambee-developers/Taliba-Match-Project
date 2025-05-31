import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../components/contexts/AuthContext";
import axios from "axios";
import Select from 'react-select';
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
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
import citiesByCountry from '../data/citiesByCountry';

const Profile = () => {
  const { user } = useAuth();
  const [currentCard, setCurrentCard] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({
    unit: "%",
    x: 25,
    y: 25,
    width: 50,
    height: 50,
  });
  const imgRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [profileData, setProfileData] = useState({
    // Card 1 - Personal Details
    userName: "",
    firstName: "",
    lastName: "",
    dob: "",
    ethnicity: [],
    nationality: "",
    language: [],
    location: { country: "", city: "" },

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
    openToHijrah: "",
    hijrahDestination: "",
    maritalStatus: "",
    revert: "",
    numberOfChildren: "",
    divorced: "",

    // Card 5 - Appearance
    weight: "",
    height: "",
    appearancePreference: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableCities, setAvailableCities] = useState([]);

  useEffect(() => {
    if (user) {
      console.log("User data:", user);
      setProfileData({
        // Card 1 - Personal Details
        userName: user.userName || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : "",
        ethnicity: user.ethnicity || [],
        nationality: user.nationality || "",
        language: user.language || [],
        location: { country: user.location?.country || "", city: user.location?.city || "" },

        // Card 2 - About Yourself
        bio: user.bio || "",
        personality: user.personality || "",
        dealBreakers: user.dealBreakers || "",

        // Card 3 - Your Faith
        sect: user.sect || "",
        madhab: user.madhab || "",
        salahPattern: user.salahPattern || "",
        quranMemorization: user.quranMemorization || "",
        dressingStyle: user.dressingStyle || "",
        openToPolygamy: user.openToPolygamy || "",
        islamicAmbitions: user.islamicAmbitions || "",
        islamicBooks: user.islamicBooks || "",

        // Card 4 - Life Situation
        children: user.children || "",
        occupation: user.occupation || "",
        openToHijrah: user.profile?.openToHijrah || "",
        hijrahDestination: user.profile?.hijrahDestination || "",
        maritalStatus: user.maritalStatus || "",
        revert: user.revert || "",
        numberOfChildren: user.numberOfChildren || "",
        divorced: user.divorced || "",

        // Card 5 - Appearance
        weight: user.weight || "",
        height: user.height || "",
        appearancePreference: user.appearancePreference || "",
      });

      if (user.photos && user.photos.length > 0) {
        setProfilePhoto(user.photos[0].url);
      }
      console.log("Profile data after setting:", profileData);
      console.log("Nationality value:", user.nationality);

      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    console.log("Profile data updated:", profileData);
    console.log("Nationality in profileData:", profileData.nationality);
  }, [profileData]);

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

  const handleEthnicityChange = (selectedOptions) => {
    setProfileData(prev => ({
      ...prev,
      ethnicity: selectedOptions ? selectedOptions.map(option => option.value) : []
    }));
  };

  const handleAvatarSelect = (avatarPath) => {
    setSelectedAvatar(avatarPath);
  };

  // const handleImageChange = (event) => {
  //   const file = event.target.files[0];
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onload = () => {
  //       setSelectedImage(reader.result);
  //       setShowCropper(true);
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // };

  const handleCropComplete = (crop) => {
    console.log("Crop completed:", crop);
  };

  const handleCropSave = async () => {
    if (selectedImage && imgRef.current && crop.width && crop.height) {
      setIsUploading(true);

      const canvas = document.createElement("canvas");
      const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
      const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
      canvas.width = crop.width;
      canvas.height = crop.height;
      const ctx = canvas.getContext("2d");

      ctx.drawImage(
        imgRef.current,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
      );

      canvas.toBlob(async (blob) => {
        try {
          const formData = new FormData();
          formData.append('profileImage', blob, 'profile-pic.jpg');

          const response = await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/api/user/profile/upload/${user?.userId}`,
            formData,
            {
              withCredentials: true,
              headers: { "Content-Type": "multipart/form-data" }
            }
          );

          if (response.status === 200) {
            setProfilePhoto(response.data.url);
            setShowCropper(false);
            setSelectedImage(null);
            setShowAvatarModal(false);
          }
        } catch (err) {
          console.error("Error uploading image:", err);
          setError("Failed to upload profile image. Please try again.");
        } finally {
          setIsUploading(false);
        }
      }, "image/jpeg");
    } else {
      setError("Please select and crop an image properly");
    }
  };

  const handleAvatarSubmit = async () => {
    if (selectedAvatar) {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/user/profile/avatar/${user?.userId}`,
          { avatar: selectedAvatar },
          { withCredentials: true }
        );

        if (response.status === 200) {
          setProfilePhoto(selectedAvatar);
          setShowAvatarModal(false);
        }
      } catch (err) {
        console.error("Error setting avatar:", err);
        setError("Failed to set avatar. Please try again.");
      }
    } else {
      setError("Please select an avatar first");
    }
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/profile/${user?.userId}`,
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

  const handleCountryChange = (e) => {
    const selectedCountry = e.target.value;
    const cities = selectedCountry ? citiesByCountry[selectedCountry] || [] : [];
    setAvailableCities(cities);
    handleInputChange({
      target: {
        name: 'location',
        value: { 
          country: selectedCountry,
          city: '' // Reset city when country changes
        }
      }
    });
  };

  const renderCardContent = () => {
    const commonClasses = "w-full p-4 border-2 border-[#FFE1F3] rounded-xl focus:outline-none focus:border-[#E01D42] transition-colors";
    const viewClasses = "p-4 theme-bg rounded-xl";

    switch (currentCard) {
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
                  value={profileData.firstName || ""}
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
                  value={profileData.lastName || ""}
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
                  value={profileData.dob || ""}
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
                Ethnicity
              </label>
              {isEditing ? (
                <Select
                  isMulti
                  name="ethnicity"
                  value={ethnicityOptions.filter(option => 
                    Array.isArray(profileData.ethnicity) && profileData.ethnicity.includes(option.value)
                  )}
                  onChange={handleEthnicityChange}
                  options={ethnicityOptions}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  placeholder="Select ethnicities..."
                  isSearchable={true}
                  styles={customSelectStyles}
                />
              ) : (
                <div className={viewClasses}>
                  {Array.isArray(profileData.ethnicity) && profileData.ethnicity.length > 0
                    ? profileData.ethnicity.map(value => 
                        ethnicityOptions.find(opt => opt.value === value)?.label
                      ).filter(Boolean).join(', ')
                    : "Not specified"}
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
                  value={profileData.nationality || ""}
                  onChange={handleInputChange}
                  className={commonClasses}
                >
                  <option value="">Select Nationality</option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.label}>
                      {country.label}
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
                    .filter(lang => Array.isArray(profileData.language) && profileData.language.includes(lang))
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
                  {Array.isArray(profileData.language) && profileData.language.length > 0
                    ? profileData.language.join(', ')
                    : "Not specified"}
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Location
              </label>
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <select
                      name="location.country"
                      value={profileData.location?.country || ""}
                      onChange={handleCountryChange}
                      className={commonClasses}
                    >
                      <option value="">Select Country</option>
                      {countries.map((country) => (
                        <option key={country.code} value={country.label}>
                          {country.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <select
                      name="location.city"
                      value={profileData.location?.city || ""}
                      onChange={(e) => handleInputChange({
                        target: {
                          name: 'location',
                          value: { 
                            ...profileData.location,
                            city: e.target.value
                          }
                        }
                      })}
                      className={commonClasses}
                      disabled={!profileData.location?.country}
                    >
                      <option value="">Select City</option>
                      {availableCities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className={viewClasses}>
                  {profileData.location?.city && profileData.location?.country 
                    ? `${profileData.location.city}, ${profileData.location.country}`
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
                  value={profileData.sect || ""}
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
                  value={profileData.madhab || ""}
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
                  value={profileData.salahPattern || ""}
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
                  value={profileData.quranMemorization || ""}
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
                      value={profileData.dressingStyle || ""}
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
                      value={profileData.openToPolygamy || ""}
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
                  <option value="">Do you have children?</option>
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

            {profileData.children === "yes" && (
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  How many children do you have?
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    name="numberOfChildren"
                    value={profileData.numberOfChildren}
                    onChange={handleInputChange}
                    className={commonClasses}
                    min="1"
                    max="20"
                    placeholder="Enter number of children..."
                  />
                ) : (
                  <div className={viewClasses}>
                    {profileData.numberOfChildren || "Not specified"}
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Have you been divorced?
              </label>
              {isEditing ? (
                <select
                  name="divorced"
                  value={profileData.divorced}
                  onChange={handleInputChange}
                  className={commonClasses}
                >
                  <option value="">Select an option</option>
                  {yesNoOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <div className={viewClasses}>
                  {profileData.divorced === "yes" ? "Yes" : profileData.divorced === "no" ? "No" : "Not specified"}
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
                Open to Making Hijrah
              </label>
              {isEditing ? (
                <select
                  name="openToHijrah"
                  value={profileData.openToHijrah || ""}
                  onChange={handleInputChange}
                  className={commonClasses}
                >
                  <option value="">Select Option</option>
                  {yesNoOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <div className={viewClasses}>
                  {yesNoOptions.find(opt => opt.value === profileData.openToHijrah)?.label || "Not specified"}
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
                  value={profileData.maritalStatus || ""}
                  onChange={handleInputChange}
                  className={commonClasses}
                >
                  <option value="">Select Option</option>
                  {yesNoOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <div className={viewClasses}>
                  {yesNoOptions.find(opt => opt.value === profileData.maritalStatus)?.label || "Not specified"}
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
                  value={profileData.revert || ""}
                  onChange={handleInputChange}
                  className={commonClasses}
                >
                  <option value="">Select Option</option>
                  {yesNoOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <div className={viewClasses}>
                  {yesNoOptions.find(opt => opt.value === profileData.revert)?.label || "Not specified"}
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

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Height
              </label>
              {isEditing ? (
                <div className="flex gap-4">
                  <div className="flex-1">
                    <select
                      name="heightFeet"
                      value={Math.floor(parseInt(profileData.height || 0) / 12)}
                      onChange={(e) => {
                        const feet = parseInt(e.target.value);
                        const inches = parseInt(profileData.height || 0) % 12;
                        handleInputChange({
                          target: {
                            name: 'height',
                            value: (feet * 12 + inches).toString()
                          }
                        });
                      }}
                      className={commonClasses}
                    >
                      <option value="" disabled>Feet</option>
                      {[3, 4, 5, 6, 7, 8].map(feet => (
                        <option key={feet} value={feet}>{feet}'</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <select
                      name="heightInches"
                      value={parseInt(profileData.height || 0) % 12}
                      onChange={(e) => {
                        const inches = parseInt(e.target.value);
                        const feet = Math.floor(parseInt(profileData.height || 0) / 12);
                        handleInputChange({
                          target: {
                            name: 'height',
                            value: (feet * 12 + inches).toString()
                          }
                        });
                      }}
                      className={commonClasses}
                    >
                      <option value="">Inches</option>
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(inches => (
                        <option key={inches} value={inches}>{inches}"</option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className={viewClasses}>
                  {profileData.height ? (() => {
                    const totalInches = parseInt(profileData.height);
                    const feet = Math.floor(totalInches / 12);
                    const inches = totalInches % 12;
                    return `${feet}'${inches}"`;
                  })() : "Not specified"}
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
    <div className="min-h-screen theme-bg px-4 py-6 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <h1 className="text-2xl font-bold text-[#4A0635]">My Profile</h1>
          <div className="flex flex-wrap gap-2 sm:gap-4">
            {isEditing ? (
              <button
                onClick={handleSubmit}
                className="theme-btn px-4 py-2 sm:px-6 sm:py-3 rounded-full text-base sm:text-lg font-semibold"
              >
                Save Changes
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="theme-btn px-4 py-2 sm:px-6 sm:py-3 rounded-full text-base sm:text-lg font-semibold"
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
              <div className="flex items-center">
                <div className="relative mr-4">
                  <div className="w-24 h-auto rounded-full overflow-hidden theme-border bg-gray-100 flex items-center justify-center">
                    {profilePhoto ? (
                      <img
                        src={profilePhoto.startsWith('http') ? profilePhoto : `/${profilePhoto}`}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-gray-400 text-4xl">
                        {user?.gender === 'Male' ? '♂' : '♀'}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setShowAvatarModal(true)}
                    className="absolute bottom-0 right-0 theme-btn text-white rounded-full w-8 h-8 flex items-center justify-center"
                    title="Change profile picture"
                  >
                    <span className="text-xs sm:text-base">✏️</span>
                  </button>
                </div>
                <h2 className="text-lg sm:text-2xl font-semibold break-words">
                  {profileData.userName} {user?.gender === 'Male' ? '♂' : '♀'}
                </h2>
              </div>
              <div className="text-2xl sm:text-3xl font-arabic text-[#4A0635] text-right sm:text-left">
                السَّلامُ عَلَيْكُم
              </div>
            </div>
            
            {/* Card content */}
            <div className="mb-6 sm:mb-8">
              <h3 className="text-lg sm:text-xl font-semibold text-[#4A0635] mb-3 sm:mb-4">
                {cardTitles[currentCard]}
              </h3>
              {renderCardContent()}
            </div>
            
            {/* Navigation controls */}
            <div className="flex flex-col sm:flex-row sm:justify-between items-center mt-6 sm:mt-8 gap-4">
              <button
                onClick={prevCard}
                disabled={currentCard === 0}
                className={`px-4 py-2 rounded-full text-sm sm:text-base ${currentCard === 0
                    ? "bg-gray-200 cursor-not-allowed"
                    : "theme-btn"
                  } transition-colors`}
              >
                Previous
              </button>
              <div className="flex gap-2 justify-center">
                {cardTitles.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentCard(index)}
                    className={`w-3 h-3 rounded-full 
                      ${currentCard === index ? "theme-btn" : "bg-gray-300"
                      }`}
                  />
                ))}
              </div>
              <button
                onClick={nextCard}
                disabled={currentCard === 4}
                className={`px-4 py-2 rounded-full text-sm sm:text-base ${currentCard === 4
                    ? "bg-gray-200 cursor-not-allowed"
                    : "theme-btn"
                  } transition-colors`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {showAvatarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Change Profile Picture</h3>
              <button
                onClick={() => {
                  setShowAvatarModal(false);
                  setSelectedAvatar('');
                  setSelectedImage(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-medium mb-3">Choose from avatars</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {user?.gender === 'Male' ? (
                  [1, 2, 3, 4].map((num) => (
                    <div
                      key={`man${num}`}
                      className={`cursor-pointer rounded-lg p-2 transition-all duration-300 ${selectedAvatar === `icon_man${num === 1 ? '' : num}.png` ? 'bg-[#1A495D] bg-opacity-20 ring-2 ring-[#1A495D]' : 'hover:bg-gray-100'}`}
                      onClick={() => handleAvatarSelect(`icon_man${num === 1 ? '' : num}.png`)}
                    >
                      <img
                        src={`/icon_man${num === 1 ? '' : num}.png`}
                        alt={`Male Avatar ${num}`}
                        className="w-full h-auto bg-white"
                      />
                    </div>
                  ))
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4 col-span-full">
                      {[1, 2, 3, 4].map((num) => (
                        <div
                          key={`woman${num}`}
                          className={`cursor-pointer rounded-lg p-2 transition-all duration-300 ${selectedAvatar === `icon_woman${num === 1 ? '' : num}.png` ? 'bg-[#1A495D] bg-opacity-20 ring-2 ring-[#1A495D]' : 'hover:bg-gray-100'}`}
                          onClick={() => handleAvatarSelect(`icon_woman${num === 1 ? '' : num}.png`)}
                        >
                          <img
                            src={`/icon_woman${num === 1 ? '' : num}.png`}
                            alt={`Female Avatar ${num}`}
                            className="w-full h-auto"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="col-span-full flex justify-center">
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* <div className="w-full text-center mb-6">
              <div className="relative">
                <hr className="border-t border-gray-300" />
                <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-gray-500">
                  or upload your own
                </span>
              </div>
            </div>

            <div className="mb-6 p-4 border-2 border-dashed border-[#1A495D] rounded-lg text-center">
              <h4 className="text-lg font-medium mb-3">Upload your own image</h4>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mb-2"
              />
              <p className="text-xs text-gray-500">For best results, use a square image</p>
            </div> */}

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAvatarModal(false);
                  setSelectedAvatar('');
                }}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleAvatarSubmit}
                className="px-4 py-2 bg-[#1A495D] text-white rounded"
                disabled={!selectedAvatar}
              >
                Save Avatar
              </button>
            </div>
          </div>
        </div>
      )}

      {showCropper && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded-md shadow-lg max-w-lg">
            <h3 className="text-lg font-semibold mb-4">Crop Your Image</h3>
            <div className="mb-4">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={handleCropComplete}
                aspect={1}
                minHeight={100}
              >
                <img
                  ref={imgRef}
                  src={selectedImage}
                  alt="Crop me"
                  className="max-h-[400px]"
                />
              </ReactCrop>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowCropper(false);
                  setSelectedImage(null);
                }}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCropSave}
                className="px-4 py-2 bg-[#1A495D] text-white rounded"
                disabled={isUploading}
              >
                {isUploading ? "Processing..." : "Save Crop"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;