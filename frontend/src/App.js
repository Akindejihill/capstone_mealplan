import SharedLayout from "./routes/SharedLayout";
import Login from "./routes/Login";
import Register from "./routes/Register";
import Profile from "./routes/Profile";
import NewPlan from "./routes/NewPlan";
import MealPlan from "./routes/MealPlan";
import MealEvent from "./routes/MealEvent";
import Attribution from "./routes/Attribution";
import {useState, useEffect} from 'react';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Home from "./routes/Home";
import About from "./routes/About";

const APIUrl = "http://mealplan.cerebro.homelinux.net/api";
//const APIUrl = "http://cerebro:4000/api";


function App(){
    
    //if user is logged in set user to the json object stored in localStorage
    //if user is not logged in (no key in localStorage), set user to null
    const jsonString = localStorage.getItem("user");
    const [user, setUser] = useState(jsonString !== null ? JSON.parse(jsonString) : jsonString); 
    const [updateKey, setUpdateKey] = useState(0); //exists only to trigger useEffect after login

    //the plan id the user is working with
    const [planid, setPlanid] = useState(0)

    //This is run when a user logs in to signal a reload of the header and posts components
    function updateUser(user){
        setUser(user);
    }


    //after app load or user login, update localStorage,
    //refresh pages to reflect logged in status
    useEffect(() => {
        localStorage.setItem("user", JSON.stringify(user));
        setUpdateKey(oldKey => oldKey + 1);
        
    },[user]);


    return (
        <BrowserRouter basename="/mealplan">
            <Routes>
                <Route path='/' element={<SharedLayout user={user} updateUser={updateUser}/>}>
                    <Route index element={<Home user={user}/>} />
                    <Route path='login' element={<Login updateUser={updateUser}/>} />
                    <Route path='register' element={<Register updateUser={updateUser} />} />
                    <Route path='profile' element={<Profile updateUser={updateUser}/>} />
                    <Route path='addPlan' element={<NewPlan />} />
                    <Route path='plan/:planID' element={<MealPlan />} />
                    <Route path='attribution' element={<Attribution />} />
                    <Route path='plan/meal/:mealID' element={<MealEvent />} />
                    <Route path='about' element={<About />} />
                </Route>
                <Route path='*' element={<h1>Not found.</h1> } />
            </Routes>
        </BrowserRouter>
    )

}

export default App;
export {APIUrl};
