var express = require("express");
var bcrypt = require("bcryptjs");
// var jwt = require('jsonwebtoken');
// // Obtener SEED de token archivo
// var SEED = require('../config/config').TOKEN_SEED;

var mdAuth = require("../middlewares/autenticacion");

var app = express();

var Medico = require("../models/medico");

// Rutas

/*
    Obtener todos los medicos
*/

app.get("/", (request, response, next) => {

    // este dato viene como parametro en la URL, aqui se captura. || indica qyue si viene vacio, ponga un 0
    var desde = request.query.desde || 0;
    desde = Number(desde);


    Medico.find({} /*, "nombre img usuario hospital"*/ )
        .skip(desde) // Saltar el numero de regsitros determninados por la variable desde
        .limit(5) // Limitar el numero de resultados que se regresan en la consulta...
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec((error, medicos) => {
            if (error) {
                return response.status(500).json({
                    ok: false,
                    mensaje: "Error cargando medico",
                    errors: error
                });
            }

            Medico.count({}, (error, conteo) => {
                response.status(200).json({
                    ok: true,
                    medicos: medicos,
                    total: conteo
                });
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
    Actualizar medico por Id
*/
// Se incluye ya la autenticacion del token en cada llamada
app.put("/:id", mdAuth.verificaToken, (request, response) => {
    var id = request.params.id;
    var body = request.body;

    // Validar si el usuario existe
    Medico.findById(id, (error, medico) => {
        if (error) {
            return response.status(500).json({
                ok: false,
                mensaje: "Error al buscar el medico",
                errors: error
            });
        }

        if (!medico) {
            return response.status(400).json({
                ok: false,
                mensaje: "El medico con el Id: " + id + " no existe.",
                errors: { message: "No existe un medico con ese Id." }
            });
        }

        // Paso las validaciones de existe

        medico.nombre = body.nombre;
        //hospital.img = body.img;
        //usuario.email = body.email;
        //usuario.role = body.role;
        medico.usuario = request.usuario;
        medico.hospital = body.hospital;

        medico.save((error, medicoGuardado) => {
            if (error) {
                return response.status(400).json({
                    ok: false,
                    mensaje: "Error al actualizar medico",
                    errors: error
                });
            }

            // // Otra forma de ocultar el password
            // usuarioGuardado.password = ':)';

            response.status(201).json({
                ok: true,
                medico: medicoGuardado
            });
        });
    });
});

/*
    Borrar medico por Id
*/

app.delete("/:id", mdAuth.verificaToken, (request, response) => {
    var id = request.params.id;

    Medico.findByIdAndRemove(id, (error, medicoBorrado) => {
        if (error) {
            return response.status(500).json({
                ok: false,
                mensaje: "Error al borrar el medico",
                errors: error
            });
        }

        if (!medicoBorrado) {
            return response.status(400).json({
                ok: false,
                mensaje: "No existe un medico con ese Id",
                errors: { message: "No existe un medico con ese Id." }
            });
        }

        response.status(201).json({
            ok: true,
            medico: medicoBorrado
        });
    });
});

/*
    Crear nuevo medico
*/
app.post("/", mdAuth.verificaToken, (request, response) => {
    var body = request.body;

    var medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        usuario: request.usuario,
        hospital: body.hospital
            // img: body.img,
            // role: body.role
    });

    medico.save((error, medicoGuardado) => {
        if (error) {
            return response.status(400).json({
                ok: false,
                mensaje: "Error al crear medico",
                errors: error
            });
        }

        response.status(201).json({
            ok: true,
            medico: medicoGuardado,
            usuarioToken: request.usuario
        });
    });
});

module.exports = app;