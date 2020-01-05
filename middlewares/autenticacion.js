var jwt = require("jsonwebtoken");
// Obtener SEED de token archivo
var SEED = require("../config/config").TOKEN_SEED;

// Esta es una opcion para validar el token, pero esto si se va a sauar eb varios lados, se tiene que centralziar en algun lado.

exports.verificaToken = function(request, response, next) {
    var token = request.query.token;

    jwt.verify(token, SEED, (error, decoded) => {
        if (error) {
            return response.status(401).json({
                ok: false,
                mensaje: "Token incorrecto",
                errors: error
            });
        }

        request.usuario = decoded.usuario;

        // Para que siga con lo demas procesos en la lista
        next();

        // response.status(200).json({
        //     ok: true,
        //     decoded: decoded

        // });

    });
};

//app.use('/', (request, response, next) => {