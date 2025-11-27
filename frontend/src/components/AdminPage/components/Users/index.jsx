import { useCallback } from "react";
import { Container, Row, Col } from "reactstrap";
import Table from "../../../Table";
import { useForm } from "react-hook-form";
import styles from "./styles.module.scss";
import { useGetData } from "../../hooks/useGetData";

const Users = () => {
  const { register, handleSubmit, reset } = useForm();
  const { data: usersState, load } = useGetData("users", 10, 1);
  const users = usersState?.data ?? [];

  const addUsers = useCallback(async (formValues) => {
    const jsonData = {
      ...formValues,
      role: { name: "user", scope: "notMember" },
    };

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(jsonData),
      });

      if (response.ok) {
        await response.json();
        alert("User criado com sucesso!");
        reset(); // limpa o formulário
        load(); // recarrega lista
      } else if (response.status === 409) {
        alert("⚠️ User já existe!");
      } else {
        const err = await response.text();
        console.error("Erro no servidor:", err);
        alert(" Erro ao criar User!");
      }
    } catch (error) {
      console.error("Erro:", error);
      alert(" Falha na conexão com o servidor!");
    }
  }, [load, reset]);

  return (
    <Container>
      <Row>
        <Col className={styles.column}>
          <h3>Create User</h3>
          <div className={styles.container}>
            <form className={styles.form} onSubmit={handleSubmit(addUsers)}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="name">
                  Name:
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  {...register("name")}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="password">
                  Password:
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  {...register("password")}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="email">
                  Email:
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  {...register("email")}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="age">
                  Age:
                </label>
                <input id="age" type="number" {...register("age")} />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="address">
                  Address:
                </label>
                <input id="address" required {...register("address")} />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="country">
                  Country:
                </label>
                <input id="country" required {...register("country")} />
              </div>

              <Row>
                <input className="submit" type="submit" value="Create User" />
              </Row>
            </form>
          </div>
        </Col>

        <Col>
          <Table columns={["name", "email"]} rows={users} />
        </Col>
      </Row>
    </Container>
  );
};

export default Users;
