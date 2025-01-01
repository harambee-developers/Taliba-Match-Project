const mongoose = require('mongoose');
const User = require('./model/User'); // Adjust the path as needed

// Connect to MongoDB
const run = async () => {
  try {
    await mongoose.connect('mongodb://172.18.0.2:27017/TalibaDatabase', {
      });
      console.log('Connected to MongoDB');
    // Create a new user
    const newUser = new User({
      username: 'johndoe',
      first_name: 'John',
      last_name: 'Doe',
      email: 'johndoe@example.com',
      password: 'securepassword123',
      dob: new Date('1990-01-01'),
      gender: 'Male',
      education: 'Bachelor\'s Degree',
      occupation: 'Software Developer',
      address: {
        street: '123 Main St',
        city: 'San Francisco',
        country: 'USA',
      },
      phone: '1234567890',
      profile: {
        height: 180,
        weight: 75,
        hobbies: ['Reading', 'Coding', 'Hiking'],
        languages: ['English', 'Spanish'],
        family_background: 'Middle Class',
        additional_info: 'Loves exploring new technologies.',
      },
      preferences: {
        age_range: [25, 35],
        height_range: [160, 185],
        education: 'Bachelor\'s Degree',
        country: 'USA',
        additional_preferences: 'Non-smoker, enjoys outdoor activities.',
      },
      photos: [
        { url: 'https://example.com/photo1.jpg' },
        { url: 'https://example.com/photo2.jpg' },
      ],
    });

    // Save the user to the database
    await newUser.save();
    console.log('User added successfully:', newUser);
    // Disconnect from the database
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error adding user:', error);
    process.exit(1);
  }
};

run();
