import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (session?.user) redirect("/dashboard");

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <div style={{ background: "#EEF4FF" }} className="px-6 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ background: "#0050C3" }}
            >
              N
            </div>
            <span className="font-semibold text-gray-800">Nuvemshop</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Seus resultados, em um s\u00f3 lugar
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Acompanhe o desempenho do seu neg\u00f3cio com dados atualizados semanalmente.
          </p>
          <Link
            href="/login"
            className="inline-block px-8 py-3 rounded-lg text-white font-semibold transition-colors"
            style={{ background: "#0050C3" }}
          >
            Acessar Dashboard
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-4xl mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: "Sess\u00f5es", color: "#0050C3", desc: "Visitas geradas" },
          { label: "Trials", color: "#0284C7", desc: "Novos trials iniciados" },
          { label: "New Payments", color: "#10B981", desc: "Pagamentos convertidos" },
          { label: "New Sellers", color: "#F59E0B", desc: "Vendedores ativados" },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center">
            <div
              className="w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center"
              style={{ background: m.color + "20" }}
            >
              <div className="w-4 h-4 rounded-full" style={{ background: m.color }} />
            </div>
            <p className="font-semibold text-gray-800 text-sm">{m.label}</p>
            <p className="text-xs text-gray-500 mt-1">{m.desc}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
