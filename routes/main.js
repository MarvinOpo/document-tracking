const express = require('express');
const router = express.Router();

const mainController = require('../controller/mainController');

// Show Index Page
router.get('/', mainController.index);

// Show Login Page
router.get('/login', mainController.login);

// Perform Login
router.post('/login', mainController.post_login);

// Perform Logout
router.get('/logout', mainController.logout);

// Show Dashboard Page
router.get('/dashboard', mainController.dashboard);

// Show Document Page
router.get('/documents', mainController.documents);

// Show ALL Document Page
router.get('/all_documents', mainController.all_documents);

module.exports = router;
