import React, {Fragment, useContext, useEffect, useState, useRef, lazy} from "react";
import ReactDOM from 'react-dom/client';
import './index.css';
import ScreenLoader from "./shared/ScreenLoader";
import { DirectionProvider } from './contexts/DirectionContext';

const DelayedSuspense = ({children, fallback, delay = 2000}) => {
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => setShowContent(true), delay); // Set delay in milliseconds
        return () => clearTimeout(timeout); // Cleanup the timeout
    }, [delay]);

    return showContent ? children : fallback;
};

// Lazy Loading to make sure the app component are loaded
const AppComponent = lazy(() => import(`./App`));


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <DirectionProvider>
        <React.Suspense fallback={<ScreenLoader />}>
            {/*<DelayedSuspense fallback={<ScreenLoader/>} delay={1000}>*/}
            <AppComponent />
            {/*</DelayedSuspense>*/}
        </React.Suspense>
    </DirectionProvider>
);
