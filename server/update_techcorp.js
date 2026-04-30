const mongoose = require('mongoose');
const Internship = require('./models/Internship');
require('dotenv').config();

const update = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const filter = { company: 'Tech Corp' };
        const updateDoc = {
            $set: {
                stipend: '₹15,000 / month',
                deadline: new Date('2026-12-31')
            }
        };

        const res = await Internship.updateOne(filter, updateDoc);
        console.log('Update Result:', JSON.stringify(res));

        const updated = await Internship.findOne(filter);
        console.log('Updated Internship:', JSON.stringify(updated));

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

update();
