// ===================== CALENDARIO PROFESIONAL =====================

class CalendarioManager {
    constructor() {
        this.fechaActual = new Date();
        this.mesActual = this.fechaActual.getMonth();
        this.añoActual = this.fechaActual.getFullYear();
        this.citasDelMes = [];
        this.diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        this.meses = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        this.coloresCitas = {
            'pendiente': '#f59e0b',
            'confirmada': '#10b981',
            'completada': '#e91e63',
            'cancelada': '#ef4444',
            'urgente': '#dc2626'
        };
    }

    // Inicializar el calendario
    inicializar() {
        this.renderizarCalendario();
        this.configurarEventListeners();
    }

    // Configurar event listeners
    configurarEventListeners() {
        // Navegación del calendario
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('calendario-prev')) {
                this.mesAnterior();
            } else if (e.target.classList.contains('calendario-next')) {
                this.mesSiguiente();
            } else if (e.target.classList.contains('calendario-hoy')) {
                this.irAHoy();
            }
        });
    }

    // Renderizar el calendario completo
    renderizarCalendario() {
        const container = document.getElementById('calendario');
        if (!container) return;

        const html = `
            <div class="calendario-wrapper">
                <!-- Header del calendario -->
                <div class="calendario-header">
                    <div class="calendario-navegacion">
                        <button class="btn btn-sm btn-secondary calendario-prev" title="Mes anterior">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <h3 class="calendario-titulo">${this.meses[this.mesActual]} ${this.añoActual}</h3>
                        <button class="btn btn-sm btn-secondary calendario-next" title="Mes siguiente">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                    <button class="btn btn-sm btn-primary calendario-hoy">Hoy</button>
                </div>

                <!-- Días de la semana -->
                <div class="calendario-dias-semana">
                    ${this.diasSemana.map(dia => `<div class="calendario-dia-semana">${dia}</div>`).join('')}
                </div>

                <!-- Grid del calendario -->
                <div class="calendario-grid" id="calendarioGrid">
                    ${this.generarDiasDelMes()}
                </div>

                <!-- Leyenda -->
                <div class="calendario-leyenda">
                    <div class="leyenda-item">
                        <span class="leyenda-color" style="background-color: ${this.coloresCitas.pendiente}"></span>
                        <span>Pendiente</span>
                    </div>
                    <div class="leyenda-item">
                        <span class="leyenda-color" style="background-color: ${this.coloresCitas.confirmada}"></span>
                        <span>Confirmada</span>
                    </div>
                    <div class="leyenda-item">
                        <span class="leyenda-color" style="background-color: ${this.coloresCitas.completada}"></span>
                        <span>Completada</span>
                    </div>
                    <div class="leyenda-item">
                        <span class="leyenda-color" style="background-color: ${this.coloresCitas.urgente}"></span>
                        <span>Urgente</span>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;
        this.cargarCitasDelMes();
    }

    // Generar los días del mes
    generarDiasDelMes() {
        const primerDia = new Date(this.añoActual, this.mesActual, 1);
        const ultimoDia = new Date(this.añoActual, this.mesActual + 1, 0);
        const diasEnMes = ultimoDia.getDate();
        const primerDiaSemana = primerDia.getDay();
        
        // Días del mes anterior para completar la primera semana
        const mesAnterior = new Date(this.añoActual, this.mesActual, 0);
        const diasMesAnterior = mesAnterior.getDate();
        
        let html = '';
        
        // Días del mes anterior
        for (let i = primerDiaSemana - 1; i >= 0; i--) {
            const dia = diasMesAnterior - i;
            html += `<div class="calendario-dia calendario-dia-otro-mes" data-fecha="${this.añoActual}-${String(this.mesActual).padStart(2, '0')}-${String(dia).padStart(2, '0')}">
                <span class="calendario-numero">${dia}</span>
                <div class="calendario-eventos"></div>
            </div>`;
        }
        
        // Días del mes actual
        const hoy = new Date();
        const esHoy = (dia) => {
            return hoy.getDate() === dia && 
                   hoy.getMonth() === this.mesActual && 
                   hoy.getFullYear() === this.añoActual;
        };
        
        for (let dia = 1; dia <= diasEnMes; dia++) {
            const claseHoy = esHoy(dia) ? 'calendario-dia-hoy' : '';
            const fechaCompleta = `${this.añoActual}-${String(this.mesActual + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
            
            html += `<div class="calendario-dia ${claseHoy}" data-fecha="${fechaCompleta}" onclick="calendarioManager.seleccionarDia('${fechaCompleta}')">
                <span class="calendario-numero">${dia}</span>
                <div class="calendario-eventos" id="eventos-${fechaCompleta}"></div>
            </div>`;
        }
        
        // Días del mes siguiente para completar la última semana
        const diasRestantes = 42 - (primerDiaSemana + diasEnMes); // 6 semanas * 7 días
        for (let dia = 1; dia <= diasRestantes; dia++) {
            const fechaCompleta = `${this.añoActual}-${String(this.mesActual + 2).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
            html += `<div class="calendario-dia calendario-dia-otro-mes" data-fecha="${fechaCompleta}">
                <span class="calendario-numero">${dia}</span>
                <div class="calendario-eventos"></div>
            </div>`;
        }
        
        return html;
    }

    // Cargar citas del mes actual
    async cargarCitasDelMes() {
        try {
            // Obtener todas las citas
            const todasLasCitas = await Firebase.CitasService.obtenerCitas();
            
            // Filtrar citas del mes actual
            this.citasDelMes = todasLasCitas.filter(cita => {
                if (!cita.fechaCita) return false;
                
                const fechaCita = cita.fechaCita.seconds ? 
                    new Date(cita.fechaCita.seconds * 1000) :
                    new Date(cita.fechaCita);
                
                return fechaCita.getMonth() === this.mesActual && 
                       fechaCita.getFullYear() === this.añoActual;
            });
            
            this.mostrarCitasEnCalendario();
        } catch (error) {
            console.error('Error cargando citas del mes:', error);
        }
    }

    // Mostrar citas en el calendario
    mostrarCitasEnCalendario() {
        // Limpiar eventos previos
        document.querySelectorAll('.calendario-eventos').forEach(container => {
            container.innerHTML = '';
        });
        
        // Agrupar citas por día
        const citasPorDia = {};
        this.citasDelMes.forEach(cita => {
            const fechaCita = cita.fechaCita.seconds ? 
                new Date(cita.fechaCita.seconds * 1000) :
                new Date(cita.fechaCita);
            
            const fechaKey = fechaCita.toISOString().split('T')[0];
            
            if (!citasPorDia[fechaKey]) {
                citasPorDia[fechaKey] = [];
            }
            citasPorDia[fechaKey].push(cita);
        });
        
        // Mostrar citas en cada día
        Object.keys(citasPorDia).forEach(fecha => {
            const container = document.getElementById(`eventos-${fecha}`);
            if (!container) return;
            
            const citasDelDia = citasPorDia[fecha];
            
            // Mostrar máximo 3 citas, el resto como "+X más"
            const citasAMostrar = citasDelDia.slice(0, 3);
            const citasRestantes = citasDelDia.length - 3;
            
            let html = '';
            
            citasAMostrar.forEach(cita => {
                let nombrePaciente = 'Paciente';
                
                if (cita.tipoPaciente === 'externo' && cita.pacienteExterno) {
                    nombrePaciente = cita.pacienteExterno.nombre;
                } else if (cita.idPaciente) {
                    const paciente = pacientes.find(p => p.id === cita.idPaciente);
                    nombrePaciente = paciente ? `${paciente.nombre} ${paciente.apellido}` : 'Paciente';
                }
                
                const color = this.coloresCitas[cita.estado] || this.coloresCitas.pendiente;
                
                const fechaCita = cita.fechaCita.seconds ? 
                    new Date(cita.fechaCita.seconds * 1000) :
                    new Date(cita.fechaCita);
                const hora = fechaCita.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                
                html += `
                    <div class="calendario-evento" 
                         style="background-color: ${color}" 
                         title="${hora} - ${nombrePaciente}: ${cita.motivo}"
                         onclick="calendarioManager.verDetalleCita('${cita.id}')">
                        <span class="evento-hora">${hora}</span>
                        <span class="evento-paciente">${nombrePaciente}</span>
                    </div>
                `;
            });
            
            if (citasRestantes > 0) {
                html += `<div class="calendario-evento-mas" onclick="calendarioManager.verTodasLasCitasDelDia('${fecha}')">
                    +${citasRestantes} más
                </div>`;
            }
            
            container.innerHTML = html;
        });
    }

    // Navegación del calendario
    mesAnterior() {
        if (this.mesActual === 0) {
            this.mesActual = 11;
            this.añoActual--;
        } else {
            this.mesActual--;
        }
        this.renderizarCalendario();
    }

    mesSiguiente() {
        if (this.mesActual === 11) {
            this.mesActual = 0;
            this.añoActual++;
        } else {
            this.mesActual++;
        }
        this.renderizarCalendario();
    }

    irAHoy() {
        const hoy = new Date();
        this.mesActual = hoy.getMonth();
        this.añoActual = hoy.getFullYear();
        this.renderizarCalendario();
    }

    // Seleccionar un día específico
    seleccionarDia(fecha) {
        // Remover selección previa
        document.querySelectorAll('.calendario-dia-seleccionado').forEach(dia => {
            dia.classList.remove('calendario-dia-seleccionado');
        });
        
        // Agregar selección al día clickeado
        const diaElement = document.querySelector(`[data-fecha="${fecha}"]`);
        if (diaElement && !diaElement.classList.contains('calendario-dia-otro-mes')) {
            diaElement.classList.add('calendario-dia-seleccionado');
            this.mostrarCitasDelDiaSeleccionado(fecha);
        }
    }

    // Mostrar citas del día seleccionado
    mostrarCitasDelDiaSeleccionado(fecha) {
        const citasDelDia = this.citasDelMes.filter(cita => {
            const fechaCita = cita.fechaCita.seconds ? 
                new Date(cita.fechaCita.seconds * 1000) :
                new Date(cita.fechaCita);
            return fechaCita.toISOString().split('T')[0] === fecha;
        });
        
        // Actualizar la sección "Citas del Día"
        this.actualizarSeccionCitasDelDia(citasDelDia, fecha);
    }

    // Actualizar la sección de citas del día
    actualizarSeccionCitasDelDia(citas, fecha) {
        const container = document.getElementById('citasDelDia');
        if (!container) return;
        
        const fechaFormateada = new Date(fecha + 'T00:00:00').toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        if (citas.length === 0) {
            container.innerHTML = `
                <div class="text-center py-4">
                    <i class="fas fa-calendar-times fa-3x text-gray-400 mb-3"></i>
                    <h4>No hay citas</h4>
                    <p class="text-gray-600">No hay citas programadas para ${fechaFormateada}</p>
                    <button class="btn btn-primary btn-sm mt-2" onclick="abrirModalCita('${fecha}')">
                        <i class="fas fa-plus"></i> Agendar Cita
                    </button>
                </div>
            `;
            return;
        }
        
        const html = `
            <div class="citas-dia-header mb-3">
                <h4>${fechaFormateada}</h4>
                <span class="badge badge-primary">${citas.length} cita${citas.length !== 1 ? 's' : ''}</span>
            </div>
            ${citas.map(cita => this.generarTarjetaCita(cita)).join('')}
            <div class="text-center mt-3">
                <button class="btn btn-primary btn-sm" onclick="abrirModalCita('${fecha}')">
                    <i class="fas fa-plus"></i> Nueva Cita
                </button>
            </div>
        `;
        
        container.innerHTML = html;
    }

    // Generar tarjeta de cita
    generarTarjetaCita(cita) {
        let nombrePaciente = 'Paciente no encontrado';
        let telefonoPaciente = '';
        
        if (cita.tipoPaciente === 'externo' && cita.pacienteExterno) {
            nombrePaciente = cita.pacienteExterno.nombre;
            telefonoPaciente = cita.pacienteExterno.telefono;
        } else if (cita.idPaciente) {
            const paciente = pacientes.find(p => p.id === cita.idPaciente);
            if (paciente) {
                nombrePaciente = `${paciente.nombre} ${paciente.apellido}`;
                telefonoPaciente = paciente.telefono;
            }
        }
        
        const fechaCita = cita.fechaCita.seconds ? 
            new Date(cita.fechaCita.seconds * 1000) :
            new Date(cita.fechaCita);
        const hora = fechaCita.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        
        const estadoClass = {
            'pendiente': 'warning',
            'confirmada': 'success',
            'completada': 'primary',
            'cancelada': 'error',
            'urgente': 'error'
        }[cita.estado] || 'secondary';
        
        return `
            <div class="card mb-3 cita-card ${cita.estado === 'urgente' ? 'cita-urgente' : 'cita-normal'}">
                <div class="card-body">
                    <div class="flex justify-between items-start">
                        <div class="flex-1">
                            <h5 class="mb-1">${nombrePaciente}</h5>
                            <p class="text-sm text-gray-600 mb-1">
                                <i class="fas fa-clock mr-1"></i> ${hora}
                            </p>
                            <p class="text-sm mb-2">
                                <i class="fas fa-stethoscope mr-1"></i> ${cita.motivo}
                            </p>
                            <span class="badge badge-${estadoClass}">${cita.estado.toUpperCase()}</span>
                        </div>
                        <div class="flex flex-col gap-1">
                            <button class="btn btn-sm btn-primary" 
                                    onclick="editarCita('${cita.id}')" 
                                    title="Editar cita">
                                <i class="fas fa-edit"></i>
                            </button>
                            ${cita.estado === 'pendiente' || cita.estado === 'confirmada' ? `
                                <button class="btn btn-sm btn-success" 
                                        onclick="completarCita('${cita.id}')" 
                                        title="Marcar como completada">
                                    <i class="fas fa-check"></i>
                                </button>
                            ` : ''}
                            <button class="btn btn-sm btn-secondary" 
                                    onclick="crearHistoriaDesdeCita('${cita.id}')" 
                                    title="Crear historia clínica">
                                <i class="fas fa-file-medical"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Ver detalle de una cita
    verDetalleCita(idCita) {
        const cita = this.citasDelMes.find(c => c.id === idCita);
        if (!cita) return;
        
        let infoPaciente = '';
        let tipoPacienteTexto = '';
        
        if (cita.tipoPaciente === 'externo' && cita.pacienteExterno) {
            tipoPacienteTexto = 'Paciente Externo';
            infoPaciente = `
                <p><strong>Nombre:</strong> ${cita.pacienteExterno.nombre}</p>
                <p><strong>Teléfono:</strong> ${cita.pacienteExterno.telefono}</p>
                ${cita.pacienteExterno.cedula ? `<p><strong>Cédula:</strong> ${cita.pacienteExterno.cedula}</p>` : ''}
                ${cita.pacienteExterno.email ? `<p><strong>Email:</strong> ${cita.pacienteExterno.email}</p>` : ''}
            `;
        } else if (cita.idPaciente) {
            const paciente = pacientes.find(p => p.id === cita.idPaciente);
            tipoPacienteTexto = 'Paciente Registrado';
            if (paciente) {
                infoPaciente = `
                    <p><strong>Nombre:</strong> ${paciente.nombre} ${paciente.apellido}</p>
                    <p><strong>Cédula:</strong> ${paciente.cedula}</p>
                    <p><strong>Teléfono:</strong> ${paciente.telefono}</p>
                    ${paciente.email ? `<p><strong>Email:</strong> ${paciente.email}</p>` : ''}
                `;
            } else {
                infoPaciente = '<p><strong>Paciente:</strong> No encontrado</p>';
            }
        }
        
        const fechaCita = cita.fechaCita.seconds ? 
            new Date(cita.fechaCita.seconds * 1000) :
            new Date(cita.fechaCita);
        
        const estadoClass = {
            'pendiente': 'warning',
            'confirmada': 'success',
            'completada': 'primary',
            'cancelada': 'error',
            'urgente': 'error'
        }[cita.estado] || 'secondary';
        
        const modalBody = `
            <div class="cita-detalle">
                <div class="grid grid-2 gap-4">
                    <div>
                        <h4>Información del Paciente</h4>
                        <p><strong>Tipo:</strong> <span class="badge badge-secondary">${tipoPacienteTexto}</span></p>
                        ${infoPaciente}
                    </div>
                    <div>
                        <h4>Información de la Cita</h4>
                        <p><strong>Fecha:</strong> ${fechaCita.toLocaleDateString('es-ES', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}</p>
                        <p><strong>Hora:</strong> ${fechaCita.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
                        <p><strong>Estado:</strong> <span class="badge badge-${estadoClass}">${cita.estado.toUpperCase()}</span></p>
                    </div>
                </div>
                <div class="mt-4">
                    <h4>Motivo de la Cita</h4>
                    <p>${cita.motivo}</p>
                </div>
                ${cita.observaciones ? `
                    <div class="mt-4">
                        <h4>Observaciones</h4>
                        <p>${cita.observaciones}</p>
                    </div>
                ` : ''}
            </div>
        `;
        
        const modalFooter = `
            <button type="button" class="btn btn-secondary" onclick="cerrarModal()">Cerrar</button>
            <button type="button" class="btn btn-primary" onclick="editarCita('${cita.id}')">
                <i class="fas fa-edit"></i> Editar
            </button>
            ${cita.estado !== 'completada' ? `
                <button type="button" class="btn btn-success" onclick="completarCita('${cita.id}')">
                    <i class="fas fa-check"></i> Completar
                </button>
            ` : ''}
        `;
        
        abrirModal('Detalle de Cita', modalBody, modalFooter);
    }

    // Ver todas las citas de un día
    verTodasLasCitasDelDia(fecha) {
        this.seleccionarDia(fecha);
    }

    // Actualizar calendario cuando se agregue/modifique una cita
    actualizarCalendario() {
        this.cargarCitasDelMes();
    }
}

// Instancia global del calendario
let calendarioManager;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Esperar a que Firebase esté disponible
    setTimeout(() => {
        if (window.Firebase && typeof firebase !== 'undefined') {
            calendarioManager = new CalendarioManager();
            window.calendarioManager = calendarioManager;
        }
    }, 1500);
});

