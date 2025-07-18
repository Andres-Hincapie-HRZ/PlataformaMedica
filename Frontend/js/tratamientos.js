// ===================== GESTIÓN DE TRATAMIENTOS MÉDICOS =====================

class TratamientosManager {
    constructor() {
        this.tratamientos = [];
        this.pacienteActual = null;
    }

    // Cargar todos los tratamientos
    async cargarTodos() {
        try {
            // Verificar que los pacientes estén cargados
            if (!window.pacientes || window.pacientes.length === 0) {
                await cargarPacientes();
            }
            
            this.tratamientos = await Firebase.TratamientosService.obtenerTratamientos();
            this.pacienteActual = null;
            
            if (this.tratamientos.length === 0) {
                this.mostrarVistaInicial();
            } else {
                this.mostrarTratamientos();
            }
        } catch (error) {
            console.error('Error cargando tratamientos:', error);
            this.mostrarVistaInicial();
        }
    }

    // Generar datos de demostración
    generarTratamientosDemo() {
        const tiposTratamiento = [
            'Farmacológico', 'Fisioterapia', 'Terapia Ocupacional', 
            'Rehabilitación', 'Seguimiento Post-Cirugía', 'Medicina Estética'
        ];
        
        const estados = ['activo', 'pendiente', 'finalizado', 'pausado'];
        const tratamientosDemo = [];

        // Crear algunos tratamientos de ejemplo
        if (window.pacientes && window.pacientes.length > 0) {
            window.pacientes.slice(0, 3).forEach((paciente, index) => {
                const tratamiento = {
                    id: `trat_${Date.now()}_${index}`,
                    idPaciente: paciente.id,
                    pacienteNombre: `${paciente.nombre} ${paciente.apellido}`,
                    nombre: `Tratamiento ${index + 1}`,
                    tipo: tiposTratamiento[index % tiposTratamiento.length],
                    descripcion: `Descripción del tratamiento para ${paciente.nombre}`,
                    fechaInicio: { seconds: Date.now() / 1000 - (index * 86400) },
                    duracion: (index + 1) * 2,
                    unidadDuracion: 'semanas',
                    estado: estados[index % estados.length],
                    frecuencia: '2 veces al día',
                    dosis: '500mg',
                    medicamentos: 'Medicamento ejemplo',
                    observaciones: 'Observaciones del tratamiento'
                };
                tratamientosDemo.push(tratamiento);
            });
        }

        return tratamientosDemo;
    }

    // Mostrar vista inicial cuando no hay datos
    mostrarVistaInicial() {
        const container = document.getElementById('tratamientosLista');
        container.innerHTML = `
            <div class="text-center py-8">
                <div class="mb-6">
                    <i class="fas fa-pills fa-4x text-gray-400 mb-4"></i>
                    <h3 class="text-xl font-semibold text-gray-700 mb-2">Gestión de Tratamientos Médicos</h3>
                    <p class="text-gray-600 mb-6">Administra tratamientos, terapias y seguimientos médicos para tus pacientes</p>
                </div>
                
                <div class="grid grid-2 gap-6 max-w-4xl mx-auto mb-8">
                    <div class="card">
                        <div class="card-body text-center">
                            <i class="fas fa-prescription-bottle-alt text-blue-500 text-2xl mb-3"></i>
                            <h4 class="font-semibold mb-2">Tratamientos Farmacológicos</h4>
                            <p class="text-sm text-gray-600">Gestiona medicamentos, dosis y frecuencias</p>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-body text-center">
                            <i class="fas fa-dumbbell text-green-500 text-2xl mb-3"></i>
                            <h4 class="font-semibold mb-2">Fisioterapia</h4>
                            <p class="text-sm text-gray-600">Programas de rehabilitación y ejercicios</p>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-body text-center">
                            <i class="fas fa-user-nurse text-purple-500 text-2xl mb-3"></i>
                            <h4 class="font-semibold mb-2">Cuidados Post-Cirugía</h4>
                            <p class="text-sm text-gray-600">Seguimiento después de procedimientos</p>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-body text-center">
                            <i class="fas fa-spa text-orange-500 text-2xl mb-3"></i>
                            <h4 class="font-semibold mb-2">Medicina Estética</h4>
                            <p class="text-sm text-gray-600">Tratamientos estéticos y de belleza</p>
                        </div>
                    </div>
                </div>
                
                <div class="flex gap-4 justify-center">
                    <button class="btn btn-primary" onclick="tratamientosManager.abrirModalTratamiento()">
                        <i class="fas fa-plus"></i> Crear Primer Tratamiento
                    </button>
                    <button class="btn btn-secondary" onclick="navegarASeccion('pacientes')">
                        <i class="fas fa-users"></i> Ver Pacientes
                    </button>
                </div>
            </div>
        `;
    }

