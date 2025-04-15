import React, { useEffect } from "react";
import { useAlert } from "./contexts/AlertContext";
import { X, Info, CheckCircle, AlertTriangle, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const icons = {
  success: <CheckCircle className="text-green-500 w-5 h-5" />,
  error: <AlertCircle className="text-red-500 w-5 h-5" />,
  warning: <AlertTriangle className="text-yellow-500 w-5 h-5" />,
  info: <Info className="text-blue-500 w-5 h-5" />,
};

const bgColors = {
  success: "bg-green-50",
  error: "bg-red-50",
  warning: "bg-yellow-50",
  info: "bg-blue-50",
};

const borderColors = {
  success: "border-green-200",
  error: "border-red-200",
  warning: "border-yellow-200",
  info: "border-blue-200",
};

const Alert = () => {
  const { alert, hideAlert } = useAlert();

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => hideAlert(), 5000); // auto-hide after 5s
      return () => clearTimeout(timer);
    }
  }, [alert, hideAlert]);

  return (
    <AnimatePresence>
      {alert && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className={`fixed top-6 right-6 z-50 w-full max-w-sm rounded-xl shadow-lg border p-4 flex items-start space-x-3
            ${bgColors[alert.type]} ${borderColors[alert.type]}`}
        >
          <div className="flex-shrink-0 pt-0.5">
            {icons[alert.type]}
          </div>
          <div className="flex-1 text-sm text-gray-800">
            {alert.message}
          </div>
          <button
            onClick={hideAlert}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Alert;
