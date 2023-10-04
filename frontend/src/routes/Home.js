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
            <section>
                <div className="hero">
                    <p className="text">As a stay at home dad my wife expects me to cook dinner even 
                    though I also study and code morning noon and night.  I didn't know 
                    what to make, so I made Meal Planner instead.  Maybe someday
                    soon I'll cook dinner.
                    </p>
                    <p className="signature">- the Webmaster</p>
                </div>
                <ListPlans />
            </section>
        </main>

    )

}


export default Home;