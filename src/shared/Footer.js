import React, { Fragment } from "react";
import Tools from "../config/Tools";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const isArabic = localStorage.getItem('appDirection') === 'rtl';

  return (
    <Fragment>
      <div className="py-8 d-flex flex-lg-column" id="kt_footer">
        <div className="container d-flex flex-column align-items-center justify-content-center">
          <div className="text-gray-900 text-center">
            <span className="text-muted fw-semibold me-1 fs-6">
              {Tools.translate('POWERED_BY')}{" "}
              {isArabic ? (
                <>
                  <a
                    href="https://neruos.tech/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-700 text-hover-primary fs-6 fw-semibold"
                  >
                    Neruos.tech
                  </a>{" "}
                   {" "}
                   {Tools.translate('ALL_RIGHTS_RESERVED')} {currentYear} © .
                </>
              ) : (
                <>
                  <a
                    href="https://neruos.tech/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-700 text-hover-primary fs-6 fw-semibold"
                  >
                    Neruos.tech
                  </a>{" "}
                  © {currentYear}. {Tools.translate('ALL_RIGHTS_RESERVED')}.
                </>
              )}
            </span>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default Footer;