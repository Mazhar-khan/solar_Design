import react, { useContext } from 'react';
import { Chart } from "react-google-charts";
// import { AppContext } from '../../context/Context';
import { AppContext } from "../../../context/Context";





export default function BuildingInsightSecondCard() {
  
    const { solarInstallationSize, installationCost, configId, yearlyEnergy, yearlyEnergyCover,
        withSolarCost10, withSolarCost20, withSolarCost30, saving } = useContext(AppContext);

    const data = [
        ["Year", "With Solar", "Without Solar"],
        ["10 Years", installationCost, withSolarCost10 || 0],
        ["20 Years", installationCost, withSolarCost20 || 0],
        ["30 Years", installationCost, withSolarCost30 || 0],
    ];

    const chartOptions = {
        title: "Solar vs Non-Solar Cost Over Time",
        legend: { position: "bottom" },
        curveType: "function",
        colors: ["#f9a825", "#6d4c41"],
        chartArea: {
            left: 40,
            right: 10,
            top: 30,
            bottom: 40,
            width: "100%",
            height: "70%",
        },
        hAxis: {
            title: "Years",
            textStyle: { fontSize: 12 },
        },
        vAxis: {
            title: "Cost (USD)",
            textStyle: { fontSize: 12 },
        },
    };

        const getSystemSizeCategory = () => {
        const maxPanelCount = configId;
        if (!maxPanelCount) return 'N/A';
        if (maxPanelCount <= 12) return 'Small';
        if (maxPanelCount <= 28) return 'Medium';
        if (maxPanelCount <= 60) return 'Large';
        return 'Very Large';
    };
    return (
        <>
            <div
                className="insights-card position-absolute shadow rounded-4 bg-white"
                style={{
                    top: "20px",
                    left: "10px",
                    maxHeight: "520px",
                    width: "330px",
                    zIndex: 1000,
                    overflow: "auto",
                    padding: "16px",
                    scrollbarWidth: "none", // for Firefox
                    msOverflowStyle: "none", // for IE/Edge
                }}
                onScroll={(e) => {
                    e.currentTarget.style.scrollbarWidth = "none";
                }}
            >


                <div className="card-header mb-2">
                    <i className="fas fa-home text-warning"></i>
                    Your Solar Home System
                </div>

                {/* Energy Production */}
                <div className="section-title">Energy Production</div>
                <div className="data-row"><span>Installation Size</span><span className="value">{solarInstallationSize} KW</span></div>
                <div className="data-row"><span>System Size Category</span><span className="value">{getSystemSizeCategory()}</span></div>

                 
                <div className="data-row"><span>Number of Panels</span><span className="value">{configId} Panels</span></div>
                <div className="data-row"><span>Annual Energy Production</span><span className="value">{yearlyEnergy} kWh</span></div>
                <div className="data-row"><span>% Household Electricity Covered</span><span className="value">{yearlyEnergyCover?.toFixed(2)} %</span></div>

                {/* Cost Savings */}
                <div className="section-title">Cost Savings</div>
                <div className="data-row"><span>Cost Without Solar 10 years</span><span className="value">$ {withSolarCost10?.toFixed(2)}</span></div>
                <div className="data-row"><span>Cost Without Solar 20 years</span><span className="value">$ {withSolarCost20?.toFixed(2)}</span></div>
                <div className="data-row"><span>Cost Without Solar 30 years</span><span className="value">$ {withSolarCost30?.toFixed(2)}</span></div>
                <div className="data-row"><span>Total Cost With Solar</span><span className="value">${installationCost}</span></div>
                <div className="data-row"><span>Savings</span><span className="value">${saving?.toFixed(2)}</span></div>
                <div className="data-row"><span>Payback Period</span><span className="value">2030 in 5 years</span></div>

                {/* Chart */}
                <div className="section-title mt-4">Cost Comparison (20 Years)</div>
                <Chart
                    chartType="LineChart"
                    width="100%"
                    height="200px"
                    data={data}
                    options={chartOptions}
                />

                {/* Key Components */}
                <div className="section-title">Key Components</div>
                <div className="data-row"><span>Module/Panel Type</span><span className="value">Monocrystalline</span></div>
                <div className="data-row"><span>Capacity</span><span className="value">375 W</span></div>
                <div className="data-row"><span>Efficiency</span><span className="value">20.5%</span></div>
                <div className="data-row"><span>Efficiency Decline (20 yrs)</span><span className="value">12%</span></div>
                <div className="data-row"><span>Inverter Type</span><span className="value">String Inverter</span></div>
                <div className="data-row"><span>DC-to-AC Conversion</span><span className="value">97%</span></div>
            </div>


        </>
    )
}