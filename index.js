const express = require('express');
const cors = require('cors');
require('dotenv').config();
const fileUpload = require('express-fileupload');

const userHandler = require('./routerHandler/userRouter');
const productHandler = require('./routerHandler/productRouter');
const orderHandler = require('./routerHandler/orderRouter');
const paymentHandler = require('./routerHandler/paymentRouter');
const MongoServer = require('./database/db');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())
app.use(fileUpload())


app.use('/users', userHandler);
app.use('/products', productHandler)
app.use('/orders', orderHandler)
app.use('/payment', paymentHandler)



async function start() {
    await MongoServer.connectDb();
}
start();

app.get('/', (req, res) => {
    res.send("Welcome Craft-shop")
})
app.listen(port, () => {
    console.log('listening port', port)
})