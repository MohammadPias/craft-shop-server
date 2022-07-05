class User {
    constructor(db) {
        this.collection = db.collection('products');
        // console.log(db)
    }
    async addUser(user) {
        const newUser = await this.collection.insertOne(user);
        return newUser;
    }
    async getProducts() {
        const result = await this.collection.find({}).toArray();
        return result;
    }
}
module.exports = User;