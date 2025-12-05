"use client"

import { useMedia } from "react-use"

const MOBILE_BREAKPOINT = 1024

export function useIsMobile() {
    // Always call hooks at the top level, but handle SSR gracefully
    // react-use's useMedia handles window checks internally usually
    const isMobile = useMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`, false)

    return isMobile
}