    // Cargar tratamientos de un paciente específico
    async cargarTratamientosPaciente(idPaciente) {
        try {
            this.pacienteActual = pacientes.find(p => p.id === idPaciente);
            this.tratamientos = await Firebase.TratamientosService.obtenerTratamientosPorPaciente(idPaciente);
            this.mostrarTratamientosPaciente();
        } catch (error) {
            console.error('Error cargando tratamientos del paciente:', error);
            mostrarToast('Error cargando tratamientos del paciente', 'error');
        }
    }

    // Mostrar vista general de tratamientos
    mostrarTratamientos() {
        const container = document.getElementById('tratamientosLista');
        
        if (!container) {
            console.error('Contenedor tratamientosLista no encontrado');
            return;
        }

        if (!this.tratamientos || this.tratamientos.length === 0) {
            this.mostrarVistaInicial();
            return;
        }

        // Crear header con estadísticas
        const estadisticas = this.calcularEstadisticas();
        
        const headerHTML = `
            <div class="mb-6">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-2xl font-bold text-gray-800">
                        <i class="fas fa-pills text-blue-500 mr-2"></i>
                        Gestión de Tratamientos
                    </h2>
                    <button class="btn btn-primary" onclick="tratamientosManager.abrirModalTratamiento()">
                        <i class="fas fa-plus"></i> Nuevo Tratamiento
                    </button>
                </div>
                
                <!-- Estadísticas -->
                <div class="grid grid-4 gap-4 mb-6">
                    <div class="card bg-blue-50 border-blue-200">
                        <div class="card-body text-center">
                            <div class="text-2xl font-bold text-blue-600">${estadisticas.total}</div>
                            <div class="text-sm text-blue-700">Total Tratamientos</div>
                        </div>
                    </div>
                    <div class="card bg-green-50 border-green-200">
                        <div class="card-body text-center">
                            <div class="text-2xl font-bold text-green-600">${estadisticas.activos}</div>
                            <div class="text-sm text-green-700">Activos</div>
                        </div>
                    </div>
                    <div class="card bg-yellow-50 border-yellow-200">
                        <div class="card-body text-center">
                            <div class="text-2xl font-bold text-yellow-600">${estadisticas.pendientes}</div>
                            <div class="text-sm text-yellow-700">Pendientes</div>
                        </div>
                    </div>
                    <div class="card bg-gray-50 border-gray-200">
                        <div class="card-body text-center">
                            <div class="text-2xl font-bold text-gray-600">${estadisticas.finalizados}</div>
                            <div class="text-sm text-gray-700">Finalizados</div>
                        </div>
                    </div>
                </div>
                
                <!-- Filtros -->
                <div class="card mb-6">
                    <div class="card-body">
                        <div class="flex gap-4 items-center">
                            <div class="flex-1">
                                <input type="text" id="filtroTratamientos" placeholder="Buscar tratamientos..." 
                                       class="form-control" onkeyup="tratamientosManager.filtrarTratamientos()">
                            </div>
                            <select id="filtroEstado" class="form-control w-48" onchange="tratamientosManager.filtrarTratamientos()">
                                <option value="">Todos los estados</option>
                                <option value="activo">Activos</option>
                                <option value="pendiente">Pendientes</option>
                                <option value="pausado">Pausados</option>
                                <option value="finalizado">Finalizados</option>
                            </select>
                            <select id="filtroTipo" class="form-control w-48" onchange="tratamientosManager.filtrarTratamientos()">
                                <option value="">Todos los tipos</option>
                                <option value="Farmacológico">Farmacológico</option>
                                <option value="Fisioterapia">Fisioterapia</option>
                                <option value="Terapia Ocupacional">Terapia Ocupacional</option>
                                <option value="Rehabilitación">Rehabilitación</option>
                                <option value="Seguimiento Post-Cirugía">Post-Cirugía</option>
                                <option value="Medicina Estética">Medicina Estética</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Lista de tratamientos -->
            <div id="listaTratamientos" class="grid gap-4">
                ${this.generarHTMLTratamientos(this.tratamientos)}
            </div>
        `;

        container.innerHTML = headerHTML;
    }

