// Requires
var express = require('express');
var mongoose = require('mongoose');

// Inicializar variables
var app = express();

// Conexion a la BD
mongoose.connection.openUri('mongodb://localhost:27017/dbHospital', (error, response) => {
    if (error) throw error;

    console.log('Base de datos dbHospital: \x1b[32m%s\x1b[0m', 'OnLine');
});

// Rutas
app.get('/', (requeest, response, next) => {

    response.status(200).json({
        ok: true,
        mensaje: 'Petición realizada con éxito'
    });
});



// Escuchar peticiones
// Instruccion para poner el texto online en verd
//  \x1b[32m%s\x1b[0m', 'OnLine'
app.listen(3000, () => {
    console.log('Express server Pto 3000: \x1b[32m%s\x1b[0m', 'OnLine');
});