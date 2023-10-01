const express = require('express');
const FoodAPI = require('./api');
const cors = require('cors');
const app = express();
const userRouter = require('./routes/userRoutes');
const planRouter = require('./routes/planRoutes');
const mealRouter = require('./routes/mealRoutes');
//const router = require('./routes'); //this has been refactored into the 3 above
const {origin} = require("./config");
const {JWTAuth} = require('./middleware/JWTAuth');

app.use(cors({
  origin: origin
}));

app.use(express.static('public'));

app.use(express.json());

app.use(JWTAuth);

app.use("/api/users", userRouter);
app.use("/api/plan", planRouter);
app.use("/api/meals", mealRouter);


// app.get('/', function(request, response){
//   return response.send('Hi.');
// });

//see interactive results https://rapidapi.com/edamam/api/edamam-food-and-grocery-database
// app.get('/test-item', async function(request, response){
//   const item = await FoodAPI.testItem("apple");
//   console.log(item);
//   return response.send(`The response text is: ${item}`);
// });
//
// //see interactive results at https://rapidapi.com/edamam/api/recipe-search-and-diet
// app.get('/test-search', async function(request, response){
//   const recipe = await FoodAPI.testRecipeSearch("Chicken parm");
//   console.log(recipe);
//   return response.send(`<h1>Results:</h1><ul> ${recipe} </ul>`);
// });
//
// app.get('/test-recipe', async function(request, response){
//   const recipe = await FoodAPI.testGetRecipe("http://www.edamam.com/ontologies/edamam.owl#recipe_ed04ad9d33c494f13f6406d53a6de34e");
//   console.log(recipe);
//   return response.send(`<h1>Results:</h1><ul> ${recipe} </ul>`);
// });



app.use(function (err, req, res, next){
  //set default status to code 500
  let status = err.status || 500;

  //print error to terminal
  console.debug(err);

  //set the status and alert the user
  return res.status(status).json({
    status : "failed",
    error : {
      message : err.message,
      status : status
    }
  });
});


app.listen(4000, function () {
  console.log('App on port 4000');
})



