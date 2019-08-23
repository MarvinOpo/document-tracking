const express = require('express');
const router = express.Router();

const documentController = require('../controller/documentController');
const logController = require('../controller/logController');

//------------------ DOCS -----------------//

// Insert document
router.post('/document/insert', documentController.insert);

// Get documents
router.get('/document/get_documents', documentController.get_documents);

// Get documents
router.get('/document/get_pending_documents', documentController.get_pending_documents);

// Get documents count
router.get('/document/get_count', documentController.get_count);

// Get pending count
router.get('/document/get_pending_count', documentController.get_pending_count);

// Get documents by id
router.get('/document/check_document', documentController.check_document);

// Get document no
router.get('/document/get_docno', documentController.get_docno);

// Get barcodes
router.get('/document/get_barcodes', documentController.get_barcodes);

// Get send out
router.get('/document/get_sendout', documentController.get_sendout);

// Get send out per release
router.post('/document/get_release_sendout', documentController.get_release_sendout);

// Get Types
router.get('/document/get_types', documentController.get_types);

// Get Recieve Report
router.get('/document/get_pending_graph_data', documentController.get_pending_graph_data);

// Get Recieve Report
router.get('/document/get_recieve_graph_data', documentController.get_recieve_graph_data);

// Get Release Report
router.get('/document/get_release_graph_data', documentController.get_release_graph_data);

// Get recievable barcodes
router.get('/document/get_recievable_bcodes', documentController.get_recievable_bcodes);

// Get releasable barcodes
router.get('/document/get_releasable_bcodes', documentController.get_releasable_bcodes);

// Update document
router.post('/document/update', documentController.update);

// Recieve document
router.post('/document/recieve', documentController.recieve);

// Cycle end document
router.get('/document/end_cycle', documentController.end_cycle);

// Update document location
router.post('/document/update_location', documentController.update_location);

// Delete document
router.get('/document/delete', documentController.delete);

//------------------ ALL DOCS -----------------//

// Get All barcodes
router.get('/all_document/get_barcodes', documentController.get_all_barcodes);

// Get All Types
router.get('/all_document/get_types', documentController.get_all_types);

// Get All document no
router.get('/all_document/get_docno', documentController.get_all_docno);

// Get All documents count
router.get('/all_document/get_count', documentController.get_all_count);

// Get All documents
router.get('/all_document/get_documents', documentController.get_all_documents);

//------------------ LOGS -----------------//

// Insert log
router.post('/logs/insert', logController.insert);

// Get logs
router.get('/logs/get_logs', logController.get_logs);

// Get log history
router.get('/logs/get_log_history', logController.get_log_history);

// Update recieved log
router.post('/logs/update_recieve', logController.update_recieve);

// Update released log
router.post('/logs/update_release', logController.update_release);

module.exports = router;
