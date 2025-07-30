// Configuración de Firebase (usando SDK para navegador)
const firebaseConfig = {
  apiKey: "AIzaSyBkcT5xNPUIXZlBdLptoeuXJ2FaYeR1lRU",
  authDomain: "plataforma-pacientes.firebaseapp.com",
  projectId: "plataforma-pacientes",
  storageBucket: "plataforma-pacientes.firebasestorage.app",
  messagingSenderId: "492967301598",
  appId: "1:492967301598:web:c294020948dbda27e10d4f",
  measurementId: "G-QVDK6KW44N"
};

// Inicializar Firebase (esperar a que Firebase esté disponible)
let app, db;

// Función para inicializar Firebase cuando esté disponible
function inicializarFirebase() {
  if (typeof firebase !== 'undefined') {
    app = firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    console.log('✅ Firebase inicializado correctamente');
    return true;
  }
  return false;
}

// API de ImgBB para las imágenes
 const apiImgBB = "https://api.imgbb.com/1/upload?key=27cc0fd5ca7e448e1830e4c4418c1a72";

// Tipos de cirugías disponibles
const tiposCirugias = [
  "Mastoplastía de Reducción",
  "Mentoplastía", 
  "Braquioplastía",
  "Otoplastía",
  "Gluteoplastía",
  "Queiloplastía",
  "Lipolight Sculpsure",
  "Bichectomía",
  "Lipoescultura",
  "Rinoplastía",
  "Abdominoplastía",
  "Blefaroplastía",
  "Mastoplastía de Aumento",
  "Frontoplastía"
];

// Funciones para manejar usuarios
const UsuariosService = {
  // Crear nuevo usuario administrador
  async crearUsuario(datosUsuario) {
    try {
      if (!db) {
        throw new Error('Firebase no está inicializado');
      }
      const docRef = await db.collection("usuarios").add({
        ...datosUsuario,
        fechaCreacion: firebase.firestore.Timestamp.now(),
        rol: 'administrador'
      });
      return docRef.id;
    } catch (error) {
      console.error("Error creando usuario:", error);
      throw error;
    }
  },

  // Obtener todos los usuarios
  async obtenerUsuarios() {
    try {
      if (!db) {
        throw new Error('Firebase no está inicializado');
      }
      const querySnapshot = await db.collection("usuarios").get();
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error obteniendo usuarios:", error);
      throw error;
    }
  },

  // Activar/Desactivar usuario
  async cambiarEstadoUsuario(idUsuario, activo) {
    try {
      if (!db) {
        throw new Error('Firebase no está inicializado');
      }
      await db.collection("usuarios").doc(idUsuario).update({ 
        activo: activo,
        fechaActualizacion: firebase.firestore.Timestamp.now()
      });
    } catch (error) {
      console.error("Error cambiando estado del usuario:", error);
      throw error;
    }
  },

  // Verificar login (sin Firebase Auth, solo Firestore)
  async verificarLogin(email, password) {
    try {
      if (!db) {
        throw new Error('Firebase no está inicializado');
      }
      
      const querySnapshot = await db.collection("usuarios")
        .where("email", "==", email)
        .where("password", "==", password)
        .where("activo", "==", true)
        .get();
      
      if (querySnapshot.empty) {
        throw new Error('Credenciales incorrectas o usuario inactivo');
      }
      
      const usuarioDoc = querySnapshot.docs[0];
      return {
        id: usuarioDoc.id,
        ...usuarioDoc.data()
      };
    } catch (error) {
      console.error("Error verificando login:", error);
      throw error;
    }
  }
};

