const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode >= 400 ? res.statusCode : 500;
    let message = err.message;

    // mongoose schema validation error
    if(err.name === "ValidationError"){
        statusCode = 400;
        message = Object.values(err.errors).map((e) => e.message).join(", ");
    }
    // invalid value for a schema type
    else if(err.name === "CastError"){
        statusCode = 400;
        message = `Invalid value for ${err.path}`;
    }

    // never leak internal details on server errors it might reveal you DB info
    if(statusCode === 500){
        console.error(err);
        message = "Internal server error"
    }

    res.status(statusCode).json({message});
};

module.exports = errorHandler