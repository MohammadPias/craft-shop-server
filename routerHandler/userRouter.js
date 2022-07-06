const express = require('express');
const { addUser, updateUser, updateShipping, getUserByEmail, getUsers, deleteUser, updateProfile, checkAdmin } = require('../controllers/user.controller');
const { DeleteUser } = require('../firebaseAdmin/firebaseAdmin');

const router = express.Router();

router.post('/', addUser);
router.put('/', updateUser);
router.put('/update', updateShipping);
router.put('/profile', updateProfile);
router.get('/find', getUserByEmail);
router.get('/', getUsers);
router.get('/checkAmin/:email', checkAdmin);
router.delete('/', DeleteUser, deleteUser);

module.exports = router;
