const functions = require('firebase-functions');

const express = require('express');
const admin = require('firebase-admin');
const app = express();

const path = require('path');
const bodyParser = require('body-parser');

const serviceAccount = require('./service.json')

const engine = require('ejs-locals');
app.engine('ejs', engine);

app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');
app.use('/assets', express.static('assets'))

app.use(bodyParser.urlencoded({ extended: true }))

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://apnakisan-cfe53.firebaseio.com"
})
const auth = admin.auth();
const db = admin.firestore();

app.get('/', (req, res) => {
    res.render('index')
})
app.post('/login', async (req, res) => {
    var email = req.body.loginid;
    var pass = req.body.password;
    console.log(email)
    try {
        var user = await db.collection('apnakisanorders').get();
        console.log(orders)
        res.render('pages/orders',{orders})
    } catch (error) {
        console.log(error)
    } 
})

app.get('/orders',)
app.get('/register', (req, res) => {
    res.render('pages/register')
})
app.post('/register', async (req, res) => {
    var loginid = req.body.loginid;
    var pass = req.body.password;
    try {
        var user = await db.collection('users').add({
            id:loginid,
            password:pass
        })
        console.log(user.id)
        res.render('index', { user })
    } catch (error) {
        console.log(error);
        res.redirect('/register')
    }

})

// app.listen(5000)
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.adminapp = functions.https.onRequest(app);
