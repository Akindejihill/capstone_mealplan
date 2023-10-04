import '../styles/RecipeSearch.css'
import { useState, useEffect } from "react";
import { MPApi } from "../api";
import ResultsArea from './ResultsArea';
import AddMeal from './AddMeal';

export default function RecipeSearch({planID, startDate, endDate, fetchCalData, setRecipeURI, recipeSwitch}){
 
    const [searchString, setSearchString] = useState("");
    const [resultArray, setResultArray] = useState([]);
    const [selectedMeal, setSelectedMeal] = useState({});
    const [popupVisible, setPopupVisible] = useState(false);

    function handleChange(evt){
        setSearchString(evt.target.value);
    }

    async function handleSubmit(evt){
        evt.preventDefault();

        const [result, error] = await MPApi.searchRecipes(searchString, planID);
        setResultArray(result);
        console.log("Search results:", result);


    }

    return (
        <div id="search-area">
            <form onSubmit={handleSubmit}>
                <div className="search-group">
                    <input value={searchString} type="text" id="search-bar" name="search-bar" placeholder='Search for a meal' onChange={handleChange} />
                    <input type="submit" value="search" id="search-button"></input>
                </div>
            </form>
            <div id="results-area">
                <ResultsArea results={resultArray} setSelectedMeal={setSelectedMeal} setPopupVisible={setPopupVisible} setRecipeURI={setRecipeURI} recipeSwitch={recipeSwitch}/>
            </div>
            {
                popupVisible && <div className="popup-form">
                    <AddMeal selectedMeal={selectedMeal} planID={planID} setPopupVisible={setPopupVisible} startDate={startDate} endDate={endDate} fetchCalData={fetchCalData}/>
                </div>
            }
        </div>
    );

}