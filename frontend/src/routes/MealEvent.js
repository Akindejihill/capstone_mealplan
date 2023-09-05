import '../styles/MealEvent.css';
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { MPApi } from "../api";
import ShowRecipe from "../components/ShowRecipe";
import lock from "../images/lock.png";

export default function MealEvent(){
    const navigate = useNavigate();
    const params = useParams();

    const [mealEvent, setMealEvent] = useState({});
    const [formData, setFormData] = useState({
        date : "",
        time : "",
        meal_type_label: ""
    });
    const [mealID, setMealID] = useState("");

    const [warningVisible, setWarningVisible] = useState(false);
    const [showDeleteButton, setShowDeleteButton] = useState(false);

    async function handleDelete(evt){
        const [success, error] = await MPApi.deleteMealEvent(mealID);
        if (success){
            navigate(-1);
        }
        //TODO, rework the error display for use with multiple error sources
    }

    function handleChange(evt){
        const {name , value} = evt.target;
        setFormData(data => ({
            ...data, //include all object properties
            [name]: value //overide the target that was event triggered
        }));
    }

    async function handleSubmit(evt){
        evt.preventDefault();

        //validate
        if (formData.startDate === "" || formData.endDate === ""){
            setWarningVisible(true);
        } else {
            setWarningVisible(false);
            //update meal event here
            const [success, error] = await MPApi.editMealEvent(formData.date, formData.time, formData.meal_type_label, mealID);
            if (error){
                alert(error);
            }

        }
    }


    useEffect(() => {
        async function getMeal(mealID){
            MPApi.getMealEvent(mealID).then( ([meal, error]) => {
                    if(error){
                        //TODO: deal with error better
                        alert(error);
                    } else {
                        console.log("Parameter: ", mealID);
                        console.log("Meal data: ", meal);
                        setMealEvent(meal);
                        setFormData({
                            date: meal.date.slice(0,10) || "",
                            time: meal.time || "",
                            meal_type_label: meal.meal_type_label || ""
                        });
                    }
                }
            )
        }
        setMealID(params.mealID);
        getMeal(params.mealID);
    },[]);


    return (
        <main>
            <section className="meal-heading">
                <h1>{mealEvent.title}</h1>
            </section>
            <div className="form-section">
                <form onSubmit={handleSubmit}>
                    <span>
                        <label htmlFor="meal-date">Date</label>
                        <input className="date-input" value={formData.date} name="date" id="date-input" type="date" onChange={handleChange}/>
                    </span>
                    <span>
                        <label htmlFor="meal-time">Time</label>
                        <input className="date-input" value={formData.time} name="time" id="time-input" type="time" onChange={handleChange}/>
                    </span>
                    <span>
                    <label htmlFor="meal-time">Meal type</label>
                    <input className="meal-type-input" value={formData.meal_type_label} name="meal_type_label" id="mealType" type="text" onChange={handleChange}/>
                    </span>
                    <span id="meal-submit">
                        <input type="submit" value="Save changes"/>
                    </span>
                    <span>
                    {!showDeleteButton && <button className="delete-lock" onClick={()=>{setShowDeleteButton(true)}}><img src={lock} width="15px" alt="Click here to reveal delete button"/></button>}
                    {showDeleteButton && <button className="delete-meal" onClick={handleDelete}>Delete meal</button>}
                        {warningVisible && <div className="validation_failure">Please make sure you select both a date and a time</div>}
                    </span>
                </form>
            </div>
            <div>
                <ShowRecipe uri={mealEvent.recipe_uri} />
            </div>
        </main>
    )


}
