const mongoose = require("./db");
const bcrypt = require("bcryptjs");
const User = require("./model/User"); // Adjust the path to your model

const seedAdmins = async () => {
    try {
        const admins = [
            { email: "abdirahmanfarah1313@gmail.com", firstName: "AbdiRahman", lastName:"Farah", userName: "Admin1", password: "adminpassword123" },
        ];

        for (const admin of admins) {
            const existingAdmin = await User.findOne({ email: admin.email });
            if (!existingAdmin) {
                const hashedPassword = await bcrypt.hash(admin.password, 10);
                await User.create({ ...admin, password: hashedPassword, role: "admin" });
                console.log(`Admin ${admin.email} created.`);
            } else {
                console.log(`Admin ${admin.email} already exists.`);
            }
        }

        console.log("Admin seeding complete.");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding admins:", error);
        process.exit(1);
    } finally {
        mongoose.close()
    }
};

seedAdmins()