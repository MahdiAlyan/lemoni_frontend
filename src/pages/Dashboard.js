import React, {Fragment, useEffect, useState} from "react";
import {adminDashboardKpis, listUserActivities} from "../calls/Api";
import Tools from "../config/Tools";

const Dashboard = () => {

    return (

        <Fragment>
            <div className="row flex-row g-3">
                <div className="col-xl-3">
                    <div className="card card-flush h-md-50 mb-xl-3" style={{
                            backgroundImage: "url('assets/media/patterns/pattern-1.jpg')",
                            backgroundPosition: "bottom",
                            backgroundSize: "cover"
                        }}>
                        <div className="card-header pt-5">
                            <div className="card-title d-flex flex-column">
                                <span className="fs-2hx fw-bold text-white me-2 lh-1 ls-n2">
                                    {newClients?.clients?.month?.count || '0'}
                                </span>
                                <span className="text-white pt-1 fw-semibold fs-6">
                                    {Tools.translate('NEW_CLIENTS_THIS_MONTH')}
                                </span>
                            </div>
                        </div>

                        <div className="card-body d-flex flex-column justify-content-end pe-0">
                            <span className="fs-6 fw-bolder text-white d-block mb-2 me-7">
                                {Tools.translate('TODAYS_NEW_CLIENTS')}
                            </span>

                            <div className="symbol-group symbol-hover flex-nowrap margin-dir-7">
                                {newClients?.clients?.today?.clients?.length > 0 ? (
                                    <>
                                        {newClients.clients.today.clients.slice(0, 4).map((client, index) => (
                                            <a
                                                href={`/client-form?public_id=${client.public_id}`}
                                                key={client.public_id}
                                                className="symbol symbol-35px symbol-circle"
                                                data-bs-toggle="tooltip"
                                                title={`${client.first_name} ${client.last_name}`}
                                            >
                                                <span
                                                    className={`symbol-label bg-${['primary', 'warning', 'danger', 'info'][index % 4]} text-inverse-${['primary', 'warning', 'danger', 'info'][index % 4]} fw-bold`}
                                                >
                                                    {Tools.getInitials2(client?.first_name || '?', client?.last_name || '')}
                                                </span>
                                            </a>
                                        ))}

                                        {newClients.clients.today.clients.length > 4 && (
                                            <a
                                                href="/clients"
                                                className="symbol symbol-35px symbol-circle"
                                                data-bs-toggle="tooltip"
                                                title="View all"
                                            >
                                                <span className="symbol-label bg-light text-gray-400 fs-8 fw-bold">
                                                    +{newClients.clients.today.clients.length - 4}
                                                </span>
                                            </a>
                                        )}
                                    </>
                                ) : (
                                    <span className="text-muted text-gray-600 fw-bold fs-7 margin-dir-7">{Tools.translate('NO_NEW_CLIENTS_FOT_TODAY')}</span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div class="card card-flush h-md-50 mb-5">
                        <a href="/store" class="card card-xxl-stretch bgi-no-repeat bgi-size-contain bgi-position-x-end h-xl-100" style={{
                            backgroundImage: "url('assets/media/patterns/pattern-1.jpg')",
                            backgroundPosition: "bottom",
                            backgroundSize: "cover"
                        }}>
                            <div class="card-body d-flex flex-column justify-content-between">
                                <i class="ki-duotone ki-element-11 fs-2hx ms-n1 flex-grow-1 text-white">
                                    <span class="path1"></span>
                                    <span class="path2"></span>
                                    <span class="path3"></span>
                                    <span class="path4"></span>
                                </i>
                                <div class="d-flex flex-column">
                                    <div class="text-white fw-bold fs-1 mb-0 mt-5">
                                        {newClients?.products?.total_count || '0'}
                                     </div>
                                    <div class="text-white fw-semibold fs-6">
                                       {Tools.translate('NEW_PRODCUTS')}          </div>
                                </div>
                            </div>
                        </a>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card h-100">
                        <div className="card-header border-0 pt-5 pb-0">
                            <h3 className="card-title fw-bold text-gray-800">
                                {Tools.translate('TODAYS_SCHEDULE')} 
                            </h3>
                        </div>
                        <div className="card-body position-relative px-5" style={{ minHeight: '350px' }}>
                            {todayReservationsLoading && (
                                <div
                                    className="position-absolute top-0 start-0 h-100 w-100 d-flex align-items-center justify-content-center bg-white bg-opacity-75 z-index-1">
                                    <div className="text-center">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">{Tools.translate('LOADING')}</span>
                                        </div>
                                        <p className="mt-2 text-muted">{Tools.translate('LOADING')}</p>
                                    </div>
                                </div>
                            )}

                            <div className="px-1" style={{ height: 'calc(350px - 60px)', overflowY: 'auto' }}>
                                {!todayReservationsLoading && todayReservations.length > 0 ? (
                                    todayReservations.map((activity, index) => (
                                        <React.Fragment key={activity.public_id}>
                                            <div className="d-flex align-items-center">
                                                <div
                                                    className="symbol symbol-30px me-5"
                                                    data-bs-toggle="tooltip"
                                                    data-bs-placement="top"
                                                    title={activity.package_type}
                                                >
                                                    <span className="symbol-label">
                                                        {getPackageIcon(activity.package_type)}
                                                    </span>
                                                </div>

                                                <div
                                                    className="d-flex align-items-center flex-stack flex-wrap d-grid gap-1 flex-row-fluid">
                                                    <div className="me-5">
                                                        <a
                                                            className="text-gray-800 fw-bold text-hover-warning fs-6">
                                                            {activity.package_name}
                                                        </a>
                                                        <span
                                                            className={`text-gray-500 fw-semibold fs-7 d-block ps-0 ${direction === 'ltr' ? 'text-start' : 'text-end'}`}>
                                                            {direction === 'rtl' ? (
                                                                <>
                                                                    <span dir="ltr">{formatTime(activity.start_time)}</span>
                                                                    {' - '}
                                                                    <span dir="ltr">{formatTime(activity.end_time)}</span>
                                                                </>
                                                            ) : (
                                                                `${formatTime(activity.start_time)} - ${formatTime(activity.end_time)}`
                                                            )}
                                                        </span>
                                                        <span
                                                            className={`text-gray-500 fw-semibold fs-7 d-block ps-0 ${direction === 'ltr' ? 'text-start' : 'text-end'}`}>
                                                            {activity.facility}
                                                        </span>
                                                    </div>

                                                    <div className="d-flex align-items-center">
                                                        <span
                                                            className="text-gray-800 fw-bold fs-5 mx-3"
                                                            data-bs-toggle="tooltip"
                                                            data-bs-html="true"
                                                            data-bs-placement="top"
                                                            title={activity.reserved_users.length > 0
                                                                ? `<div class="${direction === 'rtl' ? 'text-end' : 'text-start'}"><strong>${Tools.translate('RESERVED_CLIENTS')}:</strong><ul class="mb-0 ps-3">${activity.reserved_users.map(user =>
                                                                    `<li>${user.full_name}</li>`
                                                                ).join('')
                                                                }</ul></div>`
                                                                : Tools.translate('NO_USERS_RESERVED_YET')}
                                                        >
                                                            {activity.reserved_users.length}/{activity.capacity}
                                                        </span>
                                                        <span
                                                            className={`badge badge-light-${activity.reserved_users.length > 0 ? 'success' : 'danger'} fs-base`}>
                                                            {activity.reserved_users.length > 0 ? (
                                                                <>
                                                                    <i className="ki-duotone ki-arrow-up fs-5 text-success ms-n1">
                                                                        <span className="path1"></span>
                                                                        <span className="path2"></span>
                                                                    </i>
                                                                    {activity.reserved_users.length}
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <i className="ki-duotone ki-arrow-down fs-5 text-danger ms-n1">
                                                                        <span className="path1"></span>
                                                                        <span className="path2"></span>
                                                                    </i>
                                                                    0
                                                                </>
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Separator (except after last item) */}
                                            {index < todayReservations.length - 1 && (
                                                <div className="separator separator-dashed my-3"></div>
                                            )}
                                        </React.Fragment>
                                    ))
                                ) : (
                                    !todayReservationsLoading && (
                                        <div className="col-12 text-center py-10">
                                            <div className="d-flex flex-column align-items-center">
                                                <i className="ki-duotone ki-element-11 fs-2hx text-gray-400 mb-4">
                                                    <span className="path1"></span>
                                                    <span className="path2"></span>
                                                </i>
                                                <h3 className="text-gray-600">{Tools.translate('NO_ACTIVTIES_FOUND')}</h3>
                                                <p className="text-muted">{Tools.translate('THERE_IS_NO_ACTIVTIES_FOR_TODAY')}</p>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="card h-100 d-flex flex-column">
                        <div className="card-header border-0 pt-5 pb-0">
                            <h3 className="card-title fw-bold text-gray-800">
                                {Tools.translate('TODAYS_CLIENTS_ACTIVITY')}
                            </h3>
                        </div>
                        <div className="card-body position-relative px-5 flex-grow-1" style={{ minHeight: '300px' }}>
                            {activityLoading && (
                                <div className="position-absolute top-0 start-0 h-100 w-100 d-flex align-items-center justify-content-center bg-white bg-opacity-75 z-index-1">
                                    <div className="text-center">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">{Tools.translate('LOADING')}</span>
                                        </div>
                                        <p className="mt-2 text-muted">Loading activities...</p>
                                    </div>
                                </div>
                            )}
                            <div className="timeline timeline-border-dashed px-1 h-100" style={{ overflowY: 'auto' }}>
                                {(!activityLoading && activities.length === 0) ? (
                                    <div className="text-center py-10 h-100 d-flex flex-column justify-content-center align-items-center">
                                        <i className="ki-duotone ki-information fs-2x text-muted">
                                            <span className="path1"></span>
                                            <span className="path2"></span>
                                            <span className="path3"></span>
                                        </i>
                                        <div className="mt-4">
                                            <h4 className="text-gray-600">{Tools.translate('NO_ACTIVTIES_FOUND')}</h4>
                                            <p className="text-muted">{Tools.translate('THERE_IS_NO_ACTIVTIES_FOR_TODAY')}</p>
                                        </div>
                                    </div>
                                ) : (
                                    activities.map((log, index) => (
                                        <div className="timeline-item" key={index}>
                                            <div className="timeline-line"></div>
                                            <div className="timeline-icon me-4">
                                                {log.category === 'ACCOUNT_MANAGER' ? (
                                                    <i className="ki-duotone ki-user-square fs-2 text-gray-500">
                                                        <span className="path1"></span>
                                                        <span className="path2"></span>
                                                        <span className="path3"></span>
                                                    </i>
                                                ) : (
                                                    <i className="ki-duotone ki-flag fs-2 text-gray-500">
                                                        <span className="path1"></span>
                                                        <span className="path2"></span>
                                                    </i>
                                                )}
                                            </div>
                                            <div className="timeline-content mb-10 mt-n2">
                                                <div className="overflow-auto pe-3">
                                                    <div className="fs-5 fw-semibold mb-2">{log.action}</div>
                                                    <div className="d-flex align-items-center mt-1 fs-6">
                                                        <div className="text-muted me-2 fs-7">
                                                            {new Date(log.created_at).toLocaleString('en-US', {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                                hour12: true,
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                        <div className="card-footer py-3 d-flex justify-content-end align-items-center border-0">
                            <button
                                disabled={pagination.has_previous === false}
                                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                                className="btn text-gray-500"
                            >
                                {Tools.translate('PREVIOUS')}
                            </button>
                            <span className="align-self-center fw-bold text-gray-700 mx-3">
                                {Tools.translate('PAGE')} {pagination?.current ? pagination?.current : '0'} {Tools.translate('OF')} {pagination.num_pages ? pagination?.num_pages : '0'}
                            </span>
                            <button
                                disabled={pagination.has_next === false}
                                onClick={() => setPage((p) => (pagination.num_pages ? Math.min(p + 1, pagination.num_pages) : p + 1))}
                                className="btn text-gray-500"
                            >
                                {Tools.translate('NEXT')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>

    );
}
export default Dashboard;