// ===================== VARIABLES GLOBALES =====================

let usuarioActual = null;
let pacientes = [];
let usuarios = [];
let citas = [];
let cirugias = [];
let historias = [];
let tratamientos = [];

// ===================== INICIALIZACIÓN =====================

document.addEventListener('DOMContentLoaded', function() {
    // Esperar a que Firebase esté disponible
    setTimeout(() => {
        if (window.Firebase && typeof firebase !== 'undefined') {
            if (Firebase.inicializarFirebase()) {
                inicializarApp();
            } else {
                console.error('Error inicializando Firebase');
            }
        } else {
            console.error('Firebase no está disponible');
        }
    }, 1000);
});

function inicializarApp() {
    // Verificar si hay una sesión guardada en localStorage
    const sesionGuardada = localStorage.getItem('usuarioActual');
    if (sesionGuardada) {
        try {
            usuarioActual = JSON.parse(sesionGuardada);
            mostrarDashboard();
        } catch (error) {
            console.error('Error cargando sesión:', error);
            localStorage.removeItem('usuarioActual');
            mostrarPantallaLogin();
        }
    } else {
        mostrarPantallaLogin();
    }

    // Configurar event listeners
    configurarEventListeners();
}

// ===================== GESTIÓN DE AUTENTICACIÓN =====================

function configurarEventListeners() {
    // Login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', manejarLogin);
    }

    // Registro
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', manejarRegistro);
    }

    // Botones de cambio entre login y registro
    const showRegisterBtn = document.getElementById('showRegisterBtn');
    const showLoginBtn = document.getElementById('showLoginBtn');
    if (showRegisterBtn) {
        showRegisterBtn.addEventListener('click', mostrarFormularioRegistro);
    }
    if (showLoginBtn) {
        showLoginBtn.addEventListener('click', mostrarFormularioLogin);
    }

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', manejarLogout);
    }

    // Navegación del sidebar
    const navLinks = document.querySelectorAll('.sidebar-nav-link[data-section]');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = e.target.closest('[data-section]').dataset.section;
            navegarASeccion(section);
        });
    });

    // Botones principales
    configurarBotonesPrincipales();

    // Modal
    const modalClose = document.getElementById('modalClose');
    const modalOverlay = document.getElementById('modalOverlay');
    if (modalClose) {
        modalClose.addEventListener('click', cerrarModal);
    }
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                cerrarModal();
            }
        });
    }
}

function configurarBotonesPrincipales() {
    // Botones de cada sección
    const botones = [
        { id: 'nuevoPacienteBtn', action: () => abrirModalPaciente() },
        { id: 'nuevoUsuarioBtn', action: () => abrirModalUsuario() },
        { id: 'nuevaCitaBtn', action: () => abrirModalCita() },
        { id: 'nuevaCirugiaBtn', action: () => window.cirugiasManager ? window.cirugiasManager.abrirModalCirugia() : abrirModalCirugia() }
    ];

    botones.forEach(({ id, action }) => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', action);
        }
    });
}

async function manejarLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const loginBtn = document.querySelector('#loginForm button[type="submit"]');
    const loginBtnText = document.getElementById('loginBtnText');
    const loginSpinner = document.getElementById('loginSpinner');
    const loginError = document.getElementById('loginError');

    // Mostrar loading
    loginBtn.disabled = true;
    loginBtnText.classList.add('hidden');
    loginSpinner.classList.remove('hidden');
    loginError.classList.add('hidden');

    try {
        // Verificar credenciales en Firestore
        const usuario = await Firebase.UsuariosService.verificarLogin(email, password);
        
        // Guardar sesión
        usuarioActual = usuario;
        localStorage.setItem('usuarioActual', JSON.stringify(usuario));
        
        // Mostrar dashboard
        mostrarDashboard();
    } catch (error) {
        console.error('Error en login:', error);
        mostrarError(loginError, 'Credenciales incorrectas o usuario inactivo.');
    } finally {
        // Restaurar botón
        loginBtn.disabled = false;
        loginBtnText.classList.remove('hidden');
        loginSpinner.classList.add('hidden');
    }
}



async function manejarLogout() {
    try {
        // Limpiar sesión local
        usuarioActual = null;
        localStorage.removeItem('usuarioActual');
        mostrarPantallaLogin();
    } catch (error) {
        console.error('Error en logout:', error);
    }
}

