//This is the FRONT-END API class for communicating with the backend

import axios from "axios";

const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:3000/api";

/** API Class.
 *This class contains all the API calls in one place
 *Better for organization and debugging
 */
export class MPApi {
    // the token for interaction with the API will be stored here.
    static token = localStorage.getItem("token");

    /**
     * This function is curtosy of Rythm school.
     * Call request to make the API call.
     * @param {*} endpoint - the route, or part of the url after the domain.
     * @param {*} data - an object containing the data to be sent to the api in requests
     * @param {*} method - the request method like GET, POST or PATCH
     * @returns the part of the response data contained in the 'data' property
     */
    static async request(endpoint, data = {}, method = "get") {

        //Passing token through the header
        const url = `${BASE_URL}/${endpoint}`;
        const headers = { Authorization: `Bearer ${MPApi.token}` };
        const params = method === "get" ? data : {};

        try {
            return (await axios({ url, method, data, params, headers })).data;
        } catch (err) {
            console.error("API Error:", err.response);
            let message = err.response.data.error.message;
            throw Array.isArray(message) ? message : [message];
        }
    }

    /**authenticates username and password with the api
 * stores returned token in localStorage
 * @param {*} username 
 * @param {*} password 
 * @returns the failure status and user object in an array
 * [false, user] - authentication did not fail, returned a user
 * [true, null] - authentication failed, returned null instead of a user
 * [false, null] - an error prevented authentication, not bad credentials 
 * 
 * user is an object filled with user info in the form
 * "user": {
            "userid": string,
            "first_name": string,
            "last_name": string
        }
 */
    static async login(username, password) {
        const credentials = {
            username: username,
            password: password,
        };

        try {
            const authData = await this.request(
                "users/auth",
                credentials,
                "post"
            );

            if (authData.status === "login successfull") {
                MPApi.token = authData.token;
                const user = authData.user;
                localStorage.setItem("token", MPApi.token);
                return [false, user];
            } else {
                return [true, null];
            }
        } catch (error) {
            return [true, null];
        }
    }

    static async register(username, password, email, first_name, last_name) {
        const profile = {
            userid: username,
            password: password,
            email: email,
            first_name: first_name,
            last_name: last_name,
        };

        try {
            const regData = await this.request("users", profile, "post");

            if (regData.status === "success") {
                MPApi.token = regData.token;
                localStorage.setItem("token", MPApi.token);
                return [regData.profile, null];
            } else {
                return [
                    false,
                    new Error("Registration failed for some reason."),
                ];
            }
        } catch (error) {
            return [false, error];
        }
    }

    static async getProfile() {
        const profile = await this.request("users");
        return profile;
    }

    static async updateProfile(update, auth) {
        //change username to userid
        const data = {
            oldPassword: auth,
            update: update,
        };

        try {
            const patch = await this.request("users", data, "patch");

            if (patch.status === "success") {
                MPApi.token = patch.token;
                localStorage.setItem("token", MPApi.token);
                return [patch.patched, null];
            } else {
                return [
                    false,
                    new Error("Registration failed for some reason."),
                ];
            }
        } catch (error) {
            return [false, error];
        }
    }

    static async addMealPlan(data) {
        try {
            const response = await this.request("plan", data, "post");

            if (response.status === "success") {
                return [response.id, null];
            } else {
                return [
                    false,
                    new Error("Could not add meal plan for some reason"),
                ];
            }
        } catch (error) {
            return [false, error];
        }
    }

    static async getMealPlan(planID) {
        try {
            const data = { planid: planID };
            const response = await this.request("plan", data, "get");

            if (response.status === "success") {
                return [response.plan, null];
            } else {
                return [
                    false,
                    new Error(
                        "Could not retrieve that meal plan for some reason"
                    ),
                ];
            }
        } catch (error) {
            return [false, error];
        }
    }

    static async editMealPlan(update, id) {
        try {
            const data = { id: id, update: update };
            const response = await this.request("plan", data, "patch");

            if (response.status === "success") {
                return [response.id, null];
            } else {
                return [
                    false,
                    new Error("Could not update meal plan for some reason"),
                ];
            }
        } catch (error) {
            return [false, error];
        }
    }



    static async deleteMealPlan(id) {
        try {
            const response = await this.request(`plan/${id}`, {}, "delete");
            if (response.status === "success") {
                return [true, null];
            } else {
                return [
                    false,
                    new Error("Something went wrong, could not delete mealplan"),
                ];
            }
        } catch (error) {
            return [false, error];
        }
    }



    static async getPlanList() {
        try {
            const result = await this.request("plan/list");
            if (result.status === "success") {
                const plans = result.planList;
                return [plans, null];
            }
        } catch (error) {
            return [false, error];
        }
    }

    static async searchRecipes(searchStr, planID) {
        try {

            const data = {
                            "search" : searchStr,
                            "planid" : planID
                        }

            const result = await this.request("meals/search", data, "get" );

            return [result, null]

        } catch (error) {
            return [false, error];
        }
    }


