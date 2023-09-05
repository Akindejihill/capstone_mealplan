"""Models for Knowledge Base"""
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import datetime, traceback

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql:///mealplan'
db = SQLAlchemy(app)

app.app_context().push()

def connect_db(app):
    db.app = app
    db.init_app(app)


############### Tables ####################
##                                     ##
class MPUser(db.Model):
    __tablename__ = 'mpuser'
    userid = db.Column(db.String(31), primary_key=True, nullable=False)
    email = db.Column(db.String(128), nullable=False, unique=True)
    first_name = db.Column(db.String(128))
    last_name = db.Column(db.String(128))
    password = db.Column(db.LargeBinary,
                    nullable = False)

class Plan(db.Model):
    __tablename__ = 'plan'
    id = db.Column(db.Integer, primary_key=True, nullable=False, autoincrement=True)
    owner = db.Column(db.String(31), db.ForeignKey('mpuser.userid'), nullable=False)
    label = db.Column(db.String(128), nullable=False)
    description = db.Column(db.Text)
    health_preferences = db.Column(db.Text)
    diet_preferences = db.Column(db.Text)


class Meal(db.Model):
    __tablename__ = 'meal'
    id = db.Column(db.Integer, primary_key=True, nullable=False, autoincrement=True)
    plan = db.Column(db.Integer, db.ForeignKey('plan.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    time = db.Column(db.Time, nullable=False)
    recipe_uri = db.Column(db.String(2048), nullable=False)
    preparation_url = db.Column(db.String(2048))
    title = db.Column(db.String(128))
    meal_type_label = db.Column(db.String(64))
    image_url = db.Column(db.String(2048))


class IngredientIncorporation(db.Model):
    __tablename__ = 'ingredient_incorporation'
    id = db.Column(db.Integer, primary_key=True, nullable=False, autoincrement=True)
    meal = db.Column(db.Integer, db.ForeignKey('meal.id'), nullable=False)
    text = db.Column(db.Text)
    quantity = db.Column(db.Float)
    measure = db.Column(db.String(31))
    food = db.Column(db.Text)
    weight = db.Column(db.Float)
    foodid = db.Column(db.Text)
    
    





####### Constructing the database ########
##                                     ##
def make_db():
    db.drop_all()
    db.create_all()

def seed_db():

    #
    # Making a test user
    #
    testuser = MPUser(userid = "testuser", email = "user@email.com", first_name = 'test', last_name = 'user',  password = b"$2b$12$T69oTmoN/JloQoIBOy6hUuVoLD4mE1eEn.3BlT0b.NivmomtBLhG6") #bcrypt hash worklevel 12
    db.session.add(testuser)
    db.session.commit()

    #
    # Create a meal plan for sample user
    #
    sample_plan = Plan(owner = 'testuser', label = 'sample plan', 
                       description = 'this is a sample plan for testing the database', 
                       health_preferences = 'Mediterranean,keto-friendly',
                       diet_preferences = '')
    db.session.add(sample_plan)
    db.session.commit()


    #
    # Adding Meals to the sample meal plan
    #

    # Getting datetime one week from now
    now = datetime.datetime.now()
    one_week_from_now = now + datetime.timedelta(weeks=1)
    formated_date = one_week_from_now.strftime('%Y-%m-%d')
    dinner_time = datetime.time(18, 30, 0)



    test_meal1 = Meal(plan = sample_plan.id ,date = formated_date,
                     time = dinner_time,
                     recipe_uri = "http://www.edamam.com/ontologies/edamam.owl#recipe_ed04ad9d33c494f13f6406d53a6de34e",
                     preparation_url = "https://food52.com/recipes/17016-baked-chicken-parm",
                     title = "Chicken Parmesan", meal_type_label = "Dinner",
                     image_url = "https://tastesbetterfromscratch.com/wp-content/uploads/2023/03/Chicken-Parmesan-1-500x500.jpg")

    # Add 8 days to the current date/time
    eight_days_from_now = now + datetime.timedelta(days=8)
    formated_date = eight_days_from_now.strftime('%Y-%m-%d')

    test_meal2 = Meal(plan = sample_plan.id, date = formated_date,
                     time = dinner_time,
                     recipe_uri = "http://www.edamam.com/ontologies/edamam.owl#recipe_ecc8f2f1f2bb741b4a4113268b3cb36c",
                     preparation_url = "https://food52.com/recipes/6662-stuffed-peppers",
                     title = "Stuffed peppers", meal_type_label = "Dinner",
                     image_url = "https://images-gmi-pmc.edge-generalmills.com/3512d6fb-41d3-41e7-a66d-f234a5942b6a.jpg")

    db.session.add(test_meal1)
    db.session.add(test_meal2)
    db.session.commit()

    
    #
    # Add the ingredients for the meals
    #

    #First sample meal
    ingr1 = IngredientIncorporation(meal = test_meal1.id, text = "1 tablespoon oil",
            quantity = 1, measure = "tablespoon", food = "oil", weight = 14, foodid = "food_bk9p9aaavhvoq4bqsnprobpsiuxs"
            )
    ingr2 = IngredientIncorporation(meal = test_meal1.id, text = "1 1/2 cup panko",
            quantity = 1.5, measure = "cup", food = "panko", weight = 90, foodid = "food_a9tnk2lbj0xkckbytqnx1ajhpqbp"
            )
    ingr3 = IngredientIncorporation(meal = test_meal1.id, text = "1/2 cup grated parmesan cheese",
            quantity = 0.5, measure = "cup", food = "parmesan cheese", weight = 74.353125, foodid = "food_a104ppxa06d3emb272fkcab3cugd"
            )
    
        

    
    #Second sample meal
    ingr4 = IngredientIncorporation(meal = test_meal2.id, text = "1 tablespoon oil",
            quantity = 1, measure = "tablespoon", food = "oil", weight = 14, foodid = "food_bk9p9aaavhvoq4bqsnprobpsiuxs"
            )
    ingr5 = IngredientIncorporation(meal = test_meal2.id, text = "1 1/2 cup panko",
            quantity = 1.5, measure = "cup", food = "panko", weight = 90, foodid = "food_a9tnk2lbj0xkckbytqnx1ajhpqbp"
            )
    ingr6 = IngredientIncorporation(meal = test_meal2.id, text = "1/2 cup grated parmesan cheese",
            quantity = 0.5, measure = "cup", food = "parmesan cheese", weight = 74.353125, foodid = "food_a104ppxa06d3emb272fkcab3cugd"
            )



    db.session.add_all([ingr1, ingr2, ingr3, ingr4, ingr5, ingr6])
    db.session.commit()



