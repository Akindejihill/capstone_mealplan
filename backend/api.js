///This is the API class used by the MealPlan BACKEND
//use this to connect to the Edemom food database API

const axios = require('axios');
require('dotenv').config();

const recipeKey = process.env.RECIPE_API_KEY;
const recipeApp_id = process.env.RECIPE_API_APP_ID;
const foodKey = process.env.FOOD_API_KEY;
const foodApp_id = process.env.FOOD_API_APP_ID;

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
    // console.debug("API Call: ", api, data, method, endpoint);  //Debugging

    const URLs = {
        food : "https://api.edamam.com",
        recipeSearch : "https://api.edamam.com",
        recipeLookup : "https://api.edamam.com"
    }

    const headerSelection = {
        food : {},        
        recipeSearch : {},
        recipeLookup : {}
    }

    const url = URLs[api];
    const urlEndpoint = url + "/" + endpoint;
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
    data.append('app_id', recipeApp_id);
    data.append('app_key', recipeKey);


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
    // console.log("response: ", resp); //Debugging

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
      "app_id" : recipeApp_id,
      "app_key" : recipeKey
    }

    const resp = await FoodApi.request('recipeLookup', data, 'get', "api/recipes/v2/by-uri");
    //console.log("response: ", resp);  //see what the response looks like

    if (resp.error){
      return resp.error
    } else {
      //make the data a bit more managable
      const recipe = resp.hits ? resp.hits[0].recipe : "";
      //console.log("recipe: ", recipe);  //see what the result looks like
      return recipe;
    }
  }


  /**
   * Lookup a food item
   * @param {*} search 
   * @returns 
   */
  static async lookupItem(search){
    const data={
      "ingr" : search,
      "uri" : "api/food-database/v2/parser",
      "type" : "public",
      "app_id" : foodApp_id,
      "app_key" : foodKey
    };

    const resp = await FoodApi.request("food", data, 'get', "api/food-database/v2/parser");
    if (!resp.error){
        return resp;
    } else return resp.error;
  }



}

module.exports = FoodApi;
