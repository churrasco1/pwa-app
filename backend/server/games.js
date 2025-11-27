// server/games.js
const bodyParser = require("body-parser");
const express = require("express");
const Games = require("../data/games");
const Users = require("../data/users");
const scopes = require("../data/users/scopes");
const VerifyToken = require("../middleware/token");
const cookieParser = require("cookie-parser");

// >>> agora o router recebe io
const GamesRouter = (io) => {
  const router = express();

  router.use(bodyParser.json({ limit: "100mb" }));
  router.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));
  router.use(cookieParser());
  router.use(VerifyToken);

  // Rota base /games
  router
    .route("/")
    // Criar jogo (Admin)
    .post(Users.autorize([scopes.Admin]), function (req, res) {
      const body = req.body;

      Games.create(body)
        .then((game) => {
          console.log("Game created:", game);

          // >>> emite notificação para todos os clientes
          // canal: 'admin_notifications' (podes ajustar o nome)
          io.sockets.emit("admin_notifications", {
            key: "Game",
            type: "game_created",
            message: "New game created",
            game, // payload útil no cliente
          });

          res.status(200).send({
            message: "Game created successfully",
            game,
          });
        })
        .catch((err) => {
          console.error("Error creating game:", err);
          if (err.includes && err.includes("duplicate")) {
            res.status(409).send({ error: "Game already exists" });
          } else {
            res.status(500).send({ error: "Error creating game" });
          }
        });
    })
    // Listar todos os jogos (Admin, Member, NonMember)
    .get(
      Users.autorize([scopes.Admin, scopes.Member, scopes.NonMember]),
      function (req, res) {
        const pageLimit = req.query.limit ? parseInt(req.query.limit) : 5;
        const pageSkip = req.query.skip
          ? pageLimit * parseInt(req.query.skip)
          : 0;

        req.pagination = { limit: pageLimit, skip: pageSkip };

        Games.findAll(req.pagination)
          .then((games) => {
            const response = { auth: true, ...games };
            res.send(response);
          })
          .catch((err) => {
            console.error(err.message);
            res.status(500).send({ error: err.message });
          });
      }
    );

  // Rotas com ID do jogo
  router
    .route("/:gameId")
    .get(function (req, res) {
      const gameId = req.params.gameId;

      Games.find(gameId)
        .then((game) => res.status(200).send(game))
        .catch((err) => {
          console.error(err.message);
          res.status(404).send({ error: "Game not found" });
        });
    })
    .put(Users.autorize([scopes.Admin]), function (req, res) {
      const gameId = req.params.gameId;
      const body = req.body;

      Games.update(gameId, body)
        .then((updatedGame) => res.status(200).send(updatedGame))
        .catch((err) => {
          console.error(err.message);
          res.status(404).send({ error: "Game not found or not updated" });
        });
    });

  return router;
};

module.exports = GamesRouter;
