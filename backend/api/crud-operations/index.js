// require the dotenv file
require("dotenv").config();

// require mongoose library
const mongoose = require("mongoose");

// require express library and asign it into a variable to re-use it
const express = require("express");
const app = express();

// use json middleware
app.use(express.json());

// initialize the variables from the dotenv file
const port = process.env.PORT || 5000;
const mongoURI = process.env.MONGO_URI;

// start connection function
async function dbConnection(){
    try {
        await mongoose.connect(mongoURI);
        console.log("DB connected successfully");
    } catch(error){
        console.log(`Database connection failed due to error: ${error}`);
        process.exit(1);
    }
};

// require all the routes and use them
const productRoutes = require("./Routes/productRoutes");
app.use("/api/products", productRoutes);

// error handler middleware
const errorHandler = require("./Middlewares/errorMiddleware");
app.use(errorHandler);

// run server
const startServer = async () => {
    try{
        await dbConnection();

        app.listen(port, () => {
            console.log(`Server is running and connected to DB on port: ${port}`);
        });
    } catch(error) {
        console.log("Failed to connect to database:", error.message);
        process.exit(1);
    }
};

startServer();