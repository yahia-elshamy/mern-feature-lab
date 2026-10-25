// require the product model
const Product = require("../Models/Product");

const mongoose = require("mongoose");

// thanks to express version 5, it now has the express-async-errors library implemented built in the version so no need to write try/catch body or repeating the code and no need to pass the error on the next parameter on the async functions to the error handler middleware, and now its more readable ^^

// create product controller
const createProduct = async (req, res) => {
    const {name, price, description, category} = req.body;

    if(!name || price === undefined || price === null || !description || !category){
        res.status(400);
        throw new Error("All fields are required");
    };

    const newProduct = new Product({
        name,
        price,
        description,
        category
    });
    await newProduct.save();
    res.status(201).json({message: "Product created successfully", data: newProduct});
};

// get all products controller
const getAllProducts = async (req, res) => {
    const products = await Product.find();

    return res.status(200).json({
        message: "Products founded",
        count: products.length,
        data: products
    });
};

// get product by id controller
const getProductById = async (req, res) => {
    const {id} = req.params;

    if(!mongoose.Types.ObjectId.isValid(id)){
        res.status(400);
        throw new Error("Product ID is not valid");
    };

    const product = await Product.findById(id);

    if(!product){
        res.status(404);
        throw new Error("Product not found");
    }

    res.status(200).json({message: "product found", data: product});
};

// update product with id
const updateProduct = async (req, res) => {
    const {id} = req.params;

    if(!mongoose.Types.ObjectId.isValid(id)){
        res.status(400);
        throw new Error("Product ID is not valid");
    };

    const product = await Product.findByIdAndUpdate(
        id,
        req.body,
        {new: true, runValidators: true}
    );

    if(!product){
        res.status(404);
        throw new Error("Product not found");
    };

    res.status(200).json({message: "Product updated", data: product});
};

// delete product with id
const deleteProduct = async (req, res) => {
    const {id} = req.params;

    if(!mongoose.Types.ObjectId.isValid(id)){
        res.status(400);
        throw new Error("Product ID is not valid");
    };

    const product = await Product.findByIdAndDelete(id);

    if(!product){
        res.status(404);
        throw new Error("Product not found");
    };

    res.status(200).json({message: "Product deleted"});
};

// export all controllers 
module.exports = {createProduct, getAllProducts, getProductById, updateProduct, deleteProduct};