import React, { useEffect } from 'react';

export default function SolarEstimated() {
    useEffect(() => {
        // Initialize Bootstrap tooltips
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new window.bootstrap.Tooltip(tooltipTriggerEl); // Use window.bootstrap
        });
    }, []);

    return (
        <>
            <section style={{ marginTop: '3%' }}>
                <div className="content-wrapper py-5" style={{ maxWidth: '100%', maxHeight: '100%' }}>
                    <div data-fluid-engine="true">
                        <div className="container">
                            <p style={{ color: 'rgba(255, 166, 0, 1)', fontWeight: '600' }}>My Solar Estimate</p>
                            <h3 style={{ fontWeight: '700', fontSize: '36px', }}>Estimated System Size,<br />
                                Savings & Incentives.</h3>
                            <p style={{ color: 'rgba(0, 0, 0, 1)', fontSize: '16px', }}>The benefits of solar power stretch far beyond its already amazing environmental impact.<br />
                                Solar can help you save money, increase your home value, and opens you up to existing<br />
                                government tax credits.</p>
                            <p style={{ color: 'rgba(0, 0, 0, 1)', fontSize: '16px' }}><strong>604 Northeast Thames Drive, Lee's Summit, MO 64086, USA</strong></p>
                        </div>
                    </div>
                </div>
            </section>

            <section >

                <div className="content-wrapper" style={{ maxWidth: '100%', maxHeight: '100%' }}>

                    <div className="container"
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 1)',
                            borderRadius: '10px',
                            border: '2px solid rgba(255, 166, 0, 1)',
                            boxShadow: '2px 5px 22.6px 0px rgba(0, 0, 0, 0.25)',

                        }}>
                        <div className="row" style={{ padding: '20px' }}>
                            <div className="col-12">
                                <img src={'assets/img/final_solarsystem.png'}
                                    style={{ width: '100%', height: 'auto', }} />
                            </div>
                        </div>

                        <div className="container mt-5">
                            <div className="row justify-content-center d-flex">
                                <div className="col-md-6 mb-4 d-flex flex-column">
                                    <div
                                        className="info-box d-flex align-items-center flex-grow-1"
                                        style={{ marginLeft: '5%' }}
                                        data-bs-toggle="tooltip"
                                        data-bs-placement="top"
                                        data-bs-html="true"
                                        title='<div style="display: flex; align-items: center;"><i class="fa fa-info-circle mr-4"></i> The estimated number of panels your home will require to meet your energy needs.</div>'>
                                        <img
                                            src="assets/img/size_system.png"
                                            alt="System Size"
                                            style={{ width: '130px', height: 'auto', marginRight: '15px' }}
                                        />
                                        <div>
                                            <h2 style={{ color: 'rgba(255, 166, 0, 1)', fontSize: '34px', fontWeight: '800', marginBottom: '5px', textAlign: 'left' }}>
                                                <strong> System Details</strong>
                                            </h2>
                                            <ul style={{ color: 'rgba(253, 119, 1, 1)', listStyleType: 'none', paddingLeft: '0', marginTop: '3%' }}>
                                                <li style={{ marginBottom: '8px', textAlign: 'left' }}>Size (KW)</li>
                                                <li style={{ marginBottom: '8px', textAlign: 'left' }}>Panels (#, maker, size, efficiency)</li>
                                                <li style={{ marginBottom: '8px', textAlign: 'left' }}>Annual generation, estimated (KWh)</li>
                                                <li style={{ marginBottom: '8px', textAlign: 'left' }}>Inverter (maker and efficiency)</li>
                                                <li style={{ marginBottom: '8px', textAlign: 'left' }}>Percentage of annual electricity use</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <hr style={{
                                        border: 'none',
                                        height: '1px',
                                        width: '400px',
                                        marginLeft: '6%',
                                        background: 'repeating-linear-gradient(90deg, #000, #000 6px, transparent 6px, transparent 12px)',
                                    }} />
                                </div>

                                <div className="col-md-6 mb-4 d-flex flex-column">
                                    <div className="info-box d-flex align-items-center flex-grow-1"
                                        style={{ marginLeft: '5%' }}
                                        data-bs-toggle="tooltip"
                                        data-bs-html="true"
                                        title='<div style="display: flex; align-items: center;"><i class="fa fa-info-circle mr-4"></i> The estimated number of panels your home will require to meet your energy needs.</div>'>
                                        <img
                                            src="assets/img/incentives.jpg"
                                            alt="System Size"
                                            style={{ width: '130px', height: 'auto', marginRight: '15px' }}
                                        />
                                        <div>
                                            <h2 style={{ color: 'rgba(255, 166, 0, 1)', fontSize: '34px', fontWeight: '800', marginBottom: '5px', textAlign: 'left' }}>
                                                <strong> Incentives</strong>
                                            </h2>
                                            <ul style={{ color: 'rgba(253, 119, 1, 1)', listStyleType: 'none', paddingLeft: '0', marginTop: '3%' }}>
                                                <li style={{ marginBottom: '8px', textAlign: 'left' }}>Federal Incentive (FTC)</li>
                                                <li style={{ marginBottom: '8px', textAlign: 'left' }}>State Incentives (over 10 years, estimated)</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <hr style={{
                                        border: 'none',
                                        height: '1px',
                                        width: '400px',
                                        marginLeft: '6%',
                                        background: 'repeating-linear-gradient(90deg, #000, #000 6px, transparent 6px, transparent 12px)',
                                    }} />
                                </div>
                            </div>
                        </div>

                        <div className="container mt-5">
                            <div className="row justify-content-center d-flex">
                                <div className="col-md-6 mb-4 d-flex flex-column">
                                    <div
                                        className="info-box d-flex align-items-center flex-grow-1"
                                        style={{ marginLeft: '5%' }}
                                        data-bs-toggle="tooltip"
                                        data-bs-placement="top"
                                        data-bs-html="true"
                                        title='<div style="display: flex; align-items: center;"><i class="fa fa-info-circle mr-4"></i> The estimated number of panels your home will require to meet your energy needs.</div>'>
                                        <img
                                            src="assets/img/roi_icon.png"
                                            alt="System Size"
                                            style={{ width: '130px', height: 'auto', marginRight: '15px' }}
                                        />
                                        <div>
                                            <h2 style={{ color: 'rgba(255, 166, 0, 1)', fontSize: '34px', fontWeight: '800', marginBottom: '5px', textAlign: 'left' }}>
                                                <strong> ROI</strong>
                                            </h2>
                                        </div>
                                    </div>
                                    <hr style={{
                                        border: 'none',
                                        height: '1px',
                                        width: '400px',
                                        marginLeft: '6%',
                                        background: 'repeating-linear-gradient(90deg, #000, #000 6px, transparent 6px, transparent 12px)',
                                    }} />
                                </div>

                                <div className="col-md-6 mb-4 d-flex flex-column">
                                    <div className="info-box d-flex align-items-center flex-grow-1"
                                        style={{ marginLeft: '5%' }}
                                        data-bs-toggle="tooltip"
                                        data-bs-placement="top"
                                        data-bs-html="true"
                                        title='<div style="display: flex; align-items: center;"><i class="fa fa-info-circle mr-4"></i> The estimated number of panels your home will require to meet your energy needs.</div>'>
                                        <img
                                            src="assets/img/dollar_icon.png"
                                            alt="System Size"
                                            style={{ width: '130px', height: 'auto', marginRight: '15px' }}
                                        />
                                        <div>
                                            <h2 style={{ color: 'rgba(255, 166, 0, 1)', fontSize: '34px', fontWeight: '800', marginBottom: '5px', textAlign: 'left' }}>
                                                <strong>Savings</strong>
                                            </h2>
                                            <ul style={{ color: 'rgba(253, 119, 1, 1)', listStyleType: 'none', paddingLeft: '0', marginTop: '3%' }}>
                                                <li style={{ marginBottom: '8px', textAlign: 'left' }}>Total Avoided electric utility costs</li>
                                                <li style={{ marginBottom: '8px', textAlign: 'left' }}>Net savings</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <hr style={{
                                        border: 'none',
                                        height: '1px',
                                        width: '400px',
                                        marginLeft: '6%',
                                        background: 'repeating-linear-gradient(90deg, #000, #000 6px, transparent 6px, transparent 12px)',
                                    }} />
                                </div>
                            </div>
                        </div>

                        <div className="container mt-5">
                            <div className="row justify-content-center d-flex">
                                <div className="col-md-6 mb-4 d-flex flex-column">
                                    <div className="info-box d-flex align-items-center flex-grow-1"
                                        style={{ marginLeft: '5%' }}
                                        data-bs-toggle="tooltip"
                                        data-bs-placement="top"
                                        data-bs-html="true"
                                        title='<div style="display: flex; align-items: center;"><i class="fa fa-info-circle mr-4"></i> The estimated number of panels your home will require to meet your energy needs.</div>'>
                                        <img
                                            src="assets/img/cost.webp"
                                            alt="System Size"
                                            style={{ width: '130px', height: 'auto', marginRight: '15px' }}
                                        />
                                        <div>
                                            <h2 style={{ color: 'rgba(255, 166, 0, 1)', fontSize: '34px', fontWeight: '800', marginBottom: '5px', textAlign: 'left' }}>
                                                <strong> Costs</strong>
                                            </h2>
                                            <ul style={{ color: 'rgba(253, 119, 1, 1)', listStyleType: 'none', paddingLeft: '0', marginTop: '3%' }}>
                                                <li style={{ marginBottom: '8px', textAlign: 'left' }}>Price Per Watt (PPW):</li>
                                                <li style={{ marginBottom: '8px', textAlign: 'left' }}>Install Cost, Solar Home System</li>
                                                <li style={{ marginBottom: '8px', textAlign: 'left' }}>EV Charger</li>
                                                <li style={{ marginBottom: '8px', textAlign: 'left' }}>Total: Solar + EV Charger</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <hr style={{
                                        border: 'none',
                                        height: '1px',
                                        width: '400px',
                                        marginLeft: '6%',
                                        background: 'repeating-linear-gradient(90deg, #000, #000 6px, transparent 6px, transparent 12px)',
                                    }} />
                                </div>

                                <div className="col-md-6 mb-4 d-flex flex-column">
                                    <div className="info-box d-flex align-items-center flex-grow-1"
                                        style={{ marginLeft: '5%' }}
                                        data-bs-toggle="tooltip"
                                        data-bs-placement="top"
                                        data-bs-html="true"
                                        title='<div style="display: flex; align-items: center;"><i class="fa fa-info-circle mr-4"></i> The estimated number of panels your home will require to meet your energy needs.</div>'>
                                        <img
                                            src="assets/img/financing.png"
                                            alt="System Size"
                                            style={{ width: '130px', height: 'auto', marginRight: '15px' }}
                                        />
                                        <div>
                                            <h2 style={{ color: 'rgba(255, 166, 0, 1)', fontSize: '34px', fontWeight: '800', marginBottom: '5px', textAlign: 'left' }}>
                                                <strong> Financing</strong>
                                            </h2>
                                            <ul style={{ color: 'rgba(253, 119, 1, 1)', listStyleType: 'none', paddingLeft: '0', marginTop: '3%' }}>
                                                <li style={{ marginBottom: '8px', textAlign: 'left' }}>Loan APR</li>
                                                <li style={{ marginBottom: '8px', textAlign: 'left' }}>Monthly Payment (by 10, 15, and 20 yr term)</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <hr style={{
                                        border: 'none',
                                        height: '1px',
                                        width: '400px',
                                        marginLeft: '6%',
                                        background: 'repeating-linear-gradient(90deg, #000, #000 6px, transparent 6px, transparent 12px)',
                                    }} />
                                </div>
                            </div>
                        </div>

                        <div className="container mt-5">
                            <div className="row justify-content-center d-flex">
                                <div className="col-md-6 mb-4 d-flex flex-column">
                                    <div className="info-box d-flex align-items-center flex-grow-1"
                                        style={{ marginLeft: '5%' }}
                                        data-bs-toggle="tooltip"
                                        data-bs-placement="top"
                                        data-bs-html="true"
                                        title='<div style="display: flex; align-items: center;"><i class="fa fa-info-circle mr-4"></i> The estimated number of panels your home will require to meet your energy needs.</div>'>
                                        <img
                                            src="assets/img/environmentalbenefit.png"
                                            alt="System Size"
                                            style={{ width: '130px', height: 'auto', marginRight: '15px' }}
                                        />
                                        <div>
                                            <h2 style={{ color: 'rgba(255, 166, 0, 1)', fontSize: '28px', fontWeight: '800', marginBottom: '5px', textAlign: 'left' }}>
                                                <strong>Environmental Benefit</strong>
                                            </h2>
                                            <ul style={{ color: 'rgba(253, 119, 1, 1)', listStyleType: 'none', paddingLeft: '0', marginTop: '3%' }}>
                                                <li style={{ marginBottom: '8px', textAlign: 'left' }}>CO2 savings, over 20 years</li>
                                                <li style={{ marginBottom: '8px', textAlign: 'left' }}>Reduction in average household carbon footprint (%)</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <hr style={{
                                        border: 'none',
                                        height: '1px',
                                        width: '400px',
                                        marginLeft: '6%',
                                        background: 'repeating-linear-gradient(90deg, #000, #000 6px, transparent 6px, transparent 12px)',
                                    }} />
                                </div>

                                <div className="col-md-6 mb-4 d-flex flex-column">
                                    <div className="info-box d-flex align-items-center flex-grow-1"
                                        style={{ marginLeft: '5%' }}
                                        data-bs-toggle="tooltip"
                                        data-bs-placement="top"
                                        data-bs-html="true"
                                        title='<div style="display: flex; align-items: center;"><i class="fa fa-info-circle mr-4"></i> The estimated number of panels your home will require to meet your energy needs.</div>'>
                                        <img
                                            src="assets/img/electricity_icon.png"
                                            alt="System Size"
                                            style={{ width: '130px', height: 'auto', marginRight: '15px' }}
                                        />
                                        <div>
                                            <h2 style={{ color: 'rgba(253, 119, 1, 1)', fontSize: '34px', fontWeight: '800', marginBottom: '5px', textAlign: 'left' }}>
                                                <strong>$82,500*</strong>
                                            </h2>
                                            <h5 style={{ color: 'rgba(253, 119, 1, 1)', fontWeight: '700', marginBottom: '8px', textAlign: 'left' }}>
                                                <strong>Total Electricity Cost <br /> Without Solar</strong>
                                            </h5>
                                        </div>
                                    </div>
                                    <hr style={{
                                        border: 'none',
                                        height: '1px',
                                        width: '400px',
                                        marginLeft: '6%',
                                        background: 'repeating-linear-gradient(90deg, #000, #000 6px, transparent 6px, transparent 12px)',
                                    }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
