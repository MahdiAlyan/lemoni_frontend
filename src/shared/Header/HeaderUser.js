import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import Tools from "../../config/Tools";
import Auth from "../../config/Auth";
import { useDirection } from "../../contexts/DirectionContext";

const usFlag = "../../assets/media/flags/united-states.svg";
const saudiFlag = "../../assets/media/flags/saudi-arabia.svg";

const HeaderUser = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const role = Auth.getUserRole();
  const { direction, toggleDirection } = useDirection();

  const logout = () => {
    localStorage.removeItem("access-token");
    localStorage.removeItem("refresh-token");
    localStorage.setItem("role", "GUEST");
    localStorage.setItem("appDirection", direction);

    navigate("/portal/ClientHome", { replace: true });
  };

  const fullName = user?.first_name.toUpperCase() + " " + user?.last_name;

  const isArabic = direction === "rtl";

  return (
    <div
      className="d-flex align-items-center me-lg-n2 ms-1 ms-lg-3"
      id="kt_header_user_menu_toggle"
    >
      <div
        className="symbol symbol-50px me-5"
        data-kt-menu-trigger="click"
        data-kt-menu-attach="parent"
        data-kt-menu-placement="bottom-end"
      >
        {user && (
          <a
            href=""
            className="h-30px w-30px rounded symbol-label bg-warning text-inverse-warning fw-bold fs-7 d-flex align-items-center
                        justifyContentCenter"
          >
            {Tools.getInitials2(user?.first_name, user?.last_name) ||
              Tools.getInitials(user?.username)}
          </a>
        )}
      </div>

      <div
        className="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-800 menu-state-bg menu-state-color fw-semibold py-4 fs-6 w-275px"
        data-kt-menu="true"
      >
        <div className="menu-item px-3">
          <div className="menu-content d-flex align-items-center px-3">
            <div className="symbol symbol-50px margin-dir-2">
              {user && (
                <span className="symbol-label bg-warning text-inverse-warning fw-bold align-items-center">
                  {Tools.getInitials2(user?.first_name, user?.last_name) ||
                    Tools.getInitials(user?.username)}
                </span>
              )}
            </div>

            <div className="d-flex flex-column mx-2">
              <div
                className="fw-bold d-flex align-items-center fs-5"
                title={fullName}
              >
                {Tools.truncateText(fullName, 13)}
                <span className="badge badge-light-success fw-bold fs-8 px-2 py-1 ms-2">
                  {role}
                </span>
              </div>
              <a
                href="#"
                className="fw-semibold text-muted text-hover-primary fs-7"
              >
                {user?.username}
              </a>
            </div>
          </div>
        </div>

        <div className="separator my-2"></div>

        <div className="menu-item px-5">
          {role === "CLIENT" && (
            <a href={`/portal/client-profile`} className="menu-link px-5">
              {Tools.translate("MY_PROFILE")}
            </a>
          )}
          {(role === "ADMIN" || role === "MANAGER") && (
            <a href={`/user-profile`} className="menu-link px-5">
              {Tools.translate("MY_PROFILE")}
            </a>
          )}
          {role === "owner" && (
            <a href={`/owner-profile`} className="menu-link px-5">
              {Tools.translate("MY_PROFILE")}
            </a>
          )}
        </div>

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

        <div className="menu-item px-5">
          <a onClick={(e) => logout()} className="menu-link px-5">
            {Tools.translate("SIGN_OUT")}
          </a>
        </div>
      </div>
    </div>
  );
};
export default HeaderUser;
