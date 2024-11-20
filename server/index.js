const express = require("express");
const { FRONTEND_URL, BACKEND_URL } = process.env;
const cors = require("cors");

const paymentRoutes = require("./routes/paymentRoutes");
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

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`App listening at ${port}`);
});
