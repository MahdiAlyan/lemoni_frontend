import React from "react";
import Tools from "../../config/Tools";

const HeaderTheme = () => {


    return (


        <div className="d-flex align-items-center ms-1 ms-lg-3">

            <a href="#" className="btn btn-icon btn-active-light-primary btn-custom w-30px h-30px w-md-40px h-md-40px"
               data-kt-menu-trigger="{default:'click', lg: 'hover'}" data-kt-menu-attach="parent" data-kt-menu-placement="bottom-end">
                <i className="ki-duotone ki-night-day theme-light-show fs-1">
                    <span className="path1"></span>
                    <span className="path2"></span>
                    <span className="path3"></span>
                    <span className="path4"></span>
                    <span className="path5"></span>
                    <span className="path6"></span>
                    <span className="path7"></span>
                    <span className="path8"></span>
                    <span className="path9"></span>
                    <span className="path10"></span>
                </i>
                <i className="ki-duotone ki-moon theme-dark-show fs-1">
                    <span className="path1"></span>
                    <span className="path2"></span>
                </i>
            </a>


            <div
                className="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-title-gray-700 menu-icon-gray-500 menu-active-bg menu-state-color fw-semibold py-4 fs-base w-150px"
                data-kt-menu="true" data-kt-element="theme-mode-menu">

                <div className="menu-item px-3 my-0">
                    <a href="#" className="menu-link px-3 py-2" data-kt-element="mode" data-kt-value="light">
													<span className="menu-icon" data-kt-element="icon">
														<i className="ki-duotone ki-night-day fs-2">
															<span className="path1"></span>
															<span className="path2"></span>
															<span className="path3"></span>
															<span className="path4"></span>
															<span className="path5"></span>
															<span className="path6"></span>
															<span className="path7"></span>
															<span className="path8"></span>
															<span className="path9"></span>
															<span className="path10"></span>
														</i>
													</span>
                        <span className="menu-title">{Tools.translate('LIGHT')}</span>
                    </a>
                </div>


                <div className="menu-item px-3 my-0">
                    <a href="#" className="menu-link px-3 py-2" data-kt-element="mode" data-kt-value="dark">
													<span className="menu-icon" data-kt-element="icon">
														<i className="ki-duotone ki-moon fs-2">
															<span className="path1"></span>
															<span className="path2"></span>
														</i>
													</span>
                        <span className="menu-title">{Tools.translate('DARK')}</span>
                    </a>
                </div>


                <div className="menu-item px-3 my-0">
                    <a href="#" className="menu-link px-3 py-2" data-kt-element="mode" data-kt-value="system">
													<span className="menu-icon" data-kt-element="icon">
														<i className="ki-duotone ki-screen fs-2">
															<span className="path1"></span>
															<span className="path2"></span>
															<span className="path3"></span>
															<span className="path4"></span>
														</i>
													</span>
                        <span className="menu-title">{Tools.translate('SYSTEM')}</span>
                    </a>
                </div>

            </div>

        </div>

    )
}
export default HeaderTheme;