// Configuración para conectarse a MongoDB Atlas y MongoDB local
import mongoose from "mongoose"

// Variables de entorno
const MONGODB_ATLAS_URI = process.env.MONGODB_ATLAS_URI || "mongodb://localhost:27017/inventorydb"
const MONGODB_LOCAL_URI = process.env.MONGODB_LOCAL_URI || "mongodb://localhost:27017/inventorydb_local"

// Opciones de conexión optimizadas
const connectionOptions = {
  serverSelectionTimeoutMS: 30000, // Tiempo de espera para selección de servidor
  socketTimeoutMS: 45000, // Tiempo de espera para operaciones de socket
  connectTimeoutMS: 30000, // Tiempo de espera para la conexión inicial
  maxPoolSize: 10, // Tamaño máximo del pool de conexiones
  minPoolSize: 1, // Tamaño mínimo del pool de conexiones
  maxIdleTimeMS: 60000, // Tiempo máximo de inactividad
  retryWrites: true, // Reintentar operaciones de escritura
  retryReads: true, // Reintentar operaciones de lectura
  w: "majority", // Nivel de escritura
  wtimeoutMS: 25000, // Tiempo de espera para escrituras
  heartbeatFrequencyMS: 10000, // Frecuencia de heartbeat
  autoIndex: true, // Crear índices automáticamente
  family: 4 // Forzar IPv4
}

// Conexión a MongoDB Atlas (base de datos principal)
let atlasConnection: mongoose.Connection | null = null

// Conexión a MongoDB Local (espejo para usuarios)
let localConnection: mongoose.Connection | null = null

export async function connectToAtlas() {
  if (atlasConnection) return atlasConnection

  try {
    if (!MONGODB_ATLAS_URI) {
      throw new Error("MONGODB_ATLAS_URI no está definido")
    }

    const conn = await mongoose.createConnection(MONGODB_ATLAS_URI, {
      ...connectionOptions,
      autoCreate: true, // Permite la creación automática de la base de datos
      dbName: 'inventorydb', // Specifies the database name
      w: 1 // Set write concern to 1 to fix type compatibility
    })

    // Manejadores de eventos
    conn.on('connected', () => console.log('MongoDB Atlas conectado'))
    conn.on('error', (err) => console.error('Error de conexión Atlas:', err))
    conn.on('disconnected', () => console.log('MongoDB Atlas desconectado'))

    console.log("Conectado a MongoDB Atlas")
    atlasConnection = conn
    return conn
  } catch (error) {
    console.error("Error al conectar a MongoDB Atlas:", error)
    throw error
  }
}

export async function connectToLocal() {
  if (localConnection) return localConnection

  try {
    if (!MONGODB_LOCAL_URI) {
      throw new Error("MONGODB_LOCAL_URI no está definido")
    }

    const conn = await mongoose.createConnection(MONGODB_LOCAL_URI, {
      ...connectionOptions,
      autoCreate: true,
      dbName: 'inventorydb_local',
      w: 1 // Set write concern to 1 to fix type compatibility
    })

    // Manejadores de eventos
    conn.on('connected', () => console.log('MongoDB Local conectado'))
    conn.on('error', (err) => console.error('Error de conexión Local:', err))
    conn.on('disconnected', () => console.log('MongoDB Local desconectado'))

    console.log("Conectado a MongoDB Local")
    localConnection = conn
    return conn
  } catch (error) {
    console.error("Error al conectar a MongoDB Local:", error)
    throw error
  }
}

// Función para cerrar las conexiones
export async function closeConnections() {
  if (atlasConnection) {
    await atlasConnection.close()
    atlasConnection = null
  }
  if (localConnection) {
    await localConnection.close()
    localConnection = null
  }
  console.log("Conexiones cerradas")
}
