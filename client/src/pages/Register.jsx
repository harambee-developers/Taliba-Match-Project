import React, { useState, useEffect, useMemo, useRef } from 'react';
import Select from 'react-select';
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import occupationData from '../data/Occupations.json';
import { countries, ethnicityOptions, salahPatternOptions, quranMemorizationOptions, childrenOptions, sectOptions, dressStyleOptions, polygamyOptions, madhabOptions, openToHijrahOptions, languages } from '../data/fieldData'
import axios from 'axios'
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../components/contexts/AlertContext';

const usePageTitle = (title) => {
  useEffect(() => {
    document.title = title;
  }, [title]);
};

export const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    minHeight: '56px', // match your input/select height
    borderRadius: '1rem', // match your rounded-xl
    borderColor: state.isFocused ? '#E01D42' : '#FFE1F3', // match your border color
    boxShadow: 'none',
    paddingLeft: '1rem', // match your p-4
    paddingRight: '1rem',
    fontSize: '1.125rem', // match text-lg
    backgroundColor: 'white',
    '&:hover': {
      borderColor: '#E01D42',
    },
  }),
  valueContainer: (provided) => ({
    ...provided,
    padding: 0,
  }),
  input: (provided) => ({
    ...provided,
    margin: 0,
    padding: 0,
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#374151', // text-gray-700
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#a0aec0', // text-gray-400
    fontSize: '1.125rem',
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: '#FFE1F3',
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
    color: '#E01D42',
    ':hover': {
      backgroundColor: '#E01D42',
      color: 'white',
    },
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 20,
  }),
};

