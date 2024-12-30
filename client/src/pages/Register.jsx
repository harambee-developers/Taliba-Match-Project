import React, { useState } from 'react';
import Select from 'react-select'

const customSelectStyles = {
  control: (provided) => ({
    ...provided,
    backgroundColor: '#800020',
    borderColor: '#800020',
    color: 'white',
  }),
  placeholder: (provided) => ({
    ...provided,
    color: 'white',
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: '#800020',
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#9A1C30' : '#800020',
    color: 'white',
    '&:hover': {
      backgroundColor: '#9A1C30',
    },
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: '#9A1C30',
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: 'white',
  }),
  multiValueRemove: (provided) => ({
    ...provided,
    color: 'white',
    ':hover': {
      backgroundColor: '#9A1C30',
      color: 'white',
    },
  }),
  singleValue: (provided) => ({
    ...provided,
    color: 'white',
  }),
};

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    location: '',
    nationality: '',
    ethnicity: [],
    revert: '',
    yearsRevert: '',
    maritalStatus: '',
    children: '',
  });

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleEthnicityChange = (selectedOptions) => {
    const ethnicities = selectedOptions ? selectedOptions.map((option) => option.value) : [];
    setFormData({ ...formData, ethnicity: ethnicities });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Data Submitted:', formData);
    // form submission logic 
  };

  const countries = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
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
        <h1 className="text-2xl font-semibold text-center text-gray-800">
          Let’s Get To Know You
        </h1>

        {/* Location */}
        <div className="flex flex-col">
          <label className="text-gray-600 mb-2">Where are you based?</label>
          <Select
            options={countryOptions}
            placeholder="Select location"
            onChange={(option) => handleInputChange('location', option ? option.value : '')}
            styles={customSelectStyles}
          />
        </div>

        {/* Nationality */}
        <div className="flex flex-col">
          <label className="text-gray-600 mb-2">What is your nationality?</label>
          <Select
            options={countryOptions}
            placeholder="Select nationality"
            onChange={(option) => handleInputChange('nationality', option ? option.value : '')}
            styles={customSelectStyles}
          />
        </div>

        {/* Ethnicity */}
        <div className="flex flex-col">
          <label className="text-gray-600 mb-2">What is your ethnicity? (Select up to 3)</label>
          <Select
            isMulti
            options={countryOptions}
            placeholder="Select ethnicity"
            onChange={handleEthnicityChange}
            styles={customSelectStyles}
          />
          <small className="text-gray-500">You can select up to 3 ethnicities.</small>
        </div>

        {/* Revert */}
        <div className="flex flex-col">
          <label className="text-gray-600 mb-2">Are you a Revert?</label>
          <Select
            options={[{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }]}
            placeholder="Select an option"
            onChange={(option) => handleInputChange('revert', option ? option.value : '')}
            styles={customSelectStyles}
          />
        </div>

        {/* If Revert, Additional Question */}
        {formData.revert === 'Yes' && (
          <div className="flex flex-col">
            <label className="text-gray-600 mb-2">If so, for how many years?</label>
            <input
              type="number"
              name="yearsRevert"
              value={formData.yearsRevert}
              onChange={(e) => handleInputChange('yearsRevert', e.target.value)}
              className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#800020]"
              placeholder="Enter number of years"
            />
          </div>
        )}

        {/* Marital Status */}
        <div className="flex flex-col">
          <label className="text-gray-600 mb-2">Marital Status:</label>
          <Select
            options={[{ value: 'Single', label: 'Single' }, { value: 'Married', label: 'Married' }, { value: 'Divorced', label: 'Divorced' }]}
            placeholder="Select marital status"
            onChange={(option) => handleInputChange('maritalStatus', option ? option.value : '')}
            styles={customSelectStyles}
          />
        </div>

        {/* Children */}
        <div className="flex flex-col">
          <label className="text-gray-600 mb-2">Do you have any children?</label>
          <Select
            options={[{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }]}
            placeholder="Select an option"
            onChange={(option) => handleInputChange('children', option ? option.value : '')}
            styles={customSelectStyles}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3 bg-[#800020] text-white font-semibold rounded-md hover:bg-[#9A1C30] transition"
        >
          Next
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;
