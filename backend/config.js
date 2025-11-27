const config = {
  db: "mongodb+srv://paulochurrasco:b36dp9USw07QAUUC@cluster0.olpj4.mongodb.net/PWA",
  secret: "supersecret",
  expiresPassword: 86400, // expires in 24hours
  saltRounds: 10,
};

module.exports = config;
