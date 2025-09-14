import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMissions } from '../../calls/Api';
import Tools from '../../config/Tools';

const Missions = () => {
    const [missions, setMissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        const fetch = async () => {
            try {
                const resp = await getMissions();
                const data = resp?.data ?? resp;
                if (mounted) setMissions(Array.isArray(data) ? data : (data.results || []));
            } catch (e) {
                console.error('Failed to load missions', e);
                if (mounted) setMissions([]);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        fetch();
        return () => mounted = false;
    }, []);

    return (
        <div className="col-xl-12">
            <div className="card card-xl-stretch mb-5 mb-xl-8">
                <div className="card-header align-items-center py-5 gap-2 gap-md-5 border-0">
                    <div className="card-title">
                        <h3 className="fw-bold">{Tools.translate('MISSIONS') || 'Missions'}</h3>
                    </div>
                </div>
                <div className="card-body">
                    {loading ? (
                        <div className="text-center py-10">{Tools.translate('PLEASE_WAIT')}</div>
                    ) : missions.length === 0 ? (
                        <div className="text-center py-10">{Tools.translate('NO_MISSIONS_FOUND') || 'No missions found'}</div>
                    ) : (
                        <div className="row gy-6">
                            {missions.map((m) => (
                                <div key={m.id || m.public_id} className="col-md-4">
                                    <Link to={`/missions/${m.id || m.public_id}`} className="text-reset text-decoration-none">
                                        <div className="card h-100">
                                            <div className="card-body">
                                                <div className="d-flex align-items-center mb-4">
                                                    <div className="symbol symbol-60px symbol-circle me-4">
                                                        <img src={m.image || '/assets/media/logos/icon.png'} alt={m.title} />
                                                    </div>
                                                    <div>
                                                        <div className="fw-bold fs-5">{m.title || m.name || 'Untitled'}</div>
                                                        <div className="text-muted">{m.code || ''}</div>
                                                    </div>
                                                </div>
                                                <div className="mb-2">
                                                    <strong>{Tools.translate('STATUS') || 'Status'}:</strong> {m.status || 'unknown'}
                                                </div>
                                                <div>
                                                    <strong>{Tools.translate('STARTED_AT') || 'Started at'}:</strong> {m.started_at || '—'}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Missions;