    // Calcular estadísticas de tratamientos
    calcularEstadisticas() {
        const stats = {
            total: this.tratamientos.length,
            activos: 0,
            pendientes: 0,
            finalizados: 0,
            pausados: 0
        };

        this.tratamientos.forEach(tratamiento => {
            switch(tratamiento.estado) {
                case 'activo':
                    stats.activos++;
                    break;
                case 'pendiente':
                    stats.pendientes++;
                    break;
                case 'finalizado':
                    stats.finalizados++;
                    break;
                case 'pausado':
                    stats.pausados++;
                    break;
            }
        });

        return stats;
    }

    // Generar HTML para tratamientos
    generarHTMLTratamientos(tratamientos) {
        if (!tratamientos || tratamientos.length === 0) {
            return '<div class="card"><div class="card-body text-center"><p>No hay tratamientos que mostrar</p></div></div>';
        }

        return tratamientos.map(tratamiento => this.crearTarjetaTratamiento(tratamiento)).join('');
    }

    // Filtrar tratamientos
    filtrarTratamientos() {
        const filtroTexto = document.getElementById('filtroTratamientos')?.value.toLowerCase() || '';
        const filtroEstado = document.getElementById('filtroEstado')?.value || '';
        const filtroTipo = document.getElementById('filtroTipo')?.value || '';

        let tratamientosFiltrados = this.tratamientos.filter(tratamiento => {
            const coincideTexto = !filtroTexto || 
                tratamiento.nombre.toLowerCase().includes(filtroTexto) ||
                tratamiento.pacienteNombre.toLowerCase().includes(filtroTexto) ||
                tratamiento.tipo.toLowerCase().includes(filtroTexto);
            
            const coincideEstado = !filtroEstado || tratamiento.estado === filtroEstado;
            const coincideTipo = !filtroTipo || tratamiento.tipo === filtroTipo;

            return coincideTexto && coincideEstado && coincideTipo;
        });

        const container = document.getElementById('listaTratamientos');
        if (container) {
            container.innerHTML = this.generarHTMLTratamientos(tratamientosFiltrados);
        }
    }

