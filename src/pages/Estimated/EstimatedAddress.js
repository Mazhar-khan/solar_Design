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
            <div className="main-container">
                <div className="overlay-container content-bg">
                    <div className='d-flex justify-content-center align-items-center text-center mt-4 w-100'>
                        <div className="card card-style">
                            <div className="container-fluid">
                                <div className="row d-flex justify-content-center align-items-center">
                                    <div className="col-md-12 text-center">
                                        <img
                                            src='assets/img/hero-sun.png'
                                            alt='Logo'
                                            className="img-fluid logo-img"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="row g-0 mt-4">
                                <div className="col-md-6 d-flex justify-content-center align-items-center text-center">
                                    <div className="sqs-html-content">
                                        <h3 className="heading-text"><strong>YOUR ADDRESS</strong></h3>
                                        <p className="address-text">
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
                                                <i className="fas fa-long-arrow-alt-right ms-2 icon-large"></i>
                                            </button>
                                        </div>

                                        <div className="mt-3">
                                            <a onClick={() => navigate('/')} className="buttons-elemented d-flex align-items-center text-decoration-none fw-bold">
                                                <i className="fas fa-long-arrow-alt-left me-2 icon-large"></i>
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
                                            className="img-fluid img-satellite"
                                        />

                                        <div className="street-view-wrapper">
                                            <img
                                                src={`https://maps.googleapis.com/maps/api/streetview?size=${size}&location=${lat},${long}&fov=${fov}&heading=${heading}&pitch=${pitch}&key=${apikey}`}
                                                alt='Street View'
                                                className="img-fluid img-street-view"
                                            />
                                            <div className="direction-buttons">
                                                <button className={heading === 0 ? 'active' : ''} onClick={() => handleDirectionClick(0)}>N</button>
                                                <button className={heading === 90 ? 'active' : ''} onClick={() => handleDirectionClick(90)}>E</button>
                                                <button className={heading === 180 ? 'active' : ''} onClick={() => handleDirectionClick(180)}>S</button>
                                                <button className={heading === 270 ? 'active' : ''} onClick={() => handleDirectionClick(270)}>W</button>
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
        </div>
    );
}
