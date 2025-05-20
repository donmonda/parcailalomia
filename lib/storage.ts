// Configuración para almacenamiento de archivos con Vercel Blob Storage

import { put } from "@vercel/blob"
import { v4 as uuidv4 } from "uuid"

// Función para subir una imagen
export async function uploadImage(file: File) {
  try {
    // Generar un nombre único para el archivo
    const filename = `${uuidv4()}-${file.name.replace(/\s+/g, "-").toLowerCase()}`

    // Subir el archivo a Vercel Blob Storage
    const blob = await put(filename, file, {
      access: "public",
      contentType: file.type,
    })

    return blob.url
  } catch (error) {
    console.error("Error al subir imagen:", error)
    throw error
  }
}

// Función para subir un video
export async function uploadVideo(file: File) {
  try {
    // Generar un nombre único para el archivo
    const filename = `${uuidv4()}-${file.name.replace(/\s+/g, "-").toLowerCase()}`

    // Subir el archivo a Vercel Blob Storage
    const blob = await put(filename, file, {
      access: "public",
      contentType: file.type,
    })

    return blob.url
  } catch (error) {
    console.error("Error al subir video:", error)
    throw error
  }
}
