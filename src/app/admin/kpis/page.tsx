import { requireRole } from "@/lib/dal"
import { adminDb } from "@/lib/firebase/admin"
import { TERM_MANAGERS, type OrgKpiRecord } from "@/lib/types"
import { EmptyState } from "@/components/empty-state"
import { createKpi, updateKpi, deleteKpi } from "./actions"

async function getKpis(): Promise<OrgKpiRecord[]> {
  const snapshot = await adminDb.collection("orgKpis").get()
  return snapshot.docs.map((doc) => ({ id: doc.id, label: doc.data().label, value: doc.data().value }))
}

export default async function AdminKpisPage() {
  await requireRole(TERM_MANAGERS)
  const kpis = await getKpis()

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">Org KPIs</h1>
      <p className="text-sm opacity-70 mb-6">
        Shown as the stat tiles at the top of every member&apos;s dashboard.
      </p>

      <div className="grid lg:grid-cols-[320px_1fr] gap-10">
        <form action={createKpi} className="flex flex-col gap-2">
          <input name="label" placeholder="Label, e.g. Total Members" required className="border rounded px-3 py-2" />
          <input name="value" placeholder="Value, e.g. 42" required className="border rounded px-3 py-2" />
          <button className="rounded-full bg-gdg-blue text-white px-5 py-2 font-medium self-start">
            Add KPI
          </button>
        </form>

        {kpis.length === 0 ? (
          <EmptyState
            title="No KPIs yet"
            description="Add one on the left — it'll show up as a stat tile at the top of every member's dashboard."
          />
        ) : (
          <ul className="grid sm:grid-cols-2 gap-3 content-start">
            {kpis.map((kpi) => (
              <li key={kpi.id} className="border rounded-lg p-4">
                <form
                  action={async (formData: FormData) => {
                    "use server"
                    await updateKpi(
                      kpi.id,
                      String(formData.get("label") ?? ""),
                      String(formData.get("value") ?? "")
                    )
                  }}
                  className="flex flex-col gap-2"
                >
                  <input name="label" defaultValue={kpi.label} className="border rounded px-2 py-1 text-sm" />
                  <input name="value" defaultValue={kpi.value} className="border rounded px-2 py-1 text-sm" />
                  <div className="flex gap-2">
                    <button className="text-xs rounded-full bg-gdg-blue text-white px-3 py-1.5">
                      Save
                    </button>
                  </div>
                </form>
                <form
                  action={async () => {
                    "use server"
                    await deleteKpi(kpi.id)
                  }}
                  className="mt-2"
                >
                  <button className="text-xs rounded-full border-2 border-gdg-red text-gdg-red px-3 py-1.5">
                    Delete
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
