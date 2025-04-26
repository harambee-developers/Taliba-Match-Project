const mongoose = require("mongoose");
if (process.env.NODE_ENV === "UAT") {
  MONGO_URI = "mongodb://uat-mongo-server:27017/TalibaDatabase";
} else {
  MONGO_URI = `mongodb://mongo-server:27017/TalibaDatabase`;
}
const logger = require('./logger')

const connectToDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
    });
    logger.info("Connected to MongoDB");
  } catch (error) {
    logger.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit the process with failure
  }
};

// Call the function to establish the connection
connectToDatabase();

// Export the mongoose connection
module.exports = mongoose.connection;

