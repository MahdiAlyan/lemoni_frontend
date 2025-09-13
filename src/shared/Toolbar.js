import React from "react";
import {useLocation} from "react-router-dom";
import constants from '../common/constants';
import Tools from "../config/Tools";

const Toolbar = ({buttons}) => {

    const location = useLocation();
    const currentPath = constants.PATH_TITLE[location.pathname];

    if (!currentPath) {
        return null; // Handle unknown routes gracefully
    }

    return (


        <div className="toolbar py-5 pb-lg-10" id="kt_toolbar">

            <div id="kt_toolbar_container" className="container-fluid  d-flex flex-stack flex-wrap">

                <div className="page-title d-flex flex-column me-3">

                    <h1 className="d-flex text-white fw-bold my-1 fs-3">{Tools.translate(currentPath.title)}</h1>


                    <ul className="breadcrumb breadcrumb-separatorless fw-semibold fs-7 my-1">

                        {currentPath.breadcrumb.map((item, index) => (
                            <>
                                <li className="breadcrumb-item text-white opacity-75">
                                    {item.url === '#' || index === currentPath.breadcrumb.length - 1 ? (
                                        <span>{Tools.translate(item.title)}</span> // Render plain text for the last item or when the URL is '#'
                                    ) : (
                                        <a href={item.url} className="text-white text-hover-primary margin-dir-end-2">{Tools.translate(item.title)}</a>
                                    )}
                                </li>
                                {item.url !== '#' && index < currentPath.breadcrumb.length - 1 && ( // Add bullet only if it's not the last item or '#' URL
                                    <li className="breadcrumb-item">
                                        <span className="bullet bg-white opacity-75 w-5px h-2px"></span>
                                    </li>
                                )}
                            </>
                        ))}


                    </ul>

                </div>
                <div className="d-flex align-items-center py-3 py-md-1">
                    {buttons}
                </div>

            </div>

        </div>
    )
}
export default Toolbar;