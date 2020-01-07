var express = require("express");
var fileUpload = require("express-fileupload");
var fs = require("fs");
var Usuario = require("../models/usuario");
var Hospital = require("../models/hospital");
var Medico = require("../models/medico");

var app = express();

app.use(fileUpload());

// Rutas
app.put("/:tipo/:id", (request, response, next) => {
    var tipo = request.params.tipo;
    var id = request.params.id;

    // validar tipos de colecciones
    var tiposValidos = ["hospitales", "medicos", "usuarios"];
    if (tiposValidos.indexOf(tipo) < 0) {
        return response.status(400).json({
            ok: false,
            mensaje: "Tipo de coleccion no válida",
            errors: { message: "Colecciones validas: " + tiposValidos.join(", ") }
        });
    }

    // validar que se hayan subido archivos
    if (!request.files || Object.keys(request.files).length === 0) {
        return response.status(400).json({
            ok: false,
            mensaje: "No se seleccionaron archivos",
            errors: { message: "Debe seleccionar una imagen" }
        });
    }

    var archivo = request.files.imagen;
    var nombreCorto = archivo.name.split(".");
    var extensionArchivo = nombreCorto[nombreCorto.length - 1];

    // Solo esta exstension son validas
    var extensionesValidas = ["png", "jpg", "gif", "jpeg"];

    // return response.status(400).json({
    //     nombre: nombreCorto,
    //     exntension: extensionArchivo,
    //     archivo: archivo

    // });

    // validar que el texto se encuentre en el arreglo permitido
    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return response.status(400).json({
            ok: false,
            mensaje: "Extensión de archivo no válida",
            errors: {
                message: "Extensiones validas: " + extensionesValidas.join(", ")
            }
        });
    }

    // Nombre de archivo personalizado
    // ID de usuario + numero random + extension

    // return response.status(400).json({
    //     archivo: archivo.name
    // });

    var nombreArchivo = `${id}_${new Date().getMilliseconds()}.${extensionArchivo} `;

    // Mover el archivo del temporal a un path en particular
    var path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(path, error => {
        if (error) {
            return response.status(500).json({
                ok: false,
                mensaje: "Error al mover el archivo",
                errors: error
            });
        }

        subirImagenXTipo(tipo, id, nombreArchivo, response);

        // comentado despues que se agrego fucnion para guardar las fotos
        // response.status(200).json({
        //     ok: true,
        //     mensaje: 'Archivo cargado con éxito',
        //     nombre: nombreCorto,
        //     //archivo: archivo
        //     extension: extensionArchivo

        // });
    });

    // archivo.mv(path, error => {
    //     if (error) {
    //         return response.status(500).json({
    //             ok: false,
    //             mensaje: 'Error al mover el archivo',
    //             errors: error
    //         });
    //     }

    //     response.status(200).json({
    //         ok: true,
    //         mensaje: 'Archivo cargado con éxito',
    //         nombre: nombreCorto,
    //         //archivo: archivo
    //         extension: extensionArchivo

    //     });

    // });

    // response.status(200).json({
    //     ok: true,
    //     mensaje: 'Petición realizada con éxito',
    //     nombre: nombreCorto,
    //     //archivo: archivo
    //     extension: extensionArchivo

    // });
});

function subirImagenXTipo(tipo, id, nombreArchivo, response) {
    if (tipo === "usuarios") {
        Usuario.findById(id, (error, usuario) => {
            var oldImgPath = "./uploads/usuarios/" + usuario.img;

            // Si existe elimina una imagen anterior
            // No funciona para borrar la imagen.
            // if (fs.existsSync(oldImgPath)) {
            //     fs.unlink(oldImgPath, (error) => {

            //     });
            // }

            usuario.img = nombreArchivo;
            usuario.save((error, usuarioActualizado) => {
                if (error) {
                    return response.status(500).json({
                        ok: false,
                        mensaje: "Error actualizar el usuario",
                        errors: error
                    });
                }

                response.status(200).json({
                    ok: true,
                    mensaje: "Imagen de usuario actualizado",
                    usuario: usuarioActualizado
                });
                return;
            });
        });
    }

    if (tipo == "medicos") {
        Medico.findById(id, (error, medico) => {
            var oldImgPath = "./uploads/medicos/" + medico.img;

            // Si existe elimina una imagen anterior
            // No funciona para borrar la imagen.
            // if (fs.existsSync(oldImgPath)) {
            //     fs.unlink(oldImgPath, (error) => {

            //     });
            // }

            medico.img = nombreArchivo;
            medico.save((error, medicoActualizado) => {
                if (error) {
                    return response.status(500).json({
                        ok: false,
                        mensaje: "Error actualizar el medico",
                        errors: error
                    });
                }

                response.status(200).json({
                    ok: true,
                    mensaje: "Imagen de medico actualizado",
                    medico: medicoActualizado
                });
                return;
            });
        });
    }

    if (tipo == "hospitales") {
        Hospital.findById(id, (error, hospital) => {
            var oldImgPath = "./uploads/hospitales/" + hospital.img;

            // Si existe elimina una imagen anterior
            // No funciona para borrar la imagen.
            // if (fs.existsSync(oldImgPath)) {
            //     fs.unlink(oldImgPath, (error) => {

            //     });
            // }

            hospital.img = nombreArchivo;
            hospital.save((error, hospitalActualizado) => {
                if (error) {
                    return response.status(500).json({
                        ok: false,
                        mensaje: "Error actualizar el hospital",
                        errors: error
                    });
                }

                response.status(200).json({
                    ok: true,
                    mensaje: "Imagen de hospital actualizado",
                    hospital: hospitalActualizado
                });
                return;
            });
        });
    }
}

module.exports = app;