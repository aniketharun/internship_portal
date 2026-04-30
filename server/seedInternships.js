const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const csv = require('csv-parser');
const Internship = require('./models/Internship');
const User = require('./models/User');

// Load env vars
dotenv.config({ path: './.env' });

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI);

const importData = async () => {
    try {
        console.log('Connecting to DB and finding/creating dummy user...');

        // 1. Create or Find Dummy Recruiter User
        let dummyUser = await User.findOne({ email: 'dummy_recruiter@example.com' });

        if (!dummyUser) {
            dummyUser = await User.create({
                name: 'Kaggle Admin',
                email: 'dummy_recruiter@example.com',
                password: 'password123',
                role: 'recruiter',
            });
            console.log('Dummy user created!');
        } else {
            console.log('Dummy user found!');
        }

        // 2. Read and Parse CSV Data
        const internships = [];
        const csvFilePath = 'C:\\Users\\Aniketh Arun\\Downloads\\internship_dataset.csv'; // Hardcoded path

        console.log('Reading CSV file from:', csvFilePath);

        fs.createReadStream(csvFilePath)
            .pipe(csv())
            .on('data', (row) => {
                // Ensure required fields map correctly
                if (row.internship_title && row.company_name) {

                    // Create description placeholder
                    const generatedDescription = `Exciting internship opportunity as a ${row.internship_title} at ${row.company_name}. Build your career and gain valuable experience working with us! Duration: ${row.duration || 'Not specified'}, Start Date: ${row.start_date || 'Not specified'}.`;

                    // Deadline 2 months from now
                    const deadlineDate = new Date();
                    deadlineDate.setMonth(deadlineDate.getMonth() + 2);

                    internships.push({
                        title: row.internship_title,
                        company: row.company_name,
                        location: row.location || 'Not Specified',
                        stipend: row.stipend || 'Unpaid',
                        description: generatedDescription,
                        deadline: deadlineDate,
                        experienceLevel: 'Beginner', // Default value
                        postedBy: dummyUser._id,
                    });
                }
            })
            .on('end', async () => {
                console.log(`Parsed ${internships.length} internships from CSV.`);

                // 3. Clear existing Kaggle-imported internships to avoid duplicates (Optional but good practice)
                // We'll just insert for now to save time if we aren't worried.
                // await Internship.deleteMany({ postedBy: dummyUser._id });

                console.log('Importing into database...');

                // Use insertMany for bulk insert
                await Internship.insertMany(internships);

                console.log('Data Imported successfully!');
                process.exit();
            });

    } catch (err) {
        console.error('Error importing data:', err);
        process.exit(1);
    }
};

importData();
