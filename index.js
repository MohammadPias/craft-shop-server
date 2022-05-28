const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
var admin = require("firebase-admin");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())

// firebase initialize app
var serviceAccount = require('./craft-shop-43971-firebase-adminsdk-ffp0k-c3f6f18dbb.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

async function DeleteUser(req, res, next) {
    const uid = req.query?.uid
    if (req.query?.uid) {
        admin.auth()
            .deleteUser(uid)
            .then(() => {
                console.log('Successfully deleted user');
            })
            .catch((error) => {
                console.log('Error deleting user:', error);
            });
    }

    next();
}


const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@cluster0.o4muq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect()

        const database = client.db('craft-shop');
        const userCollection = database.collection('users');
        const productCollection = database.collection('products')

        // add user to database
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.json(result);
        });
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email }

            const options = { upsert: true };
            let result;
            if (user?.role === 'admin' && user?.displayName) {
                const updateDoc = {
                    $set: { displayName: user?.displayName, role: user?.role }
                };
                result = userCollection.updateOne(filter, updateDoc);
            }
            else if (user?.role === 'admin' || user?.role === 'user') {
                const updateDoc = {
                    $set: { role: user?.role }
                };
                result = userCollection.updateOne(filter, updateDoc);
            }
            else {
                const updateDoc = {
                    $set: {
                        displayName: user.displayName,
                        email: user.email,
                        photoURL: user.photoURL,
                        uid: user.uid,
                    }
                };
                result = userCollection.updateOne(filter, updateDoc, options);
                console.log(user, result)
            }
            res.json(result);
        });

        app.get('/users', async (req, res) => {
            const currPage = parseInt(req.query.currPage);
            const userPerPage = parseInt(req.query.userPerPage);

            const count = await userCollection.estimatedDocumentCount();
            const query = { role: 'admin' };
            const cursor = userCollection.find(query);
            const adminArray = await cursor.toArray();
            // console.log(currPage, userPerPage)

            let adminCount = 0;
            for (const admin of adminArray) {
                if (admin?.role === 'admin') {
                    adminCount = adminCount + 1;
                }
            }
            const search = req.query.search;
            console.log(search)

            let result = [];
            if (search === 'admins') {
                console.log(currPage)
                const cursor = userCollection.find(query);
                result = await cursor.skip(currPage * userPerPage).limit(userPerPage).toArray()
            }
            else {
                console.log('hitted from users')
                const cursor = userCollection.find({})
                result = await cursor.skip(currPage * userPerPage).limit(userPerPage).toArray()
            }

            // console.log(adminCount)
            res.send({
                adminCount,
                count,
                users: result,
            })
        });
        // delete user
        app.delete('/users', DeleteUser, async (req, res) => {
            const id = req.query?.id
            console.log(id)
            const query = { _id: ObjectId(id) }
            const result = await userCollection.deleteOne(query)
            res.json(result)
        })

        // Products Managements ==============

        // add product
        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await productCollection.insertOne(product);
            console.log('hit the post', product, result)
            res.json(result);
        });

        // get all product
        app.get('/products', async (req, res) => {
            const currPage = parseInt(req.query.currPage);
            const userPerPage = parseInt(req.query.userPerPage);
            const filterType = req.query.filterType;
            const cursor = productCollection.find({});
            const productCount = await productCollection.estimatedDocumentCount();
            console.log(filterType, currPage, userPerPage)

            let result = []
            if (filterType === 'basket') {
                const query = { category: 'Basket' };
                const cursor = productCollection.find(query);
                result = await cursor.skip(currPage * userPerPage).limit(userPerPage).toArray();
                console.log('hitting from basket')
            }
            else {
                result = await cursor.skip(currPage * userPerPage).limit(userPerPage).toArray();
                console.log('hitting from all product')
            }
            res.send({
                count: productCount,
                products: result,
            })
        })


    }
    finally {
        // await client.close();
    }
};
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send("Welcome Craft-shop")
})
app.listen(port, () => {
    console.log('listening port', port)
})