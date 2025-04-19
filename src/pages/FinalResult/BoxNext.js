import React from 'react'

export default function BoxNext() {
    return (
        <>
            <section className="page-section" style={{ marginTop: '5%' }}>

                <div className="content-wrapper position-relative" style={{ textAlign: "center" }}>
                    <div className="content">
                       
                            <p style={{ textAlign: 'center',color: 'rgba(255, 166, 0, 1)' }}>What Next?</p>
                            <h3 style={{color:'rgba(255, 166, 0, 1)'}}><strong>Next Steps...</strong></h3>
                            <p style={{color: 'rgba(255, 166, 0, 1)'}}>We’ve helped THOUSANDS of homeowners like you, switch to save money & save the environment.</p>
                            <div className="row d-flex align-items-stretch mt-4">
                                {/* Block 1 */}
                                <div className="col-md-4">
                                    <div className="fe-block styled-box h-100"
                                    >
                                        <div className="sqs-block html-block h-100"
                                            style={{
                                                border: "1px solid #d0e375",
                                                borderRadius: "8px",
                                                padding: "10px",
                                                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",

                                                position: "relative",
                                                backgroundImage: `url('./assets/content/boxbg_1.png')`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                                backgroundRepeat: 'no-repeat',
                                                background: 'rgba(253, 119, 1, 1)',
                                            }}>
                                            <div className="sqs-block-content">
                                                <div className="sqs-html-content">
                                                    <img src={'assets/img/box_f.png'}
                                                        style={{ marginTop: '8%', width: '100%', maxWidth: '130px', height: '100%', maxHeight: '115px', }} />

                                                    <p style={{ whiteSpace: "pre-wrap", textAlign: 'center', marginTop: '10%' }}>

                                                        <strong>Grab Your Power Bill</strong>
                                                    </p>


                                                    <p style={{ whiteSpace: "pre-wrap" }}>&nbsp;</p>
                                                    <p style={{ textAlign: 'center', color: 'rgba(238, 238, 238, 1)' }}>
                                                        <span style={{ color: 'rgba(238, 238, 238, 1)', fontSize: '12px' }}>
                                                            We ensure your system is 100%
                                                            accurate for your needs based
                                                            on your personalized energy
                                                            consumption graph shown on
                                                            your power bills. This is to make
                                                            sure it is done right the first time.
                                                        </span>
                                                    </p>
                                                    <p style={{ whiteSpace: "pre-wrap" }}>&nbsp;</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Block 2 */}

                                <div className="col-md-4">
                                    <div className="fe-block styled-box h-100"
                                    >
                                        <div className="sqs-block html-block h-100"
                                            style={{
                                                border: "1px solid #d0e375",
                                                borderRadius: "8px",
                                                padding: "10px",
                                                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                                                position: "relative",
                                                // backgroundImage: `url('assets/content/boxbg_1.png')`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                                backgroundRepeat: 'no-repeat',
                                                background: 'rgba(253, 119, 1, 1)',
                                            }}>

                                            <div className="sqs-html-content">
                                                <img src={'assets/img/boxf_1.png'}
                                                    style={{ marginTop: '8%', width: '100%', maxWidth: '130px', height: '100%', maxHeight: '115px', }} />

                                                <p style={{ whiteSpace: "pre-wrap", textAlign: 'center', marginTop: '10%' }}>

                                                    <strong>View Your Custom Design</strong>
                                                </p>


                                                <p style={{ whiteSpace: "pre-wrap" }}>&nbsp;</p>
                                                <p style={{ textAlign: 'center', color: 'rgba(238, 238, 238, 1)' }}>
                                                    <span style={{ color: 'rgba(238, 238, 238, 1)', fontSize: '12px' }}>
                                                        We build your custom solar design
                                                        based on your needs for you to
                                                        review, and get you speaking
                                                        directly with your local authorized
                                                        installer. your local installer.
                                                    </span>
                                                </p>
                                                <p style={{ whiteSpace: "pre-wrap" }}>&nbsp;</p>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                                {/* Block 3 */}
                                <div className="col-md-4">
                                    <div className="fe-block styled-box h-100"
                                    >
                                        <div className="sqs-block html-block h-100"
                                            style={{
                                                border: "1px solid #d0e375",
                                                borderRadius: "8px",
                                                padding: "10px",
                                                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",

                                                position: "relative",
                                                backgroundImage: `url('./assets/content/boxbg_1.png')`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                                backgroundRepeat: 'no-repeat',
                                                background: 'rgba(253, 119, 1, 1)',
                                            }}>
                                            <div className="sqs-block-content">
                                                <div className="sqs-html-content">
                                                    <img src={'assets/img/boxf_2.png'}
                                                        style={{ marginTop: '8%', width: '100%', maxWidth: '130px', height: '100%', maxHeight: '115px', }} />

                                                    <p style={{ whiteSpace: "pre-wrap", textAlign: 'center', marginTop: '10%' }}>

                                                        <strong>Schedule Your Site Survey</strong>
                                                    </p>


                                                    <p style={{ whiteSpace: "pre-wrap" }}>&nbsp;</p>
                                                    <p style={{ textAlign: 'center', color: 'rgba(238, 238, 238, 1)' }}>
                                                        <span style={{ color: 'rgba(238, 238, 238, 1)', fontSize: '12px' }}>
                                                            Once you are happy with your
                                                            customized solar plan, we’ll take
                                                            care of the rest, including permitting,
                                                            install, and notifying your power
                                                            company.
                                                        </span>
                                                    </p>
                                                    <p style={{ whiteSpace: "pre-wrap" }}>&nbsp;</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div> {/* End of row */}
                        
                    </div>
                </div>
            </section>
        </>
    )
}
