import React, {useState} from "react";
import {Outlet} from "react-router-dom";
import Header from "./Header";
import Toolbar from "./Toolbar";
import Footer from "./Footer";

const DashboardWrapper = () => {

    const [toolbarButtons, setToolbarButtons] = useState(null);
    return (
        <div className="d-flex flex-column flex-root">
            <div className="page d-flex flex-row flex-column-fluid">
                <div className="wrapper d-flex flex-column flex-row-fluid" id="kt_wrapper">

                    <Header/>

                    <Toolbar buttons={toolbarButtons}/>

                    <div id="kt_content_container" className="d-flex flex-column-fluid align-items-start container-fluid">
                        <div className="content flex-row-fluid" id="kt_content">

                            <Outlet context={{ setToolbarButtons }}/>

                        </div>
                    </div>
                    <Footer />
                </div>
            </div>
        </div>
    )
}
export default DashboardWrapper;