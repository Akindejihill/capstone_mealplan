import { useState, useEffect } from "react";
import { MPApi } from "../api";
import SearchResult from './SearchResult';

export default function ResultsArea({results, setSelectedMeal, setPopupVisible, setRecipeURI, recipeSwitch}){

    let variant = true;
    return (
            results.map(recipe => {
                variant = !variant;
                return (
                <span key={recipe.id}>
                    <SearchResult recipe={recipe} variant={variant} setSelectedMeal={setSelectedMeal} setPopupVisible={setPopupVisible} setRecipeURI={setRecipeURI} recipeSwitch={recipeSwitch}/>
                </span>
                )
            })
    );

}