const dotenv = require('dotenv')
const express = require("express");
const cors = require("cors");

// Import and initialize the MongoDB connection
require("./db")
// Load the appropriate .env file
const envFile = process.env.NODE_ENV === "production" ? ".env.production" : ".env.development";
dotenv.config({ path: envFile });

console.log(envFile)
const paymentRoutes = require("./routes/paymentRoutes");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/userRoutes");
const port = 7777;
const app = express();

const corsOptions = {
  origin: ["https://talibamatch.com", "http://localhost:80"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"], // Ensure all necessary methods are allowed
};

app.use(express.json())
app.use(cors(corsOptions));

app.use("/api/payment", paymentRoutes); // Modularized routes
app.use("/api/auth", authRoutes); // Modularized routes
app.use("/api/user", userRoutes); // Modularized routes

app.get('/', async (req, res) => {
  res.json({ message: "Hello world" })
})

app.listen(port, () => {
  console.log(`Server listening at ${port}`);
});
