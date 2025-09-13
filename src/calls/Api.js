import Request from "../config/Request";
import Tools from "../config/Tools";
import constants from "../common/constants";

// AUTH API CALLS
const login = async (data) => {
    return Request.post('/account-manager/login/', Tools.formData(data))
};

const userProfile = async (data) => {
    return Request.get('/account-manager/user-profile/', Tools.formData(data))
};


const signUp = async (data) => {
    return Request.post('/account-manager/register/', Tools.formData(data))
};


const RequestForgotPassword = async (data) => {
    return Request.post('/account-manager/password-reset/', Tools.formData(data))
};

const SubmitResetPassword = async (data) => {
    return Request.post('/account-manager/password-reset-confirmation/', Tools.formData(data))
};


const VerifyOtp = async (data) => {
    return Request.post('/account-manager/otp-verify/', Tools.formData(data))
};

const activateAccount = async (data) => {
    return Request.post('/account-manager/activation/', Tools.formData(data))
}


// USER API CALLS

const registerUser = async (data) => {
    return Request.post('/account-manager/add-user/', Tools.formData(data))
}

export const changePasswordByUsername = async (username, newPassword) => {
    const data = {
        username: username,
        new_password: newPassword,
        new_password_confirm: newPassword,
    };
    return Request.post('/account-manager/change-user-password/', Tools.formData(data))
}

const listUsers = async (data) => {
    return Request.get('/account-manager/list-users/', {params: data})
}

const listRoles = async (data) => {
    return Request.get('/account-manager/get-groups/', {params: data})
}

const saveUserForReservation = async (data) => {
    return Request.post('/account-manager/save-user-for-reservation/', Tools.formData(data))
}


// CLIENT API CALLS

const submitClient = async (data) => {
    return Request.post('/account-manager/save-client/', data , {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

const getClient = async (data) => {
    return Request.get('/account-manager/get_client/', {params: data})
};

const listUserActivities = async (data) => {
    return Request.get('/account-manager/list-activities/', {params: data})
};

const updateClientsCredit = async (data) => {
    return Request.post('/account-manager/update-user-credit/', Tools.formData(data))
};

const changeProfileImage = async (data) => {
    return Request.post('/account-manager/change-user-photo/', data , {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};


//email
const sendEmail = async (data) => {
    return Request.post('/account-manager/send-email/', Tools.formData(data))
};

//notification
export async function getOldNotifications(data) {
    return Request.get(constants.API_URLS.GET_OLD_NOTIFICATIONS, Tools.formData(data))
};
const dismissNotification = async (id) => {
    var url = `/notifications/${id}/dismiss`
    return Request.patch(url, {})
};
const dismissAllNotification = async (id) => {
    var url = `/notifications/dismiss-all`
    return Request.post(url, {})
};

//Admin dashboard
const adminDashboardKpis = async (data) => {
    return Request.get('/dashboard/admins-dashboard-kpis/', {params: data})
};

//cashier dashobard
const todayTransactions = async (data) => {
    return Request.get('/dashboard/todays-transactions/', {params: data})
};



export {
    login,
    userProfile,
    signUp,
    RequestForgotPassword,
    SubmitResetPassword,
    VerifyOtp,
    activateAccount,
    registerUser,
    submitClient,
    getClient,
    listUsers,
    saveUserForReservation,
    listRoles,
    updateClientsCredit,
    listUserActivities,
    sendEmail,
    dismissNotification,
    dismissAllNotification,
    adminDashboardKpis,
    todayTransactions,
    changeProfileImage,
}
