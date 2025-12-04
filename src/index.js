// require("dotenv").config({path: "./config/.env"});
// import dotenv from "dotenv";

// import connectDB from "./db/db.js";



// console.log("MONGODB_URI ->", process.env.MONGODB_URI);

// dotenv.config({path: "./config/.env"});
// connectDB();


/*
import express from "express";
const app = express();

// if ee
// ()()
// ( () => {} )()

;(async () => {
  try{
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
    app.on("error", (error) => {
      console.log("Error: ", error);
      throw error
    })

    app.listen(process.env.PORT, () => {
      console.log(`App is running on port ${process.env.PORT}`);
    })

  }
  catch(error){
    console.error("Error: ", error);
    throw error
  }
} )()
*/

import dotenv from "dotenv";
import express from "express";
import connectDB from "./db/db.js";

const app = express();
dotenv.config();

app.use(express.json());



app.listen(process.env.PORT, async () => {
  console.log(`App is running on port ${process.env.PORT}`);
  connectDB();
});