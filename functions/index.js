const functions = require('firebase-functions');

const express = require('express');
const admin = require('firebase-admin');
const app = express();

const path = require('path');
const bodyParser = require('body-parser');

const serviceAccount = require('./service.json')
const moment = require('moment')

const engine = require('ejs-locals');
const cookieParser = require('cookie-parser');
app.engine('ejs', engine);

app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');
app.use('/assets', express.static('assets'))

app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser());

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://apnakisan-cfe53.firebaseio.com"
})
const auth = admin.auth();
const db = admin.firestore();

async function checkAuthenticated(req, res, next) {
    var cookie = req.cookies.__session || '';
    if (cookie === 'cookiesecret') {
        return next();
    } else {
        return res.redirect('/login')
    }
}

app.get('/', checkAuthenticated, async (req, res) => {
    try {
        var orders = await db.collection('apnakisanorders').get();
        const data1 = [];
        console.log(typeof orders.docs);

        for (const [key, value] of Object.entries(orders.docs)) {
                // console.log(`${key}: ${value.data().orderTime.toDate().getDate()}`);
                console.log(`${key}: ${value.data().orderTime.toDate().getDate()}`);
                var string = value.data().orderTime.toDate().getFullYear()+'-'+value.data().orderTime.toDate().getMonth()+'-'+value.data().orderTime.toDate().getDate()
                console.log(string)

        }

        // for (const [key, value] of Object.entries(orders.docs)) {
        //     // console.log(`${key}: ${value.data().orderTime.toDate()}`);

        //     // value.data().phoneNumber = 1245454;
        //     // console.log(typeof value);
        //     console.log(key+'....');
        //     let x = {};
        //     for (const [index,data] of Object.entries(value.data())) {
        //         // console.log(typeof data);

        //         console.log(`${index}: ${data}`);
        //         x.index=data;
        //         x.phoneNumber = 121313;
        //         // if(index === 'phoneNumber') {
        //         //     console.log(key+'....')
        //         //     console.log(`${index}: ${data}`);
        //         // }else{
        //         //     value.data().phoneNumber = 45454545;
        //         // }
        //     }
        //     data1.push(x);
        // }
        // console.log(data1)

        return res.render('pages/orders', { orders });
    } catch (error) {
        console.log(error);
    }
})

app.get('/order/:id', async (req, res) => {

    try {
        var orderid = req.params.id;
        console.log(orderid)
        var order = await db.collection('apnakisanorders').doc(orderid).get();
        // const products = [];
        // for (const [key, value] of Object.entries(order.data().orderItems)) {
        //     // console.log(`${key}: ${value}`)
        //     // console.log(typeof value)
        //     products.push(value.data)
        //     for (const [index, content] of Object.entries(value.data)) {
        //         // console.log(`${index}:${content}`)
        //     }
        // }


        // products.forEach(async product => {
        //     if(exitboolean) return console.log('varientQty not available for '+product.varientName+'-----'+product.productNameHindi);
        //     var productref = db.collection('products').doc('All Products').collection('Products').doc(product.productID);
        //     var productData = await productref.get()
        //     // console.log(productData.data().varients);
        //     const varients = productData.data().varients;
        //     let x; // object assigning again to variable x for varient
        //     varients.forEach(varient => {
        //         if(exitboolean) return;            
        //         if(product.varientName === varient.varientName){
        //             console.log(varient)
        //             x=varient;
        //             x.varientQty = varient.varientQty - product.productQty;
        //             if (x.varientQty < 0) {
        //                 exitboolean = true;
        //                 return;
        //             }
        //             if (x.sold) {
        //                 x.sold += product.productQty
        //             }else{
        //                 x.sold = product.productQty
        //             }
        //         }
        //     })
        //     console.log(x)        


        // })
        return res.render('pages/orderassign', { order });
    } catch (error) {
        console.log(error)
    }


})

