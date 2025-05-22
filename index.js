const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// database config

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.ezm1s.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // database collections
    const allClg = client.db("admisure").collection("colleges");
    const researchPapers = client.db("admisure").collection("researchPaper");

    // get operations
    // get operation for home college list
    app.get("/homeClgList", async (req, res) => {
      const cursor = allClg.find().limit(3);
      const result = await cursor.toArray();
      res.send(result);
    });

    // get operation for colleges route
    app.get("/colleges", async (req, res) => {
      const cursor = allClg.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // get operation for home research card section
    app.get("/researchCardData", async (req, res) => {
      const cursor = researchPapers.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // get operation for details page
    app.get("/college-details/:id", async (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await allClg.findOne(query);
      res.send(result)
    });

    // get operation for individual card data
    app.get("/cardData", async (req, res) => {
      const cardId = req.params.id;
      const cursor = allClg.find().limit(3);
      const result = await cursor.toArray();
      res.send(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Admisure is on");
});

app.listen(port, () => {
  console.log(`Admisure is open at ${port}`);
});
