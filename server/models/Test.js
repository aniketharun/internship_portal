const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: [true, 'Please provide the question text']
    },
    options: {
        type: [String],
        required: [true, 'Please provide options'],
        validate: [opts => opts.length >= 2, 'Must have at least 2 options']
    },
    correctOption: {
        type: Number,
        required: [true, 'Please specify the correct option index'],
        min: 0
    }
});

const testSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a test title'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please provide a description']
    },
    company: {
        type: String, // Empty if it's a general mock test
        default: ''
    },
    type: {
        type: String,
        enum: ['MOCK', 'COMPANY_SPECIFIC'],
        default: 'MOCK'
    },
    duration: {
        type: Number, // in minutes
        required: [true, 'Please provide test duration']
    },
    questions: [questionSchema],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Test = mongoose.model('Test', testSchema);

module.exports = Test;
