import React from "react";
import axios from "axios";

const Subscription = () => {
    
  const handlePayment = async () => {
    try {
      const response = await axios.post(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/payment/create-checkout-session/`
      );
      console.log("Response data:", response.data); // Debugging line
      if (response.data.url) {
        window.location.href = response.data.url; // Redirect to Stripe checkout
      } else {
        console.log("No URL returned from server");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
    }
  };
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        {/* Free Card */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800">Free</h3>
          <p className="mt-2 text-gray-600">
            Basic features for individuals just starting out.
          </p>
          <div className="mt-4">
            <p className="text-4xl font-bold text-gray-800">$0</p>
            <p className="text-sm text-gray-500">per month</p>
          </div>
          <ul className="mt-4 space-y-2">
            {["Access to basic features", "Community support"].map(
              (feature, index) => (
                <li key={index} className="flex items-center">
                  <svg
                    className="h-5 w-5 text-green-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="ml-2 text-gray-600">{feature}</span>
                </li>
              )
            )}
          </ul>
          <button className="mt-6 w-full bg-gray-800 text-white py-2 px-4 rounded hover:bg-gray-700">
            Get Started
          </button>
        </div>

        {/* Premium Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue-500">
          <h3 className="text-lg font-bold text-gray-800">Premium</h3>
          <p className="mt-2 text-gray-600">
            Advanced features for professionals.
          </p>
          <div className="mt-4">
            <p className="text-4xl font-bold text-gray-800">$49</p>
            <p className="text-sm text-gray-500">per month</p>
          </div>
          <ul className="mt-4 space-y-2">
            {[
              "All Free features",
              "Priority support",
              "Advanced analytics",
            ].map((feature, index) => (
              <li key={index} className="flex items-center">
                <svg
                  className="h-5 w-5 text-green-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="ml-2 text-gray-600">{feature}</span>
              </li>
            ))}
          </ul>
          <button className="mt-6 w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600" onClick={handlePayment}>
            Upgrade Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
