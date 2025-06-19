import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LoadScript } from '@react-google-maps/api';
import AddressInputPage from "./pages/address-input/AddressInputPage";
import ConfirmAddressPage from "./pages/confirm-address/ConfirmAddressPage";
import SolarCalculator from "./pages/solar-calculator/SolarCalculator";

const libraries = ['places', 'geometry','visualization'];

function App() {
  return (
    <Router>
      <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAP_API_KEY} libraries={libraries}>
        <div className="App">
          <Routes>
            <Route path="/" element={<AddressInputPage />} />
            <Route path="/confirm-address" element={<ConfirmAddressPage />} />
            <Route path="/solar-calculator" element={ <SolarCalculator /> } />
          </Routes>
        </div>
      </LoadScript>
    </Router>
  );
}

export default App;