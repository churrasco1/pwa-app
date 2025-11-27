import { Navbar, NavbarBrand } from "reactstrap";
import styles from "./styles.module.scss";

const Header = () => {
  return (
    <Navbar pills={true} className={styles.navBar}>
      <NavbarBrand href="/">Login</NavbarBrand>
      <NavbarBrand href="/">Register</NavbarBrand>
    </Navbar>
  );
};

export default Header;
