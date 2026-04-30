 const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');
const Internship = require('../models/Internship');

/**
 * Common technical and professional skills for matching
 */
const SKILL_DATABASE = [
    'javascript', 'python', 'java', 'react', 'node.js', 'mongodb', 'sql', 'html', 'css',
    'aws', 'docker', 'kubernetes', 'git', 'agile', 'scrum', 'project management',
    'machine learning', 'data analysis', 'rest api', 'graphql', 'typescript', 'c++',
    'cloud computing', 'cybersecurity', 'ui/ux design', 'figma', 'tableau', 'excel'
];

/**
 * Action verbs and industry keywords
 */
const KEYWORD_DATABASE = [
    'managed', 'developed', 'designed', 'implemented', 'led', 'analyzed',
    'collaborated', 'optimized', 'achieved', 'delivered', 'automated',
    'strategy', 'innovation', 'leadership', 'teamwork', 'communication',
    'problem solving', 'results-oriented', 'scalable', 'enterprise'
];

/**
 * Standard resume sections
 */
const SECTION_HEADINGS = [
    'experience', 'education', 'skills', 'projects', 'summary', 'contact',
    'certifications', 'achievements', 'languages', 'interests'
];

/**
 * @desc    Analyze resume and calculate ATS score
 * @route   POST /api/students/resume-strength
 * @access  Private (Student)
 */
