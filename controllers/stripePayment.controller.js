const stripe = require("stripe")(process.env.CLIENT_SECRET);
const SSLCommerzPayment = require('sslcommerz');

const makeStripePayment = async (req, res) => {
    const { amount } = req.body;
    console.log(amount * 100, typeof (amount))
    const newAmount = amount * 100;
    if (newAmount) {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100,
            currency: "usd",
            payment_method_types: ['card']
        });
        res.send({
            clientSecret: paymentIntent.client_secret,
        });
    }
}


const makeSSLPayment = async (req, res) => {
    const data = {
        total_amount: 100,
        currency: 'EUR',
        tran_id: 'REF123',
        success_url: 'http://localhost:5000/success',
        fail_url: 'http://localhost:5000/fail',
        cancel_url: 'http://localhost:5000/cancel',
        ipn_url: 'http://yoursite.com/ipn',
        shipping_method: 'Courier',
        product_name: 'Computer.',
        product_category: 'Electronic',
        product_profile: 'general',
        cus_name: 'Customer Name',
        cus_email: 'cust@yahoo.com',
        cus_add1: 'Dhaka',
        cus_add2: 'Dhaka',
        cus_city: 'Dhaka',
        cus_state: 'Dhaka',
        cus_postcode: '1000',
        cus_country: 'Bangladesh',
        cus_phone: '01711111111',
        cus_fax: '01711111111',
        ship_name: 'Customer Name',
        ship_add1: 'Dhaka',
        ship_add2: 'Dhaka',
        ship_city: 'Dhaka',
        ship_state: 'Dhaka',
        ship_postcode: 1000,
        ship_country: 'Bangladesh',
        multi_card_name: 'mastercard',
        value_a: 'ref001_A',
        value_b: 'ref002_B',
        value_c: 'ref003_C',
        value_d: 'ref004_D'
    };
    const sslcommer = new SSLCommerzPayment(process.env.SSL_STORE_ID, process.env.SSL_STORE_PASS, false) //true for live default false for sandbox
    sslcommer.init(data).then(data => {
        res.redirect(data.GatewayPageURL)
    });
}

const paymentSuccess = async (req, res) => {
    console.log(req.body)
    res.status(200).json(req.body)
}

const paymentFail = async (req, res) => {
    console.log(req.body)
    res.status(200).json(req.body)
}

const paymentCancel = async (req, res) => {
    console.log(req.body)
    res.status(200).json(req.body)
}

module.exports = {
    makeStripePayment,
    makeSSLPayment,
    paymentSuccess,
    paymentFail,
    paymentCancel,
}