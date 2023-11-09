const express = require("express");
const userRouter = new express.Router();
const FoodAPI = require('../api');
const {MPDB} = require('../db');
const ExpressError = require("../ExpressError");
const {SECRET_KEY} = require("../config");
const jwt = require('jsonwebtoken');


/** Authentication route
 * users log in and get a token, and a passport
 * Requires login in the form of
  {
        "username" : string, 
        "password" : string, 
  }

  Returns auth information in the form of
    {
        "status": "login successfull",
        "token": string,
        "user": {
            "userid": string,
            "first_name": string,
            "last_name": string
        }
    }

    or 

    {
	"error": {
		"message": string,
		"status": integer
	}
}
*/    
userRouter.post('/auth', async function(request, response, next){
    console.log("AUTH ROUTE REACHED!");
    const authentication = request.body;
    const username = authentication.username;
    const password = authentication.password;
    const [passport, error] = await MPDB.auth(username, password);
  
  
    //if we don't get a token back return the error
    if(!passport){
      return next(error);
    } else {

        const token = jwt.sign(passport, SECRET_KEY);

        return response.send(
        {
          "status" : "login successfull" ,
          "token" : token, 
          "user" : passport
        });
    }
  
  });
  

  
    /**Registration route 
     * Create a new user,
        receives new user data  in the form 
        {"userid" : "user", "password" : "password", "email" : "email@email.com", "first_name" : "First", "last_name" : "Last"}
        returns  {"Created" : {"userid" : string, "email" : string, "first_name" : string, "last_name" : string}}
    */
    
userRouter.post('/', async function(request, response, next){
    try{
        const {userid, password, email, first_name, last_name} = request.body;

        if(!userid || !password){
            throw new ExpressError("Username and password required", 400);
        }
        if(!email){
            throw new ExpressError("email required", 400);
        }

        const [success, error] = await MPDB.register(userid, password, email, first_name, last_name);
        if (!success) {
            return next(error);
        } else {
            const token = jwt.sign({userid, first_name, last_name}, SECRET_KEY);
            return response.send({
                                    "status" : "success",
                                    "profile" : {"userid" : userid, "email" : email, "first_name" : first_name, "last_name" : last_name},
                                    "token" : token});
        }

    } catch (error) {
        return next(error);
    }

});



/**Get User Profile info route 
 * retrieves a user's profile
 * If user doesn't have a profile sends back an error
 * If user profile exists returns:
 *  {"userid" : string, "email" : string, "first_name" : string, "last_name" : string}
*/

userRouter.get('/', async function(request, response, next){
    if (!request.passport) {
        return next(new ExpressError("You do not have permission to access this resource", 401));
    } else {
        try{
            const userid = request.passport.userid;

            if(!userid){
                return next(new ExpressError("Username was not found", 404));
            }

            const [profile, error] = await MPDB.getUser(userid);
            if (!profile) {
                return next(error);
            } else {
                return response.status(200).json(profile);
            }

        } catch (error) {
            return next(error);
        }
    }

});





/**Profile edit route 
 * Edit a user profile,
    receives new user data  in the form 
    {
        "oldPassword" : string,
        "update" : {
            "password" : string,
            "email" : string,
            "first_name" : string,
            "last_name" : string
	}	
}
    returns {
                "patched" : {"userid" : string, first_name, string : string},
                "token" : object
            }
*/

userRouter.patch('/', async function(request, response, next){
    if (!request.passport) {
        return next(new ExpressError("You do not have permission to access this resource", 401));
    } else {

        const userid = request.passport.userid;
        const updateFields = request.body.update;
        const oldPassword = request.body.oldPassword;

        //require password change requests to authenticate
        if (updateFields.password){
            const [passport, authError] = await MPDB.auth(userid, oldPassword);

            //if we don't get a token back return the error
            if(!passport){
                return next(authError);
            }
        }       

        const [passport, error] = await MPDB.editUser(updateFields, userid);
        if (!passport) { 
            return next(error);
        } else {
            const token = jwt.sign(passport, SECRET_KEY);// passport contains {userid, first_name, last_name}
            return response.send({
                                    "status" : "success",
                                    "patched" : {"userid" : userid, "first_name" : passport.first_name, "last_name" : passport.last_name},
                                    "token" : token});
        }

    }

});


module.exports = userRouter;
