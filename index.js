import express from "express"
import cors from 'cors'
import { MongoClient, ObjectId } from "mongodb";
import "dotenv/config";
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

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

const connectedClient = await connectToMongoDB();
const db = connectedClient.db("SalonBook");
const services = db.collection('services');
const appointments = db.collection('appointments');
const users = db.collection('user');
const sessions = db.collection('session');

app.get('/', (req, res) => {
  res.send('server is running')
})


const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader) {
    res.status(401).send({ message: 'Unauthorized' })
    return
  }
  const token = authHeader.split(' ')[1]
  if (!token) {
    res.status(401).send({ message: 'Unauthorized' })
    return
  }
  const query = { token }
  const session = await sessions.findOne(query)

  if (!session) {
    res.status(401).send({ message: 'Unauthorized' })
    return
  }

  const userId = session.userId
  const userQuery = { _id: new ObjectId(userId) }
  const user = await users.findOne(userQuery)
  if (!user) {
    res.status(401).send({ message: 'Unauthorized' })
    return
  }
  req.user = user
  next()

}

const verifyCustomer = async (req, res, next) => {
  if (req.user.role !== 'customer') {
    res.status(401).send({ message: "Forbidden" })
    return
  }
  next()
}


const verifyAdmin = async (req, res, next) => {
  if (req.user.role !== 'admin') {
    res.status(401).send({ message: "Forbidden" })
    return
  }
  next()
}



app.get('/users',verifyToken,verifyAdmin, async (req, res) => {
  const cursor = users.find({})
  const result = await cursor.toArray()
  res.send(result)
})

app.post('/services', verifyToken, verifyAdmin, async (req, res) => {
  const service = req.body;
  const result = await services.insertOne(service)
  res.send(result)
})

app.get('/services', async (req, res) => {
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


app.patch('/services/:id', verifyToken, verifyAdmin, async (req, res) => {
  const id = req.params.id
  const updatedService = req.body
  const result = await services.updateOne(
    { _id: new ObjectId(id) },
    { $set: updatedService }
  )
  res.send(result)
})

app.delete('/services/:id', verifyToken, verifyAdmin, async (req, res) => {
  const id = req.params.id
  const query = { _id: new ObjectId(id) }
  const result = services.deleteOne(query)
  res.send(result)
})

app.get('/appointments', verifyToken, async (req, res) => {
  const query = {};
  // if (req.user.role === "admin") {
  //     query = {};
  //   }
  if (req.query.applicantId) {
    query.userId = req.query.applicantId
  }

  const cursor = appointments.find(query)
  const result = await cursor.toArray()
  res.send(result)
})


app.post("/appointment", verifyToken, verifyCustomer, async (req, res) => {
  try {
    const appointment = req.body;

    const { serviceId, date, time, duration } = appointment;

    // Convert appointment time to minutes
    const [hours, minutes] = time.split(":").map(Number);

    const newStart = hours * 60 + minutes;
    const newEnd = newStart + Number(duration);

    // Get existing appointments for the same service and date
    const existingAppointments = await appointments.find({
      serviceId,
      date,
      status: { $ne: "cancelled" },
    }).toArray();

    // Check time overlap
    const isAlreadyBooked = existingAppointments.some((item) => {
      const [existingHours, existingMinutes] = item.time
        .split(":")
        .map(Number);

      const existingStart = existingHours * 60 + existingMinutes;
      const existingEnd = existingStart + Number(item.duration);

      return newStart < existingEnd && newEnd > existingStart;
    });

    if (isAlreadyBooked) {
      return res.status(409).send({
        success: false,
        message: "This time slot is already booked. Please choose another time.",
      });
    }

    // Insert appointment
    const result = await appointments.insertOne(appointment);

    res.status(201).send({
      success: true,
      message: "Appointment booked successfully",
      insertedId: result.insertedId,
    });

  } catch (error) {
    console.error("Appointment error:", error);

    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});




app.patch('/appointment/:id',verifyToken,verifyAdmin,  async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) }
  const updatedDoc = {
    $set: {
      status: req.body.status
    }
  }
  const result = await appointments.updateOne(query, updatedDoc)
  res.send(result)
})

app.delete('/appointment/:id',verifyToken, verifyCustomer, async (req, res) => {
  const id = req.params.id;

  const query = {
    _id: new ObjectId(id)
  };

  const result = await appointments.deleteOne(query);

  res.send(result);
});


app.patch('/payments/checkout-verify', async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (typeof sessionId !== 'string' || !sessionId) {
      return res.status(400).json({
        success: false,
        message: 'A checkout session ID is required',
      });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.mode !== 'payment' || session.payment_status !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Payment not completed',
      });
    }

    const { userId, appointmentId } = session.metadata ?? {};

    if (
      !userId ||
      !appointmentId ||
      !ObjectId.isValid(appointmentId) ||
      session.client_reference_id !== appointmentId
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid appointment details in checkout session',
      });
    }

    const result = await appointments.updateOne(
      { _id: new ObjectId(appointmentId), userId },
      { $set: { payment: 'paid' } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    return res.json({
      success: true,
      message: 'Appointment updated successfully',
    });
  } catch (error) {
    console.error('Payment verification failed:', error);
    return res.status(500).json({
      success: false,
      message: 'Payment verification failed',
    });
  }
});


app.listen(port, () => {
  console.log(`you server is running on port ${port}`)
})


export default app;