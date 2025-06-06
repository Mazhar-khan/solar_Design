import { styled } from '@mui/material/styles';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';

const CustomTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "rgba(20, 30, 60, 0.6)",       
    color: "#e6e6e6",   

    fontSize: '14px',               
    borderRadius: '8px',
    padding: '10px 14px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    fontWeight: "600"
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: '#333333',                
  },
}));

// ✅ Then export it
export default CustomTooltip;
