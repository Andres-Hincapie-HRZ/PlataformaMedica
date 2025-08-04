// ===================== MODAL DE EMAIL PARA CITAS =====================

// Variable global para almacenar datos de la cita actual
let citaActualEmail = null;

// Función principal para mostrar modal de email
window.mostrarModalEmailCita = function(datosCita) {
    console.log('📧 Mostrando modal de email con datos:', datosCita);
    
    // Guardar datos globalmente
    citaActualEmail = datosCita;
    
    // Crear modal si no existe
    let modal = document.getElementById('modalEmailCita');
    if (!modal) {
        crearModalEmailCita();
        modal = document.getElementById('modalEmailCita');
    }
    
    // Actualizar información en el modal
    document.getElementById('modalNombrePacienteCita').textContent = datosCita.nombre || 'N/A';
    document.getElementById('modalEmailPacienteCita').textContent = datosCita.email || 'N/A';
    document.getElementById('modalFechaCitaEmail').textContent = formatearFechaEmail(datosCita.fecha) || 'N/A';
    document.getElementById('modalHoraCitaEmail').textContent = datosCita.hora || 'N/A';
    document.getElementById('modalDoctorCita').textContent = datosCita.doctor || 'N/A';
    document.getElementById('modalEspecialidadCita').textContent = datosCita.especialidad || 'N/A';
    
    // Mostrar modal
    modal.style.display = 'block';
    console.log('✅ Modal mostrado correctamente');
};

