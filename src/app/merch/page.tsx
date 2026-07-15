import { adminDb } from "@/lib/firebase/admin"
import { OrderForm } from "./order-form"

interface ProductListItem {
  id: string
  name: string
  description: string
  imageURL: string | null
  price: number
  variants: string[]
}

async function getActiveProducts(): Promise<ProductListItem[]> {
  const snapshot = await adminDb.collection("products").where("isActive", "==", true).get()
  return snapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      name: data.name,
      description: data.description,
      imageURL: data.imageURL ?? null,
      price: data.price,
      variants: data.variants ?? [],
    }
  })
}

export default async function MerchPage() {
  const products = await getActiveProducts()

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold mb-1">Merch</h1>
      <p className="text-sm opacity-70 mb-8">
        Pre-order — pay via GCash, upload your screenshot, and we&apos;ll confirm once reviewed. No
        account needed.
      </p>

      {products.length === 0 ? (
        <p className="opacity-60">Nothing available right now — check back soon.</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <li key={product.id} className="border rounded-lg p-4">
              {product.imageURL && (
                // eslint-disable-next-line @next/next/no-img-element -- arbitrary admin-provided URL, not a whitelistable domain
                <img
                  src={product.imageURL}
                  alt={product.name}
                  className="rounded mb-3 w-full h-40 object-cover"
                />
              )}
              <h2 className="font-semibold">{product.name}</h2>
              <p className="text-sm opacity-70 mb-1">{product.description}</p>
              <p className="font-medium mb-2">₱{product.price}</p>
              <OrderForm productId={product.id} variants={product.variants} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
