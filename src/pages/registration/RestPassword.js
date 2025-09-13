import React, {useEffect} from "react";
import {useState} from "react";
import * as Yup from "yup";
import clsx from "clsx";
import {Link, useNavigate} from "react-router-dom";
import {useFormik} from "formik";
import { SubmitResetPassword} from "../../calls/Api";
import Tools from "../../config/Tools";

const passwordRegExp =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const passwordResetSchema = Yup.object().shape({
    newpassword: Yup.string()
        .min(8, Tools.translate('MIN_EIGHT_SYMBOLS'))
        .max(50, "Maximum 50 symbols")
        .matches(
            passwordRegExp,
            Tools.translate('PASSWORD_REGEX')
        )
        .required(Tools.translate('PASSWORD_IS_REQUIRED')),
    confirmnewpassword: Yup.string()
        .min(8, Tools.translate('MIN_EIGHT_SYMBOLS'))
        .max(50, "Maximum 50 symbols")
        .matches(
            passwordRegExp,
            Tools.translate('PASSWORD_REGEX')
        )
        .required(Tools.translate('CONFIRM_PASSWORD_REQUIRED'))
        .oneOf(
            [Yup.ref("newpassword")],
            Tools.translate('CONFIRM_PASSWORD_MATCHING')
        ),
});

const initialValues = {
    newpassword: "",
    confirmnewpassword: "",
};

