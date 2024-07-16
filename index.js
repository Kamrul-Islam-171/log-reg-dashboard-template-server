const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express')
const cors = require('cors');
const app = express();
const bcrypt = require('bcrypt');

const port = process.env.PORT || 5000;
require('dotenv').config()
// var jwt = require('jsonwebtoken');





app.use(express.json());
app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true,
}))


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.insvee7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const userCollection = client.db('MFS').collection('usersCollection');

    app.get('/users', async(req, res) => {
        const users = await userCollection.find().toArray();
        res.send(users);
    })

    app.post('/users', async(req, res) => {
      const info = req.body;
      const hash = await bcrypt.hash(info.pin, 10);
      info.pin = hash;
      const user = await userCollection.insertOne(info);
      res.send(user);
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



app.get('/', (req, res) => {
  res.send('MFS!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})