// Funciones para manejar pacientes
const PacientesService = {
  // Crear nuevo paciente
  async crearPaciente(datosPaciente) {
    try {
      if (!db) {
        throw new Error('Firebase no está inicializado');
      }
      const docRef = await db.collection("pacientes").add({
        ...datosPaciente,
        fechaRegistro: firebase.firestore.Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error("Error creando paciente:", error);
      throw error;
    }
  },

  // Obtener todos los pacientes
  async obtenerPacientes() {
    try {
      if (!db) {
        throw new Error('Firebase no está inicializado');
      }
      const querySnapshot = await db.collection("pacientes").get();
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error obteniendo pacientes:", error);
      throw error;
    }
  },

  // Actualizar paciente
  async actualizarPaciente(idPaciente, datosPaciente) {
    try {
      if (!db) {
        throw new Error('Firebase no está inicializado');
      }
      await db.collection("pacientes").doc(idPaciente).update({
        ...datosPaciente,
        fechaActualizacion: firebase.firestore.Timestamp.now()
      });
    } catch (error) {
      console.error("Error actualizando paciente:", error);
      throw error;
    }
  }
};

// Funciones para manejar historias clínicas
const HistoriasService = {
  // Crear nueva historia clínica
  async crearHistoria(datosHistoria) {
    try {
      if (!db) {
        throw new Error('Firebase no está inicializado');
      }
      const docRef = await db.collection("historias_clinicas").add({
        ...datosHistoria,
        fechaCreacion: firebase.firestore.Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error("Error creando historia clínica:", error);
      throw error;
    }
  },

  // Obtener historias por paciente
  async obtenerHistoriasPorPaciente(idPaciente) {
    try {
      if (!db) {
        throw new Error('Firebase no está inicializado');
      }
      
      // Primero obtener todas las historias del paciente sin ordenar
      const querySnapshot = await db.collection("historias_clinicas")
        .where("idPaciente", "==", idPaciente)
        .get();
      
      // Obtener los datos y ordenar en el cliente
      const historias = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Ordenar por fecha de creación descendente
      historias.sort((a, b) => {
        const fechaA = a.fechaCreacion ? 
          (a.fechaCreacion.seconds ? a.fechaCreacion.seconds : new Date(a.fechaCreacion).getTime() / 1000) : 0;
        const fechaB = b.fechaCreacion ? 
          (b.fechaCreacion.seconds ? b.fechaCreacion.seconds : new Date(b.fechaCreacion).getTime() / 1000) : 0;
        return fechaB - fechaA;
      });
      
      return historias;
    } catch (error) {
      console.error("Error obteniendo historias:", error);
      throw error;
    }
  },

  // Actualizar historia clínica existente
  async actualizarHistoria(idHistoria, datosHistoria) {
    try {
      if (!db) {
        throw new Error('Firebase no está inicializado');
      }
      await db.collection("historias_clinicas").doc(idHistoria).update({
        ...datosHistoria,
        fechaActualizacion: firebase.firestore.Timestamp.now()
      });
    } catch (error) {
      console.error("Error actualizando historia clínica:", error);
      throw error;
    }
  },

  // Obtener historia clínica por ID
  async obtenerHistoriaPorId(idHistoria) {
    try {
      if (!db) {
        throw new Error('Firebase no está inicializado');
      }
      const doc = await db.collection("historias_clinicas").doc(idHistoria).get();
      if (doc.exists) {
        return {
          id: doc.id,
          ...doc.data()
        };
      } else {
        throw new Error('Historia clínica no encontrada');
      }
    } catch (error) {
      console.error("Error obteniendo historia por ID:", error);
      throw error;
    }
  }
};

// Funciones para manejar citas
const CitasService = {
  // Crear nueva cita (paciente registrado o externo)
  async crearCita(datosCita) {
    try {
      if (!db) {
        throw new Error('Firebase no está inicializado');
      }
      
      // Validar que tenga al menos idPaciente O datos de paciente externo
      if (!datosCita.idPaciente && !datosCita.pacienteExterno) {
        throw new Error('Debe especificar un paciente registrado o datos de paciente externo');
      }
      
      const docRef = await db.collection("citas").add({
        ...datosCita,
        fechaCreacion: firebase.firestore.Timestamp.now(),
        tipoPaciente: datosCita.idPaciente ? 'registrado' : 'externo'
      });
      return docRef.id;
    } catch (error) {
      console.error("Error creando cita:", error);
      throw error;
    }
  },

  // Obtener citas
  async obtenerCitas() {
    try {
      if (!db) {
        throw new Error('Firebase no está inicializado');
      }
      const querySnapshot = await db.collection("citas")
        .orderBy("fechaCita", "asc")
        .get();
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error obteniendo citas:", error);
      throw error;
    }
  }
};

// Funciones para manejar cirugías
const CirugiasService = {
  // Crear nueva cirugía
  async crearCirugia(datosCirugia) {
    try {
      if (!db) {
        throw new Error('Firebase no está inicializado');
      }
      const docRef = await db.collection("cirugias").add({
        ...datosCirugia,
        fechaCreacion: firebase.firestore.Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error("Error creando cirugía:", error);
      throw error;
    }
  },

  // Obtener todas las cirugías
  async obtenerCirugias() {
    try {
      if (!db) {
        throw new Error('Firebase no está inicializado');
      }
      const querySnapshot = await db.collection("cirugias")
        .orderBy("fechaCirugia", "desc")
        .get();
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error obteniendo cirugías:", error);
      throw error;
    }
  },

  // Obtener cirugías por paciente
  async obtenerCirugiasPorPaciente(idPaciente) {
    try {
      if (!db) {
        throw new Error('Firebase no está inicializado');
      }
      const querySnapshot = await db.collection("cirugias")
        .where("idPaciente", "==", idPaciente)
        .orderBy("fechaCirugia", "desc")
        .get();
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error obteniendo cirugías:", error);
      throw error;
    }
  },

  // Actualizar cirugía
  async actualizarCirugia(idCirugia, datosCirugia) {
    try {
      if (!db) {
        throw new Error('Firebase no está inicializado');
      }
      await db.collection("cirugias").doc(idCirugia).update({
        ...datosCirugia,
        fechaActualizacion: firebase.firestore.Timestamp.now()
      });
    } catch (error) {
      console.error("Error actualizando cirugía:", error);
      throw error;
    }
  },

  // Eliminar cirugía
  async eliminarCirugia(idCirugia) {
    try {
      if (!db) {
        throw new Error('Firebase no está inicializado');
      }
      await db.collection("cirugias").doc(idCirugia).delete();
    } catch (error) {
      console.error("Error eliminando cirugía:", error);
      throw error;
    }
  }
};

// Funciones para manejar tratamientos
const TratamientosService = {
  // Crear nuevo tratamiento
  async crearTratamiento(datosTratamiento) {
    try {
      if (!db) {
        throw new Error('Firebase no está inicializado');
      }
      const docRef = await db.collection("tratamientos").add({
        ...datosTratamiento,
        fechaCreacion: firebase.firestore.Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error("Error creando tratamiento:", error);
      throw error;
    }
  },

  // Obtener todos los tratamientos
  async obtenerTratamientos() {
    try {
      if (!db) {
        throw new Error('Firebase no está inicializado');
      }
      const querySnapshot = await db.collection("tratamientos")
        .orderBy("fechaInicio", "desc")
        .get();
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error obteniendo tratamientos:", error);
      throw error;
    }
  },

  // Obtener tratamientos por paciente
  async obtenerTratamientosPorPaciente(idPaciente) {
    try {
      if (!db) {
        throw new Error('Firebase no está inicializado');
      }
      const querySnapshot = await db.collection("tratamientos")
        .where("idPaciente", "==", idPaciente)
        .orderBy("fechaInicio", "desc")
        .get();
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error obteniendo tratamientos:", error);
      throw error;
    }
  },

  // Actualizar tratamiento
  async actualizarTratamiento(idTratamiento, datosTratamiento) {
    try {
      if (!db) {
        throw new Error('Firebase no está inicializado');
      }
      await db.collection("tratamientos").doc(idTratamiento).update({
        ...datosTratamiento,
        fechaActualizacion: firebase.firestore.Timestamp.now()
      });
    } catch (error) {
      console.error("Error actualizando tratamiento:", error);
      throw error;
    }
  },

  // Eliminar tratamiento
  async eliminarTratamiento(idTratamiento) {
    try {
      if (!db) {
        throw new Error('Firebase no está inicializado');
      }
      await db.collection("tratamientos").doc(idTratamiento).delete();
    } catch (error) {
      console.error("Error eliminando tratamiento:", error);
      throw error;
    }
  },

  // Cambiar estado de tratamiento
  async cambiarEstadoTratamiento(idTratamiento, nuevoEstado) {
    try {
      if (!db) {
        throw new Error('Firebase no está inicializado');
      }
      const updateData = {
        estado: nuevoEstado,
        fechaActualizacion: firebase.firestore.Timestamp.now()
      };
      
      // Si se finaliza el tratamiento, agregar fecha de finalización
      if (nuevoEstado === 'finalizado') {
        updateData.fechaFinalizacion = firebase.firestore.Timestamp.now();
      }
      
      await db.collection("tratamientos").doc(idTratamiento).update(updateData);
    } catch (error) {
      console.error("Error cambiando estado del tratamiento:", error);
      throw error;
    }
  }
};

// Función para subir imágenes a ImgBB
async function subirImagenImgBB(archivo) {
  try {
    const formData = new FormData();
    formData.append('image', archivo);
    
    const response = await fetch(apiImgBB, {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    
    if (data.success) {
      return data.data.url;
    } else {
      throw new Error('Error subiendo imagen a ImgBB');
    }
  } catch (error) {
    console.error("Error subiendo imagen:", error);
    throw error;
  }
}

// Exportar todo para uso global
window.Firebase = {
  inicializarFirebase,
  UsuariosService,
  PacientesService,
  HistoriasService,
  CitasService,
  CirugiasService,
  TratamientosService,
  subirImagenImgBB,
  tiposCirugias,
  // Propiedades que se establecen después de la inicialización
  get app() { return app; },
  get db() { return db; }
};






