import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../components/contexts/AuthContext";
import { useParams } from "react-router-dom";
import axios from "axios";
import Select from 'react-select';
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { customSelectStyles } from "../styles/selectStyles";
import {
  ethnicityOptions,
  languages,
  yesNoOptions,
  salahPatternOptions,
  sectOptions,
  madhabOptions,
  polygamyOptions,
  quranMemorizationOptions,
  openToHijrahOptions,
  countries,
  dressStyleOptions
} from "../data/fieldData";
import citiesByCountry from '../data/citiesByCountry';

// Gender-based custom select styles
const getCustomSelectStyles = (gender) => ({
  control: (provided, state) => ({
    ...provided,
    minHeight: '56px',
    borderRadius: '1rem',
    borderColor: gender === 'Female' ? '#FFE6FB' : '#B6D4F5',
    borderWidth: '2px',
    boxShadow: 'none',
    backgroundColor: 'white',   
    '&:hover': {
      borderColor: gender === 'Female' ? '#FFE6FB' : '#B6D4F5',
    },
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? (gender === 'Female' ? '#FFE6FB' : '#E6F0F7')
      : state.isFocused
        ? (gender === 'Female' ? '#FFE6FB' : '#E6F0F7')
        : 'white',
    color: '#4A0635',
    fontWeight: state.isSelected ? 600 : 400,
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: gender === 'Female' ? '#FFE6FB' : '#E6F0F7',
    borderRadius: '0.5rem',
    padding: '2px 6px',
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: '#4A0635',
    fontWeight: 500,
  }),
  multiValueRemove: (provided) => ({
    ...provided,
    color: gender === 'Female' ? '#FFE6FB' : '#B6D4F5',
    ':hover': {
      backgroundColor: gender === 'Female' ? '#FFE6FB' : '#B6D4F5',
      color: 'white',
    },
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 20,
    backgroundColor: 'white',
    borderRadius: '1rem',
    boxShadow: '0 4px 24px 0 rgba(0,0,0,0.08)',
  }),
});

