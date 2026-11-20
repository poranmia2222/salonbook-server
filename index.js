import express from "express"
import cors from 'cors'
import { MongoClient, ObjectId } from "mongodb";
import "dotenv/config";
const app = express()
const port = process.env.PORT || 5000;
app.use(express.json())
app.use(cors())

const client = new MongoClient(`mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@cluster0.rccch29.mongodb.net/`);

export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}

const connectedClient = await connectToMongoDB()
const db = connectedClient.db("SalonBook")
const services = db.collection('services')

app.get('/', (req, res)=>{
    res.send('server is running')
})


app.get('/services', async(req, res)=>{
    const cursor = services.find({});
    const result = await cursor.toArray()
    res.send(result)
})

app.get('/services/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) }
  const result = await services.findOne(query)
  res.send(result)
})


app.listen(port, ()=>{
    console.log(`you server is running on port ${port}`)
})