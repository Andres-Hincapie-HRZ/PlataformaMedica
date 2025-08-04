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
        let nombrePaciente = 'Paciente Externo';
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
document.addEventListener('DOMContentLoaded', function () {
    // Esperar a que Firebase esté disponible
    setTimeout(() => {
        if (window.Firebase && typeof firebase !== 'undefined') {
            calendarioManager = new CalendarioManager();
            window.calendarioManager = calendarioManager;
        }
    }, 1500);
});

// Función para abrir modal de cita con fecha preseleccionada
window.abrirModalCita = async function (fechaPreseleccionada = null) {
    // Cargar doctores desde la base de datos
    let opcionesDoctores = '<option value="">Cargando doctores...</option>';
    try {
        const usuarios = await Firebase.UsuariosService.obtenerUsuarios();
        const doctores = usuarios.filter(u => u.activo && u.tipoDoctor && u.tipoDoctor !== 'Administrador');
        
        if (doctores.length > 0) {
            opcionesDoctores = '<option value="">Seleccionar doctor</option>' + 
                doctores.map(d => `<option value="${d.nombre}" data-especialidad="${d.tipoDoctor}">${d.nombre} - ${d.tipoDoctor}</option>`).join('');
        } else {
            opcionesDoctores = '<option value="">No hay doctores disponibles</option>';
        }
    } catch (error) {
        console.error('Error cargando doctores:', error);
        opcionesDoctores = '<option value="">Error cargando doctores</option>';
    }

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

            <!-- Campos para Doctor y Especialidad -->
            <div class="grid grid-2 gap-4">
                <div class="form-group">
                    <label class="form-label">Doctor *</label>
                    <select name="doctor" class="form-select" required onchange="actualizarEspecialidad()">
                        ${opcionesDoctores}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Especialidad *</label>
                    <select name="especialidad" class="form-select" required>
                        <option value="">Seleccionar doctor primero</option>
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
window.toggleTipoPaciente = function () {
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
window.guardarCitaCalendario = async function () {
    const form = document.getElementById('formCita');
    const formData = new FormData(form);
    const datos = Object.fromEntries(formData);

    try {
        // Validar campos requeridos
        if (!datos.doctor) {
            mostrarToast('❌ Debe seleccionar un doctor', 'error');
            return;
        }
        if (!datos.especialidad) {
            mostrarToast('❌ Debe seleccionar una especialidad', 'error');
            return;
        }

        // Validar campos requeridos según el tipo de paciente
        const tipoPaciente = datos.tipoPaciente;
        let emailPaciente = '';
        let nombrePaciente = '';

        if (tipoPaciente === 'registrado') {
            if (!datos.idPaciente) {
                mostrarToast('❌ Debe seleccionar un paciente registrado', 'error');
                return;
            }

            // Obtener datos del paciente registrado
            const paciente = pacientes.find(p => p.id === datos.idPaciente);
            if (paciente) {
                nombrePaciente = `${paciente.nombre} ${paciente.apellido}`;
                emailPaciente = paciente.email || '';
            }
        } else if (tipoPaciente === 'externo') {
            if (!datos.nombreExterno || !datos.telefonoExterno) {
                mostrarToast('❌ Debe completar nombre y teléfono del paciente externo', 'error');
                return;
            }

            nombrePaciente = datos.nombreExterno;
            emailPaciente = datos.emailExterno || '';

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
        const fechaCitaOriginal = datos.fechaCita;
        datos.fechaCita = firebase.firestore.Timestamp.fromDate(new Date(datos.fechaCita));

        // Guardar la cita en Firebase
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

        // Mostrar modal de confirmación de email si hay email
        if (emailPaciente && emailPaciente.trim() !== '') {
            // Preparar datos para el modal de email
            const datosCita = {
                nombre: nombrePaciente,
                email: emailPaciente,
                fecha: fechaCitaOriginal.split('T')[0], // Solo la fecha
                hora: new Date(fechaCitaOriginal).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
                doctor: datos.doctor,
                especialidad: datos.especialidad
            };

            // Usar la función del archivo citas.js para mostrar el modal
            if (typeof window.mostrarModalEmailCalendario === 'function') {
                window.mostrarModalEmailCalendario(datosCita);
            } else {
                // Crear modal de email directamente aquí
                setTimeout(() => {
                    mostrarModalEmailDirecto(datosCita);
                }, 500);
            }
        }

    } catch (error) {
        console.error('Error guardando cita:', error);
        mostrarToast('❌ Error agendando cita: ' + error.message, 'error');
    }
};

// Función para mostrar modal de email directamente desde calendario
window.mostrarModalEmailDirecto = function (datosCita) {
    // Crear modal si no existe
    let modal = document.getElementById('modalEmailCalendario');
    if (!modal) {
        crearModalEmailCalendario();
        modal = document.getElementById('modalEmailCalendario');
    }

    // Actualizar información en el modal
    document.getElementById('modalNombrePacienteCalendario').textContent = datosCita.nombre;
    document.getElementById('modalEmailPacienteCalendario').textContent = datosCita.email;
    document.getElementById('modalFechaCitaCalendario').textContent = formatearFechaCalendario(datosCita.fecha);
    document.getElementById('modalHoraCitaCalendario').textContent = datosCita.hora;
    document.getElementById('modalDoctorCalendario').textContent = datosCita.doctor;
    document.getElementById('modalEspecialidadCalendario').textContent = datosCita.especialidad;

    // Guardar datos para envío
    window.citaActualCalendario = datosCita;

    // Mostrar modal
    modal.style.display = 'block';
};

// Función para crear el modal HTML del calendario
function crearModalEmailCalendario() {
    const modalHTML = `
        <div id="modalEmailCalendario" style="display: none; position: fixed !important; z-index: 9999 !important; left: 0 !important; top: 0 !important; width: 100% !important; height: 100% !important; background-color: rgba(0,0,0,0.7) !important; font-family: Arial, sans-serif !important;">
            <div style="background-color: #ffffff !important; margin: 5% auto !important; padding: 25px !important; border: none !important; border-radius: 12px !important; width: 90% !important; max-width: 550px !important; box-shadow: 0 8px 32px rgba(0,0,0,0.4) !important; position: relative !important;">
                
                <!-- Botón X para cerrar -->
                <button id="btnCerrarModalCalendarioX" style="position: absolute !important; top: 15px !important; right: 20px !important; background: none !important; border: none !important; font-size: 24px !important; cursor: pointer !important; color: #999 !important; padding: 0 !important; width: 30px !important; height: 30px !important; display: flex !important; align-items: center !important; justify-content: center !important;">×</button>
                
                <div style="text-align: center !important; margin-bottom: 25px !important;">
                    <h2 style="color: #2c3e50 !important; margin: 0 !important; font-size: 24px !important; font-weight: 600 !important;">📧 Enviar Email al Paciente</h2>
                </div>
                
                <div>
                    <div style="background-color: #f8f9fa !important; padding: 20px !important; border-radius: 8px !important; margin-bottom: 25px !important; border: 1px solid #e9ecef !important;">
                        <h3 style="margin-top: 0 !important; margin-bottom: 15px !important; color: #495057 !important; font-size: 18px !important;">Información de la Cita:</h3>
                        <p style="margin: 8px 0 !important; color: #333 !important; font-size: 14px !important;"><strong>Paciente:</strong> <span id="modalNombrePacienteCalendario"></span></p>
                        <p style="margin: 8px 0 !important; color: #333 !important; font-size: 14px !important;"><strong>Email:</strong> <span id="modalEmailPacienteCalendario"></span></p>
                        <p style="margin: 8px 0 !important; color: #333 !important; font-size: 14px !important;"><strong>Fecha:</strong> <span id="modalFechaCitaCalendario"></span></p>
                        <p style="margin: 8px 0 !important; color: #333 !important; font-size: 14px !important;"><strong>Hora:</strong> <span id="modalHoraCitaCalendario"></span></p>
                        <p style="margin: 8px 0 !important; color: #333 !important; font-size: 14px !important;"><strong>Doctor:</strong> <span id="modalDoctorCalendario"></span></p>
                        <p style="margin: 8px 0 !important; color: #333 !important; font-size: 14px !important;"><strong>Especialidad:</strong> <span id="modalEspecialidadCalendario"></span></p>
                    </div>
                    
                    <p style="text-align: center !important; color: #6c757d !important; margin-bottom: 25px !important; font-size: 16px !important;">
                        ¿Deseas enviar un email de confirmación al paciente?
                    </p>
                </div>
                
                <div style="text-align: center !important;">
                    <button id="btnEnviarEmailCalendario" style="background-color: #28a745 !important; color: white !important; padding: 14px 35px !important; border: none !important; border-radius: 6px !important; cursor: pointer !important; margin-right: 15px !important; font-size: 16px !important; font-weight: 500 !important; transition: background-color 0.2s !important;">
                        📧 Enviar Email
                    </button>
                    <button id="btnCerrarModalCalendario" style="background-color: #6c757d !important; color: white !important; padding: 14px 35px !important; border: none !important; border-radius: 6px !important; cursor: pointer !important; font-size: 16px !important; font-weight: 500 !important; transition: background-color 0.2s !important;">
                        Cerrar
                    </button>
                </div>
                
                <div id="modalLoadingCalendario" style="display: none !important; text-align: center !important; margin-top: 20px !important;">
                    <p style="color: #007bff !important; font-size: 16px !important; margin: 0 !important;">Enviando email... ⏳</p>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Agregar event listeners
    document.getElementById('btnEnviarEmailCalendario').addEventListener('click', enviarEmailDesdeModalCalendario);
    document.getElementById('btnCerrarModalCalendario').addEventListener('click', cerrarModalCalendario);
    document.getElementById('btnCerrarModalCalendarioX').addEventListener('click', cerrarModalCalendario);

    // Cerrar modal al hacer clic fuera
    document.getElementById('modalEmailCalendario').addEventListener('click', function (e) {
        if (e.target === this) {
            cerrarModalCalendario();
        }
    });
}

// Función para enviar email desde el modal del calendario
async function enviarEmailDesdeModalCalendario() {
    if (!window.citaActualCalendario) {
        mostrarToast('❌ Error: No hay datos de cita disponibles', 'error');
        return;
    }

    const citaActual = window.citaActualCalendario;

    // Mostrar loading en el modal
    document.getElementById('modalLoadingCalendario').style.display = 'block';
    document.getElementById('btnEnviarEmailCalendario').disabled = true;
    document.getElementById('btnEnviarEmailCalendario').textContent = 'Enviando...';

    try {
        console.log('📧 Enviando email a:', citaActual.email);

        // Inicializar EmailJS si no está inicializado
        if (typeof emailjs !== 'undefined') {
            emailjs.init('tfi1ksSYUgEyQxZ6I');
        }

        // Preparar datos del template (igual que en test-email.js)
        const templateParams = {
            to_email: citaActual.email,
            to_name: citaActual.nombre,
            fecha_cita: formatearFechaCalendario(citaActual.fecha),
            hora_cita: citaActual.hora,
            doctor: citaActual.doctor,
            especialidad: citaActual.especialidad,
            clinica_nombre: 'EVA Cirugía Corporal',
            clinica_direccion: 'Av. Principal 123, Ciudad',
            clinica_telefono: '(555) 123-4567'
        };

        // Enviar email usando la misma configuración que funciona en test-email.js
        const response = await emailjs.send(
            'service_2re2org',    // Service ID
            'template_rxar2ok',   // Template ID
            templateParams,
            'tfi1ksSYUgEyQxZ6I'   // Public Key
        );

        console.log('✅ EMAIL ENVIADO EXITOSAMENTE!', response);
        mostrarToast('✅ Email enviado correctamente al paciente!', 'success');
        cerrarModalCalendario();

    } catch (error) {
        console.error('❌ ERROR ENVIANDO EMAIL:', error);
        mostrarToast('❌ Error enviando email. Revisa la consola para más detalles.', 'error');

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
        document.getElementById('modalLoadingCalendario').style.display = 'none';
        document.getElementById('btnEnviarEmailCalendario').disabled = false;
        document.getElementById('btnEnviarEmailCalendario').textContent = '📧 Enviar Email';
    }
}

// Función para cerrar modal del calendario
function cerrarModalCalendario() {
    const modal = document.getElementById('modalEmailCalendario');
    if (modal) {
        modal.style.display = 'none';
        // Limpiar datos
        window.citaActualCalendario = null;
        // Restaurar botón si está en estado de carga
        const btnEnviar = document.getElementById('btnEnviarEmailCalendario');
        const loading = document.getElementById('modalLoadingCalendario');
        if (btnEnviar) {
            btnEnviar.disabled = false;
            btnEnviar.textContent = '📧 Enviar Email';
        }
        if (loading) {
            loading.style.display = 'none';
        }
    }
}

// Función para formatear fecha del calendario
function formatearFechaCalendario(fecha) {
    const opciones = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    return new Date(fecha).toLocaleDateString('es-ES', opciones);
}

// Las funciones editarCita, completarCita, eliminarCita y actualizarCita
// están implementadas en General.js y son accesibles globalmente

// Exportar para uso global
window.CalendarioManager = CalendarioManager;
// Función para actualizar especialidad cuando se selecciona un doctor
window.actualizarEspecialidad = function() {
    const selectDoctor = document.querySelector('select[name="doctor"]');
    const selectEspecialidad = document.querySelector('select[name="especialidad"]');
    
    if (!selectDoctor || !selectEspecialidad) return;
    
    const opcionSeleccionada = selectDoctor.options[selectDoctor.selectedIndex];
    const especialidad = opcionSeleccionada.getAttribute('data-especialidad');
    
    if (especialidad) {
        selectEspecialidad.innerHTML = `<option value="${especialidad}">${especialidad}</option>`;
        selectEspecialidad.value = especialidad;
    } else {
        selectEspecialidad.innerHTML = '<option value="">Seleccionar doctor primero</option>';
    }
};

// Función para guardar cita desde el calendario
window.guardarCitaCalendario = async function() {
    const form = document.getElementById('formCita');
    const formData = new FormData(form);
    const datos = Object.fromEntries(formData);
    
    try {
        // Validar campos requeridos
        if (!datos.doctor) {
            mostrarToast('❌ Debe seleccionar un doctor', 'error');
            return;
        }
        if (!datos.especialidad) {
            mostrarToast('❌ Debe seleccionar una especialidad', 'error');
            return;
        }
        
        // Validar campos requeridos según el tipo de paciente
        const tipoPaciente = datos.tipoPaciente;
        let emailPaciente = '';
        let nombrePaciente = '';
        
        if (tipoPaciente === 'registrado') {
            if (!datos.idPaciente) {
                mostrarToast('❌ Debe seleccionar un paciente registrado', 'error');
                return;
            }
            
            // Obtener datos del paciente registrado
            const paciente = pacientes.find(p => p.id === datos.idPaciente);
            if (paciente) {
                nombrePaciente = `${paciente.nombre} ${paciente.apellido}`;
                emailPaciente = paciente.email || '';
            }
        } else if (tipoPaciente === 'externo') {
            if (!datos.nombreExterno || !datos.telefonoExterno) {
                mostrarToast('❌ Debe completar nombre y teléfono del paciente externo', 'error');
                return;
            }
            
            nombrePaciente = datos.nombreExterno;
            emailPaciente = datos.emailExterno || '';
            
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
        const fechaCitaOriginal = datos.fechaCita;
        datos.fechaCita = firebase.firestore.Timestamp.fromDate(new Date(datos.fechaCita));
        
        // Guardar la cita en Firebase
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
        
        // Mostrar modal de confirmación de email si hay email
        if (emailPaciente && emailPaciente.trim() !== '') {
            // Preparar datos para el modal de email
            const datosCita = {
                nombre: nombrePaciente,
                email: emailPaciente,
                fecha: fechaCitaOriginal.split('T')[0], // Solo la fecha
                hora: new Date(fechaCitaOriginal).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
                doctor: datos.doctor,
                especialidad: datos.especialidad
            };
            
            console.log('📧 Mostrando modal de email con datos:', datosCita);
            
            // Usar el nuevo modal de email
            setTimeout(() => {
                if (typeof window.mostrarModalEmailCita === 'function') {
                    window.mostrarModalEmailCita(datosCita);
                } else {
                    console.error('❌ Función mostrarModalEmailCita no disponible');
                }
            }, 500);
        }
        
    } catch (error) {
        console.error('Error guardando cita:', error);
        mostrarToast('❌ Error agendando cita: ' + error.message, 'error');
    }
};

// Función para mostrar modal de email directamente desde calendario
window.mostrarModalEmailDirecto = function(datosCita) {
    // Crear modal si no existe
    let modal = document.getElementById('modalEmailCalendario');
    if (!modal) {
        crearModalEmailCalendario();
        modal = document.getElementById('modalEmailCalendario');
    }
    
    // Actualizar información en el modal
    document.getElementById('modalNombrePacienteCalendario').textContent = datosCita.nombre;
    document.getElementById('modalEmailPacienteCalendario').textContent = datosCita.email;
    document.getElementById('modalFechaCitaCalendario').textContent = formatearFechaCalendario(datosCita.fecha);
    document.getElementById('modalHoraCitaCalendario').textContent = datosCita.hora;
    document.getElementById('modalDoctorCalendario').textContent = datosCita.doctor;
    document.getElementById('modalEspecialidadCalendario').textContent = datosCita.especialidad;
    
    // Guardar datos para envío
    window.citaActualCalendario = datosCita;
    
    // Mostrar modal
    modal.style.display = 'block';
};

// Función para crear el modal HTML del calendario
function crearModalEmailCalendario() {
    const modalHTML = `
        <div id="modalEmailCalendario" style="display: none; position: fixed !important; z-index: 9999 !important; left: 0 !important; top: 0 !important; width: 100% !important; height: 100% !important; background-color: rgba(0,0,0,0.7) !important; font-family: Arial, sans-serif !important;">
            <div style="background-color: #ffffff !important; margin: 5% auto !important; padding: 25px !important; border: none !important; border-radius: 12px !important; width: 90% !important; max-width: 550px !important; box-shadow: 0 8px 32px rgba(0,0,0,0.4) !important; position: relative !important;">
                
                <!-- Botón X para cerrar -->
                <button id="btnCerrarModalCalendarioX" style="position: absolute !important; top: 15px !important; right: 20px !important; background: none !important; border: none !important; font-size: 24px !important; cursor: pointer !important; color: #999 !important; padding: 0 !important; width: 30px !important; height: 30px !important; display: flex !important; align-items: center !important; justify-content: center !important;">×</button>
                
                <div style="text-align: center !important; margin-bottom: 25px !important;">
                    <h2 style="color: #2c3e50 !important; margin: 0 !important; font-size: 24px !important; font-weight: 600 !important;">📧 Enviar Email al Paciente</h2>
                </div>
                
                <div>
                    <div style="background-color: #f8f9fa !important; padding: 20px !important; border-radius: 8px !important; margin-bottom: 25px !important; border: 1px solid #e9ecef !important;">
                        <h3 style="margin-top: 0 !important; margin-bottom: 15px !important; color: #495057 !important; font-size: 18px !important;">Información de la Cita:</h3>
                        <p style="margin: 8px 0 !important; color: #333 !important; font-size: 14px !important;"><strong>Paciente:</strong> <span id="modalNombrePacienteCalendario"></span></p>
                        <p style="margin: 8px 0 !important; color: #333 !important; font-size: 14px !important;"><strong>Email:</strong> <span id="modalEmailPacienteCalendario"></span></p>
                        <p style="margin: 8px 0 !important; color: #333 !important; font-size: 14px !important;"><strong>Fecha:</strong> <span id="modalFechaCitaCalendario"></span></p>
                        <p style="margin: 8px 0 !important; color: #333 !important; font-size: 14px !important;"><strong>Hora:</strong> <span id="modalHoraCitaCalendario"></span></p>
                        <p style="margin: 8px 0 !important; color: #333 !important; font-size: 14px !important;"><strong>Doctor:</strong> <span id="modalDoctorCalendario"></span></p>
                        <p style="margin: 8px 0 !important; color: #333 !important; font-size: 14px !important;"><strong>Especialidad:</strong> <span id="modalEspecialidadCalendario"></span></p>
                    </div>
                    
                    <p style="text-align: center !important; color: #6c757d !important; margin-bottom: 25px !important; font-size: 16px !important;">
                        ¿Deseas enviar un email de confirmación al paciente?
                    </p>
                </div>
                
                <div style="text-align: center !important;">
                    <button id="btnEnviarEmailCalendario" style="background-color: #28a745 !important; color: white !important; padding: 14px 35px !important; border: none !important; border-radius: 6px !important; cursor: pointer !important; margin-right: 15px !important; font-size: 16px !important; font-weight: 500 !important; transition: background-color 0.2s !important;">
                        📧 Enviar Email
                    </button>
                    <button id="btnCerrarModalCalendario" style="background-color: #6c757d !important; color: white !important; padding: 14px 35px !important; border: none !important; border-radius: 6px !important; cursor: pointer !important; font-size: 16px !important; font-weight: 500 !important; transition: background-color 0.2s !important;">
                        Cerrar
                    </button>
                </div>
                
                <div id="modalLoadingCalendario" style="display: none !important; text-align: center !important; margin-top: 20px !important;">
                    <p style="color: #007bff !important; font-size: 16px !important; margin: 0 !important;">Enviando email... ⏳</p>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Agregar event listeners
    document.getElementById('btnEnviarEmailCalendario').addEventListener('click', enviarEmailDesdeModalCalendario);
    document.getElementById('btnCerrarModalCalendario').addEventListener('click', cerrarModalCalendario);
    document.getElementById('btnCerrarModalCalendarioX').addEventListener('click', cerrarModalCalendario);
    
    // Cerrar modal al hacer clic fuera
    document.getElementById('modalEmailCalendario').addEventListener('click', function(e) {
        if (e.target === this) {
            cerrarModalCalendario();
        }
    });
}

// Función para enviar email desde el modal del calendario
async function enviarEmailDesdeModalCalendario() {
    if (!window.citaActualCalendario) {
        mostrarToast('❌ Error: No hay datos de cita disponibles', 'error');
        return;
    }
    
    const citaActual = window.citaActualCalendario;
    
    // Mostrar loading en el modal
    document.getElementById('modalLoadingCalendario').style.display = 'block';
    document.getElementById('btnEnviarEmailCalendario').disabled = true;
    document.getElementById('btnEnviarEmailCalendario').textContent = 'Enviando...';
    
    try {
        console.log('📧 Enviando email a:', citaActual.email);
        
        // Inicializar EmailJS si no está inicializado
        if (typeof emailjs !== 'undefined') {
            emailjs.init('tfi1ksSYUgEyQxZ6I');
        }
        
        // Preparar datos del template (igual que en test-email.js)
        const templateParams = {
            to_email: citaActual.email,
            to_name: citaActual.nombre,
            fecha_cita: formatearFechaCalendario(citaActual.fecha),
            hora_cita: citaActual.hora,
            doctor: citaActual.doctor,
            especialidad: citaActual.especialidad,
            clinica_nombre: 'EVA Cirugía Corporal',
            clinica_direccion: 'Av. Principal 123, Ciudad',
            clinica_telefono: '(555) 123-4567'
        };
        
        // Enviar email usando la misma configuración que funciona en test-email.js
        const response = await emailjs.send(
            'service_2re2org',    // Service ID
            'template_rxar2ok',   // Template ID
            templateParams,
            'tfi1ksSYUgEyQxZ6I'   // Public Key
        );
        
        console.log('✅ EMAIL ENVIADO EXITOSAMENTE!', response);
        mostrarToast('✅ Email enviado correctamente al paciente!', 'success');
        cerrarModalCalendario();
        
    } catch (error) {
        console.error('❌ ERROR ENVIANDO EMAIL:', error);
        mostrarToast('❌ Error enviando email. Revisa la consola para más detalles.', 'error');
        
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
        document.getElementById('modalLoadingCalendario').style.display = 'none';
        document.getElementById('btnEnviarEmailCalendario').disabled = false;
        document.getElementById('btnEnviarEmailCalendario').textContent = '📧 Enviar Email';
    }
}

// Función para cerrar modal del calendario
function cerrarModalCalendario() {
    const modal = document.getElementById('modalEmailCalendario');
    if (modal) {
        modal.style.display = 'none';
        // Limpiar datos
        window.citaActualCalendario = null;
        // Restaurar botón si está en estado de carga
        const btnEnviar = document.getElementById('btnEnviarEmailCalendario');
        const loading = document.getElementById('modalLoadingCalendario');
        if (btnEnviar) {
            btnEnviar.disabled = false;
            btnEnviar.textContent = '📧 Enviar Email';
        }
        if (loading) {
            loading.style.display = 'none';
        }
    }
}

// Función para formatear fecha del calendario
function formatearFechaCalendario(fecha) {
    const opciones = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return new Date(fecha).toLocaleDateString('es-ES', opciones);
}

// Las funciones editarCita, completarCita, eliminarCita y actualizarCita
// están implementadas en General.js y son accesibles globalmente

// Exportar para uso global
window.CalendarioManager = CalendarioManager;