const request = require("supertest");
const express = require("express");
const bcrypt = require("bcryptjs");

// Mock the User model
jest.mock("./model/User");
const User = require("./model/User");

// Mock Express app
const app = express();
app.use(express.json());

// Import the router
const authRouter = require("./routes/auth"); // Adjust path if necessary
app.use("/api", authRouter);

describe("POST /register", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should register a user with provided password", async () => {
        User.findOne.mockResolvedValue(null); // Simulate no existing user
        User.prototype.save = jest.fn().mockResolvedValue(); // Mock save method

        const response = await request(app)
            .post("/api/register")
            .send({
                username: "testuser",
                email: "testuser@example.com",
                password: "customPassword123",
            });

        expect(response.status).toBe(201);
        expect(response.body.message).toBe("User registered successfully");
        expect(User.prototype.save).toHaveBeenCalledTimes(1);

        const savedUser = User.prototype.save.mock.calls[0][0];
        expect(await bcrypt.compare("customPassword123", savedUser.password)).toBe(true);
    });

    it("should register a user with default password when none is provided", async () => {
        User.findOne.mockResolvedValue(null);
        User.prototype.save = jest.fn().mockResolvedValue();

        const response = await request(app)
            .post("/api/register")
            .send({
                username: "testuser",
                email: "testuser@example.com",
            });

        expect(response.status).toBe(201);
        expect(response.body.message).toBe("User registered successfully");
        expect(User.prototype.save).toHaveBeenCalledTimes(1);

        const savedUser = User.prototype.save.mock.calls[0][0];
        const defaultPassword = "defaultPassword123";
        expect(await bcrypt.compare(defaultPassword, savedUser.password)).toBe(true);
    });

    it("should return 400 if user already exists", async () => {
        User.findOne.mockResolvedValue({ email: "testuser@example.com" });

        const response = await request(app)
            .post("/api/register")
            .send({
                username: "testuser",
                email: "testuser@example.com",
                password: "customPassword123",
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("User already exists");
    });

    it("should return 500 if an internal error occurs", async () => {
        User.findOne.mockRejectedValue(new Error("Database error"));

        const response = await request(app)
            .post("/api/register")
            .send({
                username: "testuser",
                email: "testuser@example.com",
                password: "customPassword123",
            });

        expect(response.status).toBe(500);
        expect(response.body.message).toBe("Internal server error");
    });
});
