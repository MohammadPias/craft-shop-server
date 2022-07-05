const { MongoClient, ServerApiVersion } = require('mongodb');

class MongoServer {
    constructor() {
        const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@cluster0.o4muq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

        this.client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
    };
    async connectDb() {
        await this.client.connect();
        console.log('connected');

        this.db = this.client.db('craft-shop');
        this.productCollection = this.db.collection('products')
        this.userCollection = this.db.collection('users')
        this.orderCollection = this.db.collection('orders')
    }
}

/* async function run(callback) {
    // callback('connected')
    try {
        await client.connect();
        const database = client.db('craft-shop');
        const productCollection = database.collection('products')
        return {
            productCollection
        }
        // console.log(result)


    } catch (err) {
        await client.close();
    }
} */

const productCollection = async () => {
    return await database.collection('products').find({}).toArray()
}

module.exports = new MongoServer();;

