import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../components/contexts/AuthContext'
import { useAlert } from '../components/contexts/AlertContext'
import Alert from '../components/Alert'
import MessageModal from '../components/modals/MessageModal'
import { useNavigate } from 'react-router-dom'
import { FaUser, FaLock, FaEye, FaEyeSlash, FaDownload, FaQuestionCircle, FaEnvelope } from 'react-icons/fa'
import SupportModal from '../components/modals/SupportModal'

export default function Settings() {
  const { user, token, logout, updateUser } = useAuth()
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { showAlert, alert } = useAlert()
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeletePassword, setShowDeletePassword] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    profileVisibility: 'partners',
    notifications: {
      email: true,
      push: true,
      matches: true,
      messages: true
    },
    language: user?.language || 'en',
    theme: user?.theme || 'light'
  })

  // Password visibility state
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  // Add password validation states
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });
  const [passwordStrength, setPasswordStrength] = useState(0);

  const subscriptions = user?.subscription || []

  // Load user data
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        userName: user.userName || '',
        email: user.email || '',
        profileVisibility: user.profileVisibility || 'partners',
      }))
    }
  }, [user])

  // Fetch subscription status from backend
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/payments/subscription-status`,
          { withCredentials: true }
        )
        setStatus(res.data.status)
      } catch (err) {
        setError('Could not load your subscription status.')
      } finally {
        setLoading(false)
      }
    }
    fetchStatus()
  }, [token])

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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  const handlePasswordChange = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      showAlert('New passwords do not match', 'error');
      return;
    }

    // Validate password strength
    if (!validatePassword(formData.newPassword)) {
      showAlert('Password does not meet the requirements', 'error');
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/change-password`,
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        },
        { 
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        showAlert('Password updated successfully', 'success');
        // Clear the password fields
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }));
      }
    } catch (error) {
      console.error('Error updating password:', error);
      if (error.response?.status === 404) {
        showAlert('User not found. Please try logging out and back in.', 'error');
      } else if (error.response?.status === 400) {
        showAlert(error.response.data.message || 'Current password is incorrect', 'error');
      } else {
        showAlert(error.response?.data?.message || 'Failed to update password', 'error');
      }
    }
  };

  const handleProfileUpdate = async () => {
    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/profile/${user._id}`,
        {
          userName: formData.userName,
          profileVisibility: formData.profileVisibility,
        },
        { withCredentials: true }
      )
      showAlert('Profile updated successfully', 'success')
      updateUser({ ...user, ...formData })
    } catch (error) {
      showAlert(error.response?.data?.message || 'Failed to update profile', 'error')
    }
  }

  const handleManageSubscription = async () => {
    if (!subscriptions?.customerId) {
      showAlert("No active subscription to manage.", "error")
      return
    }

    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/payments/customers/${subscriptions.customerId}`,
        { withCredentials: true }
      )

      if (data.url) {
        window.location.href = data.url
      } else {
        showAlert("Failed to retrieve billing portal URL", "error")
      }
    } catch (error) {
      showAlert("Error retrieving subscription data", "error")
    }
  }

  const handleDataExport = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/export-data`,
        {
          responseType: 'blob',
          withCredentials: true,
        }
      )
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'user-data.json')
      document.body.appendChild(link)
      link.click()
      link.remove()
      showAlert('Data export initiated. You will receive an email shortly.', 'success')
    } catch (error) {
      showAlert(error.response?.data?.message || 'Failed to export data', 'error')
    }
  }

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      showAlert('Please enter your password to confirm deletion', 'error');
      return;
    }

    try {
      // First verify the password
      const verifyResponse = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/verify-password`,
        {
          password: deletePassword
        },
        { 
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (verifyResponse.status === 200) {
        // If password is correct, proceed with deletion
        const response = await axios.delete(
          `${import.meta.env.VITE_BACKEND_URL}/api/user/delete/${user._id}`,
          { withCredentials: true }
        );

        if (response.status === 200) {
          showAlert("Your account has been deleted successfully.", "success");
          // Add a small delay before logout to allow the alert to be seen
          setTimeout(() => {
            logout();
            navigate("/");
          }, 1500);
        }
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      if (error.response?.status === 401) {
        showAlert("Incorrect password. Please try again.", "error");
      } else {
        showAlert(error.response?.data?.message || "Failed to delete account", "error");
      }
    }
  };

  const handleKunyaUpdate = async () => {
    if (!formData.userName.trim()) {
      showAlert('Please enter a kunya', 'error');
      return;
    }

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/kunya/${user._id}`,
        { userName: formData.userName.trim() },
        { 
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.status === 200) {
        showAlert('Kunya updated successfully', 'success');
        // Update the local form data to reflect the change
        setFormData(prev => ({
          ...prev,
          userName: formData.userName.trim()
        }));
      } else {
        showAlert('Failed to update kunya', 'error');
      }
    } catch (error) {
      console.error('Error in handleKunyaUpdate:', error);
      showAlert(error.response?.data?.message || 'Failed to update kunya', 'error');
    }
  };

  const handleSendFeedback = async () => {
    if (!feedbackMessage.trim()) {
      showAlert('Please enter your feedback.', 'error');
      return;
    }
    setFeedbackLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/support/feedback`,
        {
          email: user?.email || '',
          message: feedbackMessage.trim(),
        },
        { withCredentials: true }
      );
      showAlert('Thank you for your feedback!', 'success');
      setFeedbackMessage('');
      setFeedbackModalOpen(false);
    } catch (error) {
      showAlert(error.response?.data?.message || 'Failed to send feedback', 'error');
    } finally {
      setFeedbackLoading(false);
    }
  };

  return (
    <div className="min-h-screen theme-bg px-4 py-6 sm:p-6">
      {alert && <Alert />}
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-[#4A0635]">Settings</h1>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Account Section */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden mb-6">
          <div className="p-8">
            <h2 className="text-xl font-semibold text-[#4A0635] mb-4 flex items-center gap-2">
              <FaUser /> Account Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Name (Kunya)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.userName}
                    onChange={(e) => handleInputChange('userName', e.target.value)}
                    className="w-full p-2 border rounded-md"
                    placeholder="Enter your kunya"
                  />
                  <button
                    type="button"
                    onClick={handleKunyaUpdate}
                    className="theme-btn px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap"
                  >
                    Update Kunya
                  </button>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  A kunya is a nickname like Umm (mother of) or Abu (father of) followed by a name.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={formData.currentPassword}
                    onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={formData.newPassword}
                    onChange={(e) => {
                      handleInputChange('newPassword', e.target.value);
                      validatePassword(e.target.value);
                    }}
                    className={`w-full px-4 py-2 border rounded-lg ${
                      passwordStrength >= 4 ? 'border-green-500' :
                      passwordStrength >= 3 ? 'border-orange-500' :
                      formData.newPassword ? 'border-red-500' :
                      'border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
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
                {formData.newPassword && (
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600">Passwords do not match</p>
                )}
              </div>
              <button
                onClick={handlePasswordChange}
                className="theme-btn px-6 py-3 rounded-full text-base font-semibold"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>

        {/* Profile Settings Section - Commented out for now
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FaUser className="mr-2" /> Profile Settings
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Name (Kunya)
              </label>
              <input
                type="text"
                value={formData.userName}
                onChange={(e) => handleInputChange('userName', e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="Enter your kunya"
              />
              <p className="mt-1 text-sm text-gray-500">
                A kunya is a nickname like Umm (mother of) or Abu (father of) followed by a name.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="Enter your email"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleProfileUpdate}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Update Profile
              </button>
            </div>
          </div>
        </div>
        */}

        {/* Subscription Section */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden mb-6">
          <div className="p-8">
            {loading ? (
              <p className="text-center text-gray-500">Loading status…</p>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-[#4A0635] mb-4 flex items-center gap-2">
                  <FaEnvelope /> Your Plan
                  </h2>
                <p className="text-lg mb-4">
                    {status === 'active'
                      ? `✅ ${user?.subscription?.type?.charAt(0).toUpperCase() + user?.subscription?.type?.slice(1)} — Active`
                      : status === 'past_due'
                        ? '⚠️ Payment Past Due'
                        : status === 'canceled'
                          ? '❌ Subscription Canceled'
                          : '❌ Not Subscribed'}
                  </p>
                <div className="flex flex-wrap gap-4">
                  {status === 'active' ? (
                    <button
                      onClick={handleManageSubscription}
                      className="theme-btn px-6 py-3 rounded-full text-base font-semibold"
                    >
                      Manage Subscription
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate("/subscribe")}
                      className="theme-btn px-6 py-3 rounded-full text-base font-semibold"
                    >
                      Upgrade Membership
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Privacy & Security Section */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden mb-6">
          <div className="p-8">
            <h2 className="text-xl font-semibold text-[#4A0635] mb-4 flex items-center gap-2">
              <FaLock /> Privacy & Security
            </h2>
            <div className="space-y-4">
              <button
                onClick={handleDataExport}
                className="theme-btn px-6 py-3 rounded-full text-base font-semibold flex items-center gap-2"
              >
                <FaDownload /> Request Data Export
              </button>
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden mb-6">
          <div className="p-8">
            <h2 className="text-xl font-semibold text-[#4A0635] mb-4 flex items-center gap-2">
              <FaQuestionCircle /> Support & Feedback
            </h2>
            <div className="space-y-4">
              <button
                onClick={() => setFeedbackModalOpen(true)}
                className="block theme-btn px-6 py-3 rounded-full text-base font-semibold text-center w-full"
              >
                Send us Feedback
              </button>
              <button
                onClick={() => setFeedbackModalOpen(true)}
                className="block theme-btn px-6 py-3 rounded-full text-base font-semibold text-center w-full"
              >
                Contact Us
              </button>
            </div>
          </div>
        </div>

        {/* Delete Account Section */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="p-8">
            <h2 className="text-xl font-semibold text-[#4A0635] mb-4">
              Delete your Account
            </h2>
            <p className="text-gray-700 mb-4">
              Deleting your account will permanently remove all your data,
              and cannot be undone.
            </p>
            <button
              onClick={() => setIsOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-semibold transition"
            >
              Delete My Account
            </button>
          </div>
        </div>

        {/* Message Modal */}
        <MessageModal
          isOpen={isOpen}
          onClose={() => {
            setIsOpen(false);
            setDeletePassword(''); // Clear password when closing
          }}
          title="Account Deletion"
          onConfirm={handleDeleteAccount}
          text={
            <div className="space-y-4">
              <p className="text-white text-base">Are you sure you want to delete your account? This action is irreversible.</p>
              <div>
                <label className="block text-sm font-bold text-white mb-1">
                  Enter your password to confirm
                </label>
                <div className="relative">
                  <input
                    type={showDeletePassword ? 'text' : 'password'}
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowDeletePassword(!showDeletePassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800"
                  >
                    {showDeletePassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
            </div>
          }
        />

        {/* Feedback Modal */}
        <SupportModal isOpen={feedbackModalOpen} onClose={() => setFeedbackModalOpen(false)} title="Send us Feedback">
          <div className="space-y-4">
            <textarea
              className="w-full border rounded-md p-2 min-h-[100px]"
              placeholder="Write your feedback or message here..."
              value={feedbackMessage}
              onChange={e => setFeedbackMessage(e.target.value)}
              disabled={feedbackLoading}
            />
            <button
              onClick={handleSendFeedback}
              className="theme-btn px-6 py-2 rounded-full text-base font-semibold w-full"
              disabled={feedbackLoading}
            >
              {feedbackLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </SupportModal>
      </div>
    </div>
  )
}
