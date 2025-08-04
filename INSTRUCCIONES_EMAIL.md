# 📧 Configuración de Email para Confirmación de Citas

## 🎯 Resumen
Ya tienes todo el código listo. Solo necesitas configurar el template HTML en EmailJS.

## 📋 Pasos para Configurar EmailJS

### 1. Crear el Template en EmailJS
1. Ve a tu dashboard de EmailJS: https://dashboard.emailjs.com/
2. Haz clic en "Email Templates" en el menú izquierdo
3. Haz clic en "Create New Template"
4. Copia y pega el contenido del archivo `Backend/email-template.html` en el editor de EmailJS

### 2. Variables del Template
El template usa estas variables que EmailJS reemplazará automáticamente:
- `{{to_name}}` - Nombre del paciente
- `{{to_email}}` - Email del paciente
- `{{fecha_cita}}` - Fecha de la cita
- `{{hora_cita}}` - Hora de la cita
- `{{doctor}}` - Nombre del doctor
- `{{especialidad}}` - Especialidad médica
- `{{clinica_nombre}}` - Nombre de la clínica
- `{{clinica_direccion}}` - Dirección de la clínica
- `{{clinica_telefono}}` - Teléfono de la clínica

### 3. Configurar el Template ID
1. Después de crear el template, copia el Template ID que aparece
2. Reemplaza `template_rxar2ok` en el archivo `Backend/emailService.js` con tu nuevo Template ID

## 🚀 Cómo Usar el Sistema

### Ejemplo de uso básico:
```javascript
// Crear instancia del servicio
const emailService = new EmailService();

// Datos de la cita
const datosCita = {
    nombre: 'María García',
    email: 'maria@email.com',
    fecha: '2024-02-15',
    hora: '10:30 AM',
    doctor: 'Dr. Juan Pérez',
    especialidad: 'Cirugía Plástica',
    nombreClinica: 'EVA Cirugía Corporal',
    direccionClinica: 'Av. Principal 123, Ciudad',
    telefonoClinica: '(555) 123-4567'
};

// Agendar cita y enviar email
const resultado = await emailService.agendarCitaConEmail(datosCita);
```

### Solo enviar email (si ya tienes la cita guardada):
```javascript
const resultado = await emailService.enviarConfirmacionCita({
    emailPaciente: 'maria@email.com',
    nombrePaciente: 'María García',
    fechaCita: 'viernes, 15 de febrero de 2024',
    horaCita: '10:30 AM',
    nombreDoctor: 'Dr. Juan Pérez',
    especialidad: 'Cirugía Plástica',
    nombreClinica: 'EVA Cirugía Corporal',
    direccionClinica: 'Av. Principal 123, Ciudad',
    telefonoClinica: '(555) 123-4567'
});
```

## 🔧 Personalización

### Cambiar información de la clínica:
Edita estas líneas en `Frontend/js/citas.js`:
```javascript
nombreClinica: 'TU NOMBRE DE CLÍNICA',
direccionClinica: 'TU DIRECCIÓN',
telefonoClinica: 'TU TELÉFONO'
```

### Modificar el diseño del email:
Edita el archivo `Backend/email-template.html` y actualiza el template en EmailJS.

## ✅ Verificación
1. Asegúrate de que EmailJS esté configurado correctamente
2. Verifica que tu Service ID y Public Key sean correctos
3. Confirma que el Template ID coincida
4. Prueba enviando un email de prueba

## 🎨 Características del Template
- ✅ Diseño responsive (se ve bien en móviles)
- ✅ Colores profesionales
- ✅ Iconos para mejor visualización
- ✅ Información clara y organizada
- ✅ Instrucciones para el paciente
- ✅ Información de contacto

## 🔍 Soluci��n de Problemas
- Si no llegan los emails, verifica tu configuración de Gmail en EmailJS
- Si hay errores, revisa la consola del navegador
- Asegúrate de que todos los campos requeridos estén llenos

¡Ya está todo listo para usar! 🎉