    static async addMealEvent(date, time, selectedMeal, planID){

        // /**Why I'm using mock_ingredients...
        //  * I coded the backend application 
        //  * to expect data based on Edamam documentation 
        //  * and demo, however I'm using a version of their
        //  * API provided  by a host called RapidAPI and the 
        //  * data that actually comes back is different than what
        //  * is specified in the documentation or displayed in
        //  * in the demo.  I have tried to connect to the 
        //  * endpoint on the acrual edamam website but I'm 
        //  * having trouble with that. I will either get
        //  * everything resolved through edamam support or I
        //  * will recode the backend to use the less than
        //  * desireable data that I'm getting back from RapidAPI.
        //  * Until then I will have to use this mock ingredient
        //  * data. 
        //  */
        // const mock_ingredients = [
        //     {
        //         "description": "1 tablespoon oil",
        //         "quantity": 1,
        //         "measure": "tablespoon",
        //         "food": "oil",
        //         "weight": 14
        // },
        //     {
        //         "description": "1 1/2 cup panko",
        //         "quantity": 1.5,
        //         "measure": "cup",
        //         "food": "panko",
        //         "weight": 90
        // },
        //     {
        //         "description": "1/2 cup grated parmesan cheese",
        //         "quantity": 0.5,
        //         "measure": "cup",
        //         "food": "parmesan cheese",
        //         "weight": 74.353125
        //  },
        //      {
        //         "description": "1/4 teaspoon salt",
        //         "quantity": 0.25,
        //         "measure": "teaspoon",
        //         "food": "salt",
        //         "weight": 1.5
        //      },
        //      {
        //         "description": "1/4 teaspoon ground black pepper",
        //         "quantity": 0.25,
        //         "measure": "teaspoon",
        //         "food": "black pepper",
        //         "weight": 0.575
        //  },
        //      {
        //         "description": "1/8 teaspoon garlic powder",
        //         "quantity": 0.125,
        //         "measure": "teaspoon",
        //         "food": "garlic powder",
        //         "weight": 0.3875
        //  },
        //      {
        //         "description": "1 teaspoon dried italian seasoning",
        //         "quantity": 1,
        //         "measure": "teaspoon",
        //         "food": "italian seasoning",
        //         "weight": 1
        //  },
        //      {
        //         "description": "2 large eggs",
        //         "quantity": 2,
        //         "measure": "<unit>",
        //         "food": "eggs",
        //         "weight": 100
        //  },
        //      {
        //         "description": "2 large boneless, skinless chicken breast halves",
        //         "quantity": 2,
        //         "measure": "half",
        //         "food": "boneless, skinless chicken breast",
        //         "weight": 217.5
        //  },
        //      {
        //         "description": "1/2 cup grated sharp cheddar cheese or grated mozzarella cheese",
        //         "quantity": 0.5,
        //         "measure": "cup",
        //         "food": "cheddar cheese",
        //         "weight": 66
        //  },
        //      {
        //         "description": "2 cups purchased marinara sauce",
        //         "quantity": 2,
        //         "measure": "cup",
        //         "food": "marinara sauce",
        //         "weight": 528
        //  },
        //      {
        //         "description": "4 servings angel hair pasta, prepared according to package instructions",
        //         "quantity": 4,
        //         "measure": "serving",
        //         "food": "angel hair pasta",
        //         "weight": 1200
        //  }
        // ];

        const data ={
            "planid" : planID,
            "date" : date,
            "time" : time,
            "recipe_uri" : selectedMeal.uri,
            "preparation_url" : selectedMeal.url,
            "title" : selectedMeal.label,
            "meal_type_label" : selectedMeal.MealType,
            "image_url" : selectedMeal.image,
            "ingredients" : selectedMeal.ingredients,
        }


        try {
            const result = await this.request("meals", data, "post" );

            if (result.status === "success"){
                return [result.mealid, null]
            }

        } catch (error) {
            return [false, error];
        }
    }



    static async getCalendar(planID, startDate, endDate){
        const data = {
            "planid" : planID,
            "startDate" : startDate,
            "endDate" : endDate
        }

        try {
            const result = await this.request("meals/calendar", data, "get" );
            return [result, null];
        } catch (error) {
            return [false, error];
        }
    }


    static async getMealEvent(mealID){
        try {
            const result = await this.request("meals", {mealid : mealID}, "get" );
            return [result, null];
        } catch (error) {
            return [false, error];
        }
    }

    static async editMealEvent(date, time, label, mealID){
        const data = {
            "id" : mealID,
            "update" : {
                "date" : date,
                "time" : time,
                "meal_type_label" : label
            }
        }
        try {
            const result = await this.request("meals", data, "patch" );
            return [result, null];
        } catch (error) {
            return [false, error];
        }
    }



    static async deleteMealEvent(id) {
        try {
            const response = await this.request(`meals/${id}`, {}, "delete");
            if (response.status === "success") {
                return [true, null];
            } else {
                return [
                    false,
                    new Error("Something went wrong, could not delete meal"),
                ];
            }
        } catch (error) {
            return [false, error];
        }
    }



    static async getRecipe(uri){

        try {
            const result = await this.request("meals/lookup", {"uri" : uri}, "get" );
            return [result.recipe, null];
        } catch (error) {
            return [false, error];
        }

    }
}