const RegisterPage = () => {
  const defaultFormData = {
    firstName: '',
    lastName: '',
    kunya: '',
    dob: '',
    gender: '',
    email: '',
    password: '',
    phone: '',
    location: '',
    openToHijrah: '',
    hijrahDestination: '',
    ethnicity: [],
    nationality: '',
    maritalStatus: '',
    revert: '',
    yearsRevert: '',
    salahPattern: '',
    sect: '',
    madhab: '',
    madhabOther: '',
    islamicBooks: '',
    quranMemorization: '',
    dressingStyle: '',
    openToPolygamy: '',
    islamicAmbitions: '',
    children: '',
    occupation: '',
    personality: '',
    hobbies: '',
    dealBreakers: '',
    bio: '',
    appearancePreference: '',
    height: '',
    weight: '',
    avatar: '',
    customImage: null,
    language: [],
  };
  const [formData, setFormData] = useState(() => {
    // Local Storage allows us to persist data even after refresh and page change. Enhances user experience by allowing data to still be there in case of 
    // accidental page refresh.
    const savedData = localStorage.getItem('formData');
    const parsed = savedData ? JSON.parse(savedData) : defaultFormData;
    // Ensure ethnicity is always an array
    return {
      ...parsed,
      ethnicity: Array.isArray(parsed.ethnicity) ? parsed.ethnicity : [],
    };
  });
  const { alert, showAlert } = useAlert()
  const [currentSection, setCurrentSection] = useState(1);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate()
  usePageTitle("Register with us now!")

  // Add state for image cropping
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
  
  // Add state for email validation
  const [emailValid, setEmailValid] = useState(null);
  
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
        showAlert("Custom image prepared for upload. Submit your form to complete registration.", "success");
      }, "image/jpeg");
    } else {
      showAlert("Please select and crop an image properly", "warning");
    }
  };

  // Calculate progress based on filled fields
  const calculateProgress = useMemo(() => {
    // Count total required fields
    const requiredFields = [
      'firstName', 
      'lastName', 
      'kunya', 
      'email', 
      'phone', 
      'location', 
      'ethnicity', 
      'nationality',
      'dob',   // Date of birth is required
      'gender' // Gender is required
    ];
    
    // Fields that become required based on other selections
    if (formData.openToHijrah === 'yes') {
      requiredFields.push('hijrahDestination');
    }
    
    if (formData.revert === 'yes') {
      requiredFields.push('yearsRevert');
    }
    
    if (formData.sect === 'other') {
      requiredFields.push('sectOther');
    }
    
    if (formData.madhab === 'other') {
      requiredFields.push('madhabOther');
    }
    
    if (formData.occupation === 'other') {
      requiredFields.push('occupationOther');
    }
    
    // Count filled required fields
    const filledRequiredFields = requiredFields.filter(field => {
      if (typeof formData[field] === 'string') {
        return formData[field].trim() !== '';
      }
      return formData[field] !== undefined && formData[field] !== null;
    });

    // Additional optional fields that count towards progress
    const optionalFields = [
      'openToHijrah', 
      'maritalStatus', 
      'revert', 
      'salahPattern', 
      'sect', 
      'madhab',
      'islamicBooks',
      'quranMemorization',
      'dressingStyle',
      'openToPolygamy',
      'islamicAmbitions',
      'children',
      'occupation',
      'personality',
      'hobbies',
      'dealBreakers',
      'bio',
      'appearancePreference',
      'height',
      'weight',
      'avatar'  // Include avatar selection in progress calculation
    ];
    
    const filledOptionalFields = optionalFields.filter(field => {
      if (field === 'avatar' && formData.avatar === 'custom' && formData.customImage) {
        return true; // Custom image counts as filled
      }
      
      if (typeof formData[field] === 'string') {
        return formData[field].trim() !== '';
      }
      return formData[field] !== undefined && formData[field] !== null;
    });
    
    // Calculate progress percentage
    // Required fields count more (70% of progress) than optional ones (30% of progress)
    const requiredFieldsPercent = filledRequiredFields.length / requiredFields.length * 0.7;
    const optionalFieldsPercent = filledOptionalFields.length / optionalFields.length * 0.3;
    
    return Math.min(100, Math.round((requiredFieldsPercent + optionalFieldsPercent) * 100));
  }, [formData]);

  // Section titles
  const sectionTitles = {
    1: "Let's start by telling us a bit about yourself!",
    2: "Your Journey With Islam",
    3: "Let's Get To Know You",
    4: "Choose your avatar"
  };

  const occupationOptions = occupationData.map((job) => ({
    value: job.title,
    label: job.title,
  }));

  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const updatedData = { ...prev, [field]: value };
      localStorage.setItem('formData', JSON.stringify(updatedData)); // Save to localStorage
      
      // Email validation
      if (field === 'email') {
        validateEmail(value);
      }
      
      return updatedData;
    });
  };
  
  // Email validation function
  const validateEmail = (email) => {
    if (!email) {
      setEmailValid(null);
      return;
    }
    
    // More comprehensive email regex
    const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    setEmailValid(emailRegex.test(email));
  };

  const nextSection = () => {
    if (currentSection === 3 && !formData.gender) {
      showAlert("Please select your gender in section 1 before choosing an avatar", "warning");
      setCurrentSection(1);
    } else if (currentSection === 1) {
      // Check age before proceeding from section 1
      if (!formData.dob) {
        showAlert("Please enter your date of birth", "warning");
        setErrors((prev) => ({ ...prev, dob: "Date of Birth is required" }));
        return;
      }
      
      // Validate age
      const birthDate = new Date(formData.dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDifference = today.getMonth() - birthDate.getMonth();
      
      // If birthday hasn't occurred yet this year, subtract a year
      if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      if (age < 18) {
        showAlert("You must be at least 18 years old to register", "warning");
        setErrors((prev) => ({ ...prev, dob: "You must be at least 18 years old to register" }));
        return;
      }
      
      setCurrentSection((prev) => prev + 1);
    } else {
      setCurrentSection((prev) => prev + 1);
    }
  };

  const prevSection = () => {
    setCurrentSection((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      // Navigate to the appropriate section with errors
      if (validationErrors.avatar) {
        setCurrentSection(4);
      } else if (validationErrors.bio || validationErrors.personality || validationErrors.hobbies || 
                validationErrors.dealBreakers || validationErrors.occupation || 
                validationErrors.occupationOther || validationErrors.appearancePreference || 
                validationErrors.height || validationErrors.weight || validationErrors.children) {
        setCurrentSection(3);
      } else if (validationErrors.revert || validationErrors.yearsRevert || 
                validationErrors.salahPattern || validationErrors.sect || 
                validationErrors.sectOther || validationErrors.madhab || 
                validationErrors.madhabOther || validationErrors.islamicBooks || 
                validationErrors.quranMemorization || validationErrors.dressingStyle || 
                validationErrors.openToPolygamy || validationErrors.islamicAmbitions) {
        setCurrentSection(2);
      } else {
        setCurrentSection(1);
      }
      
      showAlert("Some required fields are missing!", 'warning');
      setErrors(validationErrors);
      return;
    }

    try {
      let submitData = {...formData};
      let response;
      
      // If custom image, handle it differently with FormData
      if (formData.avatar === 'custom' && formData.customImage) {
        const formDataObj = new FormData();
        
        // Add all other form fields to FormData except customImage
        Object.keys(formData).forEach(key => {
          if (key !== 'customImage' && key !== 'avatar') {
            formDataObj.append(key, formData[key]);
          }
        });
        
        // Indicate that this is a custom profile image
        formDataObj.append('isCustomAvatar', 'true');
        
        // Add the custom image blob
        formDataObj.append('profileImage', formData.customImage, 'profile-pic.jpg');
        
        response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/register`,
          formDataObj,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        // For preset avatars, set the photo information correctly for the PhotoSchema
        // We don't need to send the actual image file since it's a reference to a static file
        const photoInfo = {
          url: formData.avatar // This is the path to the SVG file
        };
        
        // Remove the avatar field and add the photoInfo in the format expected by the API
        delete submitData.avatar;
        delete submitData.customImage;
        
        // Add the photo information
        submitData.photos = [photoInfo];
        
        response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/register`,
          submitData,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }

      if (response.status === 201) {
        showAlert("Registration successful!", "success");
        localStorage.removeItem('formData'); // Clear the form data from local storage
        setFormData(defaultFormData);
        navigate("/register-success");
      } else {
        showAlert(`Registration failed: ${response.data.message}`, "error");
      }
    } catch (error) {
      console.error("Error:", error);
      showAlert(`${error.response?.data?.message || "Registration failed"}`, "error");
    }
  };

  const validate = () => {
    const errors = {};
    
    // Required personal information
    if (!formData.firstName) errors.firstName = "First Name is required";
    if (!formData.lastName) errors.lastName = "Last Name is required";
    if (!formData.kunya) errors.kunya = "Kunya is required";
    if (!formData.gender) errors.gender = "Gender is required";
    if (!formData.email) {
      errors.email = "Email is required";
    } else {
      // More comprehensive email regex for validation
      const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = "Please enter a valid email address";
      }
    }

    // Password validation
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (!validatePassword(formData.password)) {
      errors.password = "Your password must be at least 8 characters and include uppercase, lowercase, a number, and a special character";
    }

    if (!formData.phone) errors.phone = "Phone number is required";
    if (!formData.location) errors.location = "Location is required";
    if (!formData.ethnicity || formData.ethnicity.length === 0) errors.ethnicity = "Ethnicity is required";
    if (!formData.nationality) errors.nationality = "Nationality is required";
    if (!formData.language || formData.language.length === 0) errors.language = "Language is required";
    
    // Check if avatar is selected
    if (!formData.avatar) {
      errors.avatar = "Please select an avatar or upload your own image";
    }
    
    // Check if dob is provided
    if (!formData.dob) {
      errors.dob = "Date of Birth is required";
    } else {
      // Check if user is at least 18 years old
      const birthDate = new Date(formData.dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDifference = today.getMonth() - birthDate.getMonth();
      
      // If birthday hasn't occurred yet this year, subtract a year
      if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      if (age < 18) {
        errors.dob = "You must be at least 18 years old to register";
      }
    }
    
    // Conditional validations
    if (formData.openToHijrah === 'yes' && !formData.hijrahDestination) {
      errors.hijrahDestination = "Hijrah destination is required when open to Hijrah";
    }
    
    if (formData.revert === 'yes' && !formData.yearsRevert) {
      errors.yearsRevert = "Years as a revert is required";
    }
    
    if (formData.sect === 'other' && !formData.sectOther) {
      errors.sectOther = "Please specify your sect";
    }
    
    if (formData.madhab === 'other' && !formData.madhabOther) {
      errors.madhabOther = "Please specify your madhab";
    }
    
    if (formData.occupation === 'other' && !formData.occupationOther) {
      errors.occupationOther = "Please specify your occupation";
    }
    
    return errors;
  };

  const countryOptions = countries.map((country) => ({
    value: country.label,
    label: country.label,
  }));

  // For the gender field
  const genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
  ];

  return (
    <div className="min-h-screen bg-[#FFF1FE] flex items-center justify-center relative">
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

      <form
        onSubmit={handleSubmit}
        className="w-[90%] md:w-[70%] lg:w-[60%] p-8 rounded-lg space-y-6"
      >
        {/* Header with Salaam */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-[#1A495D]">
            {sectionTitles[currentSection]}
          </h2>
          <div className="text-right">
            <div className="text-2xl font-arabic text-[#1A495D]">السَّلاَمُ عَلَيْكُمْ</div>
          </div>
        </div>
        
        {/* Progress Bar - now based on filled fields */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
          <div 
            className="bg-[#1A495D] h-2.5 rounded-full transition-all duration-500 ease-in-out" 
            style={{ width: `${calculateProgress}%` }}
          ></div>
          <div className="text-right text-xs text-[#1A495D] mt-1">{calculateProgress}% completed</div>
        </div>

        {currentSection === 1 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-gray-600 mb-2">First Name<span className="text-red-600 ml-1">*</span></label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="p-3 border border-[#1A495D] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1A495D] bg-white text-[#1A495D] placeholder-[#1A495D] placeholder-opacity-70"
                  placeholder="Enter your first name..."
                />
                {errors.firstName && (
                  <p className="mt-2 text-sm text-red-600">{errors.firstName}</p>
                )}
              </div>
              <div className="flex flex-col">
                <label className="text-gray-600 mb-2">Last Name<span className="text-red-600 ml-1">*</span></label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="p-3 border border-[#1A495D] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1A495D] bg-white text-[#1A495D] placeholder-[#1A495D] placeholder-opacity-70"
                  placeholder="Enter your last name..."
                />
                {errors.lastName && (
                  <p className="mt-2 text-sm text-red-600">{errors.lastName}</p>
                )}
              </div>
            </div>
            <div className="flex flex-col">
              <label className="text-gray-600 mb-2">Do you have a preferred Kunya?<span className="text-red-600 ml-1">*</span></label>
              <input
                type="text"
                name="kunya"
                value={formData.kunya}
                onChange={(e) => handleInputChange('kunya', e.target.value)}
                className="p-3 border border-[#1A495D] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1A495D] bg-white text-[#1A495D] placeholder-[#1A495D] placeholder-opacity-70"
                placeholder="Enter your Kunya..."
              />
              {errors.kunya && (
                <p className="mt-2 text-sm text-red-600">{errors.kunya}</p>
              )}
              <div className="mt-2 text-sm text-gray-500">
                <p>A kunya is a nickname like <span className="font-semibold">Umm (mother of)</span> or <span className="font-semibold">Abu (father of)</span> followed by a name. You can choose <span className="font-semibold">any name</span> — it doesn't have to be your child's.</p>
                <p className="mt-1">Example: <span className="italic">Umm Maryam, Abu Yusuf, Umm Rayyan</span></p>
              </div>
            </div>
            <div className="flex flex-col">
              <label className="text-gray-600 mb-2">Date of Birth (DOB)<span className="text-red-600 ml-1">*</span></label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={(e) => handleInputChange('dob', e.target.value)}
                className="p-3 border border-[#1A495D] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1A495D] bg-white text-[#1A495D] placeholder-[#1A495D] placeholder-opacity-70"
                required
              />
              {errors.dob && (
                <p className="mt-2 text-sm text-red-600">{errors.dob}</p>
              )}
            </div>
            <div className="flex flex-col">
              <label className="text-gray-600 mb-2">Gender<span className="text-red-600 ml-1">*</span></label>
              <Select
                options={genderOptions}
                value={genderOptions.find(option => option.value === formData.gender) || null}
                placeholder="Select gender..."
                onChange={(option) => handleInputChange('gender', option ? option.value : '')}
                styles={customSelectStyles}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-600 mb-2">Please enter your Email<span className="text-red-600 ml-1">*</span></label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`p-3 border rounded-md focus:outline-none focus:ring-2 w-full ${
                    emailValid === true ? 'border-green-500 focus:ring-green-500' : 
                    emailValid === false ? 'border-red-500 focus:ring-red-500' : 
                    'border-[#1A495D] focus:ring-[#1A495D]'
                  } bg-white text-[#1A495D] placeholder-[#1A495D] placeholder-opacity-70`}
                  placeholder="Enter your email..."
                />
                {emailValid === true && (
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </div>
              {errors.email ? (
                <p className="mt-2 text-sm text-red-600">{errors.email}</p>
              ) : emailValid === false && formData.email ? (
                <p className="mt-2 text-sm text-red-600">Please enter a valid email address</p>
              ) : (
                <p className="mt-2 text-xs text-gray-500">We'll never share your email with anyone else.</p>
              )}
            </div>
            <div className="flex flex-col">
              <label className="text-gray-600 mb-2">Create a Password<span className="text-red-600 ml-1">*</span></label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={(e) => {
                    handleInputChange('password', e.target.value);
                    validatePassword(e.target.value);
                  }}
                  onBlur={() => validatePassword(formData.password)}
                  className={`p-3 border rounded-md focus:outline-none focus:ring-2 w-full ${
                    passwordStrength >= 4 ? 'border-green-500 focus:ring-green-500' : 
                    passwordStrength >= 3 ? 'border-orange-500 focus:ring-orange-500' : 
                    formData.password ? 'border-red-500 focus:ring-red-500' : 
                    'border-[#1A495D] focus:ring-[#1A495D]'
                  } bg-white text-[#1A495D] placeholder-[#1A495D] placeholder-opacity-70`}
                  placeholder="Enter your password..."
                  aria-describedby="password-requirements"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#1A495D]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  )}
                </button>
              </div>
              
              {/* Password requirements helper text */}
              <div id="password-requirements" className="mt-2 text-sm text-gray-600">
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
              {formData.password && (
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

              {errors.password && (
                <p className="mt-2 text-sm text-red-600">{errors.password}</p>
              )}
            </div>
            <div className="flex flex-col">
              <label className="text-gray-600 mb-2">Please enter your phone number<span className="text-red-600 ml-1">*</span></label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="p-3 border border-[#1A495D] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1A495D] bg-white text-[#1A495D] placeholder-[#1A495D] placeholder-opacity-70"
                placeholder="Enter your phone number..."
              />
              {errors.phone && (
                <p className="mt-2 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>
            <div className="flex flex-col">
              <label className="text-gray-600 mb-2">Which Country Do You Currently Live In?<span className="text-red-600 ml-1">*</span></label>
              <Select
                options={countryOptions}
                value={countryOptions.find(option => option.value === formData.location) || null}
                placeholder="Select location..."
                onChange={(option) => handleInputChange('location', option ? option.value : '')}
                styles={customSelectStyles}
              />
              {errors.location && (
                <p className="mt-2 text-sm text-red-600">{errors.location}</p>
              )}
            </div>
            <div className="flex flex-col">
              <label className="text-gray-600 mb-2">Are You Open to Making Hijrah?</label>
              <Select
                options={openToHijrahOptions}
                value={openToHijrahOptions.find(option => option.value === formData.openToHijrah) || null}
                placeholder="Select an option..."
                onChange={(option) => handleInputChange('openToHijrah', option ? option.value : '')}
                styles={customSelectStyles}
              />
            </div>
            {formData.openToHijrah === 'yes' && (
              <div className="flex flex-col">
                <label className="text-gray-600 mb-2">If so, where?<span className="text-red-600 ml-1">*</span></label>
                <input
                  type="text"
                  name="hijrahDestination"
                  value={formData.hijrahDestination}
                  onChange={(e) => handleInputChange('hijrahDestination', e.target.value)}
                  className="p-3 border border-[#1A495D] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1A495D] bg-white text-[#1A495D] placeholder-[#1A495D] placeholder-opacity-70"
                  placeholder="Enter potential hijrah destination..."
                />
                {errors.hijrahDestination && (
                  <p className="mt-2 text-sm text-red-600">{errors.hijrahDestination}</p>
                )}
              </div>
            )}
            <div className="flex flex-col">
              <label className="text-gray-600 mb-2">What is your Ethnicity?<span className="text-red-600 ml-1">*</span></label>
              <Select
                isMulti
                options={ethnicityOptions}
                value={Array.isArray(formData.ethnicity) ? formData.ethnicity.map(eth => ({ value: eth, label: eth })) : []}
                placeholder="Select ethnicity..."
                onChange={(selectedOptions) => handleInputChange('ethnicity', selectedOptions ? selectedOptions.map(option => option.value) : [])}
                styles={customSelectStyles}
              />
              {errors.ethnicity && (
                <p className="mt-2 text-sm text-red-600">{errors.ethnicity}</p>
              )}
            </div>
            <div className="flex flex-col">
              <label className="text-gray-600 mb-2">What is your Nationality?<span className="text-red-600 ml-1">*</span></label>
              <Select
                options={countryOptions}
                value={countryOptions.find(option => option.value === formData.nationality) || null}
                placeholder="Select nationality"
                onChange={(option) => handleInputChange('nationality', option ? option.value : '')}
                styles={customSelectStyles}
              />
              {errors.nationality && (
                <p className="mt-2 text-sm text-red-600">{errors.nationality}</p>
              )}
            </div>
            <div className="flex flex-col">
              <label className="text-gray-600 mb-2">Languages Spoken<span className="text-red-600 ml-1">*</span></label>
              <Select
                isMulti
                name="language"
                value={Array.isArray(formData.language) ? formData.language.map(lang => ({ value: lang, label: lang })) : []}
                onChange={(selectedOptions) => handleInputChange('language', selectedOptions ? selectedOptions.map(option => option.value) : [])}
                options={languages.map(lang => ({ value: lang, label: lang }))}
                className="react-select-container"
                classNamePrefix="react-select"
                placeholder="Select languages..."
                isSearchable={true}
                styles={customSelectStyles}
              />
              {errors.language && (
                <p className="mt-2 text-sm text-red-600">{errors.language}</p>
              )}
            </div>
            <div className="flex flex-col">
              <label className="text-gray-600 mb-2">Are you Married?</label>
              <Select
                options={childrenOptions}
                value={childrenOptions.find(option => option.value === formData.maritalStatus) || null}
                placeholder="Select an option..."
                onChange={(option) => handleInputChange('maritalStatus', option ? option.value : '')}
                styles={customSelectStyles}
              />
            </div>
            <button
              type="button"
              onClick={nextSection}
              className="w-full py-3 bg-[#1A495D] text-white font-semibold rounded-md hover:bg-opacity-80 transition"
            >
              Next
            </button>
          </>
        )}

        {currentSection === 2 && (
          <>
            <div className="flex flex-col">
              <label className="text-gray-600 mb-2">Are you a Revert?</label>
              <Select
                options={childrenOptions}
                value={childrenOptions.find(option => option.value === formData.revert) || null}
                placeholder="Select an option..."
                onChange={(option) => handleInputChange('revert', option ? option.value : '')}
                styles={customSelectStyles}
              />
            </div>
            {formData.revert === 'yes' && (
              <div className="flex flex-col">
                <label className="text-gray-600 mb-2">If so, for how many years?<span className="text-red-600 ml-1">*</span></label>
                <input
                  type="number"
                  name="yearsRevert"
                  value={formData.yearsRevert}
                  onChange={(e) => handleInputChange('yearsRevert', e.target.value)}
                  className="p-3 border border-[#1A495D] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1A495D] bg-white text-[#1A495D] placeholder-[#1A495D] placeholder-opacity-70"
                  placeholder="Enter number of years..."
                />
                {errors.yearsRevert && (
                  <p className="mt-2 text-sm text-red-600">{errors.yearsRevert}</p>
                )}
              </div>
            )}
            <div className="flex flex-col">
              <label className="text-gray-600 mb-2">Pattern of Salah</label>
              <Select
                options={salahPatternOptions}
                value={salahPatternOptions.find(option => option.value === formData.salahPattern) || null}
                placeholder="Select salah pattern..."
                onChange={(option) => handleInputChange('salahPattern', option ? option.value : '')}
                styles={customSelectStyles}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-600 mb-2">Sect</label>
              <div className="space-y-2">
                <Select
                  options={sectOptions}
                  value={sectOptions.find(option => option.value === formData.sect) || null}
                  placeholder="Select Sect..."
                  onChange={(option) => handleInputChange('sect', option ? option.value : '')}
                  styles={customSelectStyles}
                />
                {formData.sect === 'other' && (
                  <input
                    type="text"
                    name="sectOther"
                    value={formData.sectOther || ''}
                    onChange={(e) => handleInputChange('sectOther', e.target.value)}
                    className="p-3 border border-[#1A495D] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1A495D] bg-white text-[#1A495D] placeholder-[#1A495D] placeholder-opacity-70 w-full"
                    placeholder="Specify other sect..."
                  />
                )}
                {errors.sectOther && (
                  <p className="mt-2 text-sm text-red-600">{errors.sectOther}</p>
                )}
              </div>
            </div>
            <div className="flex flex-col">
              <label className="text-gray-600 mb-2">Madhab</label>
              <Select
                options={madhabOptions}
                value={madhabOptions.find(option => option.value === formData.madhab) || null}
                placeholder="Select Madhab..."
                onChange={(option) => handleInputChange('madhab', option ? option.value : '')}
                styles={customSelectStyles}
              />
              {formData.madhab === 'other' && (
                <input
                  type="text"
                  name="madhabOther"
                  value={formData.madhabOther || ''}
                  onChange={(e) => handleInputChange('madhabOther', e.target.value)}
                  className="mt-2 p-3 border border-[#1A495D] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1A495D] bg-white text-[#1A495D] placeholder-[#1A495D] placeholder-opacity-70 w-full"
                  placeholder="Specify other madhab..."
                />
              )}
              {errors.madhabOther && (
                <p className="mt-2 text-sm text-red-600">{errors.madhabOther}</p>
              )}
            </div>
            <div className="flex flex-col">
              <label className="text-gray-600 mb-2">Islamic Books/Mutuun Studied</label>
              <input
                type="text"
                name="islamicBooks"
                value={formData.islamicBooks}
                onChange={(e) => handleInputChange('islamicBooks', e.target.value)}
                className="p-3 border border-[#1A495D] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1A495D] bg-white text-[#1A495D] placeholder-[#1A495D] placeholder-opacity-70"
                placeholder="Enter books or mutuun studied..."
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-600 mb-2">Quran Memorization (Hifdh Status, Surahs Known)</label>
              <Select
                options={quranMemorizationOptions}
                value={quranMemorizationOptions.find(option => option.value === formData.quranMemorization) || null}
                placeholder="Select memorization status..."
                onChange={(option) => handleInputChange('quranMemorization', option ? option.value : '')}
                styles={customSelectStyles}
              />
            </div>
            {formData.gender === 'female' && (
              <>
                <div className="flex flex-col">
                  <label className="text-gray-600 mb-2">Dressing Style (Hijab, Niqab, Modesty Level)</label>
                  <Select
                    options={dressStyleOptions}
                    value={dressStyleOptions.find(option => option.value === formData.dressingStyle) || null}
                    placeholder="Select dressing style..."
                    onChange={(option) => handleInputChange('dressingStyle', option ? option.value : '')}
                    styles={customSelectStyles}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-gray-600 mb-2">Are you open to polygamy?</label>
                  <Select
                    options={polygamyOptions}
                    value={polygamyOptions.find(option => option.value === formData.openToPolygamy) || null}
                    placeholder="Select an option..."
                    onChange={(option) => handleInputChange('openToPolygamy', option ? option.value : '')}
                    styles={customSelectStyles}
                  />
                </div>
              </>
            )}
            <div className="flex flex-col">
              <label className="text-gray-600 mb-2">Islamic Ambitions</label>
              <input
                type="text"
                name="islamicAmbitions"
                value={formData.islamicAmbitions}
                onChange={(e) => handleInputChange('islamicAmbitions', e.target.value)}
                className="p-3 border border-[#1A495D] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1A495D] bg-white text-[#1A495D] placeholder-[#1A495D] placeholder-opacity-70"
                placeholder="Enter your ambitions (e.g., Quran memorization, Arabic learning)..."
              />
            </div>
            <div className="flex justify-between space-x-4 mt-4">
              <button
                type="button"
                onClick={prevSection}
                className="w-1/2 py-3 bg-[#1A495D] text-white font-semibold rounded-md hover:bg-opacity-80 transition"
              >
                Back
              </button>
              <button
                type="button"
                onClick={nextSection}
                className="w-1/2 py-3 bg-[#1A495D] text-white font-semibold rounded-md hover:bg-opacity-80 transition"
              >
                Next
              </button>
            </div>
          </>
        )}

        {currentSection === 3 && (
          <>
            <div className="flex flex-col">
              <label className="text-gray-600 mb-2">Tell us about yourself</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                className="p-3 border border-[#1A495D] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1A495D] bg-white text-[#1A495D] placeholder-[#1A495D] placeholder-opacity-70"
                placeholder="Write a brief introduction about yourself..."
                rows={4}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-600 mb-2">Describe Your Personality</label>
              <input
                type="text"
                name="personality"
                value={formData.personality}
                onChange={(e) => handleInputChange('personality', e.target.value)}
                className="p-3 border border-[#1A495D] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1A495D] bg-white text-[#1A495D] placeholder-[#1A495D] placeholder-opacity-70"
                placeholder="Enter your personality (e.g., Funny, Patient)"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-600 mb-2">Hobbies & Interests</label>
              <input
                type="text"
                name="hobbies"
                value={formData.hobbies}
                onChange={(e) => handleInputChange('hobbies', e.target.value)}
                className="p-3 border border-[#1A495D] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1A495D] bg-white text-[#1A495D] placeholder-[#1A495D] placeholder-opacity-70"
                placeholder="Enter your hobbies (e.g., Reading, Cooking, Hiking)"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-600 mb-2">Deal Breakers and Non-Negotiables</label>
              <input
                type="text"
                name="dealBreakers"
                value={formData.dealBreakers}
                onChange={(e) => handleInputChange('dealBreakers', e.target.value)}
                className="p-3 border border-[#1A495D] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1A495D] bg-white text-[#1A495D] placeholder-[#1A495D] placeholder-opacity-70"
                placeholder="Enter deal breakers and non-negotiables"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-600 mb-2">Occupation/Work</label>
              <div className="space-y-2">
                <Select
                  options={occupationOptions}
                  value={occupationOptions.find(option => option.value === formData.occupation) || null}
                  placeholder="Select occupation"
                  onChange={(option) => handleInputChange('occupation', option ? option.value : '')}
                  styles={customSelectStyles}
                />
                {formData.occupation === 'other' && (
                  <input
                    type="text"
                    name="occupationOther"
                    value={formData.occupationOther || ''}
                    onChange={(e) => handleInputChange('occupationOther', e.target.value)}
                    className="p-3 border border-[#1A495D] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1A495D] bg-white text-[#1A495D] placeholder-[#1A495D] placeholder-opacity-70 w-full"
                    placeholder="Specify other occupation"
                  />
                )}
                {errors.occupationOther && (
                  <p className="mt-2 text-sm text-red-600">{errors.occupationOther}</p>
                )}
              </div>
            </div>
            <div className="flex flex-col">
              <label className="text-gray-600 mb-2">Appearance Preferences</label>
              <textarea
                name="appearancePreference"
                value={formData.appearancePreference}
                onChange={(e) => handleInputChange('appearancePreference', e.target.value)}
                className="p-3 border border-[#1A495D] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1A495D] bg-white text-[#1A495D] placeholder-[#1A495D] placeholder-opacity-70"
                placeholder="Describe your appearance preferences for a potential spouse..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-gray-600 mb-2">Height</label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={(e) => handleInputChange('height', e.target.value)}
                  className="p-3 border border-[#1A495D] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1A495D] bg-white text-[#1A495D] placeholder-[#1A495D] placeholder-opacity-70"
                  placeholder="Enter your height in cm (e.g., 178cm)"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-gray-600 mb-2">Weight</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                  className="p-3 border border-[#1A495D] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1A495D] bg-white text-[#1A495D] placeholder-[#1A495D] placeholder-opacity-70"
                  placeholder="Enter your weight in kg (e.g., 73kg)"
                />
              </div>
            </div>
            <div className="flex flex-col">
              <label className="text-gray-600 mb-2">Do you have children?</label>
              <Select
                options={childrenOptions}
                value={childrenOptions.find(option => option.value === formData.children) || null}
                placeholder="Select an option"
                onChange={(option) => handleInputChange('children', option ? option.value : '')}
                styles={customSelectStyles}
              />
            </div>
            <div className="flex justify-between space-x-4 mt-4">
              <button
                type="button"
                onClick={prevSection}
                className="w-1/2 py-3 bg-[#1A495D] text-white font-semibold rounded-md hover:bg-opacity-80 transition"
              >
                Back
              </button>
              <button
                type="button"
                onClick={nextSection}
                className="w-1/2 py-3 bg-[#1A495D] text-white font-semibold rounded-md hover:bg-opacity-80 transition"
              >
                Next
              </button>
            </div>
          </>
        )}

        {currentSection === 4 && (
          <>
            <div className="flex flex-col items-center">
              <label className="text-gray-600 mb-6 text-xl">Choose your avatar<span className="text-red-600 ml-1">*</span></label>
              
              {formData.gender === 'Male' ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  {[1, 2, 3, 4].map((num) => (
                    <div 
                      key={`man${num}`}
                      className={`cursor-pointer rounded-lg p-2 transition-all duration-300 ${formData.avatar === `icon_man${num === 1 ? '' : num}.png` ? 'bg-[#1A495D] bg-opacity-20 ring-2 ring-[#1A495D]' : 'hover:bg-gray-100'}`}
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
                          className={`px-4 py-1 rounded-full text-sm ${formData.avatar === `icon_man${num === 1 ? '' : num}.png` ? 'bg-[#1A495D] text-white' : 'bg-gray-200 text-[#1A495D]'}`}
                        >
                          Option {num}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  {/* First 4 female icons in a 2x2 or 4x1 grid */}
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <div 
                      key={`woman${num}`}
                      className={`cursor-pointer rounded-lg p-2 transition-all duration-300 ${formData.avatar === `icon_woman${num === 1 ? '' : num}.png` ? 'bg-[#1A495D] bg-opacity-20 ring-2 ring-[#1A495D]' : 'hover:bg-gray-100'}`}
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
                          className={`px-4 py-1 rounded-full text-sm ${formData.avatar === `icon_woman${num === 1 ? '' : num}.png` ? 'bg-[#1A495D] text-white' : 'bg-gray-200 text-[#1A495D]'}`}
                        >
                          Option {num}
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {/* 5th female icon centered */}
                  <div className="col-span-2 md:col-span-4 flex justify-center mt-4">
                    <div 
                      className={`cursor-pointer rounded-lg p-2 transition-all duration-300 ${formData.avatar === 'icon_woman5.png' ? 'bg-[#1A495D] bg-opacity-20 ring-2 ring-[#1A495D]' : 'hover:bg-gray-100'} w-1/2 md:w-1/4`}
                      onClick={() => handleInputChange('avatar', 'icon_woman5.png')}
                    >
                      <img 
                        src="/icon_woman5.png" 
                        alt="Female Avatar 5"
                        className="w-full h-auto"
                      />
                      <div className="mt-2 text-center">
                        <button
                          type="button"
                          className={`px-4 py-1 rounded-full text-sm ${formData.avatar === 'icon_woman5.png' ? 'bg-[#1A495D] text-white' : 'bg-gray-200 text-[#1A495D]'}`}
                        >
                          Option 5
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {!formData.gender && (
                <div className="text-center text-red-500 mt-4 mb-8">
                  Please select your gender in the first section before choosing an avatar.
                </div>
              )}
              
              {errors.avatar && (
                <div className="text-center text-red-600 mt-4 mb-4 w-full">
                  {errors.avatar}
                </div>
              )}
              
              <div className="w-full text-center mb-4">
                <div className="relative">
                  <hr className="border-t border-gray-300" />
                  <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#FFF1FE] px-4 text-gray-500">
                    or upload your own
                  </span>
                </div>
              </div>
              
              {/* Custom image upload option - now after the avatars */}
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
                {formData.avatar === 'custom' && (
                  <div className="mt-3 inline-block">
                    <div className="relative w-24 h-24 bg-[#1A495D] bg-opacity-20 ring-2 ring-[#1A495D] rounded-lg p-2">
                      <div className="text-center text-sm text-[#1A495D] font-medium">Custom</div>
                      <div className="text-xs text-green-600 mt-2">✓ Ready to upload</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-between space-x-4 mt-8">
              <button
                type="button"
                onClick={prevSection}
                className="w-1/2 py-3 bg-[#1A495D] text-white font-semibold rounded-md hover:bg-opacity-80 transition"
              >
                Back
              </button>
              <button
                type="submit"
                className="w-1/2 py-3 bg-[#1A495D] text-white font-semibold rounded-md hover:bg-opacity-80 transition"
                disabled={!formData.avatar}
              >
                Submit
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
};

export default RegisterPage;
