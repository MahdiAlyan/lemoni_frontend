import React from "react";
import * as Yup from "yup";
import {useState} from "react";
import clsx from "clsx";
import {Link} from "react-router-dom";
import {useFormik} from "formik";
import {RequestForgotPassword} from "../../calls/Api";
import Tools from "../../config/Tools";
import Auth from "../../config/Auth";
import {toast} from "react-toastify";

const initialValues = {
    email: "",
};

const forgotPasswordSchema = Yup.object().shape({
    email: Yup.string()
        .email("Wrong email format")
        .max(50, "Maximum 50 symbols")
        .required(Tools.translate('EMAIL_IS_REQUIRED')),
});

export function ForgotPassword() {
    const [loading, setLoading] = useState(false);
    const [hasErrors, setHasErrors] = useState(undefined);
    const [result, setResult] = useState(undefined);

    const formik = useFormik({
        initialValues,
        validationSchema: forgotPasswordSchema,
        onSubmit: (values, {setStatus, setSubmitting, resetForm}) => {
            setLoading(true);
            setHasErrors(undefined);

            let reset_password_data = {
                username: values.email
            }

            RequestForgotPassword(reset_password_data).then(response => {
                Tools.checkResponseStatus(response, () => {
                    setHasErrors(false);
                    setResult(true);
                    setLoading(false);
                    resetForm();
                    setSubmitting(false);
                    setStatus(`${Tools.translate('PASSWORD_RESET_LINK_SENT')} ${values.email}`);
                }, () => {
                    toastr.error('ERROR_OCCURRED');
                });
            }).catch((error) => {
                setResult(false);
                setLoading(false);
                setHasErrors(true);
                setSubmitting(false);
                if (error.response && error.response.data) {
                    if (error.response.data.detail) {
                        setStatus(error.response.data.detail);
                    } else if (error.response.data.email) {
                        setStatus(error.response.data.email);
                    }
                } else {
                    setStatus("Something went wrong! Please try again.");
                }
            }).finally(() => {
                setLoading(false);

            })


        },
    });

    return (
        <form
            className="form w-100 fv-plugins-bootstrap5 fv-plugins-framework"
            noValidate
            id="kt_login_password_reset_form"
            onSubmit={formik.handleSubmit}>
            <div className="text-center mb-5">
                {/* begin::Title */}
                <h1 className="text-white fw-bolder mb-10">{Tools.translate('FORGOT_PASSWORD')}</h1>
                {/* end::Title */}

                <div className="text-center mb-10">
                    <img
                        alt="Logo"
                        className="mh-125px"
                        // eslint-disable-next-line no-undef
                        src="../../assets/media/icons/reset-password.png"
                    />
                </div>

                {/* begin::Link */}
                {result !== true && (
                    <div className="text-gray-500 fw-semibold fs-6">
                        {Tools.translate('ENTER_YOUR_EMAIL_TO_RESET')}
                    </div>
                )}

                {/* end::Link */}
            </div>

            {/* begin::Title */}
            {hasErrors === true && formik.status && (
                <div className="text-center alert alert-danger">
                    <div className="alert-text font-weight-bold">{formik.status}</div>
                </div>
            )}

            {hasErrors === false && formik.status && (
                <div className="mb-10 bg-light-success p-8 rounded">
                    <div className="text-success">{formik.status}</div>
                </div>
            )}
            {/* end::Title */}

            {/* begin::Form group */}
            {result !== true && (
                <div className="fv-row mb-8">
                    <label className="form-label fw-bolder text-white fs-6">
                        {Tools.translate('EMAIL')}
                    </label>
                    <input
                        type="email"
                        placeholder={Tools.translate('EMAIL')}
                        autoComplete="off"
                        {...formik.getFieldProps("email")}
                        className={clsx(
                            "form-control bg-transparent",
                            {"is-invalid": formik.touched.email && formik.errors.email},
                            {
                                "is-valid": formik.touched.email && !formik.errors.email,
                            }
                        )}
                    />
                    {formik.touched.email && formik.errors.email && (
                        <div className="fv-plugins-message-container">
                            <div className="fv-help-block">
                                <span role="alert">{formik.errors.email}</span>
                            </div>
                        </div>
                    )}
                </div>
            )}
            {/* end::Form group */}

            {/* begin::Form group */}
            <div className="d-flex flex-wrap justify-content-center pb-lg-0">
                {result !== true && (
                    <button
                        type="submit"
                        id="kt_password_reset_submit"
                        className="btn btn-gold me-4 ms-2  text-gray-900"
                        disabled={formik.isSubmitting || !formik.isValid}
                    >
                        {!loading && <span className="indicator-label">{Tools.translate('SUBMIT')}</span>}
                        {loading && (
                            <span className="indicator-progress" style={{display: "block"}}>
                                {Tools.translate('PLEASE_WAIT')}
                                <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
                            </span>
                        )}
                    </button>
                )}
                <Link to="/">
                    <button
                        type="button"
                        id="kt_login_password_reset_form_cancel_button"
                        className="btn btn-light"
                        disabled={formik.isSubmitting || !formik.isValid}
                    >
                        {result !== true ? Tools.translate('CANCEL') : Tools.translate('BACK_TO_LOGIN')}
                    </button>
                </Link>{" "}
            </div>
            {/* end::Form group */}
        </form>
    );
}
