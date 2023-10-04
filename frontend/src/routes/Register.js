import '../styles/Register.css';
import {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { MPApi } from '../api';

const Register = ({updateUser}) => { 
    
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username : "",
        password : "",
        email : "",
        first_name : "",
        last_name : ""
    });
    const [warningVisible, setWarningVisible] = useState(false);

    const [error, setError] = useState("Registration failed for some reason.");
    
    function handleChange(evt){
        const {name , value} = evt.target;
        setFormData(data => ({
            ...data, //include all object properties
            [name]: value //overide the target that was event triggered
        }));
    }


    async function handleSubmit(evt){
        evt.preventDefault();
        
        const [profile, error] = await MPApi.register(formData.username, formData.password, formData.email, formData.first_name, formData.last_name);
        if(!profile){
            setWarningVisible(true);
            setError(error);
        } else {
            console.log("user id: ", profile.userid);
            updateUser(profile);
            navigate('/profile');
        }
    }


    return (
        <div className="regpage">
            <form onSubmit={handleSubmit} className="register-form">
                <label className="visually-hidden" htmlFor="username">user name</label>
                <input value={formData.username} name="username" id="username" type="text" placeholder="username" onChange={handleChange}/>
                <label className="visually-hidden" htmlFor="password">password</label>
                <input value={formData.password} name="password" id="password" placeholder="password" type="password" onChange={handleChange}/>
                <label className="visually-hidden" htmlFor="email">Email</label>
                <input value={formData.email} name="email" id="email" placeholder="email" type="text" onChange={handleChange}/>
                <label className="visually-hidden" htmlFor="first_name">First name</label>
                <input value={formData.first_name} name="first_name" id="first_name" placeholder="first_name" type="text" onChange={handleChange}/>
                <label className="visually-hidden" htmlFor="last_name">Last name</label>
                <input value={formData.last_name} name="last_name" id="last_name" placeholder="last_name" type="text" onChange={handleChange}/>
                <button onClick={handleSubmit}>Register</button>
            </form>
            {warningVisible && <div className="reg-failure">{error}</div>}
        </div>
    );

}
export default Register;
