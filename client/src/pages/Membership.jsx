import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../components/contexts/AuthContext'
import { useAlert } from '../components/contexts/AlertContext'
import Alert from '../components/Alert'

export default function MembershipArea() {
  const { user, token } = useAuth()
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { showAlert, alert } = useAlert()

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

  const handleUpgrade = async (subscriptionType) => {
    try {
      // Create a Stripe Checkout session on the backend
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/payments/create-checkout-session`,
        { userId: user.userId, subscriptionType }
      )
      console.log("Response data:", data);
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.log("No URL returned from server");
      }
    } catch (err) {
      console.error(err)
      setError('Unable to start the checkout process. Please try again.')
    }
  }

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

  return (
    <div className="min-h-screen theme-bg px-4 py-6 sm:p-6">
      {alert && <Alert />}
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-[#4A0635]">Membership</h1>
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
                      ? '✅ Premium — Active'
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
                      onClick={() => handleUpgrade("premium")}
                      className="theme-btn px-6 py-3 rounded-full text-base font-semibold"
                    >
                      Upgrade to Premium
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
