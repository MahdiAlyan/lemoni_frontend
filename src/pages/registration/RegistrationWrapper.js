import React, {useEffect} from "react";
import {Outlet} from "react-router-dom";
import {useDirection} from "../../contexts/DirectionContext";
import Tools from "../../config/Tools";


const RegistrationWrapper = () => {

    const { direction, toggleDirection } = useDirection();
    const isArabic = direction === 'rtl';
    const currentYear = new Date().getFullYear();

    return (
        <>

            <link rel="stylesheet" href="../../assets/css/Registration.css"/>
            <div id="kt_app_root" className="d-flex flex-column flex-root">

                <div className="d-flex flex-column flex-column-fluid flex-lg-row">


                    <div
                        className="d-flex flex-column-fluid flex-lg-row-auto justify-content-center justify-content-lg-end p-12 p-lg-20 ms-20">
                        <div
                            className="bg-body d-flex flex-column align-items-stretch flex-center rounded-4 w-md-600px p-20">
                            <div className="d-flex flex-center flex-column flex-lg-row-fluid">
                                <img src="../../assets/media/logos/icon.png" width={100}/>

                                <div className="w-lg-500px p-10">

                                    <Outlet/>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
export default RegistrationWrapper;