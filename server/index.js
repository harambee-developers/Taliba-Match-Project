require("dotenv").config();
const express = require("express");
const cors = require("cors");

// Import and initialize the MongoDB connection
require("./db")

const paymentRoutes = require("./routes/paymentRoutes");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/userRoutes");
const port = 7777;
const app = express();

const corsOptions = {
  origin: "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"], // Ensure all necessary methods are allowed
};

app.use(express.json())
app.use(cors(corsOptions));

app.use("/payment", paymentRoutes); // Modularized routes
app.use("/auth", authRoutes); // Modularized routes
app.use("/user", userRoutes); // Modularized routes

app.listen(port, () => {
  console.log(`Server listening at ${port}`);
});