    // Mostrar tratamientos de un paciente específico
    mostrarTratamientosPaciente() {
        const container = document.getElementById('tratamientosLista');
        
        const headerHTML = `
            <div class="card mb-4">
                <div class="card-header">
                    <div class="flex justify-between items-center">
                        <h3>Tratamientos - ${this.pacienteActual.nombre} ${this.pacienteActual.apellido}</h3>
                        <div>
                            <button class="btn btn-secondary btn-sm" onclick="tratamientosManager.volverALista()">
                                <i class="fas fa-arrow-left"></i> Volver
                            </button>
                            <button class="btn btn-primary btn-sm" onclick="tratamientosManager.abrirModalTratamiento()">
                                <i class="fas fa-plus"></i> Nuevo Tratamiento
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const tratamientosHTML = this.tratamientos.length === 0 ? 
            '<div class="card"><div class="card-body text-center"><p>No hay tratamientos registrados para este paciente</p></div></div>' :
            this.tratamientos.map(tratamiento => this.crearTarjetaTratamiento(tratamiento)).join('');

        container.innerHTML = headerHTML + tratamientosHTML;
    }

    // Crear tabla de tratamientos
    crearTablaTratamientos() {
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Lista de Tratamientos</h3>
                </div>
                <div class="card-body">
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Paciente</th>
                                    <th>Tratamiento</th>
                                    <th>Tipo</th>
                                    <th>Fecha Inicio</th>
                                    <th>Duración</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.tratamientos.map(tratamiento => `
                                    <tr>
                                        <td>${tratamiento.pacienteNombre || 'N/D'}</td>
                                        <td>${tratamiento.nombre}</td>
                                        <td>
                                            <span class="cirugia-tipo">${tratamiento.tipo}</span>
                                        </td>
                                        <td>${new Date(tratamiento.fechaInicio.seconds * 1000).toLocaleDateString()}</td>
                                        <td>${tratamiento.duracion} ${tratamiento.unidadDuracion}</td>
                                        <td>
                                            <span class="badge badge-${this.obtenerColorEstado(tratamiento.estado)}">
                                                ${tratamiento.estado}
                                            </span>
                                        </td>
                                        <td>
                                            <button class="btn btn-sm btn-secondary" onclick="tratamientosManager.editarTratamiento('${tratamiento.id}')">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="btn btn-sm btn-primary" onclick="tratamientosManager.verDetalleTratamiento('${tratamiento.id}')">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    // Crear tarjeta individual de tratamiento
    crearTarjetaTratamiento(tratamiento) {
        const fechaInicio = tratamiento.fechaInicio ? 
            new Date(tratamiento.fechaInicio.seconds * 1000).toLocaleDateString() : 
            'No especificada';
        
        const estadoClass = this.obtenerClaseEstado(tratamiento.estado);
        const estadoTexto = this.obtenerTextoEstado(tratamiento.estado);
        const iconoTipo = this.obtenerIconoTipo(tratamiento.tipo);
        
        return `
            <div class="card hover:shadow-lg transition-shadow duration-200">
                <div class="card-body">
                    <div class="flex justify-between items-start mb-4">
                        <div class="flex items-center gap-3">
                            <div class="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                <i class="${iconoTipo} text-blue-600 text-xl"></i>
                            </div>
                            <div>
                                <h3 class="font-semibold text-lg text-gray-800">${tratamiento.nombre}</h3>
                                <p class="text-sm text-gray-600">
                                    <i class="fas fa-user mr-1"></i>
                                    ${tratamiento.pacienteNombre}
                                </p>
                            </div>
                        </div>
                        <span class="badge ${estadoClass}">${estadoTexto}</span>
                    </div>
                    
                    <div class="grid grid-2 gap-4 mb-4">
                        <div>
                            <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">Tipo</label>
                            <p class="text-sm font-medium text-gray-800">${tratamiento.tipo}</p>
                        </div>
                        <div>
                            <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">Fecha Inicio</label>
                            <p class="text-sm font-medium text-gray-800">${fechaInicio}</p>
                        </div>
                        <div>
                            <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">Duración</label>
                            <p class="text-sm font-medium text-gray-800">${tratamiento.duracion} ${tratamiento.unidadDuracion}</p>
                        </div>
                        <div>
                            <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">Frecuencia</label>
                            <p class="text-sm font-medium text-gray-800">${tratamiento.frecuencia || 'No especificada'}</p>
                        </div>
                    </div>
                    
                    ${tratamiento.descripcion ? `
                        <div class="mb-4">
                            <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">Descripción</label>
                            <p class="text-sm text-gray-700 mt-1">${tratamiento.descripcion}</p>
                        </div>
                    ` : ''}
                    
                    ${tratamiento.medicamentos ? `
                        <div class="mb-4">
                            <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">Medicamentos</label>
                            <p class="text-sm text-gray-700 mt-1">
                                <i class="fas fa-pills text-blue-500 mr-1"></i>
                                ${tratamiento.medicamentos} ${tratamiento.dosis ? `- ${tratamiento.dosis}` : ''}
                            </p>
                        </div>
                    ` : ''}
                    
                    <div class="flex justify-between items-center pt-4 border-t border-gray-200">
                        <div class="flex gap-2">
                            <button class="btn btn-sm btn-outline-primary" 
                                    onclick="tratamientosManager.editarTratamiento('${tratamiento.id}')"
                                    title="Editar tratamiento">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-info" 
                                    onclick="tratamientosManager.verDetalles('${tratamiento.id}')"
                                    title="Ver detalles">
                                <i class="fas fa-eye"></i>
                            </button>
                            ${tratamiento.estado === 'activo' ? `
                                <button class="btn btn-sm btn-outline-warning" 
                                        onclick="tratamientosManager.pausarTratamiento('${tratamiento.id}')"
                                        title="Pausar tratamiento">
                                    <i class="fas fa-pause"></i>
                                </button>
                            ` : ''}
                            ${tratamiento.estado === 'pausado' ? `
                                <button class="btn btn-sm btn-outline-success" 
                                        onclick="tratamientosManager.reanudarTratamiento('${tratamiento.id}')"
                                        title="Reanudar tratamiento">
                                    <i class="fas fa-play"></i>
                                </button>
                            ` : ''}
                        </div>
                        
                        <div class="flex gap-2">
                            ${tratamiento.estado !== 'finalizado' ? `
                                <button class="btn btn-sm btn-success" 
                                        onclick="tratamientosManager.finalizarTratamiento('${tratamiento.id}')"
                                        title="Finalizar tratamiento">
                                    <i class="fas fa-check"></i> Finalizar
                                </button>
                            ` : ''}
                            <button class="btn btn-sm btn-outline-danger" 
                                    onclick="tratamientosManager.eliminarTratamiento('${tratamiento.id}')"
                                    title="Eliminar tratamiento">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Obtener clase CSS para el estado
    obtenerClaseEstado(estado) {
        const clases = {
            'activo': 'badge-success',
            'pendiente': 'badge-warning',
            'pausado': 'badge-secondary',
            'finalizado': 'badge-info'
        };
        return clases[estado] || 'badge-secondary';
    }

    // Obtener texto legible para el estado
    obtenerTextoEstado(estado) {
        const textos = {
            'activo': 'Activo',
            'pendiente': 'Pendiente',
            'pausado': 'Pausado',
            'finalizado': 'Finalizado'
        };
        return textos[estado] || estado;
    }

    // Obtener icono para el tipo de tratamiento
    obtenerIconoTipo(tipo) {
        const iconos = {
            'Farmacológico': 'fas fa-pills',
            'Fisioterapia': 'fas fa-dumbbell',
            'Terapia Ocupacional': 'fas fa-hands-helping',
            'Rehabilitación': 'fas fa-walking',
            'Seguimiento Post-Cirugía': 'fas fa-user-nurse',
            'Medicina Estética': 'fas fa-spa'
        };
        return iconos[tipo] || 'fas fa-medical-kit';
    }

    // Abrir modal para crear/editar tratamiento
    abrirModalTratamiento(id = null) {
        const esEdicion = id !== null;
        const tratamiento = esEdicion ? this.tratamientos.find(t => t.id === id) : {};

        const tiposTratamiento = [
            'Farmacológico',
            'Fisioterapia',
            'Terapia Ocupacional',
            'Rehabilitación',
            'Cuidados Paliativos',
            'Seguimiento Post-Cirugía',
            'Tratamiento Estético',
            'Medicina Preventiva',
            'Otros'
        ];

        const modalBody = `
            <form id="formTratamiento">
                ${this.pacienteActual ? 
                    `<input type="hidden" name="idPaciente" value="${this.pacienteActual.id}">` :
                    `<div class="form-group">
                        <label class="form-label">Paciente</label>
                        <select name="idPaciente" class="form-select" required>
                            <option value="">Seleccionar paciente</option>
                            ${pacientes.map(p => `<option value="${p.id}" ${tratamiento.idPaciente === p.id ? 'selected' : ''}>${p.nombre} ${p.apellido}</option>`).join('')}
                        </select>
                    </div>`
                }
                
                <div class="grid grid-2 gap-4">
                    <div class="form-group">
                        <label class="form-label">Nombre del Tratamiento</label>
                        <input type="text" name="nombre" class="form-input" 
                               value="${tratamiento.nombre || ''}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Tipo de Tratamiento</label>
                        <select name="tipo" class="form-select" required>
                            ${tiposTratamiento.map(tipo => `
                                <option value="${tipo}" ${tratamiento.tipo === tipo ? 'selected' : ''}>${tipo}</option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Fecha de Inicio</label>
                        <input type="date" name="fechaInicio" class="form-input" 
                               value="${tratamiento.fechaInicio ? new Date(tratamiento.fechaInicio.seconds * 1000).toISOString().split('T')[0] : ''}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Duración</label>
                        <div class="flex gap-2">
                            <input type="number" name="duracion" class="form-input" 
                                   value="${tratamiento.duracion || ''}" min="1" required>
                            <select name="unidadDuracion" class="form-select" required>
                                <option value="días" ${tratamiento.unidadDuracion === 'días' ? 'selected' : ''}>Días</option>
                                <option value="semanas" ${tratamiento.unidadDuracion === 'semanas' ? 'selected' : ''}>Semanas</option>
                                <option value="meses" ${tratamiento.unidadDuracion === 'meses' ? 'selected' : ''}>Meses</option>
                                <option value="años" ${tratamiento.unidadDuracion === 'años' ? 'selected' : ''}>Años</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Frecuencia</label>
                        <input type="text" name="frecuencia" class="form-input" 
                               placeholder="Ej: 3 veces al día, Cada 8 horas"
                               value="${tratamiento.frecuencia || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Dosis</label>
                        <input type="text" name="dosis" class="form-input" 
                               placeholder="Ej: 500mg, 2 tabletas"
                               value="${tratamiento.dosis || ''}">
                    </div>
                </div>
                
                <div class="grid grid-1 gap-4 mt-4">
                    <div class="form-group">
                        <label class="form-label">Descripción del Tratamiento</label>
                        <textarea name="descripcion" class="form-textarea" required>${tratamiento.descripcion || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Medicamentos</label>
                        <textarea name="medicamentos" class="form-textarea" 
                                  placeholder="Lista de medicamentos y instrucciones">${tratamiento.medicamentos || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Observaciones</label>
                        <textarea name="observaciones" class="form-textarea">${tratamiento.observaciones || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Estado</label>
                        <select name="estado" class="form-select" required>
                            <option value="pendiente" ${tratamiento.estado === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                            <option value="activo" ${tratamiento.estado === 'activo' ? 'selected' : ''}>Activo</option>
                            <option value="pausado" ${tratamiento.estado === 'pausado' ? 'selected' : ''}>Pausado</option>
                            <option value="finalizado" ${tratamiento.estado === 'finalizado' ? 'selected' : ''}>Finalizado</option>
                        </select>
                    </div>
                </div>
            </form>
        `;

        const modalFooter = `
            <button type="button" class="btn btn-secondary" onclick="cerrarModal()">Cancelar</button>
            <button type="button" class="btn btn-primary" onclick="tratamientosManager.guardarTratamiento('${id || ''}')">
                ${esEdicion ? 'Actualizar' : 'Crear'} Tratamiento
            </button>
        `;

        abrirModal(
            esEdicion ? 'Editar Tratamiento' : 'Nuevo Tratamiento',
            modalBody,
            modalFooter
        );
    }

    // Guardar tratamiento
    async guardarTratamiento(id) {
        const form = document.getElementById('formTratamiento');
        const formData = new FormData(form);
        const datos = Object.fromEntries(formData);
        
        try {
            // Convertir fecha a objeto Date
            datos.fechaInicio = new Date(datos.fechaInicio);
            
            // Calcular fecha de fin basada en duración
            const fechaFin = new Date(datos.fechaInicio);
            const duracion = parseInt(datos.duracion);
            
            switch (datos.unidadDuracion) {
                case 'días':
                    fechaFin.setDate(fechaFin.getDate() + duracion);
                    break;
                case 'semanas':
                    fechaFin.setDate(fechaFin.getDate() + (duracion * 7));
                    break;
                case 'meses':
                    fechaFin.setMonth(fechaFin.getMonth() + duracion);
                    break;
                case 'años':
                    fechaFin.setFullYear(fechaFin.getFullYear() + duracion);
                    break;
            }
            
            if (datos.estado !== 'finalizado') {
                datos.fechaFin = fechaFin;
            }

            if (id) {
                // Editar tratamiento existente
                await Firebase.TratamientosService.actualizarTratamiento(id, datos);
                mostrarToast('Tratamiento actualizado correctamente', 'success');
            } else {
                // Crear nuevo tratamiento
                await Firebase.TratamientosService.crearTratamiento(datos);
                mostrarToast('Tratamiento creado correctamente', 'success');
            }

            cerrarModal();
            this.pacienteActual ? this.cargarTratamientosPaciente(this.pacienteActual.id) : this.cargarTodos();
        } catch (error) {
            console.error('Error guardando tratamiento:', error);
            mostrarToast('Error guardando tratamiento', 'error');
        }
    }

    // Métodos auxiliares
    contarPorEstado(estado) {
        return this.tratamientos.filter(t => t.estado === estado).length;
    }

    obtenerColorEstado(estado) {
        const colores = {
            'pendiente': 'warning',
            'activo': 'success',
            'pausado': 'secondary',
            'finalizado': 'primary'
        };
        return colores[estado] || 'secondary';
    }

    filtrarPorPaciente(idPaciente) {
        if (idPaciente) {
            this.cargarTratamientosPaciente(idPaciente);
        } else {
            this.cargarTodos();
        }
    }

    volverALista() {
        this.pacienteActual = null;
        this.cargarTodos();
    }

    editarTratamiento(id) {
        this.abrirModalTratamiento(id);
    }

    verDetalleTratamiento(id) {
        // Implementar vista detallada del tratamiento
        mostrarToast('Vista detallada en desarrollo', 'info');
    }

    async cambiarEstadoTratamiento(id, nuevoEstado) {
        try {
            await Firebase.TratamientosService.cambiarEstadoTratamiento(id, nuevoEstado);
            
            // Actualizar el tratamiento en la lista local
            const tratamiento = this.tratamientos.find(t => t.id === id);
            if (tratamiento) {
                tratamiento.estado = nuevoEstado;
                if (nuevoEstado === 'finalizado') {
                    tratamiento.fechaFinalizacion = new Date();
                }
            }
            
            mostrarToast(`Tratamiento ${nuevoEstado} correctamente`, 'success');
            
            // Recargar la vista
            this.pacienteActual ? this.cargarTratamientosPaciente(this.pacienteActual.id) : this.cargarTodos();
        } catch (error) {
            console.error('Error cambiando estado del tratamiento:', error);
            mostrarToast('Error cambiando estado del tratamiento', 'error');
        }
    }

    // Eliminar tratamiento
    async eliminarTratamiento(id) {
        if (confirm('¿Estás seguro de que deseas eliminar este tratamiento?')) {
            try {
                await Firebase.TratamientosService.eliminarTratamiento(id);
                
                // Remover de la lista local
                this.tratamientos = this.tratamientos.filter(t => t.id !== id);
                
                mostrarToast('Tratamiento eliminado correctamente', 'success');
                
                // Recargar la vista
                this.pacienteActual ? this.cargarTratamientosPaciente(this.pacienteActual.id) : this.cargarTodos();
            } catch (error) {
                console.error('Error eliminando tratamiento:', error);
                mostrarToast('Error eliminando tratamiento', 'error');
            }
        }
    }

    pausarTratamiento(id) {
        this.cambiarEstadoTratamiento(id, 'pausado');
    }

    reanudarTratamiento(id) {
        this.cambiarEstadoTratamiento(id, 'activo');
    }

    finalizarTratamiento(id) {
        this.cambiarEstadoTratamiento(id, 'finalizado');
    }
}