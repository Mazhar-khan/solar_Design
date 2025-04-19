import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LoadScript } from '@react-google-maps/api';
import Estimated from "./pages/Estimated/Estimated";
import EstimatedAddress from "./pages/Estimated/EstimatedAddress";
import EstimatedBill from "./pages/Estimated/EstimatedBill";
import FinalResult from "./pages/FinalResult/FinalResult";
import Final from "./pages/FinalResult/Final";
import FinalPurposal from "./pages/FinalPurposal/FinalPurposal";


function App() {
  return (
    <Router>
      <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAP_API_KEY} 
      libraries={['places','geometry']}>
        <div className="App">
          <Routes>
            <Route path="/" element={<Estimated />} />
            <Route path="/home-address" element={<EstimatedAddress />} />
            <Route path="/estimatedbill" element={<EstimatedBill />} />
            <Route path="/finalresult" element={<FinalResult />} />
            <Route path="/get-purposal" element={<Final />} />
            <Route path="/finalpurposal" element={<FinalPurposal />} />
          </Routes>
        </div>
      </LoadScript>
    </Router>
  );
}

export default App;