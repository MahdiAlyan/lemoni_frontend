import React, {useEffect, useState} from 'react';
import { adminDashboardKpis } from '../../calls/Api';
import Tools from '../../config/Tools';

// Inline KPI card markup will be used instead of a separate KpiCard component

const Analytics = () => {
    const [kpis, setKpis] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchKpis = async () => {
            setLoading(true);
            try {
                const resp = await adminDashboardKpis();
                const data = resp?.data ?? resp;
                setKpis(data || {});
            } catch (err) {
                console.error('Failed to load analytics KPIs', err);
            } finally {
                setLoading(false);
            }
        }
        fetchKpis();
    }, []);

    return (
        <div className="card">
            <div className="card-body">
                <h3 className="mb-4">{Tools.translate('ANALYTICS')}</h3>

                {loading && <div>{Tools.translate('PLEASE_WAIT')}</div>}

                {!loading && (
                    <div className="row g-4">
                        <div className="col-md-4">
                            <div className="card card-flush h-md-100">
                                <div className="card-body d-flex align-items-center">
                                    <div className="symbol symbol-50px me-4">
                                        <span className="symbol-label bg-light">
                                            <i className="ki-outline ki-users fs-2"></i>
                                        </span>
                                    </div>
                                    <div>
                                        <div className="text-gray-800 fs-3 fw-bold">{kpis?.total_users ?? '0'}</div>
                                        <div className="text-muted fw-semibold mt-1">{Tools.translate('TOTAL_USERS')}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="card card-flush h-md-100">
                                <div className="card-body d-flex align-items-center">
                                    <div className="symbol symbol-50px me-4">
                                        <span className="symbol-label bg-light">
                                            <i className="ki-outline ki-rocket fs-2"></i>
                                        </span>
                                    </div>
                                    <div>
                                        <div className="text-gray-800 fs-3 fw-bold">{kpis?.active_drones ?? '0'}</div>
                                        <div className="text-muted fw-semibold mt-1">{Tools.translate('ACTIVE_DRONES')}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="card card-flush h-md-100">
                                <div className="card-body d-flex align-items-center">
                                    <div className="symbol symbol-50px me-4">
                                        <span className="symbol-label bg-light">
                                            <i className="ki-outline ki-flag fs-2"></i>
                                        </span>
                                    </div>
                                    <div>
                                        <div className="text-gray-800 fs-3 fw-bold">{kpis?.total_missions ?? '0'}</div>
                                        <div className="text-muted fw-semibold mt-1">{Tools.translate('TOTAL_MISSIONS')}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="card card-flush h-md-100">
                                <div className="card-body d-flex align-items-center">
                                    <div className="symbol symbol-50px me-4">
                                        <span className="symbol-label bg-light">
                                            <i className="ki-outline ki-check fs-2"></i>
                                        </span>
                                    </div>
                                    <div>
                                        <div className="text-gray-800 fs-3 fw-bold">{kpis?.completed_missions ?? '0'}</div>
                                        <div className="text-muted fw-semibold mt-1">{Tools.translate('COMPLETED_MISSIONS')}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="card card-flush h-md-100">
                                <div className="card-body d-flex align-items-center">
                                    <div className="symbol symbol-50px me-4">
                                        <span className="symbol-label bg-light">
                                            <i className="ki-outline ki-clock fs-2"></i>
                                        </span>
                                    </div>
                                    <div>
                                        <div className="text-gray-800 fs-3 fw-bold">{kpis?.pending_missions ?? '0'}</div>
                                        <div className="text-muted fw-semibold mt-1">{Tools.translate('PENDING_MISSIONS')}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="card card-flush h-md-100">
                                <div className="card-body d-flex align-items-center">
                                    <div className="symbol symbol-50px me-4">
                                        <span className="symbol-label bg-light">
                                            <i className="ki-outline ki-wallet fs-2"></i>
                                        </span>
                                    </div>
                                    <div>
                                        <div className="text-gray-800 fs-3 fw-bold">{kpis?.revenue ?? '0'}</div>
                                        <div className="text-muted fw-semibold mt-1">{Tools.translate('REVENUE')}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Analytics;
