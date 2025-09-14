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
                                    {'0'}
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
                            

                            <div className="px-1" style={{ height: 'calc(350px - 60px)', overflowY: 'auto' }}>
                                
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
                            
                            <div className="timeline timeline-border-dashed px-1 h-100" style={{ overflowY: 'auto' }}>
                                
                            </div>
                        </div>
                        <div className="card-footer py-3 d-flex justify-content-end align-items-center border-0">
                            <button
                                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                                className="btn text-gray-500"
                            >
                                {Tools.translate('PREVIOUS')}
                            </button>
                            <span className="align-self-center fw-bold text-gray-700 mx-3">
                            </span>
                            <button
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