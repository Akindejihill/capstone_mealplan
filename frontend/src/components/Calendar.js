import '../styles/Calendar.css';
import { useState, useEffect } from "react";


export default function Calendar({startDate, endDate, setStartDate, setEndDate, calData, fetchCalData, planID}){

    const [maximized, setMaximized] = useState(false);
    const [maxClass, setMaxClass] = useState("window");

    const [days, setDays] = useState([]);
    const [shoppingList, setShoppingList] = useState({});
    const [blankDays, setBlankDays] = useState([]);
    const [displayMode, setDisplayMode] = useState("calendar");


    const [formData, setFormData] = useState({
        startDate : "",
        endDate : ""
    });

    const [warningVisible, setWarningVisible] = useState(false);

    //handles when the min/max button is clicked
    function handleMax(evt){
        setMaximized(value => {
            if (value){
                setMaxClass("window");
            } else {
                setMaxClass("maximized")
            }
            return !value;
        });

    }

    function handleChange(evt){
        const {name , value} = evt.target;
        setFormData(data => ({
            ...data, //include all object properties
            [name]: value //overide the target that was event triggered
        }));
    }

    function changeDisplay(evt){
        setDisplayMode(evt.target.value);
    }


    async function handleSubmit(evt){
        evt.preventDefault();

        //validate
        if (formData.startDate === "" || formData.endDate === ""){
            setWarningVisible(true);
        } else {
            setWarningVisible(false);
            fetchCalData(planID, formData.startDate, formData.endDate);
        }
    }


    useEffect(() => {
        if (calData && calData.days && calData.days.length > 0) {
            setDays(calData.days);
            setShoppingList(calData.list);
            console.log("Days from Calendar: ", calData.days);
            console.log("From Calendar, First day: ", calData.days[0]);
            console.log("Ingredients from Calendar: ", calData.list);
        }
    }, [calData]);


    useEffect(() => {
        //set default startDate and endDate
        setFormData({
            startDate : startDate,
            endDate : endDate
        });
    }, [startDate, endDate]);

    
    return (
        <div id="calendar-area" className={maxClass}>
            <div className="calendar-header">
                <span><button value="calendar" onClick={changeDisplay}>Calendar</button><button value="shoppinglist" onClick={changeDisplay}>Shopping List</button></span><span className="min-max-button"><button onClick={handleMax}>{maximized ? "-": "+" }</button></span>
            </div>
            <div className="date-select">
                <form onSubmit={handleSubmit}>
                    <span>
                        <label htmlFor="meal-date">Start date</label>
                        <input className="date-input" value={formData.startDate} name="startDate" id="startDate" type="date" onChange={handleChange}/>
                    </span>
                    <span>
                        <label htmlFor="meal-time">End date</label>
                        <input className="date-input" value={formData.endDate} name="endDate" id="endDate" type="date" onChange={handleChange}/>
                    </span>
                    <span id="date-submit">
                        <input id="date-submit" type="submit" value="refresh"/>
                    </span>
                </form>
                {warningVisible && <div className="validation_failure">Please make sure you select both a date and a time</div>}
            </div>
            <div className="display-area">
                {displayMode === "shoppinglist" &&
                    <div className="shopping-list">
                        <div>
                            <h4>Shopping list {startDate} - {endDate}</h4>
                            <ul>
                                {
                                    Object.keys(shoppingList).map( key =>
                                        <li>{shoppingList[key].quantity} {shoppingList[key].measure} {key}</li>
                                    )
                                }
                            </ul>
                        </div>
                    </div>
                }
                {displayMode === "calendar" &&
                    <div className="calendar">
                        <div className="day-label" >Monday</div>
                        <div className="day-label">Tuesday</div>
                        <div className="day-label">Wednesday</div>
                        <div className="day-label">Thursday</div>
                        <div className="day-label">Friday</div>
                        <div className="day-label">Saturday</div>
                        <div className="day-label">Sunday</div>
                        {
                            days.map(day => {
                                if(day.blank){
                                    return <div className="day blank"></div>
                                } else {
                                    return (
                                    <div className="day filled">
                                        <span>{day.date ? day.date.split("-")[2] : ""}</span>
                                        <div className="day-meal">
                                            {
                                                day.meals ?
                                                day.meals.map(meal => 
                                                        <p className="day-meal-title"><a href={`meal/${meal.id}`}>{meal.title.length > 38 ? `${meal.title.slice(0,35)}...` : meal.title}</a></p>
                                                    )
                                                : ""
                                            }
                                        </div>
                                    </div>
                                    )
                                }
                            })
                        }
                    </div>
                }
            </div>
            
        </div>
    );

}