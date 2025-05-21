const asyncHandler = (requestHandler) => (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => {
        console.error(err);
        res.status(500).json({
            message: 'Internal Server Error',
            error: err.message,
        });
        next(err);  
    })
}

export default asyncHandler;