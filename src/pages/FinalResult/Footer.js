import React from 'react'

export default function Footer() {
    return (
        <>
            <section style={{ marginTop: '3%' }}>

                <div data-fluid-engine="true">
                        <div className="hero">  </div>
                        {/* Footer Section */}
                        <div className="footers">
                            <div className="row">
                                <div className="col-md-5">
                                    <div className="logo">
                                        <img src="assets/img/hero-sun.png" alt="Logo" />
                                    </div>
                                </div>
                                <div className="col-md-7">
                                    <div className="disclaimer">
                                        All numbers displayed are estimates based on the information you provided.
                                        A <br />member of our sales team will contact you to gather more details to
                                        refine your <br />quote further.
                                    </div>
                                </div>
                            </div>
                            <div className="row mt-5">
                                <div className="col-md-5">
                                    <p>All Rights Reserved. Copyright Revolution Solar.</p>
                                </div>
                                <div className="col-md-7">
                                    <div className="links">
                                        <a href="/" style={{color: ' rgba(253, 119, 1, 1)'}}>Privacy Policy</a>
                                        //
                                        <a href="/" style={{color: ' rgba(253, 119, 1, 1)'}}>Terms of Service</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
            </section>
        </>
    )
}
