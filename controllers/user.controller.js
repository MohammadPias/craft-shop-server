const MongoServer = require('../database/db');
const ObjectId = require('mongodb').ObjectId;

const addUser = async (req, res) => {
    const userCollection = MongoServer.userCollection;

    try {
        const user = req.body;
        const result = await userCollection.insertOne(user);

        res.status(200).json(result)
    } catch (err) {
        res.status(500).json('There was a server side error!!')
    }
};

const updateUser = async (req, res) => {
    const userCollection = MongoServer.userCollection;

    try {
        const user = req.body;
        const filter = { email: user.email }

        const options = { upsert: true };

        let result;

        if (user?.role === 'admin' && user?.displayName) {
            const updateDoc = {
                $set: { displayName: user?.displayName, role: user?.role }
            };
            result = await userCollection.updateOne(filter, updateDoc);
        }
        else if (user?.role === 'admin' || user?.role === 'user') {
            const updateDoc = {
                $set: { role: user?.role }
            };
            result = await userCollection.updateOne(filter, updateDoc);
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
            result = await userCollection.updateOne(filter, updateDoc, options);
        }

        res.status(200).json(result)
    } catch (err) {
        res.status(500).json('There was a server side error!!')
    }
};

const updateShipping = async (req, res) => {
    const userCollection = MongoServer.userCollection;

    try {
        const email = req.query.email;
        const shipping = req.body;
        const query = { email: email }

        const updateDoc = {
            $set: { shipping: shipping }
        }
        const result = await userCollection.updateOne(query, updateDoc)

        res.status(200).json(result)
    } catch (err) {
        res.status(500).json('There was a server side error!!')
    }
};
const updateProfile = async (req, res) => {
    const userCollection = MongoServer.userCollection;

    try {

        const email = req.query.email;
        const pic = req?.files?.photoURL;
        const picData = pic?.data?.toString('base64');
        const bufferPic = Buffer.from(picData, 'base64')

        const query = { email: email }
        const updateDoc = {
            $set: { photoURL: bufferPic }
        }
        const result = await userCollection.updateOne(query, updateDoc)

        const user = await userCollection.findOne(query)
        res.status(200).json({
            result,
            photoURL: user?.photoURL,
        })
    } catch (err) {
        res.status(500).json('There was a server side error!!')
    }
};

const getUserByEmail = async (req, res) => {
    const userCollection = MongoServer.userCollection;

    try {
        const email = req.query.email;
        const query = { email: email }
        const result = await userCollection.findOne(query)

        res.status(200).json(result)
    } catch (err) {
        res.status(500).json('There was a server side error!!')
    }
};

const getUsers = async (req, res) => {
    const userCollection = MongoServer.userCollection;

    try {
        const currPage = parseInt(req.query.currPage);
        const userPerPage = parseInt(req.query.userPerPage);

        const count = await userCollection.estimatedDocumentCount();
        const query = { role: 'admin' };
        const totalAdmin = await userCollection.countDocuments(query)
        const search = req.query.search;
        // console.log(search)

        let result = [];
        if (search === 'admins') {
            // console.log(currPage, 'admin filter')
            const cursor = userCollection.find(query);
            result = await cursor.skip(currPage * userPerPage).limit(userPerPage).toArray()
        }
        else {
            // console.log('hitted from users')
            const cursor = userCollection.find({})
            result = await cursor.skip(currPage * userPerPage).limit(userPerPage).toArray()
        }

        res.status(200).json({
            adminCount: totalAdmin,
            count,
            users: result,
        })
    } catch (err) {
        res.status(500).json('There was a server side error!!')
    }
};

const deleteUser = async (req, res) => {
    const userCollection = MongoServer.userCollection;

    try {
        const id = req.query?.id
        const query = { _id: ObjectId(id) }
        const result = await userCollection.deleteOne(query)

        res.status(200).json(result)
    } catch (err) {
        res.status(500).json('There was a server side error!!')
    }
};

const checkAdmin = async (req, res) => {
    const userCollection = MongoServer.userCollection;


    try {
        const email = req.params.email;
        // console.log(email)
        const query = { email: email }
        const result = await userCollection.findOne(query);

        let admin = false;
        if (result?.role === 'admin') {
            admin = true
        }
        else {
            admin = false
        }
        res.status(200).json({ admin: admin })
        // console.log(admin, "adminCheck")

    } catch (err) {
        res.status(500).json('There was a server side error!!')
    }
};

module.exports = {
    addUser,
    updateUser,
    updateShipping,
    getUserByEmail,
    getUsers,
    deleteUser,
    updateProfile,
    checkAdmin
}