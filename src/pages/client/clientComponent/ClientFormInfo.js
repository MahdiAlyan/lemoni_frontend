import React, {Fragment, useEffect, useState} from 'react';
import clsx from "clsx";
import {useFormik} from "formik";
import {getClient, submitClient, listNationalities} from "../../../calls/Api";
import Tools from "../../../config/Tools";
import * as Yup from "yup";
import {useSearchParams} from "react-router-dom";
import Auth from "../../../config/Auth";

const ClientFormInfo = ({selectedClient, onClientUpdate}) => {
    const [loading, setLoading] = useState(false);
    const [nationalities, setNationalities] = useState([]);
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        if (selectedClient) {
            setOriginalValues(selectedClient);
        }
    }, [selectedClient]);

    const [originalValues, setOriginalValues] = useState({
        first_name: '',
        last_name: '',
        date_of_birth: '',
        gender: '',
        height: '',
        weight: '',
        phone_number: '',
        emergency_contact: '',
        public_id: '',
        nationality: '',
        national_id: '',
        governmental_id: '',
    });

    const validationSchema = Yup.object().shape({
        first_name: Yup.string().required(Tools.translate('FIRST_NAME_REQUIRED')),
        last_name: Yup.string().required(Tools.translate('LAST_NAME_REQUIRED')),
        date_of_birth: Yup.date().required(Tools.translate('DATE_OF_BIRTH_REQUIRED')),
        gender: Yup.string()
            .oneOf(["MALE", "FEMALE"], "Gender is required")
            .required(Tools.translate('GENDER_REQUIRED')),
        phone_number: Yup.string()
            .required(Tools.translate('PHONE_REQUIRED'))
            .test('isValidPhone', Tools.translate('INVALID_PHONE_NUMBER_FORMAT'), function (value) {
                if (!value) return false; // Handle required case
                return Tools.phoneRegExp.test(value);
            }),
        emergency_contact: Yup.string()
            .required(Tools.translate('PHONE_REQUIRED'))
            .test('isValidPhone', Tools.translate('INVALID_PHONE_NUMBER_FORMAT'), function (value) {
                if (!value) return false; // Handle required case
                return Tools.phoneRegExp.test(value);
            }),
        nationality: Yup.string().required(Tools.translate('NATIONALITY_REQUIRED')),
        governmental_id: Yup.string().notRequired(),
        national_id: Yup.string().notRequired(),
    });

    const fetchNationalities = async () => {
        if (Auth.getUserRole() === 'CASHIER') return;
        try{
            const response = await listNationalities();

            if(response && response.data){
                setNationalities(response.data);
            }
        } catch (error){
            console.error('Error fetching nationalities', error);
            toastr.error('Error fetching nations')
        }
    }

    useEffect(()=>{
        fetchNationalities();
    }, [])

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            ...originalValues,
            nationality: originalValues.nationality?.id || '',
        },
        validationSchema,
        onSubmit: async (values, {setStatus, setSubmitting}) => {
            setLoading(true);

            try {
                if (originalValues.public_id) {
                    const updatePayload = {...formik.values};
                    delete updatePayload.last_login;
                    delete updatePayload.date_joined;
                    delete updatePayload.speciality;
                    delete updatePayload.children;

                    // Update existing client
                    const response = await submitClient(updatePayload);
                    Tools.checkResponseStatus(response, () => {
                        setOriginalValues(prev => ({
                            ...prev,
                            ...formik.values,  // Spread the updated form values
                        }));
                        if (onClientUpdate) {
                            onClientUpdate({
                                ...originalValues,
                                ...formik.values,
                            });
                        }
                        toastr.success(Tools.translate('CLIENT_UPDATED_SUCCESSFULLY'));
                    }, () => {
                        toastr.error(Tools.translate('ERROR_ON_UPDATING_CLIENT'));
                    });
                } else {
                    // Create new client
                    const response = await submitClient(formik.values);
                    Tools.checkResponseStatus(response, () => {
                        toastr.success('Client Created Successfully');

                    }, () => {
                        toastr.error('Error Creating Client');
                    });
                }
            } catch (error) {
                if (error.response && error.response.data) {
                    setStatus(error.response.data.message || "An error occurred");
                } else {
                    setStatus(Tools.translate('ERROR_ON_UPDATING_CLIENT'));
                }
            } finally {
                setSubmitting(false);
                setLoading(false);
            }
        },
    });

    useEffect(()=>{
        console.log(originalValues);
    },[originalValues]);

    useEffect(() => {
        const datepickerElement = document.getElementById('kt_datepicker_3');

        if (!datepickerElement || !formik) return;

        const datepicker = flatpickr(datepickerElement, {
            enableTime: false,
            dateFormat: "Y-m-d",
            time_24hr: false,
            disableMobile: true,
            static: true,
            position: "above",
            clickOpens: true,
            allowInput: false,
            maxDate: "today",
            closeOnClickOutside: false, // Add this to prevent immediate closing
            onOpen: function (selectedDates, dateStr, instance) {
                // Adjust position
                setTimeout(() => {
                    instance.calendarContainer.style.top = 'auto';
                    instance.calendarContainer.style.bottom = '100%';
                }, 10);
            },
            onChange: function (selectedDates, dateStr) {
                formik.setFieldValue('date_of_birth', dateStr);
            },
            defaultDate: formik.values.date_of_birth || null,
            onReady: function () {
                // Mobile adjustments
                if (window.innerWidth <= 767) {
                    const calendar = this.calendarContainer;
                    calendar.style.width = '100%';
                    calendar.style.maxWidth = '320px';
                    calendar.style.left = '50%';
                    calendar.style.transform = 'translateX(-50%)';
                    calendar.style.zIndex = '999999';
                }
            }
        });

        return () => {
            if (datepicker && datepicker.destroy) {
                datepicker.destroy();
            }
        };
    }, []);

    useEffect(() => {
        const modalElement = document.getElementById('client_modal');

        // Initialize Select2
        const initializeSelect2 = (selector, options) => {
            const $select = $(selector);

            if ($select.hasClass('select2-hidden-accessible')) {
                $select.select2('destroy');
            }

            $select.select2({
                ...options,
                dropdownParent: $("#client_modal_form .modal-body"),
                dropdownCssClass: 'select2-dropdown-modal'
            });

            return $select;
        };

        const nationalitySelect = initializeSelect2("#nationalitySelect", {
            placeholder: Tools.translate('NATIONALIY'),
            allowClear: false,
            multiple: false,
            width: "100%"
        });

        // Set initial values
        if (formik.values.nationality) {
            nationalitySelect.val(formik.values.nationality).trigger('change');
        }

        // Handle changes
        const handleSelectChange = function (e) {
            const value = $(this).val();
            formik.setFieldTouched('nationality', true, false);
            formik.setFieldValue("nationality", value, true);
            setTimeout(() => formik.validateField("nationality"), 0);
        };

        nationalitySelect.on("change", handleSelectChange);

        // Handle modal hidden event
        const handleModalHidden = () => {

            nationalitySelect.val(null).trigger('change');

            formik.setErrors({});
            formik.setTouched({});

            formik.setFieldError('nationality', undefined);
            formik.setFieldTouched('nationality', false);
        };

        if (modalElement) {
            modalElement.addEventListener('hidden.bs.modal', handleModalHidden);
        }

        return () => {
            nationalitySelect.off("change", handleSelectChange).select2('destroy');
            if (modalElement) {
                modalElement.removeEventListener('hidden.bs.modal', handleModalHidden);
            }
        };
    }, [formik, nationalities]);

    //#region JSX
    return (
        <Fragment>
            <form className='form' onSubmit={formik.handleSubmit} id='client_modal_form' noValidate>
                {/* <!--begin::Modal body--> */}
                <div className='modal-body py-10 px-lg-17'>
                    <div id='client_modal_info' className='collapse show'>
                        <div className='row mb-3 col-12'>
                            <div className=' mb-3 col-6'>
                                <label className='col-12 col-form-label required fw-bold fs-6'>
                                    {Tools.translate('FIRST_NAME')}
                                </label>
                                <input type='text' placeholder='First Name'
                                       {...formik.getFieldProps('first_name')}
                                       onChange={formik.handleChange} // Add this line!
                                       onBlur={formik.handleBlur}
                                       autoComplete="off"
                                       className={clsx('form-control bg-transparent mb-3 mb-lg-0', {
                                           'is-invalid': formik.errors.first_name,
                                       }, {
                                           'is-valid': formik.touched.first_name && !formik.errors.first_name,
                                       })}
                                />
                                {formik.touched.first_name && formik.errors.name && (
                                    <div className='fv-plugins-message-container'>
                                        <div className='fv-help-block'>{formik.errors.first_name}</div>
                                    </div>)}
                            </div>

                            <div className=' mb-3 col-6'>
                                <label className='col-12 col-form-label required fw-bold fs-6'>
                                    {Tools.translate('LAST_NAME')}
                                </label>
                                <input type='text' placeholder='Last Name'
                                       {...formik.getFieldProps('last_name')}
                                       onChange={formik.handleChange} // Add this line!
                                       onBlur={formik.handleBlur}
                                       autoComplete="off"
                                       className={clsx('form-control bg-transparent mb-3 mb-lg-0', {
                                           'is-invalid': formik.errors.last_name,
                                       }, {
                                           'is-valid': formik.touched.last_name && !formik.errors.last_name,
                                       })}
                                />
                                {formik.touched.last_name && formik.errors.last_name && (
                                    <div className='fv-plugins-message-container'>
                                        <div className='fv-help-block'>{formik.errors.last_name}</div>
                                    </div>)}
                            </div>
                        </div>

                        <div className='row mb-3 col-12'>
                            <div className="mb-3 col-6">
                                <label className="col-12 col-form-label required fw-bold fs-6">
                                    {Tools.translate('DATE_OF_BIRTH')}
                                </label>
                                <input type="text" placeholder="Date Of Birth" id="kt_datepicker_3"
                                       value={formik.values.date_of_birth || ''}
                                       {...formik.getFieldProps("date_of_birth")}
                                       className={clsx("form-control bg-transparent mb-3 mb-lg-0 datetime-picker", {"is-invalid": formik.touched.date_of_birth && formik.errors.date_of_birth}, {"is-valid": formik.touched.date_of_birth && !formik.errors.date_of_birth})}
                                       readOnly
                                />
                                {formik.touched.date_of_birth && formik.errors.date_of_birth && (
                                    <div className="fv-plugins-message-container">
                                        <div className="fv-help-block">{formik.errors.date_of_birth}</div>
                                    </div>)}
                            </div>

                            <div className="mb-3 col-6">
                                <label className="col-12 col-form-label required fw-bold fs-6">
                                    {Tools.translate('GENDER')}
                                </label>
                                <select
                                    {...formik.getFieldProps("gender")}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className={clsx("form-select bg-transparent form-select-lg", {
                                        "is-invalid": formik.touched.gender && formik.errors.gender,
                                    }, {
                                        "is-valid": formik.touched.gender && !formik.errors.gender,
                                    })}
                                >
                                    <option value="">Select Gender</option>
                                    <option key="MALE" value="MALE">MALE</option>
                                    <option key="FEMALE" value="FEMALE">FEMALE</option>
                                </select>
                            </div>
                        </div>

                        <div className='row mb-3 col-12'>
                            <div className=' mb-3 col-6'>
                                <label className='col-12 col-form-label required fw-bold fs-6'>
                                    {Tools.translate('HEIGHT')}
                                </label>
                                <input type='number' placeholder='Height'
                                       {...formik.getFieldProps('height')}
                                       onChange={formik.handleChange} // Add this line!
                                       onBlur={formik.handleBlur}
                                       className={clsx('form-control bg-transparent mb-3 mb-lg-0', {
                                           'is-invalid': formik.errors.height,
                                       }, {
                                           'is-valid': formik.touched.height && !formik.errors.height,
                                       })}
                                />
                                {formik.touched.height && formik.errors.height && (
                                    <div className='fv-plugins-message-container'>
                                        <div className='fv-help-block'>{formik.errors.height}</div>
                                    </div>)}
                            </div>
                            <div className=' mb-3 col-6'>
                                <label className='col-12 col-form-label required fw-bold fs-6'>
                                    {Tools.translate('WEIGHT')}
                                </label>
                                <input type='number' placeholder='weight'
                                       {...formik.getFieldProps('weight')}
                                       onChange={formik.handleChange}
                                       onBlur={formik.handleBlur}
                                       className={clsx('form-control bg-transparent mb-3 mb-lg-0', {
                                           'is-invalid': formik.errors.weight,
                                       }, {
                                           'is-valid': formik.touched.weight && !formik.errors.weight,
                                       })}
                                />
                                {formik.touched.weight && formik.errors.weight && (
                                    <div className='fv-plugins-message-container'>
                                        <div className='fv-help-block'>{formik.errors.weight}</div>
                                    </div>)}
                            </div>

                            <input type='text' id="public_id" hidden={true} disabled={true}
                                   {...formik.getFieldProps('public_id')}/>

                        </div>

                        <div className='row mb-3 col-12'>

                            <div className=' mb-3 col-6'>
                                <label className='col-12 col-form-label required fw-bold fs-6'>
                                    {Tools.translate('PHONE_NUMBER')}
                                </label>
                                {/*<span style={{color: 'grey', margin: '5px'}}>*/}
                                {/*    +966*/}
                                {/*</span>*/}
                                <input
                                    // style={{
                                    //     border: 'none',
                                    //     flex: 1, // Ensures the input takes up the remaining space
                                    // }}
                                    placeholder='Phone Number'
                                    type='number'
                                    autoComplete='off'
                                    {...formik.getFieldProps('phone_number')}
                                    className={clsx('form-control bg-transparent', {
                                        'is-invalid': formik.touched.phone_number && formik.errors.phone_number,
                                    }, {
                                        'is-valid': formik.touched.phone_number && !formik.errors.phone_number,
                                    })}
                                />
                                {formik.touched.phone_number && formik.errors.phone_number && (
                                    <div className='fv-plugins-message-container'>
                                        <div className='fv-help-block'>
                                            <span role='alert'>{formik.errors.phone_number}</span>
                                        </div>
                                    </div>)}
                            </div>

                            <div className=' mb-3 col-6'>
                                <label className='col-12 col-form-label required fw-bold fs-6'>
                                    {Tools.translate('EMERGENCY_CONTACT')}
                                </label>
                                <input type='number' placeholder='Emergency Contact'
                                       {...formik.getFieldProps('emergency_contact')}
                                       onChange={formik.handleChange}
                                       onBlur={formik.handleBlur}
                                       className={clsx('form-control bg-transparent mb-3 mb-lg-0', {
                                           'is-invalid': formik.errors.emergency_contact,
                                       }, {
                                           'is-valid': formik.touched.emergency_contact && !formik.errors.emergency_contact,
                                       })}
                                />
                                {formik.touched.emergency_contact && formik.errors.emergency_contact && (
                                    <div className='fv-plugins-message-container'>
                                        <div className='fv-help-block'>{formik.errors.emergency_contact}</div>
                                    </div>)}
                            </div>
                        </div>
                        <div className='row mb-3 col-12'>
                            <div className="col-md-6">
                                <label className="col-lg-12 col-form-label fw-bold fs-6 required">{Tools.translate('NATIONALIY')}</label>
                                <select
                                    className={clsx(
                                        "form-select",
                                        {
                                            "is-invalid": formik.touched.nationality && formik.errors.nationality,
                                        },
                                        {
                                            "is-valid": formik.touched.nationality && !formik.errors.nationality,
                                        }
                                    )}
                                    id="nationalitySelect"
                                    name="nationality"
                                >
                                    <option></option>
                                    {nationalities && nationalities.map(ap => (
                                        <option key={ap.id} value={ap.id}>
                                            {ap.country}
                                        </option>
                                    ))}
                                </select>
                                {formik.touched.nationality && formik.errors.nationality && (
                                    <div className="fv-plugins-message-container">
                                        <div className="fv-help-block">
                                            {formik.errors.nationality}
                                        </div>
                                    </div>
                                )}
                            </div>
                            {formik.values.governmental_id ? (
                                <div className="col-md-6">
                                    <label className="col-12 col-form-label required fw-bold fs-6">
                                        {Tools.translate('GOVERNMENTAL_ID')}
                                    </label>
                                    <input
                                        type="text"
                                        placeholder={Tools.translate('GOVERNMENTAL_ID')}
                                        {...formik.getFieldProps("governmental_id")}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        className={clsx(
                                            "form-control bg-transparent mb-3 mb-lg-0",
                                            {
                                                "is-invalid": formik.errors.governmental_id && formik.touched.governmental_id,
                                            },
                                            {
                                                "is-valid":
                                                    formik.touched.governmental_id && !formik.errors.governmental_id,
                                            }
                                        )}
                                    />
                                    {formik.touched.governmental_id && formik.errors.governmental_id && (
                                        <div className="fv-plugins-message-container">
                                            <div className="fv-help-block">
                                                {formik.errors.governmental_id}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                    <div className=" mb-3 col-md-6">
                                        <label className="col-12 col-form-label required fw-bold fs-6">
                                            {Tools.translate('NATIONAL_ID')}
                                        </label>
                                        <input
                                            type="text"
                                            placeholder={Tools.translate('NATIONAL_ID')}
                                            {...formik.getFieldProps("national_id")}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            className={clsx(
                                                "form-control bg-transparent mb-3 mb-lg-0",
                                                {
                                                    "is-invalid": formik.errors.national_id && formik.touched.national_id,
                                                },
                                                {
                                                    "is-valid":
                                                        formik.touched.national_id && !formik.errors.national_id,
                                                }
                                            )}
                                        />
                                        {formik.touched.national_id && formik.errors.national_id && (
                                            <div className="fv-plugins-message-container">
                                                <div className="fv-help-block">
                                                    {formik.errors.national_id}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className='modal-footer flex-end'>

                    <button
                        type='submit'
                        className='btn btn-primary'
                        disabled={!formik.isValid || formik.isSubmitting || formik.values.name === ''}
                        data-kt-users-modal-action='submit'>
                        {loading ? (<span className=''>
                                          {Tools.translate('PLEASE_WAIT')}
                                          <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                                    </span>) : (<span className='indicator-label'>{Tools.translate('SUBMIT')}</span>)}
                    </button>
                </div>
            </form>

        </Fragment>

    );
};

export default ClientFormInfo;
