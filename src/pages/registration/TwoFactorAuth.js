import React, {useContext, useEffect, useRef, useState} from "react";
import {Link, useLocation, useNavigate} from "react-router-dom";
import {VerifyOtp, login, userProfile} from "../../calls/Api";
import {AuthContext} from "../../contexts/AuthContext";
import Auth from "../../config/Auth";
import Tools from "../../config/Tools";


const TwoFactorAuth = (props) => {
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email || "";
    const password = location.state?.password || "";
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    // const [otp, setOtp] = useState('');
    const [otp, setOtp] = useState(new Array(6).fill(""));
    const [activeOTPIndex, setActiveOTPIndex] = useState(0);
    //   const { saveAuth, setCurrentUser } = useAuth();
    const [resendStatusMessage, setResendStatusMessage] = useState("");
    const [resendStatus, setResendStatus] = useState("");
    const [errorState, setErrorState] = useState(undefined);
    const [succesState, setSuccessState] = useState(undefined);
    const {setUser} = useContext(AuthContext);

    let currentOTPIndex = 0;
    const inputRef = {current: null};


    function handleOnChange(event) {
        const target = event.target;
        const value = target.value;
        const newOTP = [...otp]; // Assuming `otp` is an array holding the current OTP values.

        // Update the current index of the OTP with the last character of the value.
        newOTP[currentOTPIndex] = value.substring(value.length - 1);

        // Update the active index based on whether the user entered or cleared a value.
        if (!value) {
            setActiveOTPIndex(currentOTPIndex - 1);
        } else {
            setActiveOTPIndex(currentOTPIndex + 1);
        }
        // Set the updated OTP.
        setOtp(newOTP);
    }

    function handleOnKeyDown(event, index) {
        // Set the current OTP index to the input's index
        currentOTPIndex = index;

        // Check if the Backspace key is pressed
        // if (event.key === "Backspace") {
        //     setActiveOTPIndex(currentOTPIndex - 1);
        // }

        if (event.key === "Backspace") {

            const newOTP = [...otp];

            // If the current field is not empty, clear its value
            if (otp[index - 1] !== "") {
                newOTP[index - 1] = "";
                setActiveOTPIndex(index - 1);
                setOtp(newOTP);
            } else if (index > 0) {
                // Move focus to the previous field if it's not the first one
                setActiveOTPIndex(index - 1);
            }
        }


    }

    useEffect(() => {
        inputRef.current?.focus();
    }, [activeOTPIndex]);

    useEffect(() => {
        if (otp.every((digit) => digit !== "")) {
            setLoading(true)

            setTimeout(() => {
                handleSubmit();
            }, 1000);
        }
    }, [otp]);

    const handleSubmit = async () => {
        setLoading(true);
        //setErrorState(undefined);
        setSuccessState(undefined);

        let verify_data = {
            otp: otp.join("")
        }

        VerifyOtp(verify_data).then(function (response) {
            if (response.status == 200 && response.data) {

                Auth.setAccessToken(response.data.access);
                Auth.setRefreshToken(response.data.refresh);
                Auth.setUserRole(response.data.role);

                userProfile({
                    auth_token: response.data.access
                }).then(function (response) {
                    // AuthContext.user = response.data;
                    setUser(response.data);
                    setSuccessState("Otp verified successfully");
                    setTimeout(() => {
                        window.location.href = '/'
                    }, 300);
                });

            }
        }).catch((error) => {
            if (error.status == 400 && error.response.data?.error === "OTP has expired") {
                toastr.error('OTP has expired');
                setErrorState('OTP has expired');
            } else if(error.response.data?.error === "Invalid OTP."){
                toastr.error('OTP is invalid');
                setErrorState('OTP is invalid');
            }else if(error.response.data?.error === "OTP session data is missing."){
                toastr.error('OTP session data is missing');
                setErrorState('OTP session data is missing');
            }else {
                toastr.error('Oops !! An error has occurred please contact your administrator');
            }
        });
        setLoading(false);
    };

    async function resendOtp() {
        setResendLoading(true);
        setResendStatusMessage("");
        setResendStatus("");
        setErrorState(undefined);

        try {
            const resendData = {
                username: email,
                password: password,
            };
            const {data: response} = await login(resendData);
            setResendStatusMessage(
                "We've sent your OTP again! Please check your inbox!"
            );
            setResendStatus("success");
        } catch (error) {
            setResendStatusMessage("Failed to resend OTP. Please try again.");
            setResendStatus("failure");
        } finally {
            setOtp(new Array(6).fill(""));
            setActiveOTPIndex(0);
            setResendLoading(false);
        }
    }

    return (
        <form
            className="form d-flex flex-column justify-content-center align-items-center"
            noValidate
            id="kt_login_signin_form"
            onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
            }}
        >
            <div className="text-center mb-5">
                <div className="text-center mb-10">
                    <img
                        alt="Logo"
                        className="mh-125px"
                        src="../../assets/media/icons/two-factor-auth.svg"
                    />
                </div>
                <h1 className="text-white mb-3">{Tools.translate('TWO_FACTOR_AUTH')}</h1>
                <div className="text-muted fw-semibold fs-5 mb-5">
                    {Tools.translate('ENTER_VERIFICATION_CODE')}
                </div>
                <div className="fw-bold text-white fs-3">{email}</div>
            </div>

            <div className="d-flex justify-content-center mb-5">
                <div className="d-flex flex-nowrap">
                    {new Array(6).fill("").map((_, index) => {
                        return (
                            <React.Fragment key={index}>
                                <input
                                    ref={activeOTPIndex === index ? inputRef : null}
                                    type="text"
                                    className="form-control bg-transparent h-40px w-40px text-center mx-1 fs-3"
                                    onChange={handleOnChange}
                                    onKeyDown={(e) => handleOnKeyDown(e, index)}
                                    onInput={(e) => {
                                        const value = e.currentTarget.value;
                                        if (!/^\d*$/.test(value)) {
                                            e.currentTarget.value = value.replace(/\D/g, "");
                                        }
                                    }}
                                    value={otp[index]}
                                />
                                {index === otp.length - 1 ? null : <span className={""}/>}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
            {errorState && (
                <div className="alert alert-dismissible bg-light-danger d-flex flex-column flex-sm-row w-100 p-5 mb-10">
                    <i className="ki-duotone ki-message-text-2 fs-2hx text-danger me-4 mb-5 mb-sm-0"><span
                        className="path1"></span><span className="path2"></span><span className="path3"></span></i>
                    <div className="d-flex align-self-center text-danger">
                        <span>{errorState}</span>
                    </div>
                </div>
            )}

            {succesState && (
                <div className="alert alert-dismissible bg-light-success d-flex flex-column flex-sm-row w-100 p-5 mb-10">
                    <i className="ki-duotone ki-message-text-2 fs-2hx text-success me-4 mb-5 mb-sm-0"><span
                        className="path1"></span><span className="path2"></span><span className="path3"></span></i>
                    <div className="d-flex align-self-center text-success">
                        <span>{succesState}</span>
                    </div>
                </div>
            )}

            <div className="d-flex flex-wrap justify-content-center pb-lg-0">
                <button
                    disabled={otp.some((digit) => digit === "") || loading}
                    type="submit"
                    className="btn btn-gold me-4 text-gray-900"
                >
                    {loading ? (
                        <>
                            {Tools.translate('PLEASE_WAIT')}
                            <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
                        </>
                    ) : (
                        Tools.translate('SUBMIT')
                    )}
                </button>
                <Link to="/">
                    <button
                        type="button"
                        id="kt_login_password_reset_form_cancel_button"
                        className="btn btn-light margin-dir-3"
                    >
                        {Tools.translate('CANCEL')}
                    </button>
                </Link>{" "}
            </div>
            <br/>

            <div className="text-center fw-semibold fs-5">
                <span className="text-muted me-1">{Tools.translate('DIDNT_GET_CODE')}</span>
                <Link
                    to="#"
                    onClick={(e) => {
                        e.preventDefault(); // Prevent default navigation behavior
                        resendOtp();
                    }}
                    className="link-primary fs-5 me-1 "
                >
                    {resendLoading ? (
                        <span
                            className="spinner-border spinner-border-sm"
                            role="status"
                            aria-hidden="true"
                        ></span>
                    ) : (
                        Tools.translate('RESEND')
                    )}
                </Link>
                <div className="mt-4">
                    {resendStatus == "success" && (
                        <div className="alert alert-success">{resendStatusMessage}</div>
                    )}

                    {resendStatus == "failure" && (
                        <div className="alert alert-danger">{resendStatusMessage}</div>
                    )}
                </div>
            </div>
        </form>
    );
};
export default TwoFactorAuth;
