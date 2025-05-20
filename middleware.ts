import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Rutas que no requieren autenticación
const publicRoutes = ["/login", "/api/auth/login", "/api/init"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Verificar si la ruta es pública
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Verificar si es una ruta de API
  const isApiRoute = pathname.startsWith("/api")

  // Obtener token de autorización
  const token = isApiRoute
    ? request.headers.get("Authorization")?.replace("Bearer ", "")
    : request.cookies.get("token")?.value || request.headers.get("x-auth-token")

  // Para desarrollo, permitir acceso sin token a rutas de API
  if (isApiRoute && process.env.NODE_ENV === "development") {
    return NextResponse.next()
  }

  if (!token) {
    // Redirigir a login si no es una ruta de API
    if (!isApiRoute) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    // Devolver error 401 para rutas de API
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  // Continuar con la solicitud
  return NextResponse.next()
}

// Configurar rutas que deben ser protegidas
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
