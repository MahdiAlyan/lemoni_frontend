import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDroneById } from '../../calls/Api';
import Tools from '../../config/Tools';

const DroneProfile = () => {
    const { id } = useParams();
    const [drone, setDrone] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        const fetch = async () => {
            try {
                const resp = await getDroneById(id);
                const data = resp?.data ?? resp;
                if (mounted) setDrone(data);
            } catch (e) {
                console.error('Failed to load drone', e);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        fetch();
        return () => mounted = false;
    }, [id]);

    if (loading) return <div className="text-center py-10">{Tools.translate('PLEASE_WAIT')}</div>;
    if (!drone) return <div className="text-center py-10">{Tools.translate('DRONE_NOT_FOUND') || 'Drone not found'}</div>;

    return (
        <div className="col-xl-12">
            <div className="card card-xl-stretch mb-5 mb-xl-8">
                <div className="card-header align-items-center py-5 gap-2 gap-md-5 border-0">
                    <div className="card-title">
                        <h3 className="fw-bold">{drone.name || drone.model}</h3>
                    </div>
                    <div className="card-toolbar">
                        <Link to="/my-drones" className="btn btn-light btn-sm">{Tools.translate('BACK') || 'Back'}</Link>
                    </div>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-4">
                            <img src={drone.image || '/assets/media/logos/icon.png'} className="img-fluid" alt={drone.name} />
                        </div>
                        <div className="col-md-8">
                            <dl className="row">
                                <dt className="col-sm-4">{Tools.translate('MODEL') || 'Model'}</dt>
                                <dd className="col-sm-8">{drone.model || '-'}</dd>

                                <dt className="col-sm-4">{Tools.translate('SERIAL_NUMBER') || 'Serial'}</dt>
                                <dd className="col-sm-8">{drone.serial_number || '-'}</dd>

                                <dt className="col-sm-4">{Tools.translate('STATUS') || 'Status'}</dt>
                                <dd className="col-sm-8">{drone.status || '-'}</dd>

                                <dt className="col-sm-4">{Tools.translate('LAST_SEEN') || 'Last seen'}</dt>
                                <dd className="col-sm-8">{drone.last_seen || '-'}</dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DroneProfile;
