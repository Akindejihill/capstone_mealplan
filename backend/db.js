const { Client } = require("pg");
const { DB_URI, BCRYPT_WORK_FACTOR } = require("./config");
const bcrypt = require("bcrypt");
const ExpressError = require("./ExpressError");
const { patchPrep } = require('./helper');

let db = new Client({
    connectionString: DB_URI,
});

db.connect();

/** This class contains methods that make requests to the MealPlan Database */
class MPDB {

    static async auth(userid, password) {
        try {
            const results = await db.query(
                `SELECT userid, first_name, last_name, password FROM mpuser WHERE userid=$1`,
                [userid]
            );
            
            if(results.rows.length === 0){
                return [false, new ExpressError("User authentication failed", 401)]
            }
            const user = results.rows[0];
            const binaryPass = user.password;
            const first_name = user.first_name;
            const last_name = user.last_name;
            console.log("password from db: ", binaryPass);

            //validating password
            // Convert the binary password to a Buffer
            const buffer = Buffer.from(binaryPass, "binary");
            // Convert the Buffer to a string using the 'utf8' encoding
            const passHash = buffer.toString("utf8");

            const valid = await bcrypt.compare(password, passHash);

            if (valid) {
                console.log("YAY, Password is valid");
                return [{userid, first_name, last_name}, null];
            } else {
                console.log("Boooo, password is sus");
                return [false, new ExpressError("User authentication failed", 401)];
            }

        } catch (error) {
            console.debug(
                `\n\nCRITICAL: An error occured on the way to the database:\n ${error}`
            );
            return [false, error];
        }
    }

    /** Register a new user
     *
     * @param {*} username
     * @param {*} password
     * @param {*} email
     * @param {*} first_name
     * @param {*} last_name
     * @returns true is successful, other wise false with an error message [false, error]
     */
    static async register(username, password, email, first_name, last_name) {
        try {
            const passHash = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
            const binaryPass = Buffer.from(passHash, "utf8");

            const result = await db.query(
                `
                INSERT INTO mpuser (userid, email, first_name, last_name, password)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING userid`,
                [username, email, first_name, last_name, binaryPass]
            );

            console.log(`Account created for ${result.rows[0].userid}`);
            return [true, null];
        } catch (error) {
            if (error.code === "23505") {
                return [
                    false,
                    new ExpressError("Username or email already in use.", 400),
                ];
            }
            return [false, error];
        }
    }




    static async getUser(userid){
        try{
            const result = await db.query(
                `SELECT email, first_name, last_name FROM mpuser WHERE userid=$1`,
                [userid]
            );

            if (result.rows.length === 0) {
                return [false, new ExpressError("User was not found", 404)];
            } else {
                const user = result.rows[0];
                return [{
                            userid : userid, 
                            email : user.email, 
                            first_name : user.first_name,
                            last_name : user.last_name
                        }, null];
            }
        } catch (error) {
            return [false, error];
        }
    }



    static async editUser(updateFields, userid){

            //if the password is being updated, hash it and covert it to binary
            if (updateFields.password){
                const passHash = await bcrypt.hash(updateFields.password, BCRYPT_WORK_FACTOR);
                const binaryPass = Buffer.from(passHash, "utf8");
                updateFields.password = binaryPass;
            }

            //prepare the SET string and the list of values
            const [sqlSetString, values] = patchPrep(updateFields, [userid]);

            try{
                const result = await db.query(
                    `
                    UPDATE mpuser
                    SET ${sqlSetString}
                    where userid = $1
                    RETURNING userid, first_name, last_name`,
                    values
                );

                if(result.rows.length === 0){
                    return [false, new ExpressError("Could not update user for some reason", 500)]
                } else {
                    const passport =    {
                                            userid : result.rows[0].userid,
                                            first_name : result.rows[0].first_name,
                                            last_name : result.rows[0].last_name,
                                        }

                    return [passport, null];
                }


            } catch (error){
                return [false, error];
            }
    }


