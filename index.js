const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
var jwt = require('jsonwebtoken') //to send jwt we need to require jwt. 
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;
require('dotenv').config()


//middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Smart car sever is running')
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.jjvuikj.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const serviceCollection = client.db('smartCar').collection('services');
        const ordersCollection = client.db('smartCar').collection('orders');

        app.post('/jwt', (req, res) => {
            const user = req.body;
            console.log(user);
            var token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
            res.send({ token }); //here we need to convert the token to an json(object) before sending 
        })

        app.get('/services', async (req, res) => {
            console.log(req.query);
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        })

        app.get('/checkout/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const service = await serviceCollection.findOne(query);
            res.send(service);
        })

        //order api

        app.get('/orders', async (req, res) => {
            console.log(req.query)
            let query = {};
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor = ordersCollection.find(query);
            const orders = await cursor.toArray();
            res.send(orders);
        })

        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            res.send(result)
        })

        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            res.send(result);
        })

        //updating pending status

        app.patch('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const status = req.body.status;
            const query = { _id: ObjectId(id) };
            const updateDoc = {
                $set: {
                    status: status
                },
            };
            const result = await ordersCollection.updateOne(query, updateDoc);
            res.send(result);
        })

    } finally {

    }

}
run().catch(err => console.error(err))


app.listen(port, () => {
    console.log(`Smart car project running on${port}`)
})