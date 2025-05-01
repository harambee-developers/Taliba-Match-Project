// components/FilterModal.js
import React from "react";
import { countries, ethnicityOptions, salahPatternOptions, quranMemorizationOptions, childrenOptions, sectOptions, occupationOptions } from '../../data/fieldData'

const FilterModal = ({ isOpen, onClose, filters, onChange, onApply, onClear }) => {
    const countryOptions = countries.map((country) => ({
        value: country,
        label: country,
    }));

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-300 bg-opacity-50 flex items-center justify-center z-50">
            <div className="theme-bg rounded-2xl shadow-lg p-6 md:w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4">More Filters</h2>

                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <div>
                        <label className="block text-sm font-medium mb-1">Age Range</label>
                        <select
                            name="ageRange"
                            value={filters.ageRange || ""}
                            onChange={onChange}
                            className="w-full border-2 border-[#203449] rounded-md p-2"
                        >
                            <option value="">Select Age Range</option>
                            <option value="18-25">18–25</option>
                            <option value="26-35">26–35</option>
                            <option value="36-45">36–45</option>
                            <option value="46-55">46–55</option>
                            <option value="56+">56+</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Location</label>
                        <select
                            name="location"
                            value={filters.location || ""}
                            onChange={onChange}
                            className="w-full border-2 border-[#203449] rounded-md p-2"
                        >
                            <option value="">Select location</option>
                            {countryOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Ethnicity</label>
                        <select
                            name="ethnicity"
                            value={filters.ethnicity || ""}
                            onChange={onChange}
                            className="w-full border-2 border-[#203449] rounded-md p-2"
                        >
                            <option value="">Select ethnicity</option>
                            {ethnicityOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Revert</label>
                        <select 
                            name="revert" 
                            value={filters.revert || ""} 
                            onChange={onChange} 
                            className="w-full border-2 border-[#203449] rounded-md p-2"
                        >
                            <option value="">Select Revert Status</option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Salah Pattern</label>
                        <select
                            name="salahPattern"
                            value={filters.salahPattern || ""}
                            onChange={onChange}
                            className="w-full border-2 border-[#203449] rounded-md p-2"
                        >
                            <option value="">Select Salah Pattern</option>
                            {salahPatternOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Quran Memorization</label>
                        <select
                            name="quranMemorization"
                            value={filters.quranMemorization || ""}
                            onChange={onChange}
                            className="w-full border-2 border-[#203449] rounded-md p-2"
                        >
                            <option value="">Select Quran Memorization</option>
                            {quranMemorizationOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Has Children</label>
                        <select
                            name="hasChildren"
                            value={filters.hasChildren || ""}
                            onChange={onChange}
                            className="w-full border-2 border-[#203449] rounded-md p-2"
                        >
                            <option value="">Select Children Status</option>
                            {childrenOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Occupation</label>
                        <select
                            name="occupation"
                            value={filters.occupation || ""}
                            onChange={onChange}
                            className="w-full border-2 border-[#203449] rounded-md p-2"
                        >
                            <option value="">Select Occupation</option>
                            {occupationOptions.map((option) => (
                                <option key={option.title} value={option.title}>
                                    {option.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Select Marital Status</label>
                        <select 
                            name="maritalStatus" 
                            value={filters.maritalStatus || ""} 
                            onChange={onChange} 
                            className="w-full border-2 border-[#203449] rounded-md p-2"
                        >
                            <option value="">Select</option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Sect</label>
                        <select
                            name="sect"
                            value={filters.sect || ""}
                            onChange={onChange}
                            className="w-full border-2 border-[#203449] rounded-md p-2"
                        >
                            <option value="">Select your Sect</option>
                            {sectOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onClear}
                        className="px-4 py-2 rounded-md bg-rose-600 text-white hover:bg-rose-700"
                    >
                        Clear Filters
                    </button>
                    <button
                        onClick={() => {
                            onApply();
                            onClose();
                        }}
                        className="px-4 py-2 rounded-md theme-btn"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FilterModal;