app.post('/order/:id', async (req, res) => {
    try {
        var address = req.body.delivery_address;
        var deliveryPerson = req.body.delivery_person;

        var order = await db.collection('apnakisanorders').doc(req.params.id).get();
        const products = [];
        for (const [key, value] of Object.entries(order.data().orderItems)) {
            // console.log(`${key}: ${value}`)
            // console.log(typeof value)
            products.push(value.data)
            for (const [index, content] of Object.entries(value.data)) {
                // console.log(`${index}:${content}`)
            }
        }
        // console.log(products);
        // var exitboolean = false;

        for (let index = 0; index < products.length; index++) {
            const product = products[index];
            // if(exitboolean) return res.json('varientQty not available for '+product.varientName+'-----'+product.productNameHindi);
            var productref = db.collection('products').doc('All Products').collection('Products').doc(product.productID);
            var productData = productref.get()
            // console.log(productData.data().varients);
            const varients = productData.data().varients;
            let x; // object assigning again to variable x for varient
            for (let i = 0; i < varients.length; i++) {
                const varient = varients[i];
                // if(exitboolean) return res.json('varientQty not available for '+product.varientName+'-----'+product.productNameHindi);           
                if (product.varientName === varient.varientName) {
                    console.log(varient)
                    x = varient;
                    x.varientQty = varient.varientQty - product.productQty;
                    if (x.varientQty < 0) {
                        // exitboolean = true;
                        return res.json('varientQty not available for ' + product.varientName + '-----' + product.productNameHindi);
                    }
                    if (x.sold) {
                        x.sold = Number(x.sold) + Number(product.productQty)
                    } else {
                        x.sold = product.productQty
                    }
                    const rem = productref.update({
                        // varients: admin.firestore.FieldValue.arrayRemove(varient),
                        varients: varients.filter(name => name.varientName !== varient.varientName)
                    });
                    const add = productref.update({
                        varients: admin.firestore.FieldValue.arrayUnion(x)
                    });
                }
            }
            console.log(x)
        }
        // console.log(products)
        var status = await db.collection('apnakisanorders').doc(req.params.id).update({
            orderStatus: req.body.order_status,
            orderPlaceTime: new Date(),
            deliveryAddress: address,
            deliveryPerson: deliveryPerson
        });
        // products.forEach(async product => {
        //    var productData = await db.collection('products').doc('All Products').collection('Products').doc(product.productID).get()
        // })

        console.log(status)
        res.redirect(`/order/${req.params.id}`)
    } catch (error) {
        console.log(error);
    }
})

app.get('/products', (req, res) => {
    res.render('pages/products')
})

app.get('/product/:category', async (req, res) => {
    const category = req.params.category;
    // console.log(req.params.category);
    var productref = db.collection('products').doc('All Products').collection('Products').where("category", "==", category);
    var products = await productref.get();
    res.render('pages/productCategory', { category,categoryProducts:products })
})

app.get('/login', (req, res) => {
    res.render('index')
})

app.post('/login', async (req, res) => {
    var email = req.body.loginid;
    var pass = req.body.password;

    try {
        var user = await db.collection('users').doc(email).get();
        if (user.data().password === pass) {
            res.cookie('__session', 'cookiesecret');
            return res.redirect('/');
        }
        return res.redirect('/login')
    } catch (error) {
        console.log(error);
        return res.redirect('/login');
    }
})

// app.get('/orders',(req,res)=>{})
app.get('/register', (req, res) => {
    res.render('pages/register')
})

app.post('/register', async (req, res) => {
    var loginid = req.body.loginid;
    var pass = req.body.password;
    try {
        var user = await db.collection('users').doc(loginid).set({
            password: pass
        })
        console.log(user.id)
        res.redirect('/')
    } catch (error) {
        console.log(error.errorInfo);
        res.redirect('/register')
    }
})

exports.adminapp = functions.https.onRequest(app);
