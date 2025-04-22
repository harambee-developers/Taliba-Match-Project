import React, { useState, useEffect, useMemo } from 'react';
import Select from 'react-select';
import occupationData from '../data/Occupations.json';
import { countries, ethnicityOptions, salahPatternOptions, quranMemorizationOptions, childrenOptions, sectOptions, dressStyleOptions, polygamyOptions } from '../data/fieldData'
import axios from 'axios'
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../components/contexts/AlertContext';

const usePageTitle = (title) => {
  useEffect(() => {
    document.title = title;
  }, [title]);
};

const customSelectStyles = {
  control: (provided) => ({
    ...provided,
    backgroundColor: '#FFFFFF',
    borderColor: '#1A495D',
    color: '#1A495D',
    input: {
      color: '#1A495D',
    },
  }),
  input: (provided) => ({
    ...provided,
    color: '#1A495D',
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#1A495D',
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: '#FFFFFF',
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#1A495D' : '#FFFFFF',
    color: state.isSelected ? '#FFFFFF' : '#1A495D',
    '&:hover': {
      backgroundColor: '#1A495D',
      color: '#FFFFFF',
    },
  }),
  noOptionsMessage: (provided) => ({
    ...provided,
    color: '#1A495D',
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: '#1A495D',
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: '#FFFFFF',
  }),
  multiValueRemove: (provided) => ({
    ...provided,
    color: '#FFFFFF',
    ':hover': {
      backgroundColor: '#1A495D',
      color: '#FFFFFF',
    },
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#1A495D',
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
  };
  const [formData, setFormData] = useState(() => {
    // Local Storage allows us to persist data even after refresh and page change. Enhances user experience by allowing data to still be there in case of 
    // accidental page refresh.
    const savedData = localStorage.getItem('formData');
    return savedData ? JSON.parse(savedData) : defaultFormData
  });
  const { alert, showAlert } = useAlert()
  const [currentSection, setCurrentSection] = useState(1);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate()
  usePageTitle("Register with us now!")

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
      'nationality'
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
      'dob', 
      'openToHijrah', 
      'maritalStatus', 
      'revert', 
      'salahPattern', 
      'sect', 
      'islamicBooks',
      'quranMemorization',
      'dressingStyle',
      'openToPolygamy',
      'islamicAmbitions',
      'children',
      'occupation',
      'personality',
      'hobbies',
      'dealBreakers'
    ];
    
    const filledOptionalFields = optionalFields.filter(field => {
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
    3: "Let's Get To Know You"
  };

  const occupationOptions = occupationData.map((job) => ({
    value: job.title,
    label: job.title,
  }));

  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const updatedData = { ...prev, [field]: value };
      localStorage.setItem('formData', JSON.stringify(updatedData)); // Save to localStorage
      return updatedData;
    });
  };

  const nextSection = () => {
    setCurrentSection((prev) => prev + 1);
  };

  const prevSection = () => {
    setCurrentSection((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      showAlert("Some required fields are missing!", 'warning');
      setErrors(validationErrors);
      return;
    }

    console.log("Form Data Submitted:", formData);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/register`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 201) {
        showAlert("Registration successful!", "success");
        setFormData(defaultFormData);
        navigate(
          "/register-success"
        )
      } else {
        showAlert(`Registration failed: ${response.data.message}`, "error");
      }
    } catch (error) {
      console.error("Error:", error);
      showAlert(`${error.response.data.message}`, "error");
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.kunya) errors.kunya = "Kunya is required";
    if (!formData.firstName) errors.firstName = "First Name is required";
    if (!formData.lastName) errors.lastName = "Last Name is required";
    if (!formData.gender) errors.gender = "Gender is required";
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }
    return errors;
  };

  const countryOptions = countries.map((country) => ({
    value: country,
    label: country,
  }));

  // For the gender field
  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
  ];

  return (
    <div className="min-h-screen bg-[#FFF1FE] flex items-center justify-center relative">
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
                <label className="text-gray-600 mb-2">First Name</label>
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
                <label className="text-gray-600 mb-2">Last Name</label>
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
              <label className="text-gray-600 mb-2">Date of Birth (DOB)</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={(e) => handleInputChange('dob', e.target.value)}
                className="p-3 border border-[#1A495D] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1A495D] bg-white text-[#1A495D] placeholder-[#1A495D] placeholder-opacity-70"
              />
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
              <label className="text-gray-600 mb-2">Please enter your Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="p-3 border border-[#1A495D] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1A495D] bg-white text-[#1A495D] placeholder-[#1A495D] placeholder-opacity-70"
                placeholder="Enter your email..."
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
            <div className="flex flex-col">
              <label className="text-gray-600 mb-2">Please enter your phone number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="p-3 border border-[#1A495D] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1A495D] bg-white text-[#1A495D] placeholder-[#1A495D] placeholder-opacity-70"
                placeholder="Enter your phone number..."
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-600 mb-2">Which Country Do You Currently Live In?</label>
              <Select
                options={countryOptions}
                value={countryOptions.find(option => option.value === formData.location) || null}
                placeholder="Select location..."
                onChange={(option) => handleInputChange('location', option ? option.value : '')}
                styles={customSelectStyles}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-600 mb-2">Are You Open to Making Hijrah?</label>
              <Select
                options={childrenOptions}
                value={childrenOptions.find(option => option.value === formData.openToHijrah) || null}
                placeholder="Select an option..."
                onChange={(option) => handleInputChange('openToHijrah', option ? option.value : '')}
                styles={customSelectStyles}
              />
            </div>
            {formData.openToHijrah === 'yes' && (
              <div className="flex flex-col">
                <label className="text-gray-600 mb-2">If so, where?</label>
                <input
                  type="text"
                  name="hijrahDestination"
                  value={formData.hijrahDestination}
                  onChange={(e) => handleInputChange('hijrahDestination', e.target.value)}
                  className="p-3 border border-[#1A495D] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1A495D] bg-white text-[#1A495D] placeholder-[#1A495D] placeholder-opacity-70"
                  placeholder="Enter potential hijrah destination..."
                />
              </div>
            )}
            <div className="flex flex-col">
              <label className="text-gray-600 mb-2">What is your Ethnicity?</label>
              <Select
                options={ethnicityOptions}
                value={ethnicityOptions.find(option => option.value === formData.ethnicity) || null}
                placeholder="Select ethnicity..."
                onChange={(selectedOptions) => handleInputChange('ethnicity', selectedOptions.value || '')}
                styles={customSelectStyles}
              />
            </div>
            {formData.ethnicity === 'Other' && (
              <div className="flex flex-col">
                <label className="text-gray-600 mb-2">Specify Ethnicity</label>
                <input
                  type="text"
                  name="ethnicity"
                  onChange={(e) => handleInputChange('ethnicity', e.target.value)}
                  className="p-3 border border-[#1A495D] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1A495D] bg-white text-[#1A495D] placeholder-[#1A495D] placeholder-opacity-70"
                  placeholder="Specify ethnicity...."
                />
              </div>
            )}
            <div className="flex flex-col">
              <label className="text-gray-600 mb-2">What is your Nationality?</label>
              <Select
                options={countryOptions}
                value={countryOptions.find(option => option.value === formData.nationality) || null}
                placeholder="Select nationality"
                onChange={(option) => handleInputChange('nationality', option ? option.value : '')}
                styles={customSelectStyles}
              />
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
                <label className="text-gray-600 mb-2">If so, for how many years?</label>
                <input
                  type="number"
                  name="yearsRevert"
                  value={formData.yearsRevert}
                  onChange={(e) => handleInputChange('yearsRevert', e.target.value)}
                  className="p-3 border border-[#1A495D] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1A495D] bg-white text-[#1A495D] placeholder-[#1A495D] placeholder-opacity-70"
                  placeholder="Enter number of years..."
                />
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
              </div>
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
                  type="text"
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
                  type="text"
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
                type="submit"
                className="w-1/2 py-3 bg-[#1A495D] text-white font-semibold rounded-md hover:bg-opacity-80 transition"
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
