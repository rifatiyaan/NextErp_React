import "server-only"
import { en } from "@/data/dictionaries/en"

// Mock async dictionary fetcher
export async function getDictionary(locale: string = "en") {
    // Always return English for now
    return en
}

export type DictionaryType = typeof en
