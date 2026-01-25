"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
// import { MainLayout } from "@/containers/layout/MainLayout"
import { moduleAPI, buildMenuTree } from "@/lib/api/module"

export default function Home() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const redirect = async () => {
      try {
        const modules = await moduleAPI.getAllModules()
        const tree = buildMenuTree(modules)

        if (tree.length > 0 && tree[0].url) {
          router.replace(tree[0].url)
        } else {
          console.warn("No modules found to redirect to")
          setIsLoading(false)
        }
      } catch (error) {
        console.error("Failed to fetch modules for redirect", error)
        // If API fails, don't block the user - they can navigate manually
        if (error instanceof Error && (error.message.includes("Network error") || error.message.includes("Failed to fetch"))) {
          console.warn("API connection failed. Please ensure backend is running and SSL certificate is accepted.")
        }
        setIsLoading(false)
      }
    }

    redirect()
  }, [router])

  return (
    <>
      {isLoading ? (
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <h1 className="text-2xl font-bold">Welcome to NextErp</h1>
          <p className="text-muted-foreground">No modules available or error loading modules.</p>
        </div>
      )}
    </>
  )
}
