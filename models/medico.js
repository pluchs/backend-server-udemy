// Declaracion de variables
var mongoose = require('mongoose');
//var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

// Controlar los roles
// var rolesValidos = {
//     values: ['ADMIN_ROLE', 'USER_ROLE'],
//     message: '{VALUE} no es un rol permitido'
// };

//  Creacion del esquema
var medicoSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre es necesario'] },
    img: { type: String, required: false },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
    hospital: { type: Schema.Types.ObjectId, ref: 'Hospital', required: [true, 'El id hospital es un campo obligatorio'] }
});

//hospitalSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser unico' });

// Exportar el esquema para que se visualice en el proyecto
module.exports = mongoose.model('Medico', medicoSchema);