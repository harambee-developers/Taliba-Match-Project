const dotenv = require('dotenv')
const express = require("express");
const cors = require("cors");
const http = require('http')
const path = require('path')
const fs = require('fs')
const logger = require('./logger')
const cookieParser = require('cookie-parser')

// Import and initialize the MongoDB connection
require("./db")

// Load the appropriate .env file
const envFile = process.env.NODE_ENV === "production" ? ".env.production" : ".env.development";
dotenv.config({ path: envFile });
logger.info(`Environment: ${envFile}`)

// const paymentRoutes = require("./routes/paymentRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messagesRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const matchRoutes = require("./routes/matchRoutes");
const notificationsRoutes = require('./routes/notificationsRoutes');

const port = 7777;
const app = express();
const server = http.createServer(app)

const corsOptions = {
  origin: [process.env.BACKEND_URL, process.env.FRONTEND_URL],
  allowedHeaders: ['Content-Type', 'Authorization'], // Headers needed by Stripe
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  transports: ['websocket', 'polling'], // Allow fallback transport // Ensure all necessary methods are allowed
}

app.use(cors(corsOptions));
app.use(cookieParser())
app.use('/uploads', express.static('public/uploads'));


// Modularized routes
app.use("/api/payments", paymentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/match", matchRoutes);
app.use('/api/notifications', notificationsRoutes);

// Ensure public/uploads folder exists
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  logger.info('📁 Created public/uploads directory');
}

// Initialize socket server
const initializeSocket = require('./socket');
initializeSocket(server, corsOptions);

server.listen(port, () => {
  logger.info(`Server listening at ${port}`);
});
