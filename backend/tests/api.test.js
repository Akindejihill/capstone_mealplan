const FoodApi = require('../api');

describe("Test file", function(){
    it("works", function(){
        expect(true).toBe(true);
    });
});


describe("Recipe searching with recipeSearch", function(){
    it("works", async function(){
        const recipes = await FoodApi.recipeSearch("apple");
        expect(recipes).toEqual(expect.any(Array));
       
    });
    
    it("sends back 20 recipes", async function(){
        const recipes = await FoodApi.recipeSearch("apple");
        //console.log("here's what we got", recipes);
        expect(recipes).toEqual(expect.any(Array));
        expect(recipes.length).toEqual(20);        
    });
});


describe("looking up a specific recipe with recipeLookup", function(){
    it("works", async function(){
        const recipe = await FoodApi.recipeLookup("http://www.edamam.com/ontologies/edamam.owl#recipe_ed04ad9d33c494f13f6406d53a6de34e");
        expect(recipe["label"]).toEqual("Baked Chicken Parm");
        // console.log(recipe);
    });
});


// see interactive results https://rapidapi.com/edamam/api/edamam-food-and-grocery-database
describe("Food Item lookup with lookupItem", function(){
    it("works", async function(){
        const item = await FoodApi.lookupItem("apple");
        expect(item.text).toEqual("apple");
    });
});

describe("Looking up a specific recipe with recipeLookup", function(){
    it("works", async function(){
        const recipe = await FoodApi.recipeLookup("http://www.edamam.com/ontologies/edamam.owl#recipe_ed04ad9d33c494f13f6406d53a6de34e");
        expect(recipe.label).toEqual("Baked Chicken Parm");
    });
});

describe("searching for a recipe with recipeSearch", function(){
    it("works", async function(){
        const recipe = await FoodApi.recipeSearch("chicken parm");
        expect(recipe.length).not.toEqual(0);
    });
});
