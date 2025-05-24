import { useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AppContext } from '../../context/Context';

export default function EstimatedAddress() {
    const navigate = useNavigate();
    const { data, buildingInsights, userAddress, completeAddress } = useContext(AppContext);
    const [zoom] = useState(21);
    const [size] = useState("600x400");
    const [markerColor] = useState("red");
    const apikey = process.env.REACT_APP_GOOGLE_MAP_API_KEY;
    const [lat] = useState(completeAddress["geo"][0].toFixed(5));
    const [long] = useState(completeAddress["geo"][1].toFixed(5));

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
                                            <a onClick={() => navigate('/map')} className="button-element">
                                                That’s Right
                                                <i className="fas fa-long-arrow-alt-right ms-2" style={{ fontSize: '30px' }}></i>
                                            </a>
                                        </div>

                                        <div className="mt-3">
                                            <a onClick={() => navigate('/')} className="buttons-elemented d-flex align-items-center text-decoration-none fw-bold">
                                                <i className="fas fa-long-arrow-alt-left me-2" style={{ fontSize: '30px' }}></i>
                                                That’s Not Right
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                {/* Images Section */}
                                <div className="col-md-6 d-flex justify-content-center align-items-center mt-4">
                                    <div className="d-flex flex-row flex-wrap justify-content-center align-items-center w-100 gap-3">
                                        {/* Satellite View */}
                                        <img
                                            src={`https://maps.googleapis.com/maps/api/staticmap?center=${lat},${long}&zoom=${zoom}&size=${size}&maptype=satellite&markers=color:${markerColor}%7C${lat},${long}&key=${apikey}`}
                                            alt='Satellite View'
                                            className="img-fluid"
                                            style={{ width: '48%', borderRadius: '15px', border: '2px solid rgba(255, 166, 0, 1)' }}
                                        />

                                        {/* Street View map should place below of this line */}
                                        {/* Street View View */}
                                        <img
                                            src={`https://maps.googleapis.com/maps/api/streetview?size=${size}&location=${lat},${long}&fov=30&heading=270&pitch=0&key=${apikey}`}
                                            alt='Street View'
                                            className="img-fluid"
                                            style={{ width: '48%', borderRadius: '15px', border: '2px solid rgba(255, 166, 0, 1)' }}
                                        />


                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Responsive override */}
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
            `}</style>
        </div>
    );
}
