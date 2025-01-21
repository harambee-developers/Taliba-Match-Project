import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import occupationData from '../data/Occupations.json';
import { countries, ethnicityOptions, salahPatternOptions, quranMemorizationOptions, childrenOptions, sectOptions } from '../data/fieldData'
import Alert from '../components/Alert';
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
    backgroundColor: '#E01D42',
    borderColor: '#E01D42',
    color: '#FFFFFF',
    input: {
      color: '#FFFFFF',
    },
  }),
  input: (provided) => ({
    ...provided,
    color: '#FFFFFF',
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#FFFFFF',
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: '#E01D42',
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#9A1C30' : '#E01D42',
    color: '#FFFFFF',
    '&:hover': {
      backgroundColor: '#9A1C30',
      color: '#FFFFFF',
    },
  }),
  noOptionsMessage: (provided) => ({
    ...provided,
    color: '#FFFFFF',
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: '#9A1C30',
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: '#FFFFFF',
  }),
  multiValueRemove: (provided) => ({
    ...provided,
    color: '#FFFFFF',
    ':hover': {
      backgroundColor: '#9A1C30',
      color: '#FFFFFF',
    },
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#FFFFFF',
  }),
};

const RegisterPage = () => {
  const defaultFormData = {
    firstName: '',
    lastName: '',
    kunya: '',
    dob: '',
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
    islamicAmbitions: '',
    children: '',
    occupation: '',
    personality: '',
    dealBreakers: '',
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
  return (
    <div className="min-h-screen bg-[#FFF1FE] flex items-center justify-center relative">
      {/* Render alert component */}
      {alert && <Alert />}
      <form
        onSubmit={handleSubmit}
        className="w-[90%] md:w-[50%] lg:w-[40%] p-8 rounded-lg space-y-6"
      >
        {currentSection === 1 && (
          <>
            <h1 className="text-2xl font-semibold text-center text-gray-800">Start by telling us a bit about yourself</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-gray-600 mb-2">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#E01D42] bg-[#E01D42] text-white placeholder-white"
                  placeholder="Enter your first name..."
                />
                {errors.firstName && (
                  <p className="mt-2 text-sm text-yellow-500">{errors.firstName}</p>
                )}
              </div>
              <div className="flex flex-col">
                <label className="text-gray-600 mb-2">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#E01D42] bg-[#E01D42] text-white placeholder-white"
                  placeholder="Enter your last name..."
                />
                {errors.lastName && (
                  <p className="mt-2 text-sm text-yellow-500">{errors.lastName}</p>
                )}
              </div>
            </div>
            <div className="flex flex-col">
              <label className="text-gray-600 mb-2">Do you have a preferred Kunya?</label>
              <input
                type="text"
                name="kunya"
                value={formData.kunya}
                onChange={(e) => handleInputChange('kunya', e.target.value)}
                className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#E01D42] bg-[#E01D42] text-white placeholder-white"
                placeholder="Enter your Kunya..."
              />
              {errors.kunya && (
                <p className="mt-2 text-sm text-yellow-500">{errors.kunya}</p>
              )}
            </div>
            <div className="flex flex-col">
              <label className="text-gray-600 mb-2">Date of Birth (DOB)</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={(e) => handleInputChange('dob', e.target.value)}
                className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#E01D42] bg-[#E01D42] text-white placeholder-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-600 mb-2">Please enter your Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#E01D42] bg-[#E01D42] text-white placeholder-white"
                placeholder="Enter your email..."
              />
              {errors.email && (
                <p className="mt-2 text-sm text-yellow-500">{errors.email}</p>
              )}
            </div>
            <div className="flex flex-col">
              <label className="text-gray-600 mb-2">Please enter your phone number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#E01D42] bg-[#E01D42] text-white placeholder-white"
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
                  className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#E01D42] bg-[#E01D42] text-white placeholder-white"
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
                  className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#E01D42] bg-[#E01D42] text-white placeholder-white"
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
              className="w-full py-3 bg-[#E01D42] text-white font-semibold rounded-md hover:bg-[#9A1C30] transition"
            >
              Next
            </button>
          </>
        )}

        {currentSection === 2 && (
          <>
            <h1 className="text-2xl font-semibold text-center text-gray-800">Your Journey With Islam</h1>
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
                  className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#E01D42] bg-[#E01D42] text-white placeholder-white"
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
                    className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#E01D42] bg-[#E01D42] text-white placeholder-white w-full"
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
                className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#E01D42] bg-[#E01D42] text-white placeholder-white"
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
            <div className="flex flex-col">
              <label className="text-gray-600 mb-2">Dressing Style (Hijab, Niqab, Modesty Level)</label>
              <input
                type="text"
                name="dressingStyle"
                value={formData.dressingStyle}
                onChange={(e) => handleInputChange('dressingStyle', e.target.value)}
                className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#E01D42] bg-[#E01D42] text-white placeholder-white"
                placeholder="Enter dressing style..."
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-600 mb-2">Islamic Ambitions</label>
              <input
                type="text"
                name="islamicAmbitions"
                value={formData.islamicAmbitions}
                onChange={(e) => handleInputChange('islamicAmbitions', e.target.value)}
                className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#E01D42] bg-[#E01D42] text-white placeholder-white"
                placeholder="Enter your ambitions (e.g., Quran memorization, Arabic learning)..."
              />
            </div>
            <div className="flex justify-between space-x-4 mt-4">
              <button
                type="button"
                onClick={prevSection}
                className="w-1/2 py-3 bg-[#E01D42] text-white font-semibold rounded-md hover:bg-[#9A1C30] transition"
              >
                Back
              </button>
              <button
                type="button"
                onClick={nextSection}
                className="w-1/2 py-3 bg-[#E01D42] text-white font-semibold rounded-md hover:bg-[#9A1C30] transition"
              >
                Next
              </button>
            </div>
          </>
        )}

        {currentSection === 3 && (
          <>
            <h1 className="text-2xl font-semibold text-center text-gray-800">Let’s Get To Know You</h1>
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
                    className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#E01D42] bg-[#E01D42] text-white placeholder-white w-full"
                    placeholder="Specify other occupation"
                  />
                )}
              </div>
            </div>
            <div className="flex flex-col">
              <label className="text-gray-600 mb-2">Describe Your Personality</label>
              <input
                type="text"
                name="personality"
                value={formData.personality}
                onChange={(e) => handleInputChange('personality', e.target.value)}
                className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#E01D42] bg-[#E01D42] text-white placeholder-white"
                placeholder="Enter your personality (e.g., Funny, Patient)"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-600 mb-2">Deal Breakers and Non-Negotiables</label>
              <input
                type="text"
                name="dealBreakers"
                value={formData.dealBreakers}
                onChange={(e) => handleInputChange('dealBreakers', e.target.value)}
                className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#E01D42] bg-[#E01D42] text-white placeholder-white"
                placeholder="Enter deal breakers and non-negotiables"
              />
            </div>
            <div className="flex justify-between space-x-4 mt-4">
              <button
                type="button"
                onClick={prevSection}
                className="w-1/2 py-3 bg-[#E01D42] text-white font-semibold rounded-md hover:bg-[#9A1C30] transition"
              >
                Back
              </button>
              <button
                type="submit"
                className="w-1/2 py-3 bg-[#E01D42] text-white font-semibold rounded-md hover:bg-[#9A1C30] transition"
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
