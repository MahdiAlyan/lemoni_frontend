import React, {
  Fragment,
  useCallback,
  useState,
  useEffect,
  useRef,
  useContext,
} from "react";
import { useFormik } from "formik";
import Tools from "../../config/Tools";
import * as Yup from "yup";
import ClientFormInfo from "./clientComponent/ClientFormInfo";
import {
  getClient,
  changePasswordByUsername,
  subscribePackage,
  listFacilities,
  listTrainer,
  addFamilyMember,
  deactivateSubscription,
  listPackages,
  submitClient,
  listDiscounts,
  updateTransactionStatus,
  updateClientsCredit,
  listUserActivities,
  sendEmail,
  changeProfileImage,
} from "../../calls/Api";
import tools from "../../config/Tools";
import { useSearchParams } from "react-router-dom";
import { ListLoader } from "../../shared/ListLoader";
import constants from "../../common/constants";
import Auth from "../../config/Auth";
import { format, parseISO } from "date-fns";
import { createRoot } from "react-dom/client";
import { useOutletContext } from "react-router-dom";
import clsx from "clsx";
import FsLightbox from "fslightbox-react";
import { AuthContext } from "../../contexts/AuthContext";

const passwordRegExp = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const ClientForm = () => {
  const [initials, setInitials] = useState("");
  const direction = localStorage.getItem("appDirection") || "ltr";
  const [loading, setLoading] = useState(false);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [showPasswordToggle, setShowPasswordToggle] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [clientStatus, setClientStatus] = useState("");
  const [membershipTable, setMembershipTable] = useState(null);
  const [courseTable, setCourseTable] = useState(null);
  const [classTable, setClassTable] = useState(null);
  const [familyTable, setFamilyTable] = useState(null);
  const [transactionTable, setTransactionTable] = useState(null);
  const [subscriptionTable, setSubscriptionTable] = useState(null);
  const [trainers, setTrainers] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [nameFilter, setNameFilter] = useState("");
  const [facilityFilter, setFacilityFilter] = useState(null);
  const [trainerFilter, setTrainerFilter] = useState(null);
  const [nameMembershipFilter, setNameMembershipFilter] = useState("");
  const [facilityMembershipFilter, setFacilityMembershipFilter] = useState(
    null
  );
  const [nameClassFilter, setNameClassFilter] = useState("");
  const [facilityClassFilter, setFacilityClassFilter] = useState(null);
  const [trainerClassFilter, setTrainerClassFilter] = useState(null);
  const [clientMembershipSelect, setClientMembershipSelect] = useState(null);
  const [clientCourseSelect, setClientCourseSelect] = useState(null);
  const [clientClassSelect, setClientClassSelect] = useState(null);
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [memberships, setMembership] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedMembership, setSelectedMembership] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxSource, setLightboxSource] = useState([]);
  const [lightboxController, setLightboxController] = useState({
    toggler: false,
    slide: 1,
  });
  const courseListRef = useRef(null);
  const classListRes = useRef(null);
  const { setToolbarButtons } = useOutletContext();
  const [originalValues, setOriginalValues] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "",
    height: "",
    weight: "",
    phone_number: "",
    emergency_contact: "",
    public_id: "",
    password: "",
    confirmpassword: "",
    image: null,
    cover_photo: null,
  });

  const validationSchema = Yup.object().shape({
    password: Yup.string()
      .min(8, Tools.translate("MIN_EIGHT_SYMBOLS"))
      .max(50, "Maximum 50 symbols")
      .matches(passwordRegExp, Tools.translate("PASSWORD_REGEX"))
      .required(Tools.translate("PASSWORD_IS_REQUIRED")),

    confirmpassword: Yup.string()
      .oneOf(
        [Yup.ref("password")],
        Tools.translate("CONFIRM_PASSWORD_MATCHING")
      )
      .required(Tools.translate("CONFIRM_PASSWORD_REQUIRED")),
  });

  const fetchClientInfo = async () => {
    let public_id = searchParams.get("public_id");
    getClient({ public_id: public_id })
      .then((response) => {
        tools.checkResponseStatus(
          response,
          () => {
            setOriginalValues(response.data);
            setSelectedClient(response.data);
            setClientStatus(response.data.status);

            setTempImages({
              profile_image: response.data.image || null,
              profile_cover: response.data.cover_photo || null,
            });

            // Store the childrenin state
            if (
              response.data.children &&
              Array.isArray(response.data.children)
            ) {
              setFamilyMembers(response.data.children);
            } else {
              setFamilyMembers([]);
            }
          },
          () => {}
        );
      })
      .catch((error) => {
        console.error(error);
        toastr.error("Error Occurred");
      });
  };

  useEffect(() => {
    fetchClientInfo();
  }, []);

  useEffect(() => {
    // Check if we need to show our custom toggle
    setShowPasswordToggle(!Tools.hasNativePasswordToggle());
  }, []);

  const handleClientUpdate = (updatedValues) => {
    fetchClientInfo();
  };

  useEffect(() => {
    setInitials(
      Tools.getInitials2(originalValues.first_name, originalValues.last_name)
    );
  }, [originalValues]);

  const statusColors = {
    NEW: "primary",
    ACTIVE: "success",
    DEACTIVATED: "danger",
    SUSPENDED: "warning",
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: originalValues,
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setLoading(true);
      let newPassword = values.password;
      try {
        await changePasswordByUsername(
          originalValues.username,
          newPassword
        ).then((response) => {
          Tools.checkResponseStatus(
            response,
            () => {
              toastr.success(Tools.translate("PASSWORD_CHANGES_SUCCESSFULLY"));
            },
            () => {
              toastr.error(Tools.translate("AN_UNEXPECTED_ERROR_OCCURRED"));
            }
          );
        });
      } catch (error) {
        setSubmitting(false);
        setLoading(false);
      } finally {
        const closeButton = document.getElementById("close-modal");
        if (closeButton) {
          closeButton.click();
        }
        setLoading(false);
        setSubmitting(false);
      }
    },
  });

  const evaluatePasswordStrength = (password) => {
    if (!password) {
      setPasswordStrength("");
      return;
    }

    if (password.length < 8) {
      setPasswordStrength("Too Short");
      return;
    }

    // Strong: At least one uppercase letter, one number, and one special character
    const strongRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (strongRegex.test(password)) {
      setPasswordStrength("Strong");
      return;
    }

    // Medium: At least one uppercase letter and one number (no special character required)
    const mediumRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
    if (mediumRegex.test(password)) {
      setPasswordStrength("Medium");
      return;
    }

    // Weak: All other passwords of at least 8 characters
    setPasswordStrength("Weak");
  };
  const resetPasswordMeter = () => {
    // Select the Password Meter element
    var passwordMeterElement = document.querySelector(
      '[data-kt-password-meter="true"]'
    );
    if (!passwordMeterElement) {
      console.error("Password Meter element not found.");
      return;
    }

    // Get the Password Meter instance
    var passwordMeter = window.KTPasswordMeter.getInstance(
      passwordMeterElement
    );

    if (passwordMeter) {
      passwordMeter.reset(); // Reset the password meter
    } else {
      console.error(
        "Password Meter instance not found for the selected element."
      );
    }
  };
  const resetChangePasswordForm = () => {
    formik.resetForm();
    setPasswordStrength("");
    originalValues.confirmpassword = "";
    originalValues.password = "";
    resetPasswordMeter();
  };

  useEffect(() => {
    const modalElement = document.getElementById("kt_modal_1");

    // Define the event handler
    const handleModalHidden = () => {
      resetChangePasswordForm();
      formik.resetForm();
    };

    if (modalElement) {
      modalElement.addEventListener("hidden.bs.modal", handleModalHidden);
      formik.resetForm();
    }

    // Clean up the event listener on component unmount
    return () => {
      if (modalElement) {
        modalElement.removeEventListener("hidden.bs.modal", handleModalHidden);
        formik.resetForm();
      }
    };
  }, []);

  //#region Membership Logic
  useEffect(() => {
    const public_id = searchParams.get("public_id");

    const table = $("#membership-table").DataTable({
      ajax: {
        url:
          process.env.BaseUrl +
          constants.API_URLS.SUBSCRIPTION_LIST +
          `?package_type=MEMBERSHIP&user_id=${public_id}`,
        type: "GET",
        headers: {
          authorization: "Bearer " + Auth.getAccessToken(),
        },
        error: function (xhr, error, thrown) {
          if (xhr.status === 401) {
            // Immediately clear tokens and redirect
            localStorage.removeItem("access-token");
            localStorage.removeItem("refresh-token");

            window.location.href = "/login?session_expired=1";
          } else {
            console.error("Ajax error:", xhr.responseText);
          }
        },
      },
      serverSide: true, // Enable server-side processing
      processing: true, // Show processing indicator
      pageLength: 10,
      order: [[0, "asc"]],
      columns: [
        {
          data: "package",
          render: (data) => {
            return data ? data.name : "N/A";
          },
        },
        {
          data: "start_date",
          render: (data) => {
            return data ? format(parseISO(data), "yyyy-MM-dd") : "N/A";
          },
        },
        {
          data: "end_date",
          render: (data) => {
            return data ? format(parseISO(data), "yyyy-MM-dd") : "N/A";
          },
        },
        {
          data: null,
          render: function (data, type, row) {
            if (!row.start_date || !row.end_date) return "N/A";

            const startDate = new Date(row.start_date);
            const endDate = new Date(row.end_date);
            const today = new Date();
            const isDeactivated = row.status?.toUpperCase() === "DEACTIVATED";

            // Calculate percentage and time remaining
            let percentage;
            let statusText;
            let timeRemaining = "";
            let tooltipText = "";

            if (isDeactivated) {
              percentage = 0;
              statusText = "Deactivated";
              tooltipText = "Membership is deactivated";
            } else {
              const totalDuration = endDate - startDate;
              const elapsedDuration = today - startDate;
              percentage =
                100 -
                Math.min(
                  100,
                  Math.max(0, (elapsedDuration / totalDuration) * 100)
                );

              // Calculate time remaining
              const msPerDay = 1000 * 60 * 60 * 24;
              const daysRemaining = Math.floor((endDate - today) / msPerDay);

              if (today < startDate) {
                percentage = 100;
                statusText = "Not Started";
                const daysUntilStart = Math.floor(
                  (startDate - today) / msPerDay
                );
                tooltipText = `Starts in ${daysUntilStart} day${
                  daysUntilStart !== 1 ? "s" : ""
                }`;
              } else if (today > endDate) {
                percentage = 0;
                statusText = "Expired";
                tooltipText = "Membership has expired";
              } else {
                statusText = "Active";
                if (daysRemaining > 30) {
                  const monthsRemaining = Math.floor(daysRemaining / 30);
                  tooltipText = `${monthsRemaining} month${
                    monthsRemaining !== 1 ? "s" : ""
                  } remaining`;
                } else {
                  tooltipText = `${daysRemaining} day${
                    daysRemaining !== 1 ? "s" : ""
                  } remaining`;
                }
              }
            }

            // Format percentage for display
            const displayPercentage = Math.round(percentage);
            const progressColor = isDeactivated
              ? "secondary"
              : percentage > 70
              ? "success"
              : percentage > 30
              ? "warning"
              : "danger";

            return `
        <div class="d-flex align-items-center flex-column mt-3 w-100">
            <div class="d-flex justify-content-between fw-bold fs-6 text-gray-600 opacity-75 w-100 mt-auto mb-2">
                <span>${statusText}</span>
                <span>${displayPercentage}%</span>
            </div>
            <div class="h-8px mx-3 w-100 bg-gray-200 rounded" 
                 data-bs-toggle="tooltip" 
                 data-bs-placement="top" 
                 title="${tooltipText}">
                <div class="bg-${progressColor} rounded h-8px" 
                     role="progressbar" 
                     style="width: ${displayPercentage}%;" 
                     aria-valuenow="${displayPercentage}" 
                     aria-valuemin="0" 
                     aria-valuemax="100">
                </div>
            </div>
        </div>
        `;
          },
        },
        {
          data: "package",
          render: (data) => {
            return data ? data.price : "N/A";
          },
        },
        {
          data: "users",
          render: (users) => {
            if (!users || users.length === 0) return "N/A";

            const public_id = searchParams.get("public_id");

            return users
              .map((user) => {
                const isPrimary = user.id === public_id;
                const badgeClass = isPrimary
                  ? "badge-light-primary"
                  : "badge-light-warning";

                // Add tooltip attributes only for child (warning) badges
                const tooltipAttrs = !isPrimary
                  ? 'data-bs-toggle="tooltip" title="Child"'
                  : "";

                return `<span class="badge ${badgeClass} me-1" ${tooltipAttrs}>${user.full_name}</span>`;
              })
              .join("");
          },
        },
        {
          data: "status",
          render: (data) => {
            const status = data ? data.toUpperCase() : "";
            let badgeClass = "badge-light-primary";

            if (status === "DEACTIVATED" || status === "INACTIVE") {
              badgeClass = "badge-light-danger";
            }

            return `<span class="badge ${badgeClass} fw-bolder">${status}</span>`;
          },
        },
        {
          data: null,
          orderable: false,
          render: function (data, type, row) {
            const isDeactivated = row.status?.toUpperCase() === "DEACTIVATED";

            return `
            <div id="actions-${data}" class="d-flex justify-content-center gap-2">
                ${
                  !isDeactivated
                    ? `
                <div data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-trigger="hover" title=${Tools.translate(
                  "DEACTIVATE"
                )}>
                <button class="btn btn-icon btn-bg-light btn-color-danger btn-sm deactivate-membership-btn"
                        data-public-id="${row.public_id}">
                    <i class="ki-duotone ki-cross-circle fs-3">
                        <span class="path1"></span>
                        <span class="path2"></span>
                    </i>
                </button>
            </div>
            `
                    : ""
                }
            </div>
        `;
          },
        },
      ],
      responsive: true,
      ordering: true,
      searching: true,
      language:
        localStorage.getItem("appDirection") === "rtl"
          ? {
              sProcessing: "جارٍ التحميل...",
              sZeroRecords: "لم يتم العثور على أية سجلات",
              sInfo: "إظهار _START_ إلى _END_ من أصل _TOTAL_ مدخل",
              sInfoEmpty: "يعرض 0 إلى 0 من أصل 0 سجل",
              sInfoFiltered: "(منتقاة من مجموع _MAX_ مُدخل)",
              sInfoPostFix: "",
              sSearch: "ابحث:",
              sUrl: "",
              oPaginate: {
                sFirst: "الأول",
                sPrevious: "السابق",
                sNext: "التالي",
                sLast: "الأخير",
              },
            }
          : {
              paginate: {
                next: "Next",
                previous: "Previous",
              },
            },
      drawCallback: function () {
        // Reinitialize tooltips after table redraws
        $('[data-bs-toggle="tooltip"]').tooltip();
      },
    });

    setMembershipTable(table);

    $(document).on("click", ".edit-btn", function () {
      const rowData = $(this).data("row");
      toggleUpdateModal(rowData);
    });

    $(document).on("click", ".deactivate-membership-btn", function () {
      const subscriptionId = $(this).data("public-id");

      Swal.fire({
        title: Tools.translate("ARE_YOU_SURE_YOU_WANT_TO_DEACTIVATE"),
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: Tools.translate("CONFIRM"),
        cancelButtonText: Tools.translate("CANCEL"),
        showLoaderOnConfirm: true,
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            const response = await deactivateSubscription({
              public_id: subscriptionId,
            });

            Tools.checkResponseStatus(
              response,
              () => {
                Swal.fire(
                  Tools.translate("DEACTIVATED"),
                  Tools.translate(
                    "SUBSCRIPTION_HAS_BEED_DEACTIVATED_SUCCESSFULLY"
                  ),
                  "success"
                );
                table.ajax.reload();
              },
              () => {
                Swal.fire("Error!", Tools.translate("ERROR"), "error");
              }
            );
          } catch (error) {
            Swal.fire(
              "Error!",
              Tools.translate("SUBSCRIPTION_HAS_BEED_DEACTIVATED_SUCCESSFULLY"),
              "error"
            );
            console.error("Deactivation error:", error);
          }
        }
      });
    });

    return () => {
      table.destroy();
    };
  }, []);

  const fetchMemberships = async (filters = {}) => {
    try {
      setLoadingPackages(true);
      const response = await listPackages(filters);
      // Check if response.data is an array
      if (Array.isArray(response.data)) {
        setMembership(response.data);
      } else if (Array.isArray(response.data.data)) {
        setMembership(response.data.data);
      } else {
        console.error("Unexpected API response format:", response.data);
        setMembership([]);
      }
    } catch (error) {
      console.error("Error fetching memberships:", error);
      setMembership([]);
    } finally {
      setLoadingPackages(false);
    }
  };

  useEffect(() => {
    const filters = {};

    if (facilityMembershipFilter) {
      filters.facility = facilityMembershipFilter;
    }

    filters.package_type = "MEMBERSHIP";
    if (clientMembershipSelect) {
      filters.public_id = clientMembershipSelect;
    } else {
      filters.public_id = searchParams.get("public_id");
    }

    // Debounce nameFilter
    const delayDebounce = setTimeout(() => {
      if (nameMembershipFilter.length >= 3 || nameMembershipFilter === "") {
        if (nameMembershipFilter) filters.name = nameMembershipFilter;
        fetchMemberships(filters);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [nameMembershipFilter, facilityMembershipFilter, clientMembershipSelect]);

  const handleMembershipClick = async (course) => {
    setSelectedMembership(course);
    const public_id = searchParams.get("public_id");

    //container for Swal content
    const swalContainer = document.createElement("div");
    swalContainer.innerHTML = `
        <div class="mb-4">
            <p>${Tools.translate("ARE_YOU_SURE_TO_SUNSCRIBE")} <strong>${
      course.name
    }</strong>?</p>
        </div>
    `;

    await Swal.fire({
      title: Tools.translate("CONFIRM_SUBSCRIPTION"),
      html: swalContainer,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: Tools.translate("SUBSCRIBE"),
      cancelButtonText: Tools.translate("CANCEL"),
      buttonsStyling: false,
      customClass: {
        confirmButton: "btn btn-primary me-3",
        cancelButton: "btn btn-light",
      },
      showLoaderOnConfirm: true,
      allowOutsideClick: true,
      backdrop: true,
      preConfirm: async () => {
        let selectedSubscriber = public_id;

        if (clientMembershipSelect) {
          selectedSubscriber = clientMembershipSelect;
        }

        try {
          await subscribePackage({
            package: course.public_id,
            user_ids: selectedSubscriber,
          });

          return true;
        } catch (error) {
          let errorMessage = "Failed to subscribe";

          if (
            error.response?.data?.ERROR === "USER_ALREADY_SUBSCRIBED_TO_PACKAGE"
          ) {
            errorMessage = "User already subscribed to this membership";
          }

          await Swal.fire({
            title: "Error",
            text: errorMessage,
            icon: "error",
            confirmButtonText: "OK",
            buttonsStyling: false,
            customClass: {
              confirmButton: "btn btn-danger",
            },
            backdrop: true,
          });
          return false;
        }
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: Tools.translate("SUCCESS"),
          text: Tools.translate("SUBSCRIPTION_SUCCESS"),
          icon: "success",
          confirmButtonText: "OK",
          buttonsStyling: false,
          customClass: {
            confirmButton: "btn btn-success",
          },
          backdrop: true,
        }).then(() => {
          document.activeElement?.blur();

          const modals = document.querySelectorAll(".modal.show");
          modals.forEach((modal) => {
            const bsModal = bootstrap.Modal.getInstance(modal);
            if (bsModal) bsModal.hide();
          });

          document
            .querySelectorAll(".modal-backdrop")
            .forEach((el) => el.remove());

          document
            .querySelectorAll(".swal2-container")
            .forEach((el) => el.remove());

          document.body.classList.remove("modal-open");
          document.body.style.removeProperty("padding-right");
          document.body.style.removeProperty("overflow");
          document.documentElement.style.removeProperty("overflow");

          document.querySelectorAll('[aria-hidden="true"]').forEach((el) => {
            el.removeAttribute("aria-hidden");
          });

          $("#membership-table").DataTable().ajax.reload(null, false);
          $("#transactions-table").DataTable().ajax.reload(null, false);
        });
      }
    });
  };

  //#region Sub Modal Selects
  useEffect(() => {
    const facilityMembershipSelect = $(
      "#facilityMembershipFilterSelect"
    ).select2({
      placeholder: Tools.translate("FACILITY"),
      width: "150px",
      allowClear: true,
      dropdownParent: $("#kt_modal_add_membership .modal-content"),
    });

    const facilityClassSelect = $("#facilityClassFilterSelect").select2({
      placeholder: Tools.translate("FACILITY"),
      width: "150px",
      allowClear: true,
      dropdownParent: $("#kt_modal_add_class .modal-content"),
    });

    const facilityCourseSelect = $("#facilityCourseFilterSelect").select2({
      placeholder: Tools.translate("FACILITY"),
      width: "150px",
      allowClear: true,
      dropdownParent: $("#kt_modal_add_course .modal-content"),
    });

    const trainerCourseSelect = $("#trainerCourseFilterSelect").select2({
      placeholder: Tools.translate("TRAINER"),
      width: "150px",
      allowClear: true,
      dropdownParent: $("#kt_modal_add_course .modal-content"),
    });

    const trainerClassSelect = $("#trainerClassFilterSelect").select2({
      placeholder: Tools.translate("TRAINER"),
      width: "150px",
      allowClear: true,
      dropdownParent: $("#kt_modal_add_class .modal-content"),
    });

    const clientSelect = $("#clientSelect").select2({
      placeholder: "Select Client",
      width: "250px",
      allowClear: false,
      dropdownParent: $("#kt_modal_add_membership .modal-content"),
    });

    const clientCourseSelect = $("#clientCourseSelect").select2({
      placeholder: "Select Client",
      width: "250px",
      allowClear: false,
      dropdownParent: $("#kt_modal_add_course .modal-content"),
    });

    const clientClassSelect = $("#clientClassSelect").select2({
      placeholder: "Select Client",
      width: "250px",
      allowClear: false,
      dropdownParent: $("#kt_modal_add_class .modal-content"),
    });

    if (selectedClient?.public_id && !clientMembershipSelect) {
      clientSelect.val(selectedClient.public_id).trigger("change");
    }

    // Handle change event
    facilityMembershipSelect.on("change", (e) => {
      setFacilityMembershipFilter(e.target.value);
    });
    facilityClassSelect.on("change", (e) => {
      setFacilityClassFilter(e.target.value);
    });
    facilityCourseSelect.on("change", (e) => {
      setFacilityFilter(e.target.value);
    });
    trainerCourseSelect.on("change", (e) => {
      setTrainerFilter(e.target.value);
    });
    trainerClassSelect.on("change", (e) => {
      setTrainerClassFilter(e.target.value);
    });
    clientSelect.on("change", (e) => {
      setClientMembershipSelect(e.target.value);
    });
    clientCourseSelect.on("change", (e) => {
      setClientCourseSelect(e.target.value);
    });
    clientClassSelect.on("change", (e) => {
      setClientClassSelect(e.target.value);
    });

    $("#kt_modal_add_membership").on("hidden.bs.modal", () => {
      $("#facilityMembershipFilterSelect").val(null).trigger("change");
      $("#clientSelect").val(null).trigger("change");
    });

    $("#kt_modal_add_class").on("hidden.bs.modal", () => {
      $("#facilityClassFilterSelect").val(null).trigger("change");
      $("#trainerClassFilterSelect").val(null).trigger("change");
      $("#clientClassSelect").val(null).trigger("change");
    });

    $("#kt_modal_add_course").on("hidden.bs.modal", () => {
      $("#facilityCourseFilterSelect").val(null).trigger("change");
      $("#trainerCourseFilterSelect").val(null).trigger("change");
      $("#clientCourseSelect").val(null).trigger("change");
    });

    // Cleanup
    return () => {
      facilityCourseSelect.off("change").select2("destroy");
      facilityMembershipSelect.off("change").select2("destroy");
      facilityClassSelect.off("change").select2("destroy");
      trainerClassSelect.off("change").select2("destroy");
      trainerCourseSelect.off("change").select2("destroy");
      clientSelect.off("change").select2("destroy");
      clientClassSelect.off("change").select2("destroy");
      clientCourseSelect.off("change").select2("destroy");

      // Remove modal event listeners
      $("#kt_modal_add_membership").off("hidden.bs.modal");
      $("#kt_modal_add_class").off("hidden.bs.modal");
      $("#kt_modal_add_course").off("hidden.bs.modal");
    };
  }, [facilities, trainers]);

  //#region courses logic
  useEffect(() => {
    const public_id = searchParams.get("public_id");

    const table = $("#courses-table").DataTable({
      ajax: {
        url:
          process.env.BaseUrl +
          constants.API_URLS.SUBSCRIPTION_LIST +
          `?package_type=COURSE&user_id=${public_id}`,
        type: "GET",
        headers: {
          authorization: "Bearer " + Auth.getAccessToken(),
        },
        error: function (xhr, error, thrown) {
          if (xhr.status === 401) {
            // Immediately clear tokens and redirect
            localStorage.removeItem("access-token");
            localStorage.removeItem("refresh-token");

            window.location.href = "/login?session_expired=1";
          } else {
            console.error("Ajax error:", xhr.responseText);
          }
        },
      },
      serverSide: true, // Enable server-side processing
      processing: true, // Show processing indicator
      pageLength: 10,
      order: [[0, "asc"]],
      columns: [
        {
          data: "package",
          render: (data) => {
            return data ? data.name : "N/A";
          },
        },
        {
          data: "start_date",
          render: (data) => {
            return data ? format(parseISO(data), "yyyy-MM-dd") : "N/A";
          },
        },
        {
          data: "end_date",
          render: (data) => {
            return data ? format(parseISO(data), "yyyy-MM-dd") : "N/A";
          },
        },

        {
          data: "package",
          render: (data) => {
            return data ? data.price : "N/A";
          },
        },
        {
          data: "users",
          render: (users) => {
            if (!users || users.length === 0) return "N/A";

            const public_id = searchParams.get("public_id");

            return users
              .map((user) => {
                const isPrimary = user.id === public_id;
                const badgeClass = isPrimary
                  ? "badge-light-primary"
                  : "badge-light-warning";

                // Add tooltip attributes only for child (warning) badges
                const tooltipAttrs = !isPrimary
                  ? 'data-bs-toggle="tooltip" title="Child"'
                  : "";

                return `<span class="badge ${badgeClass} me-1" ${tooltipAttrs}>${user.full_name}</span>`;
              })
              .join("");
          },
        },
        {
          data: "status",
          render: (data) => {
            const status = data ? data.toUpperCase() : "";
            let badgeClass = "badge-light-primary";

            if (status === "DEACTIVATED" || status === "INACTIVE") {
              badgeClass = "badge-light-danger";
            }

            return `<span class="badge ${badgeClass} fw-bolder">${status}</span>`;
          },
        },
        {
          data: null,
          orderable: false,
          render: function (data, type, row) {
            const isDeactivated = row.status?.toUpperCase() === "DEACTIVATED";

            return `
            <div id="actions-${data}" class="d-flex justify-content-center gap-2">
                ${
                  !isDeactivated
                    ? `
                <button class="btn btn-icon btn-bg-light btn-color-danger btn-sm deactivate-course-btn"
                        data-public-id="${row.public_id}"
                        data-bs-toggle="tooltip"
                        data-bs-placement="bottom"
                        data-bs-trigger="hover"
                        title=${Tools.translate("DEACTIVATE")}
                        >
                    <i class="ki-duotone ki-cross-circle fs-3">
                        <span class="path1"></span>
                        <span class="path2"></span>
                    </i>
                </button>
            `
                    : ""
                }
            </div>
        `;
          },
        },
      ],
      responsive: true,
      ordering: true,
      searching: true,
      language:
        localStorage.getItem("appDirection") === "rtl"
          ? {
              sProcessing: "جارٍ التحميل...",
              sZeroRecords: "لم يتم العثور على أية سجلات",
              sInfo: "إظهار _START_ إلى _END_ من أصل _TOTAL_ مدخل",
              sInfoEmpty: "يعرض 0 إلى 0 من أصل 0 سجل",
              sInfoFiltered: "(منتقاة من مجموع _MAX_ مُدخل)",
              sInfoPostFix: "",
              sSearch: "ابحث:",
              sUrl: "",
              oPaginate: {
                sFirst: "الأول",
                sPrevious: "السابق",
                sNext: "التالي",
                sLast: "الأخير",
              },
            }
          : {
              paginate: {
                next: "Next",
                previous: "Previous",
              },
            },
      drawCallback: function () {
        // Reinitialize tooltips after table redraws
        $('[data-bs-toggle="tooltip"]').tooltip();
      },
    });

    setCourseTable(table);

    $(document).on("click", ".edit-btn", function () {
      const rowData = $(this).data("row");
      toggleUpdateModal(rowData);
    });

    $(document).on("click", ".deactivate-course-btn", function () {
      const subscriptionId = $(this).data("public-id");

      Swal.fire({
        title: Tools.translate("ARE_YOU_SURE_YOU_WANT_TO_DEACTIVATE"),
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: Tools.translate("CONFIRM"),
        cancelButtonText: Tools.translate("CANCEL"),
        showLoaderOnConfirm: true,
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            const response = await deactivateSubscription({
              public_id: subscriptionId,
            });

            Tools.checkResponseStatus(
              response,
              () => {
                Swal.fire(
                  Tools.translate("DEACTIVATED"),
                  Tools.translate(
                    "SUBSCRIPTION_HAS_BEED_DEACTIVATED_SUCCESSFULLY"
                  ),
                  "success"
                );
                table.ajax.reload();
              },
              () => {
                Swal.fire("Error!", Tools.translate("ERROR"), "error");
              }
            );
          } catch (error) {
            Swal.fire("Error!", Tools.translate("ERROR"), "error");
            console.error("Deactivation error:", error);
          }
        }
      });
    });

    return () => {
      table.destroy();
    };
  }, []);

  const fetchCourses = async (filters) => {
    try {
      setLoadingPackages(true);
      const response = await listPackages(filters);

      // Check if response.data is an array
      if (Array.isArray(response.data)) {
        setCourses(response.data);
      } else if (Array.isArray(response.data.courses)) {
        setCourses(response.data.courses);
      } else if (Array.isArray(response.data.data)) {
        setCourses(response.data.data);
      } else {
        console.error("Unexpected API response format:", response.data);
        setCourses([]);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      setCourses([]);
    } finally {
      setLoadingPackages(false);
    }
  };

  useEffect(() => {
    const filters = {};

    if (facilityFilter) filters.facility = facilityFilter;

    if (trainerFilter) {
      filters.trainer = trainerFilter;
    }

    filters.package_type = "COURSE";
    if (clientCourseSelect) {
      filters.public_id = clientCourseSelect;
    } else {
      filters.public_id = searchParams.get("public_id");
    }

    const delayDebounce = setTimeout(() => {
      // Only filter by name if length >= 3 or empty
      if (nameFilter.length >= 3 || nameFilter === "") {
        if (nameFilter) filters.name = nameFilter;
        fetchCourses(filters);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [nameFilter, facilityFilter, trainerFilter, clientCourseSelect]);

  const handleCourseClick = async (course) => {
    setSelectedCourse(course);

    const public_id = searchParams.get("public_id");

    const swalContainer = document.createElement("div");
    swalContainer.innerHTML = `
        <div class="mb-4">
            <p>${Tools.translate("ARE_YOU_SURE_TO_SUNSCRIBE")} <strong>${
      course.name
    }</strong>?</p>
        </div>
    `;

    await Swal.fire({
      title: Tools.translate("CONFIRM_SUBSCRIPTION"),
      html: swalContainer,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: Tools.translate("SUBSCRIBE"),
      cancelButtonText: Tools.translate("CANCEL"),
      buttonsStyling: false,
      customClass: {
        confirmButton: "btn btn-primary me-3",
        cancelButton: "btn btn-light",
      },
      showLoaderOnConfirm: true,
      backdrop: true,
      allowOutsideClick: () => !Swal.isLoading(),
      preConfirm: async () => {
        let selectedSubscriber = public_id;

        if (clientCourseSelect) {
          selectedSubscriber = clientCourseSelect;
        }

        try {
          await subscribePackage({
            package: course.public_id,
            user_ids: selectedSubscriber,
          });

          return true;
        } catch (error) {
          let errorMessage = "Failed to subscribe";

          if (
            error.response?.data?.ERROR === "USER_ALREADY_SUBSCRIBED_TO_PACKAGE"
          ) {
            errorMessage = "User already subscribed to this membership";
          }

          await Swal.fire({
            title: "Error",
            text: errorMessage,
            icon: "error",
            confirmButtonText: "OK",
            buttonsStyling: false,
            customClass: {
              confirmButton: "btn btn-danger",
            },
            backdrop: true,
          });
          return false;
        }
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: Tools.translate("SUCCESS"),
          text: Tools.translate("SUBSCRIPTION_SUCCESS"),
          icon: "success",
          confirmButtonText: "OK",
          buttonsStyling: false,
          customClass: {
            confirmButton: "btn btn-success",
          },
          backdrop: true,
        }).then(() => {
          document.activeElement?.blur();

          const modals = document.querySelectorAll(".modal.show");
          modals.forEach((modal) => {
            const bsModal = bootstrap.Modal.getInstance(modal);
            if (bsModal) bsModal.hide();
          });

          document
            .querySelectorAll(".modal-backdrop")
            .forEach((el) => el.remove());

          document
            .querySelectorAll(".swal2-container")
            .forEach((el) => el.remove());

          document.body.classList.remove("modal-open");
          document.body.style.removeProperty("padding-right");
          document.body.style.removeProperty("overflow");
          document.documentElement.style.removeProperty("overflow");

          document.querySelectorAll('[aria-hidden="true"]').forEach((el) => {
            el.removeAttribute("aria-hidden");
          });

          $("#courses-table").DataTable().ajax.reload(null, false);
          $("#transactions-table").DataTable().ajax.reload(null, false);
        });
      }
    });
  };

  //#region classes logic
  useEffect(() => {
    const public_id = searchParams.get("public_id");

    const table = $("#classes-table").DataTable({
      ajax: {
        url:
          process.env.BaseUrl +
          constants.API_URLS.SUBSCRIPTION_LIST +
          `?package_type=CLASS&user_id=${public_id}`,
        type: "GET",
        headers: {
          authorization: "Bearer " + Auth.getAccessToken(),
        },
        error: function (xhr, error, thrown) {
          if (xhr.status === 401) {
            // Immediately clear tokens and redirect
            localStorage.removeItem("access-token");
            localStorage.removeItem("refresh-token");

            window.location.href = "/login?session_expired=1";
          } else {
            console.error("Ajax error:", xhr.responseText);
          }
        },
      },
      serverSide: true, // Enable server-side processing
      processing: true, // Show processing indicator
      pageLength: 10,
      order: [[0, "asc"]],
      columns: [
        {
          data: "package",
          render: (data) => {
            return data ? data.name : "N/A";
          },
        },
        {
          data: "start_date",
          render: (data) => {
            return data ? format(parseISO(data), "yyyy-MM-dd") : "N/A";
          },
        },
        {
          data: "end_date",
          render: (data) => {
            return data ? format(parseISO(data), "yyyy-MM-dd") : "N/A";
          },
        },

        {
          data: "package",
          render: (data) => {
            return data ? data.price : "N/A";
          },
        },
        {
          data: "users",
          render: (users) => {
            if (!users || users.length === 0) return "N/A";

            const public_id = searchParams.get("public_id");

            return users
              .map((user) => {
                const isPrimary = user.id === public_id;
                const badgeClass = isPrimary
                  ? "badge-light-primary"
                  : "badge-light-warning";

                // Add tooltip attributes only for child (warning) badges
                const tooltipAttrs = !isPrimary
                  ? 'data-bs-toggle="tooltip" title="Child"'
                  : "";

                return `<span class="badge ${badgeClass} me-1" ${tooltipAttrs}>${user.full_name}</span>`;
              })
              .join("");
          },
        },
        {
          data: "status",
          render: (data) => {
            const status = data ? data.toUpperCase() : "";
            let badgeClass = "badge-light-primary";

            if (status === "DEACTIVATED") {
              badgeClass = "badge-light-danger";
            }

            return `<span class="badge ${badgeClass} fw-bolder">${status}</span>`;
          },
        },
        {
          data: null,
          orderable: false,
          render: function (data, type, row) {
            const isDeactivated =
              row.status?.toUpperCase() === "DEACTIVATED" ||
              row.status?.toUpperCase() === "INACTIVE";
            return `
            <div id="actions-${data}" class="d-flex justify-content-center gap-2">
                ${
                  !isDeactivated
                    ? `
                <button class="btn btn-icon btn-bg-light btn-color-danger btn-sm deactivate-class-btn"
                        data-public-id="${row.public_id}"
                        data-bs-toggle="tooltip"
                        data-bs-placement="bottom"
                        data-bs-trigger="hover"
                        title=${Tools.translate("DEACTIVATE")}
                        >
                    <i class="ki-duotone ki-cross-circle fs-3">
                        <span class="path1"></span>
                        <span class="path2"></span>
                    </i>
                </button>
            `
                    : ""
                }
            </div>
        `;
          },
        },
      ],
      responsive: true,
      ordering: true,
      searching: true,
      language:
        localStorage.getItem("appDirection") === "rtl"
          ? {
              sProcessing: "جارٍ التحميل...",
              sZeroRecords: "لم يتم العثور على أية سجلات",
              sInfo: "إظهار _START_ إلى _END_ من أصل _TOTAL_ مدخل",
              sInfoEmpty: "يعرض 0 إلى 0 من أصل 0 سجل",
              sInfoFiltered: "(منتقاة من مجموع _MAX_ مُدخل)",
              sInfoPostFix: "",
              sSearch: "ابحث:",
              sUrl: "",
              oPaginate: {
                sFirst: "الأول",
                sPrevious: "السابق",
                sNext: "التالي",
                sLast: "الأخير",
              },
            }
          : {
              paginate: {
                next: "Next",
                previous: "Previous",
              },
            },
      drawCallback: function () {
        // Reinitialize tooltips after table redraws
        $('[data-bs-toggle="tooltip"]').tooltip();
      },
    });

    setClassTable(table);

    $(document).on("click", ".edit-btn", function () {
      const rowData = $(this).data("row");
      toggleUpdateModal(rowData);
    });

    $(document).on("click", ".deactivate-class-btn", function () {
      const subscriptionId = $(this).data("public-id");

      Swal.fire({
        title: Tools.translate("ARE_YOU_SURE_YOU_WANT_TO_DEACTIVATE"),
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: Tools.translate("CONFIRM"),
        cancelButtonText: Tools.translate("CANCEL"),
        showLoaderOnConfirm: true,
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            const response = await deactivateSubscription({
              public_id: subscriptionId,
            });

            Tools.checkResponseStatus(
              response,
              () => {
                Swal.fire(
                  Tools.translate("DEACTIVATED"),
                  Tools.translate(
                    "SUBSCRIPTION_HAS_BEED_DEACTIVATED_SUCCESSFULLY"
                  ),
                  "success"
                );
                table.ajax.reload();
              },
              () => {
                Swal.fire("Error!", Tools.translate("ERROR"), "error");
              }
            );
          } catch (error) {
            Swal.fire("Error!", Tools.translate("ERROR"), "error");
            console.error("Deactivation error:", error);
          }
        }
      });
    });

    return () => {
      table.destroy();
    };
  }, []);

  const fetchClasses = async (filters) => {
    try {
      setLoadingPackages(true);
      const response = await listPackages(filters);

      // Check if response.data is an array
      if (Array.isArray(response.data)) {
        setClasses(response.data);
      } else if (Array.isArray(response.data.data)) {
        setClasses(response.data.data);
      } else {
        console.error("Unexpected API response format:", response.data);
        setCourses([]);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      setClasses([]);
    } finally {
      setLoadingPackages(false);
    }
  };

  useEffect(() => {
    const filters = {};

    if (facilityClassFilter) filters.facility = facilityClassFilter;

    if (trainerClassFilter) {
      filters.trainer = trainerClassFilter;
    }

    filters.package_type = "CLASS";
    if (clientClassSelect) {
      filters.public_id = clientClassSelect;
    } else {
      filters.public_id = searchParams.get("public_id");
    }

    const delayDebounce = setTimeout(() => {
      // Only filter by name if length >= 3 or empty
      if (nameClassFilter.length >= 3 || nameClassFilter === "") {
        if (nameClassFilter) filters.name = nameClassFilter;
        fetchClasses(filters);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [
    nameClassFilter,
    facilityClassFilter,
    trainerClassFilter,
    clientClassSelect,
  ]);

  const handleClassClick = async (course) => {
    setSelectedClass(course);

    const public_id = searchParams.get("public_id");

    const swalContainer = document.createElement("div");
    swalContainer.innerHTML = `
        <div class="mb-4">
            <p>${Tools.translate("ARE_YOU_SURE_TO_SUNSCRIBE")} <strong>${
      course.name
    }</strong>?</p>
        </div>
    `;

    await Swal.fire({
      title: Tools.translate("CONFIRM_SUBSCRIPTION"),
      html: swalContainer,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: Tools.translate("SUBSCRIBE"),
      cancelButtonText: Tools.translate("CANCEL"),
      buttonsStyling: false,
      customClass: {
        confirmButton: "btn btn-primary me-3",
        cancelButton: "btn btn-light",
      },
      showLoaderOnConfirm: true,
      backdrop: true,
      allowOutsideClick: () => !Swal.isLoading(),
      preConfirm: async () => {
        let selectedSubscriber = public_id;

        if (clientClassSelect) {
          selectedSubscriber = clientClassSelect;
        }

        try {
          await subscribePackage({
            package: course.public_id,
            user_ids: selectedSubscriber,
          });

          return true;
        } catch (error) {
          let errorMessage = "Failed to subscribe";

          if (
            error.response?.data?.ERROR === "USER_ALREADY_SUBSCRIBED_TO_PACKAGE"
          ) {
            errorMessage = "User already subscribed to this membership";
          }

          await Swal.fire({
            title: "Error",
            text: errorMessage,
            icon: "error",
            confirmButtonText: "OK",
            buttonsStyling: false,
            customClass: {
              confirmButton: "btn btn-danger",
            },
            backdrop: true,
          });
          return false;
        }
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: Tools.translate("SUCCESS"),
          text: Tools.translate("SUBSCRIPTION_SUCCESS"),
          icon: "success",
          confirmButtonText: "OK",
          buttonsStyling: false,
          customClass: {
            confirmButton: "btn btn-success",
          },
          backdrop: true,
        }).then(() => {
          document.activeElement?.blur();

          const modals = document.querySelectorAll(".modal.show");
          modals.forEach((modal) => {
            const bsModal = bootstrap.Modal.getInstance(modal);
            if (bsModal) bsModal.hide();
          });

          document
            .querySelectorAll(".modal-backdrop")
            .forEach((el) => el.remove());

          document
            .querySelectorAll(".swal2-container")
            .forEach((el) => el.remove());

          document.body.classList.remove("modal-open");
          document.body.style.removeProperty("padding-right");
          document.body.style.removeProperty("overflow");
          document.documentElement.style.removeProperty("overflow");

          document.querySelectorAll('[aria-hidden="true"]').forEach((el) => {
            el.removeAttribute("aria-hidden");
          });

          $("#classes-table").DataTable().ajax.reload(null, false);
          $("#transactions-table").DataTable().ajax.reload(null, false);
        });
      }
    });
  };

  const fetchFacilities = async () => {
    setLoading(true);
    try {
      const response = await listFacilities();

      if (response && Array.isArray(response.data)) {
        setFacilities(response.data);
      }
    } catch (error) {
      console.error("Error fetching units:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrainers = async () => {
    setLoading(true);
    try {
      const response = await listTrainer();

      if (response && Array.isArray(response.data)) {
        setTrainers(response.data);
      }
    } catch (error) {
      console.error("Error fetching units:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
    fetchTrainers();
  }, []);

  useEffect(() => {
    // Initialize facility Select2
    const facilitySelect = $("#facilityFilter").select2({
      placeholder: "Select Facility",
    });
    const trainerSelect = $("#trainerFilter").select2({
      placeholder: "Filter by Trainer",
    });

    trainerSelect.on("change", (e) => {
      setTrainerFilter(e.target.value === "all" ? "" : e.target.value);
    });

    // Handle facility filter change
    facilitySelect.on("change", (e) => {
      setFacilityFilter(e.target.value === "all" ? "" : e.target.value);
    });

    // Cleanup
    return () => {
      facilitySelect.off("change").select2("destroy");
      trainerSelect.off("change").select2("destroy");
    };
  }, [facilities, trainers]);

  const reloadDataTable = () => {
    if (subscriptionTable) {
      $("#subscription-table").DataTable().settings()[0].ajax.data = function (
        data
      ) {
        if (nameFilter !== "") {
          data.filter = nameFilter;
        }
        if (facilityFilter !== "") {
          data.facility = facilityFilter;
        }
        if (trainerFilter !== "") {
          data.trainer = trainerFilter;
        }
      };

      $("#subscription-table").DataTable().ajax.reload();
    }
  };

  useEffect(() => {
    reloadDataTable();
  }, [nameFilter, facilityFilter, trainerFilter]);

  //#region status buttons
  useEffect(() => {
    const changeClientStatus = async (newStatus) => {
      try {
        setLoading(true);
        const { last_login, speciality, ...clientData } = originalValues;
        const response = await submitClient({
          ...clientData,
          nationality: clientData.nationality?.id,
          status: newStatus,
        });

        Tools.checkResponseStatus(
          response,
          () => {
            setOriginalValues((prev) => ({ ...prev, status: newStatus }));
            setClientStatus(newStatus);
            toastr.success(Tools.translate("CLIENT_UPDATED_SUCCESSFULLY"));
          },
          () => {
            toastr.error(Tools.translate("ERROR"));
          }
        );
      } catch (error) {
        console.error("Status update error:", error);
        toastr.error(Tools.translate("ERROR"));
      } finally {
        setLoading(false);
      }
    };

    const getStatusButtons = () => {
      if (Auth.getUserRole() === "CASHIER") return;
      switch (clientStatus) {
        case "ACTIVE":
          return (
            <>
              <button
                onClick={() => changeClientStatus("DEACTIVATED")}
                className="btn btn-light-danger me-2"
                disabled={loading}
              >
                {!loading && "Deactivate"}
                {loading && (
                  <span
                    className="indicator-progress"
                    style={{ display: "block" }}
                  >
                    {Tools.translate("PLEASE_WAIT")}{" "}
                    <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
                  </span>
                )}
              </button>
              <button
                onClick={() => changeClientStatus("SUSPENDED")}
                className="btn btn-light-warning me-2"
                disabled={loading}
              >
                Suspend
              </button>
            </>
          );
        case "DEACTIVATED":
          return (
            <>
              <button
                onClick={() => changeClientStatus("ACTIVE")}
                className="btn btn-light-success me-2"
                disabled={loading}
              >
                {!loading && "Activate"}
                {loading && (
                  <span
                    className="indicator-progress"
                    style={{ display: "block" }}
                  >
                    {Tools.translate("PLEASE_WAIT")}{" "}
                    <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
                  </span>
                )}
              </button>
              <button
                onClick={() => changeClientStatus("SUSPENDED")}
                className="btn btn-light-warning me-2"
                disabled={loading}
              >
                Suspend
              </button>
            </>
          );
        case "SUSPENDED":
          return (
            <button
              onClick={() => changeClientStatus("ACTIVE")}
              className="btn btn-light-success me-2"
              disabled={loading}
            >
              {!loading && "Reactivate"}
              {loading && (
                <span
                  className="indicator-progress"
                  style={{ display: "block" }}
                >
                  {Tools.translate("PLEASE_WAIT")}{" "}
                  <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
                </span>
              )}
            </button>
          );
        default:
          // NEW or other statuses
          return (
            <>
              <button
                onClick={() => changeClientStatus("ACTIVE")}
                className="btn btn-light-success me-2"
                disabled={loading}
              >
                {!loading && "Activate"}
                {loading && (
                  <span
                    className="indicator-progress"
                    style={{ display: "block" }}
                  >
                    {Tools.translate("PLEASE_WAIT")}{" "}
                    <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
                  </span>
                )}
              </button>
              <button
                onClick={() => changeClientStatus("SUSPENDED")}
                className="btn btn-light-warning me-2"
                disabled={loading}
              >
                Suspend
              </button>
            </>
          );
      }
    };

    setToolbarButtons(
      <div className="d-flex align-items-center">
        <ul className="nav nav-custom nav-tabs nav-line-tabs nav-line-tabs-2x border-0 fs-4 fw-semibold">
          <li className="nav-item">{getStatusButtons()}</li>
        </ul>
      </div>
    );
  }, [clientStatus, loading, originalValues, setToolbarButtons]);

  //#region family logic
  const [showSubscriptionsModal, setShowSubscriptionsModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const [familyOriginalValues, setFamilyOriginalValues] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "",
    height: "",
    weight: "",
  });

  const createFamilyValidationSchema = Yup.object({
    first_name: Yup.string().required(Tools.translate("FIRST_NAME_REQUIRED")),
    last_name: Yup.string().required(Tools.translate("LAST_NAME_REQUIRED")),
    date_of_birth: Yup.string().required(
      Tools.translate("DATE_OF_BIRTH_REQUIRED")
    ),
    gender: Yup.string().required(Tools.translate("GENDER_REQUIRED")),
    height: Yup.number().required(Tools.translate("HEIGHT_REQUIRED")),
    weight: Yup.number().required(Tools.translate("WEIGHT_REQUIRED")),
  });

  const familyFormik = useFormik({
    initialValues: familyOriginalValues,
    validationSchema: createFamilyValidationSchema,
    onSubmit: async (values, { setStatus, setSubmitting, resetForm }) => {
      const public_id = searchParams.get("public_id");
      setSubmitting(true);

      try {
        const data = {
          ...values,
          parent_id: public_id,
        };
        delete data.speciality;
        delete data.nationality;
        delete data.agree_to_policy;

        const response = await addFamilyMember(data);

        Tools.checkResponseStatus(
          response,
          () => {
            resetForm();
            document.getElementById("close_model_btn").click();
            toastr.success(
              familyOriginalValues.public_id
                ? Tools.translate("FAMILY_MEMBER_UPDATED")
                : Tools.translate("FAMILY_MEMBER_CREATED")
            );
            familyTable.ajax.reload();
            fetchClientInfo();
          },
          () => {
            toastr.error(Tools.translate("ERROR_WHILE_SAVING_FAMILY_MEMBER"));
          }
        );
      } catch (error) {
        if (error.response?.data?.ERROR === "USERNAME_ALREADY_EXISTS") {
          toastr.error(Tools.translate("THIS_EMAIL_ALREADY_EXISTS"));
          setStatus(Tools.translate("THIS_EMAIL_ALREADY_EXISTS"));
        } else if (error.response?.data?.message) {
          setStatus(error.response.data.message);
          toastr.error(error.response.data.message);
        } else {
          setStatus(Tools.translate("ERROR_WHILE_SAVING_FAMILY_MEMBER"));
          toastr.error(Tools.translate("ERROR_WHILE_SAVING_FAMILY_MEMBER"));
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  const resetFamilyFormValues = () => {
    familyFormik.resetForm();
    setFamilyOriginalValues({
      public_id: "",
    });
  };

  useEffect(() => {
    const datepickerElement = document.getElementById(
      "family_member_birthDate"
    );

    const datepicker = flatpickr(datepickerElement, {
      enableTime: false,
      dateFormat: "Y-m-d",
      time_24hr: false,
      disableMobile: true,
      static: true,
      position: "above",
      clickOpens: true,
      allowInput: false,
      maxDate: "today",
      // Format and display
      altInput: true,
      altFormat: "F j, Y",
      onOpen: function (selectedDates, dateStr, instance) {
        // Manually adjust position
        instance.calendarContainer.style.top = "auto";
        instance.calendarContainer.style.bottom = "100%";
      },
      onChange: function (selectedDates, dateStr) {
        familyFormik.setFieldValue("date_of_birth", dateStr);
        familyFormik.setFieldTouched("date_of_birth", true, true);

        setTimeout(() => {
          familyFormik.validateField("date_of_birth");
        }, 0);
      },
      defaultDate: familyFormik.values.date_of_birth || null,
      onReady: function () {
        // Force our style on mobile
        if (window.innerWidth <= 767) {
          const calendar = this.calendarContainer;
          calendar.style.width = "100%";
          calendar.style.maxWidth = "320px";
          calendar.style.left = "50%";
          calendar.style.transform = "translateX(-50%)";
          calendar.style.zIndex = "999999";
        }
      },
    });

    return () => {
      if (datepicker && datepicker.destroy) {
        datepicker.destroy();
      }
    };
  }, [familyFormik]);

  useEffect(() => {
    const public_id = searchParams.get("public_id");

    const table = $("#family-table").DataTable({
      ajax: {
        url:
          process.env.BaseUrl +
          constants.API_URLS.FAMILY_MEMBERS +
          `?user_id=${public_id}`,
        type: "GET",
        headers: {
          authorization: "Bearer " + Auth.getAccessToken(),
        },
        error: function (xhr, error, thrown) {
          if (xhr.status === 401) {
            // Immediately clear tokens and redirect
            localStorage.removeItem("access-token");
            localStorage.removeItem("refresh-token");

            window.location.href = "/login?session_expired=1";
          } else {
            console.error("Ajax error:", xhr.responseText);
          }
        },
      },
      serverSide: true, // Enable server-side processing
      processing: true, // Show processing indicator
      pageLength: 10,
      order: [[0, "asc"]],
      columns: [
        {
          data: null,
          render: function (data, type, row) {
            const firstName = row.first_name || "";
            const lastName = row.last_name || "";
            const fullName = `${firstName} ${lastName}`.trim();
            return fullName || "N/A";
          },
        },
        {
          data: null,
          render: function (data) {
            return `${data.height || "0"} cm - ${data.weight || "0"} kg`;
          },
        },
        {
          data: "date_of_birth",
          title: "Age",
          render: function (data, type, row) {
            if (type === "display") {
              const ageText = calculateAge(data);
              return `
        <span 
          data-bs-toggle="tooltip" 
          data-bs-placement="top" 
          title="Birth date: ${data}"
        >
          ${ageText}
        </span>
      `;
            }
            return data; // For sorting/filtering
          },
        },
        {
          data: "gender",
        },

        {
          data: "date_joined",
          render: (data) => {
            return data ? format(parseISO(data), "yyyy-MM-dd") : "N/A";
          },
        },
        {
          data: null,
          orderable: false,
          render: function (data, type, row) {
            const isDeactivated =
              row.status?.toUpperCase() === "DEACTIVATED" ||
              row.status?.toUpperCase() === "INACTIVE";
            const role = Auth.getUserRole();

            const viewButton = `
            <button class="btn btn-icon btn-bg-light btn-color-primary btn-sm me-1 view-subscriptions-btn"
                data-row='${JSON.stringify(row)}'
                title=${Tools.translate("VIEW_SUBSCRIPTIONS")}
                data-bs-toggle="tooltip"
                data-bs-placement="bottom"
                data-bs-trigger="hover"
                >
                <i class="ki-duotone ki-eye fs-3">
                    <span class="path1"></span>
                    <span class="path2"></span>
                    <span class="path3"></span>
                </i>
            </button>`;

            const editButton =
              role !== "CASHIER"
                ? `
            <button class="btn btn-icon btn-bg-light btn-color-primary btn-sm me-1 edit-btn"
                data-bs-toggle="modal"
                data-bs-target="#family_modal"
                data-row='${JSON.stringify(row)}'>
                <i class="ki-duotone ki-pencil fs-3">
                    <span class="path1"></span>
                    <span class="path2"></span>
                </i>
            </button>`
                : "";

            return `
            <div id="actions-${data}" class="d-flex justify-content-center gap-2">
                ${viewButton}
                ${editButton}
            </div>
        `;
          },
        },
      ],
      responsive: true,
      ordering: true,
      searching: true,
      language:
        localStorage.getItem("appDirection") === "rtl"
          ? {
              sProcessing: "جارٍ التحميل...",
              sLengthMenu: "أظهر _MENU_ مدخلات",
              sZeroRecords: "لم يتم العثور على أية سجلات",
              sInfo: "إظهار _START_ إلى _END_ من أصل _TOTAL_ مدخل",
              sInfoEmpty: "يعرض 0 إلى 0 من أصل 0 سجل",
              sInfoFiltered: "(منتقاة من مجموع _MAX_ مُدخل)",
              sInfoPostFix: "",
              sSearch: "ابحث:",
              sUrl: "",
              oPaginate: {
                sFirst: "الأول",
                sPrevious: "السابق",
                sNext: "التالي",
                sLast: "الأخير",
              },
            }
          : {
              paginate: {
                next: "Next",
                previous: "Previous",
              },
            },
      drawCallback: function (data) {
        $('[data-bs-toggle="tooltip"]').tooltip();
      },
    });

    setFamilyTable(table);

    $(document).on("click", ".edit-btn", function () {
      const rowData = $(this).data("row");
      toggleUpdateModal(rowData);
    });

    $(document).on("click", ".view-subscriptions-btn", function () {
      const rowData = $(this).data("row");
      handleViewSubscriptions(rowData);
    });

    return () => {
      table.destroy();
    };
  }, []);

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    const yearDiff = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();
    const dayDiff = today.getDate() - birthDateObj.getDate();

    // If born in current year
    if (yearDiff === 0) {
      const months =
        monthDiff < 0 ? 0 : dayDiff < 0 ? monthDiff - 1 : monthDiff;
      return `${months} month${months !== 1 ? "s" : ""}`;
    }

    let age = yearDiff;
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }

    return `${age} year${age !== 1 ? "s" : ""}`;
  };

  const handleViewSubscriptions = (memberData) => {
    setSelectedMember(memberData);
    setShowSubscriptionsModal(true);
  };

  const toggleUpdateModal = (packageData) => {
    familyFormik.setValues(packageData);
    setFamilyOriginalValues(packageData);
  };

  //clear when hidden
  useEffect(() => {
    const clearFilters = () => {
      setNameFilter("");
      setFacilityFilter("");
      setTrainerFilter("");
      setNameMembershipFilter("");
      setNameClassFilter("");
    };

    const membershipModal = document.getElementById("kt_modal_add_membership");
    const classModal = document.getElementById("kt_modal_add_class");
    const courseModal = document.getElementById("kt_modal_add_course");

    if (membershipModal) {
      membershipModal.addEventListener("hidden.bs.modal", clearFilters);
    }
    if (classModal) {
      classModal.addEventListener("hidden.bs.modal", clearFilters);
    }
    if (courseModal) {
      courseModal.addEventListener("hidden.bs.modal", clearFilters);
    }

    // Cleanup listeners on unmount
    return () => {
      if (membershipModal) {
        membershipModal.removeEventListener("hidden.bs.modal", clearFilters);
      }
      if (classModal) {
        classModal.removeEventListener("hidden.bs.modal", clearFilters);
      }
      if (courseModal) {
        courseModal.removeEventListener("hidden.bs.modal", clearFilters);
      }
    };
  }, []);

  useEffect(() => {
    if (showSubscriptionsModal) {
      // When modal is open
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = "0";
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }

    // Cleanup function
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [showSubscriptionsModal]);

  //#region accounting logic
  const [transactionNameFilter, setTransactionNameFilter] = useState("");
  const [activeDiscounts, setActiveDiscounts] = useState([]);
  const [selectedDateType, setSelectedDateType] = useState("created_dt");
  const [selectedDateValue, setSelectedDateValue] = useState(
    `${moment().subtract(30, "days").format("MM/DD/YYYY")} - ${moment().format(
      "MM/DD/YYYY"
    )}`
  );
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const flatpickrInputRef = useRef(null);
  const flatpickrRef = useRef(null);
  const [transactionOriginalValues, setTransactionOriginalValues] = useState({
    public_id: "",
    package_name: "",
    package_type: "",
    amount: "",
    user: "",
    status: "",
    amount_to_pay: "0",
    rest: "",
    date: new Date().toISOString().split("T")[0],
    payment_method: "cash",
  });

  const transactionValidationSchema = Yup.object().shape({
    payment_method: Yup.string().required(
      Tools.translate("PAYMENT_TYPE_REQUIRED")
    ),
    amount_to_pay: Yup.number()
      .required(Tools.translate("AMOUNT_TO_PAY_REQUIRED"))
      .min(0, "Amount cannot be negative"),
    date: Yup.date()
      .required(Tools.translate("PAYMENT_DATE_REQUIRED"))
      .max(new Date(), "Date cannot be in the future"),
  });

  useEffect(() => {
    const public_id = searchParams.get("public_id");

    const table = $("#transactions-table").DataTable({
      ajax: {
        url:
          process.env.BaseUrl +
          constants.API_URLS.TRANSACTIONS_LIST +
          `?user=${public_id}`,
        type: "GET",
        headers: {
          authorization: "Bearer " + Auth.getAccessToken(),
        },
        error: function (xhr, error, thrown) {
          if (xhr.status === 401) {
            // Immediately clear tokens and redirect
            localStorage.removeItem("access-token");
            localStorage.removeItem("refresh-token");

            window.location.href = "/login?session_expired=1";
          } else {
            console.error("Ajax error:", xhr.responseText);
          }
        },
      },
      serverSide: true,
      processing: true,
      pageLength: 10,
      order: [[7, "asc"]],
      columns: [
        {
          data: null,
          render: function (data) {
            return data?.content ?? "N/A";
          },
        },
        {
          data: null,
          render: function (data) {
            return data?.package_obj?.name ?? "N/A";
          },
        },
        {
          data: "amount",
          render: (data) => `${data} SAR`,
        },
        {
          data: "rest",
          render: (data) => `${data} SAR`,
        },

        {
          data: "discount_amount",
        },
        {
          data: "status",
          render: (data) => {
            const rawStatus = data || "";
            const formattedStatus = rawStatus.toLowerCase().replace(/_/g, " ");
            let badgeClass = "badge-light-success";

            if (rawStatus === "UNPAID") {
              badgeClass = "badge-light-danger";
            } else if (rawStatus === "PARTIAL_PAID") {
              badgeClass = "badge-light-warning";
            }

            return `<span class="badge ${badgeClass} fw-bolder">${formattedStatus}</span>`;
          },
        },
        {
          data: "created_dt",
          render: (data) => {
            return data ? format(parseISO(data), "yyyy-MM-dd") : "N/A";
          },
        },
        {
          data: null,
          orderable: false,
          render: function (data, type, row) {
            const status = row.status?.toUpperCase();
            if (status === "PAID") return "";

            return `
            <div class="d-flex justify-content-center gap-2">
                <button class="btn btn-icon btn-bg-light btn-color-primary btn-sm edit-transaction-btn"
                        data-transaction='${JSON.stringify(row)}'
                        title=${Tools.translate("PAY")}
                        data-bs-toggle="tooltip"
                        data-bs-placement="bottom"
                        data-bs-trigger="hover"
                        >
                    <i class="ki-duotone ki-bill fs-3">
                     <span class="path1"></span>
                     <span class="path2"></span>
                     <span class="path3"></span>
                     <span class="path4"></span>
                     <span class="path5"></span>
                     <span class="path6"></span>
                    </i>
                </button>
            </div>
        `;
          },
        },
      ],
      responsive: true,
      ordering: true,
      searching: true,
      language:
        localStorage.getItem("appDirection") === "rtl"
          ? {
              sProcessing: "جارٍ التحميل...",
              sLengthMenu: "أظهر _MENU_ مدخلات",
              sZeroRecords: "لم يتم العثور على أية سجلات",
              sInfo: "إظهار _START_ إلى _END_ من أصل _TOTAL_ مدخل",
              sInfoEmpty: "يعرض 0 إلى 0 من أصل 0 سجل",
              sInfoFiltered: "(منتقاة من مجموع _MAX_ مُدخل)",
              sInfoPostFix: "",
              sSearch: "ابحث:",
              sUrl: "",
              oPaginate: {
                sFirst: "الأول",
                sPrevious: "السابق",
                sNext: "التالي",
                sLast: "الأخير",
              },
            }
          : {
              paginate: {
                next: "Next",
                previous: "Previous",
              },
            },
      drawCallback: function (settings) {
        $('[data-bs-toggle="tooltip"]').tooltip();
      },
    });

    setTransactionTable(table);

    $(document).on("click", ".edit-transaction-btn", function () {
      const transaction = $(this).data("transaction");
      const currentStatus = transaction.status?.toUpperCase();

      if (currentStatus !== "UNPAID" && currentStatus !== "PARTIAL_PAID")
        return;

      toggleUpdate(transaction);
    });

    return () => {
      table.destroy();
    };
  }, []);

  const toggleUpdate = (transaction) => {
    setTransactionOriginalValues({
      public_id: transaction.public_id,
      package_name: transaction.package_obj?.name || "N/A",
      package_type: transaction.package_obj?.type || "N/A",
      amount: transaction.amount,
      user: transaction.user || "N/A",
      status: transaction.status,
      rest: transaction.rest,
      amount_to_pay: "0", // Reset to 0 when opening modal
      date: new Date().toISOString().split("T")[0],
      credit_notes: transaction?.package_obj?.credit_notes || "0",
    });
    setShowPaymentModal(true);
  };

  const transactionFormik = useFormik({
    enableReinitialize: true,
    validationSchema: transactionValidationSchema,
    initialValues: {
      ...transactionOriginalValues,
      payment_method: "cash",
    },
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      try {
        const response = await updateTransactionStatus({
          transaction: values.public_id,
          amount: values.amount_to_pay,
          payment_date: values.date,
          payment_method: values.payment_method,
        });

        Tools.checkResponseStatus(
          response,
          () => {
            toastr.success(Tools.translate("PAYMENT_RECORDED_SUCCESSFULLY"));
            $("#transactions-table").DataTable().ajax.reload();
            setShowPaymentModal(false);
            fetchClientInfo();
          },
          () => {
            toastr.error(Tools.translate("ERROR"));
          }
        );
      } catch (error) {
        console.error(error);
        let errorMessage = Tools.translate("ERROR");
        if (error.response.data.error === "Insufficient credit notes.") {
          errorMessage = Tools.translate("INSUFFICIENT_CREDIT_NOTES_AVAILABLE");
        }
        setStatus(errorMessage);
        toastr.error(errorMessage);
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Initialize flatpickr
  useEffect(() => {
    if (showPaymentModal && flatpickrInputRef.current) {
      flatpickrRef.current = flatpickr(flatpickrInputRef.current, {
        defaultDate: transactionFormik.values.date,
        maxDate: "today",
        dateFormat: "Y-m-d",
        onChange: (selectedDates, dateStr) => {
          transactionFormik.setFieldValue("date", dateStr);
        },
      });
    }

    return () => {
      if (flatpickrRef.current) {
        flatpickrRef.current.destroy(); // This is now valid
        flatpickrRef.current = null;
      }
    };
  }, [showPaymentModal, transactionFormik.values.date]);

  const reloadTransactionDatatable = () => {
    if (transactionTable) {
      $("#transactions-table").DataTable().settings()[0].ajax.data = function (
        data
      ) {
        data.selected_date_type = selectedDateType;
        data.selected_date_value = selectedDateValue;
        // if (transactionNameFilter !== "") {
        //     data.status_filter = selectReservationStatus;
        // }
        if (transactionNameFilter !== "" && transactionNameFilter.length >= 3) {
          data.filter = transactionNameFilter;
        }
      };

      $("#transactions-table").DataTable().ajax.reload();
    }
  };

  useEffect(() => {
    reloadTransactionDatatable();
  }, [selectedDateValue, transactionNameFilter]);

  useEffect(() => {
    // Initialize the date range picker
    $("#main-daterange").daterangepicker(
      {
        showDropdowns: true,
        startDate: moment().subtract(30, "days"), // 30 days ago
        endDate: moment(), // Today's date
        ranges: {
          Today: [moment(), moment()],
          Yesterday: [
            moment().subtract(1, "days"),
            moment().subtract(1, "days"),
          ],
          "Last 7 Days": [moment().subtract(6, "days"), moment()],
          "Last 30 Days": [moment().subtract(29, "days"), moment()],
          "Next 30 Days": [moment(), moment().add(30, "days")],
          "This Month": [moment().startOf("month"), moment().endOf("month")],
          "Last Month": [
            moment().subtract(1, "month").startOf("month"),
            moment().subtract(1, "month").endOf("month"),
          ],
        },
        locale: {
          applyLabel: "Submit",
          cancelLabel: "Clear",
          fromLabel: "From",
          toLabel: "To",
          customRangeLabel: "Custom",
          daysOfWeek: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
          monthNames: [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ],
        },
        opens: "center",
      },
      function (start, end) {
        $("#main-daterange").val(
          start.format("MM/DD/YYYY") + " - " + end.format("MM/DD/YYYY")
        );
        setSelectedDateValue(
          start.format("MM/DD/YYYY") + " - " + end.format("MM/DD/YYYY")
        );
      }
    );

    // Set initial date range (last 30 days)
    const initialStart = moment().subtract(30, "days").format("MM/DD/YYYY");
    const initialEnd = moment().format("MM/DD/YYYY");
    setSelectedDateValue(`${initialStart} - ${initialEnd}`);
    $("#main-daterange").val(`${initialStart} - ${initialEnd}`);

    // Add the date type selector
    $(".daterangepicker > .ranges").prepend(
      `<select id="selectDateFilterType" name="st_date" class="select2-selection select2-selection--single form-select form-select-solid custom-rangepiker-select"> 
            <option value="created_dt">Created Date</option>
        </select>`
    );

    $(document).on("change", "#selectDateFilterType", function () {
      setSelectedDateType(this.value);
    });

    $("#main-daterange").on("apply.daterangepicker", function (ev, picker) {
      setSelectedDateValue(this.value);
    });
  }, []);

  const openDateRangePicker = () => {
    const picker = $("#main-daterange").data("daterangepicker");
    if (picker) {
      picker.show();
    } else {
      // Reinitialize if needed
      $("#main-daterange").daterangepicker({}).data("daterangepicker").show();
    }
  };

  const fetchActiveDiscounts = async () => {
    const public_id = searchParams.get("public_id");

    setLoading(true);
    try {
      const filters = {};
      filters.user_id = public_id;

      const response = await listDiscounts(filters);
      if (response && Array.isArray(response.data)) {
        setActiveDiscounts(response.data);
      }
    } catch (error) {
      console.error("Error fetching active discounts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveDiscounts();
  }, []);

  const handleUpdateCredit = async () => {
    const currentCredits = originalValues.number_of_credits || 0;

    const { value: creditsToAdd } = await Swal.fire({
      title: Tools.translate("NUMBER_OF_CREDITS_TO_ADD"),
      input: "number",
      inputValue: 0,
      showCancelButton: true,
      confirmButtonText: Tools.translate("SUBMIT"),
      cancelButtonText: Tools.translate("CANCEL"),
      showLoaderOnConfirm: true,
      inputAttributes: {
        min: 0,
        step: 1,
      },
      inputValidator: (value) => {
        if (value === null || value === "")
          return Tools.translate("PLEASE_ENTER_VALUE");
        if (isNaN(value)) return Tools.translate("PLEASE_ENTER_VALID_NUMBER");
        if (parseFloat(value) < 0) {
          return Tools.translate("CREDITS_CANNOT_BE_NEGATIVE");
        }
        return null;
      },
    });

    if (creditsToAdd !== undefined) {
      try {
        const creditsToAddNum = parseFloat(creditsToAdd);
        const newTotalCredits = currentCredits + creditsToAddNum;

        await updateClientsCredit({
          user: originalValues.public_id,
          number_of_credit: creditsToAdd,
        });

        setOriginalValues((prev) => ({
          ...prev,
          number_of_credits: newTotalCredits,
        }));
        $("#transactions-table").DataTable().ajax.reload(null, false);

        toastr.success(
          creditsToAddNum > 0
            ? Tools.translate("CREDITS_ADDED_TO_CLIENT")
            : Tools.translate("UPDATED_SUCCESSFULLY")
        );
      } catch (error) {
        console.error(error);
        toastr.error(Tools.translate("ERROR"));
      }
    }
  };

  useEffect(() => {
    const tab = searchParams.get("activeTab");
    if (tab) {
      setActiveTab(tab);
      // Programmatically show the tab if using Bootstrap JS
      const tabElement = document.querySelector(`a.nav-link[href="#${tab}"]`);
      if (tabElement) new bootstrap.Tab(tabElement).show();
    }
  }, [searchParams]);

  //#region activity logic
  const [activities, setActivities] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [timeRange, setTimeRange] = useState("today");
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);

  const fetchUserActivity = async (range = timeRange) => {
    setActivityLoading(true);
    const public_id = searchParams.get("public_id");
    const filters = { user_id: public_id, page: page };

    if (range) {
      filters.time = range;
    }

    try {
      const response = await listUserActivities(filters);

      if (response && response.data) {
        setActivities(response.data.activities);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("error fetching activities", error);
      toastr.error("error fetching activities");
    } finally {
      setActivityLoading(false);
    }
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    // fetchUserActivity(range);
  };

  // useEffect(() => {
  //     fetchUserActivity();
  // }, [page]);

  const getTitleDateRange = () => {
    const today = new Date();
    if (timeRange === "today") {
      return today.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }

    if (timeRange === "week") {
      const lastDay = new Date(); // today
      const firstDay = new Date();
      firstDay.setDate(lastDay.getDate() - 6);

      return `${firstDay.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })} - ${lastDay.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`;
    }

    if (timeRange === "month") {
      return today.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    }

    return "All Time";
  };

  //handling image and cover logic
  const [tempImages, setTempImages] = useState({
    profile_image: originalValues.image || null,
    profile_cover: originalValues.cover_photo || null,
  });

  // Refs for file inputs
  const profileImageInputRef = useRef(null);
  const coverImageInputRef = useRef(null);

  // Handle file selection for profile image
  const handleProfileImageChange = async (e) => {
    const public_id = searchParams.get("public_id");
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImages((prev) => ({
          ...prev,
          profile_image: reader.result,
        }));
      };
      reader.readAsDataURL(file);

      try {
        // Send the image to the backend
        const formData = new FormData();
        formData.append("public_id", public_id);
        formData.append("image", file);

        const response = await changeProfileImage(formData);

        Tools.checkResponseStatus(
          response,
          () => {
            toastr.success(Tools.translate("IMAGE_UPLOADED_SUCCESSFULLY"));
            fetchClientInfo();
          },
          () => {
            toastr.error(Tools.translate("ERROR"));
          }
        );
      } catch (error) {
        console.error("error uploading image", error);
        if (error.isAxiosError) {
          if (error.code === "ERR_NETWORK") {
            toastr.error(Tools.translate("IMAGE_IS_TOO_LARGE"));
          } else if (error.response?.status === 413) {
            toastr.error(Tools.translate("IMAGE_IS_TOO_LARGE"));
          } else {
            toastr.error(Tools.translate("ERROR"));
          }
        }
      }
    }
  };

  // Handle file selection for cover image
  const handleCoverImageChange = async (e) => {
    const public_id = searchParams.get("public_id");
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setTempImages((prev) => ({
        ...prev,
        profile_cover: reader.result,
      }));
    };
    reader.readAsDataURL(file);

    try {
      // Send the image to the backend
      const formData = new FormData();
      formData.append("public_id", public_id);
      formData.append("cover_photo", file);

      const response = await changeProfileImage(formData);

      Tools.checkResponseStatus(
        response,
        () => {
          toastr.success(Tools.translate("IMAGE_UPLOADED_SUCCESSFULLY"));
          fetchClientInfo();
        },
        () => {
          toastr.error(Tools.translate("ERROR"));
        }
      );
    } catch (error) {
      console.error("error uploading image", error);
      if (error.isAxiosError) {
        if (error.code === "ERR_NETWORK") {
          toastr.error(Tools.translate("IMAGE_IS_TOO_LARGE"));
        } else if (error.response?.status === 413) {
          toastr.error(Tools.translate("IMAGE_IS_TOO_LARGE"));
        } else {
          toastr.error(Tools.translate("ERROR"));
        }
      }
    }
  };

  // Trigger file input click
  const triggerProfileImageInput = () => {
    profileImageInputRef.current.click();
  };

  const triggerCoverImageInput = () => {
    coverImageInputRef.current.click();
  };

  //#region Email logic
  const quillRef = useRef(null);
  const quillInstance = useRef(null);
  const tagifyRef = useRef(null);
  const client_public_id = searchParams.get("public_id");
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (quillRef.current && !quillInstance.current) {
      quillInstance.current = new Quill(quillRef.current, {
        modules: { toolbar: true },
        placeholder: Tools.translate("TYPE_YOUR_TEXT_HERE"),
        theme: "snow",
      });

      // Set initial empty content
      quillInstance.current.root.innerHTML = "<p><br></p>";

      const updateFormik = (delta, oldDelta, source) => {
        if (source === "user") {
          // Only update on user input
          const content = quillInstance.current.root.innerHTML;
          emailFormik.setFieldValue("text", content, false);
        }
      };

      quillInstance.current.on("text-change", debounce(updateFormik, 300));

      return () => {
        if (quillInstance.current) {
          quillInstance.current.off("text-change");
        }
      };
    }
  }, []);

  // debounce function
  const debounce = useCallback((func, wait) => {
    let timeout;
    return function (...args) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  }, []);

  // Tagify initialization
  useEffect(() => {
    const tagInput = document.querySelector('input[name="compose_to"]');
    if (!tagInput || tagifyRef.current) return;

    tagifyRef.current = new Tagify(tagInput);
    tagifyRef.current.addTags([
      { value: originalValues.username, id: client_public_id },
    ]);

    return () => {
      if (tagifyRef.current) {
        tagifyRef.current.destroy();
      }
    };
  }, [client_public_id, originalValues.username]);

  const emailFormik = useFormik({
    initialValues: {
      subject: "",
      text: "<p><br></p>", // Initialize with Quill's empty state
    },
    validationSchema: Yup.object({
      subject: Yup.string().required("Subject is required"),
      text: Yup.string().test(
        "not-empty",
        "Message cannot be empty",
        (value) => value && value !== "<p><br></p>"
      ),
    }),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        // Get the latest content directly from Quill
        const finalContent =
          quillInstance.current?.root.innerHTML || values.text;

        const payload = {
          To: originalValues.username,
          From: user.username,
          subject: values.subject,
          text: finalContent,
        };

        await sendEmail(payload);
        toastr.success(Tools.translate("EMAIL_SENT_SUCCESSFULLY"));

        // Reset form and Quill content
        resetForm();
        if (quillInstance.current) {
          quillInstance.current.root.innerHTML = "<p><br></p>";
        }

        // Close modal
        bootstrap.Modal.getInstance(
          document.getElementById("sendMessageModal")
        )?.hide();
      } catch (error) {
        toastr.error(Tools.translate("ERROR"));
        console.error(error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Modal cleanup
  useEffect(() => {
    const modal = document.getElementById("sendMessageModal");
    if (!modal) return;

    const handleHide = () => {
      emailFormik.resetForm();
      if (quillInstance.current) {
        quillInstance.current.root.innerHTML = "<p><br></p>";
      }
    };

    modal.addEventListener("hidden.bs.modal", handleHide);

    return () => {
      modal.removeEventListener("hidden.bs.modal", handleHide);
    };
  }, [emailFormik.resetForm]);

  // #region jsx
  return (
    <Fragment>
      <div className="d-flex flex-column flex-lg-row">
        <div className="flex-column flex-lg-row-auto w-lg-250px w-xl-350px mb-10">
          <input
            type="file"
            ref={profileImageInputRef}
            onChange={handleProfileImageChange}
            accept="image/*"
            style={{ display: "none" }}
          />
          <input
            type="file"
            ref={coverImageInputRef}
            onChange={handleCoverImageChange}
            accept="image/*"
            style={{ display: "none" }}
          />
          <div className="card mb-5 mb-xl-8">
            <div
              className="card-header align-items-center p-0 position-relative"
              style={{ height: "150px", overflow: "visible" }}
            >
              <div
                className="w-100 h-100 bg-light-secondary rounded-top"
                style={{
                  backgroundImage: tempImages.profile_cover
                    ? `url(${tempImages.profile_cover})`
                    : "url(https://codetheweb.blog/assets/img/posts/css-advanced-background-images/cover.jpg)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />

              {originalValues.status && (
                <div
                  className="position-absolute start-0 ms-5"
                  style={{
                    top: "-5px",
                    zIndex: 1,
                  }}
                >
                  <div
                    className={`ribbon ribbon-top ribbon-vertical bg-${
                      statusColors[originalValues.status] || "secondary"
                    } text-white rounded-bottom-2`}
                    style={{
                      minWidth: "100px",
                      fontWeight: "bold",
                      boxShadow: "0 0.5rem 1.125rem -0.5rem rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    {originalValues.status.replace(/_/g, " ")}
                  </div>
                </div>
              )}

              <div
                className="position-absolute top-0 end-0 p-0"
                style={{ zIndex: 1070 }}
              >
                <div className="dropdown">
                  <button
                    className="btn btn-icon btn-active-color-primary btn-color-white btn-sm"
                    data-kt-menu-trigger="click"
                    data-kt-menu-placement="bottom-end"
                  >
                    <i className="ki-duotone ki-pencil fs-3">
                      <span className="path1"></span>
                      <span className="path2"></span>
                    </i>
                  </button>
                  <div
                    className="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-semibold fs-7 w-200px py-4"
                    data-kt-menu="true"
                  >
                    <div className="menu-item px-3">
                      <button
                        className="dropdown-item"
                        onClick={() => {
                          if (tempImages.profile_cover) {
                            setLightboxSource([tempImages.profile_cover]);
                            setLightboxController({
                              toggler: !lightboxController.toggler,
                              slide: 1,
                            });
                          } else {
                            toastr.error(Tools.translate("NO_COVER_IMAGE"));
                          }
                        }}
                      >
                        <i className="ki-duotone ki-eye me-4 fs-3">
                          <span className="path1"></span>
                          <span className="path2"></span>
                          <span className="path3"></span>
                        </i>
                        {Tools.translate("VIEW_COVER")}
                      </button>
                    </div>
                    {Auth.getUserRole() !== "CASHIER" && (
                      <div className="menu-item px-3 mt-4">
                        <button
                          className="dropdown-item"
                          onClick={triggerCoverImageInput}
                        >
                          <i className="ki-duotone ki-file-down me-3 ms-1  fs-3">
                            <span className="path1"></span>
                            <span className="path2"></span>
                          </i>
                          {Tools.translate("UPLOAD_COVER")}
                        </button>
                      </div>
                    )}
                  </div>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li></li>
                    {Auth.getUserRole() !== "CASHIER" && (
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={triggerCoverImageInput}
                        >
                          <i className="ki-duotone ki-file-down me-3 ms-1  fs-3">
                            <span className="path1"></span>
                            <span className="path2"></span>
                          </i>
                          {Tools.translate("UPLOAD_COVER")}
                        </button>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
            <div className="card-body pt-0">
              <div
                className="d-flex flex-center flex-column"
                style={{ marginTop: "-60px" }}
              >
                <div className="symbol symbol-150px symbol-circle mb-7 border-4 border-white position-relative">
                  <div className="dropdown">
                    <button
                      className="btn btn-icon btn-clean btn-dropdown btn-active-color-primary p-0"
                      data-kt-menu-trigger="click"
                      data-kt-menu-placement="bottom-end"
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        opacity: 0,
                      }}
                    ></button>

                    <div className="symbol-label bg-light-primary d-flex align-items-center justify-content-center">
                      {tempImages.profile_image ? (
                        <img
                          src={tempImages.profile_image}
                          alt="Profile"
                          className="w-100 h-100"
                          style={{
                            objectFit: "cover",
                            borderRadius: "50%",
                          }}
                        />
                      ) : (
                        <span className="fs-2x fw-bold text-primary">
                          {initials}
                        </span>
                      )}
                    </div>

                    <div
                      className="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-semibold fs-7 w-200px py-4"
                      data-kt-menu="true"
                      style={{ zIndex: 1070 }}
                    >
                      <div className="menu-item px-3">
                        <button
                          className="dropdown-item"
                          onClick={() => {
                            if (tempImages.profile_image) {
                              setLightboxSource([tempImages.profile_image]);
                              setLightboxController({
                                toggler: !lightboxController.toggler, // flip value to force re-open
                                slide: 1,
                              });
                            } else {
                              toastr.error(Tools.translate("NO_PROFILE_PIC"));
                            }
                          }}
                        >
                          <i className="ki-duotone ki-eye me-3 ms-1 fs-3">
                            <span className="path1"></span>
                            <span className="path2"></span>
                            <span className="path3"></span>
                          </i>
                          {Tools.translate("VIEW_PHOTO")}
                        </button>
                      </div>
                      {Auth.getUserRole() !== "CASHIER" && (
                        <div className="menu-item px-3 mt-4">
                          <button
                            className="dropdown-item"
                            onClick={triggerProfileImageInput}
                          >
                            <i className="ki-duotone ki-file-down me-3 ms-1 fs-3">
                              <span className="path1"></span>
                              <span className="path2"></span>
                            </i>
                            {Tools.translate("UPLOAD_PHOTO")}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="fs-3 text-gray-800 fw-bold mb-3 d-flex align-items-center">
                  <span className="text-hover-primary margin-dir-end-2">
                    {originalValues.first_name} {originalValues.last_name}
                  </span>

                  <i
                    className="ki-duotone ki-message-text-2 fs-2 cursor-pointer text-gray-500 text-hover-primary ms-5"
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    title={Tools.translate("SEND_EMAIL")}
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      const modal = new bootstrap.Modal(
                        document.getElementById("sendMessageModal")
                      );
                      modal.show();
                    }}
                  >
                    <span className="path1"></span>
                    <span className="path2"></span>
                    <span className="path3"></span>
                  </i>
                </div>
                <div
                  className={`badge badge-lg d-inline mb-9 bg-primary text-white`}
                >
                  {Tools.translate("CLIENT")}
                </div>
              </div>
              <div className="d-flex flex-stack fs-4 py-3">
                <div className="fw-bold rotate collapsible">
                  {Tools.translate("INFORMATION")}
                </div>
              </div>
              <div className="separator"></div>
              <div id="kt_user_view_details" className="collapse show">
                <div className="pb-5 fs-6 d-flex align-items-center mt-2">
                  <div className="fw-bold">
                    {Tools.translate("PHONE_NUMBER")}{" "}
                  </div>
                  <div className="text-gray-600 text-hover-primary margin-dir-3">
                    {originalValues.phone_number}
                  </div>
                </div>
                <div className="pb-5 fs-6 d-flex align-items-center ">
                  <div className="fw-bold">{Tools.translate("GENDER")}</div>
                  <div className="text-gray-600 text-hover-primary margin-dir-3">
                    {originalValues.gender}
                  </div>
                </div>
                <div className="pb-5 fs-6 d-flex align-items-center ">
                  <div className="fw-bold">{Tools.translate("HEIGHT")}</div>
                  <div className="text-gray-600 text-hover-primary margin-dir-3">
                    {originalValues.height} cm
                  </div>
                </div>
                <div className="pb-5 fs-6 d-flex align-items-center ">
                  <div className="fw-bold">{Tools.translate("WEIGHT")}</div>
                  <div className="text-gray-600 text-hover-primary margin-dir-3">
                    {originalValues.weight} kg
                  </div>
                </div>
                <div className="pb-5 fs-6 d-flex align-items-center ">
                  <div className="fw-bold">
                    {Tools.translate("DATE_OF_BIRTH")}
                  </div>
                  <div className="text-gray-600 text-hover-primary margin-dir-3">
                    {originalValues.date_of_birth}
                  </div>
                </div>
                <div className="pb-5 fs-6 d-flex align-items-center ">
                  <div className="fw-bold">
                    {Tools.translate("EMERGENCY_CONTACT")}
                  </div>
                  <div className="text-gray-600 text-hover-primary margin-dir-3">
                    {originalValues.emergency_contact}
                  </div>
                </div>
                <div className="pb-5 fs-6 d-flex align-items-center ">
                  <div className="fw-bold">{Tools.translate("NATIONALIY")}</div>
                  <div className="text-gray-600 text-hover-primary margin-dir-3">
                    {originalValues.nationality?.name}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-lg-row-fluid ms-lg-15">
          <ul className="nav nav-custom nav-tabs nav-line-tabs nav-line-tabs-2x border-0 fs-4 fw-semibold mb-8">
            {Auth.getUserRole() !== "CASHIER" && (
              <li className="nav-item">
                <a
                  className="nav-link text-active-primary pb-4 active"
                  data-bs-toggle="tab"
                  href="#overview"
                >
                  {Tools.translate("OVERVIEW")}
                </a>
              </li>
            )}
            <li className="nav-item">
              <a
                className={`nav-link text-active-primary pb-4 ${
                  Auth.getUserRole() === "CASHIER" ? "active" : ""
                }`}
                data-bs-toggle="tab"
                href="#membership"
              >
                {Tools.translate("MEMBERSHIPS")}
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link text-active-primary pb-4"
                data-bs-toggle="tab"
                href="#course"
              >
                {Tools.translate("COURSES")}
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link text-active-primary pb-4"
                data-bs-toggle="tab"
                href="#class"
              >
                {Tools.translate("CLASSES")}
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link text-active-primary pb-4"
                data-bs-toggle="tab"
                href="#activity"
              >
                {Tools.translate("ACTIVITY")}
              </a>
            </li>
            <li className="nav-item">
              <a
                className={`nav-link text-active-primary pb-4 ${
                  activeTab === "accounting" ? "active" : ""
                }`}
                data-bs-toggle="tab"
                href="#accounting"
              >
                {Tools.translate("ACCOUNTING")}
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link text-active-primary pb-4"
                data-bs-toggle="tab"
                href="#family"
              >
                {Tools.translate("FAMILY")}
              </a>
            </li>
            {Auth.getUserRole() !== "CASHIER" && (
              <li className="nav-item">
                <a
                  className="nav-link text-active-primary pb-4"
                  data-bs-toggle="tab"
                  href="#security"
                >
                  {Tools.translate("SECURITY")}
                </a>
              </li>
            )}
          </ul>

          <div className="tab-content">
            {Auth.getUserRole() !== "CASHIER" && (
              <div className="tab-pane fade active show me-10" id="overview">
                <div className="card pt-0 mb-6 mb-xl-9">
                  <div className="card-header border-0">
                    <div className="card-title">
                      <h2>{Tools.translate("CLIENT_INFO")}</h2>
                    </div>
                    {/* <div className="card-header ribbon ribbon-top ribbon-vertical">
                                        <div
                                            className={`ribbon-label min-w-100px fw-bold shadow bg-${statusColors[clientStatus] || 'secondary'}`}>
                                            {clientStatus ? clientStatus.replace(/_/g, ' ') : ''}
                                        </div>
                                    </div> */}
                  </div>
                  <div className="card-body">
                    <ClientFormInfo
                      selectedClient={selectedClient}
                      onClientUpdate={handleClientUpdate}
                    />
                  </div>
                </div>
              </div>
            )}
            {Auth.getUserRole() !== "CASHIER" && (
              <div className="tab-pane fade me-10" id="security">
                <div className="card pt-0 mb-6 mb-xl-9">
                  <div className="card-header border-0">
                    <div className="card-title">
                      <h2>{Tools.translate("SECURITY")}</h2>
                    </div>
                  </div>
                  <div className="card-body pt-0 pb-5">
                    <div className="table-responsive">
                      <table
                        className="table align-middle table-row-dashed gy-5"
                        id="kt_table_users_login_session"
                      >
                        <tbody className="fs-6 fw-semibold text-gray-600">
                          <tr>
                            <td>{Tools.translate("USERNAME")}</td>
                            <td>{originalValues.username || "-"}</td>
                          </tr>
                          <tr>
                            <td>{Tools.translate("PASSWORD")}</td>
                            <td>******</td>
                            <td className="text-end">
                              <button
                                type="button"
                                className="btn btn-icon btn-primary w-30px h-30px ms-auto"
                                data-bs-toggle="modal"
                                data-bs-target="#kt_modal_1"
                              >
                                <i
                                  className="ki-solid ki-key fs-2"
                                  data-bs-toggle="tooltip"
                                  data-bs-trigger="hover"
                                  title={Tools.translate("CHANGE_PASSWORD")}
                                ></i>
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="tab-pane fade me-10" id="subscription">
              <div className="card pt-0 mb-6 mb-xl-9">
                <div className="card-header align-items-center py-5 gap-2 gap-md-5">
                  <div className="card-title">
                    <div className="w-250px position-relative">
                      <i className="ki-duotone ki-magnifier fs-3 position-absolute top-50 start-0 translate-middle-y ms-4">
                        <span className="path1"></span>
                        <span className="path2"></span>
                      </i>
                      <input
                        type="text"
                        id="name_filter"
                        data-kt-ecommerce-order-filter="search"
                        className="form-control form-control-solid w-250px ps-12"
                        placeholder="Search Package"
                        onChange={(e) => {
                          if (
                            e.target.value.length >= 3 ||
                            e.target.value === ""
                          )
                            setNameFilter(e.target.value);
                        }}
                      />
                    </div>
                    <div
                      className="w-100 w-md-150px mx-4"
                      id="facilitySelectContainer"
                    >
                      <select
                        className="form-select form-select-solid"
                        id="facilityFilter"
                        data-hide-search="true"
                        data-placeholder="Facility"
                        data-kt-ecommerce-order-filter="facility"
                      >
                        <option value=""></option>
                        <option value="all">All Facilities</option>
                        {facilities &&
                          facilities.map((facility) => (
                            <option
                              key={facility.public_id}
                              value={facility.name}
                            >
                              {facility.name}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div
                      className="w-100 w-md-150px"
                      id="trainerSelectContainer"
                    >
                      <select
                        className="form-select form-select-solid"
                        id="trainerFilter"
                        data-placeholder="Trainer"
                      >
                        <option value=""></option>
                        <option value="all">All Trainers</option>
                        {trainers &&
                          trainers.map((trainer) => (
                            <option
                              key={trainer.public_id}
                              value={trainer.public_id}
                            >
                              {trainer.full_name}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="card-body py-3">
                  <div className="table-responsive">
                    <table
                      id="subscription-table"
                      className="table table-row-bordered table-row-dashed gy-4 align-middle fw-bold"
                    >
                      <thead className="fw-semibold fs-6 text-gray-700 bg-light text-uppercase">
                        <tr>
                          <th>Name</th>
                          <th>DESCRIPTION</th>
                          <th>TYPE</th>
                          <th>TRAINER</th>
                          <th>CAPACITY</th>
                          <th>Price</th>
                          <th>Facility</th>
                          <th>Location</th>
                          <th className="text-center">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody></tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`tab-pane fade me-10 ${
                Auth.getUserRole() === "CASHIER" ? "show active" : ""
              }`}
              id="membership"
            >
              <div className="card pt-0 mb-6 mb-xl-9">
                <div className="card-header border-0">
                  <div className="card-title">
                    <h2>{Tools.translate("MEMBERSHIPS")}</h2>
                  </div>
                  <div
                    className="card-toolbar"
                    data-bs-toggle="tooltip"
                    data-bs-placement="bottom"
                    data-bs-trigger="hover"
                    title={Tools.translate("CLICK_TO_SUBSCRIBE_MEMBERSHIP")}
                  >
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        const modalEl = document.getElementById(
                          "kt_modal_add_membership"
                        );

                        const oldInstance = bootstrap.Modal.getInstance(
                          modalEl
                        );
                        if (oldInstance) oldInstance.hide();

                        document
                          .querySelectorAll(".modal-backdrop")
                          .forEach((el) => el.remove());

                        document.body.classList.remove("modal-open");
                        document.body.style.removeProperty("padding-right");
                        document.body.style.removeProperty("overflow");
                        document.documentElement.style.removeProperty(
                          "overflow"
                        );

                        document.activeElement?.blur();

                        const newInstance = new bootstrap.Modal(modalEl);
                        newInstance.show();
                      }}
                      // onClick={resetFormValues}
                    >
                      <i className="ki-duotone ki-plus fs-2"></i>{" "}
                      {Tools.translate("SUBSCRIBE_MEMBERSHIP")}
                    </button>
                  </div>
                </div>
                <div className="card-body py-3">
                  <div className="table-responsive">
                    <table
                      id="membership-table"
                      className="table table-row-bordered table-row-dashed gy-4 align-middle fw-bold"
                    >
                      <thead>
                        <tr className="fw-semibold fs-6 text-gray-700 bg-light text-uppercase">
                          <th className="min-w-100px">
                            {Tools.translate("PACKAGE_NAME")}
                          </th>
                          <th className="min-w-100px">
                            {Tools.translate("START_DATE")}
                          </th>
                          <th className="min-w-100px">
                            {Tools.translate("END_DATE")}
                          </th>
                          <th className="min-w-150px">
                            {Tools.translate("PROGRESS")}
                          </th>
                          <th>{Tools.translate("PRICE")}</th>
                          <th>{Tools.translate("CLIENT")}</th>
                          <th>{Tools.translate("STATUS")}</th>
                          <th className="text-center">
                            {Tools.translate("ACTIONS")}
                          </th>
                        </tr>
                      </thead>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="tab-pane fade me-10" id="course">
              <div className="card card-flush mb-6 mb-xl-9">
                <div className="card-header border-0">
                  <div className="card-title">
                    <h3>{Tools.translate("COURSES")}</h3>
                  </div>
                  <div
                    className="card-toolbar"
                    data-bs-toggle="tooltip"
                    data-bs-placement="bottom"
                    data-bs-trigger="hover"
                    title={Tools.translate("CLICK_TO_SUBSCRIBE_COURSE")}
                  >
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        const modalEl = document.getElementById(
                          "kt_modal_add_course"
                        );

                        const oldInstance = bootstrap.Modal.getInstance(
                          modalEl
                        );
                        if (oldInstance) oldInstance.hide();

                        document
                          .querySelectorAll(".modal-backdrop")
                          .forEach((el) => el.remove());

                        document.body.classList.remove("modal-open");
                        document.body.style.removeProperty("padding-right");
                        document.body.style.removeProperty("overflow");
                        document.documentElement.style.removeProperty(
                          "overflow"
                        );

                        document.activeElement?.blur();

                        const newInstance = new bootstrap.Modal(modalEl);
                        newInstance.show();
                      }}
                    >
                      <i className="ki-duotone ki-plus fs-2"></i>{" "}
                      {Tools.translate("SUBSCRIBE_COURSE")}
                    </button>
                  </div>
                </div>
                <div className="separator"></div>
                <div className="card-body py-3">
                  <div className="table-responsive">
                    <table
                      id="courses-table"
                      className="table table-row-bordered table-row-dashed gy-4 align-middle fw-bold"
                    >
                      <thead>
                        <tr className="fw-semibold fs-6 text-gray-700 bg-light text-uppercase">
                          <th className="min-w-100px">
                            {Tools.translate("PACKAGE_NAME")}
                          </th>
                          <th className="min-w-100px">
                            {Tools.translate("START_DATE")}
                          </th>
                          <th className="min-w-100px">
                            {Tools.translate("END_DATE")}
                          </th>
                          <th>{Tools.translate("PRICE")}</th>
                          <th>{Tools.translate("CLIENT")}</th>
                          <th>{Tools.translate("STATUS")}</th>
                          <th className="text-center">
                            {Tools.translate("ACTIONS")}
                          </th>
                        </tr>
                      </thead>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="tab-pane fade me-10" id="class">
              <div className="card card-flush mb-6 mb-xl-9">
                <div className="card-header border-0">
                  <div className="card-title">
                    <h3>{Tools.translate("CLASSES")}</h3>
                  </div>
                  <div
                    className="card-toolbar"
                    data-bs-toggle="tooltip"
                    data-bs-placement="bottom"
                    data-bs-trigger="hover"
                    title={Tools.translate("CLICK_TO_SUBSCRIBE_CLASS")}
                  >
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        const modalEl = document.getElementById(
                          "kt_modal_add_class"
                        );

                        const oldInstance = bootstrap.Modal.getInstance(
                          modalEl
                        );
                        if (oldInstance) oldInstance.hide();

                        document
                          .querySelectorAll(".modal-backdrop")
                          .forEach((el) => el.remove());

                        document.body.classList.remove("modal-open");
                        document.body.style.removeProperty("padding-right");
                        document.body.style.removeProperty("overflow");
                        document.documentElement.style.removeProperty(
                          "overflow"
                        );

                        document.activeElement?.blur();

                        const newInstance = new bootstrap.Modal(modalEl);
                        newInstance.show();
                      }}
                    >
                      <i className="ki-duotone ki-plus fs-2"></i>{" "}
                      {Tools.translate("SUBSCRIBE_CLASS")}
                    </button>
                  </div>
                </div>
                <div className="separator"></div>
                <div className="card-body py-3">
                  <div className="table-responsive">
                    <table
                      id="classes-table"
                      className="table table-row-bordered table-row-dashed gy-4 align-middle fw-bold"
                    >
                      <thead>
                        <tr className="fw-semibold fs-6 text-gray-700 bg-light text-uppercase">
                          <th className="min-w-100px">
                            {Tools.translate("PACKAGE_NAME")}
                          </th>
                          <th className="min-w-100px">
                            {Tools.translate("START_DATE")}
                          </th>
                          <th className="min-w-100px">
                            {Tools.translate("END_DATE")}
                          </th>
                          <th>{Tools.translate("PRICE")}</th>
                          <th>{Tools.translate("CLIENT")}</th>
                          <th>{Tools.translate("STATUS")}</th>
                          <th className="text-center">
                            {Tools.translate("ACTIONS")}
                          </th>
                        </tr>
                      </thead>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="tab-pane fade me-10" id="family">
              <div className="card card-flush mb-6 mb-xl-9">
                <div className="card-header border-0">
                  <h3 className="card-title">
                    {Tools.translate("FAMILY_MEMBERS")}
                  </h3>
                  {Auth.getUserRole() !== "CASHIER" && (
                    <div
                      className="card-toolbar"
                      data-bs-toggle="tooltip"
                      data-bs-placement="bottom"
                      data-bs-trigger="hover"
                      title={Tools.translate("CLICK_TO_ADD_FAMILY_MEMBER")}
                    >
                      <button
                        className="btn btn-primary"
                        data-bs-toggle="modal"
                        data-bs-target="#family_modal"
                        onClick={resetFamilyFormValues}
                      >
                        <i className="ki-duotone ki-plus fs-2"></i>{" "}
                        {Tools.translate("ADD_FAMILY_MEMBERS")}
                      </button>
                    </div>
                  )}
                </div>
                <div className="separator"></div>
                <div className="card-body py-3">
                  <div className="table-responsive">
                    <table
                      id="family-table"
                      className="table table-row-bordered table-row-dashed gy-4 align-middle fw-bold"
                    >
                      <thead>
                        <tr className="fw-semibold fs-6 text-gray-700 bg-light text-uppercase">
                          <th>{Tools.translate("FIRST_NAME")}</th>
                          <th>{Tools.translate("HEIGHT_AND_WEIGHT")}</th>
                          <th>{Tools.translate("DATE_OF_BIRTH")}</th>
                          <th>{Tools.translate("GENDER")}</th>
                          <th>{Tools.translate("DATE_JOINED")}</th>
                          {Auth.getUserRole() !== "CASHIER" && (
                            <th className="text-center">
                              {Tools.translate("ACTIONS")}
                            </th>
                          )}
                        </tr>
                      </thead>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`tab-pane fade me-10 ${
                activeTab === "accounting" ? "show active" : ""
              }`}
              id="accounting"
            >
              <div className="card card-flush mb-6 mb-xl-9">
                <ul className="nav nav-stretch nav-line-tabs nav-line-tabs-2x border-transparent fs-6 fw-bold ms-4 mt-2">
                  <li className="nav-item">
                    <a
                      className="nav-link text-active-primary ms-0 me-10 py-5 active"
                      data-bs-toggle="tab"
                      href="#kt_user_view_transactions_data"
                    >
                      {Tools.translate("TRANSACTIONS")}
                    </a>
                  </li>
                  <li className="nav-item">
                    <a
                      className="nav-link text-active-primary ms-0 me-10 py-5"
                      data-bs-toggle="tab"
                      href="#kt_user_view_discount_data"
                    >
                      {Tools.translate("ACTIVE_DISCOUNTS")}
                    </a>
                  </li>
                  <li className="nav-item">
                    <a
                      className="nav-link text-active-primary ms-0 me-10 py-5"
                      data-bs-toggle="tab"
                      href="#kt_user_view_credits_data"
                    >
                      {Tools.translate("CREDIT_NOTES")}
                    </a>
                  </li>
                </ul>

                <div className="tab-content" id="myTabContent">
                  <div
                    className="tab-pane fade show active"
                    id="kt_user_view_transactions_data"
                    role="tabpanel"
                  >
                    <div className="d-flex flex-column gap-5 gap-lg-2 mt-5">
                      <div className="card-header border-0">
                        <div className="card-title d-flex flex-wrap align-items-center gap-4">
                          {/* Search Input */}
                          <div className="position-relative w-200px">
                            <i className="ki-duotone ki-magnifier fs-3 position-absolute top-50 start-0 translate-middle-y ms-4">
                              <span className="path1"></span>
                              <span className="path2"></span>
                            </i>
                            <input
                              type="text"
                              id="name_filter"
                              data-kt-ecommerce-order-filter="search"
                              className="form-control form-control-solid w-100 ps-12"
                              placeholder={Tools.translate("SEARCH")}
                              onChange={(e) => {
                                if (
                                  e.target.value.length >= 3 ||
                                  e.target.value === ""
                                )
                                  setTransactionNameFilter(e.target.value);
                              }}
                            />
                          </div>

                          {/* Date Range Picker */}
                          <div className="d-flex w-250px">
                            <div className="input-group input-group-sm flex-nowrap">
                              <input
                                className="form-control form-control-solid rounded-end-0"
                                placeholder="Pick date range"
                                id="main-daterange"
                              />
                              <button
                                className="btn btn-icon btn-sm btn-light rounded-start-0"
                                id="kt_ecommerce_sales_flatpickr_clear"
                                onClick={openDateRangePicker}
                              >
                                <i className="ki-duotone ki-calendar fs-2">
                                  <span className="path1"></span>
                                  <span className="path2"></span>
                                </i>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="separator"></div>
                      <div className="card-body py-3">
                        <div className="table-responsive">
                          <table
                            id="transactions-table"
                            className="table table-row-bordered table-row-dashed gy-4 align-middle fw-bold"
                          >
                            <thead>
                              <tr className="fw-semibold fs-6 text-gray-700 bg-light text-uppercase">
                                <th className="min-w-150px">
                                  {Tools.translate("CONTENT")}
                                </th>
                                <th className="min-w-150px">
                                  {Tools.translate("PACKAGE")}
                                </th>
                                <th className="min-w-50px">
                                  {Tools.translate("PRICE")}
                                </th>
                                <th className="min-w-50px">
                                  {Tools.translate("REMAINING")}
                                </th>
                                <th>{Tools.translate("DISCOUNT")}</th>
                                <th>{Tools.translate("STATUS")}</th>
                                <th>{Tools.translate("CREATED_AT")}</th>
                                <th className="text-center">
                                  {Tools.translate("ACTIONS")}
                                </th>
                              </tr>
                            </thead>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Discounts Tab */}
                  <div
                    className="tab-pane fade"
                    id="kt_user_view_discount_data"
                    role="tabpanel"
                  >
                    <div className="d-flex flex-column gap-5 gap-lg-7 mt-5">
                      <div className="card-body py-3 ms-1 my-10">
                        <div className="row g-6">
                          {activeDiscounts && activeDiscounts.length > 0 ? (
                            activeDiscounts.map((discount) => {
                              let targetIcon, targetTitle;
                              switch (discount.target) {
                                case "STAFF_DISCOUNT":
                                  targetIcon = "ki-user-edit";
                                  targetTitle = "Staff";
                                  break;
                                case "OVERALL":
                                  targetIcon = "ki-technology-2";
                                  targetTitle = "Overall";
                                  break;
                                case "SIBLING":
                                  targetIcon = "ki-faceid";
                                  targetTitle = "Sibling";
                                  break;
                                case "PROMO_CODE":
                                  targetIcon = "ki-tag";
                                  targetTitle = "Promo Code";
                                  break;
                                case "SPECIFIC_PACKAGE":
                                  targetIcon = "ki-package";
                                  targetTitle = "Package";
                                  break;
                                default:
                                  targetIcon = "ki-compass";
                                  targetTitle = "Discount";
                              }

                              return (
                                <div
                                  key={discount.public_id}
                                  className="col-xl-3 col-md-6"
                                >
                                  <div className="card h-lg-100 mw-200px bg-light-secondary">
                                    <div className="card-body d-flex justify-content-between align-items-start flex-column">
                                      <div className="d-flex justify-content-between w-100 mb-3">
                                        <div className="d-flex align-items-center">
                                          <i
                                            className={`ki-duotone ${targetIcon} fs-2hx text-primary me-3`}
                                          >
                                            <span className="path1"></span>
                                            <span className="path2"></span>
                                          </i>
                                          <span className="fw-bold fs-5 text-gray-800">
                                            {targetTitle}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="d-flex flex-column my-7">
                                        <span className="fw-semibold fs-3x text-gray-600 lh-1 ls-n2">
                                          {discount.amount}%
                                        </span>
                                        <div className="m-0">
                                          <span className="fw-semibold fs-6 text-gray-500">
                                            {discount.name}
                                          </span>
                                        </div>
                                      </div>
                                      <span
                                        className={`badge badge-light-${
                                          discount.status === "ACTIVE"
                                            ? "success"
                                            : "primary"
                                        } fs-base`}
                                      >
                                        {discount.status}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="col-12 text-center py-10">
                              <div className="d-flex flex-column align-items-center">
                                <i className="ki-duotone ki-element-11 fs-2hx text-gray-400 mb-4">
                                  <span className="path1"></span>
                                  <span className="path2"></span>
                                </i>
                                <h3 className="text-gray-600">
                                  {Tools.translate("NO_ACTIVE_DISCOUNTS")}
                                </h3>
                                <p className="text-muted">
                                  {Tools.translate(
                                    "CURRENTLY_NO_ACTIVE_DISCOUNTS"
                                  )}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Credits Tab */}
                  <div
                    className="tab-pane fade"
                    id="kt_user_view_credits_data"
                    role="tabpanel"
                  >
                    <div className="d-flex justify-content-between align-items-center flex-wrap px-5 py-3">
                      {/* Credit Note Box */}
                      <div className="border border-dashed border-gray-300 w-125px rounded my-3 p-4 me-6">
                        <span className="fs-2x fw-bold text-gray-800 lh-1">
                          {originalValues.number_of_credits || 0}
                        </span>
                        <span className="fs-6 fw-semibold text-gray-500 d-block lh-1 pt-2">
                          {Tools.translate("CREDIT_NOTES")}
                        </span>
                      </div>

                      {/* Edit Button */}
                      <button
                        className="btn btn-sm btn-light-primary mt-2"
                        onClick={handleUpdateCredit}
                      >
                        <i className="ki-duotone ki-pencil fs-4 me-1">
                          <span className="path1"></span>
                          <span className="path2"></span>
                        </i>
                        {Tools.translate("ADD_CREDIT")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* payment modal */}
            {showPaymentModal && (
              <>
                <div
                  className="modal fade show"
                  id="kt_modal_payment"
                  tabIndex="-1"
                  style={{ display: "block" }}
                  aria-modal="true"
                  role="dialog"
                  onClick={(e) => {
                    // Close only if clicking directly on the modal backdrop (not content)
                    if (e.target === e.currentTarget) {
                      setShowPaymentModal(false);
                    }
                  }}
                >
                  <div className="modal-dialog modal-dialog-centered mw-650px">
                    <div
                      className="modal-content"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="modal-header">
                        <h2 className="fw-bold">
                          {Tools.translate("RECORD_PAYMENT")}
                        </h2>
                        <div
                          className="btn btn-icon btn-sm btn-active-icon-primary"
                          onClick={() => setShowPaymentModal(false)}
                        >
                          <i className="ki-duotone ki-cross fs-1">
                            <span className="path1"></span>
                            <span className="path2"></span>
                          </i>
                        </div>
                      </div>

                      <div className="modal-body py-10 px-lg-17">
                        {transactionFormik.status && (
                          <div className="alert alert-dismissible bg-light-danger d-flex flex-column flex-sm-row w-100 p-5 mb-10">
                            <i className="ki-duotone ki-message-text-2 fs-2hx text-danger me-4 mb-5 mb-sm-0">
                              <span className="path1"></span>
                              <span className="path2"></span>
                              <span className="path3"></span>
                            </i>
                            <div className="d-flex align-self-center text-danger">
                              <span>{transactionFormik.status}</span>
                            </div>
                          </div>
                        )}
                        <div className="row mb-5">
                          <div className="col-md-6">
                            <label className="form-label fw-bold">
                              {Tools.translate("PACKAGE")}
                            </label>
                            <div className="form-control-plaintext fs-6 fw-bold text-gray-600">
                              {transactionOriginalValues?.package_name}
                            </div>
                          </div>
                          <div className="col-md-6">
                            <label className="form-label fw-bold">
                              {Tools.translate("TYPE")}
                            </label>
                            <div className="form-control-plaintext fs-6 fw-bold text-gray-600">
                              {transactionOriginalValues?.package_type}
                            </div>
                          </div>
                        </div>

                        <div className="row mb-5">
                          <div className="col-md-4">
                            <label className="form-label fw-bold">
                              {Tools.translate("TOTAL_AMOUNT")}
                            </label>
                            <div className="form-control-plaintext fs-6 fw-bold text-gray-600">
                              {transactionOriginalValues?.amount} SAR
                            </div>
                          </div>
                          <div className="col-md-4">
                            <label className="form-label fw-bold">
                              {Tools.translate("REMAINING_AMOUNT")}
                            </label>
                            <div className="form-control-plaintext fs-6 fw-bold text-gray-600">
                              {transactionOriginalValues?.rest} SAR
                            </div>
                          </div>
                          <div className="col-md-4">
                            <label className="form-label fw-bold">
                              {Tools.translate("AMOUNT_ON_CREDIT")}
                            </label>
                            <div className="form-control-plaintext fs-6 fw-bold text-gray-600">
                              {transactionOriginalValues?.credit_notes}{" "}
                              {Tools.translate("CERDIT")}{" "}
                            </div>
                          </div>
                        </div>

                        <div className="row mb-5">
                          <div className="col-md-12">
                            <label className="col-lg-12 col-form-label fw-bold fs-6 required">
                              {Tools.translate("PAYMENT_METHOD")}
                            </label>
                            <select
                              className={clsx(
                                "form-select",
                                {
                                  "is-invalid":
                                    transactionFormik.touched.payment_method &&
                                    transactionFormik.errors.payment_method,
                                },
                                {
                                  "is-valid":
                                    transactionFormik.touched.payment_method &&
                                    !transactionFormik.errors.payment_method,
                                }
                              )}
                              name="payment_method"
                              placeholder="Select Payment Method"
                              value={transactionFormik.values.payment_method}
                              onChange={transactionFormik.handleChange}
                              onBlur={transactionFormik.handleBlur}
                            >
                              <option value="">
                                {Tools.translate("SELECT_PAYMENT_METHOD")}
                              </option>
                              <option value="cash">Cash</option>
                              <option value="credit">Credit</option>
                            </select>
                            {transactionFormik.touched.payment_method &&
                              transactionFormik.errors.payment_method && (
                                <div className="fv-plugins-message-container">
                                  <div className="fv-help-block">
                                    {transactionFormik.errors.payment_method}
                                  </div>
                                </div>
                              )}
                          </div>
                        </div>

                        <div className="row mb-5">
                          <div className="col-md-6">
                            <label className="form-label fw-bold required">
                              {Tools.translate("PAYMENT_DATE")}
                            </label>
                            <input
                              ref={flatpickrInputRef}
                              id="payment-date"
                              name="date"
                              className="form-control"
                              placeholder="Select date"
                              value={transactionFormik.values.date}
                              onChange={transactionFormik.handleChange}
                              onBlur={transactionFormik.handleBlur}
                            />
                            {transactionFormik.touched.date &&
                              transactionFormik.errors.date && (
                                <div className="text-danger mt-1">
                                  {transactionFormik.errors.date}
                                </div>
                              )}
                          </div>
                          {transactionFormik.values.payment_method ===
                            "cash" && (
                            <>
                              <div className="col-md-6">
                                <label className="form-label required">
                                  {Tools.translate("AMOUNT_TO_PAY")}
                                </label>

                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    flexDirection: "row-reverse",
                                    padding: "0 5px",
                                    backgroundClip: "padding-box",
                                    border: `1px solid ${
                                      transactionFormik.touched.amount_to_pay &&
                                      transactionFormik.errors.amount_to_pay
                                        ? "var(--bs-form-invalid-border-color)"
                                        : "var(--bs-gray-300)"
                                    }`,
                                    borderRadius: "0.475rem",
                                  }}
                                >
                                  {/* SAR container */}
                                  <div
                                    style={{
                                      padding: "0 10px",
                                      fontWeight: "600",
                                      color: "grey",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {Tools.translate("SAR")}
                                  </div>
                                  {/* Input */}
                                  <input
                                    style={{
                                      border: "none",
                                      flex: 1,
                                      textAlign:
                                        direction === "rtl" ? "right" : "left",
                                    }}
                                    placeholder={Tools.translate(
                                      "AMOUNT_TO_PAY"
                                    )}
                                    type="number"
                                    autoComplete="off"
                                    {...transactionFormik.getFieldProps(
                                      "amount_to_pay"
                                    )}
                                    className={clsx(
                                      "form-control bg-transparent",
                                      {
                                        "is-invalid":
                                          transactionFormik.touched
                                            .amount_to_pay &&
                                          transactionFormik.errors
                                            .amount_to_pay,
                                      },
                                      {
                                        "is-valid":
                                          transactionFormik.touched
                                            .amount_to_pay &&
                                          !transactionFormik.errors
                                            .amount_to_pay,
                                      }
                                    )}
                                    onKeyDown={(e) => {
                                      if (
                                        ["e", "E", "+", "-", "."].includes(
                                          e.key
                                        )
                                      ) {
                                        e.preventDefault();
                                      }
                                    }}
                                  />
                                </div>
                                {transactionFormik.touched.amount_to_pay &&
                                  transactionFormik.errors.amount_to_pay && (
                                    <div className="fv-plugins-message-container">
                                      <div className="fv-help-block">
                                        <span role="alert">
                                          {
                                            transactionFormik.errors
                                              .amount_to_pay
                                          }
                                        </span>
                                      </div>
                                    </div>
                                  )}
                              </div>
                            </>
                          )}
                        </div>
                        {transactionFormik.values.payment_method === "cash" && (
                          <div className="row flex-row">
                            <div className="col-md-12">
                              {parseFloat(
                                transactionFormik.values.amount_to_pay
                              ) >
                                parseFloat(
                                  transactionFormik.values.status === "UNPAID"
                                    ? transactionFormik.values.amount
                                    : transactionFormik.values.rest
                                ) && (
                                <div class="alert alert-warning d-flex align-items-center p-5">
                                  <i class="ki-duotone ki-shield fs-2hx text-warning me-4">
                                    <span class="path1"></span>
                                    <span class="path2"></span>
                                  </i>

                                  <div class="d-flex flex-column">
                                    <span>
                                      {Tools.translate(
                                        "THE_REMAINING_AMOUNT_WILL_BE_TRANSFERED"
                                      )}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="modal-footer flex-end">
                        <button
                          type="button"
                          className="btn btn-light me-3"
                          onClick={() => setShowPaymentModal(false)}
                        >
                          {Tools.translate("CANCEL")}
                        </button>
                        <button
                          type="submit"
                          className="btn btn-primary"
                          onClick={transactionFormik.handleSubmit}
                          disabled={
                            transactionFormik.isSubmitting ||
                            !transactionFormik.dirty
                          }
                        >
                          <span className="indicator-label">
                            {transactionFormik.isSubmitting
                              ? Tools.translate("PLEASE_WAIT")
                              : Tools.translate("SUBMIT")}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className="modal-backdrop fade show"
                  onClick={() => setShowPaymentModal(false)}
                ></div>
              </>
            )}

            {/*Activity*/}
            <div className="tab-pane fade me-10" id="activity">
              <div className="card">
                <div className="card-header card-header-stretch">
                  <div className="card-title d-flex align-items-center">
                    <i className="ki-duotone ki-calendar-8 fs-1 text-primary me-3 lh-0">
                      <span className="path1"></span>
                      <span className="path2"></span>
                      <span className="path3"></span>
                      <span className="path4"></span>
                      <span className="path5"></span>
                      <span className="path6"></span>
                    </i>
                    <h3 className="fw-bold m-0 text-gray-800">
                      {getTitleDateRange()}
                    </h3>
                  </div>

                  <div className="card-toolbar m-0">
                    <ul
                      className="nav nav-tabs nav-line-tabs nav-stretch fs-6 border-0 fw-bold"
                      role="tablist"
                    >
                      <li className="nav-item" role="presentation">
                        <a
                          id="kt_activity_today_tab"
                          className="nav-link justify-content-center text-active-gray-800 active"
                          data-bs-toggle="tab"
                          role="tab"
                          href="#kt_activity_year"
                          aria-selected="true"
                          onClick={() => handleTimeRangeChange("today")}
                        >
                          {Tools.translate("TODAY")}
                        </a>
                      </li>
                      <li className="nav-item" role="presentation">
                        <a
                          id="kt_activity_week_tab"
                          className="nav-link justify-content-center text-active-gray-800"
                          data-bs-toggle="tab"
                          role="tab"
                          href="#kt_activity_year"
                          aria-selected="false"
                          tabIndex="-1"
                          onClick={() => handleTimeRangeChange("week")}
                        >
                          {Tools.translate("WEEK")}
                        </a>
                      </li>
                      <li className="nav-item" role="presentation">
                        <a
                          id="kt_activity_month_tab"
                          className="nav-link justify-content-center text-active-gray-800"
                          data-bs-toggle="tab"
                          role="tab"
                          href="#kt_activity_year"
                          aria-selected="false"
                          tabIndex="-1"
                          onClick={() => handleTimeRangeChange("month")}
                        >
                          {Tools.translate("MONTH")}
                        </a>
                      </li>
                      <li className="nav-item" role="presentation">
                        <a
                          id="kt_activity_year_tab"
                          className="nav-link justify-content-center text-active-gray-800 text-hover-gray-800"
                          data-bs-toggle="tab"
                          role="tab"
                          href="#kt_activity_year"
                          aria-selected="false"
                          tabIndex="-1"
                          onClick={() => handleTimeRangeChange(null)}
                        >
                          {Tools.translate("ALL_TIME")}
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="card-body position-relative">
                  {activityLoading && (
                    <div className="position-absolute top-50 start-50 translate-middle z-index-1">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">
                          {Tools.translate("LOADING")}
                        </span>
                      </div>
                    </div>
                  )}

                  <div
                    id="kt_activity_year"
                    className={`card-body p-0 tab-pane fade ${
                      timeRange === "today" ? "show active" : ""
                    }`}
                    role="tabpanel"
                    aria-labelledby="kt_activity_year_tab"
                  >
                    <div className="timeline timeline-border-dashed">
                      {!activityLoading && activities.length === 0 ? (
                        <div className="text-center py-10">
                          <i className="ki-duotone ki-information fs-2x text-muted">
                            <span className="path1"></span>
                            <span className="path2"></span>
                            <span className="path3"></span>
                          </i>
                          <div className="mt-4">
                            <h4 className="text-gray-600">
                              {Tools.translate("NO_ACTIVTIES_FOUND")}
                            </h4>
                            <p className="text-muted">
                              {Tools.translate("THERE_NO_LOGS_TO_SHOW")}
                            </p>
                          </div>
                        </div>
                      ) : (
                        activities.map((log, index) => (
                          <div className="timeline-item" key={index}>
                            <div className="timeline-line"></div>
                            <div className="timeline-icon me-4">
                              {log.category === "ACCOUNT_MANAGER" ? (
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
                                <div className="fs-5 fw-semibold mb-2">
                                  {log.action}
                                </div>
                                <div className="d-flex align-items-center mt-1 fs-6">
                                  <div className="text-muted me-2 fs-7">
                                    {new Date(log.created_at).toLocaleString(
                                      "en-US",
                                      {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: true,
                                      }
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                      <div className="d-flex justify-content-end mt-10">
                        <button
                          disabled={pagination.has_previous === false}
                          onClick={() => setPage((p) => Math.max(p - 1, 1))}
                          className="btn text-gray-500"
                        >
                          {Tools.translate("PREVIOUS")}
                        </button>
                        <span className="align-self-center fw-bold text-gray-700">
                          {Tools.translate("PAGE")} {pagination.current}{" "}
                          {Tools.translate("OF")} {pagination.num_pages}
                        </span>
                        <button
                          disabled={pagination.has_next === false}
                          onClick={() =>
                            setPage((p) =>
                              pagination.num_pages
                                ? Math.min(p + 1, pagination.num_pages)
                                : p + 1
                            )
                          }
                          className="btn text-gray-500"
                        >
                          {Tools.translate("NEXT")}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Password Change Modal */}
      <div
        className="modal fade"
        id="kt_modal_1"
        tabIndex="-1"
        aria-hidden="true"
      >
        {/* <!--begin::Modal dialog--> */}
        <div className="modal-dialog modal-dialog-centered mw-650px">
          {/* <!--begin::Modal content--> */}
          <div className="modal-content">
            {/* <!--begin::Modal header--> */}
            <div className="modal-header">
              {/* <!--begin::Modal title--> */}
              <h2 className="fw-bold">{Tools.translate("CHANGE_PASSWORD")}</h2>
              {/* <!--end::Modal title--> */}
              {/* <!--begin::Close--> */}

              <div
                className="btn btn-icon btn-sm btn-active-icon-primary"
                data-bs-dismiss="modal"
                aria-label="Close"
                id="close-password-modal"
                onClick={() => {
                  resetChangePasswordForm();
                }}
              >
                <i className="ki-duotone ki-cross fs-1">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
              </div>
              {/* <!--end::Close--> */}
            </div>
            {/* <!--end::Modal header--> */}
            {/* <!--begin::Form--> */}
            {formik.status && (
              <div className="alert alert-dismissible bg-light-danger d-flex flex-column flex-sm-row w-100 p-5 mb-10">
                <i className="ki-duotone ki-message-text-2 fs-2hx text-danger me-4 mb-5 mb-sm-0">
                  <span className="path1"></span>
                  <span className="path2"></span>
                  <span className="path3"></span>
                </i>
                <div className="d-flex align-self-center text-danger">
                  <span>{formik.status}</span>
                </div>
              </div>
            )}

            <form
              id="kt_modal_update_password_form"
              className="form"
              onSubmit={formik.handleSubmit}
              noValidate
            >
              {/* <!--begin::Modal body--> */}
              <div className="modal-body scroll-y mx-5 mx-xl-15 my-7">
                {/* <!--begin::Input group--> */}
                <div className="mb-10 fv-row" data-kt-password-meter="true">
                  {/* <!--begin::Wrapper--> */}
                  <div className="mb-1">
                    {/* <!--begin::Label--> */}
                    <label className="form-label fw-semibold fs-6 mb-2">
                      {Tools.translate("NEW_PASSWORD")}
                    </label>
                    {/* <!--end::Label--> */}
                    {/* <!--begin::Input wrapper--> */}
                    <div className="position-relative mb-3">
                      <input
                        className={`form-control form-control-lg form-control-solid ${
                          formik.errors.password && formik.touched.password
                            ? "is-invalid"
                            : ""
                        }`}
                        type={showPassword ? "text" : "password"}
                        placeholder=""
                        name="new_password"
                        {...formik.getFieldProps("password")}
                        onChange={(e) => {
                          formik.handleChange(e);
                          evaluatePasswordStrength(e.target.value);
                        }}
                        autoComplete="off"
                      />

                      {showPasswordToggle && (
                        <span
                          className={`btn btn-sm btn-icon position-absolute translate-middle top-50 ${
                            direction === "rtl" ? "start-0 ms-5" : "end-0 me-5"
                          }`}
                          onClick={() => setShowPassword(!showPassword)}
                          style={{ cursor: "pointer" }}
                        >
                          <i
                            className={
                              showPassword
                                ? "ki-outline ki-eye fs-2"
                                : "ki-outline ki-eye-slash fs-2"
                            }
                          />
                        </span>
                      )}
                    </div>
                    {formik.errors.password && formik.touched.password && (
                      <div className="fv-plugins-message-container">
                        <div className="fv-help-block">
                          <span role="alert">{formik.errors.password}</span>
                        </div>
                      </div>
                    )}
                    <div
                      className={`password-strength ${passwordStrength.toLowerCase()}`}
                    >
                      {Tools.translate("PASSWORD_STRENGTH")}: {passwordStrength}
                    </div>
                    {/* <!--end::Input wrapper--> */}
                    {/* <!--begin::Meter--> */}
                    <div
                      className="d-flex align-items-center mb-3 active"
                      data-kt-password-meter-control="highlight"
                    >
                      <div className="flex-grow-1 bg-secondary bg-active-success rounded h-5px me-2"></div>
                      <div className="flex-grow-1 bg-secondary bg-active-success rounded h-5px me-2"></div>
                      <div className="flex-grow-1 bg-secondary bg-active-success rounded h-5px me-2"></div>
                      <div className="flex-grow-1 bg-secondary bg-active-success rounded h-5px"></div>
                    </div>
                    {/* <!--end::Meter--> */}
                  </div>
                  {/* <!--end::Wrapper--> */}
                  {/* <!--begin::Hint--> */}
                  <div className="text-muted">
                    {Tools.translate("PASSWORD_EXCEPTIONS")}
                  </div>
                  {/* <!--end::Hint--> */}
                </div>
                {/* <!--end::Input group=--> */}
                {/* <!--begin::Input group=--> */}
                <div className="fv-row mb-10">
                  <label className="form-label fw-semibold fs-6 mb-2">
                    {Tools.translate("CONFIRM_NEW_PASSWORD")}
                  </label>
                  <div className="position-relative mb-3">
                    <input
                      type={showPassword2 ? "text" : "password"}
                      className={`form-control form-control-lg form-control-solid ${
                        formik.errors.confirmpassword &&
                        formik.touched.confirmpassword
                          ? "is-invalid"
                          : ""
                      }`}
                      name="confirm_password"
                      {...formik.getFieldProps("confirmpassword")}
                      autoComplete="off"
                    />
                    {showPasswordToggle && (
                      <span
                        className={`btn btn-sm btn-icon position-absolute translate-middle top-50 ${
                          direction === "rtl" ? "start-0 ms-5" : "end-0 me-5"
                        }`}
                        onClick={() => setShowPassword2(!showPassword2)}
                        style={{ cursor: "pointer" }}
                      >
                        <i
                          className={
                            showPassword2
                              ? "ki-outline ki-eye fs-2"
                              : "ki-outline ki-eye-slash fs-2"
                          }
                        />
                      </span>
                    )}
                  </div>
                  {formik.errors.confirmpassword &&
                    formik.touched.confirmpassword && (
                      <div className="invalid-feedback">
                        {formik.errors.confirmpassword}
                      </div>
                    )}
                </div>
                {/* <!--end::Input group=--> */}
              </div>
              {/* <!--end::Modal body--> */}
              {/* <!--begin::Actions--> */}
              <div className="modal-footer pt-15 flex-end">
                <button
                  type="reset"
                  id="close-modal"
                  className="btn btn-light me-3"
                  data-bs-dismiss="modal"
                  onClick={() => {
                    resetChangePasswordForm();
                  }}
                >
                  {Tools.translate("DISCARD")}
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={
                    formik.isSubmitting ||
                    !formik.isValid ||
                    !formik.dirty ||
                    loading ||
                    passwordStrength === "Weak"
                  }
                  aria-label="close"
                >
                  <span className="indicator-label">
                    {Tools.translate("SUBMIT")}
                  </span>
                </button>
              </div>
              {loading && <ListLoader />}
              {/* <!--end::Actions--> */}
            </form>
            {/* <!--end::Form--> */}
          </div>
          {/* <!--end::Modal content--> */}
        </div>
        {/* <!--end::Modal dialog--> */}
      </div>

      {/*subscribe course*/}
      <div
        className="modal fade"
        id="kt_modal_add_course"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered mw-800px">
          <div className="modal-content">
            <div className="modal-header" id="kt_modal_update_user_header">
              <h2 className="fw-bold">{Tools.translate("SUBSCRIBE_COURSE")}</h2>
              <div
                className="btn btn-icon btn-sm btn-active-icon-primary"
                id="close-upsert"
                aria-label="Close"
                data-bs-dismiss="modal"
                onClick={() => {
                  formik.resetForm();
                }}
              >
                <i className="ki-duotone ki-cross fs-1">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
              </div>
            </div>
            <div className="modal-body py-10 px-lg-17">
              {formik.status && (
                <div className="alert alert-dismissible bg-light-danger d-flex flex-column flex-sm-row w-100 p-5 mb-10">
                  <i className="ki-duotone ki-message-text-2 fs-2hx text-danger me-4 mb-5 mb-sm-0">
                    <span className="path1"></span>
                    <span className="path2"></span>
                    <span className="path3"></span>
                  </i>
                  <div className="d-flex align-self-center text-danger">
                    <span>{formik.status}</span>
                  </div>
                </div>
              )}

              <div className="d-flex flex-wrap align-items-center mb-10 gap-4">
                {/* Search Input */}
                <div className="w-200px position-relative">
                  <i className="ki-duotone ki-magnifier fs-3 position-absolute top-50 start-0 translate-middle-y ms-4">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                  <input
                    type="text"
                    id="name_filter"
                    className="form-control form-control-solid ps-12"
                    placeholder={Tools.translate("SEARCH")}
                    autoComplete="off"
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                  />
                </div>

                {/* Facility Filter */}
                <div className="w-150px">
                  <select
                    id="facilityCourseFilterSelect"
                    className="form-select form-select-solid"
                    value={facilityFilter}
                    onChange={(e) => setFacilityFilter(e.target.value)}
                  >
                    <option value="">All Facilities</option>
                    {facilities &&
                      facilities.map((facility) => (
                        <option key={facility.public_id} value={facility.name}>
                          {facility.name}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Trainer Filter */}
                <div className="w-150px">
                  <select
                    id="trainerCourseFilterSelect"
                    className="form-select form-select-solid"
                    value={trainerFilter}
                    onChange={(e) => setTrainerFilter(e.target.value)}
                  >
                    <option value="">All Trainers</option>
                    {trainers &&
                      trainers.map((trainer) => (
                        <option
                          key={trainer.public_id}
                          value={trainer.full_name}
                        >
                          {trainer.full_name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="w-250px">
                  <select
                    id="clientCourseSelect"
                    className="form-select form-select-solid"
                    value={clientClassSelect}
                    onChange={(e) => setClientClassSelect(e.target.value)}
                  >
                    <option value={selectedClient?.public_id}>
                      {selectedClient?.first_name} {selectedClient?.last_name} (
                      {Tools.translate("PRIMARY_ACCOUNT")})
                    </option>
                    {familyMembers.length > 0 ? (
                      familyMembers.map((member) => (
                        <option key={member.public_id} value={member.public_id}>
                          {member.first_name} {member.last_name} (
                          {Tools.translate("FAMILY_ACCOUNT")})
                        </option>
                      ))
                    ) : (
                      <option disabled>
                        {Tools.translate("NO_FAMILY_MEMBERS_AVAILABLE")}
                      </option>
                    )}
                  </select>
                </div>
              </div>

              <div className="row g-6">
                {loadingPackages ? (
                  <div
                    className="course-list-container mt-4 d-flex justify-content-center align-items-center"
                    style={{
                      maxHeight: "350px",
                      border: "1px solid #ddd",
                      borderRadius: "5px",
                      minHeight: "200px",
                    }}
                  >
                    <div className="text-center">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <div className="mt-2">{Tools.translate("LOADING")}</div>
                    </div>
                  </div>
                ) : courses.length > 0 ? (
                  <div
                    ref={courseListRef}
                    className="course-list-container mt-4"
                    style={{
                      maxHeight: "350px",
                      overflowY: "auto",
                      border: "1px solid #ddd",
                      padding: "10px",
                      borderRadius: "5px",
                    }}
                  >
                    {courses.map((course) => (
                      <div
                        key={course.public_id}
                        className={`d-flex align-items-sm-center mb-7 card-container ${
                          selectedCourse?.public_id === course.public_id
                            ? "selected"
                            : ""
                        }`}
                        onClick={() => handleCourseClick(course)}
                        style={{
                          cursor: "pointer",
                          padding: "10px",
                          borderRadius: "5px",
                        }}
                      >
                        <div className="symbol symbol-60px symbol-2by3 me-4">
                          <div
                            className="symbol-label"
                            style={{
                              backgroundImage: `url(${
                                course.image ||
                                "/path/to/default-course-image.jpg"
                              })`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              height: "80px",
                              width: "100px",
                            }}
                          >
                            {!course.image && (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="50"
                                height="50"
                                fill="gray"
                                className="bi bi-book"
                                viewBox="0 0 16 16"
                              >
                                <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811V2.828zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492V2.687zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783z" />
                              </svg>
                            )}
                          </div>
                        </div>
                        <div className="d-flex flex-row-fluid align-items-center flex-wrap my-lg-0 me-2">
                          <div className="flex-grow-1 my-lg-0 my-2 me-2">
                            <a
                              href="#"
                              className="text-gray-800 fw-bold text-hover-primary fs-6"
                            >
                              {course.name}
                              <span className="text-muted fw-semibold ms-2">
                                ({course.level})
                              </span>
                            </a>
                            <span className="text-muted fw-semibold d-block pt-1">
                              {course.description}
                            </span>
                            <span className="text-muted fw-semibold d-block pt-1">
                              Trainer:{" "}
                              {course.trainer?.full_name || "Not specified"}
                            </span>
                            <span className="text-muted fw-semibold d-block pt-1">
                              {course.is_online ? "Online" : "Onsite"} |
                              Capacity: {course.capacity}
                            </span>
                            <span className="text-muted fw-semibold d-block pt-1">
                              Facilities:{" "}
                              {course.facilities?.join(", ") || "Not specified"}
                            </span>
                          </div>
                          <div className="d-flex align-items-center">
                            <div className="me-6">
                              <i className="fas fa-tag me-1 text-primary fs-5"></i>
                              <span className="text-gray-800 fw-bold">
                                {course.price} SAR
                              </span>
                            </div>
                            <div className="me-6">
                              <i className="far fa-calendar-alt me-1 text-success fs-5"></i>
                              <span className="text-gray-800 fw-bold">
                                {course.start_date} to {course.end_date}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    className="course-list-container mt-4 d-flex justify-content-center align-items-center"
                    style={{
                      maxHeight: "350px",
                      border: "1px solid #ddd",
                      borderRadius: "5px",
                      minHeight: "200px",
                    }}
                  >
                    <div className="text-center">
                      <i className="ki-duotone ki-search-list fs-2x text-muted mb-2">
                        <span className="path1"></span>
                        <span className="path2"></span>
                      </i>
                      <div className="text-muted fs-5">
                        No courses available
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer flex-end">
              <button
                type="button"
                className="btn btn-light me-3"
                data-bs-dismiss="modal"
                onClick={() => {
                  formik.resetForm();
                }}
              >
                {Tools.translate("CLOSE")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/*classes*/}
      <div
        className="modal fade"
        id="kt_modal_add_class"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered mw-800px">
          <div className="modal-content">
            <div className="modal-header" id="kt_modal_update_user_header">
              <h2 className="fw-bold">{Tools.translate("SUBSCRIBE_CLASS")}</h2>
              <div
                className="btn btn-icon btn-sm btn-active-icon-primary"
                id="close-upsert"
                aria-label="Close"
                data-bs-dismiss="modal"
                onClick={() => {
                  formik.resetForm();
                }}
              >
                <i className="ki-duotone ki-cross fs-1">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
              </div>
            </div>
            <div className="modal-body py-10 px-lg-17">
              {formik.status && (
                <div className="alert alert-dismissible bg-light-danger d-flex flex-column flex-sm-row w-100 p-5 mb-10">
                  <i className="ki-duotone ki-message-text-2 fs-2hx text-danger me-4 mb-5 mb-sm-0">
                    <span className="path1"></span>
                    <span className="path2"></span>
                    <span className="path3"></span>
                  </i>
                  <div className="d-flex align-self-center text-danger">
                    <span>{formik.status}</span>
                  </div>
                </div>
              )}

              <div className="d-flex flex-wrap align-items-center mb-10 gap-4">
                {/* Search Input */}
                <div className="w-200px position-relative">
                  <i className="ki-duotone ki-magnifier fs-3 position-absolute top-50 start-0 translate-middle-y ms-4">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                  <input
                    type="text"
                    id="name_filter"
                    className="form-control form-control-solid ps-12"
                    placeholder={Tools.translate("SEARCH")}
                    autoComplete="off"
                    value={nameClassFilter}
                    onChange={(e) => {
                      setNameClassFilter(e.target.value);
                    }}
                  />
                </div>

                {/* Facility Filter */}
                <div className="w-150px">
                  <select
                    id="facilityClassFilterSelect"
                    className="form-select form-select-solid"
                    value={facilityClassFilter}
                    onChange={(e) => setFacilityClassFilter(e.target.value)}
                  >
                    <option value="">All Facilities</option>
                    {facilities &&
                      facilities.map((facility) => (
                        <option key={facility.public_id} value={facility.name}>
                          {facility.name}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Trainer Filter */}
                <div className="w-150px">
                  <select
                    id="trainerClassFilterSelect"
                    className="form-select form-select-solid"
                    value={trainerClassFilter}
                    onChange={(e) => setTrainerClassFilter(e.target.value)}
                  >
                    <option value="">All Trainers</option>
                    {trainers &&
                      trainers.map((trainer) => (
                        <option
                          key={trainer.public_id}
                          value={trainer.full_name}
                        >
                          {trainer.full_name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="w-250px">
                  <select
                    id="clientClassSelect"
                    className="form-select form-select-solid"
                    value={clientClassSelect}
                    onChange={(e) => setClientClassSelect(e.target.value)}
                  >
                    <option value={selectedClient?.public_id}>
                      {selectedClient?.first_name} {selectedClient?.last_name} (
                      {Tools.translate("PRIMARY_ACCOUNT")})
                    </option>
                    {familyMembers.length > 0 ? (
                      familyMembers.map((member) => (
                        <option key={member.public_id} value={member.public_id}>
                          {member.first_name} {member.last_name} (
                          {Tools.translate("FAMILY_ACCOUNT")})
                        </option>
                      ))
                    ) : (
                      <option disabled>
                        {Tools.translate("NO_FAMILY_MEMBERS_AVAILABLE")}
                      </option>
                    )}
                  </select>
                </div>
              </div>

              <div className="row g-6">
                {loadingPackages ? (
                  <div
                    className="course-list-container mt-4 d-flex justify-content-center align-items-center"
                    style={{
                      maxHeight: "350px",
                      border: "1px solid #ddd",
                      borderRadius: "5px",
                      minHeight: "200px",
                    }}
                  >
                    <div className="text-center">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <div className="mt-2">{Tools.translate("LOADING")}</div>
                    </div>
                  </div>
                ) : classes.length > 0 ? (
                  <div
                    ref={courseListRef}
                    className="course-list-container mt-4"
                    style={{
                      maxHeight: "350px",
                      overflowY: "auto",
                      border: "1px solid #ddd",
                      padding: "10px",
                      borderRadius: "5px",
                    }}
                  >
                    {classes.map((course) => (
                      <div
                        key={course.public_id}
                        className={`d-flex align-items-sm-center mb-7 card-container ${
                          selectedCourse?.public_id === course.public_id
                            ? "selected"
                            : ""
                        }`}
                        onClick={() => handleClassClick(course)}
                        style={{
                          cursor: "pointer",
                          padding: "10px",
                          borderRadius: "5px",
                        }}
                      >
                        <div className="symbol symbol-60px symbol-2by3 me-4">
                          <div
                            className="symbol-label"
                            style={{
                              backgroundImage: `url(${
                                course.image ||
                                "/path/to/default-course-image.jpg"
                              })`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              height: "80px",
                              width: "100px",
                            }}
                          >
                            {!course.image && (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="50"
                                height="50"
                                fill="gray"
                                className="bi bi-book"
                                viewBox="0 0 16 16"
                              >
                                <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811V2.828zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492V2.687zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783z" />
                              </svg>
                            )}
                          </div>
                        </div>
                        <div className="d-flex flex-row-fluid align-items-center flex-wrap my-lg-0 me-2">
                          <div className="flex-grow-1 my-lg-0 my-2 me-2">
                            <a
                              href="#"
                              className="text-gray-800 fw-bold text-hover-primary fs-6"
                            >
                              {course.name}
                            </a>
                            <span className="text-muted fw-semibold d-block pt-1">
                              {course.description}
                            </span>
                            <span className="text-muted fw-semibold d-block pt-1">
                              Trainer:{" "}
                              {course.trainer?.full_name || "Not specified"}
                            </span>
                            <span className="text-muted fw-semibold d-block pt-1">
                              {course.is_online ? "Online" : "Onsite"} |
                              Capacity: {course.capacity}
                            </span>
                            <span className="text-muted fw-semibold d-block pt-1">
                              Facilities:{" "}
                              {course.facilities?.join(", ") || "Not specified"}
                            </span>
                          </div>
                          <div className="d-flex align-items-center">
                            <div className="me-6">
                              <i className="fas fa-tag me-1 text-primary fs-5"></i>
                              <span className="text-gray-800 fw-bold">
                                {course.price} SAR
                              </span>
                            </div>
                            <div className="me-6">
                              <i className="far fa-calendar-alt me-1 text-success fs-5"></i>
                              <span className="text-gray-800 fw-bold">
                                {course.start_date} to {course.end_date}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    className="course-list-container mt-4 d-flex justify-content-center align-items-center"
                    style={{
                      maxHeight: "350px",
                      border: "1px solid #ddd",
                      borderRadius: "5px",
                      minHeight: "200px",
                    }}
                  >
                    <div className="text-center">
                      <i className="ki-duotone ki-search-list fs-2x text-muted mb-2">
                        <span className="path1"></span>
                        <span className="path2"></span>
                      </i>
                      <div className="text-muted fs-5">
                        {Tools.translate("NO_CLASSES_AVAILABLE")}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer flex-end">
              <button
                type="button"
                className="btn btn-light me-3"
                data-bs-dismiss="modal"
                onClick={() => {
                  formik.resetForm();
                }}
              >
                {Tools.translate("CLOSE")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/*membership modal*/}
      <div
        className="modal fade"
        id="kt_modal_add_membership"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered mw-800px">
          <div className="modal-content">
            <div className="modal-header" id="kt_modal_update_user_header">
              <h2 className="fw-bold">
                {Tools.translate("SUBSCRIBE_MEMBERSHIP")}
              </h2>
              <div
                className="btn btn-icon btn-sm btn-active-icon-primary"
                id="close-upsert"
                aria-label="Close"
                data-bs-dismiss="modal"
                onClick={() => {
                  formik.resetForm();
                }}
              >
                <i className="ki-duotone ki-cross fs-1">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
              </div>
            </div>
            <div className="modal-body py-10 px-lg-17">
              {formik.status && (
                <div className="alert alert-dismissible bg-light-danger d-flex flex-column flex-sm-row w-100 p-5 mb-10">
                  <i className="ki-duotone ki-message-text-2 fs-2hx text-danger me-4 mb-5 mb-sm-0">
                    <span className="path1"></span>
                    <span className="path2"></span>
                    <span className="path3"></span>
                  </i>
                  <div className="d-flex align-self-center text-danger">
                    <span>{formik.status}</span>
                  </div>
                </div>
              )}

              <div className="d-flex align-items-center mb-10 gap-4">
                {/* Search Input */}
                <div className="w-200px position-relative">
                  <i className="ki-duotone ki-magnifier fs-3 position-absolute top-50 start-0 translate-middle-y ms-4">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                  <input
                    type="text"
                    id="name_filter"
                    className="form-control form-control-solid ps-12"
                    placeholder={Tools.translate("SEARCH")}
                    autoComplete="off"
                    value={nameMembershipFilter}
                    onChange={(e) => {
                      setNameMembershipFilter(e.target.value);
                    }}
                  />
                </div>

                {/* Facility Filter */}
                <div className="w-150px">
                  <select
                    id="facilityMembershipFilterSelect"
                    className="form-select form-select-solid"
                    value={facilityMembershipFilter}
                    onChange={(e) =>
                      setFacilityMembershipFilter(e.target.value)
                    }
                  >
                    <option value="">All Facilities</option>
                    {facilities &&
                      facilities.map((facility) => (
                        <option key={facility.public_id} value={facility.name}>
                          {facility.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="w-250px">
                  <select
                    id="clientSelect"
                    className="form-select form-select-solid"
                    value={clientMembershipSelect}
                    onChange={(e) => setClientMembershipSelect(e.target.value)}
                  >
                    <option value={selectedClient?.public_id}>
                      {selectedClient?.first_name} {selectedClient?.last_name} (
                      {Tools.translate("PRIMARY_ACCOUNT")})
                    </option>
                    {familyMembers.length > 0 ? (
                      familyMembers.map((member) => (
                        <option key={member.public_id} value={member.public_id}>
                          {member.first_name} {member.last_name} (
                          {Tools.translate("FAMILY_ACCOUNT")})
                        </option>
                      ))
                    ) : (
                      <option disabled>No family members available</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="row g-6">
                {loadingPackages ? (
                  <div
                    className="course-list-container mt-4 d-flex justify-content-center align-items-center"
                    style={{
                      maxHeight: "350px",
                      border: "1px solid #ddd",
                      borderRadius: "5px",
                      minHeight: "200px",
                    }}
                  >
                    <div className="text-center">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <div className="mt-2">{Tools.translate("LOADING")}</div>
                    </div>
                  </div>
                ) : memberships.length > 0 ? (
                  <div
                    ref={courseListRef}
                    className="course-list-container mt-4"
                    style={{
                      maxHeight: "350px",
                      overflowY: "auto",
                      border: "1px solid #ddd",
                      padding: "10px",
                      borderRadius: "5px",
                    }}
                  >
                    {memberships.map((course) => (
                      <div
                        key={course.public_id}
                        className={`d-flex align-items-sm-center mb-7 card-container ${
                          selectedCourse?.public_id === course.public_id
                            ? "selected"
                            : ""
                        }`}
                        onClick={() => handleMembershipClick(course)}
                        style={{
                          cursor: "pointer",
                          padding: "10px",
                          borderRadius: "5px",
                        }}
                      >
                        <div className="symbol symbol-60px symbol-2by3 me-4">
                          <div
                            className="symbol-label"
                            style={{
                              backgroundImage: `url(${
                                course.image ||
                                "/path/to/default-course-image.jpg"
                              })`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              height: "80px",
                              width: "100px",
                            }}
                          >
                            {!course.image && (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="50"
                                height="50"
                                fill="gray"
                                className="bi bi-book"
                                viewBox="0 0 16 16"
                              >
                                <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811V2.828zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492V2.687zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783z" />
                              </svg>
                            )}
                          </div>
                        </div>
                        <div className="d-flex flex-row-fluid align-items-center flex-wrap my-lg-0 me-2">
                          <div className="flex-grow-1 my-lg-0 my-2 me-2">
                            <a
                              href="#"
                              className="text-gray-800 fw-bold text-hover-primary fs-6"
                            >
                              {course.name}
                            </a>
                            <span className="text-muted fw-semibold d-block pt-1">
                              {course.description}
                            </span>
                            <span className="text-muted fw-semibold d-block pt-1">
                              Facilities:{" "}
                              {course.facilities?.join(", ") || "Not specified"}
                            </span>
                          </div>
                          <div className="d-flex align-items-center">
                            <div className="me-6">
                              <i className="fas fa-tag me-1 text-primary fs-5"></i>
                              <span className="text-gray-800 fw-bold">
                                {course.price} SAR
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    className="course-list-container mt-4 d-flex justify-content-center align-items-center"
                    style={{
                      maxHeight: "350px",
                      border: "1px solid #ddd",
                      borderRadius: "5px",
                      minHeight: "200px",
                    }}
                  >
                    <div className="text-center">
                      <i className="ki-duotone ki-search-list fs-2x text-muted mb-2">
                        <span className="path1"></span>
                        <span className="path2"></span>
                      </i>
                      <div className="text-muted fs-5">
                        {Tools.translate("NO_MEMBERSHIPS_AVAILABLE")}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer flex-end">
              <button
                type="button"
                className="btn btn-light me-3"
                data-bs-dismiss="modal"
                onClick={() => {
                  formik.resetForm();
                }}
              >
                {Tools.translate("CLOSE")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/*add familymember*/}
      <div
        className="modal fade"
        id="family_modal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered mw-650px">
          <div className="modal-content">
            <div className="modal-header" id="client_modal_header">
              <h2 className="fw-bold">
                {!familyOriginalValues.public_id
                  ? Tools.translate("ADD_FAMILY_MEMBERS")
                  : Tools.translate("UPDATE_FAMILY_MEMBER")}
              </h2>
              <div
                className="btn btn-icon btn-sm btn-active-icon-primary"
                id="close_model_btn"
                aria-label="Close"
                data-bs-dismiss="modal"
                onClick={() => {
                  resetFamilyFormValues();
                }}
              >
                <i className="ki-duotone ki-cross fs-1">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
              </div>
            </div>

            <form
              className="form"
              onSubmit={familyFormik.handleSubmit}
              id="family_modal_form"
              noValidate
            >
              {/* <!--begin::Modal body--> */}
              <div className="modal-body py-10 px-lg-17">
                <div id="client_modal_info" className="collapse show">
                  <div className="row mb-3 col-12">
                    <div className=" mb-3 col-6">
                      <label className="col-12 col-form-label required fw-bold fs-6">
                        {Tools.translate("FIRST_NAME")}
                      </label>
                      <input
                        type="text"
                        placeholder={Tools.translate("FIRST_NAME")}
                        autoComplete="off"
                        {...familyFormik.getFieldProps("first_name")}
                        className={clsx(
                          "form-control bg-transparent mb-3 mb-lg-0",
                          {
                            "is-invalid":
                              familyFormik.errors.first_name &&
                              familyFormik.touched.first_name,
                          },
                          {
                            "is-valid":
                              familyFormik.touched.first_name &&
                              !familyFormik.errors.first_name,
                          }
                        )}
                      />
                      {familyFormik.touched.first_name &&
                        familyFormik.errors.first_name && (
                          <div className="fv-plugins-message-container">
                            <div className="fv-help-block">
                              {familyFormik.errors.first_name}
                            </div>
                          </div>
                        )}
                    </div>
                    <div className=" mb-3 col-6">
                      <label className="col-12 col-form-label required fw-bold fs-6">
                        {Tools.translate("LAST_NAME")}
                      </label>
                      <input
                        type="text"
                        placeholder={Tools.translate("LAST_NAME")}
                        autoComplete="off"
                        {...familyFormik.getFieldProps("last_name")}
                        className={clsx(
                          "form-control bg-transparent mb-3 mb-lg-0",
                          {
                            "is-invalid":
                              familyFormik.errors.last_name &&
                              familyFormik.touched.last_name,
                          },
                          {
                            "is-valid":
                              familyFormik.touched.last_name &&
                              !familyFormik.errors.last_name,
                          }
                        )}
                      />
                      {familyFormik.touched.last_name &&
                        familyFormik.errors.last_name && (
                          <div className="fv-plugins-message-container">
                            <div className="fv-help-block">
                              {familyFormik.errors.last_name}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>

                  <div className="row mb-3 col-12">
                    <div className="mb-3 col-6">
                      <label className="col-12 col-form-label required fw-bold fs-6">
                        {Tools.translate("DATE_OF_BIRTH")}
                      </label>
                      <input
                        type="date"
                        placeholder={Tools.translate("DATE_OF_BIRTH")}
                        id="family_member_birthDate"
                        {...familyFormik.getFieldProps("date_of_birth")}
                        className={clsx(
                          "form-control bg-transparent mb-3 mb-lg-0",
                          {
                            "is-invalid":
                              familyFormik.touched.date_of_birth &&
                              familyFormik.errors.date_of_birth,
                          },
                          {
                            "is-valid":
                              familyFormik.touched.date_of_birth &&
                              !familyFormik.errors.date_of_birth,
                          }
                        )}
                      />
                      {familyFormik.touched.date_of_birth &&
                        familyFormik.errors.date_of_birth && (
                          <div className="fv-plugins-message-container">
                            <div className="fv-help-block">
                              {familyFormik.errors.date_of_birth}
                            </div>
                          </div>
                        )}
                    </div>

                    <div className="mb-3 col-6">
                      <label className="col-12 col-form-label required fw-bold fs-6">
                        {Tools.translate("GENDER")}
                      </label>
                      <select
                        {...familyFormik.getFieldProps("gender")}
                        className={clsx(
                          "form-select bg-transparent form-select-lg",
                          {
                            "is-invalid":
                              familyFormik.touched.gender &&
                              familyFormik.errors.gender,
                          },
                          {
                            "is-valid":
                              familyFormik.touched.gender &&
                              !familyFormik.errors.gender,
                          }
                        )}
                      >
                        <option value="">
                          {Tools.translate("SELECT_GENDER")}
                        </option>
                        <option key="MALE" value="MALE">
                          MALE
                        </option>
                        <option key="FEMALE" value="FEMALE">
                          FEMALE
                        </option>
                      </select>
                      {familyFormik.touched.gender &&
                        familyFormik.errors.gender && (
                          <div className="fv-plugins-message-container">
                            <div className="fv-help-block">
                              {familyFormik.errors.gender}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>

                  <div className="row mb-3 col-12">
                    <div className=" mb-3 col-6">
                      <label className="col-12 col-form-label required fw-bold fs-6">
                        {Tools.translate("HEIGHT")}
                      </label>
                      <input
                        type="number"
                        placeholder={Tools.translate("HEIGHT")}
                        {...familyFormik.getFieldProps("height")}
                        className={clsx(
                          "form-control bg-transparent mb-3 mb-lg-0",
                          {
                            "is-invalid":
                              familyFormik.errors.height &&
                              familyFormik.touched.height,
                          },
                          {
                            "is-valid":
                              familyFormik.touched.height &&
                              !familyFormik.errors.height,
                          }
                        )}
                      />
                      {familyFormik.touched.height &&
                        familyFormik.errors.height && (
                          <div className="fv-plugins-message-container">
                            <div className="fv-help-block">
                              {familyFormik.errors.height}
                            </div>
                          </div>
                        )}
                    </div>
                    <div className=" mb-3 col-6">
                      <label className="col-12 col-form-label required fw-bold fs-6">
                        {Tools.translate("WEIGHT")}
                      </label>
                      <input
                        type="number"
                        placeholder={Tools.translate("WEIGHT")}
                        {...familyFormik.getFieldProps("weight")}
                        className={clsx(
                          "form-control bg-transparent mb-3 mb-lg-0",
                          {
                            "is-invalid":
                              familyFormik.errors.weight &&
                              familyFormik.touched.weight,
                          },
                          {
                            "is-valid":
                              familyFormik.touched.weight &&
                              !familyFormik.errors.weight,
                          }
                        )}
                      />
                      {familyFormik.touched.weight &&
                        familyFormik.errors.weight && (
                          <div className="fv-plugins-message-container">
                            <div className="fv-help-block">
                              {familyFormik.errors.weight}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer flex-end">
                <button
                  type="reset"
                  className="btn btn-light me-3"
                  id="close-modal"
                  data-bs-dismiss="modal"
                  onClick={() => {
                    resetFamilyFormValues();
                  }}
                >
                  {Tools.translate("DISCARD")}
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={
                    !familyFormik.isValid ||
                    familyFormik.isSubmitting ||
                    familyFormik.values.first_name === ""
                  }
                  data-kt-users-modal-action="submit"
                >
                  {familyFormik.isSubmitting ? (
                    <span className="">
                      {Tools.translate("PLEASE_WAIT")}
                      <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
                    </span>
                  ) : (
                    <span className="indicator-label">
                      {Tools.translate("SUBMIT")}
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/*modal for families subscription*/}
      {showSubscriptionsModal && selectedMember && (
        <>
          <div
            className="modal fade show d-block"
            id="subscriptions_modal"
            tabIndex="-1"
            aria-modal="true"
            role="dialog"
            onClick={() => setShowSubscriptionsModal(false)}
          >
            <div className="modal-dialog modal-dialog-centered mw-800px">
              <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h2 className="fw-bolder">
                    {Tools.translate("SUBSCRIPTIONS_FOR")}{" "}
                    {selectedMember.first_name} {selectedMember.last_name}
                  </h2>
                  <div
                    className="btn btn-sm btn-icon btn-active-color-primary"
                    onClick={() => setShowSubscriptionsModal(false)}
                  >
                    <i className="ki-duotone ki-cross fs-1">
                      <span className="path1"></span>
                      <span className="path2"></span>
                    </i>
                  </div>
                </div>

                <div className="modal-body scroll-y mx-5 mx-xl-15 my-7">
                  {selectedMember.subscriptions?.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table align-middle table-row-dashed fs-6 gy-5">
                        <thead>
                          <tr className="text-start text-gray-800 fw-bold fs-7 text-uppercase gs-0">
                            <th className="min-w-125px">
                              {Tools.translate("PACKAGE")}
                            </th>
                            <th className="min-w-125px">
                              {Tools.translate("TYPE")}
                            </th>
                            <th className="min-w-125px">
                              {Tools.translate("START_DATE")}
                            </th>
                            <th className="min-w-125px">
                              {Tools.translate("END_DATE")}
                            </th>
                            <th className="min-w-125px">
                              {Tools.translate("PRICE")}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="fw-semibold text-gray-600">
                          {selectedMember.subscriptions.map((sub, index) => (
                            <tr key={index}>
                              <td>{sub.package_name}</td>
                              <td>
                                <span
                                  className={`badge badge-light-${
                                    sub.package_type === "MEMBERSHIP"
                                      ? "primary"
                                      : sub.package_type === "COURSE"
                                      ? "success"
                                      : sub.package_type === "FACILITY"
                                      ? "info"
                                      : "warning"
                                  }`}
                                >
                                  {sub.package_type}
                                </span>
                              </td>
                              <td>{sub.start_date}</td>
                              <td>{sub.end_date}</td>
                              <td>SAR {sub.price.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <i className="ki-duotone ki-information fs-2x text-muted">
                        <span className="path1"></span>
                        <span className="path2"></span>
                        <span className="path3"></span>
                      </i>
                      <div className="mt-4">
                        <h4 className="text-gray-600">
                          {Tools.translate("NO_SUBSCRIPTIONS_FOUND")}
                        </h4>
                        <p className="text-muted">
                          {Tools.translate("MEMBER_DONT_HAVE_SUBSCRIPTIONS")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="modal-footer flex-end">
                  <button
                    type="button"
                    className="btn btn-light me-3"
                    onClick={() => setShowSubscriptionsModal(false)}
                  >
                    {Tools.translate("CLOSE")}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}

      {/*send email modal*/}
      <div
        className="modal fade"
        id="sendMessageModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-xl">
          <div className="modal-content">
            <div className="modal-header py-3">
              <h2 className="modal-title">
                {Tools.translate("COMPOSE_MESSAGE")}
              </h2>
              <button
                type="button"
                className="btn btn-sm btn-icon btn-active-light-primary"
                data-bs-dismiss="modal"
              >
                <i className="ki-duotone ki-cross fs-1">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
              </button>
            </div>

            <div className="modal-body p-0">
              <form
                id="kt_inbox_compose_form"
                onSubmit={emailFormik.handleSubmit}
              >
                <div className="d-block">
                  {/* TO FIELD */}
                  <div className="d-flex align-items-center border-bottom px-8 min-h-50px">
                    <div className="text-gray-900 fw-bold w-75px">
                      {Tools.translate("TO")}:
                    </div>
                    <input
                      type="text"
                      value={originalValues.username}
                      className="form-control form-control-transparent border-0"
                      name="compose_to"
                      readOnly
                    />
                  </div>

                  {/* SUBJECT FIELD */}
                  <div className="border-bottom">
                    <input
                      className={clsx(
                        "form-control form-control-transparent border-0 px-8 min-h-45px"
                      )}
                      name="subject"
                      placeholder={Tools.translate("SUBJECT")}
                      value={emailFormik.values.subject}
                      onChange={emailFormik.handleChange}
                    />

                    {emailFormik.touched.subject && emailFormik.errors.subject && (
                      <div className="fv-plugins-message-container">
                        <div className="fv-help-block ms-4">
                          {emailFormik.errors.subject}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* QUILL TEXT EDITOR */}
                  <div className="border-bottom">
                    <div
                      ref={quillRef}
                      className="form-control form-control-transparent border-0 h-350px ql-container ql-snow"
                    />
                    {emailFormik.touched.text && emailFormik.errors.text && (
                      <div className="text-danger px-8">
                        {emailFormik.errors.text}
                      </div>
                    )}
                  </div>

                  {/* SUBMIT BUTTON */}
                  <div className="d-flex flex-end gap-2 py-5 ps-8 pe-5 border-top">
                    <div className="btn-group me-4">
                      <button
                        type="submit"
                        className="btn btn-primary fs-bold px-6"
                        disabled={emailFormik.isSubmitting}
                      >
                        <span className="indicator-label">
                          {emailFormik.isSubmitting
                            ? Tools.translate("PLEASE_WAIT")
                            : tools.translate("SEND")}
                        </span>
                        {emailFormik.isSubmitting && (
                          <span className="indicator-progress">
                            {Tools.translate("PLEASE_WAIT")}
                            <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <FsLightbox
        toggler={lightboxController.toggler}
        sources={lightboxSource}
        slide={lightboxController.slide}
        type="image"
      />
    </Fragment>
  );
};
export default ClientForm;
