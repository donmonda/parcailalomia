"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [name, setName] = useState("")
  const router = useRouter()
  const { toast } = useToast()
  const { login, register, user } = useAuth()

  useEffect(() => {
    if (user) {
      router.push("/")
    }
  }, [user, router])

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      if (isRegistering) {
        const success = await register(email, password, name)
        if (success) {
          toast({
            title: "Registro exitoso",
            description: "Por favor, inicie sesión con sus credenciales",
          })
          setIsRegistering(false)
        } else {
          toast({
            variant: "destructive",
            title: "Error de registro",
            description: "No se pudo crear la cuenta. Intente nuevamente.",
          })
        }
      } else {
        const success = await login(email, password)
        if (success) {
          toast({
            title: "Inicio de sesión exitoso",
            description: "Bienvenido al sistema de gestión de inventario",
          })
          router.push("/")
        } else {
          toast({
            variant: "destructive",
            title: "Error de autenticación",
            description: "Credenciales incorrectas. Intente nuevamente.",
          })
        }
      }
    } catch (error) {
      console.error("Error:", error)
      toast({
        variant: "destructive",
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor. Intente más tarde.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">
            Inventory<span className="text-blue-500">Pro</span>
          </CardTitle>
          <CardDescription className="text-center">
            {isRegistering ? "Cree una nueva cuenta" : "Ingrese sus credenciales para acceder al sistema"}
          </CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent className="space-y-4">
            {isRegistering && (
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  placeholder="Nombre completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                name="email"
                placeholder="correo@ejemplo.com"
                type="email"
                autoComplete="email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete={isRegistering ? "new-password" : "current-password"}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span className="sr-only">{showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}</span>
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading
                ? isRegistering
                  ? "Registrando..."
                  : "Iniciando sesión..."
                : isRegistering
                ? "Registrarse"
                : "Iniciar Sesión"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setIsRegistering(!isRegistering)}
            >
              {isRegistering
                ? "¿Ya tienes una cuenta? Inicia sesión"
                : "¿No tienes una cuenta? Regístrate"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
