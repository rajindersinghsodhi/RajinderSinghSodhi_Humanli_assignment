import { onAuthStateChanged } from "firebase/auth";
import {auth} from "./firebase.js"
import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export const AuthContextProvider = ({children}) => {
    const[currrentUser, setCurrentUser] = useState({});
    
    useEffect(()=>{
        const unsub = onAuthStateChanged(auth, (user)=>{
            setCurrentUser(user);
            console.log(user);
        });

        return () => {
            unsub();
        }
    },[]);

    return(
    <AuthContext.Provider value={{currrentUser}}>
        {children}
    </AuthContext.Provider>
    );
}