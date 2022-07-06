const express = require('express');
const { VerifyToken } = require('../firebaseAdmin/firebaseAdmin');
const {
    addOrder,
    updateOrderPayment,
    updateOrderStatus,
    getMyOrders,
    getOrderById,
    getAllOrders,
    deleteOrder
} = require('../controllers/order.controller');

const router = express.Router();

router.post('/', addOrder);
router.put('/', updateOrderStatus);
router.put('/updatePayment', updateOrderPayment);
router.get('/', getAllOrders);
router.get('/myOrders', VerifyToken, getMyOrders);
router.get('/findOrder/:id', getOrderById);
router.delete('/:id', deleteOrder);


module.exports = router;