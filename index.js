const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000
const jwt = require('jsonwebtoken')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { query } = require('express');
require('dotenv').config()

const stripe = require('stripe')(process.env.KEY)


const app = express()


app.use(cors())
app.use(express.json())


// const uri = " mongodb://localhost:27017"
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_USERNAME}@cluster0.hlyc9ph.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });




function verifyJWT(req, res, next) {

    const headers = req.headers.auth
    if (!headers) {
        return res.status(401).send('you are not a valid user')
    }

    const token = headers.split(' ')[1]
    jwt.verify(token, process.env.TOKEN_PIN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Please login again' })
        }
        req.decoded = decoded
        next()
    });


}




async function run() {
    try {

        const catagoryCollections = client.db('Book-House').collection('Catagorys')
        const booksCollections = client.db('Book-House').collection('books')
        const userCollections = client.db('Book-House').collection('users')
        const orderCollections = client.db('Book-House').collection('order')
        const paymentCollections = client.db('Book-House').collection('payment')


        // const verifyAdmin = async (req, res, next) => {
        //     const decodedEmail = req.decoded.email
        //     const query = { email: decodedEmail }
        //     const user = await userCollections.findOne(query)
        //     if (user?.role !== 'Admin') {
        //         return res.status(403).send({ message: 'You are not a admin' })
        //     }
        //     next()
        // }

        // const verifySeller = async (req, res, next) => {
        //     const decodedEmail = req.decoded.email
        //     const query = { email: decodedEmail }
        //     const user = await userCollections.findOne(query)
        //     if (user?.role !== 'Seller') {
        //         return res.status(403).send({ message: 'You are not a admin' })
        //     }
        //     next()

        // }



        app.get('/jwt', async (req, res) => {
            const email = req.query.email

            const query = { email: email }
            const user = await userCollections.findOne(query)

            if (user) {
                const token = jwt.sign({ email }, process.env.TOKEN_PIN, { expiresIn: '1d' })
                return res.send({ accessToken: token })
            }
            res.status(401).send({ message: 'Unauthorize' })
        })








        app.get('/catagorys', async (req, res) => {
            const query = {}
            const result = await catagoryCollections.find(query).toArray()
            res.send(result)
        })

        app.get('/catagory/:id', async (req, res) => {
            const name = req.params.id
            const query = { catagory: name }
            const result = await booksCollections.find(query).toArray()
            res.send(result)
        })

        app.post('/users', async (req, res) => {
            const user = req.body
            const email = req.body.email
            const query = { email: email }
            const newUser = await userCollections.find(query).toArray()

            if (newUser.length > 0) {

                return res.send('This user is allready created')
            }

            else {
                const result = await userCollections.insertOne(user)
                res.send(result)
            }
        })

        app.get('/user/:id', async (req, res) => {
            const id = req.params.id
            const email = { email: id }

            const result = await userCollections.findOne(email)

            res.send(result)
        })

        app.get('/user/admin/:email', async (req, res) => {
            const email = req.params.email
            const query = { email }
            const user = await userCollections.findOne(query)
            res.send({ isAdmin: user?.role === 'Admin' })
        })

        app.get('/user/seller/:email', async (req, res) => {
            const email = req.params.email
            const query = { email }
            const user = await userCollections.findOne(query)
            res.send({ isSeller: user?.role === 'Seller' })
        })


        app.get('/seller', async (req, res) => {
            const role = req.query
            const user = await userCollections.find(role).toArray()
            res.send(user)
        })

        app.get('/buyer', async (req, res) => {
            const role = req.query
            const user = await userCollections.find(role).toArray()
            res.send(user)
        })

        app.post('/catagorys', async (req, res) => {
            const body = req.body
            const result = await booksCollections.insertOne(body)
            res.send(result)
        })

        app.post('/order', async (req, res) => {
            const body = req.body
            const result = await orderCollections.insertOne(body)
            res.send(result)
        })

        app.get('/order-buyer', async (req, res) => {
            const email = req.query
            const result = await orderCollections.find(email).toArray()
            res.send(result)
        })

        app.get('/order-seller', async (req, res) => {
            const email = req.query

            const result = await booksCollections.find(email).toArray()
            res.send(result)
        })

        app.delete('/buyer/:id', verifyJWT, async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await userCollections.deleteOne(query)
            res.send(result)
        })

        app.delete('/product/:id', verifyJWT, async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await booksCollections.deleteOne(query)
            res.send(result)
        })

        app.get('/my-buyer', async (req, res) => {
            const email = req.query
            const result = await orderCollections.find(email).toArray()
            res.send(result)
        })

        app.delete('/my-buyer/:id', async (req, res) => {
            const id = req.params.id

            const query = { _id: ObjectId(id) }
            const result = await orderCollections.deleteOne(query)

            res.send(result)
        })

        app.get('/books', async (req, res) => {
            const query = {}
            const result = await booksCollections.find(query).toArray()
            res.send(result)
        })

        app.put('/products/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const option = { upsert: true }
            const updatedDoc = {
                $set: {
                    add: 'true'
                }
            }
            const result = await booksCollections.updateOne(query, updatedDoc, option)
            res.send(result)

        })

        app.put('/user/:id', async (req, res) => {
            const id = req.params.id
            console.log(id)
            const query = { email: id }
            console.log(query);
            const option = { upsert: true }
            const updatedDoc = {
                $set: {
                    verify: 'true'
                }
            }
            const result = await userCollections.updateOne(query, updatedDoc, option)
            const result2 = await booksCollections.updateMany(query, updatedDoc, option)

            res.send(result)

        })



        app.get('/order/:id', async (req, res) => {
            const id = req.params.id
            console.log(id)
            const query = { _id: ObjectId(id) }
            const result = await orderCollections.findOne(query)
            res.send(result)
        })


        app.post("/create-payment-intent", async (req, res) => {
            const orders = req.body;
            const price = orders.price;
            const amount = price * 100;

            const paymentIntent = await stripe.paymentIntents.create({
                currency: "usd",
                amount: amount,
                payment_method_types: ["card"],
            });

            res.send({
                clientSecret: paymentIntent.client_secret,
            });
        });

        // post payment info to db
        app.post("/payments", async (req, res) => {
            const payment = req.body;
            const result = await paymentCollections.insertOne(payment);
            const id = payment.orderId;
            const filter = { _id: ObjectId(id) };
            const updatedDoc = {
                $set: {
                    paid: true,
                    transactionId: payment.transactionId,
                },
            };
            const updatedResult = await orderCollections.updateOne(
                filter,
                updatedDoc
            );
            res.send(result);
        });


        app.put('/books', async (req, res) => {
            const id = req.query

            const option = { upsert: true }
            const updatedDoc = {
                $set: {
                    paid: 'true'
                }
            }
            const result = await booksCollections.updateOne(id, updatedDoc, option)
            console.log(result)
            res.send(result)
        })

        app.put('/report/:id', async (req, res) => {
            const id = req.params.id
            console.log(id);
            const query = { _id: ObjectId(id) }
            const option = { upsert: true }
            const updatedDoc = {
                $set: {
                    report: 'report'
                }
            }
            const result = await booksCollections.updateOne(query, updatedDoc, option)
            res.send(result)
        })

        app.get('/report', async (req, res) => {
            const id = req.query
            const result = await booksCollections.find(id).toArray()
            res.send(result)
        })



    }
    finally {

    }

}

run().catch(er => console.log(er))


app.get('/', (req, res) => {
    res.send('This site is running now')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})