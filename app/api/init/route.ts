import { NextResponse } from "next/server"
import { connectToAtlas, connectToLocal } from "@/lib/db"
import { createDefaultAdmin } from "@/lib/models/user"
import { getProductoModel } from "@/lib/models/producto"
import { getClienteModel } from "@/lib/models/cliente"

// Ruta para inicializar la base de datos con datos de ejemplo
export async function GET() {
  try {
    // Verificar conexiones a MongoDB
    const atlasConn = await connectToAtlas()
    const localConn = await connectToLocal()

    console.log("Conexiones a MongoDB establecidas correctamente")

    // Crear usuario administrador por defecto
    await createDefaultAdmin()

    // Crear productos de ejemplo
    const ProductoModel = await getProductoModel()
    const productosCount = await ProductoModel.countDocuments()

    if (productosCount === 0) {
      const productosEjemplo = [
        {
          nombre: "Laptop HP",
          sku: "LAP-001",
          precio: 899.99,
          stock: 15,
          categoria: "Electrónicos",
          descripcion: "Laptop HP con procesador Intel Core i5, 8GB RAM, 256GB SSD",
        },
        {
          nombre: 'Monitor Dell 27"',
          sku: "MON-002",
          precio: 299.99,
          stock: 8,
          categoria: "Periféricos",
          descripcion: "Monitor Dell de 27 pulgadas, resolución 1440p",
        },
        {
          nombre: "Teclado Mecánico",
          sku: "TEC-003",
          precio: 89.99,
          stock: 20,
          categoria: "Periféricos",
          descripcion: "Teclado mecánico con switches Cherry MX Red",
        },
        {
          nombre: "Mouse Inalámbrico",
          sku: "MOU-004",
          precio: 29.99,
          stock: 25,
          categoria: "Periféricos",
          descripcion: "Mouse inalámbrico con sensor óptico de alta precisión",
        },
        {
          nombre: "Disco SSD 1TB",
          sku: "SSD-005",
          precio: 129.99,
          stock: 12,
          categoria: "Almacenamiento",
          descripcion: "Disco SSD de 1TB con velocidad de lectura de 550MB/s",
        },
      ]

      await ProductoModel.insertMany(productosEjemplo)
      console.log("Productos de ejemplo creados correctamente")
    }

    // Crear clientes de ejemplo
    const ClienteModel = await getClienteModel()
    const clientesCount = await ClienteModel.countDocuments()

    if (clientesCount === 0) {
      const clientesEjemplo = [
        {
          nombre: "Juan Pérez",
          email: "juan@example.com",
          telefono: "555-1234",
          direccion: "Calle Principal 123",
          rfc: "PEJM800101ABC",
        },
        {
          nombre: "María García",
          email: "maria@example.com",
          telefono: "555-5678",
          direccion: "Av. Central 456",
          rfc: "GARM790215XYZ",
        },
        {
          nombre: "Carlos López",
          email: "carlos@example.com",
          telefono: "555-9012",
          direccion: "Plaza Mayor 789",
          rfc: "LOPC810330DEF",
        },
        {
          nombre: "Ana Martínez",
          email: "ana@example.com",
          telefono: "555-3456",
          direccion: "Blvd. Norte 101",
          rfc: "MARA850712GHI",
        },
        {
          nombre: "Roberto Sánchez",
          email: "roberto@example.com",
          telefono: "555-7890",
          direccion: "Callejón Sur 202",
          rfc: "SARB760925JKL",
        },
      ]

      await ClienteModel.insertMany(clientesEjemplo)
      console.log("Clientes de ejemplo creados correctamente")
    }

    return NextResponse.json({
      message: "Base de datos inicializada correctamente",
      admin: {
        email: "admin@example.com",
        password: "password",
      },
    })
  } catch (error) {
    console.error("Error al inicializar la base de datos:", error)
    return NextResponse.json(
      {
        error: "Error en el servidor",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
