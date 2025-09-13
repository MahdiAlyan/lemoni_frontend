import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Tools from "../../config/Tools";
import { useFormik } from "formik";
import * as Yup from "yup";
import { login } from "../../calls/Api";
import { useLocation } from "react-router-dom";

export function PrivacyAndPolicy(props) {
    const location = useLocation();
    const navigate = useNavigate();
    const { email, password } = location.state || {};
    const [loading, setLoading] = useState(false);
    const [originalValues, setOriginalValues] = useState({
        username: email || '',
        password: password || '',
        agree_to_policy: false,
    })

    const validationSchema = Yup.object().shape({
        agree_to_policy: Yup.boolean()
            .oneOf([true], 'You must accept the terms and conditions')
            .required('You must accept the terms and conditions to continue')
    });

    const formik = useFormik({
        initialValues: originalValues,
        validationSchema: validationSchema,
        onSubmit: async (values, { setStatus, setSubmitting }) => {
            setLoading(true);
            try {
                const payload = {
                    username: email,
                    password: password,
                    agree_to_policy: values.agree_to_policy ? 'True' : 'False',
                }

                const response = await login(payload);

                if (response.data?.status === "OTP_SENT") {
                    navigate("/auth/two-factor-auth", {
                        state: {
                            email: email,
                            password: password,
                            tokenExpiryTime: response.data.token_expiry_time,
                        },
                    });
                }

            } catch (error) {
                setStatus("The login details are incorrect");
                setSubmitting(false);
                setLoading(false);
            }
        },
    });

    return (
        <div
            className="d-flex flex-column justify-content-center align-items-center"
            style={{ maxWidth: '100%', minWidth: '300px' }}
            id="kt_account_review">
            <form onSubmit={formik.handleSubmit} className="w-100">
                <div className="text-center mb-5">
                    {/* <div className="text-center mb-15">
                    <img
                        alt="Welcome"
                        className="mw-125px"
                        src="../../assets/media/auth/please-verify-your-email.png"
                    />
                </div> */}
                    <div className="mb-9">
                        <h1 className="text-white">{Tools.translate('PRIVACY_AND_POLICY')}</h1>
                    </div>
                    <div className="text-muted fw-semibold fs-5 mb-5">
                        {Tools.translate('THANKS_FOR_REGISTERING')} <b>{Tools.translate('lemoni_KSA')}</b>
                    </div>
                    <div className="text-muted fw-semibold fs-5 mb-5">
                        {Tools.translate('PLEASE_READ_AND_CONTINUE')} <b>{Tools.translate('lemoni_KSA')}</b>
                    </div>

                    {/* Terms and Conditions Section */}
                    <div className="text-start bg-gray p-5 rounded mt-7" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        <h4 className="mb-4 text-white">Terms and Conditions</h4>
                        <ol className="ps-4">
                            <li className="mb-3 text-white">
                                <strong>Acceptance of Terms</strong>: By accessing and using N Fit KSA services, you agree to be bound by these terms.
                            </li>
                            <li className="mb-3 text-white">
                                <strong>Account Responsibility</strong>: You are responsible for maintaining the confidentiality of your account credentials.
                            </li>
                            <li className="mb-3 text-white">
                                <strong>Privacy Policy</strong>: Your personal data will be handled in accordance with our Privacy Policy and Saudi data protection laws.
                            </li>
                            <li className="mb-3 text-white">
                                <strong>Service Modifications</strong>: We reserve the right to modify or discontinue services at any time without notice.
                            </li>
                            <li className="mb-3 text-white">
                                <strong>User Conduct</strong>: You agree not to use the service for any unlawful purpose or in any way that might harm the platform.
                            </li>
                            <li className="mb-3 text-white">
                                <strong>Intellectual Property</strong>: All content and trademarks are the property of N Fit KSA and protected under Saudi law.
                            </li>
                            <li className="mb-3 text-white">
                                <strong>Limitation of Liability</strong>: N Fit KSA shall not be liable for any indirect, incidental, or consequential damages.
                            </li>
                            <li className="mb-3 text-white">
                                <strong>Governing Law</strong>: These terms shall be governed by and construed in accordance with the laws of Saudi Arabia.
                            </li>
                            <li className="mb-3 text-white">
                                <strong>Changes to Terms</strong>: We may revise these terms at any time by posting the amended version on our platform.
                            </li>
                            <li className="text-white">
                                <strong>Contact</strong>: For any questions regarding these terms, please contact us at legal@lemoni-ksa.com.
                            </li>
                        </ol>
                        <div className="form-check mt-5">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                id="agree_to_policy"
                                checked={formik.values.agree_to_policy}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                            <label className="form-check-label text-white" htmlFor="agree_to_policy">
                                I have read and agree to the Terms and Conditions
                            </label>
                            {formik.touched.agree_to_policy && formik.errors.agree_to_policy ? (
                                <div className="text-danger mt-1">{formik.errors.agree_to_policy}</div>
                            ) : null}
                        </div>
                    </div>
                </div>
                <div className="d-flex flex-wrap justify-content-center pb-lg-0">
                    <button
                        type="submit"
                        id="kt_back_previous"
                        className="btn btn-gold me-8 text-gray-900"
                        onSubmit={formik.handleSubmit}
                        disabled={!formik.isValid || formik.isSubmitting || !formik.dirty}
                    >
                        {loading ? (
                            <span className="">
                                {Tools.translate('PLEASE_WAIT')}
                                <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
                            </span>
                        ) : (
                            <span className="indicator-label">{Tools.translate('CONTINUE')}</span>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );

}
