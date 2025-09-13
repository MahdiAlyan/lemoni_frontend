import LocalStorage from "./LocalStorage";

class Auth {
    constructor() {
        this.authenticated = this.isAuthenticated();
        this.user = {};
    }

    resetAuthentication() {
        localStorage.removeItem('access-token');
        localStorage.removeItem('refresh-token');
        localStorage.setItem('role',"GUEST");
        window.location.href = "/portal/ClientHome";
    }

    isAuthenticated() {
        return LocalStorage.checkStorage("access-token");
        // return false
    }

    getAccessToken() {
        const accessToken = localStorage.getItem('access-token')
        return accessToken ? accessToken : null;
    }

    setAccessToken(accessTokenValue) {
        localStorage.setItem("access-token", accessTokenValue)
    }

    getRefreshToken() {
        const refreshToken = localStorage.getItem('refresh-token')
        return refreshToken ? refreshToken : null;
    }

    setRefreshToken(refreshTokenValue) {
        localStorage.setItem("refresh-token", refreshTokenValue)
    }

    setUserRole(roleValue) {
        localStorage.setItem("role", roleValue)
    }

    getUserRole() {
        // If not authenticated, always return GUEST
        if (!this.isAuthenticated()) {
            return "GUEST";
        }
        let role = localStorage.getItem("role");
        // Explicitly handle null and "null" cases
        if (role === null || role === "null" || role === undefined || role === "") {
            return "GUEST";
        }
        return role;
    }


}

export default new Auth();
