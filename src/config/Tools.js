import Constants from "../common/constants";
import dictionary from "../common/dictionary";

// import Swal from 'sweetalert2';


class Tools {


    constructor() {
    }

    phoneRegExp = /^(5)(5|0|3|6|4|9|1|8|7)([0-9]{7})$/;

    formData(data) {
        let formData = new FormData();
        for (let key in data) {
            formData.append(key, data[key]);
        }
        return formData
    }


    checkResponseStatus(response, succesFunction, errorFunction) {
        if (response.status === 200 || response.status === 201) {
            succesFunction()
        } else {
            const responseMessage = response.data.message;
            if (responseMessage === Constants.API_ERRORS.INVALID_USER_AUTHENTICATION) {
                localStorage.removeItem("auth-token")
                window.location.href = "/";
            } else {
                errorFunction();
            }
        }
    }

    // Helper function to truncate text
    truncateText = (text, maxLength) => {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    getInitials(name) {
        if (name) {
            const initials = name
                .split(' ')
                .map((name) => name.charAt(0))
                .join('');
            return initials.toUpperCase();
        }
        return 'N/A'; // Return an empty string if fullName is null or undefined.
    }

    // Helper function to get initials from a name
    getInitials2(firstName = '', lastName = '') {
        let firstInitial = '';
        let lastInitial = '';

        // Extract the first character from firstName and lastName, and capitalize them
        if (firstName && firstName.trim() !== '') {
            firstInitial = firstName.charAt(0).toUpperCase();
        }
        if (lastName && lastName.trim() !== '') {
            lastInitial = lastName.charAt(0).toUpperCase();
        }

        // Combine the initials and return them
        return firstInitial + lastInitial;
    }


    // SweetAlert2(onSweetAlertConfirm) {
    //     let alertText =
    //         '<small>' +
    //         'Many prizes are waiting you, just go to shop to continue playing' +
    //         ' </small>' +
    //         '</br>' +
    //         '<h4 class="fw-bolder d-inline-flex">' +
    //         `text4`
    //     '</h4>'
    //     let sweetAlertProps = {
    //         show: true,
    //         title: 'Credits Ended',
    //         html: alertText,
    //         icon: 'info',
    //         confirmButtonText: 'Got to shop',
    //         showCancelButton: true,
    //         cancelButtonText: 'Go to Home',
    //         allowOutsideClick: false,
    //         customClass: {
    //             confirmButton: 'btn btn-success',
    //             cancelButton: 'btn btn-danger'
    //         },
    //     }
    //
    //     Swal.fire(sweetAlertProps).then((result) => {
    //         if (result.isConfirmed) {
    //             alert('confirm')
    //         } else {
    //             alert('not confirmed')
    //         }
    //     })
    // }


    delay = (n) => new Promise(r => setTimeout(r, n));


    getQueryParams() {
        var qS = new URLSearchParams(window.location.search);
        return qS
    }

    statusLabel(status) {
        // Format the status (e.g., convert "UNDER_REVIEW" to "UNDER REVIEW")
        return status.replace(/_/g, ' ');
    }

    hasNativePasswordToggle() {
        const isChrome = /Chrome/.test(navigator.userAgent) && !/Edge|Edg/.test(navigator.userAgent);
        if (isChrome) return false;

        try {
            // Create a password input
            const input = document.createElement('input');
            input.type = 'password';
            document.body.appendChild(input);

            // Check if it has the show/hide button
            const hasToggle = window.getComputedStyle(input, '::-ms-reveal').display !== 'none' ||
                window.getComputedStyle(input, '::-webkit-caps-lock-indicator').display !== 'none' ||
                window.getComputedStyle(input, '::-webkit-text-security').display !== 'none';

            document.body.removeChild(input);
            return hasToggle;
        } catch (e) {
            return false;
        }
    }

    translate(key) {
        const appDirection = localStorage.getItem("appDirection") || "ltr";
        const lang = appDirection === 'rtl' ? 'AR' : 'EN';

        return dictionary[lang]?.[key] || key;
    }


}

export default new Tools();