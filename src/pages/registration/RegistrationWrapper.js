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
                                <img src="../../assets/media/logos/logo.png" width={100}/>

                                <div className="w-lg-500px p-10">

                                    <Outlet/>

                                </div>
                                <div className="d-flex align-items-center justify-content-between w-100 mt-10 mt-lg-0">
                                    <div className="text-center flex-grow-1 text-gray-500 fw-bold">
                                        {Tools.translate('POWERED_BY')}{" "}
                                        {isArabic ? (
                                            <>
                                                <a
                                                    href="https://neruos.tech/"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-gray-700 text-hover-primary fs-6 fw-semibold"
                                                >
                                                    Neruos.tech
                                                </a>{" "}
                                                {" "}
                                                {Tools.translate('ALL_RIGHTS_RESERVED')} {currentYear} © .
                                            </>
                                        ) : (
                                            <>
                                                <a
                                                    href="https://neruos.tech/"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-gray-700 text-hover-primary fs-6 fw-semibold"
                                                >
                                                    Neruos.tech
                                                </a>{" "}
                                                © {currentYear}. {Tools.translate('ALL_RIGHTS_RESERVED')}.
                                            </>
                                        )}
                                    </div>
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