const Internship = require('../models/Internship');
const User = require('../models/User');
const AppError = require('../utils/AppError');

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Handle AI Chat queries
// @route   POST /api/ai/chat
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const handleChat = async (req, res, next) => {
    try {
        const { message } = req.body;
        const userId = req.user._id;

        if (!message) {
            return next(new AppError('Please provide a message', 400));
        }

        // Fetch user context for personalized advice
        const user = await User.findById(userId);
        const internships = await Internship.find().limit(5);

        const lowerMsg = message.toLowerCase();
        let response = "";

        // Heuristic-based AI logic for "Mock" intelligence
        if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
            response = `Hi ${user.name}! I'm Propella, your AI Assistant. How can I help you today? You can ask me about matching internships, improving your profile, or mock tests.`;
        } else if (lowerMsg.includes('internship') || lowerMsg.includes('match')) {
            const count = internships.length;
            response = `I found ${count} internships recently posted. Based on your profile, you might be interested in roles requiring ${user.projects.length > 0 ? user.projects[0].technologies.join(', ') : 'more skills'}. Would you like me to analyze a specific listing for you?`;
        } else if (lowerMsg.includes('profile') || lowerMsg.includes('improve')) {
            const missing = [];
            if (!user.profilePicture) missing.push('Profile Picture');
            if (user.projects.length === 0) missing.push('Projects');
            if (!user.linkedin) missing.push('LinkedIn link');

            if (missing.length > 0) {
                response = `Your profile is looking good, but adding ${missing.join(', ')} would significantly increase your match scores! Projects are especially important for recruiters.`;
            } else {
                response = `Your profile is very strong! You have ${user.projects.length} projects and ${user.badges.length} verified badges. You're in the top tier of applicants!`;
            }
        } else if (lowerMsg.includes('test') || lowerMsg.includes('mock')) {
            response = "Taking Mock Tests is the best way to earn Verified Skill Badges. Recruiters prioritize students with badges because they prove technical competency. Which skill would you like to test today?";
        } else if (lowerMsg.includes('calculate') || lowerMsg.includes('score')) {
            response = "I calculate your Match Score by comparing your project technologies, education, and badges against internship requirements. The more specific your project descriptions are, the higher your score will be!";
        } else {
            response = "That's an interesting question! As Propella, I'm trained to help with platform navigation, profile optimization, and internship matching. Could you rephrase that in the context of your career goals?";
        }

        res.status(200).json({
            success: true,
            data: {
                reply: response,
                context: {
                    userRole: user.role,
                    suggestionCount: internships.length
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { handleChat };
