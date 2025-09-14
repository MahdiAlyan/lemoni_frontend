import React, {Fragment, useEffect, useState, useRef, useCallback} from "react";
import { listUsers } from "../../calls/Api";
import constants from "../../common/constants";
import Tools from "../../config/Tools";
import Auth from "../../config/Auth";
// ReservationModal removed
import {useOutletContext} from "react-router-dom";
// PrivateSessionModal removed
import { Tooltip } from "bootstrap";

const Calendar = () => {

    const {setToolbarButtons} = useOutletContext();
    const [loading, setLoading] = useState(false);
    const calendarRef = useRef(null);
    const [showCalendarModal, setShowCalendarModal] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);
    const [reservationsList, setReservationsList] = useState([]);
    const [trainersList, setTrainersList] = useState([]);
    const [facilitiesList, setFacilitiesList] = useState([]);
    const [usersList, setUsersList] = useState([]);
    const [trainerFilter, setTrainerFilter] = useState(null);
    const [facilityFilter, setFacilityFilter] = useState(null);
    const [userFilter, setUserFilter] = useState(null);
    const [packageTypeFilter, setPackageTypeFilter] = useState(null);
    const [nameFilter, setNameFilter] = useState(null);
    const [userNameFilter, setUserNameFilter] = useState(null);
    const direction = localStorage.getItem('appDirection') || 'ltr';

    // Reservation fetching removed - reservationsList remains empty by default

    // Trainer and facility fetching removed

    useEffect(() => {
        // Initialize facility Select2
        const facilitySelect = $("#facilityFilter").select2({
            placeholder: "Select Facility",
        });
        const trainerSelect = $("#trainerFilter").select2({
            placeholder: "Filter by Trainer",
        });
        const userSelect = $("#userFilter").select2({
            placeholder: "Filter by User",
        });
        const packageTypeSelect = $("#packageTypeFilter").select2({
            placeholder: "Filter by Package Type",
        });

        trainerSelect.on("change", (e) => {
            setTrainerFilter(e.target.value === "all" ? "" : e.target.value);
        });

        // Handle facility filter change
        facilitySelect.on("change", (e) => {
            setFacilityFilter(e.target.value === "all" ? "" : e.target.value);
        });

        packageTypeSelect.on("change", (e) => {
            setPackageTypeFilter(e.target.value === "all" ? "" : e.target.value);
        });

        // Cleanup
        return () => {
            facilitySelect.off("change").select2('destroy');
            trainerSelect.off("change").select2('destroy');
            packageTypeSelect.off("change").select2('destroy');
        };
    }, [facilitiesList, trainersList, usersList]);

    //#region CALENDAR
    useEffect(() => {
        var calendarEl = document.getElementById("calendar");

        if (calendarRef.current) {
            calendarRef.current.destroy();
        }

        // Map reservations to calendar events format
        const reservationEvents = reservationsList.length
        ? reservationsList.map(reservation => ({
            id: reservation.id || `${reservation.date}-${reservation.start_time}`,
            title: `${reservation.package_name} - ${reservation.facility}`,
            start: `${reservation.date}T${reservation.start_time}`,
            end: `${reservation.date}T${reservation.end_time}`,
            extendedProps: {
                ...reservation,
                trainer: reservation.trainer_id ? 'Trainer ID: ' + reservation.trainer_id : 'No trainer',
                description: reservation.package_description || 'No description'
            },
            className: `fc-event-type-${reservation.package_type.toLowerCase()}`,
        }))
        : []; // Empty array when no reservations

        calendarRef.current = new FullCalendar.Calendar(calendarEl, {
            initialView: "timeGridWeek",
            height: 1000,
            contentHeight: 780,
            nowIndicator: true,
            selectable: true,
            editable: false,
            locale: direction === 'rtl' ? 'ar' : 'en',
            direction: direction,
            views: {
                dayGridMonth: { buttonText: direction === 'rtl' ? 'شهر' : 'month' },
                timeGridWeek: { buttonText: direction === 'rtl' ? 'أسبوع' : 'week' },
                timeGridDay: { buttonText: direction === 'rtl' ? 'يوم' : 'day' },
                listMonth: { buttonText: direction === 'rtl' ? 'قائمة' : 'list' },
            },
            dayMaxEvents: true,
            navLinks: true,
            headerToolbar: {
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth",
            },
            events: reservationEvents,
            eventClick: function (info) {
                setSelectedSession(info.event.extendedProps);
                setShowCalendarModal(true);
            },
            eventDidMount: function (info) {
                const eventEl = info.el;
                const {package_type} = info.event.extendedProps;

                // Add class based on package type
                eventEl.classList.remove(
                    "fc-event-type-class",
                    "fc-event-type-facility"
                );

                eventEl.style.cursor = 'pointer';
                eventEl.addEventListener('mouseenter', () => {
                    eventEl.style.opacity = '0.9';
                    eventEl.style.transform = 'scale(1.01)';
                });

                eventEl.addEventListener('mouseleave', () => {
                    eventEl.style.opacity = '';
                    eventEl.style.transform = '';
                });

                eventEl.classList.add(`fc-event-type-${package_type.toLowerCase()}`);
            },
        });

        calendarRef.current.render();

        return () => {
            if (calendarRef.current) {
                calendarRef.current.destroy();
            }
        };
    }, [reservationsList]);

    // Reservation-related functions removed

    

    useEffect(() => {
        if (!showCalendarModal) {
            setUserNameFilter('');
            document.body.classList.remove("modal-open");
            document.body.style.overflow = "";
        }else {
            document.body.classList.add("modal-open");
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.body.classList.remove("modal-open");
            document.body.style.overflow = "";
        };
    }, [showCalendarModal]);

    //#region TOOLBAR
    useEffect(() => {
        if (Auth.getUserRole() === 'CASHIER') return ;
        // Reservation actions removed from toolbar
        setToolbarButtons(null);
    }, [setToolbarButtons]);

    useEffect(() => {
        // Initialize tooltips
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new Tooltip(tooltipTriggerEl);
        });
    }, [selectedSession]);

    //#region JSX
    return (
        <Fragment>
            {Auth.getUserRole() !== 'CASHIER' && null}
            <div className="col-xl-12">
                    <div className="card card-xl-stretch mb-5 mb-xl-8">
                        <div className="card-header align-items-center py-5 gap-2 gap-md-5 border-0">
                            <div className='card-title'>
                                <div className='w-250px position-relative'>
                                    <i className='ki-duotone ki-magnifier fs-3 position-absolute top-50 start-0 translate-middle-y ms-4'>
                                        <span className='path1'></span>
                                        <span className='path2'></span>
                                    </i>
                                    <input
                                        type='text'
                                        id='name_filter'
                                        autoComplete="off"
                                        data-kt-ecommerce-order-filter='search'
                                        className='form-control form-control-solid w-250px ps-12'
                                        placeholder={Tools.translate('SEARCH') + ' ' + Tools.translate('PACKAGE')}
                                        onChange={(e) => {
                                            if (e.target.value.length >= 3 || e.target.value === '') setNameFilter(e.target.value);
                                        }}
                                    />
                                </div>
                                <div className="w-100 w-md-150px m-4" id="facilitySelectContainer">
                                    <select
                                        className="form-select form-select-solid"
                                        id="facilityFilter"
                                        data-hide-search="true"
                                        data-placeholder= {Tools.translate('FACILITY')}
                                        data-kt-ecommerce-order-filter="facility"
                                    >
                                        <option value=""></option>
                                        <option value="all">{Tools.translate('ALL_FACILITIES')}</option>
                                        {facilitiesList && facilitiesList.map((facility) => (
                                            <option key={facility.public_id} value={facility.name}>
                                                {facility.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="w-100 w-md-150px" id="trainerSelectContainer">
                                    <select
                                        className="form-select form-select-solid"
                                        id="trainerFilter"
                                        data-placeholder={Tools.translate('TRAINER')}
                                    >
                                        <option value=""></option>
                                        <option value="all">{Tools.translate('ALL_TRAINERS')}</option>
                                        {trainersList && trainersList.map((trainer) => (
                                            <option key={trainer.public_id} value={trainer.full_name}>
                                                {trainer.full_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="w-100 w-md-150px m-4" id="statusFilter">
                                    <select
                                        className="form-select form-select-solid"
                                        id={"packageTypeFilter"}
                                        data-hide-search="true"
                                        data-placeholder={Tools.translate('PACKAGE')}
                                    >
                                        <option></option>
                                        <option value="all">{Tools.translate('ALL_PACKAGES')}</option>
                                        {Object.entries(constants.PACKAGES_LIST || {}).map(
                                            ([key, value]) => (
                                                <option key={key} value={key}>{value}</option>
                                            )
                                        )}
                                    </select>
                                </div>
                                {loading && (
                                    <div className="overlay overlay-block">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="row g-5 g-xl-10 mb-5 mb-xl-10 border-0">
                            <div className="col-xl-12">
                                <div className="border-0">
                                    <div className="card-body border-0">
                                        <div id="calendar"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            {showCalendarModal && (
                <>
                    <div
                        className="modal-backdrop fade show"
                        onClick={() => setShowCalendarModal(false)}
                    ></div>
                    <div className="modal fade show d-block" tabIndex="-1"
                         style={{backgroundColor: 'rgba(0,0,0,0.5)', pointerEvents: 'none'}}>
                        <div className="modal-dialog modal-dialog-centered modal-xl"
                             onClick={(e) => e.stopPropagation()}>
                            <div className="modal-content">
                                <div className="modal-header" id="calendar_modal_header">
                                    <h2 className="fw-bold">{Tools.translate('TRAINING_SESSION_DETAILS')}</h2>
                                    <div
                                        className="btn btn-icon btn-sm btn-active-icon-primary"
                                        id="close_model_btn"
                                        onClick={() => setShowCalendarModal(false)}
                                    >
                                        <i className="ki-duotone ki-cross fs-1">
                                            <span className="path1"></span>
                                            <span className="path2"></span>
                                        </i>
                                    </div>
                                </div>
                                <div className="modal-body">
                                    <div className="row">
                                        {/* LEFT COLUMN: Reservation Details */}
                                        <div className="col-md-7 border-md-end-custom pe-5">
                                            {selectedSession && (
                                                <div className="row g-3">
                                                    <div className="col-12">
                                                        <label className="form-label">{Tools.translate('PACKAGE')}</label>
                                                        <div className="form-control form-control-solid">
                                                            {selectedSession.package_name}
                                                        </div>
                                                    </div>
                                                    {selectedSession.package_description && (
                                                        <div className="col-12">
                                                            <label className="form-label">{Tools.translate('DESCRIPTION')}</label>
                                                            <div className="form-control form-control-solid">
                                                                {selectedSession.package_description}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {selectedSession.package_type !== 'FACILITY' && (
                                                        <div className="col-12">
                                                            <label className="form-label">{Tools.translate('TRAINER')}</label>
                                                            <div className="form-control form-control-solid">
                                                                {selectedSession.trainer_full_name}
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className="col-6">
                                                        <label className="form-label">{Tools.translate('FACILITY')}</label>
                                                        <div className="form-control form-control-solid">
                                                            {selectedSession.facility}
                                                        </div>
                                                    </div>
                                                    <div className="col-6">
                                                        <label className="form-label">{Tools.translate('PACKAGE_TYPE')}</label>
                                                        <div className="form-control form-control-solid">
                                                            {selectedSession.package_type === 'FACILITY' ? 'Facility Reservation' :
                                                                selectedSession.package_type === 'CLASS' ? 'Class' :
                                                                    selectedSession.package_type === 'COURSE' ? 'Course' :
                                                                        selectedSession.package_type === 'PRIVATE' ? 'Private' :
                                                                            selectedSession.package_type}
                                                        </div>
                                                    </div>
                                                    <div className="col-6">
                                                        <label className="form-label">{Tools.translate('START_TIME')}</label>
                                                        <div className="form-control form-control-solid">
                                                            {moment(selectedSession.start_time, 'HH:mm:ss').format('h:mm A')}
                                                        </div>
                                                    </div>
                                                    <div className="col-6">
                                                        <label className="form-label">{Tools.translate('END_TIME')}</label>
                                                        <div className="form-control form-control-solid">
                                                            {moment(selectedSession.end_time, 'HH:mm:ss').format('h:mm A')}
                                                        </div>
                                                    </div>
                                                    <div className="col-6">
                                                        <label className="form-label">{Tools.translate('DATE')}</label>
                                                        <div className="form-control form-control-solid">
                                                            {moment(selectedSession.date).format('LL')}
                                                        </div>
                                                    </div>
                                                    <div className="col-6">
                                                        <label className="form-label">{Tools.translate('CAPACITY')}</label>
                                                        <div className="form-control form-control-solid">
                                                            {selectedSession.capacity}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="col-md-5 ps-5 mb-1">
                                            <div className="d-flex justify-content-between align-items-center mb-4">
                                                <h6 className="mb-0">{Tools.translate('RESERVED_CLIENTS')}</h6>
                                                {/* Reserve client action removed */}
                                            </div>

                                            {selectedSession?.reserved_users?.length > 0 ? (
                                                selectedSession.reserved_users.map((user) => {
                                                    const initials = Tools.getInitials2(
                                                        user.full_name?.split(" ")[0] || user.username,
                                                        user.full_name?.split(" ")[1] || ""
                                                    );
                                                    return (
                                                        <div className="d-flex align-items-center mb-4"
                                                             key={user.public_id}>
                                                            <div className="symbol symbol-40px symbol-circle me-4">
                                                    <span
                                                        className="symbol-label fs-1x fw-semibold text-white bg-warning margin-dir-end-2">
                                                        {initials}
                                                    </span>
                                                            </div>
                                                            <div>
                                                                <div className="fw-bold">{user.full_name}</div>
                                                                <div className="text-muted">{user.phone_number}</div>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="col-12 text-center py-10">
                                                    <div className="d-flex flex-column align-items-center">
                                                        <i className="ki-duotone ki-element-11 fs-2hx text-gray-400 mb-4">
                                                            <span className="path1"></span>
                                                            <span className="path2"></span>
                                                        </i>
                                                        <h3 className="text-gray-600">{Tools.translate('NO_REESERVED_CLIENTS')}</h3>
                                                        <p className="text-muted">{Tools.translate('THERE_IS_CURRENTLY_NO_RES')}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </Fragment>

    );
}
export default Calendar;