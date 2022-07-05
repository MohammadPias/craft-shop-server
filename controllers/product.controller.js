const MongoServer = require('../database/db');
const ObjectId = require('mongodb').ObjectId;

const getProducts = async (req, res) => {
    const productCollection = MongoServer?.productCollection;
    try {
        const currPage = parseInt(req.query.currPage);
        const productPerPage = parseInt(req.query.productPerPage);
        const filterType = req.query.filterType;
        const cursor = productCollection.find({});
        const productCount = await productCollection.estimatedDocumentCount();

        const basketProducts = await productCollection.find({ category: 'Basket' }).toArray();
        const footwearProducts = await productCollection.find({ category: 'Footwear' }).toArray();

        console.log(currPage, productPerPage, filterType)


        let result = []
        if (filterType) {
            if (filterType === 'basket') {
                const query = { category: 'Basket' };
                const cursor = productCollection.find(query);
                result = await cursor.skip(currPage * productPerPage).limit(productPerPage).toArray();
                console.log('hitting from filter basket', currPage, productPerPage)
            }
            else if (filterType === 'footwear') {
                const cursor = productCollection.find({ category: 'Footwear' });
                result = await cursor.skip(currPage * productPerPage).limit(productPerPage).toArray();

            }
            else {
                result = await cursor.skip(currPage * productPerPage).limit(productPerPage).toArray();

            }
        }
        else {
            result = await cursor.toArray();
        }

        res.status(200).json({
            count: productCount,
            basketCount: basketProducts.length,
            footwearCount: footwearProducts.length,
            products: result,
        })
    } catch (er) {
        res.status(500).send('There was a server side error!')
    }

}

const getProductById = async (req, res) => {
    const productCollection = MongoServer.productCollection;

    try {
        const productId = req.params.productId;
        const query = { _id: ObjectId(productId) }
        const result = await productCollection.findOne(query)

        res.status(200).json(result);
    } catch (err) {
        res.status(500).json('There was a server side error!!')
    }
}

const addProduct = async (req, res) => {
    const productCollection = MongoServer?.productCollection;

    console.log()
    try {
        const product = req.body;
        const pic = req.files?.image;
        const date = new Date().toLocaleDateString();
        const time = new Date().getTime();

        let result;

        if (pic) {
            const picData = pic?.data;
            const encodedPicData = picData?.toString('base64');
            const bufferImage = Buffer?.from(encodedPicData, 'base64')

            const tempProduct = { ...product, createdAtDate: date, createdAtTime: time, image: bufferImage }

            result = await productCollection.insertOne(tempProduct);
        } else {
            result = await productCollection.insertOne({ ...product, createdAtDate: date, createdAtTime: time });
        }

        res.status(200).send(result);
    } catch (err) {
        res.status(500).send('There was a server side error!');
    }

}

const updateProduct = async (req, res) => {
    const productCollection = MongoServer?.productCollection;

    try {
        const productId = req.params.productId;
        const review = req.body.formData;
        const updateInfo = req.body.updateInfo;

        const query = { _id: ObjectId(productId) };

        let result = {};
        if (review?.rating) {
            const updateDoc = {
                $push: { reviews: review }
            }
            result = await productCollection.updateOne(query, updateDoc)
        }
        else {
            const updateDoc = {
                $set: updateInfo
            }
            result = await productCollection.updateOne(query, updateDoc)
        }
        // console.log('')
        // console.log(result, updateInfo)
        res.status(200).json(result)
    } catch (err) {
        res.status(500).json('There was a server side error!!')
    }
}

const deleteProduct = async (req, res) => {
    const productCollection = MongoServer?.productCollection;

    try {
        const productId = req.params.productId;
        const query = { _id: ObjectId(productId) };
        const result = await productCollection.deleteOne(query);

        res.status(200).json(result)
    } catch (err) {
        res.status(500).json('There was a server side error!!')
    }
}

module.exports = {
    getProducts,
    addProduct,
    updateProduct,
    getProductById,
    deleteProduct,
}