const ProfileUpdate = () => {
  const { user } = useAuth();
  const { resetToken } = useParams();
  const [currentSection, setCurrentSection] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Add image cropping states
  const [selectedImage, setSelectedImage] = useState(null);
  const [crop, setCrop] = useState({
    unit: "%",
    x: 25,
    y: 25,
    width: 50,
    height: 50,
  });
  const imgRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  
  // Add password validation states
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [availableCities, setAvailableCities] = useState([]);
  
  const [profileData, setProfileData] = useState({
    // Section 1 - Basic Information
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    nationality: "",
    ethnicity: [],
    language: [],
    location: { country: "", city: "" },

    // Section 2 - Personal Details
    bio: "",
    personality: "",
    children: "",
    appearancePreference: "",
    height: "",

    // Section 3 - Religious Information
    salahPattern: "",
    sect: "",
    madhab: "",
    openToPolygamy: "",
    quranMemorization: "",
    openToHijrah: "",

    // Section 4 - Password Update
    password: "",
    confirmPassword: "",

    // Section 5 - Avatar
    avatar: "",
    customImage: null
  });

  // Function to handle image file selection
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result);
        setShowCropper(true);
        // Clear any previously selected avatar when custom image is chosen
        handleInputChange('avatar', '');
      };
      reader.readAsDataURL(file);
    }
  };

  // Function for crop completion
  const handleCropComplete = (crop) => {
    console.log("Crop completed:", crop);
  };

  // Function to center the crop aspect
  const centerAspectCrop = (mediaWidth, mediaHeight, aspect) => {
    const width = 50;
    const height = width / aspect;
    
    return {
      unit: "%",
      width,
      height,
      x: (100 - width) / 2,
      y: (100 - height) / 2,
    };
  };

  // Function to apply the crop
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

      // Convert canvas to blob and save
      canvas.toBlob((blob) => {
        // Store the blob in formData to be submitted later
        handleInputChange('customImage', blob);
        handleInputChange('avatar', 'custom'); // Set avatar to custom to indicate custom image
        setShowCropper(false);
        setIsUploading(false);
      }, "image/jpeg");
    }
  };

  // Password validation function
  const validatePassword = (password) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*]/.test(password)
    };
    
    setPasswordRequirements(requirements);
    
    // Calculate password strength (0-5)
    const strength = Object.values(requirements).filter(Boolean).length;
    setPasswordStrength(strength);
    
    return Object.values(requirements).every(Boolean);
  };

  // Function to get password strength label and color
  const getPasswordStrengthInfo = () => {
    if (passwordStrength <= 2) return { label: 'Weak', color: 'red' };
    if (passwordStrength === 3) return { label: 'Fair', color: 'orange' };
    return { label: 'Strong', color: 'green' };
  };

  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        gender: user.gender || "",
        nationality: user.nationality || "",
        ethnicity: user.ethnicity || [],
        language: user.language || [],
        location: { country: user.location?.country || "", city: user.location?.city || "" },
      }));

      // Initialize available cities if user has a country selected
      if (user.location?.country) {
        const cities = citiesByCountry[user.location.country] || [];
        setAvailableCities(cities);
      }

      setLoading(false);
    }
  }, [user]);

  const handleInputChange = (name, value) => {
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMultiSelectChange = (selectedOptions, actionMeta) => {
    const { name } = actionMeta;
    setProfileData(prev => ({
      ...prev,
      [name]: selectedOptions ? selectedOptions.map(option => option.value) : []
    }));
  };

  const renderSection1 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#4A0635] mb-6">Welcome Back! Let's Update Your Basic Information</h2>
      <p className="text-gray-600 mb-8">
        We'd like to confirm and update your basic details. This helps us ensure we have your most current information for better matches.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">
            First Name
          </label>
          <input
            type="text"
            name="firstName"
            value={profileData.firstName}
            onChange={(e) => handleInputChange(e.target.name, e.target.value)}
            className={`w-full p-4 border-2 rounded-xl focus:outline-none transition-colors ${profileData.gender === 'Female' ? 'border-[#FFE6FB] focus:border-[#FFE6FB]' : 'border-[#B6D4F5] focus:border-[#B6D4F5]'}`}
            placeholder="Your first name..."
          />
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Last Name
          </label>
          <input
            type="text"
            name="lastName"
            value={profileData.lastName}
            onChange={(e) => handleInputChange(e.target.name, e.target.value)}
            className={`w-full p-4 border-2 rounded-xl focus:outline-none transition-colors ${profileData.gender === 'Female' ? 'border-[#FFE6FB] focus:border-[#FFE6FB]' : 'border-[#B6D4F5] focus:border-[#B6D4F5]'}`}
            placeholder="Your last name..."
          />
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={profileData.email}
            onChange={(e) => handleInputChange(e.target.name, e.target.value)}
            className={`w-full p-4 border-2 rounded-xl focus:outline-none transition-colors ${profileData.gender === 'Female' ? 'border-[#FFE6FB] focus:border-[#FFE6FB]' : 'border-[#B6D4F5] focus:border-[#B6D4F5]'}`}
            placeholder="Your email..."
          />
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            value={profileData.phone}
            onChange={(e) => handleInputChange(e.target.name, e.target.value)}
            className={`w-full p-4 border-2 rounded-xl focus:outline-none transition-colors ${profileData.gender === 'Female' ? 'border-[#FFE6FB] focus:border-[#FFE6FB]' : 'border-[#B6D4F5] focus:border-[#B6D4F5]'}`}
            placeholder="Your phone number..."
          />
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Gender
          </label>
          <select
            name="gender"
            value={profileData.gender}
            onChange={(e) => handleInputChange(e.target.name, e.target.value)}
            className={`w-full p-4 border-2 rounded-xl focus:outline-none transition-colors ${profileData.gender === 'Female' ? 'border-[#FFE6FB] focus:border-[#FFE6FB]' : 'border-[#B6D4F5] focus:border-[#B6D4F5]'}`}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Nationality
          </label>
          <Select
            name="nationality"
            value={countries.find(country => country.label === profileData.nationality) || null}
            onChange={(selectedOption) => {
              handleInputChange('nationality', selectedOption ? selectedOption.label : "");
            }}
            options={countries}
            className="react-select-container"
            classNamePrefix="react-select"
            placeholder="Select your nationality..."
            styles={getCustomSelectStyles(profileData.gender)}
          />
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Ethnicity
          </label>
          <Select
            isMulti
            name="ethnicity"
            value={ethnicityOptions.filter(option => 
              profileData.ethnicity.includes(option.value)
            )}
            onChange={handleMultiSelectChange}
            options={ethnicityOptions}
            className="react-select-container"
            classNamePrefix="react-select"
            placeholder="Select ethnicities..."
            styles={getCustomSelectStyles(profileData.gender)}
          />
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Languages
          </label>
          <Select
            isMulti
            name="language"
            value={languages.filter(lang => 
              profileData.language.includes(lang)
            ).map(lang => ({ value: lang, label: lang }))}
            onChange={handleMultiSelectChange}
            options={languages.map(lang => ({ value: lang, label: lang }))}
            className="react-select-container"
            classNamePrefix="react-select"
            placeholder="Select languages..."
            styles={getCustomSelectStyles(profileData.gender)}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Location
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <select
                name="location.country"
                value={profileData.location?.country || ""}
                onChange={(e) => {
                  const selectedCountry = e.target.value;
                  const cities = selectedCountry ? citiesByCountry[selectedCountry] || [] : [];
                  setAvailableCities(cities);
                  handleInputChange('location', { 
                    country: selectedCountry,
                    city: '' // Reset city when country changes
                  });
                }}
                className={`w-full p-4 border-2 rounded-xl focus:outline-none transition-colors ${profileData.gender === 'Female' ? 'border-[#FFE6FB] focus:border-[#FFE6FB]' : 'border-[#B6D4F5] focus:border-[#B6D4F5]'}`}
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
                onChange={(e) => handleInputChange('location', { 
                  ...profileData.location,
                  city: e.target.value
                })}
                className={`w-full p-4 border-2 rounded-xl focus:outline-none transition-colors ${profileData.gender === 'Female' ? 'border-[#FFE6FB] focus:border-[#FFE6FB]' : 'border-[#B6D4F5] focus:border-[#B6D4F5]'}`}
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
        </div>
      </div>
    </div>
  );

  const renderSection2 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#4A0635] mb-6">Tell Us More About Yourself</h2>
      <p className="text-gray-600 mb-8">
        Let's dive deeper into who you are. Share your personality, preferences, and life situation to help others get to know you better.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Bio
          </label>
          <textarea
            name="bio"
            value={profileData.bio}
            onChange={(e) => handleInputChange(e.target.name, e.target.value)}
            className={`w-full p-4 border-2 rounded-xl focus:outline-none transition-colors ${profileData.gender === 'Female' ? 'border-[#FFE6FB] focus:border-[#FFE6FB]' : 'border-[#B6D4F5] focus:border-[#B6D4F5]'}`}
            rows="4"
            placeholder="Tell us about yourself..."
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Personality
          </label>
          <textarea
            name="personality"
            value={profileData.personality}
            onChange={(e) => handleInputChange(e.target.name, e.target.value)}
            className={`w-full p-4 border-2 rounded-xl focus:outline-none transition-colors ${profileData.gender === 'Female' ? 'border-[#FFE6FB] focus:border-[#FFE6FB]' : 'border-[#B6D4F5] focus:border-[#B6D4F5]'}`}
            rows="4"
            placeholder="Describe your personality..."
          />
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Children
          </label>
          <select
            name="children"
            value={profileData.children}
            onChange={(e) => handleInputChange(e.target.name, e.target.value)}
            className={`w-full p-4 border-2 rounded-xl focus:outline-none transition-colors ${profileData.gender === 'Female' ? 'border-[#FFE6FB] focus:border-[#FFE6FB]' : 'border-[#B6D4F5] focus:border-[#B6D4F5]'}`}
          >
            <option value="">Do you have children?</option>
            {yesNoOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {profileData.children === 'yes' && (
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">
              How many children do you have?
            </label>
            <input
              type="number"
              name="numberOfChildren"
              value={profileData.numberOfChildren}
              onChange={(e) => handleInputChange(e.target.name, e.target.value)}
              min="1"
              max="20"
              className={`w-full p-4 border-2 rounded-xl focus:outline-none transition-colors ${profileData.gender === 'Female' ? 'border-[#FFE6FB] focus:border-[#FFE6FB]' : 'border-[#B6D4F5] focus:border-[#B6D4F5]'}`}
              placeholder="Enter number of children..."
            />
          </div>
        )}

        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Have you been divorced?
          </label>
          <select
            name="divorced"
            value={profileData.divorced}
            onChange={(e) => handleInputChange(e.target.name, e.target.value)}
            className={`w-full p-4 border-2 rounded-xl focus:outline-none transition-colors ${profileData.gender === 'Female' ? 'border-[#FFE6FB] focus:border-[#FFE6FB]' : 'border-[#B6D4F5] focus:border-[#B6D4F5]'}`}
          >
            <option value="">Select an option</option>
            {yesNoOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Height
          </label>
          <div className="flex gap-4">
            <select
              name="heightFeet"
              value={Math.floor(profileData.height / 12) || ''}
              onChange={(e) => {
                const feet = parseInt(e.target.value) || 0;
                const inches = profileData.height % 12 || 0;
                handleInputChange('height', feet * 12 + inches);
              }}
              className={`w-1/2 p-4 border-2 rounded-xl focus:outline-none transition-colors ${profileData.gender === 'Female' ? 'border-[#FFE6FB] focus:border-[#FFE6FB]' : 'border-[#B6D4F5] focus:border-[#B6D4F5]'}`}
            >
              <option value="">Feet</option>
              {[3, 4, 5, 6, 7, 8].map((feet) => (
                <option key={feet} value={feet}>
                  {feet}'
                </option>
              ))}
            </select>
            <select
              name="heightInches"
              value={profileData.height % 12 || ''}
              onChange={(e) => {
                const feet = Math.floor(profileData.height / 12) || 0;
                const inches = parseInt(e.target.value) || 0;
                handleInputChange('height', feet * 12 + inches);
              }}
              className={`w-1/2 p-4 border-2 rounded-xl focus:outline-none transition-colors ${profileData.gender === 'Female' ? 'border-[#FFE6FB] focus:border-[#FFE6FB]' : 'border-[#B6D4F5] focus:border-[#B6D4F5]'}`}
            >
              <option value="">Inches</option>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((inches) => (
                <option key={inches} value={inches}>
                  {inches}"
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Appearance Preferences
          </label>
          <textarea
            name="appearancePreference"
            value={profileData.appearancePreference}
            onChange={(e) => handleInputChange(e.target.name, e.target.value)}
            className={`w-full p-4 border-2 rounded-xl focus:outline-none transition-colors ${profileData.gender === 'Female' ? 'border-[#FFE6FB] focus:border-[#FFE6FB]' : 'border-[#B6D4F5] focus:border-[#B6D4F5]'}`}
            rows="4"
            placeholder="Describe your preferences regarding physical appearance..."
          />
        </div>
      </div>
    </div>
  );

  const renderSection3 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#4A0635] mb-6">Your Journey With Islam</h2>
      <p className="text-gray-600 mb-8">
        Help us understand your religious practices and preferences. This information is crucial for finding compatible matches who share your values.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Prayer Pattern
          </label>
          <select
            name="salahPattern"
            value={profileData.salahPattern}
            onChange={(e) => handleInputChange('salahPattern', e.target.value)}
            className={`w-full p-4 border-2 rounded-xl focus:outline-none transition-colors ${profileData.gender === 'Female' ? 'border-[#FFE6FB] focus:border-[#FFE6FB]' : 'border-[#B6D4F5] focus:border-[#B6D4F5]'}`}
          >
            <option value="">Select Prayer Pattern</option>
            {salahPatternOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Sect
          </label>
          <select
            name="sect"
            value={profileData.sect}
            onChange={(e) => handleInputChange('sect', e.target.value)}
            className={`w-full p-4 border-2 rounded-xl focus:outline-none transition-colors ${profileData.gender === 'Female' ? 'border-[#FFE6FB] focus:border-[#FFE6FB]' : 'border-[#B6D4F5] focus:border-[#B6D4F5]'}`}
          >
            <option value="">Select Sect</option>
            {sectOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Madhab
          </label>
          <select
            name="madhab"
            value={profileData.madhab}
            onChange={(e) => handleInputChange('madhab', e.target.value)}
            className={`w-full p-4 border-2 rounded-xl focus:outline-none transition-colors ${profileData.gender === 'Female' ? 'border-[#FFE6FB] focus:border-[#FFE6FB]' : 'border-[#B6D4F5] focus:border-[#B6D4F5]'}`}
          >
            <option value="">Select Madhab</option>
            {madhabOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Open to Hijrah
          </label>
          <select
            name="openToHijrah"
            value={profileData.openToHijrah}
            onChange={(e) => handleInputChange('openToHijrah', e.target.value)}
            className={`w-full p-4 border-2 rounded-xl focus:outline-none transition-colors ${profileData.gender === 'Female' ? 'border-[#FFE6FB] focus:border-[#FFE6FB]' : 'border-[#B6D4F5] focus:border-[#B6D4F5]'}`}
          >
            <option value="">Select Option</option>
            {openToHijrahOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {profileData.openToHijrah === 'yes' && (
          <div className="md:col-span-2">
            <label className="block text-lg font-medium text-gray-700 mb-2">
              If so, where would you like to make Hijrah to?
            </label>
            <input
              type="text"
              name="hijrahDestination"
              value={profileData.hijrahDestination}
              onChange={(e) => handleInputChange('hijrahDestination', e.target.value)}
              className={`w-full p-4 border-2 rounded-xl focus:outline-none transition-colors ${profileData.gender === 'Female' ? 'border-[#FFE6FB] focus:border-[#FFE6FB]' : 'border-[#B6D4F5] focus:border-[#B6D4F5]'}`}
              placeholder="Enter potential hijrah destination..."
            />
          </div>
        )}

        {profileData.gender === 'Female' && (
          <>
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Dressing Style
              </label>
              <select
                name="dressingStyle"
                value={profileData.dressingStyle}
                onChange={(e) => handleInputChange('dressingStyle', e.target.value)}
                className={`w-full p-4 border-2 rounded-xl focus:outline-none transition-colors ${profileData.gender === 'Female' ? 'border-[#FFE6FB] focus:border-[#FFE6FB]' : 'border-[#B6D4F5] focus:border-[#B6D4F5]'}`}
              >
                <option value="">Select Dressing Style</option>
                {dressStyleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Open to Polygamy
              </label>
              <select
                name="openToPolygamy"
                value={profileData.openToPolygamy}
                onChange={(e) => handleInputChange('openToPolygamy', e.target.value)}
                className={`w-full p-4 border-2 rounded-xl focus:outline-none transition-colors ${profileData.gender === 'Female' ? 'border-[#FFE6FB] focus:border-[#FFE6FB]' : 'border-[#B6D4F5] focus:border-[#B6D4F5]'}`}
              >
                <option value="">Select Option</option>
                {yesNoOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* Quran Memorisation field centered on md+ screens */}
        <div className="md:col-span-2 flex justify-center items-center">
          <div className="w-full md:w-1/2">
            <label className="block text-lg font-medium text-gray-700 mb-2 text-center md:text-left">
              Quran Memorisation
            </label>
            <select
              name="quranMemorization"
              value={profileData.quranMemorization}
              onChange={(e) => handleInputChange('quranMemorization', e.target.value)}
              className={`w-full p-4 border-2 rounded-xl focus:outline-none transition-colors ${profileData.gender === 'Female' ? 'border-[#FFE6FB] focus:border-[#FFE6FB]' : 'border-[#B6D4F5] focus:border-[#B6D4F5]'}`}
            >
              <option value="">Select Quran Memorisation Level</option>
              {quranMemorizationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSection4 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#4A0635] mb-6">Let's Secure Your Account</h2>
      <p className="text-gray-600 mb-8">
        Time to update your password! Choose a strong password to keep your account secure. Remember, a strong password helps protect your personal information.
      </p>

      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">
            New Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={profileData.password}
              onChange={(e) => {
                handleInputChange('password', e.target.value);
                validatePassword(e.target.value);
              }}
              className={`w-full p-4 border-2 rounded-xl focus:outline-none transition-colors ${profileData.gender === 'Female' ? 'border-[#FFE6FB] focus:border-[#FFE6FB]' : 'border-[#B6D4F5] focus:border-[#B6D4F5]'} ${
                passwordStrength >= 4 ? 'border-green-500' : 
                passwordStrength >= 3 ? 'border-orange-500' : 
                profileData.password ? 'border-red-500' : ''
              }`}
              placeholder="Enter your new password..."
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          
          {/* Password requirements helper text */}
          <div className="mt-2 text-sm text-gray-600">
            <p className="mb-2">Choose a strong password. It must be at least 8 characters long, include at least one uppercase letter, one lowercase letter, one digit, and one special character (e.g., !@#$%^&*).</p>
            <ul className="space-y-1">
              <li className={`flex items-center ${passwordRequirements.length ? 'text-green-600' : 'text-gray-500'}`}>
                <span className="mr-2">{passwordRequirements.length ? '✓' : '○'}</span>
                At least 8 characters
              </li>
              <li className={`flex items-center ${passwordRequirements.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
                <span className="mr-2">{passwordRequirements.uppercase ? '✓' : '○'}</span>
                One uppercase letter
              </li>
              <li className={`flex items-center ${passwordRequirements.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
                <span className="mr-2">{passwordRequirements.lowercase ? '✓' : '○'}</span>
                One lowercase letter
              </li>
              <li className={`flex items-center ${passwordRequirements.number ? 'text-green-600' : 'text-gray-500'}`}>
                <span className="mr-2">{passwordRequirements.number ? '✓' : '○'}</span>
                One number
              </li>
              <li className={`flex items-center ${passwordRequirements.special ? 'text-green-600' : 'text-gray-500'}`}>
                <span className="mr-2">{passwordRequirements.special ? '✓' : '○'}</span>
                One special character (!@#$%^&*)
              </li>
            </ul>
          </div>

          {/* Password strength meter */}
          {profileData.password && (
            <div className="mt-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">Password Strength:</span>
                <span className={`text-sm font-medium text-${getPasswordStrengthInfo().color}-600`}>
                  {getPasswordStrengthInfo().label}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    passwordStrength <= 2 ? 'bg-red-500' :
                    passwordStrength === 3 ? 'bg-orange-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${(passwordStrength / 5) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Confirm New Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={profileData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            className={`w-full p-4 border-2 rounded-xl focus:outline-none transition-colors ${profileData.gender === 'Female' ? 'border-[#FFE6FB] focus:border-[#FFE6FB]' : 'border-[#B6D4F5] focus:border-[#B6D4F5]'}`}
            placeholder="Confirm your new password..."
          />
          {profileData.confirmPassword && profileData.password !== profileData.confirmPassword && (
            <p className="mt-2 text-sm text-red-600">Passwords do not match</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderSection5 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#4A0635] mb-6">How Would You Like to Present Yourself?</h2>
      <p className="text-gray-600 mb-8">
        Your avatar is your first impression on the platform. Choose a new avatar or upload your own image to represent yourself authentically.
      </p>

      <div className="flex flex-col items-center">
        {profileData.gender === 'Male' ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((num) => (
              <div 
                key={`man${num}`}
                className={`cursor-pointer rounded-lg p-2 transition-all duration-300 ${profileData.avatar === `icon_man${num === 1 ? '' : num}.png` ? 'bg-[#1A495D] bg-opacity-20 ring-2 ring-[#1A495D]' : 'hover:bg-gray-100'}`}
                onClick={() => handleInputChange('avatar', `icon_man${num === 1 ? '' : num}.png`)}
              >
                <img 
                  src={`/icon_man${num === 1 ? '' : num}.png`} 
                  alt={`Male Avatar ${num}`}
                  className="w-full h-auto"
                />
                <div className="mt-2 text-center">
                  <button
                    type="button"
                    className={`px-4 py-1 rounded-full text-sm ${profileData.avatar === `icon_man${num === 1 ? '' : num}.png` ? 'bg-[#1A495D] text-white' : 'bg-gray-200 text-[#1A495D]'}`}
                  >
                    Option {num}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <div 
                key={`woman${num}`}
                className={`cursor-pointer rounded-lg p-2 transition-all duration-300 ${profileData.avatar === `icon_woman${num === 1 ? '' : num}.png` ? 'bg-[#1A495D] bg-opacity-20 ring-2 ring-[#1A495D]' : 'hover:bg-gray-100'}`}
                onClick={() => handleInputChange('avatar', `icon_woman${num === 1 ? '' : num}.png`)}
              >
                <img 
                  src={`/icon_woman${num === 1 ? '' : num}.png`} 
                  alt={`Female Avatar ${num}`}
                  className="w-full h-auto"
                />
                <div className="mt-2 text-center">
                  <button
                    type="button"
                    className={`px-4 py-1 rounded-full text-sm ${profileData.avatar === `icon_woman${num === 1 ? '' : num}.png` ? 'bg-[#1A495D] text-white' : 'bg-gray-200 text-[#1A495D]'}`}
                  >
                    Option {num}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {!profileData.gender && (
          <div className="text-center text-red-500 mt-4 mb-8">
            Please select your gender in the first section before choosing an avatar.
          </div>
        )}
        
        <div className="w-full text-center mb-4">
          <div className="relative">
            <hr className="border-t border-gray-300" />
            <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-gray-500">
              or upload your own
            </span>
          </div>
        </div>
        
        {/* Custom image upload option */}
        <div className="w-full mt-4 p-4 border-2 border-dashed border-[#1A495D] rounded-lg text-center">
          <h3 className="text-[#1A495D] font-semibold mb-3">Upload your own image</h3>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageChange} 
            className="mb-2"
          />
          <p className="text-xs text-gray-500">For best results, use a square image</p>
          
          {/* Show preview of cropped image if available */}
          {profileData.avatar === 'custom' && (
            <div className="mt-3 inline-block">
              <div className="relative w-24 h-24 bg-[#1A495D] bg-opacity-20 ring-2 ring-[#1A495D] rounded-lg p-2">
                <div className="text-center text-sm text-[#1A495D] font-medium">Custom</div>
                <div className="text-xs text-green-600 mt-2">✓ Ready to upload</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const handleSubmit = async () => {
    try {
      setError(null);
      
      // Validate passwords match
      if (profileData.password && profileData.password !== profileData.confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      // Validate password strength if password is being changed
      if (profileData.password && !validatePassword(profileData.password)) {
        setError("Password does not meet the requirements");
        return;
      }
      
      // If there's a password in the form and we have a resetToken, update the password first
      if (profileData.password && resetToken) {
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/change-password/${resetToken}`,
          { newPassword: profileData.password },
          { withCredentials: true }
        );
      }

      // Update the rest of the profile
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/profile/${user?.userId}`,
        profileData,
        { withCredentials: true }
      );
      if (response.status === 200) {
        // Handle successful update
        window.location.href = '/search'; // Redirect to dashboard after successful update
      }
    } catch (err) {
      setError("Failed to update profile. Please try again.");
      console.error("Error updating profile:", err);
    }
  };

  if (loading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen theme-bg px-4 py-6 sm:p-6">
      {/* Modal for image cropping */}
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

      <div className="max-w-4xl mx-auto">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          {currentSection === 1 && renderSection1()}
          {currentSection === 2 && renderSection2()}
          {currentSection === 3 && renderSection3()}
          {currentSection === 4 && renderSection4()}
          {currentSection === 5 && renderSection5()}
        </div>

        <div className="flex justify-between items-center">
          {currentSection > 1 && (
            <button
              onClick={() => setCurrentSection(prev => prev - 1)}
              className="theme-btn px-6 py-3 rounded-full text-lg font-semibold"
            >
              Previous
            </button>
          )}
          
          {currentSection < 5 ? (
            <button
              onClick={() => setCurrentSection(prev => prev + 1)}
              className="theme-btn px-6 py-3 rounded-full text-lg font-semibold ml-auto"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="theme-btn px-6 py-3 rounded-full text-lg font-semibold ml-auto"
            >
              Complete Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileUpdate; 