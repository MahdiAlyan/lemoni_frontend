import React from "react";
import { useNavigate } from "react-router-dom";
import { useDirection } from "../../contexts/DirectionContext";
import Tools from "../../config/Tools";

const usFlag = "../../assets/media/flags/united-states.svg";
const saudiFlag = "../../assets/media/flags/saudi-arabia.svg";

const HeaderGuest = () => {
  const navigate = useNavigate();
  const { direction, toggleDirection } = useDirection();

  const isArabic = direction === "rtl";

  return (
    <div
      className="d-flex align-items-center me-lg-n2 ms-1 ms-lg-3"
      id="kt_header_guest_menu_toggle"
    >
      <div
        className="symbol symbol-50px me-5"
        data-kt-menu-trigger="click"
        data-kt-menu-attach="parent"
        data-kt-menu-placement="bottom-end"
      >
        <a
          className="h-30px w-30px rounded symbol-label bg-light fw-bold fs-7 d-flex align-items-center justify-content-center cursor-pointer"
        >
                  <i class="ki-duotone ki-user fs-4">
                      <span class="path1"></span>
                      <span class="path2"></span>
                  </i>
        </a>
      </div>

      {/* Dropdown */}
      <div
        className="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-800 menu-state-bg menu-state-color fw-semibold py-4 fs-6 w-225px"
        data-kt-menu="true"
      >
        {/* Language toggle */}
        <div
          className="menu-item px-5"
          data-kt-menu-trigger="{default: 'click', lg: 'hover'}"
          data-kt-menu-placement="left-start"
          data-kt-menu-offset="-15px, 0"
        >
          <span className="menu-link px-5">
            <span className="menu-title position-relative">
              {Tools.translate("LANGUAGE")}
              <span className="fs-8 rounded bg-light px-3 py-2 position-absolute translate-middle-y top-50 end-0">
                {isArabic
                  ? Tools.translate("ARABIC")
                  : Tools.translate("ENGLISH")}
                <img
                  className="w-15px h-15px rounded-1 mx-2"
                  src={isArabic ? saudiFlag : usFlag}
                  alt=""
                />
              </span>
            </span>
          </span>

          <div className="menu-sub menu-sub-dropdown w-175px py-4">
            <div className="menu-item px-3">
              <a
                className={`menu-link d-flex px-5 ${!isArabic ? "active" : ""}`}
                onClick={() => {
                  if (direction !== "ltr") {
                    toggleDirection();
                    window.location.reload();
                  }
                }}
              >
                <span className="symbol symbol-20px mx-4">
                  <img className="rounded-1" src={usFlag} alt="EN" />
                </span>
                {Tools.translate("ENGLISH")}
              </a>
            </div>
            <div className="menu-item px-3">
              <a
                className={`menu-link d-flex px-5 ${isArabic ? "active" : ""}`}
                onClick={() => {
                  if (direction !== "rtl") {
                    toggleDirection();
                    window.location.reload();
                  }
                }}
              >
                <span className="symbol symbol-20px mx-4">
                  <img className="rounded-1" src={saudiFlag} alt="AR" />
                </span>
                {Tools.translate("ARABIC")}
              </a>
            </div>
          </div>
        </div>

        <div className="separator my-2"></div>

        {/* Sign up button */}
        <div className="menu-item px-5">
          <a
            onClick={() => navigate("/login")}
            className="menu-link px-5 text-primary fw-bold"
          >
            {Tools.translate("SIGN_UP")}
          </a>
        </div>
      </div>
    </div>
  );
};

export default HeaderGuest;
