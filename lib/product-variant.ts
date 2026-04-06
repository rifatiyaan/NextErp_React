import type { Product, ProductVariant } from "@/types/product"

export function pickPrimaryVariant(product: Product): ProductVariant | null {
  const variants = product.productVariants
    ?.filter((v) => v.isActive)
    .sort((a, b) => a.id - b.id)

  if (variants?.length)
    return variants[0]!

  return null
}
