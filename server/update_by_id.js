const mongoose = require('mongoose');
const Internship = require('./models/Internship');
require('dotenv').config();

const update = async () => {
    try {
        console.log('Using URI:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB:', mongoose.connection.name);

        const id = '698efc3e3db296e4d33c8bfb';
        const updateDoc = {
            $set: {
                stipend: '₹15,000 / month',
                deadline: new Date('2026-12-31')
            }
        };

        const res = await Internship.findByIdAndUpdate(id, updateDoc, { new: true });
        if (res) {
            console.log('Update Successful!');
            console.log('ID:', res._id);
            console.log('Title:', res.title);
            console.log('Stipend:', res.stipend);
            console.log('Deadline:', res.deadline);
        } else {
            console.log('Document not found with ID:', id);
        }

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

update();
