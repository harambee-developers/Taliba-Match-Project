require("dotenv").config();
const express = require("express");
const { FRONTEND_URL, BACKEND_URL } = process.env;
const cors = require("cors");

// Import and initialize the MongoDB connection
require("./db")

const paymentRoutes = require("./routes/paymentRoutes");
const authRoutes = require("./routes/auth");
const port = 7777;
const app = express();

const corsOptions = {
  origin: "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"], // Ensure all necessary methods are allowed
};

app.use(express.json())
app.use(cors(corsOptions));

app.use("/api/payment", paymentRoutes); // Modularized routes
app.use("/api/auth", authRoutes); // Modularized routes

app.listen(port, () => {
  console.log(`Server listening at ${port}`);
});
