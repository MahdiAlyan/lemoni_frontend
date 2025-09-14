import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMissionById } from '../../calls/Api';
import Tools from '../../config/Tools';

const MissionDetails = () => {
    const { id } = useParams();
    const [mission, setMission] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        const fetch = async () => {
            try {
                const resp = await getMissionById(id);
                const data = resp?.data ?? resp;
                if (mounted) setMission(data);
            } catch (e) {
                console.error('Failed to load mission', e);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        fetch();
        return () => mounted = false;
    }, [id]);

    if (loading) return <div className="text-center py-10">{Tools.translate('PLEASE_WAIT')}</div>;
    if (!mission) return <div className="text-center py-10">{Tools.translate('MISSION_NOT_FOUND') || 'Mission not found'}</div>;

    return (
        <div className="col-xl-12">
            <div className="card card-xl-stretch mb-5 mb-xl-8">
                <div className="card-header align-items-center py-5 gap-2 gap-md-5 border-0">
                    <div className="card-title">
                        <h3 className="fw-bold">{mission.title || mission.name}</h3>
                    </div>
                    <div className="card-toolbar">
                        <Link to="/missions" className="btn btn-light btn-sm">{Tools.translate('BACK') || 'Back'}</Link>
                    </div>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-4">
                            <img src={mission.image || '/assets/media/logos/icon.png'} className="img-fluid" alt={mission.title} />
                        </div>
                        <div className="col-md-8">
                            <dl className="row">
                                <dt className="col-sm-4">{Tools.translate('CODE') || 'Code'}</dt>
                                <dd className="col-sm-8">{mission.code || '-'}</dd>

                                <dt className="col-sm-4">{Tools.translate('STATUS') || 'Status'}</dt>
                                <dd className="col-sm-8">{mission.status || '-'}</dd>

                                <dt className="col-sm-4">{Tools.translate('STARTED_AT') || 'Started at'}</dt>
                                <dd className="col-sm-8">{mission.started_at || '-'}</dd>

                                <dt className="col-sm-4">{Tools.translate('DESCRIPTION') || 'Description'}</dt>
                                <dd className="col-sm-8">{mission.description || '-'}</dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MissionDetails;