exports.analyzeResumeStrength = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a resume file' });
        }

        const filePath = req.file.path;
        const extension = path.extname(req.file.originalname).toLowerCase();
        let extractedText = '';

        if (extension === '.pdf') {
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdf(dataBuffer);
            extractedText = data.text;
        } else if (extension === '.docx' || extension === '.doc') {
            const result = await mammoth.extractRawText({ path: filePath });
            extractedText = result.value;
        } else {
            return res.status(400).json({ success: false, message: 'Unsupported file format. Please upload PDF or DOCX.' });
        }

        if (!extractedText || extractedText.trim().length < 50) {
            return res.status(400).json({ success: false, message: 'Could not extract enough text from the resume.' });
        }

        const text = extractedText.toLowerCase();
        const feedback = [];
        let score = 0;
        let matchedSkills = [];
        let foundSections = SECTION_HEADINGS.filter(section => text.includes(section));

        const internshipId = req.body.internshipId;

        if (internshipId) {
            // ----- JOB-AWARE SCORING ----- //
            const internship = await Internship.findById(internshipId);
            if (!internship) {
                return res.status(404).json({ success: false, message: 'Internship not found' });
            }

            // 1. Requirements Match (40%)
            const requirements = internship.requirements || [];
            if (requirements.length > 0) {
                const matchedReqs = requirements.filter(req => text.includes(req.toLowerCase()));
                const reqScore = Math.min(40, (matchedReqs.length / Math.max(requirements.length, 1)) * 40);
                score += reqScore;

                matchedSkills = matchedReqs;

                if (matchedReqs.length < requirements.length) {
                    const missing = requirements.filter(req => !text.includes(req.toLowerCase()));
                    feedback.push(`Your resume is missing these required skills: ${missing.slice(0, 3).join(', ')}.`);
                } else {
                    feedback.push(`Excellent! You have all the required skills for this role.`);
                }
            } else {
                score += 40; // If no requirements specified, give full points for this section
            }

            // 2. Description Keyword Match (25%)
            // Extract some basic keywords from description (words longer than 4 chars, excluding common stop words)
            const stopWords = ['this', 'that', 'with', 'from', 'your', 'will', 'have', 'more', 'about', 'their', 'which'];
            const descWords = internship.description.toLowerCase().match(/\b[a-z]{5,}\b/g) || [];
            const uniqueDescWords = [...new Set(descWords)].filter(w => !stopWords.includes(w));

            // Just take top 10 as keywords to check against
            const targetKeywords = uniqueDescWords.slice(0, 10);
            const matchedDescWords = targetKeywords.filter(keyword => text.includes(keyword));

            const descScore = targetKeywords.length > 0 ? Math.min(25, (matchedDescWords.length / targetKeywords.length) * 25) : 25;
            score += descScore;

            if (matchedDescWords.length < targetKeywords.length / 2 && targetKeywords.length > 0) {
                const missingKw = targetKeywords.filter(kw => !text.includes(kw));
                feedback.push(`The job description emphasizes terms like '${missingKw.slice(0, 2).join("', '")}'. Consider aligning your resume language with the job description.`);
            }

            // 3. Action Verbs & Metrics (15%)
            const matchedKeywords = KEYWORD_DATABASE.filter(keyword => text.includes(keyword));
            const keywordScore = Math.min(15, (matchedKeywords.length / 5) * 15);
            score += keywordScore;
            if (matchedKeywords.length < 4) {
                feedback.push('Use more action verbs like "Developed", "Managed", or "Optimized" to describe your work.');
            }

            // 4. Structural Formatting (10%)
            const sectionScore = Math.min(10, (foundSections.length / 4) * 10);
            score += sectionScore;
            if (!text.includes('experience') && !text.includes('projects')) {
                feedback.push('Adding an "Experience" or "Projects" section is highly recommended for this role.');
            }

            // 5. Readability & Profile Links (10%)
            let readabilityScore = 0;
            if (text.includes('linkedin.com') || text.includes('github.com')) readabilityScore += 5;
            const hasNumbers = /\d+%|\d+ |\d+\+/.test(extractedText);
            if (hasNumbers) readabilityScore += 5;
            score += readabilityScore;
            if (!hasNumbers) feedback.push('Include quantifiable results (e.g., "Increased efficiency by 20%").');

        } else {
            // ----- GENERAL SCORING (Fallback) ----- //

            // 1. Skill Alignment (40%)
            matchedSkills = SKILL_DATABASE.filter(skill => text.includes(skill));
            const skillScore = Math.min(40, (matchedSkills.length / 5) * 40);
            score += skillScore;
            if (matchedSkills.length < 3) {
                feedback.push('Try to include more technical skills relevant to your field.');
            } else {
                feedback.push(`Great job including skills like ${matchedSkills.slice(0, 3).join(', ')}.`);
            }

            // 2. Keyword Relevance (30%)
            const matchedKeywords = KEYWORD_DATABASE.filter(keyword => text.includes(keyword));
            const keywordScore = Math.min(30, (matchedKeywords.length / 5) * 30);
            score += keywordScore;
            if (matchedKeywords.length < 4) {
                feedback.push('Use more action verbs like "Developed", "Managed", or "Optimized" to describe your work.');
            }

            // 3. Structural Formatting (20%)
            const sectionScore = Math.min(20, (foundSections.length / 4) * 20);
            score += sectionScore;
            if (!text.includes('experience')) feedback.push('Consider adding a dedicated "Experience" section.');
            if (!text.includes('projects')) feedback.push('Adding a "Projects" section can significantly boost your score.');

            // 4. Readability & Metrics (10%)
            let readabilityScore = 0;
            if (text.includes('linkedin.com') || text.includes('github.com')) readabilityScore += 5;
            const hasNumbers = /\d+%|\d+ |\d+\+/.test(extractedText);
            if (hasNumbers) readabilityScore += 5;
            score += readabilityScore;
            if (!hasNumbers) feedback.push('Include quantifiable results (e.g., "Increased efficiency by 20%").');
        }

        const finalScore = Math.round(score);

        // Update user record
        const user = await User.findById(req.user.id);
        user.atsScore = finalScore;
        user.resumeAnalysis = {
            score: finalScore,
            feedback,
            lastAnalyzed: new Date()
        };
        await user.save();

        res.status(200).json({
            success: true,
            data: {
                score: finalScore,
                feedback,
                matchedSkills,
                foundSections,
                isJobSpecific: !!internshipId
            }
        });

    } catch (err) {
        console.error('Resume Analysis Error:', err);
        res.status(500).json({ success: false, message: 'Server error during analysis' });
    }
};
