

import Logo from "/src/assets/images/logos/logo.png";
import { Link } from "react-router";
const FullLogo = () => {
  return (
    <Link to={"/"}>
      <img src={Logo} alt="logo" className="block" width={200}/>
    </Link>
  );
};

export default FullLogo;
