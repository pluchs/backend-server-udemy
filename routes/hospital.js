var express = require("express");
var bcrypt = require("bcryptjs");
// var jwt = require('jsonwebtoken');
// // Obtener SEED de token archivo
// var SEED = require('../config/config').TOKEN_SEED;

var mdAuth = require("../middlewares/autenticacion");

var app = express();

var Hospital = require("../models/hospital");

// Rutas

/*
    Obtener todos los hospitales
*/

app.get("/", (request, response, next) => {

    // este dato viene como parametro en la URL, aqui se captura. || indica qyue si viene vacio, ponga un 0
    var desde = request.query.desde || 0;
    desde = Number(desde);

    Hospital.find({} /*, 'nombre img usuario'*/ )
        .skip(desde) // Saltar el numero de regsitros determninados por la variable desde
        .limit(5) // Limitar el numero de resultados que se regresan en la consulta...
        .populate('usuario', 'nombre email') // Ayudar obtener el dato completo del usuario relacionado NOTA:en este caso solo traemos nombre y correo
        .exec((error, hospitales) => {
            if (error) {
                return response.status(500).json({
                    ok: false,
                    mensaje: "Error cargando hospital",
                    errors: error
                });
            }

            Hospital.count({}, (error, conteo) => {
                response.status(200).json({
                    ok: true,
                    hospitales: hospitales,
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
    Actualizar usuario por Id
*/
// Se incluye ya la autenticacion del token en cada llamada
app.put("/:id", mdAuth.verificaToken, (request, response) => {
    var id = request.params.id;
    var body = request.body;

    // Validar si el usuario existe
    Hospital.findById(id, (error, hospital) => {
        if (error) {
            return response.status(500).json({
                ok: false,
                mensaje: "Error al buscar el hospital",
                errors: error
            });
        }

        if (!hospital) {
            return response.status(400).json({
                ok: false,
                mensaje: "El hospital con el Id: " + id + " no existe.",
                errors: { message: "No existe un hospital con ese Id." }
            });
        }

        // Paso las validaciones de existe

        hospital.nombre = body.nombre;
        //hospital.img = body.img;
        //usuario.email = body.email;
        //usuario.role = body.role;
        hospital.usuario = request.usuario;

        hospital.save((error, hospitalGuardado) => {
            if (error) {
                return response.status(400).json({
                    ok: false,
                    mensaje: "Error al actualizar hospital",
                    errors: error
                });
            }

            // // Otra forma de ocultar el password
            // usuarioGuardado.password = ':)';

            response.status(201).json({
                ok: true,
                hospital: hospitalGuardado
            });
        });
    });
});

/*
    Borrar hospital por Id
*/

app.delete("/:id", mdAuth.verificaToken, (request, response) => {
    var id = request.params.id;

    Hospital.findByIdAndRemove(id, (error, hospitalBorrado) => {
        if (error) {
            return response.status(500).json({
                ok: false,
                mensaje: "Error al borrar el hospital",
                errors: error
            });
        }

        if (!hospitalBorrado) {
            return response.status(400).json({
                ok: false,
                mensaje: "No existe un hospital con ese Id",
                errors: { message: "No existe un hospital con ese Id." }
            });
        }

        response.status(201).json({
            ok: true,
            hospital: hospitalBorrado
        });
    });
});

/*
    Crear nuevo hospital
*/
app.post("/", mdAuth.verificaToken, (request, response) => {
    var body = request.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        img: body.img,
        usuario: request.usuario
            // img: body.img,
            // role: body.role
    });

    hospital.save((error, hospitalGuardado) => {
        if (error) {
            return response.status(400).json({
                ok: false,
                mensaje: "Error al crear hospital",
                errors: error
            });
        }

        response.status(201).json({
            ok: true,
            hospital: hospitalGuardado,
            usuarioToken: request.usuario
        });
    });
});

module.exports = app;