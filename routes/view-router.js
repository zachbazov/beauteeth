const express = require('express');
const router = express.Router();

const viewController = require('../controllers/view-controller');

router.get('/', viewController.getOverview);

router.get('/slider', viewController.getSlider);

module.exports = router;