async function manejarRegistro(e) {
    e.preventDefault();
    
    const nombre = document.getElementById('regNombre').value;
    const email = document.getElementById('regEmail').value;
    const tipoDoctor = document.getElementById('regTipoDoctor').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    const registerBtn = document.querySelector('#registerForm button[type="submit"]');
    const registerBtnText = document.getElementById('registerBtnText');
    const registerSpinner = document.getElementById('registerSpinner');
    const loginError = document.getElementById('loginError');
    const registerSuccess = document.getElementById('registerSuccess');

    // Ocultar mensajes previos
    loginError.classList.add('hidden');
    registerSuccess.classList.add('hidden');

    // Validar campos requeridos
    if (!tipoDoctor) {
        mostrarError(loginError, 'Debe seleccionar un tipo de especialidad');
        return;
    }

    // Validar contraseñas
    if (password !== confirmPassword) {
        mostrarError(loginError, 'Las contraseñas no coinciden');
        return;
    }

    if (password.length < 6) {
        mostrarError(loginError, 'La contraseña debe tener al menos 6 caracteres');
        return;
    }

    // Mostrar loading
    registerBtn.disabled = true;
    registerBtnText.classList.add('hidden');
    registerSpinner.classList.remove('hidden');

    try {
        // Subir foto si se seleccionó
        let fotoUrl = null;
        const fotoInput = document.getElementById('regFoto');
        if (fotoInput.files[0]) {
            fotoUrl = await Firebase.subirImagenImgBB(fotoInput.files[0]);
        }

        // Crear registro en la colección usuarios (INACTIVO por defecto)
        const datosUsuario = {
            nombre: nombre,
            email: email,
            tipoDoctor: tipoDoctor,
            password: password, // Guardar contraseña (en producción deberías hashearla)
            fotoUrl: fotoUrl,
            activo: false, // ¡IMPORTANTE! Los usuarios nuevos empiezan inactivos
            rol: 'administrador'
        };
        
        await Firebase.UsuariosService.crearUsuario(datosUsuario);

        // Mostrar mensaje de éxito personalizado
        registerSuccess.innerHTML = `
            <i class="fas fa-check-circle mr-2"></i>
            ¡Registro exitoso! Tu cuenta como <strong>${tipoDoctor}</strong> será activada por un administrador.
        `;
        registerSuccess.classList.remove('hidden');
        
        // Limpiar formulario
        document.getElementById('registerForm').reset();
        
        // Volver al login después de 4 segundos
        setTimeout(() => {
            mostrarFormularioLogin();
            registerSuccess.classList.add('hidden');
        }, 4000);

    } catch (error) {
        console.error('Error en registro:', error);
        let mensajeError = 'Error en el registro: ';
        
        if (error.message.includes('email')) {
            mensajeError += 'Este correo ya está registrado.';
        } else {
            mensajeError += error.message || 'Inténtalo de nuevo.';
        }
        
        mostrarError(loginError, mensajeError);
    } finally {
        // Restaurar botón
        registerBtn.disabled = false;
        registerBtnText.classList.remove('hidden');
        registerSpinner.classList.add('hidden');
    }
}

function mostrarFormularioRegistro() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.remove('hidden');
    document.getElementById('showRegisterBtn').classList.add('hidden');
    document.getElementById('showLoginBtn').classList.remove('hidden');
    
    // Cambiar título
    document.querySelector('.login-title').textContent = 'Registro de Usuario';
    document.querySelector('.login-subtitle').textContent = 'Crear nueva cuenta de administrador';
    
    // Limpiar errores
    document.getElementById('loginError').classList.add('hidden');
    document.getElementById('registerSuccess').classList.add('hidden');
}

function mostrarFormularioLogin() {
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('showRegisterBtn').classList.remove('hidden');
    document.getElementById('showLoginBtn').classList.add('hidden');
    
    // Restaurar título
    document.querySelector('.login-title').textContent = 'Plataforma Médica';
    document.querySelector('.login-subtitle').textContent = 'Sistema de Gestión de Pacientes y Cirugías';
    
    // Limpiar errores
    document.getElementById('loginError').classList.add('hidden');
    document.getElementById('registerSuccess').classList.add('hidden');
}

// ===================== NAVEGACIÓN Y UI =====================

function mostrarPantallaLogin() {
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('dashboardScreen').classList.add('hidden');
}

function mostrarDashboard() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('dashboardScreen').classList.remove('hidden');
    
    // Mostrar información del usuario actual
    document.getElementById('currentUser').textContent = usuarioActual.nombre;
    
    // Inicializar managers si no existen
    if (!window.historiasManager) {
        window.historiasManager = new HistoriasClinicasManager();
    }
    if (!window.tratamientosManager) {
        window.tratamientosManager = new TratamientosManager();
    }
    if (!window.cirugiasManager) {
        window.cirugiasManager = new CirugiasManager();
    }
    
    // Cargar datos iniciales
    cargarDatosDashboard();
    navegarASeccion('dashboard');
}

function navegarASeccion(seccion) {
    // Ocultar todas las secciones
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.add('hidden');
    });

    // Remover clase active de todos los enlaces
    document.querySelectorAll('.sidebar-nav-link').forEach(link => {
        link.classList.remove('active');
    });

    // Mostrar la sección seleccionada
    const seccionElement = document.getElementById(seccion + 'Section');
    if (seccionElement) {
        seccionElement.classList.remove('hidden');
    }

    // Activar el enlace correspondiente
    const enlaceActivo = document.querySelector(`[data-section="${seccion}"]`);
    if (enlaceActivo) {
        enlaceActivo.classList.add('active');
    }

    // Cargar datos específicos de la sección
    cargarDatosSeccion(seccion);
}

