// Import MongoClient from the mongodb package
import { MongoClient } from "mongodb";

// Load environment variables from the .env file
import dotenv from "dotenv";
dotenv.config();

// Initialize the MongoClient with the connection string from environment variables
const client = new MongoClient(process.env.ATLAS_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let conn;
let db;

// Function to connect to the MongoDB database
try {
  conn = await client.connect();
  console.log("Connected to MongoDB Atlas");
  db = conn.db("sample_training"); // Replace with your database name
} catch (e) {
  console.error("Failed to connect to MongoDB Atlas", e);
}

export default db;
