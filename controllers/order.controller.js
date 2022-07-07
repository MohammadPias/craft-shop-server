const MongoServer = require('../database/db');
const ObjectId = require('mongodb').ObjectId;

const addOrder = async (req, res) => {
    const orderCollection = MongoServer.orderCollection;
    try {
        const orders = req.body;
        const date = new Date().toLocaleDateString();
        const time = new Date().getTime();
        const tempOrder = { ...orders, createdAtDate: date, createdAtTime: time }
        const result = await orderCollection.insertOne(tempOrder)

        res.status(200).json(result)
    } catch (err) {
        res.status(500).send('This is server side error!!')
    }
}

const updateOrderPayment = async (req, res) => {
    const orderCollection = MongoServer.orderCollection;
    try {
        const orders = req.body;
        const date = new Date().toLocaleDateString();
        const time = new Date().getTime();
        const tempOrder = { ...orders, createdAtDate: date, createdAtTime: time }
        const result = await orderCollection.insertOne(tempOrder)

        res.status(200).json(result)
    } catch (err) {
        res.status(500).send('This is server side error!!')
    }
}

const updateOrderStatus = async (req, res) => {
    const orderCollection = MongoServer.orderCollection;

    try {
        const id = req.query.id;
        const action = req.query.action;
        const date = new Date().toLocaleDateString();
        const time = new Date().getTime();
        const filter = { _id: ObjectId(id) }
        const updateDoc = {
            $set: { status: action, updatedAtTime: time, updatedAtDate: date }
        }
        const result = await orderCollection.updateOne(filter, updateDoc);

        res.status(200).json(result)
    } catch (err) {
        res.status(500).send('This is server side error!!')
    }
}


const getMyOrders = async (req, res) => {
    const orderCollection = MongoServer.orderCollection
    try {
        const email = req.query.email;

        if (req.decodedUserEmail === email) {
            const currPage = parseInt(req.query.currPage);
            const orderPerPage = parseInt(req.query.orderPerPage);
            const filterType = req.query.filterType;

            const cursor = orderCollection.find({ 'shipping.email': email });
            const totalOrders = await cursor.toArray();
            const deliveredOrders = orderCollection.find({ 'shipping.email': email, status: 'delivered' });
            const deliveredArray = await deliveredOrders.toArray();

            let result = [];
            if (filterType === 'delivered') {
                const deliveredOrders = orderCollection.find({ 'shipping.email': email, status: 'delivered' });
                result = await deliveredOrders.skip(currPage * orderPerPage).limit(orderPerPage).toArray();
            }
            else {
                if (totalOrders?.length > 0) {
                    result = totalOrders?.filter(item => item.status !== 'delivered')
                }
            }

            res.status(200).json({
                totalOrders: totalOrders?.length,
                deliveredOrders: deliveredArray?.length,
                data: result
            })
        }
        else {
            res.status(401).json('Unauthorized User')
        }
    } catch (err) {
        res.status(500).send('This is server side error!!')
    }
}

const getOrderById = async (req, res) => {
    const orderCollection = MongoServer.orderCollection;

    try {
        const orderId = req.params.id;
        const query = { _id: ObjectId(orderId) };
        const result = await orderCollection.findOne(query)

        res.status(200).json(result)
    } catch (err) {
        res.status(500).send('This is server side error!!')
    }
}

const getAllOrders = async (req, res) => {
    const orderCollection = MongoServer.orderCollection;

    try {
        const currPage = parseInt(req.query.currPage);
        const orderPerPage = parseInt(req.query.orderPerPage);
        const filterType = req.query.filterType;

        const totalOrders = await orderCollection.estimatedDocumentCount();
        const deliveredOrders = orderCollection.find({ status: 'delivered' });
        const deliveredArray = await deliveredOrders.toArray()
        const updatedOrders = orderCollection.find({ status: 'updated' });
        const updatedArray = await updatedOrders.toArray()
        const processingOrders = orderCollection.find({ status: 'processing' });
        const processingArray = await processingOrders.toArray()

        // console.log(currPage, orderPerPage, filterType)

        let result = []

        if (filterType) {
            if (filterType === 'delivered') {
                const deliveredOrders = orderCollection.find({ status: 'delivered' });
                result = await deliveredOrders.skip(currPage * orderPerPage).limit(orderPerPage).toArray();
                // console.log('hit from delivered', result)
            }
            else if (filterType === 'updated') {
                const updatedOrders = orderCollection.find({ status: 'updated' });
                result = await updatedOrders.skip(currPage * orderPerPage).limit(orderPerPage).toArray();
                // console.log('hit from updated', result)
            }
            else if (filterType === 'processing') {
                const processingOrders = orderCollection.find({ status: 'processing' });
                result = await processingOrders.skip(currPage * orderPerPage).limit(orderPerPage).toArray();
                // console.log('hit from processing', result)
            }
            else {

                result = await orderCollection.find({}).skip(currPage * orderPerPage).limit(orderPerPage).toArray();
                // console.log('hit from all orders')
            }
        }
        // console.log('all orders', result)

        res.status(200).json({
            totalOrders: totalOrders,
            deliveredOrders: deliveredArray?.length,
            updatedOrders: updatedArray?.length,
            processingOrders: processingArray?.length,
            data: result,
        })
    } catch (err) {
        res.status(500).send('This is server side error!!')
    }
}

const deleteOrder = async (req, res) => {
    const orderCollection = MongoServer.orderCollection;

    try {
        const id = req.params.id;
        const filter = { _id: ObjectId(id) }
        const result = await orderCollection.deleteOne(filter);

        res.status(200).json(result)
    } catch (err) {
        res.status(500).send('This is server side error!!')
    }
}

module.exports = {
    addOrder,
    updateOrderPayment,
    updateOrderStatus,
    getMyOrders,
    getOrderById,
    getAllOrders,
    deleteOrder
}