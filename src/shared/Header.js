import React, { useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import HeaderNotification from "./Header/HeaderNotification";
import HeaderTheme from "./Header/HeaderTheme";
import HeaderUser from "./Header/HeaderUser";
import Auth from "../config/Auth";
import Tools from "../config/Tools";

const Header = () => {
  const location = useLocation();
  const direction = localStorage.getItem("appDirection") || "ltr";

  return (
    <div
      id="kt_header"
      className="header align-items-stretch mb-5 mb-lg-10"
      data-kt-sticky="true"
      data-kt-sticky-name="header"
      data-kt-sticky-offset="{default: '200px', lg: '300px'}"
    >
      <div className="container-fluid d-flex align-items-center">
        <div
          className="d-flex topbar align-items-center d-lg-none ms-n2 me-3"
          title="Show aside menu"
        >
          <div
            className="btn btn-icon btn-active-light-primary btn-custom w-30px h-30px w-md-40px h-md-40px"
            id="kt_header_menu_mobile_toggle"
          >
            <i className="ki-duotone ki-abstract-14 fs-1">
              <span className="path1" />
              <span className="path2" />
            </i>
          </div>
        </div>
        <div className="header-logo me-5 me-md-10 flex-grow-1 flex-lg-grow-0">
          <a href="/">
            <img
              src="/assets/media/logos/icon.png"
              alt="LEMONI Logo"
              className="h-40px"
            />
          </a>
        </div>
        <div className="d-flex align-items-stretch justify-content-between flex-lg-grow-1">
          <div className="d-flex align-items-stretch" id="kt_header_nav">
            <div
              className="header-menu align-items-stretch"
              data-kt-drawer="true"
              data-kt-drawer-name="header-menu"
              data-kt-drawer-activate="{default: true, lg: false}"
              data-kt-drawer-overlay="true"
              data-kt-drawer-width="{default:'200px', '300px': '250px'}"
              data-kt-drawer-direction="start"
              data-kt-drawer-toggle="#kt_header_menu_mobile_toggle"
              data-kt-swapper="true"
              data-kt-swapper-mode="prepend"
              data-kt-swapper-parent="{default: '#kt_body', lg: '#kt_header_nav'}"
            >
              <div
                className="menu menu-rounded menu-column menu-lg-row menu-active-bg menu-title-gray-700
                                menu-state-primary menu-arrow-gray-500 fw-semibold my-5 my-lg-0 align-items-stretch px-2 px-lg-0"
                id="#kt_header_menu"
                data-kt-menu="true"
              >
                {/*# DASHBOARD*/}

                {Auth.getUserRole() !== "STORE_MANAGER" && (
                  <div
                    data-kt-menu-trigger="{default: 'click', lg: 'hover'}"
                    data-kt-menu-placement="bottom-start"
                    className={`menu-item ${
                      location.pathname === "/" ? "here show menu-here-bg" : ""
                    } menu-lg-down-accordion me-0 me-lg-2`}
                  >
                    <a href="/" className="menu-link ">
                      <span className="menu-link py-3">
                        <span className="menu-title">
                          {Tools.translate("DASHBOARD")}
                        </span>
                      </span>
                    </a>
                  </div>
                )}

                {(Auth.getUserRole() === "ADMIN") && (
                  <>
                    <>
                      <div
                        data-kt-menu-trigger="{default: 'click', lg: 'hover'}"
                        data-kt-menu-placement="bottom-start"
                        className={`menu-item ${
                          location.pathname === "/calendar"
                            ? "here show menu-here-bg"
                            : ""
                        } menu-lg-down-accordion me-0 me-lg-2`}
                      >
                        <a href="/calendar" className="menu-link ">
                          <span className="menu-link py-3">
                            <span className="menu-title">
                              {Tools.translate("CALENDAR")}
                            </span>
                          </span>
                        </a>
                      </div>
                    </>

                    <div
                      data-kt-menu-trigger="{default: 'click', lg: 'hover'}"
                      data-kt-menu-placement="bottom-start"
                      className={`menu-item ${
                        location.pathname === "/clients"
                          ? "here show menu-here-bg"
                          : location.pathname === "/client-form"
                          ? "here show menu-here-bg"
                          : ""
                      } menu-lg-down-accordion me-0 me-lg-2`}
                    >
                      <a href="/clients" className="menu-link ">
                        <span className="menu-link py-3">
                          <span className="menu-title">
                            {Tools.translate("CLIENTS")}
                          </span>
                        </span>
                      </a>
                    </div>

                    <div
                      data-kt-menu-trigger="{default: 'click', lg: 'hover'}"
                      data-kt-menu-placement="bottom-start"
                      className={`menu-item ${
                        location.pathname === "/mydrones"
                          ? "here show menu-here-bg"
                          : ""
                      } menu-lg-down-accordion me-0 me-lg-2`}
                    >
                      <a href="/mydrones" className="menu-link ">
                        <span className="menu-link py-3">
                          <span className="menu-title">
                            {Tools.translate("MYDRONES")}
                          </span>
                        </span>
                      </a>
                    </div>

                    <div
                      data-kt-menu-trigger="{default: 'click', lg: 'hover'}"
                      data-kt-menu-placement="bottom-start"
                      className={`menu-item ${
                        location.pathname === "/missions"
                          ? "here show menu-here-bg"
                          : ""
                      } menu-lg-down-accordion me-0 me-lg-2`}
                    >
                      <a href="/missions" className="menu-link ">
                        <span className="menu-link py-3">
                          <span className="menu-title">
                            {Tools.translate("MISSIONS")}
                          </span>
                        </span>
                      </a>
                    </div>

                    <div
                      data-kt-menu-trigger="{default: 'click', lg: 'hover'}"
                      data-kt-menu-placement="bottom-start"
                      className={`menu-item ${
                        location.pathname === "/analytics"
                          ? "here show menu-here-bg"
                          : ""
                      } menu-lg-down-accordion me-0 me-lg-2`}
                    >
                      <a href="/analytics" className="menu-link ">
                        <span className="menu-link py-3">
                          <span className="menu-title">
                            {Tools.translate("ANALYTICS")}
                          </span>
                        </span>
                      </a>
                    </div>

                  </>
                )}
              </div>
            </div>
          </div>

          {/*right toolbar wrapper*/}
          <div className="topbar d-flex align-items-stretch flex-shrink-0">
            <HeaderNotification />
            <HeaderTheme />
            <HeaderUser />
          </div>
        </div>
      </div>
    </div>
  );
};
export default Header;