    /** Add a mealplan to the database
     * Recieves data in the form of
     *    {
     *        label : string (name of the meal plan)
     *        description : string (description of meal plan)
     *        health : array[]  (a list of health preference labels)
     *        diet : array[]  (a list of diet preference labels)  
     *        userid : string (id of the user the plan belongs to)
     *    }
     * 
     *  returns the plan id of the new plan and null if successfull [id, null]
     *  returns false and an error if unsuccessfull [false, error]
     */
    static async createPlan(label, description, health, diet, userid) {
        //combine elements into one comma separated string
        const joinedHealth = health.join(",");
        const joinedDiet = diet.join(",");

        try{
            const result = await db.query(
                `
                INSERT INTO plan (owner, label, description, health_preferences, diet_preferences)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id`,
                [userid, label, description, joinedHealth, joinedDiet]
            );

            if (result.rows.length === 0) {
                return [false, new ExpressError("Record was not created for some reason", 500)];
            } else {
                return [result.rows[0].id, null];
            }
        } catch (error) {
            return [false, error];

        }
    }




    /**Update 
     * 
     * @param {*} fields - object with key:value pairs representing fields to be changed
     * @param {*} id - id of the mealplan to be changed
     * @param {*} userid - id of the owner of the mealplan
     * @returns id of the meal plan and null if successful, false and error if unsuccessful
     * ex. [false, error]
     */
    static async editPlan(fields, id, userid) {
        //combine arrays into one comma separated string
        let updateFields = fields;
        if (updateFields.health_preferences){
            const joinedHealth = updateFields.health_preferences.join(",");
            updateFields.health_preferences = joinedHealth;
        }
        if (updateFields.diet_preferences){
            const joinedDiet = updateFields.diet_preferences.join(",");
            updateFields.diet_preferences = joinedDiet;
        }     

        try{
            const [sqlSetString, values] = patchPrep(updateFields, [id, userid])
            const result = await db.query(
                `
                UPDATE plan
                SET ${sqlSetString}
                WHERE id = $1 and owner = $2
                RETURNING id`,
                values
            );

            if (result.rows.length === 0) {
                return [false, new ExpressError("Access to that record is denied", 401)];
            } else {
                return [result.rows[0].id, null];
            }
        } catch (error) {
            return [false, error];

        }
    }


    /**
     * Retrieve mealplan details from the database
     * @param {*} planid 
     * @param {*} userid 
     * @returns 
     */
    static async getPlan(planid, userid){
        try{
            const result = await db.query(
                `
                SELECT label, description, health_preferences, diet_preferences
                FROM plan WHERE id = $1 and owner = $2`,
                [planid, userid]
            );

            if (result.rows.length === 0) {
                return [false, new ExpressError("No such meal plan was found for this user", 404)];
            } else {
                return [result.rows[0], null];
            }

        } catch (error){
            return [false, error]
        }
    }


    /**
     * Deletes a meal plan
     * Handles constraints by first removing all associated 
     * records from meals and ingredient_incorporations
     * @param {*} planid 
     * @param {*} userid 
     * @returns 
     */
    static async deleteMealPlan(planid, userid){

        //first verify mealplan ownership
        try{
            const verified = await db.query(
                `
                SELECT *
                FROM plan 
                WHERE id = $1 and owner = $2`,
                [planid, userid]
            );
            if (verified.rows.length === 0) {
                return [false, new ExpressError("Sorry, you don't have access that record, or it doesn't exit", 401)];
            }
        } catch (error) {
            return [false, error];
        }


        //delete the ingredients, then meals, then plan
        try{
            //first get a list of all the meals in the plan
            const mealList = await db.query(
                `
                SELECT id
                FROM meal
                WHERE plan = $1`,
                [planid]
            );
            if (mealList.rows.length === 0) {
                console.log("No meals found in mealplan");
                //Delete the meal plan right away and return
                const success = await db.query(
                    `
                    DELETE FROM plan
                    WHERE id = $1`,
                    [planid]
                );

                if (success) {
                    console.log(success);
                } else {
                    console.log("No feedback from server, ignoring");
                }

                return [true, null];
            } 

            //collect all the symbols we need for the SQL string
            let i = 0;
            const symbolList = mealList.rows.map(row => {
                i++;
                return `$${i}`});
            const symbolString = symbolList.join();

            //collect all the mealIDs we need for the prepared statement list
            const mealIdList = mealList.rows.map(row => row.id);
            console.log("symbols: ", symbolString);
            console.log("Meal IDs: ", mealIdList);
       
            //now remove all the ingredients at once
            const nuke = await db.query(
                `
                DELETE FROM ingredient_incorporation
                WHERE meal IN (${symbolString})`,
                mealIdList
            );
            if (nuke) {
                console.log(nuke);
            } else {
                console.log("No feedback from server, ignoring");
            }

            //delete the meals
            const result = await db.query(
                `
                DELETE FROM meal
                WHERE plan = $1`,
                [planid]
            );

            if (result) {
                console.log(result);
            } else {
                console.log("No feedback from server, ignoring");
            }
            
            //finally delete the meal plan
            const success = await db.query(
                `
                DELETE FROM plan
                WHERE id = $1`,
                [planid]
            );

            if (success) {
                console.log(success);
            } else {
                console.log("No feedback from server, ignoring");
            }

            return [true, null];


        } catch (error) {
            return [false, error];
        }
    }




