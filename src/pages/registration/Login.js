import React, {useContext, useState, useEffect} from "react";
import {Link, useNavigate} from "react-router-dom";
import * as Yup from "yup";
import {useFormik} from "formik";
import clsx from "clsx";
import {login} from "../../calls/Api";
import Tools from "../../config/Tools";
import Auth from "../../config/Auth";
import {AuthContext} from "../../contexts/AuthContext";
import {useDirection} from "../../contexts/DirectionContext";

const usFlag = "../../assets/media/flags/united-states.svg";
const saudiFlag = "../../assets/media/flags/saudi-arabia.svg";

const loginSchema = Yup.object().shape({
    email: Yup.string()
        .email("Wrong email format")
        .max(50, "Maximum 50 symbols")
        .required(Tools.translate('EMAIL_IS_REQUIRED')),
    password: Yup.string()
        .max(50, "Maximum 50 symbols")
        .required(Tools.translate('PASSWORD_IS_REQUIRED')),
});

const initialValues = {
    email: "",
    password: "",
};

const Login = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordToggle, setShowPasswordToggle] = useState(false);
    const { direction, toggleDirection } = useDirection();
    const isArabic = direction === 'rtl';

    const {setUser} = useContext(AuthContext);

    useEffect(() => {
        // Check if we need to show our custom toggle
        setShowPasswordToggle(!Tools.hasNativePasswordToggle());
    }, []);

    const formik = useFormik({
        initialValues,
        validationSchema: loginSchema,
        onSubmit: (values, {setStatus, setSubmitting}) => {
            setLoading(true);
            try {

                let login_data = {
                    username: values.email,
                    password: values.password
                }

                login(login_data).then(response => {
                    console.log(response);
                    Tools.checkResponseStatus(response, () => {

                        if (response.status === "ACCOUNT_DEACTIVATED") {
                            setStatus("Your access to the portal has been suspended. Please contact your administrator for assistance")
                        } else if (response.data.status === 'MUST_AGREE_TO_POLICY') {
                            navigate("/auth/terms-conditions", {
                                state: {
                                    email: values.email,
                                    password: values.password,
                                },
                            });
                        } else if (response.data.status === "OTP_SENT") {
                            // if user is Partner, redirect to two factory auth page
                            navigate("/auth/two-factor-auth", {
                                state: {
                                    email: values.email,
                                    password: values.password,
                                    tokenExpiryTime: response.token_expiry_time,
                                },
                            });
                        } else if (response.data.refresh) {
                            Auth.setAccessToken(response.data.access);
                            Auth.setRefreshToken(response.data.refresh);
                            Auth.setUserRole(response.data.role);
                            setUser(response.data.user)
                            if (response.data.role === "CLIENT") {
                                navigate("/portal/ClientHome", {replace: true});    
                            }
                            else {
                                window.location.href = '/'
                            }
                            
                        } else {
                            setStatus("Unexpected response from the server");
                        }

                    }, () => {
                        setSubmitting(false);
                        setLoading(false);
                        toastr.error('ERROR_OCCURRED');
                    });
                }).catch((error) => {
                    // toastr.error(error.response.data.error);
                    if (error.response.data.message === 'User not active.'){
                        setStatus(Tools.translate('USER_NOT_ACTIVE'));
                    }else if (error.response && error.response.data) {
                        setStatus(error.response.data.message || "The login details are incorrect");
                    } else {
                        setStatus("The login details are incorrect");
                    }
                    setSubmitting(false);
                }).finally(() => {
                    setLoading(false);
                })


            } catch (error) {
                setStatus("The login details are incorrect");
                setSubmitting(false);
                setLoading(false);
            }
        },
    });

    return (


        <form className="form w-100" style={{ maxWidth: '100%', minWidth: '300px' }} onSubmit={formik.handleSubmit} noValidate id="kt_login_signin_form">

            {/* begin::Heading */}
            <div className="text-center mb-11">
                <h1 className="text-white fw-bolder mb-3">{Tools.translate('SIGN_IN')}</h1>
                {/* <div className='text-gray-500 fw-semibold fs-6'>Your Social Campaigns</div> */}
            </div>
            {/* end::Heading */}

            {formik.status && (
                <div className="alert alert-dismissible bg-light-danger d-flex flex-column flex-sm-row w-100 p-5 mb-10">
                    <i className="ki-duotone ki-message-text-2 fs-2hx text-danger me-4 mb-5 mb-sm-0"><span
                        className="path1"></span><span className="path2"></span><span className="path3"></span></i>
                    <div className="d-flex align-self-center text-danger">
                        <span>{formik.status}</span>
                    </div>
                </div>
            )}

            {/* begin::Form group */}
            <div className="fv-row mb-8">
                <label className="form-label fs-6 fw-bolder text-white">{Tools.translate('EMAIL')}</label>
                <input
                    placeholder={Tools.translate('EMAIL')}
                    {...formik.getFieldProps("email")}
                    className={clsx(
                        "form-control bg-transparent w-100",
                        {"is-invalid": formik.touched.email && formik.errors.email},
                        {
                            "is-valid": formik.touched.email && !formik.errors.email,
                        }
                    )}
                    type="email"
                    name="email"
                    autoComplete="off"
                />
                {formik.touched.email && formik.errors.email && (
                    <div className="fv-plugins-message-container">
                        <div className="fv-help-block">
                            <span role="alert">{formik.errors.email}</span>{" "}
                        </div>
                    </div>
                )}
            </div>
            {/* end::Form group */}

            {/* begin::Form group */}
            <div className="fv-row mb-3">
                <label className="form-label fw-bolder text-white fs-6 mb-0">
                    {Tools.translate('PASSWORD')}
                </label>
                <div className="position-relative mb-3">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder={Tools.translate('PASSWORD')}
                        autoComplete="off"
                        {...formik.getFieldProps("password")}
                        className={clsx(
                            "form-control bg-transparent w-100",
                            {
                                "is-invalid": formik.touched.password && formik.errors.password,
                            },
                            {
                                "is-valid": formik.touched.password && !formik.errors.password,
                            }
                        )}
                    />
                    {showPasswordToggle && (
                        <span
                            className={`btn btn-sm btn-icon position-absolute translate-middle top-50 ${direction === 'rtl' ? 'start-0 ms-5' : 'end-0 me-5'}`}
                            onClick={() => setShowPassword(!showPassword)}
                            style={{cursor: 'pointer'}}
                        >
            <i
                className={
                    showPassword
                        ? "ki-outline ki-eye fs-2"
                        : "ki-outline ki-eye-slash fs-2"
                }
            />
          </span>
                    )}
                </div>
                {formik.touched.password && formik.errors.password && (
                    <div className="fv-plugins-message-container">
                        <div className="fv-help-block">
                            <span role="alert">{formik.errors.password}</span>
                        </div>
                    </div>
                )}
            </div>
            {/* end::Form group */}

            {/* begin::Wrapper */}
            <div className="d-flex flex-stack flex-wrap gap-3 fs-base fw-semibold mb-8">
                <div/>

                {/* begin::Link */}
                <Link to="/auth/forgot-password" className="link-primary">
                   {Tools.translate('FORGOT_PASSWORD')}
               </Link>
                {/* end::Link */}
            </div>
            {/* end::Wrapper */}

            {/* begin::Action */}
            <div className="d-grid mb-10">
                <button
                    type="submit"
                    id="kt_sign_in_submit"
                    className="btn btn-gold text-gray-900"
                    style={{width: "100%"}}
                    disabled={formik.isSubmitting || !formik.isValid}
                >
                    {!loading && <span className="indicator-label">{Tools.translate('CONTINUE')}</span>}
                    {loading && (
                        <span className="indicator-progress" style={{display: "block"}}>
                                              {Tools.translate('PLEASE_WAIT')}
                                              <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
                                            </span>
                    )}
                </button>
            </div>
            {/* end::Action */}

            <div className="position-relative d-flex align-items-center justify-content-center text-gray-500 fw-semibold fs-6">
                <button
                    onClick={() => {
                        toggleDirection();
                        window.location.reload();
                    }}
                    className="btn btn-flex btn-link btn-color-gray-700 btn-active-color-primary fs-base position-absolute start-0"
                >
                    <img
                        className="w-20px h-20px rounded mx-2"
                        src={isArabic ? usFlag : saudiFlag}
                        alt=""
                    />
                    <span>{isArabic ? Tools.translate('ENGLISH') : Tools.translate('ARABIC')}</span>
                </button>

                <div>
                    {Tools.translate('BECOME_A_TRAINEE')}{" "}
                    <Link to="/auth/singup"  className="link-primary">
                        {Tools.translate('SIGN_UP')}
                    </Link>
                </div>
            </div>
        </form>


    )
}
export default Login;