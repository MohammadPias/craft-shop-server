const express = require('express');
const { makeStripePayment, makeSSLPayment } = require('../controllers/stripePayment.controller');

const router = express.Router();

router.post('/create-payment-intent', makeStripePayment)
router.get('/init', makeSSLPayment)
router.get('/success', makeSSLPayment)
router.get('/fail', makeSSLPayment)
router.get('/cancel', makeSSLPayment)

module.exports = router;