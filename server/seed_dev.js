const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const csv = require('csv-parser');
const Internship = require('./models/Internship');
const User = require('./models/User');

dotenv.config();

const csvFilePath = 'c:\\Users\\Archana\\Downloads\\internship portal\\internship portal\\server\\internship_dataset.csv';

const seedDB = async () => {
    try {
        console.log('Connecting to MongoDB Atlas...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected!');

        // 1. Ensure we have a recruiter user
        let recruiter = await User.findOne({ email: 'recruiter@propel.com' });
        if (!recruiter) {
            console.log('Creating recruiter account...');
            recruiter = await User.create({
                name: 'Main Recruiter',
                email: 'recruiter@propel.com',
                password: 'password123',
                role: 'recruiter'
            });
        }


        console.log('Cleaning existing internships...');
        await Internship.deleteMany({});

        // 3. Parse CSV
        const results = [];
        console.log('Parsing CSV...');

        fs.createReadStream(csvFilePath)
            .pipe(csv())
            .on('data', (data) => {
                // Mapping CSV -> Model
                if (data.internship_title && data.company_name) {
                    const deadline = new Date();
                    deadline.setMonth(deadline.getMonth() + 3); // 3 months deadline

                    results.push({
                        title: data.internship_title,
                        company: data.company_name,
                        location: data.location || 'Remote',
                        stipend: data.stipend || 'Unpaid',
                        description: `Experience the future of work at ${data.company_name} as a ${data.internship_title}. \n\nDuration: ${data.duration || 'Not specified'}\nStart Date: ${data.start_date || 'Immediately'}`,
                        deadline: deadline,
                        requirements: [data.internship_title, 'Communication', 'Teamwork'], // Placeholder requirements
                        experienceLevel: 'Beginner',
                        postedBy: recruiter._id
                    });
                }
            })
            .on('end', async () => {
                console.log(`Parsed ${results.length} internships. Bulk inserting...`);

                // Batch insert into Atlas
                if (results.length > 0) {
                    // Using smaller chunks for Atlas stability
                    const chunkSize = 500;
                    for (let i = 0; i < results.length; i += chunkSize) {
                        const chunk = results.slice(i, i + chunkSize);
                        await Internship.insertMany(chunk);
                        console.log(`Inserted ${i + chunk.length} / ${results.length}...`);
                    }
                    console.log('Seeding completed successfully!');
                } else {
                    console.log('No data found in CSV.');
                }

                process.exit(0);
            })
            .on('error', (err) => {
                console.error('CSV Parsing Error:', err);
                process.exit(1);
            });

    } catch (error) {
        console.error('Seeding Error:', error);
        process.exit(1);
    }
};

seedDB();
