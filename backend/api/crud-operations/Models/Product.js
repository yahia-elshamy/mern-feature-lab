// require mongoose library to create the model
const mongoose = require("mongoose");

// create product schema
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: [true, "You must enter the name"],
        maxlength: [100, "The name should not exceed 100 character"]
    },
    price: {
        type: Number,
        required: [true, "You must enter the price"],
        min: [0, "Price shouldn't be negative"]
    },
    description: {
        type: String,
        trim: true,
        required: true,
        minlength: 10,
        maxlength: 255
    },
    category: {
        type: String,
        required: [true, "You must enter the category"]
    }
}, {timestamps: true});

// create the model
const Product = mongoose.model("Product", productSchema);

// export the schema
module.exports = Product;