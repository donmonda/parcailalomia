// Modelo de usuario para ambas bases de datos (Atlas y Local)

import mongoose from "mongoose"
import { connectToAtlas, connectToLocal } from "../db"
import bcrypt from "bcryptjs"

// Definición del esquema de usuario
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
  },
  {
    timestamps: true,
  },
)

// Función para sincronizar usuarios entre Atlas y Local
export async function syncUsers() {
  try {
    const atlasConn = await connectToAtlas()
    const localConn = await connectToLocal()

    // Verificar si los modelos ya existen
    const AtlasUser = atlasConn.models.User || atlasConn.model("User", userSchema)
    const LocalUser = localConn.models.User || localConn.model("User", userSchema)

    // Obtener todos los usuarios de Atlas
    const atlasUsers = await AtlasUser.find({})

    // Para cada usuario en Atlas, actualizar o crear en Local
    for (const user of atlasUsers) {
      await LocalUser.findOneAndUpdate(
        { email: user.email },
        {
          email: user.email,
          password: user.password,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        { upsert: true, new: true },
      )
    }

    // Obtener todos los usuarios de Local
    const localUsers = await LocalUser.find({})

    // Para cada usuario en Local, actualizar o crear en Atlas
    for (const user of localUsers) {
      await AtlasUser.findOneAndUpdate(
        { email: user.email },
        {
          email: user.email,
          password: user.password,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        { upsert: true, new: true },
      )
    }

    console.log("Usuarios sincronizados correctamente")
  } catch (error) {
    console.error("Error al sincronizar usuarios:", error)
    throw error
  }
}

// Crear un usuario administrador por defecto
export async function createDefaultAdmin() {
  try {
    const atlasConn = await connectToAtlas()
    const AtlasUser = atlasConn.models.User || atlasConn.model("User", userSchema)

    // Verificar si ya existe un usuario admin
    const adminExists = await AtlasUser.findOne({ email: "admin@example.com" })

    if (!adminExists) {
      // Crear el usuario admin
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash("password", salt)

      const newAdmin = new AtlasUser({
        email: "admin@example.com",
        password: hashedPassword,
        name: "Administrador",
        role: "admin",
      })

      await newAdmin.save()
      console.log("Usuario administrador creado correctamente")

      // Sincronizar con la base de datos local
      await syncUsers()
    } else {
      console.log("El usuario administrador ya existe")
    }
  } catch (error) {
    console.error("Error al crear usuario administrador:", error)
    throw error
  }
}

// Exportar modelos para ambas bases de datos
export async function getAtlasUserModel() {
  const conn = await connectToAtlas()
  return conn.models.User || conn.model("User", userSchema)
}

export async function getLocalUserModel() {
  const conn = await connectToLocal()
  return conn.models.User || conn.model("User", userSchema)
}
