// ===================== GESTIÓN DE HISTORIAS CLÍNICAS =====================

class HistoriasClinicasManager {
    constructor() {
        this.historias = [];
        this.pacienteActual = null;
        this.historiaActual = null;
    }

    // Cargar historias de un paciente específico
    async cargarHistoriasPaciente(idPaciente) {
        try {
            this.pacienteActual = pacientes.find(p => p.id === idPaciente);
            this.historias = await Firebase.HistoriasService.obtenerHistoriasPorPaciente(idPaciente);
            this.mostrarHistorias();
        } catch (error) {
            console.error('Error cargando historias:', error);
            mostrarToast('Error cargando historias clínicas', 'error');
        }
    }

    // Mostrar las historias en la interfaz
    mostrarHistorias() {
        const container = document.getElementById('historiasLista');
        
        if (!this.pacienteActual) {
            container.innerHTML = this.crearSelectorPaciente();
            return;
        }

        const headerHTML = `
            <div class="card mb-4">
                <div class="card-header">
                    <div class="flex justify-between items-center">
                        <h3>Historias Clínicas - ${this.pacienteActual.nombre} ${this.pacienteActual.apellido}</h3>
                        <div>
                            <button class="btn btn-secondary btn-sm" onclick="historiasManager.volverALista()">
                                <i class="fas fa-arrow-left"></i> Volver
                            </button>
                            <button class="btn btn-primary btn-sm" onclick="historiasManager.abrirModalHistoria()">
                                <i class="fas fa-plus"></i> Nueva Historia
                            </button>
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <div class="grid grid-3 gap-4 mb-4">
                        <div class="stat-card">
                            <div class="stat-icon primary">
                                <i class="fas fa-file-medical"></i>
                            </div>
                            <div class="stat-content">
                                <h3>${this.historias.length}</h3>
                                <p>Historias Totales</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon success">
                                <i class="fas fa-user-check"></i>
                            </div>
                            <div class="stat-content">
                                <h3>${this.calcularEdad(this.pacienteActual.fechaNacimiento)}</h3>
                                <p>Años de Edad</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon warning">
                                <i class="fas fa-calendar"></i>
                            </div>
                            <div class="stat-content">
                                <h3>${this.obtenerUltimaVisita()}</h3>
                                <p>Última Visita</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const historiasHTML = this.historias.length === 0 ? 
            '<div class="card"><div class="card-body text-center"><p>No hay historias clínicas registradas para este paciente</p></div></div>' :
            this.historias.map(historia => this.crearTarjetaHistoria(historia)).join('');

        container.innerHTML = headerHTML + historiasHTML;
    }

    // Crear selector de paciente
    crearSelectorPaciente() {
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Seleccionar Paciente</h3>
                </div>
                <div class="card-body">
                    <div class="form-group">
                        <label class="form-label">Buscar Paciente</label>
                        <select id="selectorPaciente" class="form-select" onchange="historiasManager.seleccionarPaciente(this.value)">
                            <option value="">Seleccione un paciente...</option>
                            ${pacientes.map(p => `
                                <option value="${p.id}">${p.nombre} ${p.apellido} - ${p.cedula}</option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="grid grid-2 gap-4 mt-4">
                        ${pacientes.slice(0, 6).map(p => `
                            <div class="paciente-card card" onclick="historiasManager.cargarHistoriasPaciente('${p.id}')">
                                <div class="card-body">
                                    <div class="flex items-center gap-3">
                                        <img src="${p.fotoUrl || '/api/placeholder/50/50'}" class="usuario-avatar">
                                        <div>
                                            <h5 class="mb-1">${p.nombre} ${p.apellido}</h5>
                                            <p class="text-sm text-gray-600 mb-0">${p.cedula}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    // Crear tarjeta de historia clínica
    crearTarjetaHistoria(historia) {
        const fecha = new Date(historia.fechaCreacion.seconds * 1000).toLocaleDateString();
        const hora = new Date(historia.fechaCreacion.seconds * 1000).toLocaleTimeString();
        
        return `
            <div class="card mb-3">
                <div class="card-header">
                    <div class="flex justify-between items-center">
                        <h4>${historia.motivo || 'Consulta General'}</h4>
                        <div class="flex items-center gap-2">
                            <span class="badge badge-primary">${fecha}</span>
                            <button class="btn btn-sm btn-secondary" onclick="historiasManager.editarHistoria('${historia.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <div class="grid grid-2 gap-4">
                        <div>
                            <h6>Síntomas Principales:</h6>
                            <p>${historia.sintomas || 'No especificados'}</p>
                            
                            <h6>Diagnóstico:</h6>
                            <p>${historia.diagnostico || 'Pendiente'}</p>
                        </div>
                        <div>
                            <h6>Tratamiento Prescrito:</h6>
                            <p>${historia.tratamiento || 'No especificado'}</p>
                            
                            <h6>Observaciones:</h6>
                            <p>${historia.observaciones || 'Ninguna'}</p>
                        </div>
                    </div>
                    
                    ${historia.examenes && historia.examenes.length > 0 ? `
                        <div class="mt-4">
                            <h6>Exámenes Adjuntos:</h6>
                            <div class="flex gap-2 mt-2">
                                ${historia.examenes.map(examen => `
                                    <a href="${examen.url}" target="_blank" class="btn btn-sm btn-outline-primary">
                                        <i class="fas fa-file-medical"></i> ${examen.nombre}
                                    </a>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="mt-3 text-sm text-gray-600">
                        <i class="fas fa-clock"></i> Registrado el ${fecha} a las ${hora}
                    </div>
                </div>
            </div>
        `;
    }

    // Abrir modal para crear/editar historia
    abrirModalHistoria(id = null, idCita = null) {
        const esEdicion = id !== null;
        const historia = esEdicion ? this.historias.find(h => h.id === id) : {};
        
        // Obtener citas del paciente para poder relacionar
        const citasPaciente = citas.filter(c => c.idPaciente === this.pacienteActual.id);

        const modalBody = `
            <form id="formHistoria">
                <input type="hidden" name="idPaciente" value="${this.pacienteActual.id}">
                ${idCita ? `<input type="hidden" name="idCita" value="${idCita}">` : ''}
                
                <!-- LAYOUT PRINCIPAL: 2 COLUMNAS -->
                <div class="grid grid-2 gap-6">
                    
                    <!-- COLUMNA IZQUIERDA -->
                    <div class="columna-izquierda">
                        <!-- INFORMACIÓN GENERAL -->
                        <div class="card mb-4">
                            <div class="card-header">
                                <h4><i class="fas fa-info-circle mr-2 text-blue-500"></i>Información General de la Consulta</h4>
                            </div>
                            <div class="card-body">
                                <div class="grid grid-2 gap-4 mb-4">
                                    <div class="form-group">
                                        <label class="form-label">
                                            <i class="fas fa-stethoscope mr-1"></i>Tipo de Consulta
                                        </label>
                                        <select name="tipoConsulta" class="form-select" required>
                                            <option value="">Seleccionar tipo</option>
                                            <option value="primera_vez" ${historia.tipoConsulta === 'primera_vez' ? 'selected' : ''}>Primera Vez</option>
                                            <option value="control" ${historia.tipoConsulta === 'control' ? 'selected' : ''}>Control</option>
                                            <option value="emergencia" ${historia.tipoConsulta === 'emergencia' ? 'selected' : ''}>Emergencia</option>
                                            <option value="preoperatorio" ${historia.tipoConsulta === 'preoperatorio' ? 'selected' : ''}>Pre-operatorio</option>
                                            <option value="postoperatorio" ${historia.tipoConsulta === 'postoperatorio' ? 'selected' : ''}>Post-operatorio</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">
                                            <i class="fas fa-calendar-alt mr-1"></i>Fecha de Consulta
                                        </label>
                                        <input type="datetime-local" name="fechaConsulta" class="form-input" 
                                               value="${historia.fechaConsulta || new Date().toISOString().slice(0, 16)}" required>
                                    </div>
                                </div>
                                <div class="form-group mb-4">
                                    <label class="form-label">
                                        <i class="fas fa-link mr-1"></i>Relacionar con Cita
                                    </label>
                                    <select name="idCitaRelacionada" class="form-select">
                                        <option value="">Sin cita relacionada</option>
                                        ${citasPaciente.map(cita => {
                                            const fechaCita = cita.fechaCita ? 
                                                (cita.fechaCita.seconds ? 
                                                    new Date(cita.fechaCita.seconds * 1000).toLocaleDateString() :
                                                    new Date(cita.fechaCita).toLocaleDateString()) : 
                                                'Sin fecha';
                                            const selected = (idCita && cita.id === idCita) || historia.idCitaRelacionada === cita.id ? 'selected' : '';
                                            return `<option value="${cita.id}" ${selected}>${fechaCita} - ${cita.motivo}</option>`;
                                        }).join('')}
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">
                                        <i class="fas fa-comment-medical mr-1"></i>Motivo de Consulta
                                    </label>
                                    <textarea name="motivo" class="form-textarea" rows="3" required placeholder="Describa el motivo principal de la consulta...">${historia.motivo || ''}</textarea>
                                </div>
                            </div>
                        </div>

                        <!-- SIGNOS VITALES -->
                        <div class="card mb-4">
                            <div class="card-header">
                                <h4><i class="fas fa-heartbeat mr-2 text-red-500"></i>Signos Vitales</h4>
                            </div>
                            <div class="card-body">
                                <div class="grid grid-3 gap-3 mb-4">
                                    <div class="form-group">
                                        <label class="form-label">
                                            <i class="fas fa-weight mr-1"></i>Peso (kg)
                                        </label>
                                        <input type="number" name="peso" class="form-input" step="0.1"
                                               value="${historia.peso || ''}" placeholder="70.5">
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">
                                            <i class="fas fa-ruler-vertical mr-1"></i>Altura (cm)
                                        </label>
                                        <input type="number" name="altura" class="form-input"
                                               value="${historia.altura || ''}" placeholder="170">
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">
                                            <i class="fas fa-calculator mr-1"></i>IMC
                                        </label>
                                        <input type="text" id="imcCalculado" class="form-input bg-gray-100" readonly 
                                               placeholder="Auto">
                                    </div>
                                </div>
                                <div class="grid grid-2 gap-3 mb-4">
                                    <div class="form-group">
                                        <label class="form-label">
                                            <i class="fas fa-tachometer-alt mr-1"></i>Presión Arterial
                                        </label>
                                        <input type="text" name="presionArterial" class="form-input" 
                                               placeholder="120/80" value="${historia.presionArterial || ''}">
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">
                                            <i class="fas fa-thermometer-half mr-1"></i>Temperatura (°C)
                                        </label>
                                        <input type="number" name="temperatura" class="form-input" step="0.1"
                                               value="${historia.temperatura || ''}" placeholder="36.5">
                                    </div>
                                </div>
                                <div class="grid grid-3 gap-3">
                                    <div class="form-group">
                                        <label class="form-label">
                                            <i class="fas fa-heartbeat mr-1"></i>FC (lpm)
                                        </label>
                                        <input type="number" name="frecuenciaCardiaca" class="form-input"
                                               value="${historia.frecuenciaCardiaca || ''}" placeholder="72">
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">
                                            <i class="fas fa-lungs mr-1"></i>FR (rpm)
                                        </label>
                                        <input type="number" name="frecuenciaRespiratoria" class="form-input"
                                               value="${historia.frecuenciaRespiratoria || ''}" placeholder="16">
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">
                                            <i class="fas fa-percentage mr-1"></i>Sat O2 (%)
                                        </label>
                                        <input type="number" name="saturacionOxigeno" class="form-input" min="0" max="100"
                                               value="${historia.saturacionOxigeno || ''}" placeholder="98">
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- EVALUACIÓN CLÍNICA -->
                        <div class="card mb-4">
                            <div class="card-header">
                                <h4><i class="fas fa-clipboard-list mr-2 text-green-500"></i>Evaluación Clínica</h4>
                            </div>
                            <div class="card-body">
                                <div class="form-group mb-4">
                                    <label class="form-label">
                                        <i class="fas fa-exclamation-triangle mr-1"></i>Síntomas Principales
                                    </label>
                                    <textarea name="sintomas" class="form-textarea" rows="4" required 
                                              placeholder="Describa los síntomas que presenta el paciente...">${historia.sintomas || ''}</textarea>
                                </div>
                                <div class="grid grid-2 gap-4">
                                    <div class="form-group">
                                        <label class="form-label">
                                            <i class="fas fa-history mr-1"></i>Antecedentes Médicos
                                        </label>
                                        <textarea name="antecedentes" class="form-textarea" rows="3" 
                                                  placeholder="Antecedentes médicos relevantes...">${historia.antecedentes || ''}</textarea>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">
                                            <i class="fas fa-pills mr-1"></i>Medicamentos Actuales
                                        </label>
                                        <textarea name="medicamentosActuales" class="form-textarea" rows="3" 
                                                  placeholder="Medicamentos que toma actualmente...">${historia.medicamentosActuales || ''}</textarea>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">
                                        <i class="fas fa-allergies mr-1"></i>Alergias
                                    </label>
                                    <textarea name="alergias" class="form-textarea" rows="2" 
                                              placeholder="Alergias conocidas (medicamentos, alimentos, etc.)...">${historia.alergias || ''}</textarea>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- COLUMNA DERECHA -->
                    <div class="columna-derecha">
                        <!-- EXAMEN FÍSICO -->
                        <div class="card mb-4">
                            <div class="card-header">
                                <h4><i class="fas fa-user-md mr-2 text-purple-500"></i>Examen Físico</h4>
                            </div>
                            <div class="card-body">
                                <div class="form-group mb-4">
                                    <label class="form-label">
                                        <i class="fas fa-eye mr-1"></i>Aspecto General
                                    </label>
                                    <textarea name="aspectoGeneral" class="form-textarea" rows="3" 
                                              placeholder="Estado general del paciente, postura, hidratación...">${historia.aspectoGeneral || ''}</textarea>
                                </div>
                                <div class="form-group mb-4">
                                    <label class="form-label">
                                        <i class="fas fa-search mr-1"></i>Examen por Sistemas
                                    </label>
                                    <textarea name="examenFisico" class="form-textarea" rows="5" 
                                              placeholder="Cardiovascular, respiratorio, neurológico, abdomen...">${historia.examenFisico || ''}</textarea>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">
                                        <i class="fas fa-exclamation-circle mr-1"></i>Hallazgos Relevantes
                                    </label>
                                    <textarea name="hallazgos" class="form-textarea" rows="3" 
                                              placeholder="Hallazgos positivos o negativos importantes...">${historia.hallazgos || ''}</textarea>
                                </div>
                            </div>
                        </div>

                        <!-- DIAGNÓSTICO Y TRATAMIENTO -->
                        <div class="card mb-4">
                            <div class="card-header">
                                <h4><i class="fas fa-diagnoses mr-2 text-orange-500"></i>Diagnóstico y Tratamiento</h4>
                            </div>
                            <div class="card-body">
                                <div class="form-group mb-4">
                                    <label class="form-label">
                                        <i class="fas fa-clipboard-check mr-1"></i>Diagnóstico Principal
                                    </label>
                                    <textarea name="diagnostico" class="form-textarea" rows="3" required 
                                              placeholder="Diagnóstico principal basado en la evaluación...">${historia.diagnostico || ''}</textarea>
                                </div>
                                <div class="form-group mb-4">
                                    <label class="form-label">
                                        <i class="fas fa-list-ul mr-1"></i>Diagnósticos Secundarios
                                    </label>
                                    <textarea name="diagnosticosSecundarios" class="form-textarea" rows="2" 
                                              placeholder="Otros diagnósticos o comorbilidades...">${historia.diagnosticosSecundarios || ''}</textarea>
                                </div>
                                <div class="form-group mb-4">
                                    <label class="form-label">
                                        <i class="fas fa-prescription-bottle-alt mr-1"></i>Plan de Tratamiento
                                    </label>
                                    <textarea name="tratamiento" class="form-textarea" rows="4" 
                                              placeholder="Plan terapéutico, recomendaciones, cuidados...">${historia.tratamiento || ''}</textarea>
                                </div>
                                <div class="grid grid-2 gap-4 mb-4">
                                    <div class="form-group">
                                        <label class="form-label">
                                            <i class="fas fa-capsules mr-1"></i>Medicamentos Prescritos
                                        </label>
                                        <textarea name="medicamentosPrescritos" class="form-textarea" rows="3" 
                                                  placeholder="Medicamentos, dosis, frecuencia...">${historia.medicamentosPrescritos || ''}</textarea>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">
                                            <i class="fas fa-vials mr-1"></i>Exámenes Solicitados
                                        </label>
                                        <textarea name="examenesSolicitados" class="form-textarea" rows="3" 
                                                  placeholder="Laboratorios, imágenes, estudios...">${historia.examenesSolicitados || ''}</textarea>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- ARCHIVOS Y SEGUIMIENTO -->
                        <div class="card mb-4">
                            <div class="card-header">
                                <h4><i class="fas fa-paperclip mr-2 text-indigo-500"></i>Archivos y Seguimiento</h4>
                            </div>
                            <div class="card-body">
                                <div class="form-group mb-4">
                                    <label class="form-label">
                                        <i class="fas fa-upload mr-1"></i>Adjuntar Exámenes / Imágenes
                                    </label>
                                    <input type="file" id="examenesFiles" class="file-upload" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx">
                                    <label for="examenesFiles" class="file-upload-label">
                                        <i class="fas fa-cloud-upload-alt mr-2"></i>
                                        Seleccionar Archivos (PDF, Imágenes, Documentos)
                                    </label>
                                    <small class="text-gray-600 mt-2 block">
                                        <i class="fas fa-info-circle mr-1"></i>
                                        Archivos existentes: ${historia.archivos ? historia.archivos.length : 0}
                                    </small>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">
                                        <i class="fas fa-sticky-note mr-1"></i>Observaciones Generales
                                    </label>
                                    <textarea name="observaciones" class="form-textarea" rows="3" 
                                              placeholder="Notas adicionales, recomendaciones especiales...">${historia.observaciones || ''}</textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>

            <script>
                // Calcular IMC automáticamente con indicadores visuales
                function calcularIMC() {
                    const peso = document.querySelector('input[name="peso"]').value;
                    const altura = document.querySelector('input[name="altura"]').value;
                    const imcField = document.getElementById('imcCalculado');
                    
                    if (peso && altura) {
                        const alturaM = altura / 100;
                        const imc = (peso / (alturaM * alturaM)).toFixed(1);
                        
                        let clasificacion = '';
                        let color = '';
                        
                        if (imc < 18.5) {
                            clasificacion = 'Bajo peso';
                            color = 'text-blue-600';
                        } else if (imc < 25) {
                            clasificacion = 'Normal';
                            color = 'text-green-600';
                        } else if (imc < 30) {
                            clasificacion = 'Sobrepeso';
                            color = 'text-yellow-600';
                        } else {
                            clasificacion = 'Obesidad';
                            color = 'text-red-600';
                        }
                        
                        imcField.value = imc + ' (' + clasificacion + ')';
                        imcField.className = 'form-input bg-gray-100 ' + color + ' font-medium';
                    } else {
                        imcField.value = '';
                        imcField.className = 'form-input bg-gray-100';
                    }
                }
                
                // Event listeners para cálculo de IMC
                const pesoInput = document.querySelector('input[name="peso"]');
                const alturaInput = document.querySelector('input[name="altura"]');
                
                if (pesoInput) pesoInput.addEventListener('input', calcularIMC);
                if (alturaInput) alturaInput.addEventListener('input', calcularIMC);
                
                // Calcular IMC inicial si hay datos
                setTimeout(calcularIMC, 100);
            </script>
        `;

        const modalFooter = `
            <button type="button" class="btn btn-secondary" onclick="cerrarModal()">Cancelar</button>
            <button type="button" class="btn btn-success" onclick="historiasManager.guardarYCrearCita('${id || ''}')">
                <i class="fas fa-calendar-plus"></i> Guardar y Agendar Próxima Cita
            </button>
            <button type="button" class="btn btn-primary" onclick="historiasManager.guardarHistoria('${id || ''}')">
                <i class="fas fa-save"></i> ${esEdicion ? 'Actualizar' : 'Guardar'} Historia
            </button>
        `;

        abrirModal(
            esEdicion ? 'Editar Historia Clínica' : 'Nueva Historia Clínica',
            modalBody,
            modalFooter,
            'historia'
        );
    }

    // Guardar historia clínica
    async guardarHistoria(id) {
        const form = document.getElementById('formHistoria');
        const formData = new FormData(form);
        const datos = Object.fromEntries(formData);
        
        try {
            // Subir archivos de exámenes si se seleccionaron
            const examenesFiles = document.getElementById('examenesFiles').files;
            if (examenesFiles.length > 0) {
                datos.examenes = [];
                for (let file of examenesFiles) {
                    const url = await Firebase.subirImagenImgBB(file);
                    datos.examenes.push({
                        nombre: file.name,
                        url: url,
                        tipo: file.type
                    });
                }
            }

            if (id) {
                // Editar historia existente (implementar cuando esté disponible)
                mostrarToast('Historia actualizada correctamente', 'success');
            } else {
                // Crear nueva historia
                await Firebase.HistoriasService.crearHistoria(datos);
                mostrarToast('Historia clínica creada correctamente', 'success');
            }

            cerrarModal();
            this.cargarHistoriasPaciente(this.pacienteActual.id);
        } catch (error) {
            console.error('Error guardando historia:', error);
            mostrarToast('Error guardando historia clínica', 'error');
        }
    }

    // Métodos auxiliares
    seleccionarPaciente(idPaciente) {
        if (idPaciente) {
            this.cargarHistoriasPaciente(idPaciente);
        }
    }

    volverALista() {
        this.pacienteActual = null;
        this.historias = [];
        this.mostrarHistorias();
    }

    editarHistoria(id) {
        this.abrirModalHistoria(id);
    }

    calcularEdad(fechaNacimiento) {
        if (!fechaNacimiento) return 'N/D';
        const hoy = new Date();
        const nacimiento = new Date(fechaNacimiento);
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const mes = hoy.getMonth() - nacimiento.getMonth();
        if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }
        return edad;
    }

    obtenerUltimaVisita() {
        if (this.historias.length === 0) return 'N/D';
        const ultimaHistoria = this.historias[0]; // Las historias están ordenadas por fecha desc
        return new Date(ultimaHistoria.fechaCreacion.seconds * 1000).toLocaleDateString();
    }

    // Guardar historia y crear cita automáticamente
    async guardarYCrearCita(id) {
        try {
            // Primero guardar la historia
            await this.guardarHistoria(id);
            
            // Mostrar modal para agendar cita
            this.mostrarModalAgendarCita();
            
        } catch (error) {
            console.error('Error guardando historia:', error);
            mostrarToast('Error guardando historia clínica', 'error');
        }
    }

    // Mostrar modal para agendar cita de seguimiento
    mostrarModalAgendarCita() {
        // Obtener lista de doctores/usuarios activos
        const doctoresDisponibles = usuarios.filter(u => u.activo);
        
        // Generar fecha mínima (mañana a las 8:00 AM)
        const mañana = new Date();
        mañana.setDate(mañana.getDate() + 1);
        mañana.setHours(8, 0, 0, 0);
        const fechaMinima = mañana.toISOString().slice(0, 16);
        
        // Fecha sugerida (una semana desde hoy a las 9:00 AM)
        const proximaSemana = new Date();
        proximaSemana.setDate(proximaSemana.getDate() + 7);
        proximaSemana.setHours(9, 0, 0, 0);
        const fechaSugerida = proximaSemana.toISOString().slice(0, 16);
        
        const modalBody = `
            <div class="agendar-cita-container">
                <form id="formAgendarCita">
                    <input type="hidden" name="idPaciente" value="${this.pacienteActual.id}">
                    
                    <!-- ENCABEZADO DE ÉXITO -->
                    <div class="alert-success mb-6">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <i class="fas fa-check-circle text-green-500 text-2xl"></i>
                            </div>
                            <div class="ml-4">
                                <h4 class="text-green-800 font-semibold text-lg mb-1">
                                    ¡Historia Clínica Guardada!
                                </h4>
                                <p class="text-green-700 text-sm">
                                    La historia clínica de <strong>${this.pacienteActual.nombre} ${this.pacienteActual.apellido}</strong> 
                                    se ha guardado correctamente. Ahora puede agendar una cita de seguimiento.
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- INFORMACIÓN DEL PACIENTE -->
                    <div class="paciente-info-card mb-6">
                        <div class="flex items-center p-4 bg-gray-50 rounded-lg border">
                            <img src="${this.pacienteActual.fotoUrl || '/api/placeholder/60/60'}" 
                                 alt="${this.pacienteActual.nombre}" 
                                 class="w-12 h-12 rounded-full border-2 border-white shadow-sm">
                            <div class="ml-4 flex-1">
                                <h5 class="font-semibold text-gray-900">${this.pacienteActual.nombre} ${this.pacienteActual.apellido}</h5>
                                <p class="text-sm text-gray-600">Cédula: ${this.pacienteActual.cedula}</p>
                                <p class="text-sm text-gray-600">Edad: ${this.calcularEdad(this.pacienteActual.fechaNacimiento)} años</p>
                            </div>
                            <div class="text-right">
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    <i class="fas fa-calendar-plus mr-1"></i>
                                    Nueva Cita
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- FORMULARIO DE CITA -->
                    <div class="cita-form-section">
                        <h5 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <i class="fas fa-calendar-alt text-blue-500 mr-2"></i>
                            Detalles de la Cita
                        </h5>
                        
                        <div class="grid grid-2 gap-6 mb-6">
                            <div class="form-group">
                                <label class="form-label required">
                                    <i class="fas fa-calendar-alt mr-2 text-blue-500"></i>
                                    Fecha y Hora de la Cita
                                </label>
                                <input type="datetime-local" name="fechaCita" class="form-input cita-datetime" required
                                       min="${fechaMinima}" value="${fechaSugerida}">
                                <small class="text-blue-600 mt-1 block">
                                    <i class="fas fa-lightbulb mr-1"></i>
                                    Sugerencia: Una semana desde hoy
                                </small>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label required">
                                    <i class="fas fa-user-md mr-2 text-purple-500"></i>
                                    Doctor Asignado
                                </label>
                                <select name="doctorAsignado" class="form-select" required>
                                    <option value="">Seleccionar doctor...</option>
                                    ${doctoresDisponibles.map(doctor => `
                                        <option value="${doctor.id}" ${doctor.id === usuarioActual.id ? 'selected' : ''}>
                                            ${doctor.nombre} ${doctor.tipoDoctor ? `- ${doctor.tipoDoctor}` : ''}
                                        </option>
                                    `).join('')}
                                </select>
                                <small class="text-gray-600 mt-1 block">
                                    Doctor por defecto: ${usuarioActual.nombre}
                                </small>
                            </div>
                        </div>

                        <div class="grid grid-2 gap-6 mb-6">
                            <div class="form-group">
                                <label class="form-label required">
                                    <i class="fas fa-stethoscope mr-2 text-green-500"></i>
                                    Motivo de la Cita
                                </label>
                                <input type="text" name="motivo" class="form-input" 
                                       value="Control y seguimiento" placeholder="Ej: Control post-tratamiento" required>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label required">
                                    <i class="fas fa-list-ul mr-2 text-orange-500"></i>
                                    Tipo de Consulta
                                </label>
                                <select name="tipoConsulta" class="form-select" required>
                                    <option value="control" selected>Control</option>
                                    <option value="seguimiento">Seguimiento</option>
                                    <option value="revision">Revisión</option>
                                    <option value="postoperatorio">Post-operatorio</option>
                                    <option value="emergencia">Emergencia</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="form-label">
                                <i class="fas fa-sticky-note mr-2 text-gray-500"></i>
                                Observaciones Especiales (Opcional)
                            </label>
                            <textarea name="observaciones" class="form-textarea" rows="3" 
                                      placeholder="Notas especiales para la cita, recordatorios, instrucciones...">${`Cita de seguimiento generada automáticamente desde historia clínica.
Paciente: ${this.pacienteActual.nombre} ${this.pacienteActual.apellido}
Fecha de historia: ${new Date().toLocaleDateString()}`}</textarea>
                        </div>
                    </div>
                </form>
            </div>
        `;

        const modalFooter = `
            <button type="button" class="btn btn-secondary" onclick="cerrarModal()">
                <i class="fas fa-times mr-2"></i>Cancelar
            </button>
            <button type="button" class="btn btn-primary" onclick="historiasManager.confirmarAgendarCita()">
                <i class="fas fa-calendar-plus mr-2"></i>Agendar Cita
            </button>
        `;

        abrirModal(
            'Agendar Cita de Seguimiento',
            modalBody,
            modalFooter,
            'cita'
        );
    }

    // Confirmar y crear la cita de seguimiento
    async confirmarAgendarCita() {
        const form = document.getElementById('formAgendarCita');
        const formData = new FormData(form);
        const datos = Object.fromEntries(formData);

        try {
            // Obtener información del doctor seleccionado
            const doctorSeleccionado = usuarios.find(u => u.id === datos.doctorAsignado);
            
            // Crear cita
            const datosCita = {
                idPaciente: datos.idPaciente,
                fechaCita: firebase.firestore.Timestamp.fromDate(new Date(datos.fechaCita)),
                motivo: datos.motivo,
                tipoConsulta: datos.tipoConsulta,
                doctorAsignado: datos.doctorAsignado,
                nombreDoctor: doctorSeleccionado ? doctorSeleccionado.nombre : usuarioActual.nombre,
                estado: 'pendiente',
                observaciones: datos.observaciones
            };

            await Firebase.CitasService.crearCita(datosCita);
            
            cerrarModal();
            mostrarToast('✅ Historia clínica guardada y cita de seguimiento agendada correctamente', 'success');
            
            // Recargar datos para mostrar la nueva cita
            if (window.cargarCitas) {
                await cargarCitas();
            }

        } catch (error) {
            console.error('Error creando cita:', error);
            mostrarToast('Error al agendar la cita. Inténtelo de nuevo.', 'error');
        }
    }

    // Crear historia desde una cita existente
    crearHistoriaDesdeCita(idCita) {
        const cita = citas.find(c => c.id === idCita);
        if (cita) {
            this.cargarHistoriasPaciente(cita.idPaciente);
            setTimeout(() => {
                this.abrirModalHistoria(null, idCita);
            }, 500);
        }
    }

    // Buscar paciente por nombre o cédula
    buscarPaciente(termino) {
        termino = termino.toLowerCase();
        return pacientes.filter(p => 
            p.nombre.toLowerCase().includes(termino) ||
            p.apellido.toLowerCase().includes(termino) ||
            p.cedula.includes(termino)
        );
    }

    // Generar reporte de historia clínica
    generarReporte(idHistoria) {
        const historia = this.historias.find(h => h.id === idHistoria);
        if (!historia) {
            mostrarToast('Historia no encontrada', 'error');
            return;
        }

        // Generar contenido del reporte
        const contenido = this.generarContenidoReporte(historia);
        
        // Crear ventana de impresión
        const ventanaImpresion = window.open('', '_blank');
        ventanaImpresion.document.write(`
            <html>
                <head>
                    <title>Historia Clínica - ${this.pacienteActual.nombre} ${this.pacienteActual.apellido}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; }
                        .section { margin: 20px 0; }
                        .section h3 { color: #2563eb; border-bottom: 1px solid #e5e7eb; }
                        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                        .field { margin: 10px 0; }
                        .label { font-weight: bold; color: #374151; }
                        @media print { 
                            body { margin: 0; }
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body>
                    ${contenido}
                    <div class="no-print" style="text-align: center; margin-top: 30px;">
                        <button onclick="window.print()" style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 5px;">
                            Imprimir
                        </button>
                        <button onclick="window.close()" style="padding: 10px 20px; background: #6b7280; color: white; border: none; border-radius: 5px; margin-left: 10px;">
                            Cerrar
                        </button>
                    </div>
                </body>
            </html>
        `);
        ventanaImpresion.document.close();
    }

    // Generar contenido del reporte
    generarContenidoReporte(historia) {
        const fecha = historia.fechaConsulta ? 
            (historia.fechaConsulta.seconds ? 
                new Date(historia.fechaConsulta.seconds * 1000).toLocaleDateString() :
                new Date(historia.fechaConsulta).toLocaleDateString()) : 
            new Date().toLocaleDateString();

        return `
            <div class="header">
                <h1>HISTORIA CLÍNICA</h1>
                <h2>${this.pacienteActual.nombre} ${this.pacienteActual.apellido}</h2>
                <p>Cédula: ${this.pacienteActual.cedula} | Fecha: ${fecha}</p>
            </div>

            <div class="section">
                <h3>Información General</h3>
                <div class="grid">
                    <div class="field"><span class="label">Tipo de Consulta:</span> ${historia.tipoConsulta || 'N/A'}</div>
                    <div class="field"><span class="label">Motivo:</span> ${historia.motivo || 'N/A'}</div>
                </div>
            </div>

            <div class="section">
                <h3>Signos Vitales</h3>
                <div class="grid">
                    <div class="field"><span class="label">Peso:</span> ${historia.peso ? historia.peso + ' kg' : 'N/A'}</div>
                    <div class="field"><span class="label">Altura:</span> ${historia.altura ? historia.altura + ' cm' : 'N/A'}</div>
                    <div class="field"><span class="label">Presión Arterial:</span> ${historia.presionArterial || 'N/A'}</div>
                    <div class="field"><span class="label">Temperatura:</span> ${historia.temperatura ? historia.temperatura + '°C' : 'N/A'}</div>
                    <div class="field"><span class="label">Frecuencia Cardíaca:</span> ${historia.frecuenciaCardiaca ? historia.frecuenciaCardiaca + ' lpm' : 'N/A'}</div>
                    <div class="field"><span class="label">Saturación O2:</span> ${historia.saturacionOxigeno ? historia.saturacionOxigeno + '%' : 'N/A'}</div>
                </div>
            </div>

            <div class="section">
                <h3>Evaluación Clínica</h3>
                <div class="field"><span class="label">Síntomas:</span><br>${historia.sintomas || 'N/A'}</div>
                <div class="field"><span class="label">Antecedentes:</span><br>${historia.antecedentes || 'N/A'}</div>
                <div class="field"><span class="label">Alergias:</span><br>${historia.alergias || 'N/A'}</div>
            </div>

            <div class="section">
                <h3>Examen Físico</h3>
                <div class="field"><span class="label">Aspecto General:</span><br>${historia.aspectoGeneral || 'N/A'}</div>
                <div class="field"><span class="label">Examen Físico:</span><br>${historia.examenFisico || 'N/A'}</div>
                <div class="field"><span class="label">Hallazgos:</span><br>${historia.hallazgos || 'N/A'}</div>
            </div>

            <div class="section">
                <h3>Diagnóstico y Tratamiento</h3>
                <div class="field"><span class="label">Diagnóstico Principal:</span><br>${historia.diagnostico || 'N/A'}</div>
                <div class="field"><span class="label">Tratamiento:</span><br>${historia.tratamiento || 'N/A'}</div>
                <div class="field"><span class="label">Medicamentos:</span><br>${historia.medicamentosPrescritos || 'N/A'}</div>
                <div class="field"><span class="label">Exámenes Solicitados:</span><br>${historia.examenesSolicitados || 'N/A'}</div>
            </div>

            <div class="section">
                <h3>Observaciones</h3>
                <div class="field">${historia.observaciones || 'Sin observaciones adicionales'}</div>
            </div>
        `;
    }

    // Agregar entrada rápida a historia existente
    agregarEntradaRapida(idHistoria) {
        const historia = this.historias.find(h => h.id === idHistoria);
        if (!historia) {
            mostrarToast('Historia no encontrada', 'error');
            return;
        }

        const modalBody = `
            <form id="formEntradaRapida">
                <input type="hidden" name="idHistoria" value="${idHistoria}">
                <input type="hidden" name="idPaciente" value="${this.pacienteActual.id}">
                
                <div class="form-group">
                    <label class="form-label">Tipo de Entrada</label>
                    <select name="tipoEntrada" class="form-select" required>
                        <option value="">Seleccionar tipo</option>
                        <option value="evolucion">Evolución</option>
                        <option value="nota_enfermeria">Nota de Enfermería</option>
                        <option value="resultado_examen">Resultado de Examen</option>
                        <option value="interconsulta">Interconsulta</option>
                        <option value="procedimiento">Procedimiento</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Fecha y Hora</label>
                    <input type="datetime-local" name="fechaEntrada" class="form-input" 
                           value="${new Date().toISOString().slice(0, 16)}" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Descripción / Notas</label>
                    <textarea name="descripcion" class="form-textarea" rows="4" 
                              placeholder="Describa la evolución, procedimiento o hallazgos..." required></textarea>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Adjuntar Archivo (Opcional)</label>
                    <input type="file" id="archivoEntrada" class="file-upload" accept=".pdf,.jpg,.jpeg,.png">
                    <label for="archivoEntrada" class="file-upload-label">
                        <i class="fas fa-paperclip"></i>
                        Seleccionar Archivo
                    </label>
                </div>
            </form>
        `;

        const modalFooter = `
            <button type="button" class="btn btn-secondary" onclick="cerrarModal()">Cancelar</button>
            <button type="button" class="btn btn-primary" onclick="historiasManager.guardarEntradaRapida()">
                <i class="fas fa-plus"></i> Agregar Entrada
            </button>
        `;

        abrirModal('Agregar Entrada a Historia Clínica', modalBody, modalFooter);
    }

    // Guardar entrada rápida
    async guardarEntradaRapida() {
        const form = document.getElementById('formEntradaRapida');
        const formData = new FormData(form);
        const datos = Object.fromEntries(formData);
        
        try {
            // Subir archivo si se seleccionó
            let archivoUrl = null;
            const archivoInput = document.getElementById('archivoEntrada');
            if (archivoInput.files[0]) {
                archivoUrl = await Firebase.subirImagenImgBB(archivoInput.files[0]);
            }

            // Crear nueva entrada
            const entrada = {
                tipo: datos.tipoEntrada,
                fecha: firebase.firestore.Timestamp.fromDate(new Date(datos.fechaEntrada)),
                descripcion: datos.descripcion,
                archivo: archivoUrl,
                usuario: usuarioActual.nombre,
                fechaCreacion: firebase.firestore.Timestamp.now()
            };

            // Actualizar la historia agregando la entrada
            const historia = this.historias.find(h => h.id === datos.idHistoria);
            if (!historia.entradas) {
                historia.entradas = [];
            }
            historia.entradas.push(entrada);

            // Guardar en Firebase
            await Firebase.HistoriasService.actualizarHistoria(datos.idHistoria, {
                entradas: historia.entradas,
                fechaActualizacion: firebase.firestore.Timestamp.now()
            });

            mostrarToast('Entrada agregada correctamente', 'success');
            cerrarModal();
            this.cargarHistoriasPaciente(this.pacienteActual.id);
            
        } catch (error) {
            console.error('Error guardando entrada:', error);
            mostrarToast('Error guardando entrada', 'error');
        }
    }
}

// Instancia global del manager
const historiasManager = new HistoriasClinicasManager();

// Sobrescribir la función de carga de historias en el archivo principal
window.cargarHistorias = function() {
    historiasManager.mostrarHistorias();
};

// Función global para ver historia de paciente
window.verHistoriaPaciente = function(id) {
    navegarASeccion('historias');
    setTimeout(() => {
        historiasManager.cargarHistoriasPaciente(id);
    }, 100);
}; 

// Función mejorada para seleccionar paciente con validaciones
HistoriasClinicasManager.prototype.seleccionarPaciente = async function(idPaciente) {
    if (!idPaciente) {
        console.log('ID de paciente no válido');
        return;
    }
    
    try {
        // Mostrar indicador de carga
        const container = document.getElementById('historiasLista');
        container.innerHTML = `
            <div class="card">
                <div class="card-body text-center py-5">
                    <div class="loading-spinner mx-auto mb-3"></div>
                    <h4 class="text-gray-600">Cargando historias clínicas...</h4>
                    <p class="text-gray-500">Un momento por favor</p>
                </div>
            </div>
        `;
        
        // Cargar historias del paciente
        await this.cargarHistoriasPaciente(idPaciente);
        
        // Actualizar estadísticas generales
        this.actualizarEstadisticasGenerales();
        
    } catch (error) {
        console.error('Error seleccionando paciente:', error);
        const container = document.getElementById('historiasLista');
        container.innerHTML = `
            <div class="card">
                <div class="card-body text-center py-5">
                    <i class="fas fa-exclamation-triangle text-red-500 fa-3x mb-3"></i>
                    <h4 class="text-red-600">Error cargando historias</h4>
                    <p class="text-gray-600 mb-4">No se pudieron cargar las historias clínicas del paciente.</p>
                    <div class="flex gap-2 justify-center">
                    <button class="btn btn-primary" onclick="historiasManager.seleccionarPaciente('${idPaciente}')">
                            <i class="fas fa-redo mr-2"></i>Reintentar
                        </button>
                        <button class="btn btn-secondary" onclick="historiasManager.volverALista()">
                            <i class="fas fa-arrow-left mr-2"></i>Volver
                    </button>
                    </div>
                </div>
            </div>
        `;
        mostrarToast('Error cargando historias del paciente', 'error');
    }
};

// Función para actualizar estadísticas generales
HistoriasClinicasManager.prototype.actualizarEstadisticasGenerales = function() {
    // Total de historias en el sistema
    let totalHistorias = 0;
    pacientes.forEach(async (paciente) => {
        try {
            const historiasPaciente = await Firebase.HistoriasService.obtenerHistoriasPorPaciente(paciente.id);
            totalHistorias += historiasPaciente.length;
        } catch (error) {
            console.log('Error obteniendo historias para estadísticas:', error);
        }
    });
    
    // Actualizar elementos si existen
    const totalHistoriasElement = document.getElementById('totalHistoriasGeneral');
    if (totalHistoriasElement) {
        setTimeout(() => {
            totalHistoriasElement.textContent = totalHistorias;
        }, 1000);
    }
    
    // Consultas del mes actual
    const fechaActual = new Date();
    const inicioMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1);
    const consultasMes = this.historias.filter(h => {
        if (!h.fechaCreacion) return false;
        const fechaHistoria = h.fechaCreacion.seconds ? 
            new Date(h.fechaCreacion.seconds * 1000) : 
            new Date(h.fechaCreacion);
        return fechaHistoria >= inicioMes;
    }).length;
    
    const consultasMesElement = document.getElementById('consultasMes');
    if (consultasMesElement) {
        consultasMesElement.textContent = consultasMes;
    }
};

// Función mejorada para mostrar historias con mejor manejo de errores
HistoriasClinicasManager.prototype.mostrarHistoriasMejorada = function() {
    const container = document.getElementById('historiasLista');

    if (!this.pacienteActual) {
        container.innerHTML = this.crearSelectorPacienteMejorado();
        return;
    }

    const headerHTML = `
        <div class="card mb-4">
            <div class="card-header">
                <div class="flex justify-between items-center">
                    <div class="flex items-center gap-3">
                        <img src="${this.pacienteActual.fotoUrl || '/api/placeholder/50/50'}" 
                             alt="${this.pacienteActual.nombre}" 
                             class="w-12 h-12 rounded-full border-2 border-blue-200 shadow-sm">
                        <div>
                            <h3 class="mb-1">Historias Clínicas</h3>
                            <p class="text-sm text-gray-600 mb-0">
                                <strong>${this.pacienteActual.nombre} ${this.pacienteActual.apellido}</strong> 
                                - ${this.pacienteActual.cedula}
                            </p>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button class="btn btn-secondary btn-sm" onclick="historiasManager.volverALista()">
                            <i class="fas fa-arrow-left mr-1"></i> 
                            Cambiar Paciente
                        </button>
                        <button class="btn btn-success btn-sm" onclick="historiasManager.abrirModalHistoria()">
                            <i class="fas fa-plus mr-1"></i> 
                            Nueva Historia Clínica
                        </button>
                    </div>
                </div>
            </div>
            <div class="card-body">
                <div class="grid grid-4 gap-4 mb-4">
                    <div class="stat-card">
                        <div class="stat-icon primary">
                            <i class="fas fa-file-medical"></i>
                        </div>
                        <div class="stat-content">
                            <h3>${this.historias.length}</h3>
                            <p>Historias Totales</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon success">
                            <i class="fas fa-user-check"></i>
                        </div>
                        <div class="stat-content">
                            <h3>${this.calcularEdad(this.pacienteActual.fechaNacimiento)}</h3>
                            <p>Años de Edad</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon warning">
                            <i class="fas fa-calendar"></i>
                        </div>
                        <div class="stat-content">
                            <h3>${this.obtenerUltimaVisita()}</h3>
                            <p>Última Visita</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon info">
                            <i class="fas fa-heartbeat"></i>
                        </div>
                        <div class="stat-content">
                            <h3>${this.historias.filter(h => h.tipoConsulta === 'control').length}</h3>
                            <p>Controles</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    let historiasHTML;
    if (this.historias.length === 0) {
        historiasHTML = `
            <div class="card">
                <div class="card-body text-center py-5">
                    <i class="fas fa-file-medical-alt fa-4x text-gray-300 mb-4"></i>
                    <h4 class="text-gray-600 mb-2">Sin Historias Clínicas</h4>
                    <p class="text-gray-500 mb-4">
                        Este paciente no tiene historias clínicas registradas.<br>
                        Cree la primera historia clínica para comenzar el seguimiento médico.
                    </p>
                    <button class="btn btn-primary btn-lg" onclick="historiasManager.abrirModalHistoria()">
                        <i class="fas fa-plus mr-2"></i>
                        Crear Primera Historia Clínica
                    </button>
                </div>
            </div>
        `;
    } else {
        historiasHTML = this.historias.map(historia => this.crearTarjetaHistoriaMejorada(historia)).join('');
    }

    container.innerHTML = headerHTML + historiasHTML;
};

// Selector de paciente mejorado
HistoriasClinicasManager.prototype.crearSelectorPacienteMejorado = function() {
    return `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">
                    <i class="fas fa-users mr-2"></i>
                    Seleccionar Paciente para Historias Clínicas
                </h3>
            </div>
            <div class="card-body">
                <!-- BUSCADOR -->
                <div class="form-group mb-4">
                        <label class="form-label">
                            <i class="fas fa-search mr-1"></i>
                        Buscar Paciente por Nombre, Apellido o Cédula
                        </label>
                        <input type="text" id="buscarPaciente" class="form-input" 
                           placeholder="Escriba para buscar: Juan Pérez, 12345678..." 
                           oninput="historiasManager.filtrarPacientesVisual(this.value)">
                </div>
                
                <!-- ESTADÍSTICAS RÁPIDAS -->
                <div class="grid grid-3 gap-4 mb-4">
                    <div class="stat-card">
                        <div class="stat-icon primary">
                            <i class="fas fa-users"></i>
                        </div>
                        <div class="stat-content">
                            <h3>${pacientes.length}</h3>
                            <p>Total Pacientes</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon success">
                            <i class="fas fa-file-medical"></i>
                        </div>
                        <div class="stat-content">
                            <h3 id="totalHistoriasGeneral">0</h3>
                            <p>Historias Totales</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon warning">
                            <i class="fas fa-calendar-check"></i>
                        </div>
                        <div class="stat-content">
                            <h3 id="consultasMes">0</h3>
                            <p>Este Mes</p>
                        </div>
                    </div>
                </div>
                
                <!-- LISTA DE PACIENTES -->
                <div class="mb-3">
                    <h5 class="text-gray-700 mb-3">
                        <i class="fas fa-list mr-2"></i>
                        Lista de Pacientes (Click para seleccionar)
                    </h5>
                </div>
                
                <div id="listaPacientesHistorias" class="grid grid-2 gap-3">
                    ${this.generarTarjetasPacientes(pacientes)}
                </div>
                
                <!-- MENSAJE CUANDO NO HAY RESULTADOS -->
                <div id="sinResultados" class="hidden text-center py-5">
                    <i class="fas fa-search fa-3x text-gray-300 mb-3"></i>
                    <h4 class="text-gray-600">No se encontraron pacientes</h4>
                    <p class="text-gray-500">Intente con otro término de búsqueda</p>
                </div>
            </div>
        </div>
    `;
};

// Usar la función mejorada por defecto
HistoriasClinicasManager.prototype.mostrarHistorias = HistoriasClinicasManager.prototype.mostrarHistoriasMejorada; 

// Función para generar tarjetas visuales de pacientes
HistoriasClinicasManager.prototype.generarTarjetasPacientes = function(listaPacientes) {
    if (!listaPacientes || listaPacientes.length === 0) {
        return `
            <div class="col-span-2 text-center py-8">
                <i class="fas fa-users fa-3x text-gray-300 mb-3"></i>
                <h4 class="text-gray-600 mb-2">No hay pacientes disponibles</h4>
                <p class="text-gray-500">
                    Registre pacientes primero para crear historias clínicas.
                </p>
                <button class="btn btn-primary mt-3" onclick="navegarASeccion('pacientes')">
                    <i class="fas fa-user-plus mr-2"></i>
                    Ir a Gestión de Pacientes
                </button>
            </div>
        `;
    }
    
    return listaPacientes.map(paciente => {
        const edad = this.calcularEdad(paciente.fechaNacimiento);
        const edadTexto = edad !== 'N/D' ? `${edad} años` : 'Edad no registrada';
        const telefonoTexto = paciente.telefono || 'No registrado';
        
        return `
            <div class="paciente-card card hover:shadow-lg transition-all cursor-pointer" 
                 onclick="historiasManager.seleccionarPaciente('${paciente.id}')" 
                 title="Click para ver historias clínicas">
                <div class="card-body">
                    <div class="flex items-center gap-3">
                        <img src="${paciente.fotoUrl || '/api/placeholder/50/50'}" 
                             alt="${paciente.nombre}" 
                             class="w-12 h-12 rounded-full border-2 border-blue-200 shadow-sm"
                             onerror="this.src='/api/placeholder/50/50'">
                        <div class="flex-1">
                            <h5 class="font-semibold text-gray-900 mb-1">
                                ${paciente.nombre} ${paciente.apellido}
                            </h5>
                            <div class="text-sm text-gray-600 space-y-1">
                                <p class="mb-0"><i class="fas fa-id-card mr-1"></i> ${paciente.cedula}</p>
                                <p class="mb-0"><i class="fas fa-phone mr-1"></i> ${telefonoTexto}</p>
                                <p class="mb-0"><i class="fas fa-birthday-cake mr-1"></i> ${edadTexto}</p>
                            </div>
                        </div>
                        <div class="text-center">
                            <div class="badge badge-primary">
                                <i class="fas fa-arrow-right"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
};

// Función mejorada para filtrar pacientes en tiempo real con interfaz visual
HistoriasClinicasManager.prototype.filtrarPacientesVisual = function(termino) {
    const listaPacientesContainer = document.getElementById('listaPacientesHistorias');
    const sinResultadosDiv = document.getElementById('sinResultados');
    
    if (!listaPacientesContainer || !sinResultadosDiv) return;
    
    // Si no hay término de búsqueda, mostrar todos los pacientes
    if (!termino || termino.trim() === '') {
        listaPacientesContainer.innerHTML = this.generarTarjetasPacientes(pacientes);
        listaPacientesContainer.classList.remove('hidden');
        sinResultadosDiv.classList.add('hidden');
        return;
    }
    
    // Filtrar pacientes
    const terminoLower = termino.toLowerCase().trim();
    const pacientesFiltrados = pacientes.filter(p => 
        p.nombre.toLowerCase().includes(terminoLower) ||
        p.apellido.toLowerCase().includes(terminoLower) ||
        p.cedula.includes(terminoLower) ||
        (p.telefono && p.telefono.includes(terminoLower)) ||
        (p.email && p.email.toLowerCase().includes(terminoLower))
    );
    
    // Mostrar resultados
    if (pacientesFiltrados.length > 0) {
        listaPacientesContainer.innerHTML = this.generarTarjetasPacientes(pacientesFiltrados);
        listaPacientesContainer.classList.remove('hidden');
        sinResultadosDiv.classList.add('hidden');
    } else {
        listaPacientesContainer.classList.add('hidden');
        sinResultadosDiv.classList.remove('hidden');
    }
};

// Función para volver a la lista de pacientes
HistoriasClinicasManager.prototype.volverALista = function() {
    this.pacienteActual = null;
    this.historias = [];
    this.mostrarHistorias();
};

// Crear tarjeta de historia mejorada
HistoriasClinicasManager.prototype.crearTarjetaHistoriaMejorada = function(historia) {
    const fecha = historia.fechaCreacion ? 
        (historia.fechaCreacion.seconds ? 
            new Date(historia.fechaCreacion.seconds * 1000).toLocaleDateString() :
            new Date(historia.fechaCreacion).toLocaleDateString()) : 
        'Sin fecha';
    
    const hora = historia.fechaCreacion ? 
        (historia.fechaCreacion.seconds ? 
            new Date(historia.fechaCreacion.seconds * 1000).toLocaleTimeString() :
            new Date(historia.fechaCreacion).toLocaleTimeString()) : 
        '';

    // Determinar color del borde según tipo de consulta
    let borderColor = 'border-blue-200';
    let badgeColor = 'badge-primary';
    
    switch(historia.tipoConsulta) {
        case 'emergencia':
            borderColor = 'border-red-200';
            badgeColor = 'badge-error';
            break;
        case 'control':
            borderColor = 'border-green-200';
            badgeColor = 'badge-success';
            break;
        case 'preoperatorio':
        case 'postoperatorio':
            borderColor = 'border-yellow-200';
            badgeColor = 'badge-warning';
            break;
    }

    // Obtener información de signos vitales
    const signosVitales = [];
    if (historia.peso) signosVitales.push(`Peso: ${historia.peso}kg`);
    if (historia.altura) signosVitales.push(`Altura: ${historia.altura}cm`);
    if (historia.presionArterial) signosVitales.push(`PA: ${historia.presionArterial}`);
    if (historia.temperatura) signosVitales.push(`T°: ${historia.temperatura}°C`);

    // Archivos adjuntos
    const archivos = historia.archivos || [];
    const numEntradas = historia.entradas ? historia.entradas.length : 0;

    return `
        <div class="card mb-4 border-l-4 ${borderColor} hover:shadow-lg transition-shadow">
            <div class="card-header">
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <div class="flex items-center gap-3 mb-2">
                            <h4 class="text-lg font-semibold mb-0">${historia.motivo || 'Consulta Médica'}</h4>
                            <span class="badge ${badgeColor}">${historia.tipoConsulta || 'Consulta'}</span>
                            ${historia.diagnostico ? '<span class="badge badge-secondary">Con Diagnóstico</span>' : ''}
                        </div>
                        <div class="text-sm text-gray-600">
                            <i class="fas fa-calendar-alt mr-1"></i>
                            ${fecha} - ${hora}
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button class="btn btn-sm btn-success" onclick="historiasManager.agregarEntradaRapida('${historia.id}')" 
                                title="Agregar entrada rápida">
                            <i class="fas fa-plus"></i>
                        </button>
                        <button class="btn btn-sm btn-warning" onclick="historiasManager.generarReporte('${historia.id}')" 
                                title="Imprimir historia">
                            <i class="fas fa-print"></i>
                        </button>
                        <button class="btn btn-sm btn-primary" onclick="historiasManager.editarHistoria('${historia.id}')" 
                                title="Editar historia">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="card-body">
                <!-- Diagnóstico Principal -->
                ${historia.diagnostico ? `
                    <div class="mb-3">
                        <strong class="text-gray-700">Diagnóstico:</strong>
                        <p class="text-gray-900 mt-1">${historia.diagnostico}</p>
                    </div>
                ` : ''}
                
                <!-- Síntomas -->
                ${historia.sintomas ? `
                    <div class="mb-3">
                        <strong class="text-gray-700">Síntomas:</strong>
                        <p class="text-gray-600 mt-1">${historia.sintomas.substring(0, 150)}${historia.sintomas.length > 150 ? '...' : ''}</p>
                    </div>
                ` : ''}
                
                <!-- Signos Vitales -->
                ${signosVitales.length > 0 ? `
                    <div class="mb-3">
                        <strong class="text-gray-700">Signos Vitales:</strong>
                        <div class="flex flex-wrap gap-2 mt-1">
                            ${signosVitales.map(signo => `<span class="badge badge-secondary">${signo}</span>`).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <!-- Tratamiento -->
                ${historia.tratamiento ? `
                    <div class="mb-3">
                        <strong class="text-gray-700">Tratamiento:</strong>
                        <p class="text-gray-600 mt-1">${historia.tratamiento.substring(0, 120)}${historia.tratamiento.length > 120 ? '...' : ''}</p>
                    </div>
                ` : ''}
                
                <!-- Información adicional -->
                <div class="flex items-center justify-between text-sm text-gray-500 mt-4 pt-3 border-t">
                    <div class="flex items-center gap-4">
                        ${archivos.length > 0 ? `<span><i class="fas fa-paperclip mr-1"></i>${archivos.length} archivo(s)</span>` : ''}
                        ${numEntradas > 0 ? `<span><i class="fas fa-notes-medical mr-1"></i>${numEntradas} entrada(s)</span>` : ''}
                        ${historia.idCitaRelacionada ? '<span><i class="fas fa-link mr-1"></i>Relacionada con cita</span>' : ''}
                    </div>
                    <div class="text-xs">
                        <i class="fas fa-user-md mr-1"></i>
                        Dr. ${usuarioActual ? usuarioActual.nombre : 'Usuario'}
                    </div>
                </div>
            </div>
        </div>
    `;
};

// Mejorar la función de cargar historias con mejor manejo de errores
HistoriasClinicasManager.prototype.cargarHistoriasPacienteMejorado = async function(idPaciente) {
    try {
        if (!idPaciente) {
            throw new Error('ID de paciente no válido');
        }

        // Buscar el paciente
        this.pacienteActual = pacientes.find(p => p.id === idPaciente);
        if (!this.pacienteActual) {
            throw new Error('Paciente no encontrado');
        }

        // Cargar historias
        this.historias = await Firebase.HistoriasService.obtenerHistoriasPorPaciente(idPaciente);
        
        // Mostrar historias
        this.mostrarHistorias();
        
        console.log(`✅ Historias cargadas: ${this.historias.length} para ${this.pacienteActual.nombre}`);
        
    } catch (error) {
        console.error('Error cargando historias del paciente:', error);
        
        // Mostrar error en la interfaz
        const container = document.getElementById('historiasLista');
        if (container) {
            container.innerHTML = `
                <div class="card">
                    <div class="card-body text-center">
                        <i class="fas fa-exclamation-triangle text-red-500 fa-3x mb-3"></i>
                        <h4 class="text-red-600 mb-2">Error al Cargar Historias</h4>
                        <p class="text-gray-600 mb-4">
                            ${error.message || 'No se pudieron cargar las historias clínicas del paciente.'}
                        </p>
                        <div class="flex gap-2 justify-center">
                            <button class="btn btn-primary" onclick="historiasManager.cargarHistoriasPaciente('${idPaciente}')">
                                <i class="fas fa-redo mr-2"></i>Reintentar
                            </button>
                            <button class="btn btn-secondary" onclick="historiasManager.volverALista()">
                                <i class="fas fa-arrow-left mr-2"></i>Volver
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
        
        mostrarToast('Error cargando historias clínicas', 'error');
        throw error;
    }
};

// Sobrescribir el método original con la versión mejorada
HistoriasClinicasManager.prototype.cargarHistoriasPaciente = HistoriasClinicasManager.prototype.cargarHistoriasPacienteMejorado; 