import React, { useState, useRef, useEffect } from 'react';
import {ListLoader} from "../../../shared/ListLoader";
import {submitClient} from "../../../calls/Api";

const ClientStatusCell = ({ currentStatus, clientData, onStatusChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [status, setStatus] = useState(currentStatus);
    const [isLoading, setIsLoading] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        setStatus(currentStatus);
    }, [currentStatus]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const statusColors = {
        NEW: "primary",
        ACTIVE: "success",
        DEACTIVATED: "danger",
        SUSPENDED: "warning"
    };

    const statusLabels = {
        NEW: "New",
        ACTIVE: "Active",
        DEACTIVATED: "Deactivated",
        SUSPENDED: "Suspended"
    };

    const handleStatusUpdate = async (newStatus) => {
        try {
            setIsLoading(true);
            const { speciality, is_online, is_active, agree_to_policy, ...clientPayload } = clientData;
            await submitClient({
                ...clientPayload,
                status: newStatus
            });
            setStatus(newStatus);
            onStatusChange(newStatus);
            toastr.success('Client status updated successfully');
        } catch (error) {
            console.error('Failed to update client status', error);
            toastr.error('Failed to update client status');
        } finally {
            setIsLoading(false);
            setIsOpen(false);
        }
    };

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            {!isOpen && (
                <span
                    className={`badge badge-light-${statusColors[status] || "warning"} fw-bolder`}
                    onClick={toggleDropdown}
                    style={{
                        cursor: 'pointer',
                        minWidth: '50px',
                        display: 'inline-flex',
                        justifyContent: 'center'
                    }}
                >
                    {statusLabels[status] || status}
                </span>
            )}

            {isOpen && (
                <div ref={dropdownRef} style={{ display: 'inline-block' }}>
                    <select
                        className={`badge badge-light-${statusColors[status] || "warning"} fw-bolder form-select form-select-sm`}
                        style={{
                            minWidth: '100px',
                            cursor: 'pointer',
                        }}
                        data-kt-select2='true'
                        data-placeholder='Select status'
                        data-allow-clear='true'
                        data-hide-search='true'
                        onChange={(e) => handleStatusUpdate(e.target.value)}
                        value={status}
                        autoFocus
                    >
                        {Object.entries(statusLabels).map(([key, label]) => (
                            <option
                                key={key}
                                value={key}
                                style={{backgroundColor:'white'}}
                                className={`badge badge-light-${statusColors[key]} fw-bolder`}
                            >
                                {label}
                            </option>
                        ))}
                    </select>
                </div>
            )}
            {isLoading && <ListLoader />}
        </>
    );
};

export default ClientStatusCell;