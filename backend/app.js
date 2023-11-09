const express = require('express');
const FoodAPI = require('./api');
const cors = require('cors');
const app = express();
const userRouter = require('./routes/userRoutes');
const planRouter = require('./routes/planRoutes');
const mealRouter = require('./routes/mealRoutes');
const {origin} = require("./config");
const {JWTAuth} = require('./middleware/JWTAuth');

app.use(cors({
  origin: origin
}));

//app.use(express.static('public'));

app.use(express.json());

app.use(JWTAuth);

app.use("/api/users", userRouter);
app.use("/api/plan", planRouter);
app.use("/api/meals", mealRouter);


app.get('/', function(request, response){
  return response.send(
    `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>MealPlan API</title>
      </head>
      <body>
      <h1> Welcome to the MealPlan API</h2>
      <p>coming <s>soon</s> eventually:  API definitions</p>          
      </body>
      </html>
  `
  );
});


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



