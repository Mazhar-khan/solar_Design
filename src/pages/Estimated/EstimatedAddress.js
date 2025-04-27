import { useNavigate } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/Context';
import { GoogleMap, Marker, Circle, InfoWindow } from '@react-google-maps/api';

export default function EstimatedAddress() {
    const navigate = useNavigate();
    const { data, buildingInsights, userAddress, completeAddress } = useContext(AppContext); // Use context to get data
    const [zoom, setZoom] = useState(21);
    const [size, setSize] = useState("600x400");
    const [markerColor, setMarkerColor] = useState("red");
    const [apikey, setApikey] = useState("AIzaSyAz5z8de2mOowIGRREyHc3gT1GgmJ3whDg");
    const [lat, setLat] = useState(completeAddress["geo"][0].toFixed(5));
    const [long, setLong] = useState(completeAddress["geo"][1].toFixed(5));

    return (
        <div>
            <div
                style={{
                    height: "110vh",
                    backgroundImage: "url(assets/img/hero-section.png)",
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                }}
                className="position-relative w-100"
            >
                <div
                    className="position-absolute text-white d-flex flex-column align-items-center justify-content-center"
                    style={{ top: 0, right: 0, bottom: 0, left: 0 }}
                >
                    <div className='d-flex justify-content-center align-items-center text-center mt-4'>
                        <div className="card" style={{ width: '90%', height: 'auto', padding: '10px' }}>
                            <div className="container-fluid">
                                <div className="row d-flex justify-content-center align-items-center">
                                    <div className="col-md-12 text-center">
                                        <img
                                            src='assets/img/hero-sun.png'
                                            alt='Logo'
                                            className="img-fluid"
                                            style={{ maxWidth: '100%', maxHeight: '100%' }}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="row g-0 mt-4">
                                <div className="col-md-6 d-flex justify-content-center align-items-center text-center">
                                    <div className="sqs-html-content">
                                        <h3 style={{ whiteSpace: 'pre-wrap', fontSize: '36px', fontWeight: '600' }}>
                                            <strong>YOUR ADDRESS</strong>
                                        </h3>
                                        <p style={{ textAlign: 'center', marginTop: '15%' }}>
                                            {userAddress?.split(',').map((line, index) => (
                                                <span key={index}>
                                                    {line.trim()}
                                                    <br />
                                                </span>
                                            ))}
                                        </p>

                                        <div className="mt-5">
                                            <a
                                                onClick={() => navigate('/get-purposal')}
                                                className="button-element"
                                            >
                                                That’s Right
                                                <i className="fas fa-long-arrow-alt-right ms-2" style={{ fontSize: '30px' }}></i>
                                            </a>
                                        </div>

                                        <div className="mt-3">
                                            <a
                                                onClick={() => navigate('/')}
                                                className="buttons-elemented d-flex align-items-center text-decoration-none fw-bold"
                                            >
                                                <i className="fas fa-long-arrow-alt-left me-2" style={{ fontSize: '30px' }}></i>
                                                That’s Not Right
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-6 d-flex justify-content-center align-items-center text-center mt-4">
                                    <img
                                        src={`https://maps.googleapis.com/maps/api/staticmap?center=${lat},${long}&zoom=${zoom}&size=${size}&maptype=satellite&markers=color:${markerColor}%7C${lat},${long}&key=${apikey}`}
                                        // src={`https://solar.googleapis.com/v1/dataLayers:getRaster?location.latitude=${data?.userInfo.lati.toFixed(5)}&location.longitude=${data?.userInfo.longi.toFixed(5)}&radiusMeters=100&view=FULL_LAYER&layer=SOLAR_POTENTIAL&key=${apikey}`}
                                        alt='Solar Image'
                                        className="img-fluid"
                                        style={{ maxHeight: '95%', maxWidth: '100%', borderRadius: '35% 2% 2% 2%', border: '1px solid rgba(255, 166, 0, 1)', objectFit: 'contain' }}
                                    />
                                    {/* */}

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <style jsx>{`
                @media (max-width: 768px) {
                    .card {
                        width: 90% !important; /* Use !important to ensure it overrides other styles */
                        height: auto !important;
                        padding: 20px !important;
                    }
                }
            `}</style>
        </div>
    );
}