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
              src="/assets/media/logos/logo.png"
              alt="ALAZEM Logo"
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

                {(Auth.getUserRole() === "ADMIN" ||
                  Auth.getUserRole() === "MANAGER" ||
                  Auth.getUserRole() === "CASHIER") && (
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
                        location.pathname === "/private-sessions" ||
                        location.pathname === "/facility-reservation"
                          ? "here show menu-here-bg"
                          : ""
                      } menu-lg-down-accordion me-0 me-lg-2`}
                    >
                      <a className="menu-link ">
                        <span className="menu-link py-3">
                          <span className="menu-title">
                            {Tools.translate("RENTAL")}
                          </span>
                          <span className="menu-arrow d-lg-none"></span>
                        </span>
                      </a>
                      <div className="menu-sub menu-sub-lg-down-accordion menu-sub-lg-dropdown px-lg-2 py-lg-4 w-lg-200px">
                        <div className="menu-item">
                          <a
                            href="/facility-reservation"
                            className={`menu-link ${
                              location.pathname === "/facility-reservation"
                                ? "active"
                                : ""
                            }`}
                          >
                            <span className="menu-custom-icon d-flex flex-center flex-shrink-0 rounded me-3">
                              <i className="ki-duotone ki-home-3 fs-1 text-primary">
                                <span className="path1"></span>
                                <span className="path2"></span>
                              </i>
                            </span>
                            <span className="menu-title me-1">
                              {Tools.translate("FACILITY_RESERVATION")}
                            </span>
                          </a>
                        </div>

                        <div className="menu-item">
                          <a
                            href="/private-sessions"
                            className={`menu-link ${
                              location.pathname === "/private-sessions"
                                ? "active"
                                : ""
                            }`}
                          >
                            <span className="menu-custom-icon d-flex flex-center flex-shrink-0 rounded me-3">
                              <i className="ki-duotone ki-lock fs-1 text-primary">
                                <span className="path1"></span>
                                <span className="path2"></span>
                                <span className="path3"></span>
                              </i>
                            </span>
                            <span className="menu-title me-1">
                              {Tools.translate("PRIVATE_SESSIONS")}
                            </span>
                          </a>
                        </div>
                        {Auth.getUserRole() !== "CASHIER" && (
                          <div className="menu-item">
                            <a
                              // href="/reserve-spot"
                              className={`menu-link ${
                                location.pathname === "/" ? "active" : ""
                              }`}
                            >
                              <span className="menu-custom-icon d-flex flex-center flex-shrink-0 rounded me-3">
                                <i className="ki-duotone ki-security-check text-primary fs-1">
                                  <span className="path1"></span>
                                  <span className="path2"></span>
                                  <span className="path3"></span>
                                  <span className="path4"></span>
                                </i>
                              </span>
                              <span className="menu-title me-1">
                                {Tools.translate("RESERVE_SPOT")}
                              </span>
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {Auth.getUserRole() !== "CASHIER" && (
                      <>
                        <div
                          data-kt-menu-trigger="{default: 'click', lg: 'hover'}"
                          data-kt-menu-placement="bottom-start"
                          className={`menu-item ${
                            location.pathname === "/client-invoice"
                              ? "here show menu-here-bg"
                              : ""
                          } menu-lg-down-accordion me-0 me-lg-2`}
                        >
                          <a className="menu-link ">
                            <span className="menu-link py-3">
                              <span className="menu-title">
                                {Tools.translate("ACCOUNTING")}
                              </span>
                              <span className="menu-arrow d-lg-none"></span>
                            </span>
                          </a>
                          <div className="menu-sub menu-sub-lg-down-accordion menu-sub-lg-dropdown px-lg-2 py-lg-4 w-lg-200px">
                            <div className="menu-item">
                              <a
                                href="/client-invoice"
                                className={`menu-link ${
                                  location.pathname === "/unit" ? "active" : ""
                                }`}
                              >
                                <span className="menu-custom-icon d-flex flex-center flex-shrink-0 rounded me-3">
                                  <i className="ki-duotone ki-badge text-primary fs-1">
                                    <span className="path1"></span>
                                    <span className="path2"></span>
                                    <span className="path3"></span>
                                    <span className="path4"></span>
                                    <span className="path5"></span>
                                  </i>
                                </span>
                                <span className="menu-title me-1">
                                  {Tools.translate("CLIENT_INVOICES")}
                                </span>
                              </a>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}

                {(Auth.getUserRole() === "ADMIN" ||
                  Auth.getUserRole() === "MANAGER" ||
                  Auth.getUserRole() === "STORE_MANAGER") && (
                  <>
                    <div
                      data-kt-menu-trigger="{default: 'click', lg: 'hover'}"
                      data-kt-menu-placement="bottom-start"
                      className={`menu-item ${
                        location.pathname === "/store" ||
                        location.pathname === "/brands-list" ||
                        location.pathname === "/categories-list" ||
                        location.pathname === "/product-form"
                          ? "here show menu-here-bg"
                          : ""
                      } menu-lg-down-accordion me-0 me-lg-2`}
                    >
                      <a className="menu-link ">
                        <span className="menu-link py-3">
                          <span className="menu-title">
                            {Tools.translate("STORE")}
                          </span>
                          <span className="menu-arrow d-lg-none"></span>
                        </span>
                      </a>
                      <div className="menu-sub menu-sub-lg-down-accordion menu-sub-lg-dropdown px-lg-2 py-lg-4 w-lg-150px">
                        <div className="menu-item">
                          <a
                            href="/store"
                            className={`menu-link ${
                              location.pathname === "/store" ? "active" : ""
                            }`}
                          >
                            <span className="menu-custom-icon d-flex flex-center flex-shrink-0 rounded me-3">
                              <i className="ki-duotone ki-shop fs-2 text-primary">
                                <span className="path1"></span>
                                <span className="path2"></span>
                                <span className="path3"></span>
                                <span className="path4"></span>
                                <span className="path5"></span>
                              </i>
                            </span>
                            <span className="menu-title me-1">
                              {Tools.translate("PRODUCTS")}
                            </span>
                          </a>
                        </div>

                        <div className="menu-item">
                          <a
                            href="/brands-list"
                            className={`menu-link ${
                              location.pathname === "/brands-list"
                                ? "active"
                                : ""
                            }`}
                          >
                            <span className="menu-custom-icon d-flex flex-center flex-shrink-0 rounded me-2">
                              <i className="ki-duotone ki-package fs-1 text-primary">
                                <span className="path1"></span>
                                <span className="path2"></span>
                                <span className="path3"></span>
                              </i>
                            </span>
                            <span className="menu-title me-1">
                              {Tools.translate("BRANDS")}
                            </span>
                          </a>
                        </div>
                        <div className="menu-item">
                          <a
                            href="/categories-list"
                            className={`menu-link ${
                              location.pathname === "/categories-list"
                                ? "active"
                                : ""
                            }`}
                          >
                            <span className="menu-custom-icon d-flex flex-center flex-shrink-0 rounded me-3">
                              <i className="ki-duotone ki-category fs-3 text-primary">
                                <span className="path1"></span>
                                <span className="path2"></span>
                                <span className="path3"></span>
                                <span className="path4"></span>
                              </i>
                            </span>
                            <span className="menu-title me-1">
                              {Tools.translate("CATEGORIES")}
                            </span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {(Auth.getUserRole() === "ADMIN" ||
                  Auth.getUserRole() === "MANAGER") && (
                  <div
                    data-kt-menu-trigger="{default: 'click', lg: 'hover'}"
                    data-kt-menu-placement="bottom-start"
                    className={`menu-item ${
                      location.pathname === "/trainers" ||
                      location.pathname === "/users" ||
                      location.pathname === "/discounts" ||
                      location.pathname === "/subscription-management" ||
                      location.pathname === "/memberships" ||
                      location.pathname === "/facility" ||
                      location.pathname === "/classes" ||
                      location.pathname === "/Courses" ||
                      location.pathname === "/leads"
                        ? "here show menu-here-bg"
                        : ""
                    } menu-lg-down-accordion me-0 me-lg-2`}
                  >
                    <a className="menu-link ">
                      <span className="menu-link py-3">
                        <span className="menu-title">
                          {Tools.translate("MANAGEMENT")}
                        </span>
                        <span className="menu-arrow d-lg-none"></span>
                      </span>
                    </a>

                    <div className="menu-sub menu-sub-lg-down-accordion menu-sub-lg-dropdown p-0 w-100 w-lg-600px">
                      <div
                        className="menu-state-bg menu-extended overflow-hidden overflow-lg-visible"
                        data-kt-menu-dismiss="true"
                      >
                        <div className="row">
                          <div className="col-lg-8 mb-3 mb-lg-0 py-3 px-3 py-lg-6 px-lg-6">
                            <div className="row">
                              <div className="col-lg-6 mb-3">
                                <div className="menu-item p-0 m-0">
                                  <a
                                    href="/trainers"
                                    className={`menu-link ${
                                      location.pathname === "/trainers"
                                        ? "active"
                                        : ""
                                    }`}
                                  >
                                    <span className="menu-custom-icon d-flex flex-center flex-shrink-0 rounded w-40px h-40px me-3">
                                      <i className="ki-duotone ki-profile-user text-primary fs-1">
                                        <span className="path1" />
                                        <span className="path2" />
                                        <span className="path3" />
                                        <span className="path4" />
                                      </i>
                                    </span>
                                    <span className="d-flex flex-column">
                                      <span className="fs-6 fw-bold text-gray-800">
                                        {Tools.translate("TRAINERS")}
                                      </span>
                                      <span className="fs-7 fw-semibold text-muted">
                                        {Tools.translate(
                                          "MANAGE_TRAINERS_ACCESSIBILITY"
                                        )}
                                      </span>
                                    </span>
                                  </a>
                                </div>
                              </div>
                              <div className="col-lg-6 mb-3">
                                <div className="menu-item p-0 m-0">
                                  <a
                                    href="/users"
                                    className={`menu-link ${
                                      location.pathname === "/users"
                                        ? "active"
                                        : ""
                                    }`}
                                  >
                                    <span className="menu-custom-icon d-flex flex-center flex-shrink-0 rounded w-40px h-40px me-3">
                                      <i className="ki-duotone ki-user-edit text-danger fs-1">
                                        <span className="path1" />
                                        <span className="path2" />
                                        <span className="path3" />
                                        <span className="path4" />
                                      </i>
                                    </span>
                                    <span className="d-flex flex-column">
                                      <span className="fs-6 fw-bold text-gray-800">
                                        {Tools.translate("USERS")}
                                      </span>
                                      <span className="fs-7 fw-semibold text-muted">
                                        {Tools.translate("STAFF_TEAM")}
                                      </span>
                                    </span>
                                  </a>
                                </div>
                              </div>
                            </div>

                            <div className="separator separator-dashed mx-5 my-5" />
                            <div className="row">
                              <div className="col-lg-6 mb-3">
                                <div className="menu-item p-0 m-0">
                                  <a
                                    href="/notifications"
                                    className={`menu-link ${
                                      location.pathname === "/notifications"
                                        ? "active"
                                        : ""
                                    }`}
                                  >
                                    <span className="menu-custom-icon d-flex flex-center flex-shrink-0 rounded w-40px h-40px me-3">
                                      <i className="ki-duotone ki-notification-bing text-warning fs-1">
                                        <span className="path1" />
                                        <span className="path2" />
                                        <span className="path3" />
                                        <span className="path4" />
                                      </i>
                                    </span>
                                    <span className="d-flex flex-column">
                                      <span className="fs-6 fw-bold text-gray-800">
                                        {Tools.translate("NOTIFICATIONS")}
                                      </span>
                                      <span className="fs-7 fw-semibold text-muted">
                                        {Tools.translate(
                                          "NOTIFICATIONS_MANAGEMENT"
                                        )}
                                      </span>
                                    </span>
                                  </a>
                                </div>
                              </div>
                              <div className="col-lg-6 mb-3">
                                <div className="menu-item p-0 m-0">
                                  <a
                                    href="/discounts"
                                    className={`menu-link ${
                                      location.pathname === "/discounts"
                                        ? "active"
                                        : ""
                                    }`}
                                  >
                                    <span className="menu-custom-icon d-flex flex-center flex-shrink-0 rounded w-40px h-40px me-3">
                                      <i class="ki-duotone ki-discount fs-2x text-info">
                                        <span class="path1"></span>
                                        <span class="path2"></span>
                                      </i>
                                    </span>
                                    <span className="d-flex flex-column">
                                      <span className="fs-6 fw-bold text-gray-800">
                                        {Tools.translate("CAMPAIGNS")}
                                      </span>
                                      <span className="fs-7 fw-semibold text-muted">
                                        {Tools.translate(
                                          "CAMPAIGNS_MANAGEMENT"
                                        )}
                                      </span>
                                    </span>
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div
                            className={`menu-more bg-light col-lg-4 py-3 px-3 py-lg-6 px-lg-6 ${
                              direction === "ltr"
                                ? "rounded-end"
                                : "rounded-start"
                            }`}
                          >
                            <h4 className="fs-6 fs-lg-4 text-gray-800 fw-bold mt-3 mb-3 ms-4">
                              {Tools.translate("MORE_SETTINGS")}
                            </h4>

                            <div className="menu-item p-0 m-0">
                              <a
                                href="/subscription-management"
                                className={`menu-link py-2 ${
                                  location.pathname ===
                                  "/subscription-management"
                                    ? "active here"
                                    : ""
                                }`}
                              >
                                <span className="menu-title">
                                  {Tools.translate("SUBSCRIPTION")}
                                </span>
                              </a>
                            </div>
                            <div className="menu-item p-0 m-0">
                              <a
                                href="/memberships"
                                className={`menu-link py-2 ${
                                  location.pathname === "/memberships"
                                    ? "active here"
                                    : ""
                                }`}
                              >
                                <span className="menu-title">
                                  {Tools.translate("MEMBERSHIPS")}
                                </span>
                              </a>
                            </div>
                            <div className="menu-item p-0 m-0">
                              <a
                                href="/facility"
                                className={`menu-link py-2 ${
                                  location.pathname === "/facility"
                                    ? "active here"
                                    : ""
                                }`}
                              >
                                <span className="menu-title">
                                  {Tools.translate("FACILITIES")}
                                </span>
                              </a>
                            </div>
                            <div className="menu-item p-0 m-0">
                              <a
                                href="/classes"
                                className={`menu-link py-2 ${
                                  location.pathname === "/classes"
                                    ? "active here"
                                    : ""
                                }`}
                              >
                                <span className="menu-title">
                                  {Tools.translate("CLASSES")}
                                </span>
                              </a>
                            </div>
                            <div className="menu-item p-0 m-0">
                              <a
                                href="/Courses"
                                className={`menu-link py-2 ${
                                  location.pathname === "/Courses"
                                    ? "active here"
                                    : ""
                                }`}
                              >
                                <span className="menu-title">
                                  {Tools.translate("COURSES")}
                                </span>
                              </a>
                            </div>
                            <div className="menu-item p-0 m-0">
                              <a
                                href="/leads"
                                className={`menu-link py-2 ${
                                  location.pathname === "/leads"
                                    ? "active here"
                                    : ""
                                }`}
                              >
                                <span className="menu-title">
                                  {Tools.translate("LEADS")}
                                </span>
                              </a>
                            </div>
                            <div className="menu-item p-0 m-0">
                              <a
                                href="/lemoni-configuration"
                                className={`menu-link py-2 ${
                                  location.pathname === "/lemoni-configuration"
                                    ? "active here"
                                    : ""
                                }`}
                              >
                                <span className="menu-title">
                                  {Tools.translate("CONFIGURATIONS")}
                                </span>
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* cashier managements */}
                {Auth.getUserRole() === "CASHIER" && (
                  <div
                    data-kt-menu-trigger="{default: 'click', lg: 'hover'}"
                    data-kt-menu-placement="bottom-start"
                    className={`menu-item ${
                      location.pathname === "/classes" ||
                      location.pathname === "/Courses"
                        ? "here show menu-here-bg"
                        : ""
                    } menu-lg-down-accordion me-0 me-lg-2`}
                  >
                    <a className="menu-link ">
                      <span className="menu-link py-3">
                        <span className="menu-title">
                          {Tools.translate("MANAGEMENT")}
                        </span>
                        <span className="menu-arrow d-lg-none"></span>
                      </span>
                    </a>

                    <div className="menu-sub menu-sub-lg-down-accordion menu-sub-lg-dropdown p-0 w-100 w-lg-400px">
                      <div
                        className="menu-state-bg menu-extended overflow-hidden overflow-lg-visible"
                        data-kt-menu-dismiss="true"
                      >
                        <div className="row">
                          <div className="col-lg-12 mb-3 mb-lg-0 py-3 px-3 py-lg-6 px-lg-6">
                            <div className="row">
                              <div className="col-lg-6 mb-3">
                                <div className="menu-item p-0 m-0">
                                  <a
                                    href="/classes"
                                    className={`menu-link ${
                                      location.pathname === "/classes"
                                        ? "active"
                                        : ""
                                    }`}
                                  >
                                    <span className="menu-custom-icon d-flex flex-center flex-shrink-0 rounded w-40px h-40px me-3">
                                      <i class="ki-duotone ki-abstract-26 text-primary fs-1">
                                        <span class="path1"></span>
                                        <span class="path2"></span>
                                      </i>
                                    </span>
                                    <span className="d-flex flex-column">
                                      <span className="fs-6 fw-bold text-gray-800">
                                        {Tools.translate("CLASSES")}
                                      </span>
                                    </span>
                                  </a>
                                </div>
                              </div>
                              <div className="col-lg-6 mb-3">
                                <div className="menu-item p-0 m-0">
                                  <a
                                    href="/Courses"
                                    className={`menu-link ${
                                      location.pathname === "/Courses"
                                        ? "active"
                                        : ""
                                    }`}
                                  >
                                    <span className="menu-custom-icon d-flex flex-center flex-shrink-0 rounded w-40px h-40px me-3">
                                      <i class="ki-duotone ki-book-open text-danger fs-1">
                                        <span class="path1"></span>
                                        <span class="path2"></span>
                                        <span class="path3"></span>
                                        <span class="path4"></span>
                                      </i>
                                    </span>
                                    <span className="d-flex flex-column">
                                      <span className="fs-6 fw-bold text-gray-800">
                                        {Tools.translate("COURSES")}
                                      </span>
                                    </span>
                                  </a>
                                </div>
                              </div>
                            </div>

                            <div className="separator separator-dashed mx-5 my-5" />
                            <div className="row">
                              <div className="col-lg-6 mb-3">
                                <div className="menu-item p-0 m-0">
                                  <a
                                    href="/memberships"
                                    className={`menu-link ${
                                      location.pathname === "/memberships"
                                        ? "active"
                                        : ""
                                    }`}
                                  >
                                    <span className="menu-custom-icon d-flex flex-center flex-shrink-0 rounded w-40px h-40px me-3">
                                      <i class="ki-duotone ki-save-2 text-warning fs-1">
                                        <span class="path1"></span>
                                        <span class="path2"></span>
                                      </i>
                                    </span>
                                    <span className="d-flex flex-column">
                                      <span className="fs-6 fw-bold text-gray-800">
                                        {Tools.translate("MEMBERSHIPS")}
                                      </span>
                                    </span>
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
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
