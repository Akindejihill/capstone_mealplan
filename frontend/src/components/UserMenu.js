import {Link} from 'react-router-dom';
import '../styles/UserMenu.css';
import { useNavigate, redirect } from 'react-router-dom';

const UserMenu = ({uMVisibility, toggleUserMenu, updateUser}) => {

    const navigate = useNavigate();

    function logout(){
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // window.location = "/";
        console.log("Logout clicked");
        updateUser(null);
        //navigate('/');  Why does this not work??
    }

    return (
        <div id="user_menu" className={uMVisibility} onBlur={toggleUserMenu}>
            <p><a onClick={logout}>logout</a></p>
            <p><a href="/profile">profile</a></p>
        </div> 
    )
}

export default UserMenu;