export function ResetPassword() {

    const [uid, setUid] = useState("");
    const [token, setToken] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();
    const [result, setResult] = useState("");
    const direction = localStorage.getItem('appDirection') || 'ltr';

    useEffect(() => {
        const queryParams = Tools.getQueryParams();
        setUid(queryParams.get('uid') || 0);
        setToken(queryParams.get('token') || 0);
    }, []);

    const formik = useFormik({
        initialValues,
        validationSchema: passwordResetSchema,
        onSubmit: async (values, {setStatus, setSubmitting, resetForm}) => {
            setLoading(true);

            if (!uid || !token) {
                setStatus("Something went wrong!");
                return;
            }

            let reset_password_data = {
                token: token,
                uid: uid,
                new_password: values.newpassword,
            }

            SubmitResetPassword(reset_password_data).then(response => {
                Tools.checkResponseStatus(response, () => {
                    setResult("success");
                    resetForm();
                    setTimeout(() => {
                        navigate("/login");
                    }, 1500);
                    setSubmitting(false);
                    setLoading(false);

                }, () => {
                    toastr.error('ERROR_OCCURRED');
                });
            }).catch((error) => {
                toastr.error('Sorry ! Error Occurred');
            }).finally(() => {
                setLoading(false);

            })


        },
    });


    return (
        <form
            className="form w-100"
            onSubmit={formik.handleSubmit}
            noValidate
            id="kt_new_password_form"
        >
            <div className="text-center mb-10">
                <h1 className="text-white fw-bolder mb-3">{Tools.translate('SETUP_NEW_PASS')}</h1>
            </div>

            {/* begin::Form group */}

            {/* begin::Form group */}
            <div className="fv-row mb-8" data-kt-password-meter="true">
                <div className="fv-row mb-3">
                    <label className="required form-label fw-bolder text-white fs-6">
                        {Tools.translate('NEW_PASSWORD')}
                    </label>
                    <div className="position-relative mb-3">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder={Tools.translate('NEW_PASSWORD')}
                            autoComplete="off"
                            {...formik.getFieldProps("newpassword")}
                            className={clsx(
                                "form-control bg-transparent",
                                {
                                    "is-invalid":
                                        formik.touched.newpassword && formik.errors.newpassword,
                                },
                                {
                                    "is-valid":
                                        formik.touched.newpassword && !formik.errors.newpassword,
                                }
                            )}
                        />
                        <span
                            className={`btn btn-sm btn-icon position-absolute translate-middle top-50 ${direction === 'rtl' ? 'start-0 ms-5' : 'end-0 me-5'}`}
                            onClick={() => setShowPassword(!showPassword)}
                        >
              <i
                  className={
                      showPassword
                          ? "ki-outline ki-eye fs-2"
                          : "ki-outline ki-eye-slash fs-2"
                  }
              ></i>
            </span>
                    </div>
                    {/* begin::Meter */}
                    <div
                        className="d-flex align-items-center mb-3"
                        data-kt-password-meter-control="highlight"
                    >
                        <div className="flex-grow-1 bg-secondary bg-active-success rounded h-5px me-2"></div>
                        <div className="flex-grow-1 bg-secondary bg-active-success rounded h-5px me-2"></div>
                        <div className="flex-grow-1 bg-secondary bg-active-success rounded h-5px me-2"></div>
                        <div className="flex-grow-1 bg-secondary bg-active-success rounded h-5px"></div>
                    </div>
                    {/* end::Meter */}
                    {formik.touched.newpassword && formik.errors.newpassword && (
                        <div className="fv-plugins-message-container">
                            <div className="fv-help-block">
                                <span role="alert">{formik.errors.newpassword}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {/* Confirm Password Field */}
            <div className="fv-row mb-8">
                <label className="required form-label fw-bolder text-white fs-6">
                    {Tools.translate('CONFIRM_NEW_PASSWORD')}
                </label>
                <div className="position-relative mb-3">
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder={Tools.translate('CONFIRM_NEW_PASSWORD')}
                        autoComplete="off"
                        {...formik.getFieldProps("confirmnewpassword")}
                        className={clsx(
                            "form-control bg-transparent",
                            {
                                "is-invalid":
                                    formik.touched.confirmnewpassword &&
                                    formik.errors.confirmnewpassword,
                            },
                            {
                                "is-valid":
                                    formik.touched.confirmnewpassword &&
                                    !formik.errors.confirmnewpassword,
                            }
                        )}
                    />
                    <span
                        className={`btn btn-sm btn-icon position-absolute translate-middle top-50 ${direction === 'rtl' ? 'start-0 ms-5' : 'end-0 me-5'}`}
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
            <i
                className={
                    showConfirmPassword
                        ? "ki-outline ki-eye fs-2"
                        : "ki-outline ki-eye-slash fs-2"
                }
            ></i>
          </span>
                </div>
                {formik.touched.confirmnewpassword &&
                    formik.errors.confirmnewpassword && (
                        <div className="fv-plugins-message-container">
                            <div className="fv-help-block">
                                {formik.errors.confirmnewpassword}
                            </div>
                        </div>
                    )}
            </div>
            {/* end::Form group */}

            {/* begin::Action */}
            <div className="d-grid mb-10">
                <button
                    type="submit"
                    id="kt_reset_password_submit"
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

            <div className="text-center fw-semibold fs-5 mb-5">

                {result === "success" && (
                    <>
                        <div className="alert bg-light-success d-flex flex-column flex-sm-row p-5 mb-10 align-items-center justify-content-center">
                            <div className="d-flex flex-column align-items-center text-success">
                                <div className="text-center d-flex align-items-center">
                                    <i className="bi bi-check-circle-fill fs-2x text-success me-2"></i>
                                    <span>Password has been successfully reset.</span>
                                </div>
                            </div>
                        </div>
                        <div className="alert alert-info">
                            You can now login with your new password. Redirecting to login...
                        </div>
                    </>
                )}
                {result === "error" && (
                    <>
                        <div className="alert bg-light-danger d-flex flex-column flex-sm-row p-5 mb-10 align-items-center justify-content-center">
                            <div className="d-flex flex-column align-items-center text-danger">
                                <div className="text-center d-flex align-items-center">
                                    <i className="bi bi-exclamation-circle-fill fs-2x text-danger me-2"></i>
                                    <span>The reset password link is invalid or expired!</span>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <div className="text-gray-500 text-center fw-semibold fs-6">
                {Tools.translate('HAVE_YOU_ALREADY_RESET_YOUR_PASS')}{' '}
                <Link to="/login" className="link-primary ms-3">
                    {Tools.translate('SIGN_IN')}
                </Link>
            </div>
        </form>
    );
}
