/**
 * Calculates a compatibility score between a student and an internship.
 * @param {Object} student - Student user object
 * @param {Object} internship - Internship object
 * @returns {Object} { score, missingSkills }
 */
const calculateMatchScore = (student, internship) => {
    if (!student || !internship || !internship.requirements || !Array.isArray(internship.requirements) || internship.requirements.length === 0) {
        return { score: 0, missingSkills: [] };
    }

    const requirements = internship.requirements.map(r => r ? r.toLowerCase() : '');

    // Aggregate student skills
    const studentSkills = new Set();

    // From projects
    if (student.projects && Array.isArray(student.projects)) {
        student.projects.forEach(proj => {
            if (proj.technologies && Array.isArray(proj.technologies)) {
                proj.technologies.forEach(tech => {
                    if (tech) studentSkills.add(tech.toLowerCase());
                });
            }
        });
    }

    // From certificates
    if (student.certificates && Array.isArray(student.certificates)) {
        student.certificates.forEach(cert => {
            if (cert.title) {
                cert.title.split(' ').forEach(word => {
                    if (word && word.length > 2) studentSkills.add(word.toLowerCase());
                });
            }
        });
    }

    // From verified badges
    if (student.badges && Array.isArray(student.badges)) {
        student.badges.forEach(badge => {
            if (badge.title) studentSkills.add(badge.title.toLowerCase());
        });
    }

    const matchedSkills = [];
    const missingSkills = [];

    requirements.forEach(req => {
        if (!req) return;
        if (studentSkills.has(req)) {
            matchedSkills.push(req);
        } else {
            const isPartialMatch = Array.from(studentSkills).some(s => s && (s.includes(req) || req.includes(s)));
            if (isPartialMatch) {
                matchedSkills.push(req);
            } else {
                missingSkills.push(req);
            }
        }
    });

    const score = requirements.length > 0 ? Math.round((matchedSkills.length / requirements.length) * 100) : 0;

    return { score, missingSkills };
};

module.exports = { calculateMatchScore };
