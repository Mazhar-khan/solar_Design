import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const data = [
    { year: '2025', solarCost: 3000, withoutSolar: 4000 },
    { year: '2026', solarCost: 3200, withoutSolar: 4200 },
    { year: '2027', solarCost: 3400, withoutSolar: 4500 },
    { year: '2028', solarCost: 3600, withoutSolar: 4800 },
    { year: '2029', solarCost: 3800, withoutSolar: 5100 },
    { year: '2030', solarCost: 4000, withoutSolar: 5400 },
    { year: '2031', solarCost: 4200, withoutSolar: 5700 },
    { year: '2032', solarCost: 4400, withoutSolar: 6000 },
    { year: '2033', solarCost: 4600, withoutSolar: 6300 },
    { year: '2034', solarCost: 4800, withoutSolar: 6600 },
    { year: '2035', solarCost: 5000, withoutSolar: 7000 },
    { year: '2040', solarCost: 6000, withoutSolar: 8000 },
    { year: '2045', solarCost: 7000, withoutSolar: 9000 },
];

export default function Graph() {
    const [chartWidth, setChartWidth] = useState(window.innerWidth > 500 ? 500 : window.innerWidth);

    useEffect(() => {
        const handleResize = () => {
            setChartWidth(window.innerWidth > 1000 ? 1000 : window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <>
            <section className="page-section" style={{ marginTop: '3%' }}>
                <div className="content-wrapper py-5">
                    <div className="container">
                        <div className="row">
                            <div className="col-md-6">
                                <h3 style={{ color: 'rgba(255, 166, 0, 1)', fontSize: '32px' }}>
                                    <strong>Monthly solar generation overlay monthly electricity use</strong>
                                </h3>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ width: '90%', height: 'auto', display: 'flex', justifyContent: 'center', marginTop: '6%' }}>
                                        <BarChart
                                            width={chartWidth} // Use the state variable for width
                                            height={400}
                                            data={data}
                                            margin={{
                                                top: 20,
                                                bottom: 5,
                                            }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="year" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="solarCost" fill="rgba(253, 119, 1, 1)" />
                                            <Bar dataKey="withoutSolar" fill="rgba(255, 166, 0, 1)" />
                                        </BarChart>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <h3 style={{ color: 'rgba(255, 166, 0, 1)', fontSize: '32px' }}>
                                    <strong>Annual utility costs vs cost <br /> of solar</strong>
                                </h3>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ width: '90%', height: 'auto', display: 'flex', justifyContent: 'center', marginTop: '6%' }}>
                                        <BarChart
                                            width={chartWidth} // Use the state variable for width
                                            height={400}
                                            data={data}
                                            margin={{
                                                top: 20,
                                                bottom: 5,
                                            }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="year" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="solarCost" fill="rgba(253, 119, 1, 1)" />
                                            <Bar dataKey="withoutSolar" fill="rgba(255, 166, 0, 1)" />
                                        </BarChart>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}