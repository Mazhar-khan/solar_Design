import React from 'react'

export default function ProposalHeader() {
    return (
        <>

            <nav className="navbar navbar-expand-lg navbar-light bg-light" style={{height: '10vh !important',position: 'sticky !important', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)'}}>
                <div className="container-fluid d-flex justify-content-between align-items-center">
                    {/* Left Side: Company Name */}
                    <a className="navbar-brand" href="#" style={{fontSize: '16px'}}>
                        Powerd by MC3 Solar
                    </a>

                    {/* Center: Company Logo */}
                    <div className="mx-auto">
                        <img
                            src="assets/img/hero-sun.png" // Replace with your logo path
                            alt="Company Logo"
                            style={{ height: '40px' }} 
                        />
                    </div>

                    {/* Right Side: Simple Text */}
                    <span className="navbar-text" style={{fontSize: '16px'}}>
                      User Gmail
                    </span>
                </div>
            </nav>

        </>
    )
}
