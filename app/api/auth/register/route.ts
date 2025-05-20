import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getLocalUserModel, syncUsers } from "@/lib/models/user"

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json()

    // Validar datos de entrada
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      )
    }

    // Obtener el modelo de usuario local
    const UserModel = await getLocalUserModel()

    // Verificar si el usuario ya existe localmente
    const existingUser = await UserModel.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { error: "El correo electrónico ya está registrado" },
        { status: 400 }
      )
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10)

    // Crear el nuevo usuario local
    const user = await UserModel.create({
      email,
      password: hashedPassword,
      name,
      role: "user", // Rol por defecto
    })

    // Sincronizar con Atlas inmediatamente después de crear el usuario
    await syncUsers()

    return NextResponse.json({
      message: "Usuario registrado exitosamente",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Error en registro:", error)
    return NextResponse.json(
      { error: "Error al crear el usuario" },
      { status: 500 }
    )
  }
}
