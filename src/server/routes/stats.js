const express = require('express');
const router = express.Router();
const StatsController = require('../controllers/statsController');

router.get('/heatmap', StatsController.getHeatmap);
router.delete('/reset', StatsController.resetStats);

module.exports = router;
