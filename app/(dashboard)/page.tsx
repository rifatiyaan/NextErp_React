"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUserMenu } from "@/hooks/use-modules"

export default function Home() {
  const router = useRouter()
  const { data: modules, isPending, isError } = useUserMenu()

  useEffect(() => {
    if (!modules || modules.length === 0) return
    const sorted = [...modules].sort((a, b) => a.order - b.order)
    const first = sorted.find((m) => !!m.url)
    if (first?.url) {
      router.replace(first.url)
    }
  }, [modules, router])

  const isResolving = isPending
  const hasNoModules = !isPending && !isError && (!modules || modules.length === 0 || !modules.some((m) => !!m.url))

  return (
    <>
      {isResolving ? (
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      ) : hasNoModules || isError ? (
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <h1 className="text-2xl font-bold">Welcome to NextErp</h1>
          <p className="text-muted-foreground">No modules available or error loading modules.</p>
        </div>
      ) : (
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      )}
    </>
  )
}
