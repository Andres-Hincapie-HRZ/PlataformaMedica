// Función de prueba para debugging del email
function testEmail() {
    console.log('🔍 Iniciando prueba de email...');
    
    // Verificar que EmailJS esté cargado
    if (typeof emailjs === 'undefined') {
        console.error('❌ EmailJS no está cargado. Verifica que el script esté incluido.');
        return;
    }
    
    console.log('✅ EmailJS está cargado');
    
    // Inicializar EmailJS
    emailjs.init('tfi1ksSYUgEyQxZ6I');
    console.log('✅ EmailJS inicializado');
    
    // Datos de prueba
    const datosTest = {
        to_email: 'jorge777andres@gmail.com', // PON TU EMAIL REAL AQUÍ
        to_name: 'Paciente de Prueba',
        fecha_cita: 'lunes, 5 de febrero de 2024',
        hora_cita: '10:30 AM',
        doctor: 'Dr. Juan Pérez',
        especialidad: 'Cirugía Plástica',
        clinica_nombre: 'EVA Cirugía Corporal',
        clinica_direccion: 'Avenida Roosevelt #26-61',
        clinica_telefono: '+57 318 8042578'
    };
    
    console.log('📧 Enviando email de prueba con datos:', datosTest);
    
    // Enviar email
    emailjs.send(
        'service_2re2org',    // Service ID
        'template_rxar2ok',   // Template ID
        datosTest,
        'tfi1ksSYUgEyQxZ6I'   // Public Key
    )
    .then(function(response) {
        console.log('✅ EMAIL ENVIADO EXITOSAMENTE!', response);
        alert('✅ Email enviado correctamente! Revisa tu bandeja de entrada.');
    })
    .catch(function(error) {
        console.error('❌ ERROR ENVIANDO EMAIL:', error);
        alert('❌ Error enviando email. Revisa la consola para más detalles.');
        
        // Debugging adicional
        if (error.status === 400) {
            console.error('Error 400: Verifica que el template ID y service ID sean correctos');
        } else if (error.status === 401) {
            console.error('Error 401: Verifica tu public key');
        } else if (error.status === 404) {
            console.error('Error 404: Template o service no encontrado');
        }
    });
}

// Función simplificada para usar desde tu código
async function enviarEmailSimple(emailPaciente, nombrePaciente, fechaCita, horaCita, doctor, especialidad) {
    try {
        console.log('📧 Enviando email a:', emailPaciente);
        
        const templateParams = {
            to_email: emailPaciente,
            to_name: nombrePaciente,
            fecha_cita: fechaCita,
            hora_cita: horaCita,
            doctor: doctor,
            especialidad: especialidad,
            clinica_nombre: 'EVA Cirugía Corporal',
            clinica_direccion: 'Avenida Roosevelt #26-61',
            clinica_telefono: '+57 318 8042578'
        };
        
        const response = await emailjs.send(
            'service_2re2org',
            'template_rxar2ok',
            templateParams,
            'tfi1ksSYUgEyQxZ6I'
        );
        
        console.log('✅ Email enviado:', response);
        return { success: true, response };
        
    } catch (error) {
        console.error('❌ Error enviando email:', error);
        return { success: false, error };
    }
}

// Hacer funciones disponibles globalmente
window.testEmail = testEmail;
window.enviarEmailSimple = enviarEmailSimple;