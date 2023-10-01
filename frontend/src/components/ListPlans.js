import { useNavigate, redirect, useParams } from 'react-router-dom';
import {useState, useEffect} from 'react';
import { MPApi } from '../api';
import '../styles/ListPlans.css';

const ListPlans = () => {

    const [user, setUser] = useState(null);
    const [list, setList] = useState([{label : "No meal plans yet", id : null, description : "create a meal plan"}]);

    //get list of users meal plans
    useEffect(() => {
        async function getList(){
            const userData = localStorage.getItem('user');

            if (userData){
                setUser(JSON.parse(userData));
                const [plans, error] = await MPApi.getPlanList();
                if (error){
                    setList([{label : "Error", id : null, description : error}])
                } else {
                    const list = plans.map(plan => ({
                                                        label : plan.label, 
                                                        id : plan.id, 
                                                        description : plan.description
                                                    }));

                    setList(list);
                }

            } else {
                //setUserID(null);
                setList([{label : "No meal plans yet", id : null, description : "create a meal plan"}])
            }
        }

        getList();

    },[]);


    return (
        <section className="plan-list">
            <h3>Meal plans{user ? ` for ${user.first_name} ${user.last_name}!` : "!"}</h3>
            <ul>
                {
                    //display a pair of list items for each plan in the list
                    list.map(plan => <li key={plan.id}><a href={`/plan/${plan.id}`}>{plan.label}</a>
                                        <ul>
                                            <li>{plan.description}</li>
                                        </ul>
                                    </li>)
                }
            </ul>
            {
                user ? <a href="/addPlan"><button>Add new plan</button></a> : ""
            }
            
        </section>
    );

}

export default ListPlans;