async function cargarDatosSeccion(seccion) {
    switch (seccion) {
        case 'dashboard':
            await cargarDatosDashboard();
            break;
        case 'pacientes':
            await cargarPacientes();
            break;
        case 'usuarios':
            await cargarUsuarios();
            break;
        case 'citas':
            await cargarCitas();
            break;
        case 'cirugias':
            await cargarCirugias();
            break;
        case 'historias':
            await cargarHistorias();
            break;
        case 'tratamientos':
            await cargarTratamientos();
            break;
    }
}

// ===================== DASHBOARD =====================

async function cargarDatosDashboard() {
    try {
        // Cargar estadísticas
        pacientes = await Firebase.PacientesService.obtenerPacientes();
        citas = await Firebase.CitasService.obtenerCitas();
        cirugias = await Firebase.CirugiasService.obtenerCirugias ? 
            await Firebase.CirugiasService.obtenerCirugias() : [];

        // Actualizar estadísticas
        document.getElementById('totalPacientes').textContent = pacientes.length;
        document.getElementById('totalCirugias').textContent = cirugias.length;
        
        // Citas de hoy
        const hoy = new Date().toDateString();
        const citasHoy = citas.filter(cita => {
            const fechaCita = cita.fechaCita ? 
                (cita.fechaCita.seconds ? 
                    new Date(cita.fechaCita.seconds * 1000).toDateString() :
                    new Date(cita.fechaCita).toDateString()) : 
                '';
            return fechaCita === hoy;
        });
        document.getElementById('citasHoy').textContent = citasHoy.length;

        // Citas pendientes
        const citasPendientes = citas.filter(cita => cita.estado === 'pendiente');
        document.getElementById('citasPendientes').textContent = citasPendientes.length;

        // Mostrar citas recientes
        mostrarCitasRecientes();
        mostrarCirugiasPorTipo();

    } catch (error) {
        console.error('Error cargando dashboard:', error);
    }
}

