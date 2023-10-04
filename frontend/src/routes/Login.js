import '../styles/Login.css';
import {useState} from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MPApi } from '../api';

const Login = ({updateUser}) => { 
    
    const navigate = useNavigate();

    /**
     * Calls the login function from the MPApi
     * @param {*} username 
     * @param {*} password 
     * @returns an array contaning the falure status and user
     */

    const [formData, setFormData] = useState({
        username : "",
        password : ""
    });
    const [warningVisible, setWarningVisible] = useState(false);
    
    function handleChange(evt){
        const {name , value} = evt.target;
        setFormData(data => ({
            ...data, //include all object properties
            [name]: value //overide the target that was event triggered
        }));
    }

    async function handleSubmit(evt){
        evt.preventDefault();
        
        const [failure, user] = await MPApi.login(formData.username, formData.password);
        if(failure){
            setWarningVisible(true);
        } else if (user){
            updateUser(user);
            navigate('/');
        }
    }

    return (
        <div className="regpage">
            <form onSubmit={handleSubmit} className="login-form">
                <label className="visually-hidden" htmlFor="username">user name</label>
                <input value={formData.username} name="username" id="username" type="text" placeholder="username" onChange={handleChange}/>
                <label className="visually-hidden" htmlFor="password">password</label>
                <input value={formData.password} name="password" id="password" placeholder="password" type="password" onChange={handleChange}/>
                <button className="btn btn-secondary" onClick={handleSubmit}>Login</button>
            </form>
            <p>or <Link to={'/register'}>register</Link> a new account</p>
            {warningVisible && <div className="auth_failure">Authentication failed.  Please try again</div>}
        </div>
    );

}
export default Login;
