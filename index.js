const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
app.use(cors())
app.use(express.json())
require('dotenv').config()

app.get('/', (req, res) => {
    res.send('hello toys')
})




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tfxumrl.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10,
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)

        client.connect(error => {
            if (error) {
                console.log(error);
                return
            }
        })

        await client.connect();
        const toysCollection = await client.db('ToyAssemble').collection('Toys')

        app.get('/toys', async (req, res) => {
            const result = await toysCollection.find().toArray()
            res.send(result)
        })

        app.get('/toysForLimit', async (req, res) => {
            const { limit, page } = req.query;
            const pageSize = parseInt(limit) || 20;
            const pageNumber = parseInt(page) || 0;
            const skip = pageNumber * pageSize;
            const result = await toysCollection.find().skip(skip).limit(pageSize).toArray()
            res.send(result)
        })

        app.get('/totalToys', async (req, res) => {
            const result = await toysCollection.estimatedDocumentCount()
            res.send({ totalToys: result })
        })

        app.get('/toys/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const result = await toysCollection.findOne(filter)
            res.send(result)
        })

        app.get('/toysQuery', async (req, res) => {
            let query = {};
            if (req.query?.email) {
                query = { seller_email: req.query.email }
            }
            let sortBy = {}
            if (req.query?.sortBy) {
                sortBy = {
                    price: req.query.sortBy === 'descending' ? -1 : 1
                }
            }
            const result = await toysCollection.find(query).sort(sortBy).toArray()
            res.send(result)
        })

        app.post('/toys', async (req, res) => {
            const body = req.body
            const result = await toysCollection.insertOne(body)
            res.send(result)
        })

        app.put('/toys/:id', async (req, res) => {
            const id = req.params.id
            const body = req.body
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true }
            const updateDoc = {
                $set: {
                    price: body.price,
                    quantity: body.quantity,
                    description: body.description
                },
            };
            const result = await toysCollection.updateOne(filter, updateDoc, options)
            res.send(result)
        })

        app.delete('/toys/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await toysCollection.deleteOne(query)
            res.send(result)
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.listen(port, () => {
    console.log(`port is running on ${port}`)
})