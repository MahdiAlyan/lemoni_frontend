import React, {createContext, useEffect, useState} from 'react';
import Auth from "../config/Auth";
import {userProfile} from "../calls/Api";
import Tools from "../config/Tools";

export const AuthContext = createContext();

const AuthContextProvider = (props) => {
    const [user, setUser] = useState();

    useEffect(() => {
        checkUser()
    }, []);

    const checkUser = () => {
        let access_token = Auth.getAccessToken()
        if (access_token) {
            // call user-profile to check valid auth token
            let data_obj = {
                auth_token: access_token, role: Auth.getUserRole()
            }
            userProfile(data_obj).then(response => {
                Tools.checkResponseStatus(response, () => {
                    Auth.setUserRole(response.data.role)
                    setUser(response.data);

                }, () => {

                });

            }).catch(() => {
            })
        }
    }


    return (<AuthContext.Provider
        value={{
            user,
            setUser,
            checkUser
        }}>
        {props.children}

    </AuthContext.Provider>);
}

export default AuthContextProvider;
