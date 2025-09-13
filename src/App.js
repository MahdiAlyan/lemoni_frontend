import React, {Fragment, useEffect, useState} from "react";
import AppWrapper from "./shared/AppWrapper";
import AuthContextProvider from "./contexts/AuthContext";
import Auth from "./config/Auth";
import DirectionAssetsLoader from "./contexts/DirectionAssestsLoader";

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Use this Component to add Application Context
    useEffect(() => {
        // # Initializing the theme libraries
        if (window.KTComponents) {
            window.KTComponents.init();
        }
        if (window.KTAppLayoutBuilder) {
            window.KTAppLayoutBuilder.init();
        }
        if (window.KTLayoutSearch) {
            window.KTLayoutSearch.init();
        }
        if (window.KTThemeModeUser) {
            window.KTThemeModeUser.init();
        }
        if (window.KTThemeMode) {
            window.KTThemeMode.init();
        }
        if (window.KTPasswordMeter) {
            window.KTPasswordMeter.createInstances();
        }

        if (window.KTUtil) {
            window.KTUtil.init();
        }

    });

    useEffect(() => {
        const handleStorageChange = (event) => {
            if (event.key === 'access-token' || event.key === null) {
                const currentlyAuthenticated = Auth.isAuthenticated();

                if (currentlyAuthenticated !== isAuthenticated) {
                    setIsAuthenticated(currentlyAuthenticated);

                    if (!currentlyAuthenticated) {
                        window.location.href = '/login';
                    }
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [isAuthenticated]);

    return (

        <Fragment>
            <AuthContextProvider>
                <AppWrapper />
                <DirectionAssetsLoader />
            </AuthContextProvider>
        </Fragment>

    );
}

export default App;
