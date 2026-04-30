const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please provide an internship title'],
            trim: true,
        },
        company: {
            type: String,
            required: [true, 'Please provide a company name'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Please provide a description'],
        },
        location: {
            type: String,
            required: [true, 'Please provide a location'],
        },
        stipend: {
            type: String,
            required: [true, 'Please provide stipend details'],
        },
        deadline: {
            type: Date,
            required: [true, 'Please provide an application deadline'],
        },
        requirements: {
            type: [String],
            default: [],
        },
        experienceLevel: {
            type: String,
            enum: ['Beginner', 'Intermediate', 'Expert'],
            default: 'Beginner',
        },
        postedBy: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const Internship = mongoose.model('Internship', internshipSchema);

module.exports = Internship;
