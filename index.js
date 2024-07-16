const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express')
const cors = require('cors');
const app = express();
const bcrypt = require('bcrypt');

const port = process.env.PORT || 5000;
require('dotenv').config()
var jwt = require('jsonwebtoken');





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

const verifyToken = (req, res, next) => {
  // console.log('inside = ', req.headers.authorization);
  if (!req.headers.authorization) {


    return res.status(401).send({ message: 'Forbidden-Access' });
  }
  const token = req.headers.authorization.split(' ')[1];
  // console.log(token)

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {

      return res.status(401).send({ message: 'Forbidden-Access' });
    }
    req.decoded = decoded;
    console.log('decoded value = ',decoded);

    next();
  });

}

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const userCollection = client.db('MFS').collection('usersCollection');

    app.post('/jwt', async (req, res) => {
      const user = req.body;
      // console.log('user info =', user)
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '8h' });
      res.send({ token })
    })

    app.get('/users', async (req, res) => {
      const users = await userCollection.find().toArray();
      res.send(users);
    })

    app.get('/my-name',verifyToken , async (req, res) => {
      // console.log('hello');
      // console.log('body = ', req.body);
      // res.send({message:'hello'})
    })

    app.post('/users', async (req, res) => {
      const info = req.body;
      const hash = await bcrypt.hash(info.pin, 10);
      info.pin = hash;
      const user = await userCollection.insertOne(info);
      res.send(user);
    })

    app.get('/userLogin', async (req, res) => {
      // console.log(req.body);
      const { email, pin } = req.query;
      // console.log(email)
      const user = await userCollection.findOne({ email: email });
      if (!user) {
        return res.send({ message: 'User not found' });
      }
      const hashPin = await bcrypt.compare(pin, user.pin);
      if (!hashPin) {
        res.send({ message: 'Pass not matched' })
      }
      res.send({ message: 'matched' });
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