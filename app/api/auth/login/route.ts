import { NextResponse } from "next/server"
import { getLocalUserModel } from "@/lib/models/user"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

// Clave secreta para JWT
const JWT_SECRET = process.env.JWT_SECRET || "clave_secreta_temporal"

export async function POST(request: Request) {
  try {
    console.log("Iniciando proceso de login")
    const { email, password } = await request.json()
    console.log("Datos recibidos:", { email }) // No logear la contraseña

    // Validar datos de entrada
    if (!email || !password) {
      console.log("Faltan datos requeridos")
      return NextResponse.json({ error: "Email y contraseña son requeridos" }, { status: 400 })
    }

    // Obtener el modelo de usuario de la base de datos local
    const UserModel = await getLocalUserModel()
    console.log("Modelo de usuario obtenido")

    // Buscar el usuario por email
    const user = await UserModel.findOne({ email })
    console.log("Búsqueda de usuario completada:", !!user)

    // Verificar si el usuario existe
    if (!user) {
      console.log("Usuario no encontrado")
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    // Verificar la contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password)
    console.log("Verificación de contraseña completada:", isPasswordValid)

    if (!isPasswordValid) {
      console.log("Contraseña inválida")
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    // Generar token JWT
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "1d" },
    )
    console.log("Token generado correctamente")

    // Devolver respuesta exitosa con token
    return NextResponse.json({
      message: "Inicio de sesión exitoso",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    })
  } catch (error) {
    console.error("Error detallado en inicio de sesión:", error)
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 })
  }
}
