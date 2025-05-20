import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/contexts/AuthContext";

const Subscription = () => {

    const navigate = useNavigate()
    const { user } = useAuth()

    const handlePayment = async (subscriptionType) => {
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

    const plans = [
        {
            name: "Free",
            description: "For individuals exploring halal marriage with basic access.",
            price: 0,
            features: [
                "Create a basic profile",
                "Browse matches daily",
                "Send and receive matches",
                "Access to Nikkah Library",
            ],
            bgColor: "bg-gray-800",
            hoverColor: "hover:bg-gray-700",
            textColor: "text-white",
            border: "",
            actionText: "Join for Free",
            subscriptionType: "free",
        },
        {
            name: "Gold",
            description: "Ideal for serious individuals ready for a halal, intentional marriage journey.",
            price: 9.99,
            features: [,,
                "Send unlimited connection requests",
                "In-app chat with approvied matches",
                "Can access full match profiles",,
            ],
            bgColor: "bg-[#D4AF37]",
            hoverColor: "hover:bg-[#B8962E]",
            textColor: "text-white",
            border: "border-2 border-[#D4AF37]",
            actionText: "Go Gold",
            subscriptionType: "gold",
        },
        {
            name: "Platinum",
            description: "Ideal for serious individuals ready for a halal, intentional marriage journey.",
            price: 14.99,
            features: [
                "Priority profile visibility",
                "In-app chat",
                "Can access full profiles",
                "Detailed compatibility filters",
            ],
            bgColor: "bg-[#E5E4E2]",
            hoverColor: "hover:bg-[#D1D0CE]",
            textColor: "text-white",
            border: "border-2 border-[#E5E4E2]",
            actionText: "Go Platinum",
            subscriptionType: "platinum",
        },
    ];

    const benefitList = [
        "Send and Receive Match requests",
        "Profile Visibility",
        "In-App Chat",
        "Nikah Resource Library",
        "Advanced match filters",
    ];

    const benefitsData = {
        "Standard": [
            "Unlimited",
            "X",
            "X",
            "Yes",
            "No",
        ],
        "Gold": [
            "Unlimited",
            "Unlimited",
            "Full Access",
            "Yes",
            "No",
        ],
        "Premium": [
            "Unlimited",
            "Unlimited",
            "Full Access",
            "Yes",
            "Yes",
        ],
    };

    const faqs = [
        {
            question: "Can I change my plan later?",
            answer: "Yes, you can upgrade or downgrade your plan at any time from your account settings.",
        },
        {
            question: "What happens if I reach my request limit?",
            answer: "If you reach your request limit, your access will be temporarily paused until the next billing cycle or until you upgrade your plan.",
        },
        {
            question: "Are there any hidden fees?",
            answer: "No, all fees are transparent and listed in the subscription pricing.",
        },
        {
            question: "Do you offer refunds?",
            answer: "We offer a 30-day money-back guarantee for first-time subscribers.",
        },
        {
            question: "How is support provided?",
            answer: "Support is provided based on your plan. Free users have access to community support, while Premium users have email support with faster response times.",
        },
    ];

    const [openFAQ, setOpenFAQ] = useState(null);

    const toggleFAQ = (index) => {
        setOpenFAQ(openFAQ === index ? null : index);
    };

    return (
        <>
            <div className="min-h-screen flex flex-col items-center justify-center p-6 theme-bg">
                {/* Plans */}
                <div className={`grid grid-cols-1 md:grid-cols-2 ${user ? "lg:grid-cols-2" : "lg:grid-cols-3"
                    } gap-6 max-w-7xl mb-10`}>
                    {plans.filter(plan => !(user && plan.subscriptionType === "free"))
                        .map((plan, index) => (
                            <div
                                key={index}
                                className={`relative bg-white rounded-lg shadow-lg p-6 ${plan.border}`}
                            >
                                <h3 className="text-lg font-bold text-gray-800">{plan.name}</h3>
                                <p className="mt-2 text-gray-600">{plan.description}</p>
                                <div className="mt-4">
                                    <p className="text-4xl font-bold text-gray-800">
                                        {typeof plan.price === "string" ? plan.price : `£${plan.price}`}
                                    </p>
                                    {typeof plan.price !== "string" && (
                                        <p className="text-sm text-gray-500">per month</p>
                                    )}
                                </div>
                                <ul className="mt-4 space-y-2">
                                    {plan.features.map((feature, featureIndex) => (
                                        <li key={featureIndex} className="flex items-center">
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
                                <button
                                    className={`mt-6 w-full ${plan.bgColor} ${plan.textColor} py-2 px-4 rounded ${plan.hoverColor}`}
                                    onClick={() => {
                                        if (plan.subscriptionType === "free") {
                                            navigate("/register");
                                        } else {
                                            handlePayment(plan.subscriptionType);
                                        }
                                    }}
                                >
                                    {plan.actionText}
                                </button>
                            </div>
                        ))}
                </div>

                <h1 className="text-gray-800 text-2xl py-10 font-bold">Plan Comparison</h1>
                <div className="overflow-x-auto bg-white rounded-lg shadow-lg w-full max-w-7xl">
                    <table className="table-auto w-full border-collapse border border-gray-300">
                        <thead>
                            <tr>
                                <th className="px-4 py-2 border border-gray-300 bg-gray-100">Benefit</th>
                                {Object.keys(benefitsData).filter(plan => !(user && plan === "Standard"))
                                    .map((plan, index) => (
                                        <th
                                            key={index}
                                            className="px-4 py-2 border border-gray-300 bg-gray-100"
                                        >
                                            {plan}
                                        </th>
                                    ))}
                            </tr>
                        </thead>
                        <tbody>
                            {benefitList.map((benefit, index) => (
                                <tr key={index}>
                                    <td className="px-4 py-2 border border-gray-300">{benefit}</td>
                                    {Object.keys(benefitsData).filter(plan => !(user && plan === "Standard"))
                                        .map((plan, planIndex) => (
                                            <td
                                                key={planIndex}
                                                className="px-4 py-2 border border-gray-300 text-center"
                                            >
                                                {benefitsData[plan][index]}
                                            </td>
                                        ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <h2 className="text-2xl font-bold text-gray-800 py-10">Frequently Asked Questions</h2>
                <div className="bg-white rounded-lg shadow-lg p-6 max-w-7xl w-full">
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div key={index} className="border-b border-gray-300 pb-4">
                                <button
                                    className="flex justify-between items-center w-full text-left focus:outline-none"
                                    onClick={() => toggleFAQ(index)}
                                >
                                    <h3 className="text-lg font-semibold text-gray-700">
                                        {faq.question}
                                    </h3>
                                    <span className="text-gray-600">
                                        {openFAQ === index ? "-" : "+"}
                                    </span>
                                </button>
                                {openFAQ === index && (
                                    <p className="text-gray-600 mt-2">{faq.answer}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Subscription;