// Función para abrir modal de cita con fecha preseleccionada
window.abrirModalCita = function(fechaPreseleccionada = null) {
    const modalBody = `
        <form id="formCita">
            <!-- Selector de tipo de paciente -->
            <div class="form-group">
                <label class="form-label">Tipo de Paciente</label>
                <div class="flex gap-4">
                    <label class="radio-option">
                        <input type="radio" name="tipoPaciente" value="registrado" checked onchange="toggleTipoPaciente()">
                        <span>Paciente Registrado</span>
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="tipoPaciente" value="externo" onchange="toggleTipoPaciente()">
                        <span>Paciente Externo</span>
                    </label>
                </div>
            </div>

            <!-- Sección para paciente registrado -->
            <div id="pacienteRegistrado" class="form-group">
                <label class="form-label">Seleccionar Paciente</label>
                <select name="idPaciente" class="form-select">
                    <option value="">Seleccionar paciente registrado</option>
                    ${pacientes.map(p => `<option value="${p.id}">${p.nombre} ${p.apellido} - ${p.cedula}</option>`).join('')}
                </select>
            </div>

            <!-- Sección para paciente externo -->
            <div id="pacienteExterno" class="hidden">
                <div class="grid grid-2 gap-4">
                    <div class="form-group">
                        <label class="form-label">Nombre Completo *</label>
                        <input type="text" name="nombreExterno" class="form-input" placeholder="Nombre y apellido">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Teléfono *</label>
                        <input type="tel" name="telefonoExterno" class="form-input" placeholder="Número de contacto">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Cédula/ID</label>
                        <input type="text" name="cedulaExterno" class="form-input" placeholder="Documento de identidad">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Email</label>
                        <input type="email" name="emailExterno" class="form-input" placeholder="Correo electrónico">
                    </div>
                </div>
            </div>

            <div class="grid grid-2 gap-4">
                <div class="form-group">
                    <label class="form-label">Fecha y Hora *</label>
                    <input type="datetime-local" name="fechaCita" class="form-input cita-datetime" required 
                           ${fechaPreseleccionada ? `value="${fechaPreseleccionada}T09:00"` : ''}>
                </div>
                <div class="form-group">
                    <label class="form-label">Estado</label>
                    <select name="estado" class="form-select" required>
                        <option value="pendiente">Pendiente</option>
                        <option value="confirmada">Confirmada</option>
                        <option value="urgente">Urgente</option>
                    </select>
                </div>
            </div>
            
            <div class="form-group">
                <label class="form-label">Motivo de la Cita *</label>
                <select name="motivo" class="form-select" required>
                    <option value="">Seleccionar motivo</option>
                    <option value="Consulta inicial">Consulta inicial</option>
                    <option value="Evaluación pre-operatoria">Evaluación pre-operatoria</option>
                    <option value="Control post-operatorio">Control post-operatorio</option>
                    <option value="Consulta de seguimiento">Consulta de seguimiento</option>
                    <option value="Revisión de resultados">Revisión de resultados</option>
                    <option value="Consulta de segunda opinión">Consulta de segunda opinión</option>
                    <option value="Tratamiento no quirúrgico">Tratamiento no quirúrgico</option>
                    <option value="Otro">Otro</option>
                </select>
            </div>
            
            <div class="form-group">
                <label class="form-label">Observaciones</label>
                <textarea name="observaciones" class="form-textarea" placeholder="Observaciones adicionales, detalles específicos del motivo, etc."></textarea>
            </div>
        </form>
    `;

    const modalFooter = `
        <button type="button" class="btn btn-secondary" onclick="cerrarModal()">Cancelar</button>
        <button type="button" class="btn btn-primary" onclick="guardarCitaCalendario()">
            <i class="fas fa-calendar-plus"></i> Agendar Cita
        </button>
    `;

    abrirModal('Nueva Cita - EVA Cirugía Corporal', modalBody, modalFooter, 'cita');
};

