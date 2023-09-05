import ListPlans from "../components/ListPlans";
import '../styles/Register.css';
import { MPApi } from '../api';
import {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';


const Profile = ({updateUser}) => { 
    const navigate = useNavigate();

    const [warningVisible, setWarningVisible] = useState(false);

    const [error, setError] = useState("Uh oh! Something went wrong.");

    const [profile, setProfile] = useState({});

    const [formData, setFormData] = useState({
        password : "",
        email : "",
        first_name : "",
        last_name : ""
    });

    const [auth, setAuth] = useState("");


    useEffect(() => {
        async function fetchProfile(){
            const profile = await MPApi.getProfile();
            setProfile(profile);

            setFormData({
                password : "",
                email : profile.email,
                first_name : profile.first_name,
                last_name : profile.last_name
            });
        }

        fetchProfile();     
        
    },[]);


    function handleChange(evt){
        const {name , value} = evt.target;
        setFormData(data => ({
            ...data, //include all object properties
            //[evt.target.name]: evt.target.value //overide the target that was event triggered
            [name]: value //overide the target that was event triggered
        }));
    }

    function handleAuth(evt){
        setAuth(evt.target.value);
    }

    async function handleSubmit(evt){
        evt.preventDefault();
        
        const [profile, error] = await MPApi.updateProfile(formData, auth);
        if(!profile){
            setWarningVisible(true);
            setError(error);
        } else {
            console.log("user id: ", profile.userid);
            updateUser(profile);
            navigate('/mealplan');
        }
    }




    return (
        <>
            <div class="profile-header">
                <h1>{profile.userid}'s Profile</h1>
            </div>
            <div className="regpage">
                <form onSubmit={handleSubmit}>
                    <label className="visually-hidden" htmlFor="email">Email</label>
                    <input value={formData.email} name="email" id="email" placeholder="email" type="text" onChange={handleChange}/>
                    <label className="visually-hidden" htmlFor="first_name">First name</label>
                    <input value={formData.first_name} name="first_name" id="first_name" placeholder="first_name" type="text" onChange={handleChange}/>
                    <label className="visually-hidden" htmlFor="last_name">Last name</label>
                    <input value={formData.last_name} name="last_name" id="last_name" placeholder="last_name" type="text" onChange={handleChange}/>
                    <label className="visually-hidden" htmlFor="password">New password</label>
                    <input value={formData.password} name="password" id="password" placeholder="new password" type="password" onChange={handleChange}/>
                    <label className="visually-hidden" htmlFor="oldPassword">Current password</label>
                    <input value={auth} name="oldPassword" id="oldPassword" placeholder="old password" type="password" onChange={handleAuth}/>
                    <button onClick={handleSubmit}>update</button>
                </form>
                {warningVisible && <div className="reg-failure">{error}</div>}
            </div>
            <ListPlans />
        </>
    );
}

export default Profile;