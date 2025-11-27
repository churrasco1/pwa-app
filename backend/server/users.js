// server/users.js

// Importações de dependências
const bodyParser = require("body-parser");
const express = require("express");
const Members = require("../data/member");
const Users = require("../data/users");
const scopes = require("../data/users/scopes");
const VerifyToken = require("../middleware/token");
const cookieParser = require("cookie-parser");
const User = require("../data/users/users");

// >>> O router agora recebe o objeto io (Socket.IO) como parâmetro
const UsersRouter = (io) => {
  const router = express();

  // Middlewares globais
  router.use(bodyParser.json({ limit: "100mb" }));
  router.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));
  router.use(cookieParser());
  router.use(VerifyToken);

  // --------------------------------------------------------------------
  // Rota GET base - retorna todos os users com nome e email (Admin e Member)
  // --------------------------------------------------------------------
  router
    .route("")
    .get(Users.autorize([scopes.Admin, scopes.Member]), async (req, res) => {
      try {
        const users = await User.find({}, "name email"); // só devolve name e email
        res.json({ auth: true, users }); // resposta formatada
      } catch (err) {
        console.error(err);
        res.status(500).json({ auth: false, message: "Erro ao buscar users" });
      }
    });

  // --------------------------------------------------------------------
  // Rota POST base - criação de utilizador (apenas Admin)
  // --------------------------------------------------------------------
  router
    .route("")
    .post(Users.autorize([scopes.Admin]), function (req, res, next) {
      console.log("Create user");

      // Extrai os dados do corpo do pedido
      const body = req.body;
      const { role } = body;

      console.log(role);

      // Só é permitido criar utilizadores com o scope NonMember
      if (role.scope !== scopes.NonMember) {
        return res
          .status(401)
          .send({ auth: false, message: "Only create NonMembers" });
      }

      // Cria o novo utilizador na base de dados
      Users.create(body)
        .then((user) => {
          console.log("User created:", user);

          // >>> Emite notificação via Socket.IO
          // Canal (evento): 'admin_notifications'
          // Mensagem enviada a todos os clientes conectados
          io.sockets.emit("admin_notifications", {
            key: "User",              // Tipo de entidade afetada
            type: "user_created",     // Tipo de evento
            message: "New user created", // Texto da notificação
            user,                     // Payload (dados do utilizador criado)
          });

          // Envia resposta ao cliente HTTP
          res.status(200).send({
            message: "User created successfully",
            user,
          });

          next();
        })
        .catch((err) => {
          console.error("Error creating user:", err);
          res.status(404).send({ error: "Error creating user" });
          next();
        });
    });

  // --------------------------------------------------------------------
  // Atualizar utilizador por ID (PUT)
  // --------------------------------------------------------------------
  router
    .route("/:userId")
    .put(Users.autorize([scopes.Admin]), function (req, res, next) {
      console.log("update a member by id");
      const userId = req.params.userId;
      const body = req.body;

      Users.update(userId, body)
        .then((user) => {
          res.status(200).send(user);
          next();
        })
        .catch((err) => {
          res.status(404).send({ error: "User not found or not updated" });
          next();
        });
    });

  // --------------------------------------------------------------------
  // Criar membro associado a um utilizador (POST /:userId/member)
  // --------------------------------------------------------------------
  router
    .route("/:userId/member")
    .post(Users.autorize([scopes.Admin]), function (req, res, next) {
      const body = req.body;
      const userId = req.params.userId;

      // Cria membro e associa ao utilizador
      Members.create(body)
        .then((result) => {
          console.log(result);
          return Users.update(userId, { member: result.member._id });
        })
        .then((user) => {
          console.log("Member created and linked!");
          res.status(200).send(user);
          next();
        })
        .catch((err) => {
          console.log("Member already exists!");
          console.log(err);
          err.status = err.status || 500;
          res.status(401);
          next();
        });
    });

  // --------------------------------------------------------------------
  // Listar todos os membros
  // --------------------------------------------------------------------
  router
    .route("/member")
    .get(
      Users.autorize([scopes.Admin, scopes.Member, scopes.NonMember]),
      function (req, res, next) {
        console.log("get all members");

        const pageLimit = req.query.limit ? parseInt(req.query.limit) : 5;
        const pageSkip = req.query.skip
          ? pageLimit * parseInt(req.query.skip)
          : 0;

        req.pagination = { limit: pageLimit, skip: pageSkip };

        Members.findAll(req.pagination)
          .then((members) => {
            const response = { auth: true, members };
            res.send(response);
            next();
          })
          .catch((err) => {
            console.log(err.message);
            next();
          });
      }
    );

  // --------------------------------------------------------------------
  // Atualizar membro por ID
  // --------------------------------------------------------------------
  router
    .route("/member/:memberId")
    .put(Users.autorize([scopes.Admin]), function (req, res, next) {
      console.log("update a member by id");
      const memberId = req.params.memberId;
      const body = req.body;

      Members.update(memberId, body)
        .then((member) => {
          res.status(200).send(member);
          next();
        })
        .catch((err) => {
          res.status(404);
          next();
        });
    });

  // --------------------------------------------------------------------
  // Procurar membro pelo número de contribuinte (NIF)
  // --------------------------------------------------------------------
  router
    .route("/member/tax/:taxNumber")
    .get(
      Users.autorize([scopes.Admin, scopes.Member, scopes.NonMember]),
      function (req, res, next) {
        console.log("get member by tax number");
        const taxNumber = req.params.taxNumber;

        Members.findMemberByTaxNumber(taxNumber)
          .then((member) => {
            res.send(member);
            next();
          })
          .catch((err) => {
            console.log(err.message);
            next();
          });
      }
    );

  // --------------------------------------------------------------------
  // Obter perfil do utilizador autenticado
  // --------------------------------------------------------------------
  router
    .route("/perfil")
    .get(
      Users.autorize([scopes.NonMember, scopes.Member]),
      function (req, res, next) {
        console.log("get user profile");
        const userId = req.id; // ID obtido a partir do token decodificado

        Users.findUserById(userId)
          .then((user) => {
            res.status(200).send({ data: user });
            next();
          })
          .catch((err) => {
            console.log("Perfil", err);
            res.status(404);
            next();
          });
      }
    );

  // Retorna o router configurado
  return router;
};

// Exporta o router
module.exports = UsersRouter;
