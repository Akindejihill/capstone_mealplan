import '../styles/SearchResult.css'
import { useState, useEffect } from "react";
import { MPApi } from "../api";

let currentURI;

export default function SearchResult({recipe, variant, setSelectedMeal, setPopupVisible, setRecipeURI, recipeSwitch}){

    

    function openRecipe(evt){
        //show hidden window and load new recipe
        //if the uri has changed
        if (currentURI !== evt.target.value){
            currentURI = evt.target.value;
            setRecipeURI(evt.target.value);
        }
        recipeSwitch();
    }


    function clickHandler(evt){
        //reveal hidden form in RecipeSearch and set the selected meal
        setPopupVisible(true);
        setSelectedMeal(recipe);
    }

    return (
        <div className="search-result">
            <img className="recipe-thumb" src={recipe.images.THUMBNAIL.url} />
            <div className={variant ? "color-strip1" : "color-strip2"}>
                <span className="recipe-label"><button value={recipe.uri} onClick={openRecipe}>{recipe.label}</button></span>
            </div>
            <button className="add-meal-button" onClick={clickHandler}>Add</button>
        </div>
    );

}