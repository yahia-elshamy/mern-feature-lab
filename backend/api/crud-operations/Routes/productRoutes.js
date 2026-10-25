// require express library and assign it to a variable with Router method
const express = require("express");
const router = express.Router();

// require joi validator middleware
const validate = require("../Middlewares/validate");
// require the schema for the validators middleware
const {createProductSchema, updateProductSchema} = require("../Validators/productValidator");

// require the product controller file
const {createProduct, getAllProducts, getProductById, updateProduct, deleteProduct} = require("../Controllers/productController");

// create the route for the operations
router.post("/", validate(createProductSchema), createProduct);
router.patch("/:id", validate(updateProductSchema), updateProduct);
router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.delete("/:id", deleteProduct);

// export the router variable that carry all the routes
module.exports = router;