    static async getPlanList(userid){
        try{
            const result = await db.query(
                `
                SELECT *
                FROM plan WHERE owner = $1`,
                [userid]
            );

            if (result.rows.length === 0) {
                return [false, new ExpressError("This user doesn't have any meal plans", 404)];
            } else {
                return [result.rows, null];
            }

        } catch (error){
            return [false, error]
        }
    }



    /**
     * Add meal event to the database
     * @param {*} planid 
     * @param {*} userid 
     * @param {*} time 
     * @param {*} recipe_uri 
     * @param {*} preparation_url 
     * @param {*} title 
     * @param {*} meal_type_label 
     * @param {*} image_url 
     * @returns 
     */
    static async addMealEvent(planid, userid, date, time, recipe_uri, preparation_url, title, meal_type_label, image_url){

        /**TODO, May want to build in functionality to download the image and store them on 
        the back end because the image_url recieved from the API is temporary.  It's not 
        nessesary as the the back end looks up the recipe and sends the front end a 
        fresh URL with recipe requests.  However in the future I may want to store info and
        send it directly to reduce the hits on the API to reduce costs.
        */

        //first make sure that the planid belongs to the requesting user
        const verified = await db.query(
            `
            SELECT id
            FROM plan WHERE id = $1 and owner = $2`,
            [planid, userid]
        );

        if (verified.rows.length === 0) {
            return [false, new ExpressError("User does not have permission to the requested meal plan", 401)];
        } 

        //next add the meal event
        const meal = await db.query(
            `
            INSERT INTO meal (plan, date, time, recipe_uri, preparation_url, title, meal_type_label, image_url)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id`,
            [planid, date, time, recipe_uri, preparation_url, title, meal_type_label, image_url]
        );

        if (meal.rows.length === 0){
            return [false, new ExpressError("Database did not add meal for some reason", 500)]
        } else {
            return [meal.rows[0].id, null];
        }

    }



    /**
     * 
     * @param {*} mealid - database id for the meal event that this ingredient and quantity are incorporated into
     * @param {*} ingredients - a list of ingredient objects each containing ingredient details.
     * @returns 
     */
    static async addIngredients(mealid, ingredients){
        try{
            for(let i = 0; i < ingredients.length; i++)
            {
                const ingredient = ingredients[i];
                const ingr = await db.query(
                    `
                    INSERT INTO ingredient_incorporation (meal, text, quantity, measure, food, weight, foodid)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    RETURNING id`,
                    [mealid, ingredient.text, ingredient.quantity, ingredient.measure, ingredient.food, ingredient.weight, ingredient.foodId]
                );
                if (ingr.rows.length === 0){
                    console.log("Database did not add ingredient for some reason")
                    return [false, new ExpressError("Database did not add ingredient for some reason", 500)]
                } else {
                    console.log("Ingredient added to database")
                }
            };
            return [true, null];

        } catch (error){
            return [false, error];
        }
    }




    static async editMealEvent(updateFields, id, userid){
        //verify ownership of the meal before editing
        try{
            const verified = await db.query(
                `
                SELECT meal.id, plan.owner
                FROM meal 
                JOIN plan on meal.plan = plan.id
                WHERE meal.id = $1 and plan.owner = $2`,
                [id, userid]
            );
            if (verified.rows.length === 0) {
                return [false, new ExpressError("Sorry, you don't have access that record, or it doesn't exit", 401)];
            }
        } catch (error) {
            return [false, error];
        }

        //process changes
        try{
            const [sqlSetString, values] = patchPrep(updateFields, [id])
            const result = await db.query(
                `
                UPDATE meal
                SET ${sqlSetString}
                WHERE id = $1
                RETURNING id`,
                values
            );

            if (result.rows.length === 0) {
                return [false, new ExpressError("Sorry, couldn't edit that record for some reason", 500)];
            } else {
                return [result.rows[0].id, null];
            }
        } catch (error) {
            return [false, error];

        }

    }





