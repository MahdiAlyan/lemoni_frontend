import React from "react";
import {Link, useNavigate} from "react-router-dom";
import Tools from "../../config/Tools";


export function RegistrationSuccess() {

    return (
        <div
            className="d-flex flex-column justify-content-center align-items-center"
            id="kt_account_review">
            <div className="text-center mb-5">
                <div className="text-center mb-15">
                    <img
                        alt="Welcome"
                        className="mw-125px"
                        src="../../assets/media/auth/please-verify-your-email.png"
                    />
                </div>
                <div className="mb-9">
                    <h1 className="text-white">{Tools.translate('WELCOME_ABOURD')}</h1>
                </div>
                <div className="text-muted fw-semibold fs-5 mb-5">
                    {Tools.translate('THANKS_FOR_REGISTERING')} <b>{Tools.translate('lemoni_KSA')}</b>
                </div>
                <div className="text-muted fw-semibold fs-5 mb-5">
                    {Tools.translate('YOUR_ACCOUNT_HAS_BEEN_CREATED')}
                </div>
            </div>
            <div className="d-flex flex-wrap justify-content-center pb-lg-0">
                <Link to="/login">
                    <button
                        type="button"
                        id="kt_back_previous"
                        className="btn btn-gold me-8  text-gray-900">
                       {Tools.translate('BACK_TO_LOGIN')}
                    </button>
                </Link>
            </div>
        </div>
    );

}
