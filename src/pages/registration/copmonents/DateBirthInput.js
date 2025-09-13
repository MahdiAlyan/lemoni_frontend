// DateOfBirthInput.js
import React, { useEffect, useRef } from 'react';
import Tools from "../../../config/Tools";

const DateOfBirthInput = ({ formik }) => {
  const dateInputRef = useRef(null);

  useEffect(() => {
    const fp = flatpickr(dateInputRef.current, {
      enableTime: false,
      dateFormat: "Y-m-d",
      disableMobile: true,
      position: "above",
      static: true,
      altFormat: "F j, Y",
      maxDate: "today",
      onOpen: function (selectedDates, dateStr, instance) {
                // Manually adjust position
                instance.calendarContainer.style.top = 'auto';
                instance.calendarContainer.style.bottom = '100%';
            },
      onChange: function (selectedDates, dateStr) {
          formik.setFieldTouched('date_of_birth', true, false);
        formik.setFieldValue('date_of_birth', dateStr);

        setTimeout(()=>{
            formik.validateField('date_of_birth');
        })
      },
      defaultDate: formik.values.date_of_birth || null,
      onReady: function () {
                // Force our style on mobile
                if (window.innerWidth <= 767) {
                    const calendar = this.calendarContainer;
                    calendar.style.width = '100%';
                    calendar.style.maxWidth = '320px';
                    calendar.style.left = '50%';
                    calendar.style.transform = 'translateX(-50%)';
                    calendar.style.zIndex = '999999';
                }
            }
    });

    return () => {
      fp.destroy();
    };
  }, []);

  return (
    <div className='col-md-6 fv-row'>
      <label className="required form-label fw-bolder text-white fs-6">
        Date Of Birth
      </label>
      <input
        type="text"
        ref={dateInputRef}
        id="kt_datepicker_3"
        readOnly
        placeholder={Tools.translate('DATE_OF_BIRTH')}
        className={`form-control bg-transparent mb-3 mb-lg-0 ${
          formik.touched.date_of_birth && formik.errors.date_of_birth
            ? 'is-invalid'
            : formik.touched.date_of_birth
            ? 'is-valid'
            : ''
        }`}
      />
      {formik.touched.date_of_birth && formik.errors.date_of_birth && (
        <div className="fv-plugins-message-container">
          <div className="fv-help-block">{formik.errors.date_of_birth}</div>
        </div>
      )}
    </div>
  );
};

export default DateOfBirthInput;
