import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import occupationData from '../data/Occupations.json';

const customSelectStyles = {
  control: (provided) => ({
    ...provided,
    backgroundColor: '#800020',
    borderColor: '#800020',
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
    backgroundColor: '#800020',
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#9A1C30' : '#800020',
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
  const [formData, setFormData] = useState({
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
  });

  const [currentSection, setCurrentSection] = useState(1);

  const occupationOptions = occupationData.map((job) => ({
    value: job.title,
    label: job.title,
  }));

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const nextSection = () => {
    setCurrentSection((prev) => prev + 1);
  };

  const prevSection = () => {
    setCurrentSection((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form Data Submitted:', formData);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();

      if (response.ok) {
        alert("Registration successful!");
      } else {
        alert("Registration failed: " + result.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again later.");
    }
  };

  const countries = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
  ];

  const ethnicityOptions = [
    { label: "Arab (e.g., Egyptian, Lebanese, Saudi, etc)", value: "Arab" },
    { label: "South Asian (e.g., Indian, Pakistani, Bangladeshi, etc.)", value: "South Asian" },
    { label: "African (e.g., Nigerian, Somali, Sudanese, etc.)", value: "African" },
    { label: "Southeast Asian (e.g., Malaysian, Indonesian, Filipino, etc.)", value: "Southeast Asian" },
    { label: "Middle Eastern (non-Arab, e.g., Iranian, Turkish, Kurdish, etc.)", value: "Middle Eastern" },
    { label: "Central Asian (e.g., Uzbek, Kazakh, Tajik, etc.)", value: "Central Asian" },
    { label: "Caucasian/White", value: "White" },
    { label: "Black/African American", value: "Black" },
    { label: "Latino/Latina/Latinx", value: "Latina" },
    { label: "Mixed Ethnicity", value: "Mixed" },
    { label: "Other (please specify)", value: "Other" },
  ];

  const salahPatternOptions = [
    { value: 'prays_mosque', label: 'Prays in the masjid' },
    { value: 'prays_5_times', label: 'Prays 5 times a day on time' },
    { value: 'prays_most', label: 'Prays most prayers' },
    { value: 'prays_occasional', label: 'Prays occasionally' },
  ];

  const sectOptions = [
    { value: 'sunni', label: 'Sunni' },
    { value: 'shia', label: 'Shia' },
    { value: 'salafi', label: 'Salafi' },
    { value: 'sufi', label: 'Sufi' },
    { value: 'other', label: 'Other' },
  ];

  const quranMemorizationOptions = [
    { value: 'hafidh', label: 'Hafidh/Haafidah' },
    { value: '10_plus', label: '10 Juz +' },
    { value: '5_to_10', label: '5-10 Juz' },
    { value: '2_to_5', label: '2-5 Juz' },
    { value: '1_or_less', label: '1 Juz or less' },
  ];

  const childrenOptions = [
    { value: 'yes', label: 'yes' },
    { value: 'no', label: 'no' },
  ];

  const countryOptions = countries.map((country) => ({
    value: country,
    label: country,
  }));

  return (
    <div className="min-h-screen bg-[#FFF1FE] flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-[90%] md:w-[50%] lg:w-[40%] p-8 rounded-lg space-y-6"
      >
        {currentSection === 1 && (
          <>
            <h1 className="text-2xl font-semibold text-center text-gray-800">Start by telling us a bit about yourself</h1>
            <div className="flex space-x-4">
              <div className="flex flex-col w-1/2">
                <label className="text-gray-600 mb-2">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#800020] bg-[#800020] text-white placeholder-white"
                  placeholder="Enter your first name..."
                />
              </div>
              <div className="flex flex-col w-1/2">
                <label className="text-gray-600 mb-2">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#800020] bg-[#800020] text-white placeholder-white"
                  placeholder="Enter your lastname..."
                />
              </div>
            </div>
            <div className="flex flex-col">
              <label className="text-gray-600 mb-2">Do you have a preferred Kunya?</label>
              <input
                type="text"
                name="kunya"
                value={formData.kunya}
                onChange={(e) => handleInputChange('kunya', e.target.value)}
                className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#800020] bg-[#800020] text-white placeholder-white"
                placeholder="Enter your Kunya"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-600 mb-2">Date of Birth (DOB)</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={(e) => handleInputChange('dob', e.target.value)}
                className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#800020] bg-[#800020] text-white placeholder-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-600 mb-2">Please enter your Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#800020] bg-[#800020] text-white placeholder-white"
                placeholder="Enter your email"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-600 mb-2">Please enter your phone number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#800020] bg-[#800020] text-white placeholder-white"
                placeholder="Enter your phone number"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-600 mb-2">Which Country Do You Currently Live In?</label>
              <Select
                options={countryOptions}
                placeholder="Select location"
                onChange={(option) => handleInputChange('location', option ? option.value : '')}
                styles={customSelectStyles}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-600 mb-2">Are You Open to Making Hijrah?</label>
              <Select
                options={[{ value: 'yes', label: 'yes' }, { value: 'no', label: 'no' }]}
                placeholder="Select an option"
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
                  className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#800020] bg-[#800020] text-white placeholder-white"
                  placeholder="Enter potential hijrah destination"
                />
              </div>
            )}
            <div className="flex flex-col">
              <label className="text-gray-600 mb-2">What is your Ethnicity?</label>
              <Select
                options={ethnicityOptions}
                value={formData.ethnicity}
                placeholder="Select ethnicity"
                onChange={(selectedOptions) => handleInputChange('ethnicity', selectedOptions?.value || '')}
                styles={customSelectStyles}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-600 mb-2">What is your Nationality?</label>
              <Select
                options={countryOptions}
                placeholder="Select nationality"
                onChange={(option) => handleInputChange('nationality', option ? option.value : '')}
                styles={customSelectStyles}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-600 mb-2">Are you Married?</label>
              <Select
                options={[{ value: 'yes', label: 'yes' }, { value: 'no', label: 'no' }]}
                placeholder="Select an option"
                onChange={(option) => handleInputChange('maritalStatus', option ? option.value : '')}
                styles={customSelectStyles}
              />
            </div>
            <button
              type="button"
              onClick={nextSection}
              className="w-full py-3 bg-[#800020] text-white font-semibold rounded-md hover:bg-[#9A1C30] transition"
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
                options={[{ value: 'yes', label: 'yes' }, { value: 'no', label: 'no' }]}
                placeholder="Select an option"
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
                  className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#800020] bg-[#800020] text-white placeholder-white"
                  placeholder="Enter number of years"
                />
              </div>
            )}
            <div className="flex flex-col">
              <label className="text-gray-600 mb-2">Pattern of Salah</label>
              <Select
                options={salahPatternOptions}
                placeholder="Select salah pattern"
                onChange={(option) => handleInputChange('salahPattern', option ? option.value : '')}
                styles={customSelectStyles}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-600 mb-2">Sect</label>
              <div className="space-y-2">
                <Select
                  options={sectOptions}
                  placeholder="Select sect"
                  onChange={(option) => handleInputChange('sect', option ? option.value : '')}
                  styles={customSelectStyles}
                />
                {formData.sect === 'other' && (
                  <input
                    type="text"
                    name="sectOther"
                    value={formData.sectOther || ''}
                    onChange={(e) => handleInputChange('sectOther', e.target.value)}
                    className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#800020] bg-[#800020] text-white placeholder-white w-full"
                    placeholder="Specify other sect"
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
                className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#800020] bg-[#800020] text-white placeholder-white"
                placeholder="Enter books or mutuun studied"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-600 mb-2">Quran Memorization (Hifdh Status, Surahs Known)</label>
              <Select
                options={quranMemorizationOptions}
                placeholder="Select memorization status"
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
                className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#800020] bg-[#800020] text-white placeholder-white"
                placeholder="Enter dressing style"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-600 mb-2">Islamic Ambitions</label>
              <input
                type="text"
                name="islamicAmbitions"
                value={formData.islamicAmbitions}
                onChange={(e) => handleInputChange('islamicAmbitions', e.target.value)}
                className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#800020] bg-[#800020] text-white placeholder-white"
                placeholder="Enter your ambitions (e.g., Quran memorization, Arabic learning)"
              />
            </div>
            <div className="flex justify-between space-x-4 mt-4">
              <button
                type="button"
                onClick={prevSection}
                className="w-1/2 py-3 bg-[#9A1C30] text-white font-semibold rounded-md hover:bg-[#800020] transition"
              >
                Back
              </button>
              <button
                type="button"
                onClick={nextSection}
                className="w-1/2 py-3 bg-[#800020] text-white font-semibold rounded-md hover:bg-[#9A1C30] transition"
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
                    className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#800020] bg-[#800020] text-white placeholder-white w-full"
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
                className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#800020] bg-[#800020] text-white placeholder-white"
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
                className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#800020] bg-[#800020] text-white placeholder-white"
                placeholder="Enter deal breakers and non-negotiables"
              />
            </div>
            <div className="flex justify-between space-x-4 mt-4">
              <button
                type="button"
                onClick={prevSection}
                className="w-1/2 py-3 bg-[#9A1C30] text-white font-semibold rounded-md hover:bg-[#800020] transition"
              >
                Back
              </button>
              <button
                type="submit"
                className="w-1/2 py-3 bg-[#800020] text-white font-semibold rounded-md hover:bg-[#9A1C30] transition"
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
