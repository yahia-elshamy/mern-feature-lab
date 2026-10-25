// require Joi library
const Joi = require("joi");

// we will use fork method to avoid repeat the code and make it reusable and readable
// create the product object to re use it
const productFields = {
    name: Joi.string().min(3).max(100).trim().messages({
        "string.empty" : "name mustn't be empty",
        "string.base" : "name must be a valid string characters",
        "string.min" : "name must be 3 characters at least",
        "string.max" : "name must be 100 characters at most"
    }),
    price: Joi.number().positive().messages({
        "number.base" : "price must be a valid numbers and not empty",
        "number.positive" : "price must be positive"
    }),
    description: Joi.string().min(10).max(255).trim().messages({
        "string.empty" : "description mustn't be empty",
        "string.base" : "description must be a valid string",
        "string.min" : "description must be 10 characters at least",
        "string.max" : "description must be 255 characters at most"
    }),
    category: Joi.string().trim().min(2).max(50).messages({
        "string.empty" : "category mustn't be empty",
        "string.base" : "category must be a valid string",
        "string.min" : "category must be 2 characters at least",
        "string.max" : "category must be 50 characters at most"
    })
};

// schema for creating a product
const createProductSchema = Joi.object(productFields)
.fork(["name", "price", "description", "category"], (field) =>
    // console.log(field._flags.id)
   field.required()
.messages({"any.required" : "{#label} is required"}) // label will be replaced with the field name
);

// schema for updating a product, because not all fields is required 
const updateProductSchema = Joi.object(productFields)
.min(1).messages({"object.min" : "you must update at least one field"}); // this means at least 1 key should send to update, to avoid getting empty api call

// // to test and see every response of the edge cases
// const {value, error} = createProductSchema.validate({
//     name: "iPhone 18",
//     price: 90000,
//     description: "lorem 1726567567 ipsum dolor set amit",
//     category: "smart phones"
// });
// if (error){
//     console.log(error.details);
// }else{
//     console.log(value)
// }

// export all the functions in the validator file
module.exports = {createProductSchema, updateProductSchema};