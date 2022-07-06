const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
var admin = require("firebase-admin");
const SSLCommerzPayment = require('sslcommerz');
const fileUpload = require('express-fileupload');

const userHandler = require('./routerHandler/userRouter');
const productHandler = require('./routerHandler/productRouter');
const MongoServer = require('./database/db');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())
app.use(fileUpload())

const stripe = require("stripe")(process.env.CLIENT_SECRET);

// firebase initialize app
// var serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
// });


// async function DeleteUser(req, res, next) {
//     const uid = req.query?.uid
//     if (req.query?.uid) {
//         admin.auth()
//             .deleteUser(uid)
//             .then(() => {
//                 console.log('Successfully deleted user');
//             })
//             .catch((error) => {
//                 console.log('Error deleting user:', error);
//             });
//     }

//     next();
// }

async function VerifyToken(req, res, next) {
    if (req?.headers?.authorization?.startsWith('Bearer ')) {
        const token = req.headers.authorization.split('Bearer ')[1];
        try {
            const decodedUser = await admin.auth().verifyIdToken(token);
            req.decodedUserEmail = decodedUser.email;
            // console.log(decodedUser.email)
        }
        catch {

        }
    }
    next();
}


const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@cluster0.o4muq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 })


app.use('/users', userHandler);
app.use('/products', productHandler)



async function start() {
    await MongoServer.connectDb();
}
start();

// async function run() {
//     try {
//         await client.connect()

//         const database = client.db('craft-shop');
//         const userCollection = database.collection('users');
//         const productCollection = database.collection('products');
//         const orderCollection = database.collection('orders')

//         // check admin
//         app.get('/checkAmin/:email', async (req, res) => {
//             const email = req.params.email;
//             // console.log(email)
//             const query = { email: email }
//             const result = await userCollection.findOne(query);

//             let admin = false;
//             if (result?.role === 'admin') {
//                 admin = true
//             }
//             else {
//                 admin = false
//             }
//             res.json({ admin: admin })
//         })

//         /// update user profile pic
//         app.put('/user/profile', async (req, res) => {
//             const email = req.query.email;
//             const pic = req?.files?.photoURL;
//             const picData = pic?.data?.toString('base64');
//             const bufferPic = Buffer.from(picData, 'base64')

//             const query = { email: email }
//             const updateDoc = {
//                 $set: { photoURL: bufferPic }
//             }
//             const result = await userCollection.updateOne(query, updateDoc)

//             const user = await userCollection.findOne(query)
//             res.json({
//                 result,
//                 photoURL: user?.photoURL,
//             })
//         })

//         // Stripe Payment Gateway========
//         app.post("/create-payment-intent", async (req, res) => {
//             const { amount } = req.body;
//             console.log(amount * 100, typeof (amount))
//             const newAmount = amount * 100;
//             if (newAmount) {
//                 const paymentIntent = await stripe.paymentIntents.create({
//                     amount: amount * 100,
//                     currency: "usd",
//                     payment_method_types: ['card']
//                 });
//                 res.send({
//                     clientSecret: paymentIntent.client_secret,
//                 });
//             }
//         });

//         // SSLCommerz Payment Gateway==========


//         app.get('/init', (req, res) => {
//             const data = {
//                 total_amount: 100,
//                 currency: 'EUR',
//                 tran_id: 'REF123',
//                 success_url: 'http://localhost:5000/success',
//                 fail_url: 'http://localhost:5000/fail',
//                 cancel_url: 'http://localhost:5000/cancel',
//                 ipn_url: 'http://yoursite.com/ipn',
//                 shipping_method: 'Courier',
//                 product_name: 'Computer.',
//                 product_category: 'Electronic',
//                 product_profile: 'general',
//                 cus_name: 'Customer Name',
//                 cus_email: 'cust@yahoo.com',
//                 cus_add1: 'Dhaka',
//                 cus_add2: 'Dhaka',
//                 cus_city: 'Dhaka',
//                 cus_state: 'Dhaka',
//                 cus_postcode: '1000',
//                 cus_country: 'Bangladesh',
//                 cus_phone: '01711111111',
//                 cus_fax: '01711111111',
//                 ship_name: 'Customer Name',
//                 ship_add1: 'Dhaka',
//                 ship_add2: 'Dhaka',
//                 ship_city: 'Dhaka',
//                 ship_state: 'Dhaka',
//                 ship_postcode: 1000,
//                 ship_country: 'Bangladesh',
//                 multi_card_name: 'mastercard',
//                 value_a: 'ref001_A',
//                 value_b: 'ref002_B',
//                 value_c: 'ref003_C',
//                 value_d: 'ref004_D'
//             };
//             const sslcommer = new SSLCommerzPayment(process.env.SSL_STORE_ID, process.env.SSL_STORE_PASS, false) //true for live default false for sandbox
//             sslcommer.init(data).then(data => {
//                 //process the response that got from sslcommerz 
//                 //https://developer.sslcommerz.com/doc/v4/#returned-parameters
//                 res.redirect(data.GatewayPageURL)
//             });
//         })

//         app.post('/success', async (req, res) => {
//             console.log(req.body)
//             res.status(200).json(req.body)
//         })
//         app.post('/fail', async (req, res) => {
//             console.log(req.body)
//             res.status(200).json(req.body)
//         })
//         app.post('/cancel', async (req, res) => {
//             console.log(req.body)
//             res.status(200).json(req.body)
//         })

//         // order management

