import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyDrones } from '../../calls/Api';
import Tools from '../../config/Tools';

const MyDrones = () => {
    const [drones, setDrones] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        const fetch = async () => {
            try {
                const resp = await getMyDrones();
                // resp.data or resp depending on Request wrapper; handle both
                const data = resp?.data ?? resp;
                if (mounted) setDrones(Array.isArray(data) ? data : (data.results || []));
            } catch (e) {
                console.error('Failed to load drones', e);
                if (mounted) setDrones([]);
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
                        <h3 className="fw-bold">{Tools.translate('MYDRONES') || 'My Drones'}</h3>
                    </div>
                </div>
                <div className="card-body">
                    {loading ? (
                        <div className="text-center py-10">{Tools.translate('PLEASE_WAIT')}</div>
                    ) : drones.length === 0 ? (
                        <div className="text-center py-10">{Tools.translate('NO_DRONES_FOUND') || 'No drones found'}</div>
                    ) : (
                        <div className="row gy-6">
                            {drones.map((drone) => (
                                <div key={drone.id || drone.public_id} className="col-md-4">
                                    <Link to={`/my-drones/${drone.id || drone.public_id}`} className="text-reset text-decoration-none">
                                        <div className="card h-100">
                                            <div className="card-body">
                                                <div className="d-flex align-items-center mb-4">
                                                    <div className="symbol symbol-60px symbol-circle me-4">
                                                        <img src={drone.image || '/assets/media/logos/icon.png'} alt={drone.name} />
                                                    </div>
                                                    <div>
                                                        <div className="fw-bold fs-5">{drone.name || drone.model || 'Unnamed'}</div>
                                                        <div className="text-muted">{drone.serial_number || drone.code || ''}</div>
                                                    </div>
                                                </div>
                                                <div className="mb-2">
                                                    <strong>{Tools.translate('STATUS') || 'Status'}:</strong> {drone.status || 'unknown'}
                                                </div>
                                                <div>
                                                    <strong>{Tools.translate('LAST_SEEN') || 'Last seen'}:</strong> {drone.last_seen || '—'}
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

export default MyDrones;