function mostrarCitasRecientes() {
    const container = document.getElementById('citasRecientes');
    const citasRecientes = citas.slice(0, 5);

    if (citasRecientes.length === 0) {
        container.innerHTML = '<p class="text-center">No hay citas registradas</p>';
        return;
    }

    const html = citasRecientes.map(cita => {
        const paciente = pacientes.find(p => p.id === cita.idPaciente);
        const fechaCita = cita.fechaCita ? 
            (cita.fechaCita.seconds ? 
                new Date(cita.fechaCita.seconds * 1000) :
                new Date(cita.fechaCita)) : 
            new Date();
        const fecha = fechaCita.toLocaleDateString();
        const hora = fechaCita.toLocaleTimeString();
        
        return `
            <div class="flex items-center justify-between mb-3 p-3 bg-gray-50 rounded">
                <div>
                    <strong>${paciente ? paciente.nombre : 'Paciente no encontrado'}</strong>
                    <p class="text-sm text-gray-600">${cita.motivo}</p>
                </div>
                <div class="text-right">
                    <p class="text-sm">${fecha}</p>
                    <p class="text-sm text-gray-600">${hora}</p>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = html;
}

function mostrarCirugiasPorTipo() {
    const container = document.getElementById('cirugiasPorTipo');
    
    if (cirugias.length === 0) {
        container.innerHTML = '<p class="text-center">No hay cirugías registradas</p>';
        return;
    }

    const cirugiasCount = {};
    cirugias.forEach(cirugia => {
        cirugiasCount[cirugia.tipo] = (cirugiasCount[cirugia.tipo] || 0) + 1;
    });

    const html = Object.entries(cirugiasCount).map(([tipo, count]) => `
        <div class="flex justify-between items-center mb-2">
            <span>${tipo}</span>
            <span class="badge badge-primary">${count}</span>
        </div>
    `).join('');

    container.innerHTML = html;
}

// ===================== GESTIÓN DE PACIENTES =====================

async function cargarPacientes() {
    try {
        pacientes = await Firebase.PacientesService.obtenerPacientes();
        window.pacientes = pacientes; // Asignar a window.pacientes para que esté disponible globalmente
        mostrarTablaPacientes();
    } catch (error) {
        console.error('Error cargando pacientes:', error);
        mostrarToast('Error cargando pacientes', 'error');
    }
}

function mostrarTablaPacientes() {
    const tbody = document.getElementById('tablaPacientes');
    
    if (pacientes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No hay pacientes registrados</td></tr>';
        return;
    }

    const html = pacientes.map(paciente => {
        const fecha = paciente.fechaRegistro ? 
            (paciente.fechaRegistro.seconds ? 
                new Date(paciente.fechaRegistro.seconds * 1000).toLocaleDateString() :
                new Date(paciente.fechaRegistro).toLocaleDateString()) : 
            'No disponible';
        
        return `
            <tr>
                <td>
                    <img src="${paciente.fotoUrl || '/api/placeholder/40/40'}" 
                         alt="${paciente.nombre}" 
                         class="usuario-avatar">
                </td>
                <td>${paciente.nombre} ${paciente.apellido}</td>
                <td>${paciente.cedula}</td>
                <td>${paciente.telefono}</td>
                <td>${paciente.email}</td>
                <td>${fecha}</td>
                <td>
                    <button class="btn btn-sm btn-secondary" onclick="editarPaciente('${paciente.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-success" onclick="verHistoriaPaciente('${paciente.id}')">
                        <i class="fas fa-file-medical"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    tbody.innerHTML = html;
}

function abrirModalPaciente(id = null) {
    const esEdicion = id !== null;
    const paciente = esEdicion ? pacientes.find(p => p.id === id) : {};

    const modalBody = `
        <form id="formPaciente">
            <div class="grid grid-2 gap-4">
                <div class="form-group">
                    <label class="form-label">Nombre</label>
                    <input type="text" name="nombre" class="form-input" 
                           value="${paciente.nombre || ''}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Apellido</label>
                    <input type="text" name="apellido" class="form-input" 
                           value="${paciente.apellido || ''}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Cédula</label>
                    <input type="text" name="cedula" class="form-input" 
                           value="${paciente.cedula || ''}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Teléfono</label>
                    <input type="tel" name="telefono" class="form-input" 
                           value="${paciente.telefono || ''}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Email</label>
                    <input type="email" name="email" class="form-input" 
                           value="${paciente.email || ''}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Fecha de Nacimiento</label>
                    <input type="date" name="fechaNacimiento" class="form-input" 
                           value="${paciente.fechaNacimiento || ''}">
                </div>
                <div class="form-group">
                    <label class="form-label">Dirección</label>
                    <textarea name="direccion" class="form-textarea">${paciente.direccion || ''}</textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">Foto del Paciente</label>
                    <input type="file" id="fotoPaciente" class="file-upload" accept="image/*">
                    <label for="fotoPaciente" class="file-upload-label">
                        <i class="fas fa-camera"></i>
                        Seleccionar Foto
                    </label>
                    ${paciente.fotoUrl ? `<img src="${paciente.fotoUrl}" class="imagen-preview mt-2">` : ''}
                </div>
            </div>
        </form>
    `;

    const modalFooter = `
        <button type="button" class="btn btn-secondary" onclick="cerrarModal()">Cancelar</button>
        <button type="button" class="btn btn-primary" onclick="guardarPaciente('${id || ''}')">
            ${esEdicion ? 'Actualizar' : 'Guardar'} Paciente
        </button>
    `;

    abrirModal(
        esEdicion ? 'Editar Paciente' : 'Nuevo Paciente',
        modalBody,
        modalFooter
    );
}

async function guardarPaciente(id) {
    const form = document.getElementById('formPaciente');
    const formData = new FormData(form);
    const datos = Object.fromEntries(formData);
    
    try {
        // Subir foto si se seleccionó
        const fotoInput = document.getElementById('fotoPaciente');
        if (fotoInput.files[0]) {
            const fotoUrl = await Firebase.subirImagenImgBB(fotoInput.files[0]);
            datos.fotoUrl = fotoUrl;
        }

        if (id) {
            // Editar paciente existente
            await Firebase.PacientesService.actualizarPaciente(id, datos);
            mostrarToast('Paciente actualizado correctamente', 'success');
        } else {
            // Crear nuevo paciente
            await Firebase.PacientesService.crearPaciente(datos);
            mostrarToast('Paciente creado correctamente', 'success');
        }

        cerrarModal();
        cargarPacientes();
    } catch (error) {
        console.error('Error guardando paciente:', error);
        mostrarToast('Error guardando paciente', 'error');
    }
}

// ===================== GESTIÓN DE USUARIOS =====================

async function cargarUsuarios() {
    try {
        usuarios = await Firebase.UsuariosService.obtenerUsuarios();
        mostrarTablaUsuarios();
    } catch (error) {
        console.error('Error cargando usuarios:', error);
        mostrarToast('Error cargando usuarios', 'error');
    }
}

function mostrarTablaUsuarios() {
    const tbody = document.getElementById('tablaUsuarios');
    
    if (usuarios.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No hay usuarios registrados</td></tr>';
        return;
    }

    const html = usuarios.map(usuario => {
        const fecha = usuario.fechaCreacion ? 
            (usuario.fechaCreacion.seconds ? 
                new Date(usuario.fechaCreacion.seconds * 1000).toLocaleDateString() :
                new Date(usuario.fechaCreacion).toLocaleDateString()) : 
            'No disponible';
        
        return `
            <tr>
                <td>
                    <img src="${usuario.fotoUrl || '/api/placeholder/40/40'}" 
                         alt="${usuario.nombre}" 
                         class="usuario-avatar">
                </td>
                <td>
                    <div>
                        <strong>${usuario.nombre}</strong>
                    </div>
                </td>
                <td>${usuario.email}</td>
                <td>
                    <span class="badge badge-primary">
                        ${usuario.tipoDoctor || 'Sin especificar'}
                    </span>
                </td>
                <td>${fecha}</td>
                <td>
                    <span class="badge ${usuario.activo ? 'badge-success' : 'badge-error'}">
                        ${usuario.activo ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm ${usuario.activo ? 'btn-warning' : 'btn-success'}" 
                            onclick="cambiarEstadoUsuario('${usuario.id}', ${!usuario.activo})"
                            title="${usuario.activo ? 'Desactivar usuario' : 'Activar usuario'}">
                        <i class="fas fa-${usuario.activo ? 'ban' : 'check'}"></i>
                        ${usuario.activo ? 'Desactivar' : 'Activar'}
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    tbody.innerHTML = html;
}

function abrirModalUsuario() {
    const tiposDoctor = [
        'Médico General',
        'Cirujano Plástico',
        'Anestesiólogo',
        'Dermatólogo',
        'Cirujano Maxilofacial',
        'Medicina Estética',
        'Enfermero/a',
        'Instrumentista',
        'Administrador'
    ];

    const modalBody = `
        <form id="formUsuario">
            <div class="grid grid-2 gap-4">
                <div class="form-group">
                    <label class="form-label">
                        <i class="fas fa-user mr-1"></i>Nombre Completo
                    </label>
                    <input type="text" name="nombre" class="form-input" required 
                           placeholder="Dr. Juan Pérez">
                </div>
                <div class="form-group">
                    <label class="form-label">
                        <i class="fas fa-envelope mr-1"></i>Email
                    </label>
                    <input type="email" name="email" class="form-input" required
                           placeholder="doctor@clinica.com">
                </div>
            </div>
            
            <div class="form-group">
                <label class="form-label">
                    <i class="fas fa-user-md mr-1"></i>Tipo de Doctor/Especialidad
                </label>
                <select name="tipoDoctor" class="form-select" required>
                    <option value="">Seleccionar especialidad...</option>
                    ${tiposDoctor.map(tipo => `<option value="${tipo}">${tipo}</option>`).join('')}
                </select>
            </div>
            
            <div class="grid grid-2 gap-4">
                <div class="form-group">
                    <label class="form-label">
                        <i class="fas fa-lock mr-1"></i>Contraseña
                    </label>
                    <input type="password" name="password" class="form-input" required minlength="6"
                           placeholder="Mínimo 6 caracteres">
                </div>
                <div class="form-group">
                    <label class="form-label">
                        <i class="fas fa-lock mr-1"></i>Confirmar Contraseña
                    </label>
                    <input type="password" name="confirmPassword" class="form-input" required minlength="6"
                           placeholder="Repetir contraseña">
                </div>
            </div>
            
            <div class="form-group mt-4">
                <label class="form-label">
                    <i class="fas fa-camera mr-1"></i>Foto de Perfil
                </label>
                <input type="file" id="fotoUsuario" class="file-upload" accept="image/*">
                <label for="fotoUsuario" class="file-upload-label">
                    <i class="fas fa-cloud-upload-alt mr-2"></i>
                    Seleccionar Foto de Perfil
                </label>
                <small class="text-gray-600 mt-2 block">
                    <i class="fas fa-info-circle mr-1"></i>
                    Formatos permitidos: JPG, PNG. Tamaño máximo: 5MB
                </small>
            </div>
        </form>
    `;

    const modalFooter = `
        <button type="button" class="btn btn-secondary" onclick="cerrarModal()">
            <i class="fas fa-times mr-2"></i>Cancelar
        </button>
        <button type="button" class="btn btn-primary" onclick="guardarUsuario()">
            <i class="fas fa-user-plus mr-2"></i>Crear Usuario
        </button>
    `;

    abrirModal('Nuevo Usuario/Doctor', modalBody, modalFooter);
}

async function guardarUsuario() {
    const form = document.getElementById('formUsuario');
    const formData = new FormData(form);
    const datos = Object.fromEntries(formData);
    
    // Validar contraseñas
    if (datos.password !== datos.confirmPassword) {
        mostrarToast('Las contraseñas no coinciden', 'error');
        return;
    }

    // Validar campos requeridos
    if (!datos.tipoDoctor) {
        mostrarToast('Debe seleccionar un tipo de doctor/especialidad', 'error');
        return;
    }

    try {
        // Subir foto si se seleccionó
        const fotoInput = document.getElementById('fotoUsuario');
        if (fotoInput.files[0]) {
            const fotoUrl = await Firebase.subirImagenImgBB(fotoInput.files[0]);
            datos.fotoUrl = fotoUrl;
        }

        // Crear registro en la colección usuarios
        const datosUsuario = {
            nombre: datos.nombre,
            email: datos.email,
            tipoDoctor: datos.tipoDoctor,
            fotoUrl: datos.fotoUrl || null,
            password: datos.password,
            activo: true, // Los usuarios creados por admin están activos por defecto
            rol: 'administrador'
        };
        
        await Firebase.UsuariosService.crearUsuario(datosUsuario);

        mostrarToast(`✅ Usuario ${datos.tipoDoctor} creado correctamente y activado.`, 'success');
        cerrarModal();
        cargarUsuarios();
    } catch (error) {
        console.error('Error creando usuario:', error);
        mostrarToast('Error creando usuario: ' + error.message, 'error');
    }
}

async function cambiarEstadoUsuario(id, nuevoEstado) {
    try {
        await Firebase.UsuariosService.cambiarEstadoUsuario(id, nuevoEstado);
        mostrarToast(`Usuario ${nuevoEstado ? 'activado' : 'desactivado'} correctamente`, 'success');
        cargarUsuarios();
    } catch (error) {
        console.error('Error cambiando estado del usuario:', error);
        mostrarToast('Error cambiando estado del usuario', 'error');
    }
}

// ===================== GESTIÓN DE CITAS =====================

async function cargarCitas() {
    try {
        citas = await Firebase.CitasService.obtenerCitas();
        mostrarCalendario();
        mostrarCitasDelDia();
    } catch (error) {
        console.error('Error cargando citas:', error);
        mostrarToast('Error cargando citas', 'error');
    }
}

function abrirModalCita() {
    const modalBody = `
        <form id="formCita">
            <div class="grid grid-2 gap-4">
                <div class="form-group">
                    <label class="form-label">Paciente</label>
                    <select name="idPaciente" class="form-select" required>
                        <option value="">Seleccionar paciente</option>
                        ${pacientes.map(p => `<option value="${p.id}">${p.nombre} ${p.apellido}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Fecha y Hora</label>
                    <input type="datetime-local" name="fechaCita" class="form-input" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Motivo de la Cita</label>
                    <input type="text" name="motivo" class="form-input" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Estado</label>
                    <select name="estado" class="form-select" required>
                        <option value="pendiente">Pendiente</option>
                        <option value="confirmada">Confirmada</option>
                        <option value="cancelada">Cancelada</option>
                        <option value="completada">Completada</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Observaciones</label>
                    <textarea name="observaciones" class="form-textarea"></textarea>
                </div>
            </div>
        </form>
    `;

    const modalFooter = `
        <button type="button" class="btn btn-secondary" onclick="cerrarModal()">Cancelar</button>
        <button type="button" class="btn btn-primary" onclick="guardarCita()">
            Agendar Cita
        </button>
    `;

    abrirModal('Nueva Cita', modalBody, modalFooter);
}

async function guardarCita() {
    const form = document.getElementById('formCita');
    const formData = new FormData(form);
    const datos = Object.fromEntries(formData);
    
    try {
        // Convertir fecha a Timestamp de Firebase
        datos.fechaCita = firebase.firestore.Timestamp.fromDate(new Date(datos.fechaCita));
        
        await Firebase.CitasService.crearCita(datos);
        mostrarToast('Cita agendada correctamente', 'success');
        cerrarModal();
        cargarCitas();
    } catch (error) {
        console.error('Error guardando cita:', error);
        mostrarToast('Error agendando cita', 'error');
    }
}

function mostrarCalendario() {
    // Inicializar el calendario profesional
    if (window.calendarioManager) {
        window.calendarioManager.inicializar();
    } else {
        // Si el manager no está disponible, intentar inicializarlo
        setTimeout(() => {
            if (window.CalendarioManager) {
                window.calendarioManager = new window.CalendarioManager();
                window.calendarioManager.inicializar();
            } else {
                console.error('CalendarioManager no disponible');
                const container = document.getElementById('calendario');
                if (container) {
                    container.innerHTML = '<p class="text-center text-red-500">Error: No se pudo cargar el calendario</p>';
                }
            }
        }, 500);
    }
}

function mostrarCitasDelDia() {
    const container = document.getElementById('citasDelDia');
    const hoy = new Date().toDateString();
    const citasHoy = citas.filter(cita => {
        const fechaCita = cita.fechaCita ? 
            (cita.fechaCita.seconds ? 
                new Date(cita.fechaCita.seconds * 1000).toDateString() :
                new Date(cita.fechaCita).toDateString()) : 
            '';
        return fechaCita === hoy;
    });

    if (citasHoy.length === 0) {
        container.innerHTML = '<p class="text-center">No hay citas para hoy</p>';
        return;
    }

    const html = citasHoy.map(cita => {
        const paciente = pacientes.find(p => p.id === cita.idPaciente);
        const fechaCita = cita.fechaCita ? 
            (cita.fechaCita.seconds ? 
                new Date(cita.fechaCita.seconds * 1000) :
                new Date(cita.fechaCita)) : 
            new Date();
        const hora = fechaCita.toLocaleTimeString();
        
        return `
            <div class="card mb-3 ${cita.estado === 'urgente' ? 'cita-urgente' : 'cita-normal'}">
                <div class="card-body">
                    <div class="flex justify-between items-start">
                        <div>
                            <h5>${paciente ? paciente.nombre + ' ' + paciente.apellido : 'Paciente no encontrado'}</h5>
                            <p><strong>Hora:</strong> ${hora}</p>
                            <p><strong>Motivo:</strong> ${cita.motivo}</p>
                            <span class="badge badge-${cita.estado === 'pendiente' ? 'warning' : 'success'}">${cita.estado}</span>
                        </div>
                        <div class="flex flex-col gap-2">
                            <button class="btn btn-sm btn-primary" onclick="crearHistoriaDesdeCita('${cita.id}')" 
                                    title="Crear Historia Clínica">
                                <i class="fas fa-file-medical"></i>
                            </button>
                            <button class="btn btn-sm btn-success" onclick="completarCita('${cita.id}')" 
                                    title="Marcar como completada">
                                <i class="fas fa-check"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = html;
}

// ===================== GESTIÓN DE CIRUGÍAS =====================

async function cargarCirugias() {
    try {
        // Asegurarse de que el manager de cirugías está inicializado
        if (!window.cirugiasManager) {
            console.error('Manager de cirugías no disponible');
            return;
        }
        
        // Cargar lista de pacientes si no están cargados
        if (pacientes.length === 0) {
            await cargarPacientes();
        }
        
        // Inicializar el manager de cirugías
        await window.cirugiasManager.inicializar();
    } catch (error) {
        console.error('Error cargando cirugías:', error);
        mostrarToast('Error cargando cirugías', 'error');
    }
}

// ===================== HISTORIAS CLÍNICAS Y TRATAMIENTOS =====================

async function cargarHistorias() {
    // Asegurarse de que el manager de historias está inicializado
    if (!window.historiasManager) {
        console.error('Manager de historias no disponible');
        return;
    }
    
    // Cargar lista de pacientes si no están cargados
    if (pacientes.length === 0) {
        await cargarPacientes();
    }
    
    // Mostrar selector de paciente
    window.historiasManager.mostrarHistorias();
}

async function cargarTratamientos() {
    try {
        console.log('Cargando sección de tratamientos...');
        
        // Inicializar el manager de tratamientos si no existe
        if (!window.tratamientosManager) {
            window.tratamientosManager = new TratamientosManager();
            await window.tratamientosManager.inicializar();
        }
        
        // Asegurar que los pacientes estén cargados
        if (!window.pacientes || window.pacientes.length === 0) {
            console.log('Cargando pacientes para tratamientos...');
            await cargarPacientes();
        }
        
        // Cargar todos los tratamientos
        await window.tratamientosManager.cargarTodos();
        
        console.log('Sección de tratamientos cargada exitosamente');
    } catch (error) {
        console.error('Error cargando tratamientos:', error);
        mostrarToast('Error al cargar los tratamientos', 'error');
    }
}

function abrirModalHistoria() {
    if (window.historiasManager && window.historiasManager.pacienteActual) {
        window.historiasManager.abrirModalHistoria();
    } else {
        mostrarToast('Primero selecciona un paciente para crear una historia clínica', 'warning');
    }
}

function abrirModalTratamiento() {
    if (window.tratamientosManager && window.tratamientosManager.pacienteActual) {
        window.tratamientosManager.abrirModalTratamiento();
    } else {
        mostrarToast('Primero selecciona un paciente para crear un tratamiento', 'warning');
    }
}

// ===================== FUNCIONES AUXILIARES =====================

function abrirModal(titulo, cuerpo, pie, tipoModal = '') {
    document.getElementById('modalTitle').innerHTML = titulo;
    document.getElementById('modalBody').innerHTML = cuerpo;
    document.getElementById('modalFooter').innerHTML = pie;
    
    // Limpiar clases previas y agregar nueva clase si se especifica
    const modal = document.querySelector('#modalOverlay .modal');
    modal.className = 'modal';
    if (tipoModal) {
        modal.classList.add(`modal-${tipoModal}`);
    }
    
    document.getElementById('modalOverlay').classList.remove('hidden');
}

function cerrarModal() {
    document.getElementById('modalOverlay').classList.add('hidden');
}

function mostrarError(elemento, mensaje) {
    elemento.textContent = mensaje;
    elemento.classList.remove('hidden');
    setTimeout(() => {
        elemento.classList.add('hidden');
    }, 5000);
}

function mostrarToast(mensaje, tipo = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    
    toast.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-${tipo === 'success' ? 'check-circle' : tipo === 'error' ? 'times-circle' : 'info-circle'}"></i>
            <span class="ml-2">${mensaje}</span>
        </div>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

// Funciones globales para onclick
window.editarPaciente = function(id) {
    abrirModalPaciente(id);
};

window.verHistoriaPaciente = function(id) {
    navegarASeccion('historias');
    // Cargar historias específicas del paciente
    setTimeout(() => {
        if (window.historiasManager) {
            window.historiasManager.cargarHistoriasPaciente(id);
        }
    }, 100);
};

window.guardarPaciente = guardarPaciente;
window.guardarUsuario = guardarUsuario;
window.guardarCita = guardarCita;
window.cambiarEstadoUsuario = cambiarEstadoUsuario;
window.cerrarModal = cerrarModal;

// Función para crear historia clínica desde una cita
window.crearHistoriaDesdeCita = function(idCita) {
    const cita = citas.find(c => c.id === idCita);
    if (!cita) {
        mostrarToast('Cita no encontrada', 'error');
        return;
    }
    
    // Navegar a historias clínicas
    navegarASeccion('historias');
    
    // Esperar a que se cargue la sección y crear la historia
    setTimeout(() => {
        if (window.historiasManager) {
            window.historiasManager.crearHistoriaDesdeCita(idCita);
        } else {
            mostrarToast('Manager de historias no disponible', 'error');
        }
    }, 500);
};

// Función para completar una cita
window.completarCita = async function(idCita) {
    try {
        // Actualizar el estado de la cita a completada
        await Firebase.db.collection("citas").doc(idCita).update({
            estado: 'completada',
            fechaCompletada: firebase.firestore.Timestamp.now()
        });
        
        mostrarToast('Cita marcada como completada', 'success');
        
        // Recargar las citas para actualizar la vista
        await cargarCitas();
        
        // Actualizar calendario si está disponible
        if (window.calendarioManager) {
            window.calendarioManager.actualizarCalendario();
        }
        
    } catch (error) {
        console.error('Error completando cita:', error);
        mostrarToast('Error al completar la cita', 'error');
    }
};

// Función para editar una cita
window.editarCita = async function(idCita) {
    try {
        // Buscar la cita en la lista de citas
        const cita = citas.find(c => c.id === idCita);
        if (!cita) {
            mostrarToast('Cita no encontrada', 'error');
            return;
        }
        
        // Convertir fecha para el input datetime-local
        const fechaCita = cita.fechaCita.seconds ? 
            new Date(cita.fechaCita.seconds * 1000) :
            new Date(cita.fechaCita);
        const fechaFormateada = fechaCita.toISOString().slice(0, 16);
        
        const modalBody = `
            <form id="formEditarCita">
                <div class="grid grid-2 gap-4">
                    <div class="form-group">
                        <label class="form-label">Paciente</label>
                        <select name="idPaciente" class="form-select" required>
                            <option value="">Seleccionar paciente</option>
                            ${pacientes.map(p => `<option value="${p.id}" ${p.id === cita.idPaciente ? 'selected' : ''}>${p.nombre} ${p.apellido}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Fecha y Hora</label>
                        <input type="datetime-local" name="fechaCita" class="form-input cita-datetime" required value="${fechaFormateada}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Motivo de la Cita</label>
                        <input type="text" name="motivo" class="form-input" placeholder="Consulta general, revisión, etc." required value="${cita.motivo}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Estado</label>
                        <select name="estado" class="form-select" required>
                            <option value="pendiente" ${cita.estado === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                            <option value="confirmada" ${cita.estado === 'confirmada' ? 'selected' : ''}>Confirmada</option>
                            <option value="completada" ${cita.estado === 'completada' ? 'selected' : ''}>Completada</option>
                            <option value="cancelada" ${cita.estado === 'cancelada' ? 'selected' : ''}>Cancelada</option>
                            <option value="urgente" ${cita.estado === 'urgente' ? 'selected' : ''}>Urgente</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Observaciones</label>
                    <textarea name="observaciones" class="form-textarea" placeholder="Observaciones adicionales (opcional)">${cita.observaciones || ''}</textarea>
                </div>
            </form>
        `;

        const modalFooter = `
            <button type="button" class="btn btn-secondary" onclick="cerrarModal()">Cancelar</button>
            <button type="button" class="btn btn-primary" onclick="actualizarCita('${idCita}')">
                <i class="fas fa-save"></i> Actualizar Cita
            </button>
            <button type="button" class="btn btn-danger" onclick="eliminarCita('${idCita}')">
                <i class="fas fa-trash"></i> Eliminar
            </button>
        `;

        abrirModal('Editar Cita', modalBody, modalFooter, 'cita');
        
    } catch (error) {
        console.error('Error cargando cita para editar:', error);
        mostrarToast('Error cargando los datos de la cita', 'error');
    }
};

// Función para actualizar una cita
window.actualizarCita = async function(idCita) {
    const form = document.getElementById('formEditarCita');
    const formData = new FormData(form);
    const datos = Object.fromEntries(formData);
    
    try {
        // Convertir fecha a Timestamp de Firebase
        datos.fechaCita = firebase.firestore.Timestamp.fromDate(new Date(datos.fechaCita));
        datos.fechaModificacion = firebase.firestore.Timestamp.now();
        
        await Firebase.db.collection("citas").doc(idCita).update(datos);
        mostrarToast('✅ Cita actualizada correctamente', 'success');
        cerrarModal();
        
        // Actualizar calendario y citas
        await cargarCitas();
        if (window.calendarioManager) {
            window.calendarioManager.actualizarCalendario();
        }
    } catch (error) {
        console.error('Error actualizando cita:', error);
        mostrarToast('❌ Error actualizando cita', 'error');
    }
};

// Función para eliminar una cita
window.eliminarCita = async function(idCita) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta cita? Esta acción no se puede deshacer.')) {
        return;
    }
    
    try {
        await Firebase.db.collection("citas").doc(idCita).delete();
        mostrarToast('✅ Cita eliminada correctamente', 'success');
        cerrarModal();
        
        // Actualizar calendario y citas
        await cargarCitas();
        if (window.calendarioManager) {
            window.calendarioManager.actualizarCalendario();
        }
    } catch (error) {
        console.error('Error eliminando cita:', error);
        mostrarToast('❌ Error eliminando cita', 'error');
    }
};

