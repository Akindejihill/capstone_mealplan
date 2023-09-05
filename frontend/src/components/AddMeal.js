/**
 * This component is a small form with date and time displayed, to 
 * submit a new meal event.  It can be reused on any page that
 * we want to schedule a meal from.  It requires the selectedMeal 
 * which can be inherited from RecipeSearch, or taken from a single
 * element of the array returned by MPApi.searchRecipes(searchString, planID)
 */

import '../styles/AddMeal.css'
import { useState, useEffect } from "react";
import { MPApi } from "../api";

export default function AddMeal({selectedMeal, planID, setPopupVisible, startDate, endDate, fetchCalData}){

    const [formData, setFormData] = useState({
        date : "",
        time : ""
    });
    const [warningVisible, setWarningVisible] = useState(false);

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
        if (formData.date === "" || formData.time === ""){
            setWarningVisible(true);
        } else {
            const [mealID, error] = await MPApi.addMealEvent(formData.date, formData.time, selectedMeal, planID);
            if (error){
                alert(error);
            }

            setPopupVisible(false);
            fetchCalData(planID, startDate, endDate);
        }
    }

    function handleCancel(evt){
        setPopupVisible(false);
    }

    return (
        <div className="add-meal">
            <h3>Schedule your meal</h3>
            <p className="form-meal-label">{selectedMeal.label}</p>
            <form onSubmit={handleSubmit}>
                <div className="meal-appointment">
                    <span>
                    <label htmlFor="meal-date">Date</label>
                    <input value={formData.date} name="date" id="meal-date" type="date" onChange={handleChange}/>
                    </span>
                    <span>
                    <label htmlFor="meal-time">Time</label>
                    <input value={formData.time} name="time" id="meal-time" type="time" onChange={handleChange}/>
                    </span>
                </div>
                <input type="submit" value="add"/>
            </form>
                <button onClick={handleCancel}>cancel</button>
            {warningVisible && <div className="validation_failure">Please make sure you select both a date and a time</div>}

        </div>
    );

}