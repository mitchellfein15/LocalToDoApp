const express = require('express');
const router = express.Router();
const StatsController = require('../controllers/statsController');

router.get('/heatmap', StatsController.getHeatmap);

module.exports = router;
