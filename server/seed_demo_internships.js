const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Internship = require('./models/Internship');
const User = require('./models/User');

dotenv.config();

const demoInternships = [
    {
        title: 'Software Engineering Intern',
        company: 'Google',
        location: 'Bangalore, India',
        stipend: '₹1,00,000 / month',
        description: 'Join the Core Search team at Google as a Software Engineering Intern. You will work on cutting-edge algorithms and distributed systems that power the world\'s largest search engine.',
        requirements: ['C++', 'Python', 'Data Structures', 'Algorithms'],
        experienceLevel: 'Beginner',
        isFeatured: true
    },
    {
        title: 'Frontend Developer Intern',
        company: 'Meta',
        location: 'Remote',
        stipend: '₹80,000 / month',
        description: 'Help build the next generation of social media interfaces using React. Work directly with experienced engineers to build scalable and highly interactive UI components.',
        requirements: ['React', 'JavaScript', 'CSS', 'Redux'],
        experienceLevel: 'Intermediate',
        isFeatured: true
    },
    {
        title: 'Cloud Architect Intern',
        company: 'Amazon',
        location: 'Hyderabad, India',
        stipend: '₹95,000 / month',
        description: 'Join AWS as a Cloud Architect Intern. Design resilient cloud infrastructures and build automated deployment pipelines for enterprise clients.',
        requirements: ['AWS', 'Docker', 'Linux', 'Networking'],
        experienceLevel: 'Intermediate',
        isFeatured: true
    },
    {
        title: 'Product Management Intern',
        company: 'Microsoft',
        location: 'Gurgaon, India',
        stipend: '₹85000 / month',
        description: 'Work with the Azure product team to define feature roadmaps, analyze user telemetry, and drive the execution of cloud-based enterprise solutions.',
        requirements: ['Product Strategy', 'Analytics', 'Agile', 'Communication'],
        experienceLevel: 'Beginner',
        isFeatured: true
    },
    {
        title: 'Machine Learning Intern',
        company: 'Netflix',
        location: 'Remote',
        stipend: '$7,500 / month',
        description: 'Enhance the Netflix recommendation engine. Use advanced deep learning models to personalize content discovery for millions of users worldwide.',
        requirements: ['Python', 'TensorFlow', 'PyTorch', 'Data Science'],
        experienceLevel: 'Expert',
        isFeatured: true
    },
    {
        title: 'Backend Developer Intern',
        company: 'Spotify',
        location: 'Remote',
        stipend: '₹90,000 / month',
        description: 'Optimize audio streaming infrastructure at Spotify. Build robust microservices using Node.js and Go to handle millions of concurrent connections.',
        requirements: ['Node.js', 'Go', 'Microservices', 'MongoDB'],
        experienceLevel: 'Intermediate',
        isFeatured: true
    },
    {
        title: 'Data Analyst Intern',
        company: 'Uber',
        location: 'Bangalore, India',
        stipend: '₹70,000 / month',
        description: 'Analyze rider and driver matching algorithms. Use SQL and Tableau to identify bottlenecks in marketplace efficiency and propose data-driven solutions.',
        requirements: ['SQL', 'Python', 'Tableau', 'Statistics'],
        experienceLevel: 'Beginner',
        isFeatured: true
    },
    {
        title: 'UI/UX Design Intern',
        company: 'Figma',
        location: 'Remote',
        stipend: '$6,000 / month',
        description: 'Help shape the future of design tools. Work on new prototyping mechanisms and vector manipulation interfaces within the core Figma canvas editor.',
        requirements: ['UI/UX', 'Figma', 'Interaction Design', 'Prototyping'],
        experienceLevel: 'Intermediate',
        isFeatured: true
    },
    {
        title: 'Full Stack Engineer Intern',
        company: 'Vercel',
        location: 'Remote',
        stipend: '$5,000 / month',
        description: 'Work on the Next.js framework core and Vercel dashboard. Create blazing fast web experiences and improve developer tools.',
        requirements: ['Next.js', 'React', 'TypeScript', 'Node.js'],
        experienceLevel: 'Expert',
        isFeatured: true
    },
    {
        title: 'Cybersecurity Intern',
        company: 'Cisco',
        location: 'Pune, India',
        stipend: '₹60,000 / month',
        description: 'Join Cisco\'s threat intelligence team. Monitor network traffic, identify vulnerabilities, and develop automated security testing scripts.',
        requirements: ['Networking', 'Linux', 'Python', 'Security Principles'],
        experienceLevel: 'Beginner',
        isFeatured: true
    }
];

const seedDemoInternships = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected!');

        let recruiter = await User.findOne({ email: 'demorecruiter@propel.com' });
        if (!recruiter) {
            console.log('Creating demo recruiter...');
            recruiter = await User.create({
                name: 'Demo Recruiter',
                email: 'demorecruiter@propel.com',
                password: 'password123',
                role: 'recruiter'
            });
        }

        console.log('Adding premium demo internships...');
        const deadline = new Date();
        deadline.setMonth(deadline.getMonth() + 2); // 2 months from now

        const insertData = demoInternships.map(internship => ({
            ...internship,
            deadline: deadline,
            postedBy: recruiter._id,
            createdAt: new Date()
        }));

        // We will not delete existing ones, just add these to the top because they are newer and featured
        await Internship.insertMany(insertData);

        console.log('Successfully inserted demo internships with logos!');
        process.exit(0);

    } catch (error) {
        console.error('Seeding Error:', error);
        process.exit(1);
    }
};

seedDemoInternships();
