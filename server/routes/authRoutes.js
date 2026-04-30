const express = require('express');
const router = express.Router();

const { registerUser, loginUser, getMe, updateDetails, uploadCertificate, uploadProfilePicture, forgotPassword, resetPassword, getUser, googleLogin } = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');
const uploadCert = require('../middleware/uploadCert');
const uploadProfilePic = require('../middleware/uploadProfilePic');

// POST /api/auth/register
router.post('/register', registerUser);

// POST /api/auth/login
router.post('/login', loginUser);

// POST /api/auth/forgotpassword
router.post('/forgotpassword', forgotPassword);

// PUT /api/auth/resetpassword/:resettoken
router.put('/resetpassword/:resettoken', resetPassword);

// GET /api/auth/me (protected — requires JWT)
router.get('/me', protect, getMe);

// PUT /api/auth/updatedetails
router.put('/updatedetails', protect, updateDetails);

// POST /api/auth/uploadcertificate
router.post('/uploadcertificate', protect, uploadCert.single('certificate'), uploadCertificate);

// POST /api/auth/uploadprofilepic
router.post('/uploadprofilepic', protect, uploadProfilePic.single('profilePic'), uploadProfilePicture);

// GET /api/auth/users/:id
router.get('/users/:id', protect, getUser);

// POST /api/auth/google
router.post('/google', googleLogin);

module.exports = router;
