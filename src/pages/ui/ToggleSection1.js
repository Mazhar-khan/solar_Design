import React, { useContext } from 'react';
import { AppContext } from '../../context/Context';

export default function ToggleSection1({
    averageBill,
    handleInputChange,
    showSolarPanels,
    toggleSolarPanels,
    buildingInsightss,
    panelCapacity,
    handleChange,
    showMonthlyHeatMap,
    handleMonthlyToggle,
    selectedMonth,
    clearOverlays,
    handleInputBlur,
    setSelectedMonth,
    monthNames,
    showAnnualHeatMap,
    toggleAnnualHeatMap,
    setHitPanelCount
}) {
    const { configId, setConFigID } = useContext(AppContext);

    const updateRangeFunc = (event) => {
        const val = Number(event.target.value);
        console.log("val",val)
        setHitPanelCount(val)
        setConFigID(val);
    };



    return (
        <>
            <div className="section-content ps-4 text-secondary">

                {/* Monthly Electricity Bill */}
                <fieldset className="border rounded p-3 mt-4">
                    <legend className="fs-6 text-muted mb-1">Average Monthly Electricity Bill</legend>
                    <div className="form-group input-group">
                        <input
                            type="number"
                            className="form-control"
                            value={averageBill}
                            onChange={handleInputChange}
                            onBlur={handleInputBlur}
                            min={50}
                            max={500}
                            step={10}
                            style={{ height: '44px' }}
                        />
                        <span className="input-group-text" style={{ height: '44px' }}>$</span>
                    </div>
                    <small className="text-muted mt-1 d-block">
                        Source: U.S. Dept of Energy, residential average
                    </small>
                </fieldset>

                <fieldset className="border rounded p-3 mt-4">
                    <legend className="fs-6 text-muted mb-1">Solar Panels Configuration</legend>

                    <div className="d-flex justify-content-between align-items-center">
                        <span className={`ms-1 ${showSolarPanels ? 'text-warning' : 'text-secondary'}`}>
                            {showSolarPanels ? 'Enabled' : 'Disabled'}
                        </span>
                        <div className="form-check form-switch" style={{ padding: 0 }}>
                            <input
                                className="form-check-input"
                                type="checkbox"
                                style={{ width: '2rem', height: '1rem', cursor: 'pointer' }}
                                checked={showSolarPanels}
                                onChange={toggleSolarPanels}
                            />
                        </div>
                    </div>
                    <small className="text-muted mt-2 d-block">
                        {showSolarPanels
                            ? 'Solar panels are displayed on the map to visualize their layout and potential.'
                            : 'Solar panels are hidden from the map view for a clearer layout.'}
                    </small>
                    {
                        showSolarPanels && (
                            <>
                                <div className="row mt-4 mb-2">
                                    <div className="col-6 text-start">
                                        <strong>Panel Count</strong>
                                    </div>
                                    <div className="col-6 text-end">
                                        {configId} Panels
                                    </div>
                                </div>
                                <input
                                    type="range"
                                    className="form-range"
                                    min="1"
                                    max={buildingInsightss?.solarPotential?.maxArrayPanelsCount}
                                    value={configId}
                                    onChange={updateRangeFunc}
                                />
                                <small className="text-muted d-block mb-3">
                                    Use the slider to adjust the number of panels based on your roof size and preference.
                                </small>

                                {/* Panel Capacity Input */}
                                <div className="mt-3">
                                    <label htmlFor="panelCapacity" className="fs-6 text-dark-emphasis mb-3 ">
                                        Panel Capacity
                                    </label>
                                    <div className="input-group">
                                        <input
                                            readOnly
                                            type="number"
                                            id="panelCapacity"
                                            className="form-control"
                                            value={400}
                                            onChange={handleChange}
                                            style={{ height: '44px' }}
                                        />
                                        <span className="input-group-text" style={{ height: '44px' }}>Watts</span>
                                    </div>
                                    <small className="text-muted mt-1 d-block">
                                        Define the wattage of each solar panel. Typical values range from 250W to 450W.
                                    </small>
                                </div>
                            </>
                        )
                    }
                    {/* Panel Count Display & Slider */}

                </fieldset>




                {/* <legend className="fs-5 text-dark-emphasis mb-3">Solar Panels Configuration</legend> */}

                {/* Toggles */}
                {/* Heatmap Configuration Section */}
                <fieldset className="border rounded p-4 mt-4 bg-light-subtle">
                    <legend className="fs-5 text-dark-emphasis mb-3">Solar Intensity Heatmap</legend>

                    {/* Monthly Heatmap Toggle */}
                    <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-center">
                            <label className="form-label fw-semibold mb-1">
                                Average Monthly Intensity
                            </label>
                            <div className="form-check form-switch" style={{ padding: 0 }}>
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    style={{ width: '2rem', height: '1rem', cursor: 'pointer' }}
                                    checked={showMonthlyHeatMap}
                                    onChange={(e) => handleMonthlyToggle(e.target.checked)}
                                />
                            </div>
                        </div>
                        <span className={`fw-medium ${showMonthlyHeatMap ? 'text-warning' : 'text-secondary'}`}>
                            {showMonthlyHeatMap ? 'Enabled' : 'Disabled'}
                        </span>
                        <small className="text-muted d-block mt-1">
                            {showMonthlyHeatMap
                                ? 'Displays a monthly heatmap of solar energy potential based on selected month.'
                                : 'Monthly heatmap is hidden from the map view.'}
                        </small>
                    </div>

                    {/* Month Dropdown Selector */}
                    {showMonthlyHeatMap && (
                        <div className="mb-4">
                            <label htmlFor="monthDropdown" className="form-label fw-semibold mb-1">
                                Select Month
                            </label>
                            <select
                                id="monthDropdown"
                                className="form-select"
                                value={selectedMonth}
                                onChange={(e) => {
                                    clearOverlays();
                                    setSelectedMonth(e.target.value);
                                }}
                            >
                                {monthNames.map((month) => (
                                    <option key={month} value={month}>
                                        {month}
                                    </option>
                                ))}
                            </select>
                            <small className="text-muted mt-1 d-block">
                                Choose a specific month to visualize the solar intensity trend.
                            </small>
                        </div>
                    )}

                    {/* Annual Heatmap Toggle */}
                    <div>
                        <div className="d-flex justify-content-between align-items-center bg-white">
                            <label className="form-label fw-semibold mb-1">
                                Average Annual Intensity
                            </label>
                            <div className="form-check form-switch" style={{ padding: 0 }}>
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    style={{ width: '2rem', height: '1rem', cursor: 'pointer' }}
                                    checked={showAnnualHeatMap}
                                    onChange={toggleAnnualHeatMap}
                                />
                            </div>
                        </div>
                        <span className={`fw-medium ${showAnnualHeatMap ? 'text-warning' : 'text-secondary'}`}>
                            {showAnnualHeatMap ? 'Enabled' : 'Disabled'}
                        </span>
                        <small className="text-muted d-block mt-1">
                            {showAnnualHeatMap
                                ? 'Displays overall yearly solar flux intensity to understand long-term trends.'
                                : 'Annual heatmap is currently not shown.'}
                        </small>
                    </div>
                </fieldset>

            </div>
        </>
    )
}