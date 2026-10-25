// require express library and assign it to a variable with Router method
const express = require("express");
const router = express.Router();

// require the product controller file
const {createProduct, getAllProducts, getProductById, updateProduct, deleteProduct} = require("../Controllers/productController");

// create the route for the operations
router.post("/", createProduct);
router.patch("/:id", updateProduct);
router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.delete("/:id", deleteProduct);

// export the router variable that carry all the routes
module.exports = router;