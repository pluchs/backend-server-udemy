var express = require("express");
var bcrypt = require('bcryptjs');
var Usuario = require("../models/usuario");
var jwt = require('jsonwebtoken');
// Obtener SEED de token archivo
var SEED = require('../config/config').TOKEN_SEED;

var app = express();



app.post('/', (request, response) => {

    var body = request.body;

    Usuario.findOne({ email: body.email }, (error, usuarioDB) => {

        if (error) {
            return response.status(500).json({
                ok: false,
                mensaje: "Error al buscar usuario",
                errors: error
            });
        }

        if (!usuarioDB) {
            return response.status(400).json({
                ok: false,
                mensaje: "No existe un usuario",
                errors: { message: 'No existe un usuario - email.' }
            });
        }


        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return response.status(400).json({
                ok: false,
                mensaje: "No existe un usuario",
                errors: { message: 'No existe un usuario - password.' }
            });
        }

        // Remover el password
        usuarioDB.password = ':)';
        // Crear un token
        // 1.- Parametro Usuario,
        // 2.- Parametro Seed
        // 3.- Parametro exporacion en segundos
        //var token = jwt.sign({ usuario: usuarioDB }, '@este-es@-un-seed-dificil', { expiresIn: 14400 });
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });

        response.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB.id
        });


    });





});






module.exports = app;