import '../styles/MealPlan.css';
import { MPApi } from '../api';
import {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { dietOptions, healthOptions } from '../helpers/constants';

const NewPlan = () =>{
    const navigate = useNavigate();

    const [warningVisible, setWarningVisible] = useState(false);
    const [error, setError] = useState("Meal plan creation failed for some reason.");

    const [formData, setFormData] = useState({
        label : "",
        description : "",
        health : [],
        diet : []
    });

    const [dietTags, setDietTags] = useState([]);
    const [healthTags, setHealthTags] = useState([]);
    
    function handleChange(evt){
        const {name , value} = evt.target;
        setFormData(data => ({
            ...data, //include all object properties
            [name]: value //overide the target that was event triggered
        }));
    }

    function handleDietClick(evt){
        if (evt.target.checked) {
            var valueToAdd = evt.target.value;
            setDietTags( list => {
                list.push(valueToAdd);
                return list;
            });

          } else {
            var valueToDelete = evt.target.value;
            setDietTags( list => {
                var newList = list.filter((value) => { return value !== valueToDelete; });
                return newList;
            });
          }
    }

    function handleHealthClick(evt){
        if (evt.target.checked) {
            var valueToAdd = evt.target.value;
            setHealthTags( list => {
                list.push(valueToAdd);
                return list;
            });

          } else {
            var valueToDelete = evt.target.value;
            setHealthTags( list => {
                var newList = list.filter((value) => { return value !== valueToDelete; });
                return newList;
            });
          }
    }
    
    async function handleSubmit(evt){
        evt.preventDefault();
        
        const [planID, error] = await MPApi.addMealPlan(formData);
        if(!planID){
            setWarningVisible(true);
            setError(error);
        } else {
            navigate(`/plan/${planID}`);
        }
    }

    //when diet tags change, update form data
    useEffect(() => {
        setFormData(data => ({
            ...data, //include all object properties
            diet : dietTags //overide the diet array
        }));
    },[dietTags])

    //when health tags change, update form data
    useEffect(() => {
        setFormData(data => ({
            ...data, //include all object properties
            health : healthTags //overide the diet array
        }));
    },[healthTags])


    return (
        <section className="new-plan-page" id="plan-section">
            <div>
                {warningVisible && <div className="reg-failure">{error}</div>}
                <h1>Setup a <br/>New Meal Plan</h1>
                <form onSubmit={handleSubmit} className="mealplan-form">
                    <label className="visually-hidden" htmlFor="label">Plan name</label>
                    <input value={formData.label} name="label" id="label" type="text" placeholder="plan name" onChange={handleChange}/>
                    <label className="visually-hidden" htmlFor="description">description</label>
                    <input value={formData.description} name="description" id="description" placeholder="description" type="text" onChange={handleChange}/>

                    <h4>Diet preferences</h4>
                    <div className="diet-options">
                    {
                        dietOptions.map(option => (
                            <span className="tag" key={"tag" + option}>
                                <input type="checkbox" name="diet" value={option} id={option} className="check-tag" onChange={handleDietClick}/>
                                <label htmlFor={option} className="">{option}</label>
                            </span>
                        ))
                    }
                    </div>

                    <h4>Health and lifestyle preferences</h4>
                    <div className="health-options">
                    {
                        healthOptions.map(option => (
                            <div className="tag" key={"tag" + option}>
                                <input type="checkbox" name="diet" value={option} id={option} className="check-tag" onChange={handleHealthClick}/>
                                <label htmlFor={option} className="label-tag">{option}</label>
                            </div>
                        ))
                    }
                    </div>
                    


                    <button className="btn btn-secondary" onClick={handleSubmit}>Save meal plan</button>
                </form>
            </div>
        </section>
    );

}

export default NewPlan;
