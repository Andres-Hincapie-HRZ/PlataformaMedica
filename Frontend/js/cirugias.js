// ===================== MANAGER DE CIRUGÍAS =====================

class CirugiasManager {
    constructor() {
        this.cirugias = [];
        this.cirujanos = [];
        this.fechaSeleccionada = new Date();
        this.tipoFiltro = '';
        this.cirujanoFiltro = '';
        this.vistaActual = 'lista'; // 'lista', 'calendario', 'estadisticas'
        
        // Tipos de cirugías disponibles
        this.tiposCirugias = [
            'Mastoplastía de Reducción',
            'Mentoplastía',
            'Braquioplastía',
            'Otoplastía',
            'Gluteoplastía',
            'Queiloplastía',
            'Lipolight Sculpsure',
            'Bichectomía',
            'Lipoescultura',
            'Rinoplastía',
            'Abdominoplastía',
            'Blefaroplastía',
            'Mastoplastía de Aumento',
            'Frontoplastía'
        ];

        // Tipos de implantes disponibles
        this.tiposImplantes = [
            'Silicona',
            'Solución Salina',
            'Gel Cohesivo',
            'Poliuretano',
            'Hidrogel',
            'Sin Implante'
        ];

        // Tamaños de implantes disponibles
        this.tamañosImplantes = [
            '100-200cc',
            '200-300cc',
            '300-400cc',
            '400-500cc',
            '500-600cc',
            '600cc+',
            'No Aplica'
        ];

        // Filtros adicionales
        this.tipoImplanteFiltro = '';
        this.tamañoImplanteFiltro = '';
    }

    // Inicializar el manager
    async inicializar() {
        try {
            await this.cargarCirugias();
            await this.cargarCirujanos();
            this.mostrarInterfaz();
        } catch (error) {
            console.error('Error inicializando cirugías:', error);
            mostrarToast('Error cargando datos de cirugías', 'error');
        }
    }

    // Cargar cirugías desde Firebase
    async cargarCirugias() {
        try {
            this.cirugias = await Firebase.CirugiasService.obtenerCirugias();
        } catch (error) {
            console.error('Error cargando cirugías:', error);
            throw error;
        }
    }

    // Cargar cirujanos (usuarios con especialidades quirúrgicas)
    async cargarCirujanos() {
        try {
            const usuarios = await Firebase.UsuariosService.obtenerUsuarios();
            this.cirujanos = usuarios.filter(usuario => 
                usuario.activo && 
                (usuario.tipoDoctor.includes('Cirujano') || 
                 usuario.tipoDoctor.includes('Médico') ||
                 usuario.tipoDoctor === 'Anestesiólogo')
            );
        } catch (error) {
            console.error('Error cargando cirujanos:', error);
            this.cirujanos = [];
        }
    }