// Función para alternar entre tipo de paciente
window.toggleTipoPaciente = function() {
    const tipoPaciente = document.querySelector('input[name="tipoPaciente"]:checked').value;
    const pacienteRegistrado = document.getElementById('pacienteRegistrado');
    const pacienteExterno = document.getElementById('pacienteExterno');
    
    if (tipoPaciente === 'registrado') {
        pacienteRegistrado.classList.remove('hidden');
        pacienteExterno.classList.add('hidden');
        
        // Hacer requerido el select de paciente registrado
        document.querySelector('select[name="idPaciente"]').required = true;
        
        // Quitar requerido de campos externos
        document.querySelector('input[name="nombreExterno"]').required = false;
        document.querySelector('input[name="telefonoExterno"]').required = false;
    } else {
        pacienteRegistrado.classList.add('hidden');
        pacienteExterno.classList.remove('hidden');
        
        // Quitar requerido del select de paciente registrado
        document.querySelector('select[name="idPaciente"]').required = false;
        
        // Hacer requeridos los campos externos
        document.querySelector('input[name="nombreExterno"]').required = true;
        document.querySelector('input[name="telefonoExterno"]').required = true;
    }
};

// Función para guardar cita desde el calendario
window.guardarCitaCalendario = async function() {
    const form = document.getElementById('formCita');
    const formData = new FormData(form);
    const datos = Object.fromEntries(formData);
    
    try {
        // Validar campos requeridos según el tipo de paciente
        const tipoPaciente = datos.tipoPaciente;
        
        if (tipoPaciente === 'registrado') {
            if (!datos.idPaciente) {
                mostrarToast('❌ Debe seleccionar un paciente registrado', 'error');
                return;
            }
        } else if (tipoPaciente === 'externo') {
            if (!datos.nombreExterno || !datos.telefonoExterno) {
                mostrarToast('❌ Debe completar nombre y teléfono del paciente externo', 'error');
                return;
            }
            
            // Crear objeto de paciente externo
            datos.pacienteExterno = {
                nombre: datos.nombreExterno,
                telefono: datos.telefonoExterno,
                cedula: datos.cedulaExterno || '',
                email: datos.emailExterno || ''
            };
            
            // Limpiar campos individuales del paciente externo
            delete datos.nombreExterno;
            delete datos.telefonoExterno;
            delete datos.cedulaExterno;
            delete datos.emailExterno;
            
            // Limpiar idPaciente para pacientes externos
            delete datos.idPaciente;
        }
        
        // Convertir fecha a Timestamp de Firebase
        datos.fechaCita = firebase.firestore.Timestamp.fromDate(new Date(datos.fechaCita));
        
        await Firebase.CitasService.crearCita(datos);
        mostrarToast('✅ Cita agendada correctamente', 'success');
        cerrarModal();
        
        // Actualizar calendario y citas
        if (window.calendarioManager) {
            window.calendarioManager.actualizarCalendario();
        }
        if (typeof cargarCitas === 'function') {
            cargarCitas();
        }
    } catch (error) {
        console.error('Error guardando cita:', error);
        mostrarToast('❌ Error agendando cita: ' + error.message, 'error');
    }
};

// Las funciones editarCita, completarCita, eliminarCita y actualizarCita
// están implementadas en General.js y son accesibles globalmente

// Exportar para uso global
window.CalendarioManager = CalendarioManager;