import React, { useState } from "react";
import {
  Row,
  Container,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from "reactstrap";
import { Tickets } from "./components/Tickets";
import { Perfil } from "./components/Perfil";
import styles from "./styles.module.scss";
import { useGetPerfil } from "../../hooks/useGetPerfil";
const UserPage = () => {
  const [activePage, setActivePage] = useState("1");
  const { isError, isLoading, user } = useGetPerfil("users");
  const navItems = [
    {
      id: "1",
      title: "Perfil",
    },
    {
      id: "2",
      title: "Tickets",
    }
  ];
  const items = [
    {
      id: "1",
      children: <Perfil user={user.data} />,
    },
    {
      id: "2",
      children: <Tickets />,
    },
  ];
  return (
    <Container className={styles.container}>
      <h1>User {user.data.name}</h1>
      <Row className={styles.row}>
        <Nav tabs>
          {navItems.map((item) => {
            return (
              <NavItem>
                <NavLink
                  className={item.id === activePage}
                  onClick={() => setActivePage(item.id)}
                >
                  {item.title} {item.count && (<span
                    className={styles.count}>{item.count}</span>)}
                </NavLink>
              </NavItem>
            );
          })}
        </Nav>
        <TabContent activeTab={activePage}>
          {items.map((item) => {
            return (
              <TabPane tabId={item.id}>
                {item.children}
              </TabPane>
            );
          })}
        </TabContent>
      </Row>
    </Container>
  );
};
export default UserPage;