    // Mostrar la interfaz principal
    mostrarInterfaz() {
        const container = document.getElementById('cirugiasLista');
        
        const headerHTML = `
            <div class="cirugias-header mb-6">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-2xl font-bold text-gray-800">Gestión de Cirugías</h2>
                    <div class="flex gap-3">
                        <button class="btn btn-outline-primary ${this.vistaActual === 'lista' ? 'active' : ''}" 
                                onclick="cirugiasManager.cambiarVista('lista')">
                            <i class="fas fa-list"></i> Lista
                        </button>
                        <button class="btn btn-outline-primary ${this.vistaActual === 'calendario' ? 'active' : ''}" 
                                onclick="cirugiasManager.cambiarVista('calendario')">
                            <i class="fas fa-calendar"></i> Calendario
                        </button>
                        <button class="btn btn-outline-primary ${this.vistaActual === 'estadisticas' ? 'active' : ''}" 
                                onclick="cirugiasManager.cambiarVista('estadisticas')">
                            <i class="fas fa-chart-bar"></i> Estadísticas
                        </button>
                        <button class="btn btn-primary" onclick="cirugiasManager.abrirModalCirugia()">
                            <i class="fas fa-plus"></i> Nueva Cirugía
                        </button>
                    </div>
                </div>

                <!-- Filtros -->
                <div class="filtros-cirugias card p-4 mb-4">
                    <div class="grid grid-6 gap-4">
                        <div class="form-group">
                            <label class="form-label">Filtrar por Tipo</label>
                            <select id="filtroTipo" class="form-select" onchange="cirugiasManager.aplicarFiltros()">
                                <option value="">Todos los tipos</option>
                                ${this.tiposCirugias.map(tipo => `
                                    <option value="${tipo}" ${this.tipoFiltro === tipo ? 'selected' : ''}>${tipo}</option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Filtrar por Cirujano</label>
                            <select id="filtroCirujano" class="form-select" onchange="cirugiasManager.aplicarFiltros()">
                                <option value="">Todos los cirujanos</option>
                                ${this.cirujanos.map(cirujano => `
                                    <option value="${cirujano.id}" ${this.cirujanoFiltro === cirujano.id ? 'selected' : ''}>${cirujano.nombre}</option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Tipo de Implante</label>
                            <select id="filtroTipoImplante" class="form-select" onchange="cirugiasManager.aplicarFiltros()">
                                <option value="">Todos los implantes</option>
                                ${this.tiposImplantes.map(tipo => `
                                    <option value="${tipo}" ${this.tipoImplanteFiltro === tipo ? 'selected' : ''}>${tipo}</option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Tamaño de Implante</label>
                            <select id="filtroTamañoImplante" class="form-select" onchange="cirugiasManager.aplicarFiltros()">
                                <option value="">Todos los tamaños</option>
                                ${this.tamañosImplantes.map(tamaño => `
                                    <option value="${tamaño}" ${this.tamañoImplanteFiltro === tamaño ? 'selected' : ''}>${tamaño}</option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Mes/Año</label>
                            <input type="month" id="filtroMes" class="form-input" 
                                   value="${this.fechaSeleccionada.getFullYear()}-${String(this.fechaSeleccionada.getMonth() + 1).padStart(2, '0')}"
                                   onchange="cirugiasManager.aplicarFiltros()">
                        </div>
                        <div class="form-group">
                            <button class="btn btn-secondary mt-6" onclick="cirugiasManager.limpiarFiltros()">
                                <i class="fas fa-times"></i> Limpiar Filtros
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Estadísticas rápidas -->
                <div class="stats-grid mb-6">
                    ${this.generarEstadisticasRapidas()}
                </div>
            </div>
        `;

        const contenidoHTML = this.generarContenidoVista();
        container.innerHTML = headerHTML + contenidoHTML;
    }

    // Generar estadísticas rápidas
    generarEstadisticasRapidas() {
        const cirugiasFiltradas = this.obtenerCirugiasFiltradas();
        const totalCirugias = cirugiasFiltradas.length;
        const cirugiasProgramadas = cirugiasFiltradas.filter(c => c.estado === 'programada').length;
        const cirugiasCompletadas = cirugiasFiltradas.filter(c => c.estado === 'completada').length;
        const cirugiasMesActual = cirugiasFiltradas.filter(c => {
            const fechaCirugia = c.fechaCirugia.seconds ? 
                new Date(c.fechaCirugia.seconds * 1000) : new Date(c.fechaCirugia);
            const mesActual = new Date();
            return fechaCirugia.getMonth() === mesActual.getMonth() && 
                   fechaCirugia.getFullYear() === mesActual.getFullYear();
        }).length;

        return `
            <div class="stat-card">
                <div class="stat-icon primary">
                    <i class="fas fa-cut"></i>
                </div>
                <div class="stat-content">
                    <h3>${totalCirugias}</h3>
                    <p>Total Cirugías</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon warning">
                    <i class="fas fa-clock"></i>
                </div>
                <div class="stat-content">
                    <h3>${cirugiasProgramadas}</h3>
                    <p>Programadas</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon success">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="stat-content">
                    <h3>${cirugiasCompletadas}</h3>
                    <p>Completadas</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon info">
                    <i class="fas fa-calendar-check"></i>
                </div>
                <div class="stat-content">
                    <h3>${cirugiasMesActual}</h3>
                    <p>Este Mes</p>
                </div>
            </div>
        `;
    }

    // Cambiar vista
    cambiarVista(vista) {
        this.vistaActual = vista;
        this.mostrarInterfaz();
    }

    // Generar contenido según la vista actual
    generarContenidoVista() {
        switch (this.vistaActual) {
            case 'lista':
                return this.generarVistaLista();
            case 'calendario':
                return this.generarVistaCalendario();
            case 'estadisticas':
                return this.generarVistaEstadisticas();
            default:
                return this.generarVistaLista();
        }
    }

    // Vista de lista
    generarVistaLista() {
        const cirugiasFiltradas = this.obtenerCirugiasFiltradas();
        
        if (cirugiasFiltradas.length === 0) {
            return `
                <div class="text-center py-12">
                    <i class="fas fa-cut fa-4x text-gray-300 mb-4"></i>
                    <h3 class="text-xl font-semibold text-gray-600 mb-2">No hay cirugías</h3>
                    <p class="text-gray-500 mb-6">No se encontraron cirugías con los filtros aplicados</p>
                    <button class="btn btn-primary" onclick="cirugiasManager.abrirModalCirugia()">
                        <i class="fas fa-plus"></i> Nueva Cirugía
                    </button>
                </div>
            `;
        }

        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Lista de Cirugías (${cirugiasFiltradas.length})</h3>
                </div>
                <div class="card-body">
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Paciente</th>
                                    <th>Tipo de Cirugía</th>
                                    <th>Tipo de Implante</th>
                                    <th>Tamaño</th>
                                    <th>Cirujano</th>
                                    <th>Fecha Programada</th>
                                    <th>Duración</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${cirugiasFiltradas.map(cirugia => this.generarFilaCirugia(cirugia)).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    // Generar fila de cirugía para la tabla
    generarFilaCirugia(cirugia) {
        const paciente = pacientes.find(p => p.id === cirugia.idPaciente);
        const cirujano = this.cirujanos.find(c => c.id === cirugia.idCirujano);
        const fechaCirugia = cirugia.fechaCirugia.seconds ? 
            new Date(cirugia.fechaCirugia.seconds * 1000) : new Date(cirugia.fechaCirugia);
        const fecha = fechaCirugia.toLocaleDateString();
        const hora = fechaCirugia.toLocaleTimeString();
        
        const estadoClass = {
            'programada': 'badge-primary',
            'en_proceso': 'badge-warning',
            'completada': 'badge-success',
            'cancelada': 'badge-error'
        }[cirugia.estado] || 'badge-secondary';
        
        return `
            <tr>
                <td>
                    <div class="flex items-center">
                        <img src="${paciente?.fotoUrl || '/api/placeholder/32/32'}" 
                             alt="${paciente?.nombre || 'Paciente'}" 
                             class="w-8 h-8 rounded-full mr-3">
                        <div>
                            <div class="font-medium">${paciente ? `${paciente.nombre} ${paciente.apellido}` : 'Paciente no encontrado'}</div>
                            <div class="text-sm text-gray-500">${paciente?.cedula || ''}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="cirugia-tipo">${cirugia.tipo}</span>
                </td>
                <td>
                    <span class="badge badge-info">${cirugia.tipoImplante || 'No especificado'}</span>
                </td>
                <td>
                    <span class="badge badge-secondary">${cirugia.tamañoImplante || 'No especificado'}</span>
                </td>
                <td>
                    <div class="flex items-center">
                        <img src="${cirujano?.fotoUrl || '/api/placeholder/24/24'}" 
                             alt="${cirujano?.nombre || 'Cirujano'}" 
                             class="w-6 h-6 rounded-full mr-2">
                        <span class="text-sm">${cirujano?.nombre || 'No asignado'}</span>
                    </div>
                </td>
                <td>
                    <div>
                        <div class="font-medium">${fecha}</div>
                        <div class="text-sm text-gray-500">${hora}</div>
                    </div>
                </td>
                <td>${cirugia.duracion} horas</td>
                <td>
                    <span class="badge ${estadoClass}">${cirugia.estado.replace('_', ' ').toUpperCase()}</span>
                </td>
                <td>
                    <div class="flex gap-1">
                        <button class="btn btn-sm btn-secondary" onclick="cirugiasManager.editarCirugia('${cirugia.id}')" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-info" onclick="cirugiasManager.verDetallesCirugia('${cirugia.id}')" title="Ver detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="cirugiasManager.eliminarCirugia('${cirugia.id}')" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    // Vista de calendario
    generarVistaCalendario() {
        const fechaActual = new Date(this.fechaSeleccionada);
        const primerDia = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1);
        const ultimoDia = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 0);
        const primerDiaSemana = primerDia.getDay();
        
        const meses = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];

        let calendarioHTML = `
            <div class="calendario-cirugias">
                <div class="calendario-header">
                    <div class="calendario-navegacion">
                        <button class="calendario-prev" onclick="cirugiasManager.cambiarMes(-1)">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <h3 class="calendario-titulo">${meses[fechaActual.getMonth()]} ${fechaActual.getFullYear()}</h3>
                        <button class="calendario-next" onclick="cirugiasManager.cambiarMes(1)">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                    <button class="calendario-hoy" onclick="cirugiasManager.irAHoy()">Hoy</button>
                </div>

                <div class="calendario-dias-semana">
                    <div class="calendario-dia-semana">Dom</div>
                    <div class="calendario-dia-semana">Lun</div>
                    <div class="calendario-dia-semana">Mar</div>
                    <div class="calendario-dia-semana">Mié</div>
                    <div class="calendario-dia-semana">Jue</div>
                    <div class="calendario-dia-semana">Vie</div>
                    <div class="calendario-dia-semana">Sáb</div>
                </div>

                <div class="calendario-grid">
        `;

        // Días del mes anterior
        for (let i = 0; i < primerDiaSemana; i++) {
            const dia = new Date(primerDia);
            dia.setDate(dia.getDate() - (primerDiaSemana - i));
            calendarioHTML += `<div class="calendario-dia calendario-dia-otro-mes">${dia.getDate()}</div>`;
        }

        // Días del mes actual
        for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
            const fechaDia = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), dia);
            const esHoy = fechaDia.toDateString() === new Date().toDateString();
            const cirugiasDia = this.obtenerCirugiasPorFecha(fechaDia);
            
            calendarioHTML += `
                <div class="calendario-dia ${esHoy ? 'calendario-dia-hoy' : ''}" 
                     onclick="cirugiasManager.seleccionarDia('${fechaDia.toISOString()}')">
                    <div class="calendario-numero">${dia}</div>
                    <div class="calendario-eventos">
                        ${cirugiasDia.slice(0, 3).map(cirugia => `
                            <div class="calendario-evento" title="${cirugia.tipo} - ${this.obtenerNombrePaciente(cirugia.idPaciente)}">
                                <span class="evento-hora">${new Date(cirugia.fechaCirugia.seconds * 1000).toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'})}</span>
                                <span class="evento-tipo">${cirugia.tipo.substring(0, 15)}${cirugia.tipo.length > 15 ? '...' : ''}</span>
                            </div>
                        `).join('')}
                        ${cirugiasDia.length > 3 ? `<div class="calendario-evento-mas">+${cirugiasDia.length - 3} más</div>` : ''}
                    </div>
                </div>
            `;
        }

        calendarioHTML += `
                </div>
            </div>
        `;

        return calendarioHTML;
    }

    // Vista de estadísticas
    generarVistaEstadisticas() {
        const cirugiasPorTipo = this.obtenerEstadisticasPorTipo();
        const cirugiasPorCirujano = this.obtenerEstadisticasPorCirujano();
        const cirugiasPorMes = this.obtenerEstadisticasPorMes();

        return `
            <div class="estadisticas-cirugias">
                <div class="grid grid-2 gap-6">
                    <!-- Cirugías por Tipo -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Cirugías por Tipo</h3>
                        </div>
                        <div class="card-body">
                            ${Object.entries(cirugiasPorTipo)
                                .sort(([,a], [,b]) => b.total - a.total)
                                .map(([tipo, stats]) => `
                                    <div class="estadistica-item mb-4 cursor-pointer" onclick="cirugiasManager.filtrarPorTipo('${tipo}')">
                                        <div class="flex justify-between items-center mb-2">
                                            <span class="font-medium">${tipo}</span>
                                            <span class="badge badge-primary">${stats.total}</span>
                                        </div>
                                        <div class="progress-bar">
                                            <div class="progress-fill" style="width: ${(stats.total / Math.max(...Object.values(cirugiasPorTipo).map(s => s.total))) * 100}%"></div>
                                        </div>
                                        <div class="text-sm text-gray-600 mt-1">
                                            Completadas: ${stats.completadas} | Programadas: ${stats.programadas}
                                        </div>
                                    </div>
                                `).join('')}
                        </div>
                    </div>

                    <!-- Cirugías por Cirujano -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Cirugías por Cirujano</h3>
                        </div>
                        <div class="card-body">
                            ${Object.entries(cirugiasPorCirujano)
                                .sort(([,a], [,b]) => b.total - a.total)
                                .map(([cirujanoId, stats]) => {
                                    const cirujano = this.cirujanos.find(c => c.id === cirujanoId);
                                    return `
                                        <div class="estadistica-item mb-4 cursor-pointer" onclick="cirugiasManager.filtrarPorCirujano('${cirujanoId}')">
                                            <div class="flex justify-between items-center mb-2">
                                                <div class="flex items-center">
                                                    <img src="${cirujano?.fotoUrl || '/api/placeholder/24/24'}" 
                                                         class="w-6 h-6 rounded-full mr-2">
                                                    <span class="font-medium">${cirujano?.nombre || 'Sin asignar'}</span>
                                                </div>
                                                <span class="badge badge-success">${stats.total}</span>
                                            </div>
                                            <div class="progress-bar">
                                                <div class="progress-fill bg-green-500" style="width: ${(stats.total / Math.max(...Object.values(cirugiasPorCirujano).map(s => s.total))) * 100}%"></div>
                                            </div>
                                            <div class="text-sm text-gray-600 mt-1">
                                                Completadas: ${stats.completadas} | Programadas: ${stats.programadas}
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                        </div>
                    </div>
                </div>

                <!-- Gráfico de cirugías por mes -->
                <div class="card mt-6">
                    <div class="card-header">
                        <h3 class="card-title">Cirugías por Mes (Últimos 12 meses)</h3>
                    </div>
                    <div class="card-body">
                        <div class="grafico-meses">
                            ${cirugiasPorMes.map(mes => `
                                <div class="mes-item">
                                    <div class="mes-barra" style="height: ${(mes.total / Math.max(...cirugiasPorMes.map(m => m.total))) * 100}%"></div>
                                    <div class="mes-label">${mes.nombre}</div>
                                    <div class="mes-valor">${mes.total}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Obtener cirugías filtradas
    obtenerCirugiasFiltradas() {
        return this.cirugias.filter(cirugia => {
            // Filtro por tipo
            if (this.tipoFiltro && cirugia.tipo !== this.tipoFiltro) {
                return false;
            }

            // Filtro por cirujano
            if (this.cirujanoFiltro && cirugia.idCirujano !== this.cirujanoFiltro) {
                return false;
            }

            // Filtro por tipo de implante
            if (this.tipoImplanteFiltro && cirugia.tipoImplante !== this.tipoImplanteFiltro) {
                return false;
            }

            // Filtro por tamaño de implante
            if (this.tamañoImplanteFiltro && cirugia.tamañoImplante !== this.tamañoImplanteFiltro) {
                return false;
            }

            // Filtro por mes (si está en vista de calendario o se especifica)
            const filtroMes = document.getElementById('filtroMes')?.value;
            if (filtroMes) {
                const [año, mes] = filtroMes.split('-');
                const fechaCirugia = cirugia.fechaCirugia.seconds ? 
                    new Date(cirugia.fechaCirugia.seconds * 1000) : new Date(cirugia.fechaCirugia);
                
                if (fechaCirugia.getFullYear() !== parseInt(año) || 
                    fechaCirugia.getMonth() !== parseInt(mes) - 1) {
                    return false;
                }
            }

            return true;
        });
    }

    // Aplicar filtros
    aplicarFiltros() {
        this.tipoFiltro = document.getElementById('filtroTipo')?.value || '';
        this.cirujanoFiltro = document.getElementById('filtroCirujano')?.value || '';
        this.tipoImplanteFiltro = document.getElementById('filtroTipoImplante')?.value || '';
        this.tamañoImplanteFiltro = document.getElementById('filtroTamañoImplante')?.value || '';
        
        const filtroMes = document.getElementById('filtroMes')?.value;
        if (filtroMes) {
            const [año, mes] = filtroMes.split('-');
            this.fechaSeleccionada = new Date(parseInt(año), parseInt(mes) - 1, 1);
        }

        this.mostrarInterfaz();
    }

    // Limpiar filtros
    limpiarFiltros() {
        this.tipoFiltro = '';
        this.cirujanoFiltro = '';
        this.tipoImplanteFiltro = '';
        this.tamañoImplanteFiltro = '';
        this.fechaSeleccionada = new Date();
        this.mostrarInterfaz();
    }

    // Filtrar por tipo específico
    filtrarPorTipo(tipo) {
        this.tipoFiltro = tipo;
        this.vistaActual = 'lista';
        this.mostrarInterfaz();
    }

    // Filtrar por cirujano específico
    filtrarPorCirujano(cirujanoId) {
        this.cirujanoFiltro = cirujanoId;
        this.vistaActual = 'lista';
        this.mostrarInterfaz();
    }

    // Obtener cirugías por fecha específica
    obtenerCirugiasPorFecha(fecha) {
        return this.obtenerCirugiasFiltradas().filter(cirugia => {
            const fechaCirugia = cirugia.fechaCirugia.seconds ? 
                new Date(cirugia.fechaCirugia.seconds * 1000) : new Date(cirugia.fechaCirugia);
            return fechaCirugia.toDateString() === fecha.toDateString();
        });
    }

    // Cambiar mes en calendario
    cambiarMes(direccion) {
        this.fechaSeleccionada.setMonth(this.fechaSeleccionada.getMonth() + direccion);
        this.mostrarInterfaz();
    }

    // Ir a hoy
    irAHoy() {
        this.fechaSeleccionada = new Date();
        this.mostrarInterfaz();
    }

    // Seleccionar día en calendario
    seleccionarDia(fechaISO) {
        const fecha = new Date(fechaISO);
        const cirugiasDia = this.obtenerCirugiasPorFecha(fecha);
        
        // Mostrar modal con las cirugías del día
        this.mostrarCirugiasDia(fecha, cirugiasDia);
    }

    // Mostrar cirugías del día
    mostrarCirugiasDia(fecha, cirugias) {
        const fechaFormateada = fecha.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const modalBody = `
            <div class="cirugias-dia">
                <h4 class="mb-4">Cirugías programadas para ${fechaFormateada}</h4>
                ${cirugias.length === 0 ? 
                    '<p class="text-center text-gray-500">No hay cirugías programadas para este día</p>' :
                    cirugias.filter(cirugia => cirugia && cirugia.id).map(cirugia => {
                        // Verificar que la cirugía tenga los datos necesarios
                        const fechaCirugia = cirugia.fechaCirugia && cirugia.fechaCirugia.seconds ? 
                            new Date(cirugia.fechaCirugia.seconds * 1000) : 
                            (cirugia.fechaCirugia ? new Date(cirugia.fechaCirugia) : new Date());
                        
                        return `
                        <div class="cirugia-card card mb-3">
                            <div class="card-body">
                                <div class="flex justify-between items-start">
                                    <div>
                                        <h5 class="font-semibold">${cirugia.tipo || 'Tipo no especificado'}</h5>
                                        <p class="text-sm text-gray-600">
                                            <i class="fas fa-user mr-1"></i>
                                            ${this.obtenerNombrePaciente(cirugia.idPaciente || null)}
                                        </p>
                                        <p class="text-sm text-gray-600">
                                            <i class="fas fa-user-md mr-1"></i>
                                            ${this.obtenerNombreCirujano(cirugia.idCirujano || null)}
                                        </p>
                                        <p class="text-sm text-gray-600">
                                            <i class="fas fa-clock mr-1"></i>
                                            ${fechaCirugia.toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'})} 
                                            (${cirugia.duracion || '2'} horas)
                                        </p>
                                    </div>
                                    <div class="flex gap-2">
                                        <button class="btn btn-sm btn-secondary" onclick="cirugiasManager.editarCirugia('${cirugia.id}')">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn btn-sm btn-info" onclick="cirugiasManager.verDetallesCirugia('${cirugia.id}')">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        `;
                    }).join('')
                }
                <div class="text-center mt-4">
                    <button class="btn btn-primary" onclick="cirugiasManager.abrirModalCirugia('${fecha.toISOString()}')">
                        <i class="fas fa-plus"></i> Programar Cirugía para este día
                    </button>
                </div>
            </div>
        `;

        abrirModal(`Cirugías del día`, modalBody, `
            <button class="btn btn-secondary" onclick="cerrarModal()">Cerrar</button>
        `);
    }

    // Obtener nombre del paciente
    obtenerNombrePaciente(idPaciente) {
        if (!idPaciente) {
            return 'Paciente no asignado';
        }
        // Asegurar que pacientes esté definido y sea un array
        const pacientesDisponibles = Array.isArray(pacientes) ? pacientes : [];
        const paciente = pacientesDisponibles.find(p => p && p.id === idPaciente);
        return paciente ? `${paciente.nombre} ${paciente.apellido}` : 'Paciente no encontrado';
    }

    // Obtener nombre del cirujano
    obtenerNombreCirujano(idCirujano) {
        if (!idCirujano) {
            return 'Sin asignar';
        }
        // Asegurar que cirujanos esté definido y sea un array
        const cirujanosDisponibles = Array.isArray(this.cirujanos) ? this.cirujanos : [];
        const cirujano = cirujanosDisponibles.find(c => c && c.id === idCirujano);
        return cirujano ? cirujano.nombre : 'Sin asignar';
    }

    // Obtener estadísticas por tipo
    obtenerEstadisticasPorTipo() {
        const stats = {};
        this.cirugias.forEach(cirugia => {
            if (!stats[cirugia.tipo]) {
                stats[cirugia.tipo] = { total: 0, completadas: 0, programadas: 0 };
            }
            stats[cirugia.tipo].total++;
            if (cirugia.estado === 'completada') {
                stats[cirugia.tipo].completadas++;
            } else if (cirugia.estado === 'programada') {
                stats[cirugia.tipo].programadas++;
            }
        });
        return stats;
    }

    // Obtener estadísticas por cirujano
    obtenerEstadisticasPorCirujano() {
        const stats = {};
        this.cirugias.forEach(cirugia => {
            const cirujanoId = cirugia.idCirujano || 'sin_asignar';
            if (!stats[cirujanoId]) {
                stats[cirujanoId] = { total: 0, completadas: 0, programadas: 0 };
            }
            stats[cirujanoId].total++;
            if (cirugia.estado === 'completada') {
                stats[cirujanoId].completadas++;
            } else if (cirugia.estado === 'programada') {
                stats[cirujanoId].programadas++;
            }
        });
        return stats;
    }

    // Obtener estadísticas por mes
    obtenerEstadisticasPorMes() {
        const meses = [];
        const fechaActual = new Date();
        
        for (let i = 11; i >= 0; i--) {
            const fecha = new Date(fechaActual.getFullYear(), fechaActual.getMonth() - i, 1);
            const cirugiasMes = this.cirugias.filter(cirugia => {
                const fechaCirugia = cirugia.fechaCirugia.seconds ? 
                    new Date(cirugia.fechaCirugia.seconds * 1000) : new Date(cirugia.fechaCirugia);
                return fechaCirugia.getMonth() === fecha.getMonth() && 
                       fechaCirugia.getFullYear() === fecha.getFullYear();
            });
            
            meses.push({
                nombre: fecha.toLocaleDateString('es-ES', { month: 'short' }),
                total: cirugiasMes.length,
                fecha: fecha
            });
        }
        
        return meses;
    }

    // Abrir modal para crear/editar cirugía
    async abrirModalCirugia(id = null, fechaPreseleccionada = null) {
        // Asegurar que los pacientes estén cargados
        if (!pacientes || pacientes.length === 0) {
            try {
                await cargarPacientes();
            } catch (error) {
                console.error('Error cargando pacientes:', error);
                mostrarToast('Error al cargar la lista de pacientes', 'error');
                return;
            }
        }

        const esEdicion = id !== null && typeof id === 'string' && id.length > 10;
        const cirugia = esEdicion ? this.cirugias.find(c => c.id === id) : {};
        
        // Si se pasa una fecha como primer parámetro
        let fechaInicial = '';
        if (fechaPreseleccionada) {
            const fecha = new Date(fechaPreseleccionada);
            fechaInicial = fecha.toISOString().slice(0, 16);
        } else if (typeof id === 'string' && id.includes('T')) {
            // Es una fecha ISO
            fechaInicial = new Date(id).toISOString().slice(0, 16);
        } else if (esEdicion && cirugia && cirugia.fechaCirugia) {
            const fecha = cirugia.fechaCirugia.seconds ? 
                new Date(cirugia.fechaCirugia.seconds * 1000) : new Date(cirugia.fechaCirugia);
            fechaInicial = fecha.toISOString().slice(0, 16);
        }

        // Asegurar que pacientes esté definido y sea un array
        const pacientesDisponibles = Array.isArray(pacientes) ? pacientes : [];
        const cirujanosDisponibles = Array.isArray(this.cirujanos) ? this.cirujanos : [];
        const tiposCirugiasDisponibles = Array.isArray(this.tiposCirugias) ? this.tiposCirugias : [];

        const modalBody = `
            <form id="formCirugia">
                <div class="grid grid-2 gap-4">
                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-user text-blue-500 mr-2"></i>Paciente
                        </label>
                        <select name="idPaciente" class="form-select" required>
                            <option value="">Seleccionar paciente</option>
                            ${pacientesDisponibles.map(p => `
                                <option value="${p.id}" ${(cirugia && cirugia.idPaciente === p.id) ? 'selected' : ''}>
                                    ${p.nombre} ${p.apellido} - ${p.cedula}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-cut text-purple-500 mr-2"></i>Tipo de Cirugía
                        </label>
                        <select name="tipo" class="form-select" required>
                            <option value="">Seleccionar tipo</option>
                            ${tiposCirugiasDisponibles.map(tipo => `
                                <option value="${tipo}" ${(cirugia && cirugia.tipo === tipo) ? 'selected' : ''}>${tipo}</option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-user-md text-green-500 mr-2"></i>Cirujano Principal
                        </label>
                        <select name="idCirujano" class="form-select" required>
                            <option value="">Seleccionar cirujano</option>
                            ${cirujanosDisponibles.map(cirujano => `
                                <option value="${cirujano.id}" ${(cirugia && cirugia.idCirujano === cirujano.id) ? 'selected' : ''}>
                                    ${cirujano.nombre} - ${cirujano.tipoDoctor}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-calendar text-orange-500 mr-2"></i>Fecha y Hora de Cirugía
                        </label>
                        <input type="datetime-local" name="fechaCirugia" class="form-input cita-datetime" 
                               value="${fechaInicial}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-clock text-gray-500 mr-2"></i>Duración Estimada (horas)
                        </label>
                        <input type="number" name="duracion" class="form-input" 
                               step="0.5" min="0.5" max="12" 
                               value="${(cirugia && cirugia.duracion) || '2'}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-info-circle text-blue-500 mr-2"></i>Estado
                        </label>
                        <select name="estado" class="form-select" required>
                            <option value="programada" ${(cirugia && cirugia.estado === 'programada') ? 'selected' : ''}>Programada</option>
                            <option value="en_proceso" ${(cirugia && cirugia.estado === 'en_proceso') ? 'selected' : ''}>En Proceso</option>
                            <option value="completada" ${(cirugia && cirugia.estado === 'completada') ? 'selected' : ''}>Completada</option>
                            <option value="cancelada" ${(cirugia && cirugia.estado === 'cancelada') ? 'selected' : ''}>Cancelada</option>
                        </select>
                    </div>
                </div>
                
                <!-- Sección de Equipo Quirúrgico -->
                <div class="form-group mt-4">
                    <h4 class="text-lg font-semibold mb-3 text-indigo-600">
                        <i class="fas fa-users mr-2"></i>Equipo Quirúrgico
                    </h4>
                </div>
                
                <div class="grid grid-2 gap-4">
                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-syringe text-red-500 mr-2"></i>Anestesiólogo
                        </label>
                        <input type="text" name="anestesiologo" class="form-input" 
                               placeholder="Nombre del anestesiólogo"
                               value="${(cirugia && cirugia.anestesiologo) || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-user-nurse text-blue-500 mr-2"></i>Instrumentista
                        </label>
                        <input type="text" name="instrumentista" class="form-input" 
                               placeholder="Nombre del instrumentista"
                               value="${(cirugia && cirugia.instrumentista) || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-user-nurse text-teal-500 mr-2"></i>Enfermera Circulante
                        </label>
                        <input type="text" name="enfermeraCirculante" class="form-input" 
                               placeholder="Nombre de la enfermera circulante"
                               value="${(cirugia && cirugia.enfermeraCirculante) || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-user-md text-purple-500 mr-2"></i>Cirujano Asistente
                        </label>
                        <input type="text" name="cirujanoAsistente" class="form-input" 
                               placeholder="Nombre del cirujano asistente"
                               value="${(cirugia && cirugia.cirujanoAsistente) || ''}">
                    </div>
                </div>
                
                <!-- Campo para otros miembros del equipo -->
                <div class="form-group mt-4">
                    <label class="form-label">
                        <i class="fas fa-users text-indigo-500 mr-2"></i>Otros Miembros del Equipo
                    </label>
                    <textarea name="equipoAdicional" class="form-textarea" rows="3" 
                              placeholder="Escriba otros miembros del equipo quirúrgico (ej: Técnico en Anestesia, Auxiliares de Enfermería, etc.)">${(cirugia && cirugia.equipoAdicional) || ''}</textarea>
                </div>
                <div class="form-group mt-4">
                    <label class="form-label">
                        <i class="fas fa-notes-medical text-gray-500 mr-2"></i>Descripción y Notas
                    </label>
                    <textarea name="descripcion" class="form-textarea" rows="4" 
                              placeholder="Detalles de la cirugía, preparación especial, notas importantes...">${(cirugia && cirugia.descripcion) || ''}</textarea>
                </div>
            </form>
        `;

        const modalFooter = `
            <button type="button" class="btn btn-secondary" onclick="cerrarModal()">Cancelar</button>
            <button type="button" class="btn btn-primary" onclick="cirugiasManager.guardarCirugia('${esEdicion ? (cirugia && cirugia.id) || '' : ''}')">
                <i class="fas fa-save mr-2"></i>${esEdicion ? 'Actualizar' : 'Programar'} Cirugía
            </button>
        `;

        abrirModal(esEdicion ? 'Editar Cirugía' : 'Nueva Cirugía', modalBody, modalFooter);
    }

    // Guardar cirugía
    async guardarCirugia(id = '') {
        const form = document.getElementById('formCirugia');
        const formData = new FormData(form);
        const datos = Object.fromEntries(formData);
        
        try {
            // Convertir fecha a timestamp
            datos.fechaCirugia = firebase.firestore.Timestamp.fromDate(new Date(datos.fechaCirugia));
            datos.duracion = parseFloat(datos.duracion);

            if (id) {
                // Actualizar cirugía existente
                await Firebase.CirugiasService.actualizarCirugia(id, datos);
                mostrarToast('Cirugía actualizada correctamente', 'success');
            } else {
                // Crear nueva cirugía
                await Firebase.CirugiasService.crearCirugia(datos);
                mostrarToast('Cirugía programada correctamente', 'success');
            }
            
            cerrarModal();
            await this.cargarCirugias();
            this.mostrarInterfaz();
        } catch (error) {
            console.error('Error guardando cirugía:', error);
            mostrarToast('Error al guardar la cirugía', 'error');
        }
    }

    // Editar cirugía
    editarCirugia(id) {
        this.abrirModalCirugia(id);
    }

    // Ver detalles de cirugía
    verDetallesCirugia(id) {
        const cirugia = this.cirugias.find(c => c.id === id);
        if (!cirugia) return;

        // Asegurar que pacientes esté definido y sea un array
        const pacientesDisponibles = Array.isArray(pacientes) ? pacientes : [];
        const cirujanosDisponibles = Array.isArray(this.cirujanos) ? this.cirujanos : [];
        const paciente = pacientesDisponibles.find(p => p.id === cirugia.idPaciente);
        const cirujano = cirujanosDisponibles.find(c => c.id === cirugia.idCirujano);
        const fechaCirugia = cirugia.fechaCirugia && cirugia.fechaCirugia.seconds ? 
            new Date(cirugia.fechaCirugia.seconds * 1000) : new Date(cirugia.fechaCirugia);

        const modalBody = `
            <div class="cirugia-detalles">
                <div class="grid grid-2 gap-6">
                    <div class="detalle-seccion">
                        <h4 class="text-lg font-semibold mb-4 text-blue-600">
                            <i class="fas fa-info-circle mr-2"></i>Información General
                        </h4>
                        <div class="detalle-item">
                            <strong>Tipo de Cirugía:</strong>
                            <p>${cirugia.tipo}</p>
                        </div>
                        <div class="detalle-item">
                            <strong>Estado:</strong>
                            <p><span class="badge badge-${cirugia.estado === 'completada' ? 'success' : cirugia.estado === 'programada' ? 'primary' : 'warning'}">${cirugia.estado.replace('_', ' ').toUpperCase()}</span></p>
                        </div>
                        <div class="detalle-item">
                            <strong>Fecha y Hora:</strong>
                            <p>${fechaCirugia.toLocaleDateString()} a las ${fechaCirugia.toLocaleTimeString()}</p>
                        </div>
                        <div class="detalle-item">
                            <strong>Duración Estimada:</strong>
                            <p>${cirugia.duracion} horas</p>
                        </div>
                    </div>
                    
                    <div class="detalle-seccion">
                        <h4 class="text-lg font-semibold mb-4 text-green-600">
                            <i class="fas fa-users mr-2"></i>Equipo Médico y Paciente
                        </h4>
                        <div class="detalle-item">
                            <strong>Paciente:</strong>
                            <div class="flex items-center mt-2">
                                <img src="${paciente?.fotoUrl || '/api/placeholder/40/40'}" 
                                     class="w-10 h-10 rounded-full mr-3">
                                <div>
                                    <p class="font-medium">${paciente ? `${paciente.nombre} ${paciente.apellido}` : 'Paciente no encontrado'}</p>
                                    <p class="text-sm text-gray-600">${paciente?.cedula || ''}</p>
                                </div>
                            </div>
                        </div>
                        <div class="detalle-item">
                            <strong>Cirujano Principal:</strong>
                            <div class="flex items-center mt-2">
                                <img src="${cirujano?.fotoUrl || '/api/placeholder/40/40'}" 
                                     class="w-10 h-10 rounded-full mr-3">
                                <div>
                                    <p class="font-medium">${cirujano?.nombre || 'Sin asignar'}</p>
                                    <p class="text-sm text-gray-600">${cirujano?.tipoDoctor || ''}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Sección de Equipo Quirúrgico -->
                ${(cirugia.anestesiologo || cirugia.instrumentista || cirugia.enfermeraCirculante || cirugia.cirujanoAsistente || cirugia.equipoAdicional) ? `
                    <div class="detalle-seccion mt-6">
                        <h4 class="text-lg font-semibold mb-4 text-indigo-600">
                            <i class="fas fa-users mr-2"></i>Equipo Quirúrgico
                        </h4>
                        <div class="grid grid-2 gap-4">
                            ${cirugia.anestesiologo ? `
                                <div class="detalle-item">
                                    <strong><i class="fas fa-syringe text-red-500 mr-2"></i>Anestesiólogo:</strong>
                                    <p>${cirugia.anestesiologo}</p>
                                </div>
                            ` : ''}
                            ${cirugia.instrumentista ? `
                                <div class="detalle-item">
                                    <strong><i class="fas fa-user-nurse text-blue-500 mr-2"></i>Instrumentista:</strong>
                                    <p>${cirugia.instrumentista}</p>
                                </div>
                            ` : ''}
                            ${cirugia.enfermeraCirculante ? `
                                <div class="detalle-item">
                                    <strong><i class="fas fa-user-nurse text-teal-500 mr-2"></i>Enfermera Circulante:</strong>
                                    <p>${cirugia.enfermeraCirculante}</p>
                                </div>
                            ` : ''}
                            ${cirugia.cirujanoAsistente ? `
                                <div class="detalle-item">
                                    <strong><i class="fas fa-user-md text-purple-500 mr-2"></i>Cirujano Asistente:</strong>
                                    <p>${cirugia.cirujanoAsistente}</p>
                                </div>
                            ` : ''}
                        </div>
                        ${cirugia.equipoAdicional ? `
                            <div class="detalle-item mt-4">
                                <strong><i class="fas fa-users text-indigo-500 mr-2"></i>Otros Miembros del Equipo:</strong>
                                <p class="bg-gray-50 p-3 rounded-lg mt-2">${cirugia.equipoAdicional}</p>
                            </div>
                        ` : ''}
                    </div>
                ` : ''}
                
                ${cirugia.descripcion ? `
                    <div class="detalle-seccion mt-6">
                        <h4 class="text-lg font-semibold mb-4 text-purple-600">
                            <i class="fas fa-notes-medical mr-2"></i>Descripción y Notas
                        </h4>
                        <div class="detalle-item">
                            <p class="bg-gray-50 p-4 rounded-lg">${cirugia.descripcion}</p>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;

        const modalFooter = `
            <button class="btn btn-secondary" onclick="cerrarModal()">Cerrar</button>
            <button class="btn btn-primary" onclick="cirugiasManager.editarCirugia('${id}')">
                <i class="fas fa-edit mr-2"></i>Editar Cirugía
            </button>
        `;

        abrirModal('Detalles de la Cirugía', modalBody, modalFooter);
    }

    // Eliminar cirugía
    async eliminarCirugia(id) {
        if (!confirm('¿Está seguro de que desea eliminar esta cirugía?')) {
            return;
        }

        try {
            await Firebase.CirugiasService.eliminarCirugia(id);
            mostrarToast('Cirugía eliminada correctamente', 'success');
            await this.cargarCirugias();
            this.mostrarInterfaz();
        } catch (error) {
            console.error('Error eliminando cirugía:', error);
            mostrarToast('Error al eliminar la cirugía', 'error');
        }
    }
}

// Hacer la función guardarCirugia disponible globalmente
window.guardarCirugia = function(id = '') {
    if (window.cirugiasManager) {
        return window.cirugiasManager.guardarCirugia(id);
    } else {
        console.error('CirugiasManager no está disponible');
        mostrarToast('Error: Manager de cirugías no disponible', 'error');
    }
};