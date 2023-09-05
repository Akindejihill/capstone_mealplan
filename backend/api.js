///This is the API class used by the MealPlan BACKEND
//use this to connect to the Edemom food database API

const axios = require('axios');
//const db = require('./db');
//const bcrypt = require("bcrypt");

require('dotenv').config();

const key = process.env.FOOD_API_KEY;
const app_id = process.env.FOOD_API_APP_ID;

/** API Class.
 *This class contains all the API calls in one place
 *Better for organization and debugging
 */
class FoodApi {

  /**
   * This function is a modified version of the Rythm school's, thanks!
   * Call request to make the API call.
   * @param {*} api - choose an api, expects either 'food' or 'recipe'
   * @param {*} data - an object containing the data to be sent to the api in requests
   * @param {*} method - the request method like GET, POST or PATCH. default GET
   * @param {*} endpoint - the endpoint used for the API request, optional
   * @returns the part of the response data contained in the 'data' property
   */
  static async request(api, data = {}, method = "get", endpoint = "") {
    console.debug("API Call: ", api, data, method, endpoint);

    const URLs = {
        food : "https://edamam-food-and-grocery-database.p.rapidapi.com",
        // recipeSearch : "https://edamam-recipe-search.p.rapidapi.com",
        recipeSearch : "https://api.edamam.com",
        recipeLookup : "https://api.edamam.com"
    }

    const headerSelection = {
        food : {
            "X-RapidAPI-Key" : key,
            "X-RapidAPI-Host" : "edamam-food-and-grocery-database.p.rapidapi.com"
          },
        
        recipeSearch : {},
        recipeLookup : {}
    }

    const url = URLs[api];
    const urlEndpoint = url + "/" + endpoint;
    console.log("URL is: ", urlEndpoint);
    const headers = headerSelection[api];
    const params = (method === "get")
        ? data
        : {};

    try {
      return (await axios({ url : urlEndpoint, method, data, params, headers })).data;
    } catch (err) {
      console.error("API Error: ", err.response);
      let message = err.response.statusText;
      return {error : message}
    }
  }



  /**
 * Search for a recipe
 * @param {*} search 
 * @param {*} diet - an array of diet labels
 * @param {*} health - an array of health labels
 * @returns 
 */
  static async recipeSearch(search, diet=false, health=false){

    const data = new URLSearchParams();
    data.append('q', search);
    data.append('type', 'public');
    data.append('random', 'False');
    data.append('app_id', app_id);
    data.append('app_key', key);


    if (diet)
    {
      diet.forEach(tag => {
        data.append('diet', tag);
      })
    }

    if (health)
    {
      health.forEach(tag => {
        data.append('health', tag);
      })
    }
    
    const resp = await FoodApi.request('recipeSearch', data, 'get', "api/recipes/v2");
    console.log("response: ", resp);

    if (resp.error){
      return resp.error
    } else {
      //make the data a bit more managable
      const recipes = resp.hits.map( hit => hit.recipe );
      return recipes;
    }
  }



  static async recipeLookup(uri){

    const data = {
      "uri" : uri,
      "type" : "public",
      "app_id" : app_id,
      "app_key" : key
    }

    const resp = await FoodApi.request('recipeLookup', data, 'get', "api/recipes/v2/by-uri");
    console.log("response: ", resp);

    if (resp.error){
      return resp.error
    } else {
      //make the data a bit more managable
      const recipes = resp.hits ? resp.hits[0] : "";
      return recipes;
    }
  }



  ///////////////// tests
  static async testItem(search){
    const data={ingr : search};

    const resp = await FoodApi.request("food", data, 'get', "api/food-database/v2/parser");
    console.log("response: ", resp);
    if (!resp.error){
        return resp.text;
    } else return resp.error;
  }


  
  static async testGetRecipe(id){
    const data={
      r : id,
    };

    //const endpoint = "api/recipes/v2/" + id;

    const resp = await FoodApi.request('recipe', data, 'get', "search");
    console.log("response: ", resp);
    if (!resp.error){
      return "Response recieved!  Check log!"

    } else return resp.error;

  }




}

module.exports = FoodApi;