//         app.post('/orders', async (req, res) => {
//             const orders = req.body;
//             const date = new Date().toLocaleDateString();
//             const time = new Date().getTime();
//             const tempOrder = { ...orders, createdAtDate: date, createdAtTime: time }
//             const result = await orderCollection.insertOne(tempOrder)
//             res.json(result)
//         })
//         // update orders (payment)
//         app.put('/updateOrders', async (req, res) => {
//             const { payment } = req.body;
//             const query = { _id: ObjectId(payment?.orderId) }
//             const updateDoc = {
//                 $set: { payment: payment }
//             }
//             const result = await orderCollection.updateOne(query, updateDoc)
//             console.log(payment, result)
//             res.json(result)
//         })

//         // get orders
//         app.get('/myOrders', VerifyToken, async (req, res) => {
//             const email = req.query.email;

//             console.log(req.decodedUserEmail)
//             if (req.decodedUserEmail === email) {
//                 const currPage = parseInt(req.query.currPage);
//                 const orderPerPage = parseInt(req.query.orderPerPage);
//                 const filterType = req.query.filterType;

//                 const cursor = orderCollection.find({ 'shipping.email': email });
//                 const totalOrders = await cursor.toArray();
//                 const deliveredOrders = orderCollection.find({ 'shipping.email': email, status: 'delivered' });
//                 const deliveredArray = await deliveredOrders.toArray();

//                 // console.log()
//                 // let deliverOrder = [];
//                 let restOrders = [];
//                 let result = [];
//                 if (filterType === 'delivered') {
//                     const deliveredOrders = orderCollection.find({ 'shipping.email': email, status: 'delivered' });
//                     result = await deliveredOrders.skip(currPage * orderPerPage).limit(orderPerPage).toArray();
//                 }
//                 else {

//                     // result = await orderCollection.find({ 'shipping.email': email }).skip(currPage * orderPerPage).limit(orderPerPage).toArray();
//                     if (totalOrders?.length > 0) {
//                         result = totalOrders?.filter(item => item.status !== 'delivered')
//                         // result = [...restOrders.skip(currPage * orderPerPage).limit(orderPerPage)]
//                     }
//                 }


//                 // console.log(result)

//                 res.send({
//                     totalOrders: totalOrders?.length,
//                     deliveredOrders: deliveredArray?.length,
//                     data: result
//                 })
//             }
//             else {
//                 res.status(401).json('Unauthorized User')
//             }

//         })
//         // find order by id
//         app.get('/findOrder/:id', async (req, res) => {
//             const orderId = req.params.id;

//             const query = { _id: ObjectId(orderId) };
//             const result = await orderCollection.findOne(query)
//             console.log(result)
//             res.json(result)
//         })
//         app.get('/orders', async (req, res) => {
//             const currPage = parseInt(req.query.currPage);
//             const orderPerPage = parseInt(req.query.orderPerPage);
//             const filterType = req.query.filterType;

//             const totalOrders = await orderCollection.estimatedDocumentCount();
//             const deliveredOrders = orderCollection.find({ status: 'delivered' });
//             const deliveredArray = await deliveredOrders.toArray()
//             const updatedOrders = orderCollection.find({ status: 'updated' });
//             const updatedArray = await updatedOrders.toArray()
//             const processingOrders = orderCollection.find({ status: 'processing' });
//             const processingArray = await processingOrders.toArray()

//             // console.log(currPage, orderPerPage, filterType)

//             let result = []

//             if (filterType) {
//                 if (filterType === 'delivered') {
//                     const deliveredOrders = orderCollection.find({ status: 'delivered' });
//                     result = await deliveredOrders.skip(currPage * orderPerPage).limit(orderPerPage).toArray();
//                     // console.log('hit from delivered', result)
//                 }
//                 else if (filterType === 'updated') {
//                     const updatedOrders = orderCollection.find({ status: 'updated' });
//                     result = await updatedOrders.skip(currPage * orderPerPage).limit(orderPerPage).toArray();
//                     // console.log('hit from updated', result)
//                 }
//                 else if (filterType === 'processing') {
//                     const processingOrders = orderCollection.find({ status: 'processing' });
//                     result = await processingOrders.skip(currPage * orderPerPage).limit(orderPerPage).toArray();
//                     // console.log('hit from processing', result)
//                 }
//                 else {

//                     result = await orderCollection.find({}).skip(currPage * orderPerPage).limit(orderPerPage).toArray();
//                     // console.log('hit from all orders')
//                 }
//             }
//             // console.log('all orders', result)

//             res.send({
//                 totalOrders: totalOrders,
//                 deliveredOrders: deliveredArray?.length,
//                 updatedOrders: updatedArray?.length,
//                 processingOrders: processingArray?.length,
//                 data: result,
//             })
//         });

//         app.delete('/orders/:id', async (req, res) => {
//             const id = req.params.id;
//             const filter = { _id: ObjectId(id) }
//             const result = await orderCollection.deleteOne(filter);
//             console.log(result);
//             res.json(result)
//         })

//         // update status
//         app.put('/orders', async (req, res) => {
//             const id = req.query.id;
//             const action = req.query.action;
//             const date = new Date().toLocaleDateString();
//             const time = new Date().getTime();
//             const filter = { _id: ObjectId(id) }
//             const updateDoc = {
//                 $set: { status: action, updatedAtTime: time, updatedAtDate: date }
//             }
//             const result = await orderCollection.updateOne(filter, updateDoc);
//             console.log(result);
//             res.json(result)
//         })


//     }
//     finally {
//         // await client.close();
//     }
// };
// run().catch(console.dir)

app.get('/', (req, res) => {
    res.send("Welcome Craft-shop")
})
app.listen(port, () => {
    console.log('listening port', port)
})