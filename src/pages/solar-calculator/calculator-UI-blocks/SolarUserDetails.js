export default function SolarUserDetails({
    showSolarPotential,formData,setFormData,isFormComplete
}) {
    return (
        <>
            {/* Summary Report Generation Section */}
            <div className="mt-4">
                <fieldset className="border rounded p-4 bg-light">
                    <legend className="fs-6 text-muted mb-3">Generate Your Summary Report</legend>

                    {/* Enable Report Message */}
                    <div className="form-check mb-3">
                        <label className="form-check-label text-secondary" htmlFor="generateReport">
                            Receive a personalized summary of your rooftop solar potential via email.
                        </label>
                    </div>

                    {/* Form Fields (only if solar potential shown) */}
                    {showSolarPotential && (
                        <>
                            {/* First Name */}
                            <div className="form-group mb-3">
                                <label htmlFor="firstName" className="form-label text-muted mb-1">
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    id="firstName"
                                    className="form-control"
                                    placeholder="Enter your first name"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                />
                            </div>

                            {/* Last Name */}
                            <div className="form-group mb-3">
                                <label htmlFor="lastName" className="form-label text-muted mb-1">
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    id="lastName"
                                    className="form-control"
                                    placeholder="Enter your last name"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                />
                            </div>

                            {/* Email */}
                            <div className="form-group mb-4">
                                <label htmlFor="email" className="form-label text-muted mb-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    className="form-control"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                className="btn btn-warning w-100"
                                disabled={!isFormComplete}
                                onClick={() => {
                                    // Replace with actual logic
                                    alert("Confirmation email sent!");
                                }}
                            >
                                Send My Report
                            </button>
                        </>
                    )}

                    {/* Example Report Link */}
                    <div className="mt-4 text-center">
                        <a
                            href="/example-summary-report"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-decoration-none text-warning"
                        >
                            📄 View an Example Summary Report
                        </a>
                    </div>
                </fieldset>
            </div>

        </>
    )
}