import React, {Fragment, useState, useEffect} from "react";
import useMQTT from "../../config/useMQTT";
import {dismissNotification, getOldNotifications, dismissAllNotification} from "../../calls/Api";
import {formatDistanceToNow, parseISO} from "date-fns";
import Tools from "../../config/Tools";

const HeaderNotification = () => {
    const {messages} = useMQTT();
    const direction = localStorage.getItem('appDirection') || 'ltr';

    const [oldMessages, setOldMessages] = useState([])

    useEffect(() => {
        try {
            getOldNotifications({}).then(response => {
                setOldMessages(response.data)
            }).catch((error) => {
                // console.error('error occured in notifications', error);
                // toastr.error("Error Occurred In Notifications");
            })
        } catch (error) {
            toastr.error("Error Occurred");
        } finally {
        }
    }, [])

    const buildUrl = (msg) => {
        let url = ""
        if (msg.type != "NEW_PARTNER") {
            url = `bo-form?id=${msg.action}`
        } else {
            url = `partner-form?id=${msg.action}`
        }
        return url
    };


    const getIconByType = (type) => {
        const iconMapping = {
            SUBSCRIPTION: "ki-check-square",
            NEW_CLIENT: "ki-user",
            PRIVATE_SESSION: "ki-shield",
            FACILITY_RESERVATION: "ki-home-3",
            RESERVE_SPOT: "ki-pin",
            UPDATE: "ki-folder-added",
            PROFILE_UPDATE: "ki-folder-added",
            NOTIFICATION: "ki-notification",
        };

        return (
            <div className="symbol symbol-35px me-4">
        <span className="symbol-label bg-light-primary">
            <i className={`ki-duotone ${iconMapping[type]} fs-2 text-primary`}>
                <span className="path1"></span>
                <span className="path2"></span>
            </i>
        </span>
            </div>
        );
    }
    const renderNotificationDesign = (notification_obj) => {
        return (
            <div className="d-flex flex-stack py-4 notification" data-id={notification_obj.id}>
                <div className="d-flex align-items-center">
                    {getIconByType(notification_obj?.type)}
                    <div className="mb-0 me-2">
                        <a
                           className="fs-6 text-gray-800 text-hover-primary fw-bold">{notification_obj.content}</a>
                        <div className="text-gray-500 fs-7">
                            {notification_obj?.type?.replace(/_/g, ' ').toLowerCase()}
                        </div>
                        <span
                            className="badge badge-light fs-8">{formatDistanceToNow(parseISO(notification_obj.created_date), {addSuffix: true})}</span>
                    </div>
                </div>

                <button type="button"
                        className="btn btn-icon btn-sm h-auto btn-color-gray-500 btn-active-color-primary justify-content-end"
                        onClick={() => dismissNotificationHandler(notification_obj.id)}>
                    <i className="ki-duotone ki-abstract-11 fs-2"><span className="path1"></span><span
                        className="path2"></span></i></button>

            </div>
        )
    };

    const dismissNotificationHandler = (id) => {
        dismissNotification(id).then(response => {
            $(`.notification[data-id=${id}]`).addClass("d-none")
            dismissNotificationBullet();
        }).catch(() => {
        });
    }

    const dismissNotificationAllHandler = () => {
        dismissAllNotification().then(response => {
            $(`.notification`).addClass("d-none")
            dismissNotificationBullet();
        }).catch(() => {
        });
    }


    const renderOldMessages = () => {
        return oldMessages.map((msg, index) => (
            <div key={index}>
                {renderNotificationDesign(msg)}
            </div>
        ));
    }
    const dismissNotificationBullet = () => {
        $("#notification_bullet").addClass('invisible');
    }

    useEffect(() => {
        const drawer = document.getElementById('kt_drawer_chat');
        if (!drawer) return;

        const observer = new MutationObserver(() => {
            const isOpen = drawer.classList.contains('drawer-on');
            if (!isOpen) {
                // Remove overflow-hidden if drawer is closed
                document.body.classList.remove('overflow-hidden');
            }
        });

        observer.observe(drawer, {
            attributes: true,
            attributeFilter: ['class'], // only observe class changes
        });

        return () => {
            observer.disconnect(); // clean up on unmount
        };
    }, []);

    return (
        <Fragment>
            <div className="d-flex align-items-center ms-1 ms-lg-3" dir={direction}>
                <div
                    className="position-relative btn btn-icon btn-active-light-primary btn-custom w-30px h-30px w-md-40px h-md-40px"
                    id="kt_drawer_chat_toggle"
                    onClick={() => document.body.classList.add('overflow-hidden')}>
                    <i class="ki-duotone ki-notification-on fs-1">
                        <span class="path1"></span>
                        <span class="path2"></span>
                        <span class="path3"></span>
                        <span class="path4"></span>
                        <span class="path5"></span>
                    </i>
                    <span id={`notification_bullet`}
                          className={`${oldMessages.length == 0 && "invisible"} bullet bullet-dot bg-success h-6px w-6px position-absolute translate-middle top-0 start-50 animation-blink`}></span>
                </div>
            </div>

            <div id="kt_drawer_chat" className="bg-body" data-kt-drawer="true" data-kt-drawer-name="chat"
                 data-kt-drawer-activate="true"
                 data-kt-drawer-overlay="true"
                 data-kt-drawer-width="{default:'300px', 'md': '500px'}"
                 data-kt-drawer-direction={direction === 'rtl' ? 'start' : 'end'}
                 data-kt-drawer-toggle="#kt_drawer_chat_toggle"
                 data-kt-drawer-close="#kt_drawer_chat_close"
                 dir={direction}>
                <div className="card w-100 border-0 rounded-0" id="kt_drawer_chat_messenger">

                    <div className="card-header pe-5" id="kt_drawer_chat_messenger_header">

                        <div className="card-title">

                            <div className="d-flex justify-content-center flex-column me-3">
                                <a href="#"
                                   className="fs-4 fw-bold text-gray-900 text-hover-primary me-1 mb-2 lh-1">{Tools.translate('NOTIFICATIONS')}</a>

                                <div className="mb-0 lh-1">
                                    <span className="badge badge-success badge-circle w-10px h-10px me-1"></span>
                                    <span className="fs-7 fw-semibold text-muted margin-dir-2">{Tools.translate('ACTIVE')}</span>
                                </div>

                            </div>

                        </div>

                        <div className="card-toolbar">

                            <button onClick={dismissNotificationAllHandler}
                            title={Tools.translate('CLEAR_NOTIFICATION')}
                                className="btn btn-sm btn-icon btn-active-color-danger">
                                <i className="fa-regular fa-bell-slash fs-3"></i>
                            </button>

                            <button className="btn btn-sm btn-icon btn-active-color-primary" id="kt_drawer_chat_close"
                                title={Tools.translate('CLOSE')}
                                onClick={() => {
                                    document.body.classList.remove('overflow-hidden');
                                    dismissNotificationBullet();
                                }}>
                                <i className="ki-duotone ki-exit-right-corner fs-2">
                                    <span className="path1"></span>
                                    <span className="path2"></span>
                                </i>
                            </button>

                        </div>

                    </div>


                    <div className="card-body" id="kt_drawer_chat_messenger_body">

                        <div className="scroll-y me-n5 pe-5" data-kt-element="messages" data-kt-scroll="true"
                             data-kt-scroll-activate="true"
                             data-kt-scroll-height="auto"
                             data-kt-scroll-dependencies="#kt_drawer_chat_messenger_header, #kt_drawer_chat_messenger_footer"
                             data-kt-scroll-wrappers="#kt_drawer_chat_messenger_body" data-kt-scroll-offset="0px">

                            {messages.map((msg, index) => (
                                renderNotificationDesign(msg)
                            ))}
                            {renderOldMessages()}



                        </div>
                    </div>


                </div>


            </div>

        </Fragment>
    )
}
export default HeaderNotification;