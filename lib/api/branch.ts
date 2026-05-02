import { fetchAPI } from "@/lib/api/client"
import type {
    Branch,
    BranchCreateRequest,
    BranchListResponse,
    BranchUpdateRequest,
} from "@/lib/types/branch"

function normalizeBranch(raw: Record<string, unknown>): Branch {
    return {
        id: String(raw.id ?? raw.Id ?? ""),
        name: String(raw.name ?? raw.Name ?? raw.title ?? raw.Title ?? ""),
        address: (raw.address ?? raw.Address) as string | undefined,
        isActive: Boolean(raw.isActive ?? raw.IsActive ?? true),
        createdAt: String(raw.createdAt ?? raw.CreatedAt ?? ""),
        updatedAt: (raw.updatedAt ?? raw.UpdatedAt) as string | undefined,
        metadata: (raw.metadata ?? raw.Metadata) as Branch["metadata"],
    }
}

export const branchAPI = {
    async getBranches(signal?: AbortSignal): Promise<BranchListResponse> {
        const raw = await fetchAPI<unknown[]>("/api/Branch", { signal })
        const list = Array.isArray(raw) ? raw : []
        return {
            data: list.map((r) => normalizeBranch(r as Record<string, unknown>)),
            total: list.length,
        }
    },

    async getBranchById(id: string, signal?: AbortSignal): Promise<Branch> {
        const raw = await fetchAPI<Record<string, unknown>>(`/api/Branch/${id}`, { signal })
        return normalizeBranch(raw)
    },

    async createBranch(data: BranchCreateRequest): Promise<Branch> {
        const raw = await fetchAPI<Record<string, unknown>>("/api/Branch", {
            method: "POST",
            body: JSON.stringify(data),
        })
        return normalizeBranch(raw)
    },

    async updateBranch(id: string, data: BranchUpdateRequest): Promise<void> {
        await fetchAPI(`/api/Branch/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        })
    },

    async deleteBranch(id: string): Promise<void> {
        await fetchAPI(`/api/Branch/${id}`, { method: "DELETE" })
    },
}
