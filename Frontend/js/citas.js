// Sistema de citas con modal de confirmación de email
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar EmailJS
    emailjs.init('tfi1ksSYUgEyQxZ6I');
    
    // Variable global para almacenar datos de la cita actual
    let citaActual = null;
    
    // Función principal para agendar cita
    async function agendarCita(event) {
        event.preventDefault();
        
        // Obtener datos del formulario
        const datosCita = {
            nombre: document.getElementById('nombrePaciente').value,
            email: document.getElementById('emailPaciente').value,
            fecha: document.getElementById('fechaCita').value,
            hora: document.getElementById('horaCita').value,
            doctor: document.getElementById('doctor').value,
            especialidad: document.getElementById('especialidad').value
        };
        
        try {
            // Mostrar loading
            mostrarLoading(true);
            
            // Simular guardado de cita (aquí iría tu lógica de base de datos)
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simular delay
            
            // Guardar datos para el modal
            citaActual = datosCita;
            
            // Ocultar loading
            mostrarLoading(false);
            
            // Mostrar modal de confirmación de email
            mostrarModalEmail(datosCita);
            
            // Mostrar mensaje de éxito
            mostrarMensaje('¡Cita agendada exitosamente!', 'success');
            limpiarFormulario();
            
        } catch (error) {
            console.error('Error:', error);
            mostrarMensaje('Error al agendar la cita. Por favor intente nuevamente.', 'error');
            mostrarLoading(false);
        }
    }
    
    // Función para mostrar modal de confirmación de email
    function mostrarModalEmail(datosCita) {
        // Crear modal si no existe
        let modal = document.getElementById('modalEmail');
        if (!modal) {
            crearModalEmail();
            modal = document.getElementById('modalEmail');
        }
        
        // Actualizar información en el modal
        document.getElementById('modalNombrePaciente').textContent = datosCita.nombre;
        document.getElementById('modalEmailPaciente').textContent = datosCita.email;
        document.getElementById('modalFechaCita').textContent = formatearFecha(datosCita.fecha);
        document.getElementById('modalHoraCita').textContent = datosCita.hora;
        document.getElementById('modalDoctor').textContent = datosCita.doctor;
        document.getElementById('modalEspecialidad').textContent = datosCita.especialidad;
        
        // Mostrar modal
        modal.style.display = 'block';
    }
    
    // Función para crear el modal HTML
    function crearModalEmail() {
        const modalHTML = `
            <div id="modalEmail" style="display: none; position: fixed !important; z-index: 9999 !important; left: 0 !important; top: 0 !important; width: 100% !important; height: 100% !important; background-color: rgba(0,0,0,0.7) !important; font-family: Arial, sans-serif !important;">
                <div style="background-color: #ffffff !important; margin: 5% auto !important; padding: 25px !important; border: none !important; border-radius: 12px !important; width: 90% !important; max-width: 550px !important; box-shadow: 0 8px 32px rgba(0,0,0,0.4) !important; position: relative !important;">
                    
                    <!-- Botón X para cerrar -->
                    <button id="btnCerrarModalX" style="position: absolute !important; top: 15px !important; right: 20px !important; background: none !important; border: none !important; font-size: 24px !important; cursor: pointer !important; color: #999 !important; padding: 0 !important; width: 30px !important; height: 30px !important; display: flex !important; align-items: center !important; justify-content: center !important;">×</button>
                    
                    <div style="text-align: center !important; margin-bottom: 25px !important;">
                        <h2 style="color: #2c3e50 !important; margin: 0 !important; font-size: 24px !important; font-weight: 600 !important;">📧 Enviar Email al Paciente</h2>
                    </div>
                    
                    <div>
                        <div style="background-color: #f8f9fa !important; padding: 20px !important; border-radius: 8px !important; margin-bottom: 25px !important; border: 1px solid #e9ecef !important;">
                            <h3 style="margin-top: 0 !important; margin-bottom: 15px !important; color: #495057 !important; font-size: 18px !important;">Información de la Cita:</h3>
                            <p style="margin: 8px 0 !important; color: #333 !important; font-size: 14px !important;"><strong>Paciente:</strong> <span id="modalNombrePaciente"></span></p>
                            <p style="margin: 8px 0 !important; color: #333 !important; font-size: 14px !important;"><strong>Email:</strong> <span id="modalEmailPaciente"></span></p>
                            <p style="margin: 8px 0 !important; color: #333 !important; font-size: 14px !important;"><strong>Fecha:</strong> <span id="modalFechaCita"></span></p>
                            <p style="margin: 8px 0 !important; color: #333 !important; font-size: 14px !important;"><strong>Hora:</strong> <span id="modalHoraCita"></span></p>
                            <p style="margin: 8px 0 !important; color: #333 !important; font-size: 14px !important;"><strong>Doctor:</strong> <span id="modalDoctor"></span></p>
                            <p style="margin: 8px 0 !important; color: #333 !important; font-size: 14px !important;"><strong>Especialidad:</strong> <span id="modalEspecialidad"></span></p>
                        </div>
                        
                        <p style="text-align: center !important; color: #6c757d !important; margin-bottom: 25px !important; font-size: 16px !important;">
                            ¿Deseas enviar un email de confirmación al paciente?
                        </p>
                    </div>
                    
                    <div style="text-align: center !important;">
                        <button id="btnEnviarEmail" style="background-color: #28a745 !important; color: white !important; padding: 14px 35px !important; border: none !important; border-radius: 6px !important; cursor: pointer !important; margin-right: 15px !important; font-size: 16px !important; font-weight: 500 !important; transition: background-color 0.2s !important;">
                            📧 Enviar Email
                        </button>
                        <button id="btnCerrarModal" style="background-color: #6c757d !important; color: white !important; padding: 14px 35px !important; border: none !important; border-radius: 6px !important; cursor: pointer !important; font-size: 16px !important; font-weight: 500 !important; transition: background-color 0.2s !important;">
                            Cerrar
                        </button>
                    </div>
                    
                    <div id="modalLoading" style="display: none !important; text-align: center !important; margin-top: 20px !important;">
                        <p style="color: #007bff !important; font-size: 16px !important; margin: 0 !important;">Enviando email... ⏳</p>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Agregar event listeners
        document.getElementById('btnEnviarEmail').addEventListener('click', enviarEmailDesdeModal);
        document.getElementById('btnCerrarModal').addEventListener('click', cerrarModal);
        document.getElementById('btnCerrarModalX').addEventListener('click', cerrarModal);
        
        // Cerrar modal al hacer clic fuera
        document.getElementById('modalEmail').addEventListener('click', function(e) {
            if (e.target === this) {
                cerrarModal();
            }
        });
    }
    
    // Función para enviar email desde el modal (usando la lógica del test-email.js)
    async function enviarEmailDesdeModal() {
        if (!citaActual) {
            mostrarMensaje('Error: No hay datos de cita disponibles', 'error');
            return;
        }
        
        // Mostrar loading en el modal
        document.getElementById('modalLoading').style.display = 'block';
        document.getElementById('btnEnviarEmail').disabled = true;
        document.getElementById('btnEnviarEmail').textContent = 'Enviando...';
        
        try {
            console.log('📧 Enviando email a:', citaActual.email);
            
            // Preparar datos del template (igual que en test-email.js)
            const templateParams = {
                to_email: citaActual.email,
                to_name: citaActual.nombre,
                fecha_cita: formatearFecha(citaActual.fecha),
                hora_cita: citaActual.hora,
                doctor: citaActual.doctor,
                especialidad: citaActual.especialidad,
                clinica_nombre: 'EVA Cirugía Corporal',
                clinica_direccion: 'Avenida Roosevelt #26-61',
                clinica_telefono: '+57 318 8042578'
            };
            
            // Enviar email usando la misma configuración que funciona en test-email.js
            const response = await emailjs.send(
                'service_2re2org',    // Service ID
                'template_rxar2ok',   // Template ID
                templateParams,
                'tfi1ksSYUgEyQxZ6I'   // Public Key
            );
            
            console.log('✅ EMAIL ENVIADO EXITOSAMENTE!', response);
            mostrarMensaje('✅ Email enviado correctamente al paciente!', 'success');
            cerrarModal();
            
        } catch (error) {
            console.error('❌ ERROR ENVIANDO EMAIL:', error);
            mostrarMensaje('❌ Error enviando email. Revisa la consola para más detalles.', 'error');
            
            // Debugging adicional
            if (error.status === 400) {
                console.error('Error 400: Verifica que el template ID y service ID sean correctos');
            } else if (error.status === 401) {
                console.error('Error 401: Verifica tu public key');
            } else if (error.status === 404) {
                console.error('Error 404: Template o service no encontrado');
            }
        } finally {
            // Restaurar botón
            document.getElementById('modalLoading').style.display = 'none';
            document.getElementById('btnEnviarEmail').disabled = false;
            document.getElementById('btnEnviarEmail').textContent = '📧 Enviar Email';
        }
    }
    
    // Función para cerrar modal
    function cerrarModal() {
        const modal = document.getElementById('modalEmail');
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    // Función para formatear fecha
    function formatearFecha(fecha) {
        const opciones = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return new Date(fecha).toLocaleDateString('es-ES', opciones);
    }
    
    // Funciones auxiliares
    function mostrarLoading(mostrar) {
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.style.display = mostrar ? 'block' : 'none';
        }
    }
    
    function mostrarMensaje(mensaje, tipo) {
        // Crear elemento de mensaje
        const mensajeDiv = document.createElement('div');
        mensajeDiv.className = `alert alert-${tipo}`;
        mensajeDiv.textContent = mensaje;
        
        // Agregar al DOM
        const container = document.getElementById('mensajes') || document.body;
        container.appendChild(mensajeDiv);
        
        // Remover después de 5 segundos
        setTimeout(() => {
            mensajeDiv.remove();
        }, 5000);
    }
    
    function limpiarFormulario() {
        const form = document.getElementById('formCita');
        if (form) {
            form.reset();
        }
    }
    
    // Agregar event listener al formulario
    const formCita = document.getElementById('formCita');
    if (formCita) {
        formCita.addEventListener('submit', agendarCita);
    }
    
    // Función de prueba para mostrar el modal directamente
    function probarModal() {
        const datosPrueba = {
            nombre: 'Juan Pérez',
            email: 'jorge777andres@gmail.com',
            fecha: '2024-02-05',
            hora: '10:30 AM',
            doctor: 'Dr. García',
            especialidad: 'Cirugía Plástica'
        };
        
        citaActual = datosPrueba;
        mostrarModalEmail(datosPrueba);
    }
    
    // Hacer funciones disponibles globalmente
    window.agendarCita = agendarCita;
    window.mostrarModalEmail = mostrarModalEmail;
    window.mostrarModalEmailCalendario = mostrarModalEmail; // Alias para calendario
    window.probarModal = probarModal;
});