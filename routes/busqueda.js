var express = require('express');

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

var app = express();


// Rutas

app.get('/coleccion/:tabla/:busqueda', (request, response) => {

    // se agrega para que la busqueda sea insensible a mayusculas minusculas
    var busqueda = request.params.busqueda;
    var regEx = new RegExp(busqueda, 'i');
    var tabla = request.params.tabla;


    // Asi resolvi yo el problema

    // if (tabla === 'medico') {
    //     buscarMedicos(busqueda, regEx).then(medicos => {
    //         response.status(200).json({
    //             ok: true,
    //             mensaje: 'Petición realizada con éxito',
    //             medicos: medicos
    //         });
    //     });
    // } else if (tabla === 'hospital') {
    //     buscarHospitales(busqueda, regEx).then(hospitales => {
    //         response.status(200).json({
    //             ok: true,
    //             mensaje: 'Petición realizada con éxito',
    //             hospitales: hospitales
    //         });
    //     });
    // } else if (tabla === 'usuario') {
    //     buscarUsuarios(busqueda, regEx).then(usuarios => {
    //         response.status(200).json({
    //             ok: true,
    //             mensaje: 'Petición realizada con éxito',
    //             usuarios: usuarios
    //         });
    //     });
    // } else {
    //     response.status(400).json({
    //         ok: false,
    //         mensaje: 'La ruta de búsqueda no es válida'
    //     });
    // }

    // Asi lo resolvio el profe

    var promesa;

    switch (tabla) {
        case 'usuario':
            promesa = buscarUsuarios(busqueda, regEx);
            break;
        case 'hospital':
            promesa = buscarHospitales(busqueda, regEx);
            break;
        case 'medico':
            promesa = buscarMedicos(busqueda, regEx);
            break;
        default:
            return response.status(400).json({
                ok: false,
                mensaje: 'La ruta de búsqueda no es válida. Solo se permite medico, usuario, hospital'
            });
    }
    promesa.then(resultados => {
        response.status(200).json({
            ok: true,
            mensaje: 'Petición realizada con éxito',
            [tabla]: resultados // [tabla] indica que el valor de la varible tablas es la que determnina el valor del dato que aparece en la respuesta
        });
    });
});
// promesa.then(resultado, {
//     response.status(200).json({
//         ok: true,
//         mensaje: 'Petición realizada con éxito',
//         [tabla]: resultados
//     });
//});

// promesa().then(resultados => {
//         response.status(200).json({
//             ok: true,
//             mensaje: 'Petición realizada con éxito',
//             [tabla]: resultados
//         });
//     );

//});


app.get('/todo/:busqueda', (request, response, next) => {

    // se agrega para que la busqueda sea insensible a mayusculas minusculas
    var busqueda = request.params.busqueda;
    var regEx = new RegExp(busqueda, 'i');


    Promise.all([
        buscarHospitales(busqueda, regEx),
        buscarMedicos(busqueda, regEx),
        buscarUsuarios(busqueda, regEx)
    ]).then(resultados => {
        response.status(200).json({
            ok: true,
            mensaje: 'Petición realizada con éxito',
            hospitales: resultados[0],
            medicos: resultados[1],
            usuarios: resultados[2]
        });
    });


    // Esta funcion es usada para cuando se hace la busqueda sencilla y no de manera asoncrona
    // buscarHospitales(busqueda, regEx).then(hospitales => {
    //     response.status(200).json({
    //         ok: true,
    //         mensaje: 'Petición realizada con éxito',
    //         hospitales: hospitales
    //     });
    // });

    // Este codigo funciona solo para busquedas unicas, pero no cuando se piden mas busquedas en mas colecciones
    // Para ese se implmente una promesa, como la de buscarHospitales

    // // Hospital.find({ nombre: busqueda }, (error, hospitales) => {
    // // Si dej asi la busqueda, no encontraras datos, ya qu busca de manera literal el termino, lo que se hace es se cambia por una expression regular
    // Hospital.find({ nombre: regEx }, (error, hospitales) => {
    //     response.status(200).json({
    //         ok: true,
    //         mensaje: 'Petición realizada con éxito',
    //         hospitales: hospitales
    //     });
    // });



    // response.status(200).json({
    //     ok: true,
    //     mensaje: 'Petición realizada con éxito'
    // });
});

/// Busqueda de Hospitales
function buscarHospitales(busqueda, regEx) {
    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regEx })
            .populate('usuario', 'nombre email')
            .exec((error, hospitales) => {
                if (error) {
                    reject('Error al buscar hospitales: ', error);
                } else {
                    resolve(hospitales);
                }
            });
    });
}

// Busqueda de Medicos
function buscarMedicos(busqueda, regEx) {
    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regEx })
            .populate('hospital', 'nombre')
            .populate('usuario', 'nombre email')
            .exec((error, medicos) => {
                if (error) {
                    reject('Error al buscar medicos: ', error);
                } else {
                    resolve(medicos);
                }
            });
    });
}

function buscarUsuarios(busqueda, regEx) {
    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email role')
            .or([{ 'nombre': regEx }, { 'email': regEx }])
            .exec((error, usuarios) => {
                if (error) {
                    reject('Error al cargar usuarios');
                } else {
                    resolve(usuarios);
                }
            });

    });
}


module.exports = app;