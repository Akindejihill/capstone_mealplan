const express = require("express");
const planRouter = new express.Router();
const FoodAPI = require('../api');
const {MPDB} = require('../db');
const ExpressError = require("../ExpressError");
const {SECRET_KEY} = require("../config");
const jwt = require('jsonwebtoken');


/** Create a new mealplan
 * Recieves data in the form of
 *    {
 *        label : string (name of the meal plan)
 *        description : string (description of meal plan)
 *        health : array[]  (a list of health preference labels)
 *        diet : array[]  (a list of diet preference labels)  
 *    }
 * Also requires an authentication header with Bearer token.
 */
planRouter.post('/', async function(request, response, next){
    const {label, description, health, diet} = request.body;

    if (!request.passport) {
        return next(new ExpressError("You do not have permission to access this resource", 401));
    } else {
        const userid = request.passport.userid;
        const [success, error] = await MPDB.createPlan(label, description, health, diet, userid);
        if (success) {
            const planid = success;
            return response.send (
                {
                    "status" : "success",
                    "id" : planid
                });
        } else {
            console.log("Error: ", error);
            return next(error);
        }
    
    }
});




/** Route to update a meal plan
 * Requires the meal plan id, and the data to bechanged in
 * the following form
 * {
	"id" : integer,
	"update" : {
		"label" : string,
		"description" : string,
		"health_preferences" : array[],
		"diet_preferences" : array[]
	}
}
 */
planRouter.patch('/', async function(request, response, next){
    if (!request.passport) {
        return next(new ExpressError("You do not have permission to access this resource", 401));
    } else {

        const userid = request.passport.userid;
        const updateFields = request.body.update;
        const id = request.body.id;

        const [success, error] = await MPDB.editPlan(updateFields, id, userid);
        if (!success) { 
            return next(error);
        } else {
            const planid = success;
            return response.send (
                {
                    "status" : "success",
                    "id" : planid
                });
        }

    }
});


/** Get the information for a Meal Plan
 *  Accepts get parameter
 *  planid=[integer]
 * Also requires authorization header Bearer token
 * 
 * Returns plan information in the form of
 * {
 *      status : success,
 *      plan : {
 *              label : string,
 *              description : string,
 *              health : array[].
 *              diet : array[]
 *              }
 * }
 */
planRouter.get('/', async function(request, response, next){
    if (!request.passport) {
        return next(new ExpressError("You do not have permission to access this resource", 401));
    }
    
    const userid = request.passport.userid;
    const planid = request.query.planid;

    const [plan, error] = await MPDB.getPlan(planid, userid);

    if (!plan) {
        console.log("Error: ", error);
        return next(error);
    } else {
        //if there is a string of dietary preferences, split it into an array
        const health = plan.health_preferences ? plan.health_preferences.split(",") : [];
        const diet = plan.diet_preferences ? plan.diet_preferences.split(","): [];

        const description = plan.description;
        const label = plan.label;

        response.status(200).json({status : "success", plan : {label, description, health, diet}});
    }    
});

/**
 * Route to access a list of meal plans for a user.
 * Only requires a userid which it gets from the passport
 * provided by the token in the header, so no data is required
 */
planRouter.get('/list', async function(request, response, next){
    if (!request.passport) {
        return next(new ExpressError("You must login in order to see your meal plans", 401));
    }

    const userid = request.passport.userid;

    const [list, error] = await MPDB.getPlanList(userid);
    if (error){
        return next(error);
    } else {
        return response.status(200).send (
            {
                "status" : "success",
                "planList" : list
            });
    }
});



planRouter.delete('/:planid', async function(request, response, next){
    if (!request.passport) {
        return next(new ExpressError("You do not have permission to access this resource", 401));
    } 

    const userid = request.passport.userid;
    const planid = request.params.planid;
    const [success, error] = await MPDB.deleteMealPlan(planid, userid);
    if (!success) {
        console.log("Error: ", error);
        return next(error);
    } else {
        return response.status(200).json({status : "success"});
    }

});



module.exports = planRouter;