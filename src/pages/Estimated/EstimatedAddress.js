import { useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AppContext } from '../../context/Context';

export default function EstimatedAddress() {
    const navigate = useNavigate();
    const { userAddress, completeAddress } = useContext(AppContext);

    const zoom = 21;
    const size = "600x400";
    const fov = 30;
    const pitch = 0;
    const markerColor = "red";
    const lat = completeAddress?.geo?.[0]?.toFixed(5);
    const long = completeAddress?.geo?.[1]?.toFixed(5);
    const [heading, setHeading] = useState(0);

    const apikey = process.env.REACT_APP_GOOGLE_MAP_API_KEY;

    const handleDirectionClick = (angle) => {
        setHeading(angle);
    };

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
                    <div className='d-flex justify-content-center align-items-center text-center mt-4 w-100'>
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
                                            <button onClick={() => navigate('/map')} className="button-element">
                                                That’s Right
                                                <i className="fas fa-long-arrow-alt-right ms-2" style={{ fontSize: '30px' }}></i>
                                            </button>
                                        </div>

                                        <div className="mt-3">
                                            <a onClick={() => navigate('/')} className="buttons-elemented d-flex align-items-center text-decoration-none fw-bold">
                                                <i className="fas fa-long-arrow-alt-left me-2" style={{ fontSize: '30px' }}></i>
                                                That’s Not Right
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-6 d-flex justify-content-center align-items-center mt-4">
                                    <div className="d-flex flex-row justify-content-center align-items-center flex-wrap gap-3 w-100 position-relative">

                                        <img
                                            src={`https://maps.googleapis.com/maps/api/staticmap?center=${lat},${long}&zoom=${zoom}&size=${size}&maptype=satellite&markers=color:${markerColor}%7C${lat},${long}&key=${apikey}`}
                                            alt='Satellite View'
                                            className="img-fluid"
                                            style={{ width: '48%', borderRadius: '15px', border: '2px solid rgba(255, 166, 0, 1)' }}
                                        />

                                        <div style={{ width: '48%', position: 'relative' }}>
                                            <img
                                                src={`https://maps.googleapis.com/maps/api/streetview?size=${size}&location=${lat},${long}&fov=${fov}&heading=${heading}&pitch=${pitch}&key=${apikey}`}
                                                alt='Street View'
                                                className="img-fluid"
                                                style={{
                                                    width: '100%',
                                                    borderRadius: '15px',
                                                    border: '2px solid rgba(255, 166, 0, 1)',
                                                    transition: '0.5s ease-in-out',
                                                }}
                                            />
                                            <div className="direction-buttons">
                                                <button
                                                    className={heading === 0 ? 'active' : ''}
                                                    onClick={() => handleDirectionClick(0)}
                                                >N</button>
                                                <button
                                                    className={heading === 90 ? 'active' : ''}
                                                    onClick={() => handleDirectionClick(90)}
                                                >E</button>
                                                <button
                                                    className={heading === 180 ? 'active' : ''}
                                                    onClick={() => handleDirectionClick(180)}
                                                >S</button>
                                                <button
                                                    className={heading === 270 ? 'active' : ''}
                                                    onClick={() => handleDirectionClick(270)}
                                                >W</button>
                                            </div>

                                        </div>

                                        <div className="compass-wrapper">
                                            <div className="direction-click-zones">
                                                <div onClick={() => handleDirectionClick(0)} className="dir-btn north" />
                                                <div onClick={() => handleDirectionClick(90)} className="dir-btn east" />
                                                <div onClick={() => handleDirectionClick(180)} className="dir-btn south" />
                                                <div onClick={() => handleDirectionClick(270)} className="dir-btn west" />
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Styles */}
            <style jsx>{`
                @media (max-width: 768px) {
                    .card {
                        width: 90% !important;
                        height: auto !important;
                        padding: 20px !important;
                    }
                    .img-fluid {
                        width: 100% !important;
                        margin-bottom: 10px;
                    }
                }

                .compass-wrapper {
                    position: absolute;
                    bottom: 10px;
                    right: 20px;
                    width: 80px;
                    height: 80px;
                }

                .compass-img {
                    width: 100%;
                    height: 100%;
                    transition: transform 0.4s ease-in-out;
                    cursor: pointer;
                }

                .direction-click-zones {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    grid-template-rows: 1fr 1fr;
                    gap: 0;
                    pointer-events: none;
                }

                .dir-btn {
                    pointer-events: all;
                    opacity: 0;
                }

                .north { grid-area: 1 / 1 / 2 / 3; cursor: pointer; }
                .east { grid-area: 1 / 2 / 3 / 3; cursor: pointer; }
                .south { grid-area: 2 / 1 / 3 / 3; cursor: pointer; }
                .west { grid-area: 1 / 1 / 3 / 2; cursor: pointer; }

                .direction-buttons {
                    position: absolute;
                    bottom: -35px;
                    left: 50%;
                    transform: translateX(-50%);
                    display: flex;
                    gap: 10px;
                }
                .direction-buttons button.active {
                    background-color: orange;
                    color: white;
                    font-weight: bold;
                }

                .direction-buttons button {
                    padding: 2px 10px;
                    font-size: 14px;
                    border: 1px solid orange;
                    background-color: #fff;
                    color: #000;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: background-color 0.3s ease;
                }

                .direction-buttons button:hover {
                    background-color: orange;
                    color: white;
                }
            `}</style>
        </div>
    );
}
