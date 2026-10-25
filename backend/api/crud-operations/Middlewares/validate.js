// function takes a schema and then return middleware
const validate = (schema) => (req, res, next) => {
    const {value, error} = schema.validate(req.body, {
        abortEarly: false, // to gather all errors at once 
        stripUnknown: true // any unknown fields will be removed silently
    });

    if(error){
        const errors = error.details.map((detail) => ({
            field: detail.path.join("."),
            message: detail.message
        }));

        return res.status(400).json({
            message: "validation failed",
            errors
        });
    }

    req.body = value;
    next();
};

// export the middleware
module.exports = validate;