const {SECRET_KEY} = require("../config");
const jwt = require('jsonwebtoken');

function JWTAuth(request, response, next){
    try{
        const authorization = request.headers.authorization;
        // console.log("authorization header: ", authorization); //debugging
        token = authorization.split(" ")[1];
        const passport = jwt.verify(token, SECRET_KEY);
        request.passport = passport;
        return next();
    } catch (error){
        return next()
    }


}

module.exports = {JWTAuth};
