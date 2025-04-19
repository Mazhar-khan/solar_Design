import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AppContext } from '../../context/Context';
import BoxNext from './BoxNext';
import SolarEstimated from './SolarEstimated';
import Graph from './Graph';
import Footer from './Footer';
import axios from 'axios';

export default function FinalResult() {
    const { userId } = useParams();
    const { data } = useContext(AppContext);
    const { userInfo } = data;
    const [apiData, setApiData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`https://kcsundial.com/api/proposalshow/${userId}`);
                setApiData(response.data.data[0]);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchData();
        }
    }, [userId]);

    return (
        <>
            <div
                style={{
                    height: "120vh",
                    backgroundImage:
                        "url(assets/img/hero-section.png)",
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
                        // backgroundColor: "rgba(0, 0, 0, 0.44)"
                    }}
                >

                    <div style={{ marginBottom: '20px' }}>
                        <img src={'assets/img/hero-sun.png'} alt="Favicon" style={{ maxWidth: '100%', height: '20vh',marginTop: '-5rem' }} />
                    </div>
                    <p style={{ textAlign: 'center', color: 'rgba(238, 238, 238, 1)' }}>Hey!</p>
                    <h2 style={{ textAlign: 'center', color: 'rgba(238, 238, 238, 1)', fontSize: '45px', fontWeight: '600' }}>
                        Check Out Your Free Solar Estimate!
                    </h2>
                    <p style={{ textAlign: 'center', color: 'rgba(238, 238, 238, 1)' }}>
                        Tailor made for you using a flat-rate to save you money!
                    </p>
                    <div className="container-fluid d-flex justify-content-center align-items-center mt-3" id='card' style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}>
                        <div id="card" style={{
                            width: '100%',
                            maxWidth: '470px',
                            height: '250px',
                            background: "rgba(255, 255, 255, 0.5)",
                            border: "1px solid rgba(255, 166, 0, 1)",
                            borderRadius: "12px",
                            boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.2)",
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '20px'
                        }}>
                            <div style={{ marginBottom: 10 }}>
                                <img src="assets/img/final_solar.png" alt="Solar Panel Icon" style={{ width: 60, height: 50 }} />
                            </div>
                            <h2 style={{ color: "rgba(253, 119, 1, 1)", fontWeight: "bold", fontSize: "28px" }}>
                                $84 *
                            </h2>
                            <p style={{ fontSize: '22px', color: "rgba(253, 119, 1, 1)", fontWeight: "bold", marginBottom: 10 }}>
                                Monthly Payment
                            </p>
                            <p style={{ fontSize: '12px', color: "black", textAlign: "center", padding: "0 10px" }}>
                                *Estimated cost with financing a 100% energy bill offset. Keep reading to learn more about your system, savings, and additional bonuses.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <BoxNext />
            <SolarEstimated apiData={apiData} />
            <Graph />
            <Footer />
        </>
    )
}
