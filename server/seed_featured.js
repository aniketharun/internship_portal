const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Internship = require('./models/Internship');
const User = require('./models/User');

dotenv.config();

const featuredInternships = [
    { company: 'Google', title: 'Software Engineering Intern', location: 'Bangalore, India', stipend: '₹80,000/month', description: 'Join Google\'s engineering team and work on products used by billions. You\'ll collaborate with world-class engineers on real projects that ship to production.\n\nDuration: 3 months\nStart Date: Immediately', requirements: ['Python', 'Data Structures', 'Algorithms', 'Problem Solving'], experienceLevel: 'Intermediate' },
    { company: 'Microsoft', title: 'Product Management Intern', location: 'Hyderabad, India', stipend: '₹75,000/month', description: 'Work alongside Microsoft\'s product teams to define, build, and launch features for Azure and Microsoft 365. Drive product strategy and work cross-functionally.\n\nDuration: 3 months\nStart Date: Immediately', requirements: ['Product Thinking', 'Data Analysis', 'Communication', 'SQL'], experienceLevel: 'Intermediate' },
    { company: 'Amazon', title: 'Business Analyst Intern', location: 'Mumbai, India', stipend: '₹70,000/month', description: 'Dive deep into Amazon\'s data to uncover insights that drive business decisions. Work with supply chain, logistics, and marketplace teams.\n\nDuration: 6 months\nStart Date: Immediately', requirements: ['Excel', 'SQL', 'Python', 'Statistics'], experienceLevel: 'Beginner' },
    { company: 'Meta', title: 'Data Science Intern', location: 'Remote', stipend: '₹85,000/month', description: 'Work on Meta\'s data infrastructure and help build models that power Instagram, WhatsApp, and Facebook. Analyze petabytes of data to improve user experience.\n\nDuration: 3 months\nStart Date: Immediately', requirements: ['Python', 'Machine Learning', 'SQL', 'Statistics'], experienceLevel: 'Intermediate' },
    { company: 'Flipkart', title: 'UI/UX Design Intern', location: 'Bangalore, India', stipend: '₹45,000/month', description: 'Design intuitive experiences for Flipkart\'s 400M+ users. Work with the design system team to create components, run user research, and ship features.\n\nDuration: 3 months\nStart Date: Immediately', requirements: ['Figma', 'User Research', 'Prototyping', 'Design Systems'], experienceLevel: 'Beginner' },
    { company: 'Razorpay', title: 'Backend Engineering Intern', location: 'Bangalore, India', stipend: '₹60,000/month', description: 'Build the payment infrastructure that powers India\'s digital economy. Work on high-throughput systems processing millions of transactions daily.\n\nDuration: 6 months\nStart Date: Immediately', requirements: ['Node.js', 'Java', 'MySQL', 'System Design'], experienceLevel: 'Intermediate' },
    { company: 'Swiggy', title: 'Growth Marketing Intern', location: 'Bangalore, India', stipend: '₹35,000/month', description: 'Drive user acquisition and retention for Swiggy\'s food delivery and Instamart platforms. Run A/B tests, manage campaigns, and analyze funnel metrics.\n\nDuration: 3 months\nStart Date: Immediately', requirements: ['Digital Marketing', 'Analytics', 'Excel', 'Communication'], experienceLevel: 'Beginner' },
    { company: 'Zoho', title: 'Full Stack Developer Intern', location: 'Chennai, India', stipend: '₹40,000/month', description: 'Build features for Zoho\'s suite of 50+ business applications used by 80M+ users worldwide. Work across the stack from React frontends to Java backends.\n\nDuration: 6 months\nStart Date: Immediately', requirements: ['React', 'Java', 'MySQL', 'REST APIs'], experienceLevel: 'Beginner' },
    { company: 'Infosys', title: 'Machine Learning Intern', location: 'Pune, India', stipend: '₹30,000/month', description: 'Work with Infosys\'s AI research lab on NLP and computer vision projects for enterprise clients. Contribute to real client deliverables.\n\nDuration: 3 months\nStart Date: Immediately', requirements: ['Python', 'TensorFlow', 'NLP', 'Deep Learning'], experienceLevel: 'Intermediate' },
];

const run = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get or create a recruiter
    let recruiter = await User.findOne({ role: 'recruiter' });
    if (!recruiter) {
        recruiter = await User.create({ name: 'Propel Admin', email: 'admin@propel.com', password: 'password123', role: 'recruiter' });
    }

    // Remove old featured internships
    await Internship.deleteMany({ isFeatured: true });
    console.log('Cleared old featured internships');

    const deadline = new Date();
    deadline.setMonth(deadline.getMonth() + 4);

    const docs = featuredInternships.map(i => ({
        ...i,
        deadline,
        postedBy: recruiter._id,
        isFeatured: true,
    }));

    await Internship.insertMany(docs);
    console.log(`✅ Seeded ${docs.length} featured internships`);
    process.exit(0);
};

run().catch(err => { console.error(err); process.exit(1); });
