const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { query } = require('express');
require('dotenv').config()


const app = express()


app.use(cors())
app.use(express.json())


// const uri = " mongodb://localhost:27017"
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_USERNAME}@cluster0.hlyc9ph.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {

        const catagoryCollections = client.db('Book-House').collection('Catagorys')
        const booksCollections = client.db('Book-House').collection('books')
        const userCollections = client.db('Book-House').collection('users')



        const verifyAdmin = async (req, res, next) => {
            const decodedEmail = req.decoded.email
            const query = { email: decodedEmail }
            const user = await userCollection.findOne(query)
            if (user?.role !== 'Admin') {
                return res.status(403).send({ message: 'You are not a admin' })
            }
            next()

        }






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
                console.log('data')
                return res.send('This user is allready created')
            }

            else {
                const result = await userCollections.insertOne(user)
                res.send(result)
            }
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

        app.get('/users', async (req, res) => {
            const query = {}
            const result = await userCollections.find(query).toArray()
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