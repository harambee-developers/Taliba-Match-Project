import React, { useState, useEffect } from "react";
import { useAuth } from "../components/contexts/AuthContext";
import axios from "axios";
import { salahPatternOptions, madhabOptions } from "../data/fieldData";

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    userName: "",
    bio: "",
    location: "",
    salahPattern: "",
    madhab: "",
    sect: "",
    occupation: "",
    islamicStudies: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      setProfileData({
        userName: user.userName || "",
        bio: user.profile?.bio || "",
        location: user.location || "",
        salahPattern: user.profile?.salahPattern || "",
        madhab: user.profile?.madhab || "",
        sect: user.sect || "",
        occupation: user.occupation || "",
        islamicStudies: user.profile?.islamicStudies || "",
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

  const getLabelFromValue = (options, value) => {
    const option = options.find(opt => opt.value === value);
    return option ? option.label : "Not specified";
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
                {user?.firstName || "First"} {user?.lastName || "Last"} {user?.gender === 'male' ? '♂' : '♀'}
              </h2>
              <div className="text-3xl font-arabic text-[#4A0635]">
                السَّلامُ عَلَيْكُم
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6">
              <div>
                <div className="mb-6">
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    Kunya
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="userName"
                      value={profileData.userName}
                      onChange={handleInputChange}
                      className="w-full p-4 border-2 border-[#FFE1F3] rounded-xl focus:outline-none focus:border-[#E01D42] transition-colors"
                      placeholder="Your kunya..."
                    />
                  ) : (
                    <div className="p-4 bg-[#FFF1FE] rounded-xl">
                      {profileData.userName || "Not specified"}
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  {isEditing ? (
                    <textarea
                      name="bio"
                      value={profileData.bio}
                      onChange={handleInputChange}
                      className="w-full p-4 border-2 border-[#FFE1F3] rounded-xl focus:outline-none focus:border-[#E01D42] transition-colors"
                      rows="4"
                      placeholder="Tell us about yourself..."
                    />
                  ) : (
                    <div className="p-4 bg-[#FFF1FE] rounded-xl min-h-[100px]">
                      {profileData.bio || "Not specified"}
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="location"
                      value={profileData.location}
                      onChange={handleInputChange}
                      className="w-full p-4 border-2 border-[#FFE1F3] rounded-xl focus:outline-none focus:border-[#E01D42] transition-colors"
                      placeholder="Your location..."
                    />
                  ) : (
                    <div className="p-4 bg-[#FFF1FE] rounded-xl">
                      {profileData.location || "Not specified"}
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    Salah Pattern
                  </label>
                  {isEditing ? (
                    <select
                      name="salahPattern"
                      value={profileData.salahPattern}
                      onChange={handleInputChange}
                      className="w-full p-4 border-2 border-[#FFE1F3] rounded-xl focus:outline-none focus:border-[#E01D42] transition-colors"
                    >
                      <option value="">Select Salah Pattern</option>
                      {salahPatternOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-4 bg-[#FFF1FE] rounded-xl">
                      {getLabelFromValue(salahPatternOptions, profileData.salahPattern)}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="mb-6">
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    Madhab
                  </label>
                  {isEditing ? (
                    <select
                      name="madhab"
                      value={profileData.madhab}
                      onChange={handleInputChange}
                      className="w-full p-4 border-2 border-[#FFE1F3] rounded-xl focus:outline-none focus:border-[#E01D42] transition-colors"
                    >
                      <option value="">Select Madhab</option>
                      {madhabOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-4 bg-[#FFF1FE] rounded-xl">
                      {getLabelFromValue(madhabOptions, profileData.madhab)}
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    Occupation
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="occupation"
                      value={profileData.occupation}
                      onChange={handleInputChange}
                      className="w-full p-4 border-2 border-[#FFE1F3] rounded-xl focus:outline-none focus:border-[#E01D42] transition-colors"
                      placeholder="Your occupation..."
                    />
                  ) : (
                    <div className="p-4 bg-[#FFF1FE] rounded-xl">
                      {profileData.occupation || "Not specified"}
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    Islamic Studies
                  </label>
                  {isEditing ? (
                    <textarea
                      name="islamicStudies"
                      value={profileData.islamicStudies}
                      onChange={handleInputChange}
                      className="w-full p-4 border-2 border-[#FFE1F3] rounded-xl focus:outline-none focus:border-[#E01D42] transition-colors"
                      rows="4"
                      placeholder="Your Islamic studies background..."
                    />
                  ) : (
                    <div className="p-4 bg-[#FFF1FE] rounded-xl min-h-[100px]">
                      {profileData.islamicStudies || "Not specified"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;