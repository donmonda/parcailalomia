"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Package, Users, ShoppingCart, FileText, LogOut, Settings } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
    color: "text-sky-500",
  },
  {
    label: "Productos",
    icon: Package,
    href: "/productos",
    color: "text-violet-500",
  },
  {
    label: "Clientes",
    icon: Users,
    href: "/clientes",
    color: "text-pink-700",
  },
  {
    label: "Ventas",
    icon: ShoppingCart,
    href: "/ventas",
    color: "text-orange-500",
  },
  {
    label: "Reportes",
    icon: FileText,
    href: "/reportes",
    color: "text-emerald-500",
  },
  {
    label: "Configuración",
    icon: Settings,
    href: "/configuracion",
    color: "text-gray-500",
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()

  // No mostrar sidebar en la página de login
  if (pathname === "/login") {
    return null
  }

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-slate-900 text-white">
      <div className="px-3 py-2 flex-1">
        <Link href="/" className="flex items-center pl-3 mb-14">
          <h1 className="text-2xl font-bold">
            Inventory<span className="text-blue-500">Pro</span>
          </h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                pathname === route.href ? "text-white bg-white/10" : "text-zinc-400",
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="px-3 py-2">
        <Button
          variant="ghost"
          className="w-full justify-start text-zinc-400 hover:text-white hover:bg-white/10"
          onClick={logout}
        >
          <LogOut className="h-5 w-5 mr-3 text-red-500" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  )
}
