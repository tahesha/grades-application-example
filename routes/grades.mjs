// Import necessary packages and modules
import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";

const router = express.Router();

// Create a single grade entry
router.post("/", async (req, res) => {
  let collection = await db.collection("grades");
  let newDocument = req.body;

  // Rename fields for backwards compatibility
  if (newDocument.student_id) {
    newDocument.learner_id = newDocument.student_id;
    delete newDocument.student_id;
  }

  let result = await collection.insertOne(newDocument);
  res.status(204).send(result);
});

// Get a single grade entry
router.get("/:id", async (req, res) => {
  let collection = await db.collection("grades");
  let query = { _id: ObjectId(req.params.id) };
  let result = await collection.findOne(query);

  if (!result) res.status(404).send("Not found");
  else res.status(200).send(result);
});

// Add a score to a grade entry
router.patch("/:id/add", async (req, res) => {
  let collection = await db.collection("grades");
  let query = { _id: ObjectId(req.params.id) };

  let result = await collection.updateOne(query, {
    $push: { scores: req.body }
  });

  if (!result) res.status(404).send("Not found");
  else res.status(200).send(result);
});

// Remove a score from a grade entry
router.patch("/:id/remove", async (req, res) => {
  let collection = await db.collection("grades");
  let query = { _id: ObjectId(req.params.id) };

  let result = await collection.updateOne(query, {
    $pull: { scores: req.body }
  });

  if (!result) res.status(404).send("Not found");
  else res.status(200).send(result);
});

// Delete a single grade entry
router.delete("/:id", async (req, res) => {
  let collection = await db.collection("grades");
  let query = { _id: ObjectId(req.params.id) };
  let result = await collection.deleteOne(query);

  if (!result) res.status(404).send("Not found");
  else res.status(200).send(result);
});

// Get route for backwards compatibility
router.get("/student/:id", async (req, res) => {
  res.redirect(`/learner/${req.params.id}`);
});

// Get a learner's grade data
router.get("/learner/:id", async (req, res) => {
  let collection = await db.collection("grades");
  let query = { learner_id: Number(req.params.id) };

  // Check for class_id parameter
  if (req.query.class) query.class_id = Number(req.query.class);

  let result = await collection.find(query).toArray();

  if (!result) res.status(404).send("Not found");
  else res.status(200).send(result);
});

// Delete a learner's grade data
router.delete("/learner/:id", async (req, res) => {
  let collection = await db.collection("grades");
  let query = { learner_id: Number(req.params.id) };

  let result = await collection.deleteMany(query);

  if (!result) res.status(404).send("Not found");
  else res.status(200).send(result);
});

// Get a class's grade data
router.get("/class/:id", async (req, res) => {
  let collection = await db.collection("grades");
  let query = { class_id: Number(req.params.id) };

  // Check for learner_id parameter
  if (req.query.learner) query.learner_id = Number(req.query.learner);

  let result = await collection.find(query).toArray();

  if (!result) res.status(404).send("Not found");
  else res.status(200).send(result);
});

// Update a class id
router.patch("/class/:id", async (req, res) => {
  let collection = await db.collection("grades");
  let query = { class_id: Number(req.params.id) };

  let result = await collection.updateMany(query, {
    $set: { class_id: req.body.class_id }
  });

  if (!result) res.status(404).send("Not found");
  else res.status(200).send(result);
});

// Delete a class
router.delete("/class/:id", async (req, res) => {
  let collection = await db.collection("grades");
  let query = { class_id: Number(req.params.id) };

  let result = await collection.deleteMany(query);

  if (!result) res.status(404).send("Not found");
  else res.status(200).send(result);
});

// Index creation routes
router.post("/create-indexes", async (req, res) => {
  try {
    const collection = await db.collection("grades");

    await collection.createIndex({ class_id: 1 });
    await collection.createIndex({ learner_id: 1 });
    await collection.createIndex({ learner_id: 1, class_id: 1 });

    res.status(201).send("Indexes created successfully");
  } catch (error) {
    console.error("Error creating indexes:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Validation rules
router.post("/set-validation", async (req, res) => {
  try {
    await db.command({
      collMod: "grades",
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["class_id", "learner_id", "scores"],
          properties: {
            class_id: {
              bsonType: "int",
              description: "must be an integer and is required"
            },
            learner_id: {
              bsonType: "int",
              description: "must be an integer and is required"
            },
            scores: {
              bsonType: "array",
              items: {
                bsonType: "object",
                required: ["score", "type"],
                properties: {
                  score: {
                    bsonType: "double",
                    description: "must be a double and is required"
                  },
                  type: {
                    bsonType: "string",
                    description: "must be a string and is required"
                  }
                }
              },
              description: "must be an array and is required"
            }
          }
        }
      }
    });

    res.status(201).send("Validation rules set successfully");
  } catch (error) {
    console.error("Error setting validation rules:", error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
