const CustomAPIError = require("./custom_error");
const BadRequestError = require("./bad_request");
const UnauthenticatedError = require("./unauthenticated");

// Custom error handling needs to be improved here honestly.
// That's high on my todo list, but I'm fine with anyone else who's interested taking that on if they want

module.exports = {
    CustomAPIError,
    BadRequestError,
    UnauthenticatedError,
}