import React, {Fragment, useEffect} from "react";
import {useNavigate, BrowserRouter, Navigate} from "react-router-dom";
import Auth from "../config/Auth";
import Login from "../pages/registration/Login";
import {Route, Routes} from "react-router";
import Dashboard from "../pages/Dashboard";
import RegistrationWrapper from "../pages/registration/RegistrationWrapper";
import DashboardWrapper from "./DashboardWrapper";
import {ToastContainer} from "react-toastify";
import TwoFactorAuth from "../pages/registration/TwoFactorAuth";
import { SignUp } from "../pages/registration/Singup";
import { RegistrationSuccess } from "../pages/registration/RegisterSuccess";
import { ForgotPassword } from "../pages/registration/ForgotPassword";
import { ResetPassword } from "../pages/registration/RestPassword";
import { PrivacyAndPolicy } from "../pages/registration/PrivacyAndPolicy";
import Calendar from "../pages/calendar/Calendar.js"; 
import Clients from "../pages/client/ClientList.js"; 
import DroneProfile from "../pages/myDrones/DroneProfile.js";
import MyDrones from "../pages/myDrones/MyDrones.js"
import Missions from "../pages/missions/Missions.js"
import MissionDetails from "../pages/missions/MissionDetails.js"
import UserProfile from "../pages/user/UserProfile.js"
import Analytics from "../pages/analytics/Analytics.js"

const AppWrapper = () => {
    useEffect(() => {
        // Remove app-blank class for both authenticated users and guests
        document.body.classList.remove('app-blank');
    });

    const ProtectedRoute = ({children, allowedRoles}) => {
        const navigate = useNavigate();
        const isAuthenticated = Auth.isAuthenticated();
        const userRole = Auth.getUserRole();

        useEffect(() => {
            // Listen for token changes
            const handleStorageChange = () => {
                if (!Auth.isAuthenticated()) {
                    navigate("/login", {replace: true});
                }
            };

            window.addEventListener("storage", handleStorageChange);
            return () => window.removeEventListener("storage", handleStorageChange);
        }, [navigate]);

        if (!isAuthenticated) {
            // If not authenticated, redirect to login page
            return <Navigate to="/login" replace />;
        }

        if (!allowedRoles.includes(userRole)) {
            return <Navigate to="/access-denied" replace/>;
        }

        return children;
    };

    return (<Fragment>
            <ToastContainer autoClose={3000} closeOnClick/>


            <BrowserRouter>
                <Routes>

                    <Route element={<RegistrationWrapper/>}>
                        <Route path='/login' element={<Login/>} exact/>
                        <Route path='/auth/two-factor-auth' element={<TwoFactorAuth/>} exact/>
                        <Route path='/auth/singup' element={<SignUp/>} exact/>
                        <Route path='/auth/registration-success' element={<RegistrationSuccess/>} exact/>
                        <Route path='/auth/forgot-password' element={<ForgotPassword/>} exact/>
                        <Route path='/auth/reset-password' element={<ResetPassword/>} exact/>
                        <Route path='/auth/terms-conditions' element={<PrivacyAndPolicy/>} exact/>
                    
                    </Route>
                    <Route element={<ProtectedRoute allowedRoles={['ADMIN']}><DashboardWrapper/></ProtectedRoute>}>
                        <Route path='/' element={<Dashboard/>} exact/>
                        <Route path='/calendar' element={<Calendar/>} exact/>
                        <Route path='/analytics' element={<Analytics/>} exact/>
                        <Route path='/clients' element={<Clients/>} exact/>
                        <Route path='/mydrones/:id' element={<DroneProfile/>} exact/>
                        <Route path='/mydrones' element={<MyDrones/>} exact/>
                        <Route path='/missions' element={<Missions/>} exact/>
                        <Route path='/missions/:id' element={<MissionDetails/>} exact/>
                        <Route path='/user-profile' element={<UserProfile/>} exact/>

                    </Route>
                </Routes>

            </BrowserRouter>


        </Fragment>
    )
}
export default AppWrapper;