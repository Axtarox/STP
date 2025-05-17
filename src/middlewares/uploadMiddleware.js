/**
 * Middleware para la carga de archivos
 */
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Crear directorio de uploads si no existe
const uploadsDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generar nombre único para el archivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Obtener la extensión original del archivo
    const ext = path.extname(file.originalname).toLowerCase();
    // Crear nombre final: tipo-timestamp-randomNum.ext
    
    // Determinar el tipo de archivo para el prefijo
    let prefix = 'file';
    if (file.fieldname === 'imagen') {
      prefix = 'product';
    } else if (file.fieldname === 'logo') {
      prefix = 'logo';
    } else if (file.fieldname === 'banner') {
      prefix = 'banner';
    }
    
    cb(null, `${prefix}-${uniqueSuffix}${ext}`);
  }
});

// Función para filtrar tipos de archivos
const fileFilter = (req, file, cb) => {
  // Aceptar solo imágenes
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('El archivo debe ser una imagen (JPEG, PNG, GIF, etc.)'), false);
  }
};

// Crear y exportar instancia de Multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});

module.exports = upload;