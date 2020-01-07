var express = require("express");
var fileUpload = require("express-fileupload");
var fs = require("fs");
var Usuario = require("../models/usuario");
var Hospital = require("../models/hospital");
var Medico = require("../models/medico");

var app = express();

// Incializar el file Upload
app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: "/tmp/"
    })
);

module.exports = app;

app.post("/:tipo/:id", (request, response, next) => {
    var tipo = request.params.tipo;
    var id = request.params.id;

    if (!request.files || Object.keys(request.files).length === 0) {
        return response.status(400).json({
            ok: false,
            mensaje: "No se seleccionaron archivos",
            errors: { message: "Debe seleccionar una imagen" }
        });
    }

    // validar tipos de colecciones
    var tiposValidos = ["hospitales", "medicos", "usuarios"];
    if (tiposValidos.indexOf(tipo) < 0) {
        return response.status(400).json({
            ok: false,
            mensaje: "Tipo de coleccion no válida",
            errors: { message: "Colecciones validas: " + tiposValidos.join(", ") }
        });
    }

    // Solo esta exstension son validas
    var extensionesValidas = ["png", "jpg", "gif", "jpeg"];

    var archivo = request.files.imagen;
    var nombreCorto = archivo.name.split(".");
    var extensionArchivo = nombreCorto[nombreCorto.length - 1];
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

    var nombreArchivo = `${id}_${new Date().getMilliseconds()}.${extensionArchivo}`;
    var path = `uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(path, error => {
        if (error)
            return response.status(500).json({
                ok: false,
                mensaje: "error al mover archivo",
                errors: error
            });
    });

    // Colocarf la referencia de la imagen en la coleccion
    subirImagenXTipo(tipo, id, nombreArchivo, response);


});


// funcion para cargar la nueva imagen en la coleccion 
function subirImagenXTipo(tipo, id, nombreArchivo, response) {
    if (tipo === "usuarios") {
        Usuario.findById(id, (error, usuario) => {
            var oldImgPath = "./uploads/usuarios/" + usuario.img;

            // Si existe elimina una imagen anterior
            if (fs.existsSync(oldImgPath)) {
                fs.unlink(oldImgPath, error => {});
            }

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
            if (fs.existsSync(oldImgPath)) {
                fs.unlink(oldImgPath, error => {});
            }

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

            // Si existe eliara borrar la imagen.
            if (fs.existsSync(oldImgPath)) {
                fs.unlink(oldImgPath, error => {});
            }

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