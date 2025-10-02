import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { Suspense } from "react"
import Sidebar from "@/components/sidebar"

export const metadata: Metadata = {
  title: "WMS - Warehouse Management System",
  description: "Warehouse Management System for logistics operations",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>
          <Sidebar />
          <main className="lg:pl-64">
            <div className="container mx-auto py-8 px-4 lg:px-8">{children}</div>
          </main>
          <Toaster />
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
