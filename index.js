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
    const users = client.db("admisure").collection("users");
    const myCollege = client.db("admisure").collection("my-college");
    const reviews = client.db("admisure").collection("reviews");

    // get operations
    // get operation for home college list
    app.get("/homeClgList", async (req, res) => {
      const cursor = allClg.find().limit(3);
      const result = await cursor.toArray();
      res.send(result);
    });

    // get operation for reviews
    app.get("/get-review-data", async (req, res) => {
      const cursor = reviews.find().sort({ createdAt: -1 });
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

    // get operation for home research work section
    app.get("/research-work", async (req, res) => {
      const clgName = req.query.name;
      const query = { university: clgName };
      const result = await researchPapers.findOne(query);
      res.send(result);
    });

    // get operation for details page
    app.get("/college-details/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allClg.findOne(query);
      res.send(result);
    });

    // get operation for individual card data
    app.get("/cardData", async (req, res) => {
      const cardId = req.params.id;
      const cursor = allClg.find().limit(3);
      const result = await cursor.toArray();
      res.send(result);
    });

    //get operation for uni-address
    app.get("/uni-address", async (req, res) => {
      const { email, name, image } = req?.query;

      const query = {
        name: name,
        image: image,
        email: email,
      };

      const result = await users.findOne(query);
      res.send(result);
    });

    // get operation for my- college data
    app.get("/my-colleges", async (req, res) => {
      const userEmail = req.query.email;
      const query = { userEmail: userEmail };
      const result = await myCollege
        .find(query)
        .sort({ createdAt: -1 })
        .toArray();
      res.send(result);
    });

    app.get("/search-colleges", async (req, res) => {
      const search = req.query.search || "";
      const filter = search ? { name: { $regex: search, $options: "i" } } : {};

      const result = await allClg.find(filter).toArray();
      res.json(result);
    });

    // POST OPERATIONS
    // post operation for users
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email, image: user.image };
      const existingUser = await users.findOne(query);

      // checking if user exist
      if (existingUser) {
        return res.send({ message: "USER ALREADY EXISTS", insertedId: null });
      }

      // user added with current added time
      const userToBeAdded = {
        ...user,
        createdAt: new Date(),
        university: null,
        address: null,
      };

      const result = await users.insertOne(userToBeAdded);
      res.send(result);
    });

    app.post("/my-college-application", async (req, res) => {
      const data = req.body;
      const finalData = {
        ...data,
        createdAt: new Date(),
      };

      const name = data?.candidateName;
      const college = data?.selectedCollege;
      const query = {
        candidateName: name,
        selectedCollege: college,
      };

      const existingUserName = await myCollege.findOne(query);

      if (existingUserName) {
        return res.send({
          message: "USER NAME ALREADY EXISTS",
          insertedId: null,
        });
      }

      const result = await myCollege.insertOne(finalData);
      res.send(result);
    });

    // post operation for review
    app.post("/review-data-post", async (req, res) => {
      const data = req.body;
      const finalReviewData = {
        ...data,
        createdAt: new Date(),
      };

      if (!finalReviewData) {
        return res.send({
          message: "Something went wrong",
          insertedId: null,
        });
      }

      const result = await reviews.insertOne(finalReviewData);
      res.send(result);
    });

    // PUT OPERATION
    // put operation for update profile
    app.put("/update-profile-data", async (req, res) => {
      const data = req.body;
      const prevImg = data?.previousImage;
      const email = data?.email;
      const prevName = data?.previousName;

      // data to be updated
      const name = data?.name;
      const image = data?.newImage;
      const university = data?.university;
      const address = data?.address;

      const query = {
        email: email,
        name: prevName,
        image: prevImg,
      };

      const user = await users.findOne(query);

      if (!user) {
        return res.send({ message: "USER NOT FOUND", modifiedCount: null });
      }

      // without new image
      if (image === undefined) {
        const dataWithoutImg = {
          name,
          university,
          address,
        };

        const updatedDocWithoutImg = {
          $set: dataWithoutImg,
        };
        const result = await users.updateOne(query, updatedDocWithoutImg);
        res.send(result);
      }

      // with new image
      if (image) {
        const dataWithImg = {
          name,
          image,
          university,
          address,
        };

        const updatedDocWithImg = {
          $set: dataWithImg,
        };
        const result = await users.updateOne(query, updatedDocWithImg);
        res.send(result);
      }
    });

    app.put("/put-individual-review-data/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const query = { _id: new ObjectId(id) };

      const myApplication = await myCollege.findOne(query);

      if (!myApplication) {
        return res.send({
          message: "Application not found",
          modifiedCount: null,
        });
      }

      const reviewData = {
        ...data,
        createdAt: new Date(),
      };

      const finalData = {
        review: reviewData,
      };

      const updatedDoc = {
        $set: finalData,
      };

      const result = await myCollege.updateOne(query, updatedDoc);
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