    /**
     * Returns a single meal's data
     * @param {*} mealid 
     * @returns 
     */
    static async getMeal(mealid){
        try{
            const results = await db.query(
                `
                SELECT text, quantity, measure, food, weight, foodid
                FROM ingredient_incorporation
                WHERE meal = $1`,
                [mealid]
            );

            if (results.rows.length === 0){
                return [false, new ExpressError("Ingredients not found", 404)]
            }

            //for each result.row make an ingredient object from its fields
            //and add them to the list ingrList
            const ingrList = results.rows.map(ingredient => {
                return {
                    text : ingredient.text,
                    quantity : ingredient.quantity,
                    measure : ingredient.measure,
                    food : ingredient.food,
                    weight : ingredient.weight, 
                    foodId : ingredient.foodid 
                }
            });


            const mealResults = await db.query(
                `
                SELECT * FROM meal
                WHERE id = $1`,
                [mealid]
            );

            if (mealResults.rows.length === 0){
                return [false, new ExpressError("meal event not found", 404)]
            } else {
                //put the meal fields into an object with ingredients added
                const record = mealResults.rows[0];                
                const meal = {
                    planid : record.plan,
                    date : record.date,
                    time : record.time,
                    recipe_uri : record.recipe_uri,
                    preparation_url : record.preparation_url,
                    title : record.title,
                    meal_type_label : record.meal_type_label,
                    image_url : record.image_url,
                    ingredients : ingrList
                }

                return [meal, null];
            }
            
        } catch (error){
            return [false, error];
        }
    }




    static async deleteMeal(mealid, userid){

        //first verify meal ownership
        try{
            const verified = await db.query(
                `
                SELECT meal.id, plan.owner
                FROM meal 
                JOIN plan on meal.plan = plan.id
                WHERE meal.id = $1 and plan.owner = $2`,
                [mealid, userid]
            );
            if (verified.rows.length === 0) {
                return [false, new ExpressError("Sorry, you don't have access that record, or it doesn't exit", 401)];
            }
        } catch (error) {
            return [false, error];
        }


        //delete the ingredients
        try{
            const result = await db.query(
                `
                DELETE FROM ingredient_incorporation
                WHERE meal = $1`,
                [mealid]
            );
            if (result) {
                console.log(result);
            } else {
                console.log("No feedback from server, ignoring");
            }
        } catch (error) {
            return [false, error];
        }


        //delete the meal
        try{
            const success = await db.query(
                `
                DELETE FROM meal
                WHERE id = $1`,
                [mealid]
            );

            if (success) {
                console.log(success);
            } else {
                console.log("No feedback from server, ignoring");
            }
            return [true, null];
        } catch (error) {
            return [false, error];
        }
    }





