import React, { useState, useEffect, useContext } from 'react';
import Tools from '../../config/Tools';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useNavigate, useLocation } from 'react-router-dom';
import { changePasswordByUsername } from '../../calls/Api';
import { ListLoader } from '../../shared/ListLoader';
import Auth from '../../config/Auth';
import '../../assets/js/widgets.bundle';
import '../../assets/js/custom/widgets';
import { AuthContext } from '../../contexts/AuthContext';


export const UserProfile = () => {
  const passwordRegExp = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  const [initials, setInitials] = useState('');
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [showPasswordToggle, setShowPasswordToggle] = useState(false);
  const [userData, setUserData] = useState({});
  const direction = localStorage.getItem('appDirection') || 'ltr';

  const [originalValues, setOriginalValues] = useState({
    password: '',
    confirmpassword: '',
  });

  useEffect(() => {
    if (user) {
      setUserData(user);
    }
  }, [user]);

  useEffect(() => {
    // Check if we need to show our custom toggle
    setShowPasswordToggle(!Tools.hasNativePasswordToggle());
  }, []);

  const validationSchema = Yup.object().shape({
    password: Yup.string()
      .min(8, 'Minimum 8 symbols')
      .max(50, 'Maximum 50 symbols')
      .matches(
        passwordRegExp,
        'Use 8 or more characters with a mix of letters, 1 uppercase letter, numbers, and a special symbol.'
      )
      .required('Password is required'),

    confirmpassword: Yup.string()
      .oneOf([Yup.ref('password')], 'Passwords must match')
      .required('Password confirmation is required'),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: originalValues,
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setLoading(true);
      let newPassword = values.password;
      try {
        if (userData) {
          await changePasswordByUsername(user.username, newPassword);
          toastr.success(Tools.translate('UPDATED_SUCCESSFULLY'));
        }
      } catch (error) {
        setSubmitting(false);
        setLoading(false);
        toastr.error(Tools.translate('UPDATE_FAILED'));
      } finally {
        const closeButton = document.getElementById('close-modal');
        if (closeButton) {
          closeButton.click();
        }
        setLoading(false);
        setSubmitting(false);
      }
    },
  });
  const evaluatePasswordStrength = (password) => {
    if (!password) {
      setPasswordStrength('');
      return;
    }

    if (password.length < 8) {
      setPasswordStrength('Too Short');
      return;
    }

    // Strong: At least one uppercase letter, one number, and one special character
    const strongRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (strongRegex.test(password)) {
      setPasswordStrength('Strong');
      return;
    }

    // Medium: At least one uppercase letter and one number (no special character required)
    const mediumRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
    if (mediumRegex.test(password)) {
      setPasswordStrength('Medium');
      return;
    }

    // Weak: All other passwords of at least 8 characters
    setPasswordStrength('Weak');
  };
  const resetPasswordMeter = () => {
    // Select the Password Meter element
    var passwordMeterElement = document.querySelector('[data-kt-password-meter="true"]');
    if (!passwordMeterElement) {
      console.error('Password Meter element not found.');
      return;
    }

    // Get the Password Meter instance
    var passwordMeter = window.KTPasswordMeter.getInstance(passwordMeterElement);

    if (passwordMeter) {
      passwordMeter.reset(); // Reset the password meter
    } else {
      console.error('Password Meter instance not found for the selected element.');
    }
  };
  const resetChangePasswordForm = () => {
    formik.resetForm();
    setPasswordStrength('');
    originalValues.confirmpassword = '';
    resetPasswordMeter();
  };

  useEffect(() => {
    const modalElement = document.getElementById('kt_modal_1');

    // Define the event handler
    const handleModalHidden = () => {
      resetChangePasswordForm();
    };

    if (modalElement) {
      modalElement.addEventListener('hidden.bs.modal', handleModalHidden);
    }

    // Clean up the event listener on component unmount
    return () => {
      if (modalElement) {
        modalElement.removeEventListener('hidden.bs.modal', handleModalHidden);
      }
    };
  }, [originalValues]);

  useEffect(() => {
    setInitials(Tools.getInitials2(userData.first_name, userData.last_name || userData.username));
  }, [userData]);

  useEffect(()=>{
    console.log(formik.errors);
  },[formik.errors])

  return (
    <>
      <div className='d-flex flex-column flex-lg-row'>
        <div className='flex-column flex-lg-row-auto w-lg-250px w-xl-350px mb-10'>
          <div className='card mb-5 mb-xl-8'>
            <div className='card-body'>
              <div className='d-flex flex-center flex-column py-5'>
                <div className='symbol symbol-100px symbol-circle mb-7'>
                  <span className='symbol-label fs-2x fw-semibold text-primary bg-light-primary'>
                    {initials}
                  </span>
                </div>

                <div className='fs-3 text-gray-800 text-hover-primary fw-bold mb-3'>
                  {userData.first_name} {userData.last_name}
                </div>
                <div className='mb-9'>
                  <div className='badge badge-lg badge-light-primary d-inline'>{userData.role}</div>
                </div>
              </div>
              <div className='d-flex flex-stack fs-4 py-3'>
                <div
                  className='fw-bold rotate collapsible'
                  href='#kt_user_view_details'
                  aria-expanded='false'
                  aria-controls='kt_user_view_details'>
                  {Tools.translate('INFORMATION')}
                </div>
              </div>
              <div className='separator'></div>
              <div id='kt_user_view_details' className='collapse show'>
                <div className='pb-5 fs-6'>
                  <div className='fw-bold mt-5'>{Tools.translate('EMAIL')}</div>

                  <div className='text-gray-600'>
                    <div className='text-gray-600 text-hover-primary'>
                      {userData.username}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='flex-lg-row-fluid ms-lg-15'>
          <ul className='nav nav-custom nav-tabs nav-line-tabs nav-line-tabs-2x border-0 fs-4 fw-semibold mb-8'>
            <li className='nav-item' role='presentation'>
              <a
                className='nav-link text-active-primary pb-4 active'
                data-kt-countup-tabs='true'
                data-bs-toggle='tab'
                data-kt-initialized='1'
                aria-selected='true'
                role='tab'
                href='#kt_user_view_overview_security'>
                {Tools.translate('SECURITY')}
              </a>
            </li>
          </ul>
          <div className='tab-content' id='myTabContent'>
            <div
              className='tab-pane fade active show me-10'
              id='kt_user_view_overview_security'
              role='tabpanel'>
              <div className='card pt-4 mb-6 mb-xl-9'>
                <div className='card-header border-0'>
                  <div className='card-title'>
                    <h2>{Tools.translate('MY_PROFILE')}</h2>
                  </div>
                </div>
                <div className='card-body pt-0 pb-5'>
                  <div className='table-responsive'>
                    <table
                      className='table align-middle table-row-dashed gy-5'
                      id='kt_table_users_login_session'>
                      <tbody className='fs-6 fw-semibold text-gray-600'>
                        <tr>
                          <td>{Tools.translate('USERNAME')}</td>
                          <td>{userData.username}</td>
                        </tr>
                        <tr>
                          <td>{Tools.translate('PASSWORD')}</td>
                          <td>******</td>

                          <td className='text-end'>
                            <button
                              type='button'
                              className='btn btn-icon btn-primary w-30px h-30px ms-auto'
                              data-bs-toggle='modal'
                              data-bs-target='#kt_modal_1'>
                              <i
                                className='ki-solid ki-key fs-2'
                                data-bs-toggle='tooltip'
                                data-bs-trigger='hover'
                                title={Tools.translate('CHANGE_PASSWORD')}
                                ></i>
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='modal fade' id='kt_modal_1' tabIndex='-1' aria-hidden='true'>
        <div className='modal-dialog modal-dialog-centered mw-650px'>
          <div className='modal-content'>
            <div className='modal-header'>
              <h2 className='fw-bold'>{Tools.translate('CHANGE_PASSWORD')}</h2>
              <div
                className='btn btn-icon btn-sm btn-active-icon-primary'
                data-bs-dismiss='modal'
                aria-label='Close'
                id='close-modal'
                onClick={() => {
                  resetChangePasswordForm();
                }}>
                <i className='ki-duotone ki-cross fs-1'>
                  <span className='path1'></span>
                  <span className='path2'></span>
                </i>
              </div>
            </div>
            <div className='modal-body scroll-y mx-5 mx-xl-15 my-7'>
              <form
                id='kt_modal_update_password_form'
                className='form'
                onSubmit={formik.handleSubmit}
                noValidate>
                <div className='mb-10 fv-row' data-kt-password-meter='true'>
                  <div className='mb-1'>
                    <label className='form-label fw-semibold fs-6 mb-2'>{Tools.translate('NEW_PASSWORD')}</label>
                    <div className='position-relative mb-3'>
                      <input
                        className={`form-control form-control-lg form-control-solid ${
                          formik.errors.password && formik.touched.password ? 'is-invalid' : ''
                        }`}
                        type={showPassword ? 'text' : 'password'}
                        placeholder=''
                        name='new_password'
                        {...formik.getFieldProps('password')}
                        onChange={(e) => {
                          formik.handleChange(e);
                          evaluatePasswordStrength(e.target.value);
                        }}
                        autoComplete='off'
                      />

                      {showPasswordToggle && (
                          <span
                              className={`btn btn-sm btn-icon position-absolute translate-middle top-50 ${direction === 'rtl' ? 'start-0 ms-15' : 'end-0 me-5'}`}
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
                    {formik.errors.password && formik.touched.password && (
                      <div className='fv-plugins-message-container'>
                        <div className='fv-help-block'>
                          <span role='alert'>{formik.errors.password}</span>
                        </div>
                      </div>
                    )}
                    <div
                      className='d-flex align-items-center mb-3 active'
                      data-kt-password-meter-control='highlight'>
                      <div className='flex-grow-1 bg-secondary bg-active-success rounded h-5px me-2'></div>
                      <div className='flex-grow-1 bg-secondary bg-active-success rounded h-5px me-2'></div>
                      <div className='flex-grow-1 bg-secondary bg-active-success rounded h-5px me-2'></div>
                      <div className='flex-grow-1 bg-secondary bg-active-success rounded h-5px'></div>
                    </div>
                  </div>
                  <div className='text-muted'>
                    {Tools.translate('PASSWORD_EXCEPTIONS')}
                  </div>
                </div>

                <div className='fv-row mb-10'>
                  <label className='form-label fw-semibold fs-6 mb-2'>{Tools.translate('CONFIRM_NEW_PASSWORD')}</label>
                  <div className='position-relative mb-3'>
                  <input type={showPassword2 ? 'text' : 'password'}
                    className={`form-control form-control-lg form-control-solid ${
                      formik.errors.confirmpassword && formik.touched.confirmpassword
                        ? 'is-invalid'
                        : ''
                    }`}
                    name='confirm_password'
                    {...formik.getFieldProps('confirmpassword')}
                    autoComplete='off'
                  />
                    {showPasswordToggle && (
                        <span
                            className={`btn btn-sm btn-icon position-absolute translate-middle top-50 ${direction === 'rtl' ? 'start-0 ms-15' : 'end-0 me-5'}`}
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
                      <div className="fv-plugins-message-container">
                        <div className="fv-help-block">
                          {formik.errors.confirmpassword}
                        </div>
                      </div>
                  )}
                </div>
                <div className='modal-footer flex-end pt-15'>
                  <button
                    type='reset'
                    className='btn btn-light me-3'
                    data-bs-dismiss='modal'
                    onClick={() => {
                      resetChangePasswordForm();
                    }}>
                    {Tools.translate('DISCARD')}
                  </button>
                  <button
                    type='submit'
                    className='btn btn-primary'
                    disabled={
                      formik.isSubmitting ||
                      !formik.isValid ||
                      !formik.dirty ||
                      loading ||
                      passwordStrength === 'Weak'
                    }
                    aria-label='close'>
                    <span className='indicator-label'>{Tools.translate('SUBMIT')}</span>
                  </button>
                </div>
                {loading && <ListLoader />}

              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default UserProfile;
