import '../styles/Home.css';
import background01 from '../images/navy_watercolour_banner_gold_border.jpg';
import ListPlans from "../components/ListPlans";

function Home({user}) {

    let name;
    if(user){
        name = " "+user.userid;
    } else {
        name = "";
    }

    return (
        <main>
            <h1>Hello{name}!</h1>
            <div className="hero">
                <p>As a stay at home dad my wife expects me to cook dinner even 
                   though I also code morning noon and night.  I didn't know 
                   what to make, so I made Meal Planner instead.  Maybe someday
                   soon I'll cook dinner.<br/> - the Webmaster</p>
            </div>
            <ListPlans />
        </main>

    )

}


export default Home;