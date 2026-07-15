import Image from "next/image"
import { requireRole } from "@/lib/dal"
import { adminDb } from "@/lib/firebase/admin"
import { DEPT_HEAD_OR_ABOVE, type ProductRecord, type MerchOrderRecord } from "@/lib/types"
import { createProduct, toggleProductActive, setOrderStatus } from "./actions"

async function getProducts(): Promise<ProductRecord[]> {
  const snapshot = await adminDb.collection("products").get()
  return snapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      name: data.name,
      description: data.description,
      imageURL: data.imageURL ?? null,
      price: data.price,
      variants: data.variants ?? [],
      isActive: data.isActive,
    }
  })
}

async function getPendingOrders(): Promise<MerchOrderRecord[]> {
  const snapshot = await adminDb
    .collection("merchOrders")
    .where("status", "==", "pending")
    .orderBy("createdAt", "asc")
    .get()

  return snapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      buyerName: data.buyerName,
      buyerContact: data.buyerContact,
      productId: data.productId,
      productName: data.productName,
      variant: data.variant,
      quantity: data.quantity,
      totalAmount: data.totalAmount,
      proofImageURL: data.proofImageURL,
      status: data.status,
      createdAt: data.createdAt.toDate(),
    }
  })
}

export default async function AdminMerchPage() {
  await requireRole(DEPT_HEAD_OR_ABOVE)
  const [products, pendingOrders] = await Promise.all([getProducts(), getPendingOrders()])

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">Merch</h1>

      <section className="mb-10">
        <h2 className="font-semibold mb-3">Products</h2>
        <div className="grid lg:grid-cols-[320px_1fr] gap-10">
        <form action={createProduct} className="flex flex-col gap-2">
          <input name="name" placeholder="Product name" required className="border rounded px-3 py-2" />
          <textarea name="description" placeholder="Description" className="border rounded px-3 py-2" />
          <input type="number" name="price" placeholder="Price (PHP)" step="0.01" required className="border rounded px-3 py-2" />
          <input name="variants" placeholder="Variants, comma-separated (e.g. S, M, L)" className="border rounded px-3 py-2" />
          <input name="imageURL" placeholder="Image URL (optional)" className="border rounded px-3 py-2" />
          <button className="rounded-full bg-foreground text-background px-5 py-2 font-medium self-start">
            Add product
          </button>
        </form>

        <ul className="grid sm:grid-cols-2 gap-2 content-start">
          {products.map((product) => (
            <li key={product.id} className="border rounded-lg p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {product.imageURL && (
                  // eslint-disable-next-line @next/next/no-img-element -- arbitrary admin-provided URL, not a whitelistable domain
                  <img
                    src={product.imageURL}
                    alt={product.name}
                    className="w-12 h-12 rounded object-cover"
                  />
                )}
                <div>
                  <p className="font-medium">
                    {product.name} <span className="text-xs opacity-60">₱{product.price}</span>
                  </p>
                  <p className="text-xs opacity-60">{product.isActive ? "Active" : "Hidden"}</p>
                </div>
              </div>
              <form
                action={async () => {
                  "use server"
                  await toggleProductActive(product.id, !product.isActive)
                }}
              >
                <button className="text-sm rounded-full border px-4 py-2">
                  {product.isActive ? "Hide" : "Unhide"}
                </button>
              </form>
            </li>
          ))}
        </ul>
        </div>
      </section>

      <section>
        <h2 className="font-semibold mb-3">Pending Orders</h2>
        {pendingOrders.length === 0 ? (
          <p className="text-sm opacity-60">Nothing pending review.</p>
        ) : (
          <ul className="grid sm:grid-cols-2 gap-4">
            {pendingOrders.map((order) => (
              <li key={order.id} className="border rounded-lg p-4 flex gap-4">
                <a href={order.proofImageURL} target="_blank" rel="noopener noreferrer" className="shrink-0">
                  <Image
                    src={order.proofImageURL}
                    alt="Payment proof"
                    width={80}
                    height={80}
                    className="rounded object-cover"
                    unoptimized
                  />
                </a>
                <div className="flex-1">
                  <p className="font-medium">
                    {order.productName} {order.variant && `(${order.variant})`} × {order.quantity}
                  </p>
                  <p className="text-sm opacity-70">
                    {order.buyerName} · {order.buyerContact}
                  </p>
                  <p className="text-sm opacity-70">₱{order.totalAmount}</p>
                  <div className="flex gap-2 mt-2">
                    <form
                      action={async () => {
                        "use server"
                        await setOrderStatus(order.id, "approved")
                      }}
                    >
                      <button className="text-sm rounded-full bg-foreground text-background px-4 py-2">
                        Approve
                      </button>
                    </form>
                    <form
                      action={async () => {
                        "use server"
                        await setOrderStatus(order.id, "rejected")
                      }}
                    >
                      <button className="text-sm rounded-full border px-4 py-2">Reject</button>
                    </form>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
