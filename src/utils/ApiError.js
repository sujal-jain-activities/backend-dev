class ApiError extends Error {
    constructor(
        statusCode,
        message = 'Internal Server Error',
        errors = [],
        stack = ''
    ) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.errors = errors;
        this.stack = stack || new Error().stack;
        this.success = false;
    }
}
export default ApiError;