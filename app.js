// Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// Inicializar variables
var app = express();

// Body Parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Importar rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var hospitalRoutes = require('./routes/hospital');
var medicoRoutes = require('./routes/medico');
var loginRoutes = require('./routes/login');
var busquedaRoutes = require('./routes/busqueda');
var uploadRoutes = require('./routes/upload');
var imagenRoutes = require('./routes/imagen');




// Conexion a la BD
mongoose.connection.openUri('mongodb://localhost:27017/dbHospital', (error, response) => {
    if (error) throw error;

    console.log('Base de datos dbHospital: \x1b[32m%s\x1b[0m', 'OnLine');
});

// Rutas
app.use('/upload', uploadRoutes);
app.use('/img', imagenRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/medico', medicoRoutes);
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/', appRoutes);

// Escuchar peticiones
// Instruccion para poner el texto online en verd
//  \x1b[32m%s\x1b[0m', 'OnLine'
app.listen(3000, () => {
    console.log('Express server Pto 3000: \x1b[32m%s\x1b[0m', 'OnLine');
});