const config = require("../../config");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

function UserService(UserModel) {
  let service = {
    create,
    createToken,
    verifyToken,
    findUser,
    autorize,
    update,
    findUserById
  };

  function create(user) {
    return createPassword(user).then((hashPassword, err) => {
      if (err) {
        return Promise.reject("Not saved the user");
      }

      let newUserWithPassword = {
        ...user,
        password: hashPassword,
      };

      let newUser = UserModel(newUserWithPassword);
      return save(newUser);
    });
  }

  function createToken(user) {
    let token = jwt.sign({ id: user._id, name: user.name, role: user.role.scope }, config.secret, {
      expiresIn: config.expiresPassword,
    });

    return { auth: true, token };
  }


  function verifyToken(token) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
          reject();
        }
        return resolve(decoded);
      });
    });
  }

  function save(model) {
    return new Promise(function (resolve, reject) {
      // do a thing, possibly async, then…
      model.save(function (err) {
        if (err) reject("There is a problema with register");

        resolve({
          message: 'User saved',
          user: model,
        });
      });
    });
  }

  function update(id, user) {
    console.log('user', user);
    return new Promise(function (resolve, reject) {
      console.log('user', user);
      UserModel.findByIdAndUpdate(id, user, function (err, userUpdated) {
        if (err) reject('Dont updated User');
        resolve(userUpdated);
      });
    });
  }

  function findUser({ name, password, isQrCode }) {
    return new Promise(function (resolve, reject) {
      UserModel.findOne({ name }, function (err, user) {
        if (err) reject(err);
        //object of all users
        if (!user) {
          reject("This data is wrong");
        }
        resolve(user);
      });
    }).then((user) => {
      if (isQrCode) {
        return user.password === password ? Promise.resolve(user) :
          Promise.reject("User not valid");
      }
      return comparePassword(password, user.password).then((match) => {
        if (!match) return Promise.reject("User not valid");
        return Promise.resolve(user);
      });
    });
  }

function findUserById(idParam) {
  const userId = typeof idParam === "object" && idParam !== null ? idParam.id : idParam;

  return new Promise(function (resolve, reject) {
    if (!userId) {
      return reject("Invalid user id");
    }

    UserModel.findOne({ _id: userId }, function (err, user) {
      if (err) return reject(err);
      if (!user) return reject("This data is wrong");
      resolve(user);
    });
  });
}


  //devolver a password encryptada
  function createPassword(user) {
    return bcrypt.hash(user.password, config.saltRounds);
  }

  //devolver se a password é ou não a mesma
  function comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
  }

  function autorize(scopes) {
    return (request, response, next) => {

      const { roleUser } = request; //Este request só tem o roleUser porque o adicionamos no ficheiro players
      const hasAutorization = scopes.some(scope => roleUser.includes(scope));

      if (roleUser && hasAutorization) {
        next();
      } else {
        response.status(403).json({ message: "Forbidden" }); //acesso negado
      }
    };
  }

  return service;
}

module.exports = UserService;
