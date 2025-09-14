import React, {Fragment, useEffect, useState, useRef, useCallback} from "react";
import {createRoot} from "react-dom/client";
import Auth from "../../config/Auth";
import constants from "../../common/constants";
import {useFormik} from "formik";
import clsx from "clsx";
import * as Yup from "yup";
import Tools from "../../config/Tools";
import {parseISO, format} from "date-fns";
import ClientStatusCell from "./clientComponent/ClientStatusCell";
import { useDropzone } from "react-dropzone";

const ClientList = () => {
    const [loading, setLoading] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);
    const [clientTable, setClientTable] = useState(null);
    const [nameFilter, setNameFilter] = useState("");
    const [selectedClientStatus, setSelectedClientStatus] = useState("");
    const [genderFilter, setGenderFilter] = useState("");
    const [selectedClients, setSelectedClients] = useState([]);
    const [hasSelection, setHasSelection] = useState(false);
    const selectAllRef = useRef(false);
    const selectedClientIds = useRef(new Set());
    const deselectedClientIds = useRef(new Set());
    const totalRecordsRef = useRef(0);
    const direction = localStorage.getItem('appDirection') || 'ltr';
    const [nationalities, setNationalities] = useState([]);
    const [isUploadingPdf, setIsUploadingPdf] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    // Steps data
    const steps = [Tools.translate('GENERAL'), Tools.translate('DETAILS'), Tools.translate('MEDICAL_CONDITION')];

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    // Handle closing the modal
    useEffect(() => {
        const modalElement = document.getElementById('client_modal');

        // Define the event handler
        const handleModalHidden = () => {
            formik.resetForm();
            handleModalClose();
        };

        if (modalElement) {
            modalElement.addEventListener('hidden.bs.modal', handleModalHidden);
            formik.resetForm();
        }

        // Clean up the event listener on component unmount
        return () => {
            if (modalElement) {
                modalElement.removeEventListener('hidden.bs.modal', handleModalHidden);
                formik.resetForm();
            }
        };
    }, []);

    const handleNext = async () => {
        // Validate required fields for step 0
        if (currentStep === 0) {
            let hasErrors = false;

            if (!formik.values.first_name) {
                formik.setFieldTouched("first_name", true);
                hasErrors = true;
            }

            if (!formik.values.last_name) {
                formik.setFieldTouched("last_name", true);
                hasErrors = true;
            }

            if (!formik.values.date_of_birth) {
                formik.setFieldTouched("date_of_birth", true);
                hasErrors = true;
            }

            if (!formik.values.gender) {
                formik.setFieldTouched("gender", true);
                hasErrors = true;
            }

            if (!formik.values.nationality) {
                formik.setFieldTouched("nationality", true);
                hasErrors = true;
            }

            if (!formik.values.username) {
                formik.setFieldTouched("username", true);
                hasErrors = true;
            }

            if (hasErrors) {
                toastr.error(Tools.translate('PLEASE_FILL_ALL_FIELDS'));
                return;
            }
        } else if (currentStep === 1) {
            // Validate benefits array
            let hasErrors = false;

            if (!formik.values.height) {
                formik.setFieldTouched("height", true);
                hasErrors = true;
            }

            if (!formik.values.weight) {
                formik.setFieldTouched("weight", true);
                hasErrors = true;
            }

            if (!formik.values.phone_number) {
                formik.setFieldTouched("phone_number", true);
                hasErrors = true;
            }

            if (!formik.values.emergency_contact) {
                formik.setFieldTouched("emergency_contact", true);
                hasErrors = true;
            }

            if (!formik.values.type_id) {
                formik.setFieldTouched("type_id", true);
                hasErrors = true;
            }

            if(formik.values.type_id === 'national_id'){
                if (!formik.values.national_id) {
                    formik.setFieldTouched("national_id", true);
                    hasErrors = true;
                }
            } else if (formik.values.type_id === 'governmental_id'){
                if (!formik.values.governmental_id) {
                    formik.setFieldTouched("governmental_id", true);
                    hasErrors = true;
                }
            }

            if (hasErrors) {
                toastr.error(Tools.translate('PLEASE_FILL_ALL_FIELDS'));
                return;
            }
        }

        // Proceed to next step if validation passes
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    //#region datatable
    useEffect(() => {
        // eslint-disable-next-line no-undef
        const table = $("#client_table").DataTable({
            ajax: {
                url: process.env.BaseUrl + constants.API_URLS.CLIENTS_LIST,
                type: "GET",
                headers: {
                    authorization: "Bearer " + Auth.getAccessToken(),
                },
                error: function (xhr, error, thrown) {
                    if (xhr.status === 401) {
                        // Immediately clear tokens and redirect
                        localStorage.removeItem('access-token');
                        localStorage.removeItem('refresh-token');

                        window.location.href = '/login?session_expired=1';
                    } else {
                        console.error("Ajax error:", xhr.responseText);
                    }
                },
                dataSrc: function (json) {
                    if(selectedClientStatus !== ''){
                        totalRecordsRef.current = json.recordsFiltered;
                        return json.data;
                    }else{
                        totalRecordsRef.current = json.recordsTotal;;
                        return json.data;
                    }
                },
                data: {
                    name: function () {
                        return $("#name_filter").val();
                    },
                },
            },
            serverSide: true, // Enable server-side processing
            processing: true, // Show processing indicator
            pageLength: 25,
            order: [[9, "asc"]],
            columns: [
                {
                    data: 'public_id',
                    orderable: false,
                    render: (data) => `
                        <div class="form-check form-check-sm form-check-custom form-check-solid ms-4">
                            <input class="form-check-input cursor-pointer" type="checkbox" value="${data}" />
                        </div>
                    `
                },
                {
                    data: 'username',
                    render: (data, type, row) => {
                        return `<a href="/client-form?public_id=${row.public_id}" class="text-primary fw-bold">${data}</a>`;
                    },
                },
                {
                    data: null,
                    render: (data) => {
                        return data?.first_name + ' ' + data?.last_name
                    }
                },
                {
                    data: "date_of_birth",
                    render: function (data, type, row) {
                        if (type === 'display') {
                            const ageText = calculateAge(data);
                            return `
        <span 
          data-bs-toggle="tooltip" 
          data-bs-placement="top" 
          title="Birth date: ${data}"
        >
          ${ageText}
        </span>
      `;
                        }
                        return data; // For sorting/filtering
                    }
                },
                {data: "gender"},
                {
                    data: 'phone_number',
                    render: (data) => {
                        return data ? data : "null";
                    },
                },
                {
                    data: 'number_of_children',
                    orderable: false,
                    render: (data) => {
                        return data ? data : "0";
                    },
                },
                {
                    data: 'number_of_subscriptions',
                    orderable: false,
                    render: (data) => {
                        return data ? data : "0";
                    },
                },
                {
                    data: "status",
                    render: function (data, type, row) {
                        return `<div id="status-cell-${row.public_id}"></div>`;
                    }
                },
                {
                    data: "date_joined",
                    render: function (data) {
                        return data ? format(parseISO(data), "yyyy-MM-dd hh:mm a") : "N/A";
                    },
                },
                {
                    data: "public_id",
                    orderable: false,
                    render: function (data, type, row) {
                        // Create a container for the React component
                        return `<div id="actions-${row.public_id}"></div>`;
                    },
                },
            ],
            responsive: true,
            ordering: true,
            searching: true,
            language: localStorage.getItem('appDirection') === 'rtl' ? {
                "sProcessing": "جارٍ التحميل...",
                "sZeroRecords": "لم يتم العثور على أية سجلات",
                "sInfo": "إظهار _START_ إلى _END_ من أصل _TOTAL_ مدخل",
                "sInfoEmpty": "يعرض 0 إلى 0 من أصل 0 سجل",
                "sInfoFiltered": "(منتقاة من مجموع _MAX_ مُدخل)",
                "sInfoPostFix": "",
                "sSearch": "ابحث:",
                "sUrl": "",
                "oPaginate": {
                    "sFirst": "الأول",
                    "sPrevious": "السابق",
                    "sNext": "التالي",
                    "sLast": "الأخير"
                }
            } : {},
            drawCallback: function (data) {
                $('[data-bs-toggle="tooltip"]').tooltip();

                // Handle checkbox click for each row
                $('#client_table tbody input[type="checkbox"]:not(#kt_leads_table_select_all)').off('change').on('change', function () {
                    const publicId = $(this).val();
                    const isChecked = $(this).is(':checked');

                    if (selectAllRef.current) {
                        if (!isChecked) {
                            deselectedClientIds.current.add(publicId);
                        } else {
                            deselectedClientIds.current.delete(publicId);
                        }
                    } else {
                        if (isChecked) {
                            selectedClientIds.current.add(publicId);
                        } else {
                            selectedClientIds.current.delete(publicId);
                        }
                    }

                    // Update button visibility
                    const hasSelectionNow = selectAllRef.current || selectedClientIds.current.size > 0;
                    setHasSelection(hasSelectionNow);

                    // Update selectedClients list (final ids to be exported)
                    if (selectAllRef.current) {
                        setSelectedClients({
                            all: true,
                            exclude_ids: Array.from(deselectedClientIds.current)
                        });
                    } else {
                        setSelectedClients({
                            all: false,
                            public_ids: Array.from(selectedClientIds.current)
                        });
                    }

                    // Uncheck the main checkbox when manual changes occur
                    $('#kt_leads_table_select_all').prop('checked', false);
                });


                // Apply checkbox states for current page based on selectAll flag or sets
                $('#client_table tbody input[type="checkbox"]:not(#kt_leads_table_select_all)').each(function () {
                    const publicId = $(this).val();

                    if (selectAllRef.current) {
                        $(this).prop('checked', !deselectedClientIds.current.has(publicId));
                    } else {
                        $(this).prop('checked', selectedClientIds.current.has(publicId));
                    }
                });

                // Handle select-all checkbox (top header)
                $('#kt_leads_table_select_all').off('change').on('change', function () {
                    const isChecked = $(this).is(':checked');
                    selectAllRef.current = isChecked;

                    selectedClientIds.current.clear();
                    deselectedClientIds.current.clear();

                    setHasSelection(isChecked);

                    if (isChecked) {
                        setSelectedClients({
                            all: true,
                            exclude_ids: []
                        });
                    } else {
                        setSelectedClients({
                            all: false,
                            include_ids: []
                        });
                    }

                    $('#client_table tbody input[type="checkbox"]:not(#kt_leads_table_select_all)').prop('checked', isChecked);
                });

                const excludedCount = deselectedClientIds.current.size;

                if (excludedCount === totalRecordsRef.current) {
                    selectAllRef.current = false;
                    deselectedClientIds.current.clear();
                    selectedClientIds.current.clear();
                    setHasSelection(false);
                    setSelectedClients([]);

                    // Uncheck all checkboxes visually
                    $('#kt_leads_table_select_all').prop('checked', false);
                    $('#client_table input[type="checkbox"]').prop('checked', false);
                }


                const role = Auth.getUserRole();
                const statusColors = {
                    NEW: "warning",
                    ACTIVE: "success",
                    DEACTIVATED: "danger",
                    SUSPENDED: "info"
                };

                data.aoData.forEach(function (row_obj) {
                    const row = row_obj._aData;

                    // Render action buttons
                    const actionContainer = document.getElementById(`actions-${row.public_id}`);
                    if (actionContainer) {
                        const actionRoot = createRoot(actionContainer);
                        actionRoot.render(
                            <>
                                <a
                                    data-row-id={row.id}
                                    className="edit_btn btn p-1"
                                    onClick={() => handleEditClick(row)}
                                >
                                    <i className="ki-duotone ki-eye fs-2 text-primary">
                                        <span className="path1"></span>
                                        <span className="path2"></span>
                                        <span className="path3"></span>
                                    </i>
                                </a>
                            </>
                        );
                    }

                    // Render status cell
                    const statusContainer = document.getElementById(`status-cell-${row.public_id}`);
                    if (statusContainer) {
                        const statusRoot = createRoot(statusContainer);
                        const status = row.status?.toUpperCase() || 'NEW';
                        const color = statusColors[status] || 'secondary';

                        if (role === 'ADMIN' || role === 'MANAGER') {
                            statusRoot.render(
                                <ClientStatusCell
                                    currentStatus={status}
                                    clientData={row}
                                    onStatusChange={(newStatus) => {
                                        row.status = newStatus;
                                        $('#client_table').DataTable().draw(false);
                                    }}
                                />
                            );
                        } else {
                            statusRoot.render(
                                <span className={`badge badge-light-${color} fw-bold`}>{status}</span>
                            );
                        }
                    }
                });
            },
        });
        setClientTable(table);
    }, []);

    useEffect(() => {
        const toolbar = document.querySelector('[data-kt-leads-table-toolbar="selected"]');
        const countElement = document.querySelector('[data-kt-leads-table-select="selected_count"]');

        if (selectedClients.length > 0) {
            toolbar?.classList.remove('d-none');
            if (countElement) countElement.textContent = selectedClients.length;
        } else {
            toolbar?.classList.add('d-none');
        }
    }, [selectedClients]);

    const calculateAge = (birthDate) => {
        const today = new Date();
        const birthDateObj = new Date(birthDate);
        const yearDiff = today.getFullYear() - birthDateObj.getFullYear();
        const monthDiff = today.getMonth() - birthDateObj.getMonth();
        const dayDiff = today.getDate() - birthDateObj.getDate();

        // If born in current year
        if (yearDiff === 0) {
            const months = monthDiff < 0 ? 0 : (dayDiff < 0 ? monthDiff - 1 : monthDiff);
            return `${months} month${months !== 1 ? 's' : ''}`;
        }

        let age = yearDiff;
        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
            age--;
        }

        return `${age} year${age !== 1 ? 's' : ''}`;
    };

    const reloadDataTable = () => {
        if (clientTable) {
            $("#client_table").DataTable().settings()[0].ajax.data = function (data) {
                if (nameFilter !== "") {
                    data.filter = nameFilter;
                }
                if (selectedClientStatus !== "") {
                    data.status_filter = selectedClientStatus;
                }
                if (genderFilter !== "") {
                    data.gender = genderFilter;
                }

            };

            $("#client_table").DataTable().ajax.reload();
        }
    };

    useEffect(() => {
        const selectStatus1EL = $("#selectStatusReservation").select2();

        selectStatus1EL.on("change", (e) => {
            const value = e.target.value;
            setSelectedClientStatus(value === "all" ? "" : value);

            selectedClientIds.current.clear();
            deselectedClientIds.current.clear();
            selectAllRef.current = false;
            setSelectedClients([]);
            setHasSelection(false);

            $('#client_table input[type="checkbox"]').prop('checked', false);
            $('#kt_leads_table_select_all').prop('checked', false);
        });

        return () => {
            selectStatus1EL.off("change");
        };
    }, []);

    useEffect(() => {
        const selectStatus1EL = $("#selectGenderFilter").select2();

        selectStatus1EL.on("change", (e) => {
            const value = e.target.value;
            setGenderFilter(value === "all" ? "" : value);

            selectedClientIds.current.clear();
            deselectedClientIds.current.clear();
            selectAllRef.current = false;
            setSelectedClients([]);
            setHasSelection(false);

            $('#client_table input[type="checkbox"]').prop('checked', false);
            $('#kt_leads_table_select_all').prop('checked', false);
        });

        return () => {
            selectStatus1EL.off("change");
        };
    }, []);


    useEffect(() => {
        reloadDataTable();
    }, [
        selectedClientStatus,
        genderFilter,
        nameFilter,
    ]);

    const [originalValues, setOriginalValues] = useState({
        username: "",
        first_name: "",
        last_name: "",
        date_of_birth: "",
        gender: "",
        height: "",
        weight: "",
        phone_number: "",
        emergency_contact: "",
        nationality: "",
        governmental_id: "",
        national_id: '',
        files: [],
        type_id: '',
    });

    const validationSchema = Yup.object().shape({
        username: Yup.string().email(Tools.translate('WRONG_EMAIL_FORMAT')).max(50, 'Maximum 50 symbols')
            .required(Tools.translate('EMAIL_IS_REQUIRED')),
        first_name: Yup.string().required(Tools.translate('FIRST_NAME_REQUIRED')),
        last_name: Yup.string().required(Tools.translate('LAST_NAME_REQUIRED')),
        date_of_birth: Yup.date().required(Tools.translate('DATE_OF_BIRTH_REQUIRED')),
        gender: Yup.string()
            .oneOf(["MALE", "FEMALE"], "Gender is required")
            .required(Tools.translate('GENDER_REQUIRED')),
        phone_number: Yup.string()
            .required(Tools.translate('PHONE_REQUIRED'))
            .test(
                "isValidPhone",
                Tools.translate('INVALID_PHONE_NUMBER_FORMAT'),
                function (value) {
                    if (!value) return false;
                    return Tools.phoneRegExp.test(value);
                }
            ),
        height: Yup.number()
            .required(Tools.translate('HEIGHT_REQUIRED'))
            .positive("Height must be a positive number")
            .typeError("Height must be a number"),
        weight: Yup.number()
            .required(Tools.translate('WEIGHT_REQUIRED'))
            .positive("Weight must be a positive number")
            .typeError("Weight must be a number"),
        emergency_contact: Yup.string()
            .required(Tools.translate('EMERGENCY_REQUIRED'))
            .test(
                "isValidPhone",
                Tools.translate('INVALID_PHONE_NUMBER_FORMAT'),
                function (value) {
                    if (!value) return false;
                    return Tools.phoneRegExp.test(value);
                }
            ),
        nationality: Yup.string().required(Tools.translate('NATIONALITY_REQUIRED')),
        type_id: Yup.string().required(Tools.translate('TYPE_ID_REQUIRED')),
        governmental_id: Yup.string()
            .nullable()
            .test(
                "governmental-id-required",
                Tools.translate('GOVERNEMENTAL_ID_REQUIRED'),
                function (value) {
                    // Only validate if type_id is governmental_id
                    if (this.parent.type_id !== 'governmental_id') return true;

                    if (!value) return false;
                    return /^\d{10}$/.test(value);
                }
            )
            .test(
                "governmental-id-format",
                'ID must be exactly 10 digits',
                function (value) {
                    // Only validate format if value exists and type matches
                    if (!value || this.parent.type_id !== 'governmental_id') return true;
                    return /^\d{10}$/.test(value);
                }
            ),
        national_id: Yup.string()
            .nullable()
            .test(
                "national-id-required",
                Tools.translate('NATIONAL_ID_REQUIRED'),
                function (value) {
                    // Only validate if type_id is national_id
                    if (this.parent.type_id !== 'national_id') return true;

                    if (!value) return false;
                    return /^\d{10}$/.test(value);
                }
            )
            .test(
                "national-id-format",
                'ID must be exactly 10 digits',
                function (value) {
                    // Only validate format if value exists and type matches
                    if (!value || this.parent.type_id !== 'national_id') return true;
                    return /^\d{10}$/.test(value);
                }
            )
    });

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: originalValues,
        validationSchema,
        onSubmit: async (values, {setStatus, setSubmitting}) => {
            setLoading(true);
            const formData = new FormData();

            delete formData.type_id;
            
            Object.keys(values).forEach(key => {
                if (key !== 'files') {
                    formData.append(key, values[key]);
                }
            });

            // Append PDF files
            values.files.forEach((file, index) => {
                formData.append(`files`, file.file);
            });

            submitClient(formData)
                .then((response) => {
                    Tools.checkResponseStatus(
                        response,
                        () => {
                            clientTable.ajax.reload();
                            // close_model_btn
                            document.querySelector("#close_model_btn").click();
                            toastr.success(Tools.translate('CLIENT_SAVED_SUCCESSFULLY'));
                        },
                        () => {
                            setLoading(false);
                            toastr.error(Tools.translate('AN_UNEXPECTED_ERROR_OCCURRED'));
                        }
                    );
                })
                .catch((error) => {
                    if (error.response.data?.ERROR === "USERNAME_ALREADY_EXISTS") {
                        toastr.error(Tools.translate('THIS_EMAIL_ALREADY_EXISTS'));
                        setStatus(Tools.translate('THIS_EMAIL_ALREADY_EXISTS'));
                    } else if (error.response && error.response.data) {
                        setStatus(
                            error.response.data.message || "The login details are incorrect"
                        );
                    } else {
                        setStatus(Tools.translate('AN_UNEXPECTED_ERROR_OCCURRED'));
                        toastr.error(Tools.translate('AN_UNEXPECTED_ERROR_OCCURRED'));
                    }
                    setSubmitting(false);
                })
                .finally(() => {
                    setLoading(false);
                });
        },
    });

    const statusColors = {
        NEW: "primary",
        ACTIVATE: "success",
        DEAVTIVATED: "danger",
        SUSPENDED: "info",
    };

    const handleEditClick = (row) => {
        window.location.href = "/client-form?public_id=" + row.public_id;
    };

    const handleModalClose = () => {
        formik.resetForm();
        setCurrentStep(0);
    };

    useEffect(() => {
        if(currentStep !== 0) return;
        const datepickerElement = document.getElementById('kt_datepicker_3');

        const datepicker = flatpickr(datepickerElement, {
            enableTime: false,
            dateFormat: "Y-m-d",
            time_24hr: false,
            disableMobile: true,
            static: true,
            position: "below",
            clickOpens: true,
            allowInput: false,
            // Format and display
            altInput: true,
            altFormat: "F j, Y",
            maxDate: "today",
            onOpen: function (selectedDates, dateStr, instance) {
                // Manually adjust position
                instance.calendarContainer.style.top = '';
                instance.calendarContainer.style.bottom = '';
            },
            onChange: function (selectedDates, dateStr) {
                formik.setFieldValue('date_of_birth', dateStr);
                formik.setFieldTouched('date_of_birth',true, true);

                setTimeout(() => {
                    formik.validateField('date_of_birth');
                }, 0);
            },
            defaultDate: formik.values.date_of_birth || null,
            onReady: function () {
                // Force our style on mobile
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
    }, [formik]);

    const handleExportSelected = async () => {
        setExportLoading(true);
        try {
            const queryParams = new URLSearchParams();
            queryParams.append('all', selectedClients.all);
            queryParams.append('status_filter', selectedClientStatus);
            queryParams.append('gender', genderFilter);

            const body = new FormData();

            if (selectedClients.all) {
                if (selectedClients.exclude_ids) {
                    selectedClients.exclude_ids.forEach(id => {
                        body.append('exclude_ids[]', id);
                    });
                }
            } else if (Array.isArray(selectedClients.public_ids)) {
                selectedClients.public_ids.forEach(id => {
                    body.append('public_ids[]', id);
                });
            }


            if (response?.data?.url) {
                window.open(response.data.url, '_blank');
                toastr.success(Tools.translate('EXPORTED_SUCCESSFULLY'));
            } else {
                toastr.warning(Tools.translate('FAILED_TO_EXPORT'));
            }
        } catch (error) {
            console.error('Export failed:', error);
            toastr.error(Tools.translate('FAILED_TO_EXPORT'));
        } finally {
            setExportLoading(false);
        }
    };

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
    },[])

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
                dropdownParent: $("#client_modal .modal-content"),
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

    //#region Dropzone
    const onDropPdf = useCallback((acceptedFiles) => {
        if (!acceptedFiles.length) return;
        
        setIsUploadingPdf(true);
        try {
            // Add PDFs to formik values
            const newFiles = acceptedFiles.map(file => ({
                file,
                name: file.name,
                size: file.size,
                type: file.type
            }));
            
            formik.setFieldValue('files', [...formik.values.files, ...newFiles]);
        } catch (error) {
            console.error("PDF upload error:", error);
            toastr.error(Tools.translate('FAILED_TO_ADD_PDF'));
        } finally {
            setIsUploadingPdf(false);
        }
    }, [formik]);

    const { getRootProps: getPdfRootProps, getInputProps: getPdfInputProps } = useDropzone({
        onDrop: onDropPdf,
        accept: {
            'application/pdf': ['.pdf']
        },
        maxSize: 5 * 1024 * 1024, // 5MB
        multiple: true
    });

    const removePdf = (index) => {
        const updatedFiles = [...formik.values.files];
        updatedFiles.splice(index, 1);
        formik.setFieldValue('files', updatedFiles);
    };

    //#region JSX
    return (
        <Fragment>
            <div className="col-xl-12">
                <div className="card card-xl-stretch mb-5 mb-xl-8">
                    <div className="card-header align-items-center py-5 gap-2 gap-md-5">
                        <div className="card-title">
                            <div className="w-250px position-relative">
                                <i className="ki-duotone ki-magnifier fs-3 position-absolute top-50 start-0 translate-middle-y ms-4">
                                    <span className="path1"></span>
                                    <span className="path2"></span>
                                </i>
                                <input
                                    type="text"
                                    id="name_filter"
                                    data-kt-ecommerce-order-filter="search"
                                    className="form-control form-control-solid w-250px ps-12"
                                    placeholder={Tools.translate('SEARCH')}
                                    onChange={(e) => {
                                        if (e.target.value.length >= 3 || e.target.value === "")
                                            setNameFilter(e.target.value);
                                    }}
                                />
                            </div>
                            <div className="m-4 w-100 w-md-150px" id="statusFilter">
                                <select
                                    className="form-select form-select-solid"
                                    id={"selectStatusReservation"}
                                    data-hide-search="true"
                                    data-placeholder={Tools.translate('STATUS')}
                                    data-kt-ecommerce-order-filter="status"
                                >
                                    <option></option>
                                    <option value="all">{Tools.translate('ALL')}</option>
                                    {Object.entries(constants.CLIENT_STATUSES || {}).map(
                                        ([key, value]) => (
                                            <option key={key} value={key}>{value}</option>
                                        )
                                    )}
                                </select>
                            </div>
                            <div className="w-100 w-md-150px" id="genderFilter">
                                <select
                                    className="form-select form-select-solid"
                                    id={"selectGenderFilter"}
                                    data-hide-search="true"
                                    data-placeholder={Tools.translate('GENDER')}
                                    data-kt-ecommerce-order-filter="status"
                                >
                                    <option></option>
                                    <option value="all">{Tools.translate('ALL')}</option>
                                    <option key="MALE" value="MALE">Male</option>
                                    <option key="FEMALE" value="FEMALE">Female</option>
                                </select>
                            </div>
                        </div>
                        {Auth.getUserRole() !== 'CASHIER' && (
                            <div className="card-toolbar">
                                <div className="d-flex align-items-center gap-3">
                                    {/* Add Client button */}
                                    <div
                                        data-bs-toggle="tooltip"
                                        data-bs-placement="bottom"
                                        data-bs-trigger="hover"
                                        title={Tools.translate('CLICK_TO_ADD_CLIENT')}
                                    >
                                        <button
                                            className="btn btn-primary"
                                            data-bs-toggle="modal"
                                            data-bs-target="#client_modal"
                                        >
                                            <i className="ki-duotone ki-plus fs-2 me-2"></i>
                                            {Tools.translate('ADD_CLIENT')}
                                        </button>
                                    </div>

                                    <div className="card-toolbar flex-row-fluid justify-content-end gap-5 align-items-center">
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            data-kt-menu-trigger="click"
                                            data-bs-toggle="tooltip"
                                            data-bs-placement="bottom"
                                            data-bs-trigger="hover"
                                            title={Tools.translate('EXPORT_SELECTED_CLIENTS')}
                                            disabled={exportLoading || 
                                                (
                                                    selectedClients.all &&
                                                    Array.isArray(selectedClients.exclude_ids) &&
                                                    selectedClients.exclude_ids.length === totalRecordsRef.current
                                                )
                                            }
                                            data-kt-menu-placement="bottom-end"
                                            onClick={handleExportSelected}
                                        >
                                            <span className="indicator-label d-flex align-items-center">
                                                <i className="ki-duotone ki-exit-down fs-2 me-2">
                                                    <span className="path1"></span>
                                                    <span className="path2"></span>
                                                    <span className="path3"></span>
                                                    <span className="path4"></span>
                                                </i>
                                                {Tools.translate('EXPORT_CLIENT')}
                                            </span>
                                            <span className="indicator-progress">
                                                {Tools.translate('PLEASE_WAIT')} <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
                                            </span>
                                        </button>
                                    </div>

                                </div>
                            </div>
                        )}
                    </div>

                    <div className="card-body py-3 ">
                        <div className="table-responsive" dir={direction}>
                            <table
                                id="client_table"
                                className={`table table-row-bordered table-row-dashed gy-4 align-middle fw-bold ${direction === 'rtl' ? 'rtl-table' : ''}`}
                            >
                                <thead>
                                    <tr className="fw-semibold fs-6 text-gray-700 bg-light text-uppercase">
                                        <th className={direction === 'rtl' ? 'ps-2' : 'pe-2'}>
                                            <div className="form-check form-check-sm form-check-custom form-check-solid">
                                                <input
                                                    className="form-check-input cursor-pointer"
                                                    type="checkbox"
                                                    id="kt_leads_table_select_all"
                                                    data-kt-check="true"
                                                    data-kt-check-target="#client_table .form-check-input"
                                                />
                                            </div>
                                        </th>
                                        <th>{Tools.translate('EMAIL')}</th>
                                        <th>{Tools.translate('NAME')}</th>
                                        <th>{Tools.translate('AGE')}</th>
                                        <th>{Tools.translate('GENDER')}</th>
                                        <th>{Tools.translate('PHONE_NUMBER')}</th>
                                        <th>{Tools.translate('FAMILY_MEMBERS')}</th>
                                        <th>{Tools.translate('SUBSCRIPTION')}</th>
                                        <th>{Tools.translate('STATUS')}</th>
                                        <th>{Tools.translate('DATE_JOINED')}</th>
                                        <th>{Tools.translate('ACTIONS')}</th>
                                    </tr>
                                </thead>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/*Add Client Modal*/}
            <div
                className="modal fade"
                id="client_modal"
                tabIndex="-1"
                aria-hidden="true"
            >
                <div className="modal-dialog modal-dialog-centered mw-1000px">
                    <div className="modal-content">
                        <div className="modal-header" id="client_modal_header">
                            <h2 className="fw-bold">{Tools.translate('ADD_CLIENT')}</h2>
                            <div
                                className="btn btn-icon btn-sm btn-active-icon-primary"
                                id="close_model_btn"
                                aria-label="Close"
                                data-bs-dismiss="modal"
                                onClick={() => {
                                    handleModalClose();
                                }}
                            >
                                <i className="ki-duotone ki-cross fs-1">
                                    <span className="path1"></span>
                                    <span className="path2"></span>
                                </i>
                            </div>
                        </div>

                        <form
                            className="form"
                            id="client_modal_form"
                        >
                            {/* <!--begin::Modal body--> */}
                            <div className="modal-body py-lg-5 px-lg-5">
                                <div
                                    className="stepper stepper-pills stepper-column d-flex flex-column flex-xl-row flex-row-fluid">
                                    <div
                                        className="d-flex justify-content-center justify-content-xl-start flex-row-auto w-100 w-xl-250px">
                                        <div
                                            className="stepper-nav ps-lg-10 py-lg-5 d-flex flex-xl-column flex-row justify-content-between w-100 position-relative">
                                            {steps.map((title, index) => (
                                                <div
                                                    className={`stepper-item ${currentStep === index ? "current" : ""} position-relative `}
                                                    key={index}
                                                >
                                                    <div
                                                        className="stepper-label d-xl-none text-center w-100 mb-1 d-flex justify-content-center">
                                                        <h3 className="stepper-title fs-6"
                                                            style={{ width: 'fit-content' }}>{title}</h3>
                                                    </div>

                                                    <div className="stepper-wrapper d-flex flex-xl-row align-items-center">
                                                        <div className="stepper-icon w-40px h-40px">
                                                            <i className="ki-duotone ki-check stepper-check fs-2"></i>
                                                            <span className="stepper-number">{index + 1}</span>
                                                        </div>

                                                        <div className="stepper-label d-none d-xl-block ms-3">
                                                            <h3 className="stepper-title margin-dir-2">{title}</h3>
                                                        </div>
                                                    </div>

                                                    {/* Vertical connector line for desktop (between steps) */}
                                                    {index !== steps.length - 1 && direction !== "rtl" && (
                                                        <div className="stepper-line h-100px d-none d-xl-block"></div>
                                                    )}
                                                    {index !== steps.length - 1 && direction === "rtl" && (
                                                        <div className="h-50px d-none d-xl-block"></div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex-row-fluid py-lg-1 px-lg-20 position-relative">

                                        <div id="client_modal_info" className="collapse show">
                                            {currentStep === 0 && (
                                                <>
                                                    <div className="row flex-row">
                                                        <div className=" mb-3 col-md-6">
                                                            <label className="col-12 col-form-label required fw-bold fs-6">
                                                                {Tools.translate('FIRST_NAME')}
                                                            </label>
                                                            <input
                                                                type="text"
                                                                placeholder={Tools.translate('FIRST_NAME')}
                                                                autoComplete="off"
                                                                {...formik.getFieldProps("first_name")}
                                                                onChange={formik.handleChange} // Add this line!
                                                                onBlur={formik.handleBlur}
                                                                className={clsx(
                                                                    "form-control bg-transparent mb-3 mb-lg-0",
                                                                    {
                                                                        "is-invalid": formik.errors.first_name && formik.touched.first_name,
                                                                    },
                                                                    {
                                                                        "is-valid":
                                                                            formik.touched.first_name &&
                                                                            !formik.errors.first_name,
                                                                    }
                                                                )}
                                                            />
                                                            {formik.touched.first_name &&
                                                                formik.errors.first_name && (
                                                                    <div className="fv-plugins-message-container">
                                                                        <div className="fv-help-block">
                                                                            {formik.errors.first_name}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                        </div>
                                                        <div className=" mb-3 col-md-6">
                                                            <label className="col-12 col-form-label required fw-bold fs-6">
                                                                {Tools.translate('LAST_NAME')}
                                                            </label>
                                                            <input
                                                                type="text"
                                                                placeholder={Tools.translate('LAST_NAME')}
                                                                autoComplete="off"
                                                                {...formik.getFieldProps("last_name")}
                                                                onChange={formik.handleChange} // Add this line!
                                                                onBlur={formik.handleBlur}
                                                                className={clsx(
                                                                    "form-control bg-transparent mb-3 mb-lg-0",
                                                                    {
                                                                        "is-invalid": formik.errors.last_name && formik.touched.last_name,
                                                                    },
                                                                    {
                                                                        "is-valid":
                                                                            formik.touched.last_name &&
                                                                            !formik.errors.last_name,
                                                                    }
                                                                )}
                                                            />
                                                            {formik.touched.last_name && formik.errors.last_name && (
                                                                <div className="fv-plugins-message-container">
                                                                    <div className="fv-help-block">
                                                                        {formik.errors.last_name}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="row flex-row">
                                                        <div className="mb-3 col-md-6">
                                                            <label className="col-12 col-form-label required fw-bold fs-6">
                                                                {Tools.translate('DATE_OF_BIRTH')}
                                                            </label>
                                                            <input
                                                                type="date"
                                                                placeholder={Tools.translate('DATE_OF_BIRTH')}
                                                                id="kt_datepicker_3"
                                                                {...formik.getFieldProps("date_of_birth")}
                                                                className={clsx(
                                                                    "form-control bg-transparent mb-3 mb-lg-0",
                                                                    {
                                                                        "is-invalid":
                                                                            formik.touched.date_of_birth &&
                                                                            formik.errors.date_of_birth,
                                                                    },
                                                                    {
                                                                        "is-valid":
                                                                            formik.touched.date_of_birth &&
                                                                            !formik.errors.date_of_birth,
                                                                    }
                                                                )}
                                                            />
                                                            {formik.touched.date_of_birth &&
                                                                formik.errors.date_of_birth && (
                                                                    <div className="fv-plugins-message-container">
                                                                        <div className="fv-help-block">
                                                                            {formik.errors.date_of_birth}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                        </div>
                                                        <div className="col-md-6">
                                                            <label className="col-12 col-form-label required fw-bold fs-6">
                                                                {Tools.translate('EMAIL')}
                                                            </label>
                                                            <input
                                                                type="text"
                                                                placeholder={Tools.translate('EMAIL')}
                                                                {...formik.getFieldProps("username")}
                                                                onChange={formik.handleChange} // Add this line!
                                                                onBlur={formik.handleBlur}
                                                                className={clsx(
                                                                    "form-control bg-transparent mb-3 mb-lg-0",
                                                                    {
                                                                        "is-invalid": formik.errors.username && formik.touched.username,
                                                                    },
                                                                    {
                                                                        "is-valid":
                                                                            formik.touched.username &&
                                                                            !formik.errors.username,
                                                                    }
                                                                )}
                                                            />
                                                            {formik.touched.username &&
                                                                formik.errors.username && (
                                                                    <div className="fv-plugins-message-container">
                                                                        <div className="fv-help-block">
                                                                            {formik.errors.username}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                        </div>
                                                    </div>
                                                    <div className="row flex-row">
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
                                                        <div className="mb-3 col-md-6">
                                                            <label className="col-12 col-form-label required fw-bold fs-6">
                                                                {Tools.translate('GENDER')}
                                                            </label>
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
                                                    </div>
                                                </>
                                            )}

                                            {currentStep === 1 && (
                                                <>

                                                    <div className="row flex-row">
                                                        <div className=" mb-3 col-md-6">
                                                            <label className="col-12 col-form-label required fw-bold fs-6">
                                                                {Tools.translate('HEIGHT')}
                                                            </label>
                                                            <input
                                                                type="number"
                                                                placeholder={Tools.translate('HEIGHT')}
                                                                {...formik.getFieldProps("height")}
                                                                onChange={formik.handleChange} // Add this line!
                                                                onBlur={formik.handleBlur}
                                                                className={clsx(
                                                                    "form-control bg-transparent mb-3 mb-lg-0",
                                                                    {
                                                                        "is-invalid": formik.errors.height && formik.touched.height,
                                                                    },
                                                                    {
                                                                        "is-valid":
                                                                            formik.touched.height && !formik.errors.height,
                                                                    }
                                                                )}
                                                            />
                                                            {formik.touched.height && formik.errors.height && (
                                                                <div className="fv-plugins-message-container">
                                                                    <div className="fv-help-block">
                                                                        {formik.errors.height}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className=" mb-3 col-md-6">
                                                            <label className="col-12 col-form-label required fw-bold fs-6">
                                                                {Tools.translate('WEIGHT')}
                                                            </label>
                                                            <input
                                                                type="number"
                                                                placeholder={Tools.translate('WEIGHT')}
                                                                {...formik.getFieldProps("weight")}
                                                                onChange={formik.handleChange}
                                                                onBlur={formik.handleBlur}
                                                                className={clsx(
                                                                    "form-control bg-transparent mb-3 mb-lg-0",
                                                                    {
                                                                        "is-invalid": formik.errors.weight && formik.touched.weight,
                                                                    },
                                                                    {
                                                                        "is-valid":
                                                                            formik.touched.weight && !formik.errors.weight,
                                                                    }
                                                                )}
                                                            />
                                                            {formik.touched.weight && formik.errors.weight && (
                                                                <div className="fv-plugins-message-container">
                                                                    <div className="fv-help-block">
                                                                        {formik.errors.weight}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="row flex-row">
                                                        <div className=" mb-3 col-md-6">
                                                            <label className="col-12 col-form-label required fw-bold fs-6">
                                                                {Tools.translate('PHONE_NUMBER')}
                                                            </label>
                                                            <div
                                                                style={{
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    padding: "0 5px",
                                                                    backgroundClip: "padding-box",
                                                                    border: `1px solid ${formik.touched.phone_number &&
                                                                            formik.errors.phone_number
                                                                            ? "var(--bs-form-invalid-border-color)"
                                                                            : "var(--bs-gray-300)"
                                                                        }`,
                                                                    borderRadius: "0.475rem",
                                                                }}
                                                            >
                                                                <span
                                                                    style={{
                                                                        color: "grey",
                                                                        margin: "5px",
                                                                    }}
                                                                >
                                                                    +966
                                                                </span>
                                                                <input
                                                                    style={{
                                                                        border: "none",
                                                                        flex: 1, // Ensures the input takes up the remaining space
                                                                    }}
                                                                    placeholder={Tools.translate('PHONE_NUMBER')}
                                                                    type="number"
                                                                    autoComplete="off"
                                                                    {...formik.getFieldProps("phone_number")}
                                                                    className={clsx(
                                                                        "form-control bg-transparent",
                                                                        {
                                                                            "is-invalid":
                                                                                formik.touched.phone_number &&
                                                                                formik.errors.phone_number,
                                                                        },
                                                                        {
                                                                            "is-valid":
                                                                                formik.touched.phone_number &&
                                                                                !formik.errors.phone_number,
                                                                        }
                                                                    )}
                                                                />
                                                            </div>
                                                            {formik.touched.phone_number &&
                                                                formik.errors.phone_number && (
                                                                    <div className="fv-plugins-message-container">
                                                                        <div className="fv-help-block">
                                                                            <span role="alert">
                                                                                {formik.errors.phone_number}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                        </div>
                                                        <div className="mb-3 col-md-6">
                                                            <label className="col-12 col-form-label required fw-bold fs-6">
                                                                {Tools.translate('EMERGENCY_CONTACT')}
                                                            </label>
                                                            <div
                                                                style={{
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    padding: "0 5px",
                                                                    backgroundClip: "padding-box",
                                                                    border: `1px solid ${formik.touched.emergency_contact &&
                                                                            formik.errors.emergency_contact
                                                                            ? "var(--bs-form-invalid-border-color)"
                                                                            : "var(--bs-gray-300)"
                                                                        }`,
                                                                    borderRadius: "0.475rem",
                                                                }}
                                                            >
                                                                <span
                                                                    style={{
                                                                        color: "grey",
                                                                        margin: "5px",
                                                                    }}
                                                                >
                                                                    +966
                                                                </span>
                                                                <input
                                                                    style={{
                                                                        border: "none",
                                                                        flex: 1, // Ensures the input takes up the remaining space
                                                                    }}
                                                                    placeholder={Tools.translate('EMERGENCY_CONTACT')}
                                                                    type="number"
                                                                    autoComplete="off"
                                                                    {...formik.getFieldProps("emergency_contact")}
                                                                    className={clsx(
                                                                        "form-control bg-transparent",
                                                                        {
                                                                            "is-invalid":
                                                                                formik.touched.emergency_contact &&
                                                                                formik.errors.emergency_contact,
                                                                        },
                                                                        {
                                                                            "is-valid":
                                                                                formik.touched.emergency_contact &&
                                                                                !formik.errors.emergency_contact,
                                                                        }
                                                                    )}
                                                                />
                                                            </div>
                                                            {formik.touched.emergency_contact &&
                                                                formik.errors.emergency_contact && (
                                                                    <div className="fv-plugins-message-container">
                                                                        <div className="fv-help-block">
                                                                            {formik.errors.emergency_contact}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                        </div>
                                                    </div>
                                                    <div className="row flex-row">
                                                        <div className=" mb-3 col-md-6">
                                                            <label className="col-12 col-form-label required fw-bold fs-6">
                                                                {Tools.translate('TYPE_ID')}
                                                            </label>
                                                            <select
                                                                {...formik.getFieldProps("type_id")}
                                                                onChange={(e) => {
                                                                    formik.handleChange(e);
                                                                    formik.setFieldValue("governmental_id", "");
                                                                    formik.setFieldValue("national_id", "");
                                                                }}
                                                                onBlur={formik.handleBlur}
                                                                className={clsx(
                                                                    "form-select bg-transparent form-select-lg",
                                                                    {
                                                                        "is-invalid":
                                                                            formik.touched.type_id && formik.errors.type_id,
                                                                    },
                                                                    {
                                                                        "is-valid":
                                                                            formik.touched.type_id && !formik.errors.type_id,
                                                                    }
                                                                )}
                                                            >
                                                                <option value="">{Tools.translate('SELECT_TYPE_ID')}</option>
                                                                <option key="governmental_id" value="governmental_id">
                                                                    {Tools.translate('GOVERNMENTAL_ID')}
                                                                </option>
                                                                <option key="national_id" value="national_id">
                                                                   {Tools.translate('NATIONAL_ID')}
                                                                </option>
                                                            </select>
                                                            {formik.touched.type_id && formik.errors.type_id && (
                                                                <div className="fv-plugins-message-container">
                                                                    <div className="fv-help-block">
                                                                        {formik.errors.type_id}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {formik.values.type_id === 'governmental_id' && (
                                                            <>
                                                                <div className=" mb-3 col-md-6">
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
                                                            </>
                                                        )}
                                                        {formik.values.type_id === 'national_id' && (
                                                            <>
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
                                                            </>
                                                        )}
                                                    </div>
                                                </>
                                            )}

                                            {currentStep === 2 && (
                                                <>
                                                    <div className="mb-5">
                                                        <div
                                                            {...getPdfRootProps({
                                                                className: "dropzone border-dashed border-2 border-gray-300 p-5 rounded-3",
                                                                style: {
                                                                    opacity: isUploadingPdf ? 0.6 : 1,
                                                                    cursor: isUploadingPdf ? 'wait' : 'pointer'
                                                                }
                                                            })}
                                                        >
                                                            <input {...getPdfInputProps()} />
                                                            <div className="text-start">
                                                                <div className="dz-message">
                                                                    <i className="ki-duotone ki-file-up fs-3x text-primary">
                                                                        <span className="path1"></span>
                                                                        <span className="path2"></span>
                                                                    </i>
                                                                    <div className="ms-4">
                                                                        <h3 className="fs-5 fw-bold text-gray-900 mb-1">
                                                                            {Tools.translate('DROP_PDF_HERE')}
                                                                        </h3>
                                                                        <span className="fs-7 fw-semibold text-gray-500">
                                                                            {Tools.translate('PDF_FILES_ONLY')}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            {formik.values.files.length > 0 && (
                                                                <div className="mt-4">
                                                                    <div className="d-flex flex-wrap gap-3">
                                                                        {formik.values.files.map((file, index) => (
                                                                            <div key={index} className="position-relative bg-light rounded p-3">
                                                                                <div className="d-flex align-items-center">
                                                                                    <i className="ki-duotone ki-file-pdf fs-2x text-danger me-3">
                                                                                        <span className="path1"></span>
                                                                                        <span className="path2"></span>
                                                                                    </i>
                                                                                    <div>
                                                                                        <div className="fw-bold text-truncate" style={{ maxWidth: '200px' }}>
                                                                                            {file.name}
                                                                                        </div>
                                                                                        <div className="text-muted fs-8">
                                                                                            {(file.size / 1024).toFixed(1)} KB
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                <button
                                                                                    type="button"
                                                                                    className="btn btn-sm btn-icon btn-active-icon-danger position-absolute"
                                                                                    style={{
                                                                                        top: '0',
                                                                                        right: '0',
                                                                                        transform: 'translate(25%, -25%)',
                                                                                        zIndex: 10,
                                                                                        padding: '0.25rem',
                                                                                    }}
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        removePdf(index);
                                                                                    }}
                                                                                    title={Tools.translate('REMOVE_FILE')}
                                                                                >
                                                                                    <i className="ki-duotone ki-trash-square fs-1">
                                                                                        <span className="path1"></span>
                                                                                        <span className="path2"></span>
                                                                                        <span className="path3"></span>
                                                                                        <span className="path4"></span>
                                                                                    </i>
                                                                                </button>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="d-flex flex-stack"
                                    style={{ minHeight: "100px" }}>
                                    {currentStep > 0 && (
                                        <button type="button"
                                            className="btn btn-lg btn-light-primary position-absolute start-0 bottom-0 mx-lg-15 my-lg-15"
                                            onClick={handlePrevious}>
                                            {Tools.translate('BACK')}
                                        </button>
                                    )}

                                    <div className="position-absolute end-0 bottom-0">
                                        {currentStep < steps.length - 1 ? (
                                            <button type="button"
                                                className="btn btn-lg btn-primary mx-lg-10 my-lg-15"
                                                onClick={handleNext}
                                                disabled={loading}>
                                                {!loading && "Next"}
                                                {loading && (
                                                    <span className="indicator-progress"
                                                        style={{ display: "block" }}>
                                                        Please wait...
                                                        <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
                                                    </span>
                                                )}
                                            </button>
                                        ) : (
                                            <button type="button"
                                                className="btn btn-lg btn-primary mx-lg-10 my-lg-15"
                                                onClick={formik.handleSubmit}
                                                disabled={loading || formik.isSubmitting}>
                                                {!loading && Tools.translate('SUBMIT')}
                                                {loading && (
                                                    <span
                                                        className="indicator-progress"
                                                        style={{ display: "block" }}
                                                    >
                                                        {Tools.translate('PLEASE_WAIT')}{" "}
                                                        <span
                                                            className="spinner-border spinner-border-sm align-middle ms-2"></span>
                                                    </span>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </Fragment>
    );
};

export default ClientList;
