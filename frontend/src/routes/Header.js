import '../styles/Header.css';
import {useState} from 'react';
import logo from "../images/logo.png";
import UserMenu from '../components/UserMenu'
import {Link} from 'react-router-dom';
import user_icon from '../images/user_icon.png';
function search(){

}


function Header({user, updateUser}) {
    let username = null;
    let name = null;
    //basic user widget for log out user
    let userButton = (
        <Link to={'/login'}>
            login / register
        </Link>
    );

    /**Store user information in localStorage and prepare user info
    *for use in component content*/
    if (user){
        localStorage.setItem('user', JSON.stringify(user));
        username = user.userid;
        name = user.first_name + " " + user.last_name;

        //if user is logged in provide a more advanced user widget
        userButton = (
            <div id="user_button" tabIndex="1" onClick={toggleUserMenu}>
                <img className="profile_icon" src={user_icon} alt="profile picture"/>
                <p>{username}</p>
            </div>
        );
    }
    
    // controls the visibility of the user menu for the advanced user widget
    const [uMVisibility, setUMVisibility] = useState("noshow");

    //toggles the visibility of the user menu
    function toggleUserMenu (){
        setUMVisibility(uMVisibility => uMVisibility === "noshow"? "show" : "noshow");
    }

    return (
        <header className="App-header">
            <span className="start">
                <img src={logo} className="App-logo" alt="logo" />
            </span>
            <span class="links"> 
                <span className="navLink">
                    <Link to={'/'} className="link">
                        Home
                    </Link>
                </span>
                <span className="navLink">
                    <Link to={'/about'} className="link">
                        About
                    </Link>
                </span>
                <span className="navLink">
                    <Link to={'/attribution'} className="link">
                        Attribution
                    </Link>
                </span>
            </span>
            <span className="end">
                <span className="navLink menu">
                    {userButton}
                    <UserMenu uMVisibility={uMVisibility} toggleUserMenu={toggleUserMenu} updateUser={updateUser}/>
                </span>
            </span>
         </header>
    )

}


export default Header;
