import { useEffect, useState } from "react";
import { Container, Row, Col } from "reactstrap";
import { useForm } from "react-hook-form";
import Table from "../../../Table";
import styles from "./styles.module.scss";
import _ from "lodash";

const Games = () => {
  const [games, setGames] = useState({
    data: [],
    pagination: {},
  });

  const { register, handleSubmit, reset } = useForm();

  // Buscar jogos ao carregar
  useEffect(() => {
    fetchGames(10, 1);
  }, []);

  const fetchGames = (pageSize, current) => {
    const url =
      "/api/games?" +
      new URLSearchParams({
        limit: pageSize,
        skip: current - 1,
      });

    fetch(url, { headers: { Accept: "application/json" } })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((response) => {
        const { games: gamesList = [], pagination } = response;
        const auth = response.auth;

        if (auth) {
          setGames({
            data: gamesList,
            pagination: {
              current: current || 1,
              pageSize: pagination?.pageSize || 10,
              total: pagination?.total || gamesList.length,
            },
          });
        }
      })
      .catch((err) => console.error("Error fetching games:", err));
  };

  const addGame = (data) => {
    const jsonData = {
      date: data.date,
      name: data.name,
      image: data.image,
      team: {
        home: data.home,
        visitor: data.visitor,
      },
    };

    fetch("/api/games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jsonData),
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          alert("Game created successfully!");
          reset(); // limpa o form
          fetchGames(10, 1); // atualiza lista
        } else {
          alert("Error creating game: " + data.error);
        }
      })
      .catch((err) => console.error("Network error:", err));
  };

  // Preparar dados para o Table (garantir array)
  const tableRows = Array.isArray(games.data)
    ? games.data.map((g) => ({
        name: g.name,
        date: g.date,
        home: g.team?.home || "",
        visitor: g.team?.visitor || "",
        image: g.image ? <img src={g.image} alt={g.name} width={100} /> : null,
      }))
    : [];

  return (
    <Container>
      <Row>
        <Col md={5} className={styles.column}>
          <h3>Create Game</h3>
          <form className={styles.form} onSubmit={handleSubmit(addGame)}>
            <div className={styles.field}>
              <label>Date:</label>
              <input type="date" {...register("date")} required />
            </div>
            <div className={styles.field}>
              <label>Name:</label>
              <input type="text" {...register("name")} required />
            </div>
            <div className={styles.field}>
              <label>Image URL:</label>
              <input type="text" {...register("image")} required />
            </div>
            <div className={styles.field}>
              <label>Home Team:</label>
              <input type="text" {...register("home")} required />
            </div>
            <div className={styles.field}>
              <label>Visitor Team:</label>
              <input type="text" {...register("visitor")} required />
            </div>
            <Row>
              <input className="submit" type="submit" />
            </Row>
          </form>
        </Col>

        {/* Lista de jogos */}
        <Col md={7}>
          <h3>Games List</h3>
          <Table
            columns={["name", "date", "home", "visitor", "image"]}
            rows={{ data: tableRows }} 
          />
        </Col>
      </Row>
    </Container>
  );
};

export default Games;