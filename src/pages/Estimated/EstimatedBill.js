import { useNavigate } from 'react-router-dom';
import { useState, useContext } from 'react';
import { AppContext } from '../../context/Context';

export default function EstimatedBill() {
    const navigate = useNavigate();
    const { data, setData } = useContext(AppContext); // Use context to get data
    const [averageBill, setAverageBill] = useState(data.userInfo.monthly || 0); // Default value for the average bill

    const handleInputChange = (event) => {
        const newAverageBill = event.target.value;
        setAverageBill(newAverageBill); // Update the average bill based on input value
        setData(prevData => ({
            ...prevData,
            userInfo: {
                ...prevData.userInfo,
                monthly: newAverageBill // Update the average bill in context
            }
        }));
    };

    const handleNextClick = () => {
        if (averageBill <= 0) {
            alert("Please enter a valid average electricity bill before proceeding."); // Alert the user
            return; // Prevent navigation
        }

        console.log("Average Electricity Bill:", averageBill);
        console.log("Location Info:", data.locationInfo);
        console.log("Building Insights:", data.buildingInsights);

        navigate('/final'); // Navigate to the final page
    };

    return (
        <>
            <div
                style={{
                    height: "100vh",
                    backgroundImage: "url(assets/img/hero-section.png)",
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                }}
                className="position-relative w-100"
            >
                <div
                    className="position-absolute text-white d-flex flex-column align-items-center justify-content-center"
                    style={{
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 0,
                    }}
                >
                    <div className="card" style={{ width: '50%', height: 'auto', padding: '10px' }}>
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
                        <h2 style={{ textAlign: 'center', marginTop: '2%', fontSize: '20px', fontWeight: '600' }}>
                            Monthly electricity bill.
                        </h2>
                        <div className="row g-0" style={{ marginTop: '6%' }}>
                            <div className="col-md-12 d-flex flex-column justify-content-center align-items-center text-center">
                                <label className="form-label">Electricity Bill</label>
                                <input
                                    type="number"
                                    className="form-control bill-s"
                                    placeholder="Enter your bill here"
                                    value={averageBill}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                        <div className="d-flex align-items-center text-muted small" style={{ marginLeft: '8%' }}>
                            <i className="fa fa-info-circle me-2"></i>
                            <span>Your information will remain confidential</span>
                        </div>
                        <div className="d-flex flex-column justify-content-center align-items-center text-center mt-2">
                            <a
                                onClick={handleNextClick}
                                className="button-elementd"
                            >
                                NEXT
                            </a>
                        </div>
                        <div className="d-flex flex-column justify-content-center align-items-center text-center mt-3">
                            <a
                                onClick={() => navigate('/estimatedaddress')}
                                style={{ color: 'rgba(255, 166, 0, 1)', textDecoration: 'underline', cursor: 'pointer' }}
                            >
                                back
                            </a>
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
        </>
    );
}