export default {

    ROUTES: {},

    API_URLS: {
        IDENTIFY: "account/identify",
        CHECK_LOGIN_TOKEN: '/account/authenticate_token',
        TOKEN_REFRESH_URL: '/account-manager/token-refresh/',
        GET_OLD_NOTIFICATIONS : "/notifications/list",
    },

    OWNERS_URLS: {},

    API_ERRORS: {
        INVALID_USER_AUTHENTICATION: "INVALID_USER_AUTHENTICATION"
    },

    PATH_TITLE: {
        '/': {
            title: 'DASHBOARD',
            breadcrumb: [{title: 'HOME', url: '/'}],
        },
    }



}