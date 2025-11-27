function GameService(GameModel) {
  let service = {
    create,
    findAll,
    findTicketsByDate,
    update,
    removeById,
  };

  // Criar jogo
  function create(game) {
    let newGame = GameModel(game);
    return save(newGame);
  }

  // Função de salvar no MongoDB
  function save(model) {
    return new Promise(function (resolve, reject) {
      model.save(function (err) {
        if (err) {
          console.log(err);
          return reject("There is a problem with register");
        }

        // Sucesso
        resolve(model);
      });
    });
  }

  // Listar todos os jogos com paginação
  function findAll(pagination) {
    const { limit, skip } = pagination;

    return new Promise(function (resolve, reject) {
      GameModel.find({}, {}, { skip, limit }, function (err, games) {
        if (err) return reject(err);
        resolve(games);
      });
    }).then(async (games) => {
      const totalGames = await GameModel.count();
      return Promise.resolve({
        games: games,
        pagination: {
          pageSize: limit,
          page: Math.floor(skip / limit),
          hasMore: skip + limit < totalGames,
          total: totalGames,
        },
      });
    });
  }

  // Encontrar jogos por data
  function findTicketsByDate(date) {
    return new Promise(function (resolve, reject) {
      GameModel.find({ date }, function (err, game) {
        if (err) return reject(err);
        if (!game || game.length === 0) return reject("Game not found");
        resolve(game);
      });
    });
  }

  // Atualizar jogo
  function update(id, ticket) {
    return new Promise(function (resolve, reject) {
      GameModel.findByIdAndUpdate(id, ticket, { new: true }, function (err, gameUpdated) {
        if (err) return reject("Could not update game");
        resolve(gameUpdated);
      });
    });
  }

  // Remover jogo pelo ID
  function removeById(id) {
    return new Promise(function (resolve, reject) {
      GameModel.findByIdAndRemove(id, function (err) {
        if (err) return reject({ message: "Could not remove game" });
        resolve();
      });
    });
  }

  return service;
}

module.exports = GameService;
