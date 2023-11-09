import '../styles/ShowRecipe.css'
import { useState, useEffect } from "react";
import { MPApi } from "../api";


const NUTRIENT_LIST=["ENERC_KCAL", "CHOCDF", "FIBTG", "SUGAR", "PROCNT", "CHOLE", "NA", "FAT", "FASAT", "FATRN"];

export default function ShowRecipe({uri}){
    console.log("URI: ", uri);

    const [recipe, setRecipe] = useState("");

    useEffect(() => {

        async function callAPI(uri){
            const [result, error] = await MPApi.getRecipe(uri);

            if(error){
                alert(error);
            } else {
                console.log("Result: ", result);
                setRecipe(result);
            }
        }

        if (uri) {
            callAPI(uri);
        }

    }, [uri]);


    return(
        recipe ? <div className="recipe-container">
            <div className="recipe-column-1">
                <div className="recipe-caption">
                    {
                        recipe.images.LARGE ? 
                        <a href={recipe.images.LARGE.url} target="_blank"><img src={recipe.image} alt={recipe.label} className="recipe-image"/></a>
                        : <img src={recipe.image} alt={recipe.label} className="recipe-image"/>
                    }
                    <a href={recipe.url} target="_blank"><button className="prep-button">Get preparation instructions from {recipe.source}</button></a>
                </div>
                {
                    recipe.cautions.length > 0 ?
                <div className="recipe-warnings">
                    <span className="cautions-label">Cautions: </span>{recipe.cautions.map(caution => <span className="caution-tag">{caution}</span>)}
                </div>
                : ""
                }
                <div className="health-diet-lables">
                    <p className="health-heading">Health Labels</p>
                    {
                        recipe.healthLabels.length > 0 ?
                        recipe.healthLabels.map( label =>
                            <span className="health-label">{label}</span>
                        )
                        : ""
                    }
                    <p className="diet-heading">Diet Labels</p>
                    {
                        recipe.dietLabels.length > 0 ?
                        recipe.dietLabels.map( label =>
                            <span className="diet-label">{label}</span>
                        )
                        : ""
                    }
                </div>
                
            </div>
            <div className="recipe-column-2">
                <div className="ingredients">
                    <h4>Ingredients</h4>
                    {
                        recipe.ingredientLines.length > 0 ?
                        <ul>
                            {
                                recipe.ingredientLines.map(line => 
                                    <li className="ingredient-line">{line}</li>)
                            }
                        </ul>
                        : ""
                    }
                </div>
                <div className="nutrition">
                    <h4>Nutrition</h4>
                    {
                        Object.keys(recipe.totalNutrients).length > 0 ?
                        <ul>
                            {
                                Object.keys(recipe.totalNutrients).map( key => 
                                    NUTRIENT_LIST.includes(key) ?
                                    <li className="ingredient-line">{recipe.totalNutrients[key].label}: {recipe.totalNutrients[key].quantity.toFixed(3)}{recipe.totalNutrients[key].unit}</li>
                                    : ""
                                )               
                            }
                        </ul>
                        : "No nutrition data."
                    }
                </div>
            </div>
        </div>
        : `Error retrieving recipe: ${uri}`
    )

}