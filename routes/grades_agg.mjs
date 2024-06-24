// Import necessary packages and modules
import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";

const router = express.Router();

/**
 * GET route to retrieve statistics about grades
 * Calculates number of learners with a weighted average > 70%,
 * total number of learners, and percentage of learners with average > 70%.
 */
router.get("/stats", async (req, res) => {
  try {
    const collection = await db.collection("grades");

    // Aggregation pipeline to compute statistics
    const result = await collection.aggregate([
      {
        $unwind: { path: "$scores" } // Deconstruct the scores array field
      },
      {
        $group: {
          _id: "$learner_id", // Group by learner_id
          avg_score: { $avg: "$scores.score" } // Calculate average score per learner
        }
      },
      {
        $match: { avg_score: { $gt: 70 } } // Filter learners with average score > 70
      },
      {
        $group: {
          _id: null, // Group all the above results together
          count_above_70: { $sum: 1 }, // Count learners with average score > 70
          total_count: { $sum: 1 } // Count total number of learners
        }
      },
      {
        $project: {
          _id: 0,
          count_above_70: 1,
          total_count: 1,
          percentage_above_70: { $multiply: [{ $divide: ["$count_above_70", "$total_count"] }, 100] }
          // Calculate the percentage of learners with average score > 70
        }
      }
    ]).toArray();

    // Send response
    res.json(result);
  } catch (error) {
    console.error("Error retrieving statistics:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * GET route to retrieve statistics about grades for a specific class
 * Calculates number of learners with a weighted average > 70%,
 * total number of learners, and percentage of learners with average > 70% for a specific class_id.
 */
router.get("/stats/:id", async (req, res) => {
  try {
    const collection = await db.collection("grades");
    const classId = Number(req.params.id);

    // Aggregation pipeline to compute statistics for a specific class_id
    const result = await collection.aggregate([
      {
        $match: { class_id: classId } // Match documents with the specified class_id
      },
      {
        $unwind: { path: "$scores" } // Deconstruct the scores array field
      },
      {
        $group: {
          _id: "$learner_id", // Group by learner_id
          avg_score: { $avg: "$scores.score" } // Calculate average score per learner
        }
      },
      {
        $match: { avg_score: { $gt: 70 } } // Filter learners with average score > 70
      },
      {
        $group: {
          _id: null, // Group all the above results together
          count_above_70: { $sum: 1 }, // Count learners with average score > 70
          total_count: { $sum: 1 } // Count total number of learners
        }
      },
      {
        $project: {
          _id: 0,
          count_above_70: 1,
          total_count: 1,
          percentage_above_70: { $multiply: [{ $divide: ["$count_above_70", "$total_count"] }, 100] }
          // Calculate the percentage of learners with average score > 70
        }
      }
    ]).toArray();

    // Send response
    res.json(result);
  } catch (error) {
    console.error("Error retrieving statistics:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
