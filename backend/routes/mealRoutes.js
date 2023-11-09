const express = require("express");
const mealRouter = new express.Router();
const FoodAPI = require('../api');
const {MPDB} = require('../db');
const ExpressError = require("../ExpressError");
const {SECRET_KEY} = require("../config");
const jwt = require('jsonwebtoken');


/**Add a meal event to the meal plan
 * receives information in the form of:
 *  {
 *      planid : integer,
 *      date : date,
 *      time : time,
 *      recipe_uri : string,
 *      preparation_url : string,
 *      title : string,
 *      meal_type_label : string,
 *      image_url : string,
 *      ingredients : [
 *          {
 *              description : string,
 *              quantity : float,
 *              measure : string
 *              food : string.
 *              weight : float,
 *          }
 *      ]
 *  }
 * 
 *  If successfull returns
 * {
 *      status : "success",
 *      mealid : integer
 * }
 */
mealRouter.post('/', async function(request, response, next){
    if (!request.passport) {
        return next(new ExpressError("You do not have permission to access this resource", 401));
    } 
    const userid = request.passport.userid;
    const planid = request.body.planid;
    const date = request.body.date;
    const time = request.body.time;
    const recipe_uri = request.body.recipe_uri;
    const preparation_url = request.body.preparation_url;
    const title = request.body.title;
    const meal_type_label = request.body.meal_type_label;
    const image_url = request.body.image_url;
    const ingredients = request.body.ingredients;

    //Create new meal event
    const [meal, mealError] = await MPDB.addMealEvent(planid, userid, date, time, recipe_uri, preparation_url, title, meal_type_label, image_url);

    if (!meal) {
        console.debug("Error: ", mealError);
        return next(mealError);
    } 

    //add the ingredients for the meal event
    const [success, ingrError] = await MPDB.addIngredients(meal, ingredients);
    if (!success) {
        console.debug("Error: ", ingrError);
        return next(ingrError);
    } else {
        return response.status(200).json({status : "success", mealid : meal})
    }


});



/**
 * { 
 *  "id" : integer
 *  update : {
 *              "date" : date,
 *              "time" : time,
 *              "meal_type_label" : string
 *           }
 * }
 */
mealRouter.patch('/', async function(request, response, next){
    if (!request.passport) {
        return next(new ExpressError("You do not have permission to access this resource", 401));
    } else {

        const userid = request.passport.userid;
        const updateFields = request.body.update;
        const id = request.body.id;

        const [success, error] = await MPDB.editMealEvent(updateFields, id, userid);
        if (!success) { 
            return next(error);
        } else {
            const mealid = success;
            return response.send (
                {
                    "status" : "success",
                    "id" : mealid
                });
        }

    }
});



/**
 *  sends meal information when requested via get request
 *  ?mealid=[integer] 
 *  
 * 
 * Sends meal information in the form of:
 *  {
 *      planid : integer,
 *      date : date,
 *      time : time,
 *      recipe_uri : string,
 *      preparation_url : string,
 *      title : string,
 *      meal_type_label : string,
 *      image_url : string,
 *      ingredients : [
 *          {
 *              description : string,
 *              quantity : float,
 *              measure : string
 *              food : string.
 *              weight : float,
 *          }
 *      ]
 *  }
 */
mealRouter.get('/', async function(request, response, next){
    if (!request.passport) {
        return next(new ExpressError("You do not have permission to access this resource", 401));
    } 
    const mealid = request.query.mealid;
    const [meal, error] = await MPDB.getMeal(mealid);
    if (!meal) {
        console.log("Error: ", error);
        return next(error);
    } else {
        return response.status(200).json(meal);
    }

});


/**
 *  sends mealplan calendar information when requested via get request
 *  ?planid=[integer]&startDate=[date]&endDate=[date]
 * 
**/
mealRouter.get('/calendar', async function(request, response, next){
    if (!request.passport) {
        return next(new ExpressError("You do not have permission to access this resource", 401));
    } 
    const userid = request.passport.userid;
    const planid = request.query.planid;
    const startDate = request.query.startDate; 
    const endDate = request.query.endDate;

    //first get plan to verify that requester is the owner
    const [plan, error] = await MPDB.getPlan(planid, userid);

    if (!plan) {
        console.log("Error: ", error);
        return next(error);
    } else {
        const [calendar, error] = await MPDB.getCalendar(planid, startDate, endDate);
        if (!calendar) {
            console.log("Error: ", error);
            return next(error);
        } else {
            return response.status(200).json(calendar);
        }
        
    }
});


/**searching for recepies using a specific meal plan
 * query string must include search=[string] and planid=[int] 
*/
mealRouter.get('/search', async function(request, response, next){
    if (!request.passport) {
        return next(new ExpressError("You do not have permission to access this resource", 401));
    }

    const userid = request.passport.userid;
    const search = request.query.search;
    const planid = request.query.planid;

    const [plan, error] = await MPDB.getPlan(planid, userid);

    if (!plan) {
        console.log("Error: ", error);
        return next(error);
    } else {
        //if there is a string of dietary preferences, split it into an array
        const health = plan.health_preferences ? plan.health_preferences.split(",") : false;
        const diet = plan.diet_preferences ? plan.diet_preferences.split(","): false;

        const recipes = await FoodAPI.recipeSearch(search, diet, health);
        return response.status(200).json(recipes);

    }     

});



/**Look up the information for a specific recipe from the API
* and send it back in a response.
* query requires uri=[string] ex ?uri=http://www.edamam.com/ontologies/edamam.owl#recipe_9b5945e03f05acbf9d69625138385408
*/
mealRouter.get('/lookup', async function(request, response, next){
    if (!request.passport) {
        return next(new ExpressError("You do not have permission to access this resource", 401));
    }
    const uri = request.query.uri;
    //console.log("The URI I'm sending is: ", uri); //for development
    const recipes = await FoodAPI.recipeLookup(uri);
    //console.log("The data I got back is:", recipes); //for development
    return response.status(200).json(recipes);

});



mealRouter.delete('/:mealid', async function(request, response, next){
    if (!request.passport) {
        return next(new ExpressError("You do not have permission to access this resource", 401));
    } 

    const userid = request.passport.userid;
    const mealid = request.params.mealid;
    const [success, error] = await MPDB.deleteMeal(mealid, userid);
    if (!success) {
        console.log("Error: ", error);
        return next(error);
    } else {
        return response.status(200).json({status : "success"});
    }

});



module.exports = mealRouter;