    /**
     * Creates a logical calendar of meals organized into days for a
     * specified date range.  Any empty days (no meals) inbetween the starDate
     * and endDate are filled in with blank day objects, so that we can have an
     * unbroken list of days, for the purpose of making it easier to construct a
     * visual calendar on the front end.  Also gathers all of the ingredients 
     * needed for a shopping list
     * @param {*} planid  -  ID of the mean plan the calendar is for
     * @param {*} startDate  
     * @param {*} endDate 
     * @returns 
     */
    static async getCalendar(planid, startDate, endDate){

        //Make sure date 2 is after date 1, if not fix it
        //  we need Date objects in order to compare dates
        const dateA =  new Date(startDate);
        const dateB =  new Date(endDate);

        let date1, date2;
        if (dateA <= dateB){ //if dateA comes first or is the same as dateB
            date1 = startDate;
            date2 = endDate;
        } else {  //if dateB comes first
            date2 =  startDate;
            date1 = endDate;
        }


        try{
            const results = await db.query(
                `
                SELECT * FROM meal
                WHERE date >= $1 AND date <= $2 AND plan = $3
                ORDER BY date, time
                `,
                [date1, date2, planid]
            );

            const meals = results.rows;
            if (meals.length === 0){
                return [false, new ExpressError("No meal events found for that date range", 404)]
            } else {
                //create a calendar object and a shoppingList object
                let calendar = {startDate : date1, endDate : date2, days : []};
                let mealList = []; //gather meal ids here for the shopping list

                //start by creating a "day" object and a dateCursor the first date provided (date1)

                let dateCursor = date1;
                let date = new Date(dateCursor); //get a date object from dateCursor so we can use date methods
                let day = {date : dateCursor, DOW : date.getDay(), meals : []};

                //for each record, compare the date (record.date) to the temp variable dateCursor
                console.log("Meals: ", meals);
                meals.forEach( (record) => {
                    const mealDate = new Date(record.date).toISOString().slice(0, 10); //date of the next meal, as a ISO Formated string
                    if(dateCursor === mealDate){
                        //if date matches add the meal to the array in the 'meals' property of the 'day' object
                        const meal = {id : record.id, meal_type : record.meal_type_label, title : record.title, image_url : record.image_url};
                        mealList.push(record.id);
                        day.meals.push(meal);
                    } else {  //-if the date doesn't match (because there are no more meals on that date)
                        //save the day object (for the previous day) to the days calendar array
                        calendar.days.push(day);

                        //move dateCursor to the next day.  
                        let oldDate = date;
                        oldDate.setDate(oldDate.getDate()+1); //date of the next day
                        dateCursor = oldDate.toISOString().slice(0, 10);//update date cursor to the next day
                        date = new Date(mealDate); //date of the next meal, as a date object

                        //If dateCursor still doesn't equal the next meal date then 
                        //fill in date gaps on the calendar with blank meal days
                        //until the date cursor equals the next meal date
                        if(oldDate !== date){
                        //  starting with the next calendar date, compare it with the new date
                        //  as long as the next calendar date is less than the newDate then we need 
                        //  to add a blank day
                            while(oldDate < date){
                                dateCursor = oldDate.toISOString().slice(0,10); //update dateCursor to the next calendar date
                                day = {date : dateCursor, DOW : oldDate.getDay(), meals : []};  //*problem here.  if the next day has meals, we don't need a blank day.
                                calendar.days.push(day);
                                
                                //set oldDate to the next day before continuing the loop
                                oldDate.setDate(oldDate.getDate()+1)
                            }

                            //start a new day to add meals to
                            dateCursor = mealDate;
                            day = {date : dateCursor, DOW : date.getDay(), meals : []};
                            //save the first meal of the new day
                            const meal = {id : record.id, meal_type : record.meal_type_label, title : record.title, image_url : record.image_url};
                            day.meals.push(meal);
                            mealList.push(record.id);
                        }
                    }

                }); 

                //save the day object after we have saved the last meal
                calendar.days.push(day);

                //get shopping list and append it to the calendar
                const [list, error] = await MPDB.getShoppingList(mealList);
                if (list === false){
                    console.log(error);
                    calendar.list = ["error retrieving shopping list"];
                } else {
                    calendar.list = list;
                }
                return [calendar, null]
            }

        } catch (error){
            return [false, error];
        }
    }


    /**Returns an object with grocery items, quantity, and measure
     * {itemname : {quantity : float, measure : string}, ...}
     * 
     * @param {*} mealList 
     * @returns [false, error] if error, [list, null] if successful
     */
    static async getShoppingList(mealList){
        const listStr = mealList.join();
        try{

            //compose shopping list
            const ingredients = await db.query(
                `
                SELECT * FROM ingredient_incorporation
                WHERE meal in (${listStr})
                `
            );

            
            const groceryList = {}; 

            //if the ingredient is not in the list add it, 
            //if it is in the list only add to the quantity
            ingredients.rows.forEach( record => {
                if (groceryList[record.food] === undefined){
                    groceryList[record.food] = {quantity : record.quantity, measure : record.measure};
                } else {
                    groceryList[record.food].quantity += record.quantity;
                }
            });

            console.log("Grocery List: ", groceryList);
            return [groceryList, null];

        } catch (error){
            return [false, error];
        }
    }


}

module.exports = { db, MPDB };
