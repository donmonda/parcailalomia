// Este script inicializa la base de datos con datos de ejemplo
import fetch from 'node-fetch';

async function initializeDatabase() {
  try {
    console.log("Inicializando base de datos...")

    // Llamar a la API de inicialización
    const response = await fetch("http://localhost:3000/api/init")

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log("Base de datos inicializada correctamente:")
    console.log(data)
    console.log("\nCredenciales de administrador:")
    console.log(`Email: ${data.admin.email}`)
    console.log(`Contraseña: ${data.admin.password}`)
  } catch (error) {
    console.error("Error al inicializar la base de datos:", error)
    console.log("\nAsegúrate de que:")
    console.log("1. La aplicación esté en ejecución (npm run dev)")
    console.log("2. Las variables de entorno estén configuradas correctamente")
    console.log("3. MongoDB esté accesible")
  }
}

initializeDatabase()
