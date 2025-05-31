import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../components/contexts/AuthContext'
import { useAlert } from '../components/contexts/AlertContext'
import Alert from '../components/Alert'
import MessageModal from '../components/modals/MessageModal'
import { useNavigate } from 'react-router-dom'

export default function Settings() {
  const { user, token, logout } = useAuth()
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { showAlert, alert } = useAlert()
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate()

  const subscriptions = user?.subscription || [];

  // Fetch subscription status from backend
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/payments/subscription-status`,
          { withCredentials: true }
        )
        setStatus(res.data.status)    // e.g. 'active' | 'past_due' | 'canceled' | null
      } catch (err) {
        setError('Could not load your subscription status.')
      } finally {
        setLoading(false)
      }
    }
    fetchStatus()
  }, [token])

  const handleManageSubscription = async () => {
    if (!subscriptions?.customerId) {
      showAlert("No active subscription to manage.", "error");
      return;
    }

    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/payments/customers/${subscriptions.customerId}`,
        { withCredentials: true }
      );

      if (data.url) {
        window.location.href = data.url
      } else {
        showAlert("Failed to retrieve billing portal URL", "error");
      }
    } catch (error) {
      showAlert("Error retrieving subscription data", "error");
    }
  };

  /**
   * Handles account deletion confirmation and request.
  */
  const handleDeleteAccount = async () => {
    try {
      const response = await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/user/delete/${user.userId}`);

      if (response.status === 200) {
        showAlert("Your account has been deleted successfully.", "success");
        logout(); // Log out the user after deletion
        navigate("/")
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      showAlert(error.response?.data?.message || "Failed to delete account", "error");
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

        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="p-8">
            {loading ? (
              <p className="text-center text-gray-500">Loading status…</p>
            ) : (
              <>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-[#4A0635] mb-2">
                    Your Plan
                  </h2>
                  <p className="text-lg">
                    {status === 'active'
                      ? `✅ ${user?.subscription?.type?.charAt(0).toUpperCase() + user?.subscription?.type?.slice(1)} — Active`
                      : status === 'past_due'
                        ? '⚠️ Payment Past Due'
                        : status === 'canceled'
                          ? '❌ Subscription Canceled'
                          : '❌ Not Subscribed'}
                  </p>
                </div>

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
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden mt-6">
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
          onClose={() => setIsOpen(false)}
          title="Account Deletion"
          onConfirm={() => {
            handleDeleteAccount();
            setIsOpen(false);
          }}
          text="Are you sure you want to delete your account? This action is irreversible"
        />
      </div>
    </div>
  )
}
