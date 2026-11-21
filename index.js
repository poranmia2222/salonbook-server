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

app.get('/', (req, res) => {
  res.send('server is running')
})

app.get('/users', async(req, res)=>{
  const cursor = users.find({})
  const result = await cursor.toArray()
  res.send(result)
})

app.post('/services', async (req, res) => {
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


app.patch('/services/:id', async (req, res) => {
  const  id  = req.params.id
  const updatedService = req.body
  const result = await services.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedService }
    )
  res.send(result)
})

app.delete('/services/:id', async (req, res)=>{
  const  id  = req.params.id
  const query = {_id: new ObjectId(id)}
  const result = services.deleteOne(query)
  res.send(result)
})


app.get('/appointments', async (req, res) => {
  const query = {};
  if (req.query.applicantId) {
    query.userId = req.query.applicantId
  }
  // if(req.query.jobId){
  //   query.jobId = req.query.jobId
  // }
  const cursor = appointments.find(query)
  const result = await cursor.toArray()
  res.send(result)
})



// app.post('/appointment', async(req, res)=>{
//   const appointment = req.body;
//   const result = await appointments.insertOne(appointment)
//   res.send(result)
// })
// app.post("/appointment", async (req, res) => {
//   try {
//     console.log("Received appointment:", req.body);

//     const appointment = req.body;

//     const result = await appointments.insertOne(appointment);

//     console.log("MongoDB result:", result);

//     res.status(201).send({
//       success: true,
//       message: "Appointment booked successfully",
//       insertedId: result.insertedId,
//     });
//   } catch (error) {
//     console.error("Appointment error:", error);

//     res.status(500).send({
//       success: false,
//       message: error.message,
//     });
//   }
// });



app.post("/appointment", async (req, res) => {
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




app.patch('/appointment/:id', async (req, res) => {
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

app.delete('/appointment/:id', async (req, res) => {
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

    // 1. Retrieve Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // 2. Check payment
    if (session.payment_status !== 'paid') {
      return res.status(400).send({
        success: false,
        message: 'Payment not completed',
      });
    }

    // 3. Get appointment details from metadata
    const { userId, appointmentId } = session.metadata;

    // 4. Update only the matching appointment
    const result = await appointmentsCollection.updateOne(
      {
        _id: new ObjectId(appointmentId),
        userId: userId,
      },
      {
        $set: {
          payment: "paid",
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).send({
        success: false,
        message: 'Appointment not found',
      });
    }

    res.send({
      success: true,
      message: 'Appointment updated successfully',
    });

  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: 'Payment verification failed',
    });
  }
});


app.listen(port, () => {
  console.log(`you server is running on port ${port}`)
})