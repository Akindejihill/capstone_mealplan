import "../styles/SharedLayout.css";
import {Outlet} from 'react-router-dom';
import { useEffect, useState } from "react";
import Header from "./Header";

/**This is the main container of all the components and HTML elements */
function SharedLayout({user, updateUser}) {

    const [key, setKey] = useState(0);

    useEffect(() => {
        setKey(oldKey => oldKey + 1);
    },[user]);


    return (
        <div className="shared">
            <Header user={user} updateUser={updateUser} key={key}/>
            <div className="content">
                <Outlet />
            </div>
        </div>
    );
    
}

export default SharedLayout;
