var admin = require("firebase-admin");

var serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
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

async function VerifyToken(req, res, next) {
    // console.log(req.headers)
    if (req?.headers?.authorization?.startsWith('Bearer ')) {
        const token = req.headers.authorization.split('Bearer ')[1];
        try {
            const decodedUser = await admin.auth().verifyIdToken(token);
            req.decodedUserEmail = decodedUser?.email;
        }
        catch {
            res.status(402).send('Can not parse your profile by access token!!')
        }
    }
    next();
}

module.exports = { DeleteUser, VerifyToken };