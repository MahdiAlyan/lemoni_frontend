import React, {useEffect} from 'react';
import {useState} from 'react';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import clsx from 'clsx';
import {signUp} from '../../calls/Api';
import {useNavigate} from 'react-router-dom';
import Tools from "../../config/Tools";
import DateBirthInput from "./copmonents/DateBirthInput";

const phoneRegExp = /^(5)(5|0|3|6|4|9|1|8|7)([0-9]{7})$/;
const passwordRegExp = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const initialValues = {
    firstname: '',
    lastname: '',
    username: '',
    date_of_birth: '',
    gender: '',
    height: "",
    weight: '',
    emergency_contact: '',
    password: '',
    confirmpassword: '',
    phonenumber: '',
};

export function SignUp() {
    const [loading, setLoading] = useState(false);
    const [activeStep, setActiveStep] = useState(0);
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);
    const [showPasswordToggle, setShowPasswordToggle] = useState(false);
    const direction = localStorage.getItem('appDirection') || 'ltr';

    const goToPreviousStep = () => {
        setActiveStep((step) => step - 1);
    };

    const goToLogin = () => {
        navigate('/login/');
    };

    const registrationSchema = [
        Yup.object().shape({
            firstname: Yup.string().max(50, 'Maximum 50 symbols').required(Tools.translate('FIRST_NAME_REQUIRED')),
            lastname: Yup.string().max(50, 'Maximum 50 symbols').required(Tools.translate('LAST_NAME_REQUIRED')),
            phonenumber: Yup.string()
                .required(Tools.translate('PHONE_REQUIRED'))
                .test('isValidPhone', Tools.translate('INVALID_PHONE_NUMBER_FORMAT'), function (value) {
                    if (!value) return false; // Handle required case
                    return phoneRegExp.test(value);
                }),
            emergency_contact: Yup.string()
                .required(Tools.translate('EMERGENCY_REQUIRED'))
                .test('isValidPhone', Tools.translate('INVALID_PHONE_NUMBER_FORMAT'), function (value) {
                    if (!value) return false; // Handle required case
                    return phoneRegExp.test(value);
                }),
            date_of_birth: Yup.date()
                .required(Tools.translate('DATE_OF_BIRTH_REQUIRED')),
            gender: Yup.string()
                .oneOf(["MALE", "FEMALE"], "Gender is required")
                .required(Tools.translate('GENDER_REQUIRED')),
            height: Yup.number()
                .required(Tools.translate('HEIGHT_REQUIRED')) // Required field
                .typeError('Height must be a number') // Ensures it is a number
                .positive('Height must be positive') // Must be positive
                .integer('Height must be an integer'),
            weight: Yup.number()
                .required(Tools.translate('WEIGHT_REQUIRED')) // Required field
                .typeError('Weight must be a number') // Ensures it is a number
                .positive('Weight must be positive') // Must be positive
                .integer('Weight must be an integer'),
        }),
        Yup.object().shape({
            username: Yup.string()
                .email(Tools.translate('WRONG_EMAIL_FORMAT'))
                .max(50, 'Maximum 50 symbols')
                .required(Tools.translate('EMAIL_IS_REQUIRED')),
            password: Yup.string()
                .min(8, Tools.translate('MIN_EIGHT_SYMBOLS'))
                .max(50, 'Maximum 50 symbols')
                .matches(
                    passwordRegExp,
                    Tools.translate('PASSWORD_REGEX')
                )
                .required(Tools.translate('PASSWORD_IS_REQUIRED')),
            confirmpassword: Yup.string()
                .min(8, Tools.translate('MIN_EIGHT_SYMBOLS'))
                .max(50, 'Maximum 50 symbols')
                .matches(
                    passwordRegExp,
                    Tools.translate('PASSWORD_REGEX')
                )
                .required(Tools.translate('CONFIRM_PASSWORD_REQUIRED'))
                .oneOf([Yup.ref('password')], Tools.translate('CONFIRM_PASSWORD_MATCHING')),
        }),
    ];

    useEffect(() => {
        // Check if we need to show our custom toggle
        setShowPasswordToggle(!Tools.hasNativePasswordToggle());
    }, []);

    const formik = useFormik({
        initialValues,
        validationSchema: registrationSchema[activeStep],
        onSubmit: (values, {setStatus, setSubmitting}) => {
            if (activeStep == 1) {
                setLoading(true);
                try {
                    let signup_data = {
                        username: values.username,
                        first_name: values.firstname,
                        last_name: values.lastname,
                        password: values.password,
                        phone_number: values.phonenumber,
                        emergency_contact: values.emergency_contact,
                        date_of_birth: values.date_of_birth,
                        gender: values.gender,
                        height: values.height,
                        weight: values.weight,
                    }


                    signUp(signup_data).then(response => {
                        Tools.checkResponseStatus(response, () => {
                            navigate('/auth/registration-success', {
                                state: {email: values.email},
                            });
                        }, () => {
                            setSubmitting(false);
                            setLoading(false);
                            if (response.data.error)
                                toastr.error(response.data.error);
                            else toastr.error(Tools.translate('ERROR_WHILE_SIGNING_UP'))
                        });
                    }).catch((error) => {
                        if (error.response?.data?.ERROR === 'USERNAME_ALREADY_EXISTS') {
                            setStatus(Tools.translate('THIS_EMAIL_ALREADY_EXISTS'));
                            toastr.error(Tools.translate('THIS_EMAIL_ALREADY_EXISTS'));
                        } else {
                            setStatus(Tools.translate('ERROR_WHILE_SIGNING_UP'));
                            toastr.error(Tools.translate('ERROR_WHILE_SIGNING_UP'));
                        }
                        setSubmitting(false);
                        setLoading(false);
                    }).finally(() => {
                    })


                } catch (error) {
                    if (
                        error.response &&
                        error.response.data &&
                        error.response.data.user &&
                        error.response.data.user.username
                    ) {
                        setStatus(error.response.data.user.username);
                    } else {
                        setStatus('The registration details are incorrect');
                    }

                    setSubmitting(false);
                    setLoading(false);
                }
            } else {
                setActiveStep((step) => step + 1);
                // setTouched to false
                formik.setTouched({});
                formik.setSubmitting(false);
                setTimeout(() => {
                    KTPasswordMeter.createInstances();
                }, 1000);
            }
        },
    });

    return (
        <form
            className='form w-100 fv-plugins-bootstrap5 fv-plugins-framework'
            noValidate
            id='kt_login_signup_form'
            onSubmit={formik.handleSubmit}>
            {/* begin::Heading */}
            <div className='text-center mb-5'>
                {/* begin::Title */}
                <h1 className='text-white fw-bolder mb-3'>{Tools.translate('SIGN_UP')}</h1>
                {/* end::Title */}
            </div>
            {/* end::Heading */}

            <div className='stepper stepper-links d-flex flex-column' id='kt_create_account_stepper'>
                <div className='stepper-nav mb-5 flex-nowrap'>
                    <div
                        className={`stepper-item ${activeStep == 0 && 'current'}`}
                        data-kt-stepper-element='nav'>
                        <h3 className='stepper-title'>{Tools.translate('TRAINEE_INFO')}</h3>
                    </div>
                    <div
                        style={{
                            borderBottom: '1px dashed white',
                            width: '40px',
                            opacity: 0.5,
                        }}></div>
                    <div
                        className={`stepper-item ${activeStep == 1 && 'current'}`}
                        data-kt-stepper-element='nav'>
                        <h3 className='stepper-title'>{Tools.translate('ACCOUNT_INFO')}</h3>
                    </div>
                </div>
            </div>

            {formik.status && (
                <div className="alert alert-dismissible bg-light-danger d-flex flex-column flex-sm-row w-100 p-5 mb-10">
                    <i className="ki-duotone ki-message-text-2 fs-2hx text-danger me-4 mb-5 mb-sm-0"><span
                        className="path1"></span><span className="path2"></span><span className="path3"></span></i>
                    <div className="d-flex align-self-center text-danger">
                        <span>{formik.status}</span>
                    </div>
                </div>
            )}
            {activeStep == 0 ? (
                <>
                    {/* begin::Form group Firstname */}
                    <div className='row g-6 mb-6'>
                        <div className='col-md-6 fv-row'>
                            <label className='required form-label fw-bolder text-white fs-6'>{Tools.translate('FIRST_NAME')}</label>
                            <input
                                placeholder={Tools.translate('FIRST_NAME')}
                                type='text'
                                autoComplete='off'
                                {...formik.getFieldProps('firstname')}
                                className={clsx(
                                    'form-control bg-transparent',
                                    {
                                        'is-invalid': formik.touched.firstname && formik.errors.firstname,
                                    },
                                    {
                                        'is-valid': formik.touched.firstname && !formik.errors.firstname,
                                    }
                                )}
                            />
                            {formik.touched.firstname && formik.errors.firstname && (
                                <div className='fv-plugins-message-container'>
                                    <div className='fv-help-block'>
                                        <span role='alert'>{formik.errors.firstname}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* end::Form group */}
                        <div className='col-md-6 fv-row'>
                            {/* begin::Form group Lastname */}
                            <label className='required form-label fw-bolder text-white fs-6'>{Tools.translate('LAST_NAME')}</label>
                            <input
                                placeholder={Tools.translate('LAST_NAME')}
                                type='text'
                                autoComplete='off'
                                {...formik.getFieldProps('lastname')}
                                className={clsx(
                                    'form-control bg-transparent',
                                    {
                                        'is-invalid': formik.touched.lastname && formik.errors.lastname,
                                    },
                                    {
                                        'is-valid': formik.touched.lastname && !formik.errors.lastname,
                                    }
                                )}
                            />
                            {formik.touched.lastname && formik.errors.lastname && (
                                <div className='fv-plugins-message-container'>
                                    <div className='fv-help-block'>
                                        <span role='alert'>{formik.errors.lastname}</span>
                                    </div>
                                </div>
                            )}
                            {/* end::Form group */}
                        </div>
                    </div>
                    <div className='row g-6 mb-6'>
                        <div className='col-md-6 fv-row'>
                            {/* begin::Form group Lastname */}
                            <label className='required form-label fw-bolder text-white fs-6'>{Tools.translate('HEIGHT')}</label>
                            <input
                                placeholder={Tools.translate('HEIGHT')}
                                type='number'
                                autoComplete='off'
                                {...formik.getFieldProps('height')}
                                className={clsx(
                                    'form-control bg-transparent',
                                    {
                                        'is-invalid': formik.touched.height && formik.errors.height,
                                    },
                                    {
                                        'is-valid': formik.touched.height && !formik.errors.height,
                                    }
                                )}
                                onKeyDown={(e) => {
                                    if (['e', 'E', '+', '-', '.','0'].includes(e.key)) {
                                        e.preventDefault();
                                    }
                                }}
                            />
                            {formik.touched.height && formik.errors.height && (
                                <div className='fv-plugins-message-container'>
                                    <div className='fv-help-block'>
                                        <span role='alert'>{formik.errors.height}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* end::Form group */}
                        <div className='col-md-6 fv-row'>
                            <label className='required form-label fw-bolder text-white fs-6'>{Tools.translate('WEIGHT')}</label>
                            <input
                                placeholder={Tools.translate('WEIGHT')}
                                type='number'
                                autoComplete='off'
                                {...formik.getFieldProps('weight')}
                                className={clsx(
                                    'form-control bg-transparent',
                                    {
                                        'is-invalid': formik.touched.weight && formik.errors.weight,
                                    },
                                    {
                                        'is-valid': formik.touched.weight && !formik.errors.weight,
                                    }
                                )}
                                onKeyDown={(e) => {
                                    if (['e', 'E', '+', '-', '.','0'].includes(e.key)) {
                                        e.preventDefault();
                                    }
                                }}
                            />
                            {formik.touched.weight && formik.errors.weight && (
                                <div className='fv-plugins-message-container'>
                                    <div className='fv-help-block'>
                                        <span role='alert'>{formik.errors.weight}</span>
                                    </div>
                                </div>
                            )}
                            {/* end::Form group */}
                        </div>
                    </div>
                    <div className='row g-6 mb-6'>
                        <div className='col-md-6 fv-row'>
                            <label className='required form-label fw-bolder text-white fs-6'>{Tools.translate('GENDER')}</label>
                            <select
                                {...formik.getFieldProps("gender")}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={clsx(
                                    "form-select bg-transparent form-select-lg",
                                    {
                                        "is-invalid":
                                            formik.touched.gender && formik.errors.gender,
                                    },
                                    {
                                        "is-valid":
                                            formik.touched.gender && !formik.errors.gender,
                                    }
                                )}
                            >
                                <option value="">{Tools.translate('SELECT_GENDER')}</option>
                                <option key="MALE" value="MALE">
                                    MALE
                                </option>
                                <option key="FEMALE" value="FEMALE">
                                    FEMALE
                                </option>
                            </select>
                            {formik.touched.gender && formik.errors.gender && (
                                <div className="fv-plugins-message-container">
                                    <div className="fv-help-block">
                                        {formik.errors.gender}
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* end::Form group */}
                        {activeStep === 0 && <DateBirthInput formik={formik}/>}
                    </div>

                    <div className='row g-6 mb-6'>
                        <div className='fv-row col-md-6'>
                            {/* begin::Form group phone number */}
                            <label className='required form-label fw-bolder text-white fs-6'>{Tools.translate('PHONE_NUMBER')}</label>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '0 5px',
                                    backgroundClip: 'padding-box',
                                    border: `1px solid ${
                                        formik.touched.phonenumber && formik.errors.phonenumber
                                            ? 'var(--bs-form-invalid-border-color)'
                                            : 'var(--bs-gray-300)'
                                    }`,
                                    borderRadius: '0.475rem',
                                }}>
              <span
                  style={{
                      color: 'grey',
                      margin: '5px',
                  }}>
                +966
              </span>
                                <input
                                    style={{
                                        border: 'none',
                                        flex: 1, // Ensures the input takes up the remaining space
                                    }}
                                    placeholder={Tools.translate('PHONE_NUMBER')}
                                    type='tel'
                                    autoComplete='off'
                                    {...formik.getFieldProps('phonenumber')}
                                    className={clsx(
                                        'form-control bg-transparent',
                                        {
                                            'is-invalid': formik.touched.phonenumber && formik.errors.phonenumber,
                                        },
                                        {
                                            'is-valid': formik.touched.phonenumber && !formik.errors.phonenumber,
                                        }
                                    )}
                                    onKeyDown={(e) => {
                                        if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                                            e.preventDefault();
                                        }
                                    }}
                                />
                            </div>
                            {formik.touched.phonenumber && formik.errors.phonenumber && (
                                <div className='fv-plugins-message-container'>
                                    <div className='fv-help-block'>
                                        <span role='alert'>{formik.errors.phonenumber}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className='fv-row col-md-6'>
                            {/* begin::Form group phone number */}
                            <label className='required form-label fw-bolder text-white fs-6'>{Tools.translate('EMERGENCY_CONTACT')}</label>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '0 5px',
                                    backgroundClip: 'padding-box',
                                    border: `1px solid ${
                                        formik.touched.emergency_contact && formik.errors.emergency_contact
                                            ? 'var(--bs-form-invalid-border-color)'
                                            : 'var(--bs-gray-300)'
                                    }`,
                                    borderRadius: '0.475rem',
                                }}>
              <span
                  style={{
                      color: 'grey',
                      margin: '5px',
                  }}>
                +966
              </span>
                                <input
                                    style={{
                                        border: 'none',
                                        flex: 1, // Ensures the input takes up the remaining space
                                    }}
                                    placeholder={Tools.translate('EMERGENCY_CONTACT')}
                                    type='tel'
                                    autoComplete='off'
                                    {...formik.getFieldProps('emergency_contact')}
                                    className={clsx(
                                        'form-control bg-transparent',
                                        {
                                            'is-invalid': formik.touched.emergency_contact && formik.errors.emergency_contact,
                                        },
                                        {
                                            'is-valid': formik.touched.emergency_contact && !formik.errors.emergency_contact,
                                        }
                                    )}
                                    onKeyDown={(e) => {
                                        if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                                            e.preventDefault();
                                        }
                                    }}
                                />
                            </div>
                            {formik.touched.emergency_contact && formik.errors.emergency_contact && (
                                <div className='fv-plugins-message-container'>
                                    <div className='fv-help-block'>
                                        <span role='alert'>{formik.errors.emergency_contact}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            ) : (
                <>
                    {/* begin::Form group Email */}
                    <div className='fv-row mb-8'>
                        <label className='required form-label fw-bolder text-white fs-6'>{Tools.translate('EMAIL')}</label>
                        <input
                            placeholder={Tools.translate('EMAIL')}
                            type='email'
                            autoComplete='off'
                            {...formik.getFieldProps('username')}
                            className={clsx(
                                'form-control bg-transparent',
                                {'is-invalid': formik.touched.username && formik.errors.username},
                                {
                                    'is-valid': formik.touched.username && !formik.errors.username,
                                }
                            )}
                        />
                        {formik.touched.username && formik.errors.username && (
                            <div className='fv-plugins-message-container'>
                                <div className='fv-help-block'>
                                    <span role='alert'>{formik.errors.username}</span>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* begin::Form group Password */}
                    <div className='fv-row mb-8' data-kt-password-meter='true'>
                        <div className='mb-1'>
                            <label className='required form-label fw-bolder text-white fs-6'>{Tools.translate('PASSWORD')}</label>
                            <div className='position-relative mb-3'>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder={Tools.translate('PASSWORD')}
                                    name='new_password'
                                    autoComplete='off'
                                    {...formik.getFieldProps('password')}
                                    className={clsx(
                                        'form-control bg-transparent',
                                        {
                                            'is-invalid': formik.touched.password && formik.errors.password,
                                        },
                                        {
                                            'is-valid': formik.touched.password && !formik.errors.password,
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
                                <div className='fv-plugins-message-container'>
                                    <div className='fv-help-block'>
                                        <span role='alert'>{formik.errors.password}</span>
                                    </div>
                                </div>
                            )}
                            {/* begin::Meter */}
                            <div
                                className='d-flex align-items-center mb-3'
                                data-kt-password-meter-control='highlight'>
                                <div className='flex-grow-1 bg-secondary bg-active-success rounded h-5px me-2'></div>
                                <div className='flex-grow-1 bg-secondary bg-active-success rounded h-5px me-2'></div>
                                <div className='flex-grow-1 bg-secondary bg-active-success rounded h-5px me-2'></div>
                                <div className='flex-grow-1 bg-secondary bg-active-success rounded h-5px'></div>
                            </div>
                            {/* end::Meter */}
                        </div>
                    </div>
                    {/* end::Form group */}

                    {/* begin::Form group Confirm password */}
                    <div className='fv-row mb-8'>
                        <label className='required form-label fw-bolder text-white fs-6'>
                           {Tools.translate('CONFIRM_NEW_PASSWORD')}
                        </label>
                        <div className='position-relative mb-1'>
                            <input
                                type={showPassword2 ? 'text' : 'password'}
                                placeholder={Tools.translate('CONFIRM_NEW_PASSWORD')}
                                autoComplete='off'
                                {...formik.getFieldProps('confirmpassword')}
                                className={clsx(
                                    'form-control bg-transparent',
                                    {
                                        'is-invalid': formik.touched.confirmpassword && formik.errors.confirmpassword,
                                    },
                                    {
                                        'is-valid': formik.touched.confirmpassword && !formik.errors.confirmpassword,
                                    }
                                )}
                            />
                            {showPasswordToggle && (
                                <span
                                    className={`btn btn-sm btn-icon position-absolute translate-middle top-50 ${direction === 'rtl' ? 'start-0 ms-5' : 'end-0 me-5'}`}
                                    onClick={() => setShowPassword2(!showPassword2)}
                                    style={{cursor: 'pointer'}}
                                >
            <i
                className={
                    showPassword2
                        ? "ki-outline ki-eye fs-2"
                        : "ki-outline ki-eye-slash fs-2"
                }
            />
          </span>
                            )}
                        </div>
                        {formik.touched.confirmpassword && formik.errors.confirmpassword && (
                            <div className='fv-plugins-message-container'>
                                <div className='fv-help-block'>
                                    <span role='alert'>{formik.errors.confirmpassword}</span>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* end::Form group */}
                </>
            )}

            <div className='d-flex flex-wrap justify-content-center pb-lg-0'>
                <button
                    type='button'
                    id='kt_sign_up_back_previous'
                    className='btn btn-light me-8 ms-2'
                    data-kt-stepper-action='previous'
                    disabled={formik.isSubmitting}
                    onClick={activeStep === 0 ? goToLogin : goToPreviousStep}>
                    {activeStep === 0 ? Tools.translate('CANCEL') : Tools.translate('BACK')}
                </button>

                <button
                    type='submit'
                    id='kt_sign_up_submit'
                    className='btn btn-gold text-gray-900 ms-2'
                    disabled={
                        // (activeStep == 0 && !formik.isValid) ||
                        activeStep == 1 && (formik.isSubmitting || !formik.isValid)
                    }>
                    {!loading && <>{activeStep == 0 ? Tools.translate('CONTINUE') : Tools.translate('SUBMIT')}</>}
                    {loading && (
                        <span className='indicator-progress' style={{display: 'block'}}>
              {Tools.translate('PLEASE_WAIT')}{' '}
                            <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
            </span>
                    )}
                </button>
            </div>
        </form>
    );
}
