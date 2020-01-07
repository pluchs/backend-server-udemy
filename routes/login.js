var express = require("express");
var bcrypt = require('bcryptjs');
var Usuario = require("../models/usuario");
var jwt = require('jsonwebtoken');
var app = express();

// Obtener SEED de token archivo
var SEED = require('../config/config').TOKEN_SEED;


// google
const CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);






/************* Comments Start ****************************************************************/
// Description: Autenticacion de Google
/*********************************************************************************************/

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });

    const payload = ticket.getPayload();
    //const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    return {
        // nombre: payload.name,
        // email: payload.email,
        // imagen: payload.picture
        payLoad: payload
    }
}
//verify().catch(console.error);

app.post('/google', async(request, response) => {

    var token = request.body.token;

    // response.status(200).json({
    //     ok: true,
    //     mensaje: 'Petición realizada con éxito',
    //     token: token,
    //     id_client: CLIENT_ID
    // });

    // return;

    var googleUser = await verify(token).catch(error => {
        response.status(403).json({
            ok: false,
            mensaje: 'error en token',
            error: error
        }).payLoad;
    });

    // Lo tuve que hacer asi, ya que el resiltado estaba dentro del objeto payload
    var googleUser = googleUser.payLoad;

    //var userGoogle = googleUser.payLoad;

    Usuario.findOne({ email: googleUser.email }, (error, usuarioDB) => {
        if (error) {
            response.status(500).json({
                ok: false,
                mensaje: 'error al buscar el usuario',
                error: error
            });
        }

        if (usuarioDB) {
            if (usuarioDB.google === false) {
                response.status(400).json({
                    ok: false,
                    mensaje: 'Debe usar su autenticacion normal'
                });
            } else {
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
            }
        } else {
            // el usuario no existe, se tiene qyue crear.
            var newUser = new Usuario();

            newUser.nombre = googleUser.name;
            newUser.email = googleUser.email;
            newUser.img = googleUser.picture;
            newUser.google = true;
            newUser.password = ":)";

            newUser.save((error, usuarioDB) => {

                if (error) {
                    response.status(500).json({
                        ok: false,
                        mensaje: 'Error al insertar el usuario',
                        error: error,
                        userGoogle: googleUser,
                        user: newUser
                    });
                }


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
                    //id: usuarioDB.id
                });

            });
            // response.status(200).json({
            //     ok: true,
            //     mensaje: 'Petición realizada con éxito',
            //     google: googleUser
        }
    });
});


/************* Comments Start ****************************************************************/
// Description: Autenticacion Normal
/*********************************************************************************************/
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