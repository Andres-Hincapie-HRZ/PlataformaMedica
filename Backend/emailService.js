// Servicio de Email para confirmación de citas
class EmailService {
    constructor() {
        this.serviceId = 'service_2re2org'; // Tu service ID de Gmail
        this.publicKey = 'tfi1ksSYUgEyQxZ6I'; // Tu public key
        this.privateKey = 'gidaA4n5JEtKJvuFGfUYD'; // Tu private key
        this.templateId = 'template_rxar2ok'; // Tu template ID existente
    }

    // Enviar email de confirmación de cita
    async enviarConfirmacionCita(datosEmail) {
        try {
            const templateParams = {
                to_email: datosEmail.emailPaciente,
                to_name: datosEmail.nombrePaciente,
                fecha_cita: datosEmail.fechaCita,
                hora_cita: datosEmail.horaCita,
                doctor: datosEmail.nombreDoctor,
                especialidad: datosEmail.especialidad,
                clinica_nombre: datosEmail.nombreClinica || 'Clínica Médica',
                clinica_direccion: datosEmail.direccionClinica || 'Dirección de la clínica',
                clinica_telefono: datosEmail.telefonoClinica || '(000) 000-0000'
            };

            const response = await emailjs.send(
                this.serviceId,
                this.templateId,
                templateParams,
                this.publicKey
            );

            console.log('Email enviado exitosamente:', response);
            return {
                success: true,
                message: 'Email de confirmación enviado correctamente',
                response: response
            };

        } catch (error) {
            console.error('Error enviando email:', error);
            return {
                success: false,
                message: 'Error al enviar el email de confirmación',
                error: error
            };
        }
    }

    // Función para agendar cita y enviar confirmación
    async agendarCitaConEmail(datosCita) {
        try {
            // Aquí iría tu lógica para guardar la cita en la base de datos
            // Por ahora simulo que se guardó correctamente
            
            const citaGuardada = {
                id: Date.now(), // ID temporal
                ...datosCita,
                estado: 'confirmada'
            };

            // Enviar email de confirmación
            const resultadoEmail = await this.enviarConfirmacionCita({
                emailPaciente: datosCita.email,
                nombrePaciente: datosCita.nombre,
                fechaCita: this.formatearFecha(datosCita.fecha),
                horaCita: datosCita.hora,
                nombreDoctor: datosCita.doctor,
                especialidad: datosCita.especialidad,
                nombreClinica: datosCita.nombreClinica,
                direccionClinica: datosCita.direccionClinica,
                telefonoClinica: datosCita.telefonoClinica
            });

            return {
                cita: citaGuardada,
                email: resultadoEmail
            };

        } catch (error) {
            console.error('Error agendando cita:', error);
            throw error;
        }
    }

    // Formatear fecha para mostrar en español
    formatearFecha(fecha) {
        const opciones = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return new Date(fecha).toLocaleDateString('es-ES', opciones);
    }
}

// Exportar para uso en otros archivos
window.EmailService = EmailService;