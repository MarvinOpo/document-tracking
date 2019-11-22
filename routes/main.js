const express = require('express');
const router = express.Router();

const mainController = require('../controller/mainController');

// Show Index Page
router.get('/', mainController.index);

// Show Login Page
router.get('/login', mainController.login);

// Perform Login
router.post('/login', mainController.post_login);

// Show Update info Page
router.get('/update_info', mainController.update_info);

// Update info
router.post('/update_info', mainController.post_update);

// Update password
router.post('/update_pass', mainController.update_pass);

// Perform Logout
router.get('/logout', mainController.logout);

// Show Dashboard Page
router.get('/dashboard', mainController.dashboard);

// Show Document Page
router.get('/documents', mainController.documents);

// Show ALL Document Page
router.get('/all_documents', mainController.all_documents);

// Show Admin Page
router.get('/admin_access', mainController.admin_access);

// Get Server time
router.get('/get_server_time', mainController.get_server_time);

module.exports = router;
