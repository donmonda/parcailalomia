import { NextResponse } from "next/server"
import { getClienteModel } from "@/lib/models/cliente"

// GET - Obtener todos los clientes
export async function GET() {
  try {
    const ClienteModel = await getClienteModel()
    const clientes = await ClienteModel.find({}).sort({ nombre: 1 })

    return NextResponse.json(clientes)
  } catch (error) {
    console.error("Error al obtener clientes:", error)
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 })
  }
}

// POST - Crear un nuevo cliente
export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Validar datos de entrada
    if (!data.nombre || !data.email || !data.telefono || !data.direccion || !data.rfc) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 })
    }

    const ClienteModel = await getClienteModel()

    // Verificar si ya existe un cliente con el mismo email o RFC
    const existingCliente = await ClienteModel.findOne({
      $or: [{ email: data.email }, { rfc: data.rfc }],
    })

    if (existingCliente) {
      return NextResponse.json({ error: "Ya existe un cliente con ese email o RFC" }, { status: 409 })
    }

    // Crear el nuevo cliente
    const nuevoCliente = new ClienteModel({
      nombre: data.nombre,
      email: data.email,
      telefono: data.telefono,
      direccion: data.direccion,
      rfc: data.rfc,
    })

    await nuevoCliente.save()

    return NextResponse.json(nuevoCliente, { status: 201 })
  } catch (error) {
    console.error("Error al crear cliente:", error)
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 })
  }
}
