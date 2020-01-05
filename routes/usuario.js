var express = require("express");
var bcrypt = require('bcryptjs');
// var jwt = require('jsonwebtoken');
// // Obtener SEED de token archivo
// var SEED = require('../config/config').TOKEN_SEED;

var mdAuth = require('../middlewares/autenticacion');


var app = express();

var Usuario = require("../models/usuario");

// Rutas

/*
    Obtener todos los usuarios
*/

app.get("/", (request, response, next) => {
    Usuario.find({}, "nombre email img role").exec((error, usuarios) => {
        if (error) {
            return response.status(500).json({
                ok: false,
                mensaje: "Error cargando usuario",
                errors: error
            });
        }

        response.status(200).json({
            ok: true,
            usuarios: usuarios
        });
    });
});


/*
    Validar token
*/
// Este se usa para valdiar token, pero se pasa a un modulo diferente llamado autenticacion prsa centralizar llamadas
// app.use('/', (request, response, next) => {
//     var token = request.query.token;

//     jwt.verify(token, SEED, (error, decoded) => {

//         if (error) {
//             return response.status(401).json({
//                 ok: false,
//                 mensaje: "Token incorrecto",
//                 errors: error
//             });
//         }

//         // Para que siga con lo demas procesos en la lista
//         next();

//     });

// });



/*
    Actualizar usuario por Id
*/
// Se incluye ya la autenticacion del token en cada llamada
app.put('/:id', mdAuth.verificaToken, (request, response) => {

    var id = request.params.id;
    var body = request.body;

    // Validar si el usuario existe
    Usuario.findById(id, (error, usuario) => {
        if (error) {
            return response.status(500).json({
                ok: false,
                mensaje: "Error al buscar el usuario",
                errors: error
            });
        }

        if (!usuario) {
            return response.status(400).json({
                ok: false,
                mensaje: "El usuario con el Id: " + id + ' no existe.',
                errors: { message: 'No existe un usuario con ese Id.' }
            });
        }

        // Paso las validaciones de existe

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((error, usuarioGuardado) => {
            if (error) {
                return response.status(400).json({
                    ok: false,
                    mensaje: "Error al actualizar usuario",
                    errors: error
                });
            }

            // Otra forma de ocultar el password
            usuarioGuardado.password = ':)';


            response.status(201).json({
                ok: true,
                usuario: usuarioGuardado
            });
        });


    });
});


/*
    Borrar usuario por Id
*/

app.delete('/:id', mdAuth.verificaToken, (request, response) => {

    var id = request.params.id;

    Usuario.findByIdAndRemove(id, (error, usuarioBorrado) => {
        if (error) {
            return response.status(500).json({
                ok: false,
                mensaje: "Error al borrar el usuario",
                errors: error
            });
        }

        if (!usuarioBorrado) {
            return response.status(400).json({
                ok: false,
                mensaje: "No existe un usuario con ese Id",
                errors: { message: 'No existe un usuario con ese Id.' }
            });
        }

        response.status(201).json({
            ok: true,
            usuario: usuarioBorrado
        });
    });
});


/*
    Crear nuevo usuario
*/
app.post("/", mdAuth.verificaToken, (request, response) => {
    var body = request.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((error, usuarioGuardado) => {
        if (error) {
            return response.status(400).json({
                ok: false,
                mensaje: "Error al crear usuario",
                errors: error
            });
        }

        response.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: request.usuario
        });
    });
});



module.exports = app;