// Función para crear el modal HTML
function crearModalEmailCita() {
    const modalHTML = `
        <div id="modalEmailCita" style="display: none; position: fixed !important; z-index: 10000 !important; left: 0 !important; top: 0 !important; width: 100% !important; height: 100% !important; background-color: rgba(0,0,0,0.8) !important; font-family: Arial, sans-serif !important;">
            <div style="background-color: #ffffff !important; margin: 3% auto !important; padding: 30px !important; border: none !important; border-radius: 15px !important; width: 90% !important; max-width: 600px !important; box-shadow: 0 10px 40px rgba(0,0,0,0.5) !important; position: relative !important;">
                
                <!-- Botón X para cerrar -->
                <button id="btnCerrarModalCitaX" style="position: absolute !important; top: 15px !important; right: 20px !important; background: none !important; border: none !important; font-size: 28px !important; cursor: pointer !important; color: #999 !important; padding: 0 !important; width: 35px !important; height: 35px !important; display: flex !important; align-items: center !important; justify-content: center !important; border-radius: 50% !important; transition: all 0.2s !important;">×</button>
                
                <div style="text-align: center !important; margin-bottom: 30px !important;">
                    <h2 style="color: #2c3e50 !important; margin: 0 !important; font-size: 26px !important; font-weight: 600 !important;">📧 Enviar Email al Paciente</h2>
                </div>
                
                <div>
                    <div style="background-color: #f8f9fa !important; padding: 25px !important; border-radius: 10px !important; margin-bottom: 30px !important; border: 1px solid #e9ecef !important;">
                        <h3 style="margin-top: 0 !important; margin-bottom: 20px !important; color: #495057 !important; font-size: 20px !important;">Información de la Cita:</h3>
                        <div style="display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 15px !important;">
                            <p style="margin: 8px 0 !important; color: #333 !important; font-size: 15px !important;"><strong>Paciente:</strong> <span id="modalNombrePacienteCita"></span></p>
                            <p style="margin: 8px 0 !important; color: #333 !important; font-size: 15px !important;"><strong>Email:</strong> <span id="modalEmailPacienteCita"></span></p>
                            <p style="margin: 8px 0 !important; color: #333 !important; font-size: 15px !important;"><strong>Fecha:</strong> <span id="modalFechaCitaEmail"></span></p>
                            <p style="margin: 8px 0 !important; color: #333 !important; font-size: 15px !important;"><strong>Hora:</strong> <span id="modalHoraCitaEmail"></span></p>
                            <p style="margin: 8px 0 !important; color: #333 !important; font-size: 15px !important;"><strong>Doctor:</strong> <span id="modalDoctorCita"></span></p>
                            <p style="margin: 8px 0 !important; color: #333 !important; font-size: 15px !important;"><strong>Especialidad:</strong> <span id="modalEspecialidadCita"></span></p>
                        </div>
                    </div>
                    
                    <p style="text-align: center !important; color: #6c757d !important; margin-bottom: 30px !important; font-size: 18px !important;">
                        ¿Deseas enviar un email de confirmación al paciente?
                    </p>
                </div>
                
                <div style="text-align: center !important;">
                    <button id="btnEnviarEmailCita" style="background-color: #28a745 !important; color: white !important; padding: 16px 40px !important; border: none !important; border-radius: 8px !important; cursor: pointer !important; margin-right: 20px !important; font-size: 18px !important; font-weight: 600 !important; transition: all 0.3s !important; box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3) !important;">
                        📧 Enviar Email
                    </button>
                    <button id="btnCerrarModalCita" style="background-color: #6c757d !important; color: white !important; padding: 16px 40px !important; border: none !important; border-radius: 8px !important; cursor: pointer !important; font-size: 18px !important; font-weight: 600 !important; transition: all 0.3s !important;">
                        Cerrar
                    </button>
                </div>
                
                <div id="modalLoadingCita" style="display: none !important; text-align: center !important; margin-top: 25px !important; padding: 20px !important; background-color: #e3f2fd !important; border-radius: 8px !important;">
                    <p style="color: #1976d2 !important; font-size: 18px !important; margin: 0 !important; font-weight: 500 !important;">⏳ Enviando email...</p>
                </div>
                
                <div id="modalResultadoCita" style="display: none !important; text-align: center !important; margin-top: 25px !important; padding: 20px !important; border-radius: 8px !important;">
                    <p id="modalMensajeCita" style="font-size: 16px !important; margin: 0 !important; font-weight: 500 !important;"></p>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Agregar event listeners
    document.getElementById('btnEnviarEmailCita').addEventListener('click', enviarEmailDesdeCita);
    document.getElementById('btnCerrarModalCita').addEventListener('click', cerrarModalEmailCita);
    document.getElementById('btnCerrarModalCitaX').addEventListener('click', cerrarModalEmailCita);
    
    // Cerrar modal al hacer clic fuera
    document.getElementById('modalEmailCita').addEventListener('click', function(e) {
        if (e.target === this) {
            cerrarModalEmailCita();
        }
    });
    
    // Efectos hover para botones
    const btnEnviar = document.getElementById('btnEnviarEmailCita');
    const btnCerrar = document.getElementById('btnCerrarModalCita');
    const btnX = document.getElementById('btnCerrarModalCitaX');
    
    btnEnviar.addEventListener('mouseenter', function() {
        this.style.backgroundColor = '#218838';
        this.style.transform = 'translateY(-2px)';
    });
    btnEnviar.addEventListener('mouseleave', function() {
        this.style.backgroundColor = '#28a745';
        this.style.transform = 'translateY(0)';
    });
    
    btnCerrar.addEventListener('mouseenter', function() {
        this.style.backgroundColor = '#5a6268';
    });
    btnCerrar.addEventListener('mouseleave', function() {
        this.style.backgroundColor = '#6c757d';
    });
    
    btnX.addEventListener('mouseenter', function() {
        this.style.backgroundColor = '#f8f9fa';
        this.style.color = '#dc3545';
    });
    btnX.addEventListener('mouseleave', function() {
        this.style.backgroundColor = 'transparent';
        this.style.color = '#999';
    });
    
    console.log('✅ Modal de email creado correctamente');
}

// Función para enviar email
async function enviarEmailDesdeCita() {
    console.log('🚀 Iniciando envío de email...');
    
    if (!citaActualEmail) {
        console.error('❌ No hay datos de cita disponibles');
        mostrarResultadoEmail('❌ Error: No hay datos de cita disponibles', 'error');
        return;
    }
    
    console.log('📧 Datos de la cita:', citaActualEmail);
    
    // Mostrar loading
    document.getElementById('modalLoadingCita').style.display = 'block';
    document.getElementById('modalResultadoCita').style.display = 'none';
    document.getElementById('btnEnviarEmailCita').disabled = true;
    document.getElementById('btnEnviarEmailCita').textContent = '⏳ Enviando...';
    
    try {
        // Inicializar EmailJS
        if (typeof emailjs !== 'undefined') {
            emailjs.init('tfi1ksSYUgEyQxZ6I');
            console.log('✅ EmailJS inicializado');
        } else {
            throw new Error('EmailJS no está disponible');
        }
        
        // Preparar datos del template
        const templateParams = {
            to_email: citaActualEmail.email,
            to_name: citaActualEmail.nombre,
            fecha_cita: formatearFechaEmail(citaActualEmail.fecha),
            hora_cita: citaActualEmail.hora,
            doctor: citaActualEmail.doctor,
            especialidad: citaActualEmail.especialidad,
            clinica_nombre: 'EVA Cirugía Corporal',
            clinica_direccion: 'Avenida Roosevelt #26-61',
            clinica_telefono: '+57 318 8042578'
        };
        
        console.log('📤 Enviando email con parámetros:', templateParams);
        
        // Enviar email
        const response = await emailjs.send(
            'service_2re2org',    // Service ID
            'template_rxar2ok',   // Template ID
            templateParams,
            'tfi1ksSYUgEyQxZ6I'   // Public Key
        );
        
        console.log('✅ EMAIL ENVIADO EXITOSAMENTE!', response);
        mostrarResultadoEmail('✅ Email enviado correctamente al paciente!', 'success');
        
        // Cerrar modal después de 2 segundos
        setTimeout(() => {
            cerrarModalEmailCita();
        }, 2000);
        
    } catch (error) {
        console.error('❌ ERROR ENVIANDO EMAIL:', error);
        let mensajeError = '❌ Error enviando email: ';
        
        if (error.status === 400) {
            mensajeError += 'Configuración incorrecta del servicio';
        } else if (error.status === 401) {
            mensajeError += 'Clave de acceso inválida';
        } else if (error.status === 404) {
            mensajeError += 'Servicio o plantilla no encontrada';
        } else {
            mensajeError += error.message || 'Error desconocido';
        }
        
        mostrarResultadoEmail(mensajeError, 'error');
    } finally {
        // Restaurar botón
        document.getElementById('modalLoadingCita').style.display = 'none';
        document.getElementById('btnEnviarEmailCita').disabled = false;
        document.getElementById('btnEnviarEmailCita').textContent = '📧 Enviar Email';
    }
}

// Función para mostrar resultado del envío
function mostrarResultadoEmail(mensaje, tipo) {
    const resultado = document.getElementById('modalResultadoCita');
    const mensajeElement = document.getElementById('modalMensajeCita');
    
    mensajeElement.textContent = mensaje;
    
    if (tipo === 'success') {
        resultado.style.backgroundColor = '#d4edda';
        resultado.style.color = '#155724';
        resultado.style.border = '1px solid #c3e6cb';
    } else {
        resultado.style.backgroundColor = '#f8d7da';
        resultado.style.color = '#721c24';
        resultado.style.border = '1px solid #f5c6cb';
    }
    
    resultado.style.display = 'block';
}

// Función para cerrar modal
function cerrarModalEmailCita() {
    const modal = document.getElementById('modalEmailCita');
    if (modal) {
        modal.style.display = 'none';
        // Limpiar datos
        citaActualEmail = null;
        // Restaurar estado inicial
        document.getElementById('modalLoadingCita').style.display = 'none';
        document.getElementById('modalResultadoCita').style.display = 'none';
        const btnEnviar = document.getElementById('btnEnviarEmailCita');
        if (btnEnviar) {
            btnEnviar.disabled = false;
            btnEnviar.textContent = '📧 Enviar Email';
        }
    }
    console.log('✅ Modal cerrado');
}

// Función para formatear fecha
function formatearFechaEmail(fecha) {
    if (!fecha) return 'Fecha no disponible';
    
    try {
        const opciones = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return new Date(fecha).toLocaleDateString('es-ES', opciones);
    } catch (error) {
        console.error('Error formateando fecha:', error);
        return fecha.toString();
    }
}

// Función de prueba
window.probarModalEmail = function() {
    const datosPrueba = {
        nombre: 'Juan Pérez',
        email: 'jorge777andres@gmail.com',
        fecha: '2024-08-08',
        hora: '12:59',
        doctor: 'Dr. García',
        especialidad: 'Cirugía Plástica'
    };
    
    mostrarModalEmailCita(datosPrueba);
};

console.log('✅ email-modal.js cargado correctamente');