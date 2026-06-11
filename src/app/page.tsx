import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (session?.user) redirect("/dashboard");

  return (
    <main className="min-h-screen bg-white font-sans">
      {/* Nav */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center text-white text-xs font-bold"
              style={{ background: "#0050C3" }}
            >
              N
            </div>
            <span className="text-sm font-semibold text-gray-900">Nuvemshop</span>
            <span className="text-gray-300 text-sm">&#183;</span>
            <span className="text-sm text-gray-500">Portal de Afiliados</span>
          </div>
          <Link
            href="/login"
            className="text-sm font-medium text-white px-4 py-1.5 rounded-md transition-colors"
            style={{ background: "#0050C3" }}
          >
            Entrar
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #EEF4FF 0%, #DBEAFE 50%, #EEF4FF 100%)",
        }}
      >
        <div className="relative max-w-3xl mx-auto px-6 py-28 text-center">
          <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
            Seu painel de{" "}
            <span style={{ color: "#0050C3" }}>resultados Nuvemshop</span>
          </h1>
          <p className="text-lg text-gray-500 mb-10 max-w-lg mx-auto leading-relaxed">
            Acompanhe sess&#xf5;es, trials, pagamentos e vendedores do seu link de afiliado em tempo real.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-white font-semibold px-8 py-3.5 rounded-xl text-sm shadow-lg transition-all hover:shadow-xl"
            style={{ background: "#0050C3" }}
          >
            Acessar meu painel
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Metrics */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <p className="text-center text-sm font-medium text-gray-400 mb-12 uppercase tracking-widest">
          O que voc&#xea; acompanha
        </p>
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
          {[
            { label: "Sess&#xf5;es", desc: "Visitas geradas pelo seu link" },
            { label: "Trials", desc: "Períodos de teste iniciados" },
            { label: "Pagamentos", desc: "Novas assinaturas pagas" },
            { label: "Vendedores", desc: "Lojas ativas referenciadas" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 text-xl"
                style={{ background: "rgba(0,80,195,0.08)" }}
              >
                &#128202;
              </div>
              <p
                className="font-semibold text-gray-900 mb-1"
                dangerouslySetInnerHTML={{ __html: item.label }}
              />
              <p className="text-sm text-gray-500 leading-snug">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA strip */}
      <section
        className="mx-6 mb-20 rounded-3xl overflow-hidden"
        style={{ background: "#0050C3" }}
      >
        <div className="max-w-2xl mx-auto px-8 py-14 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">
            Pronto para ver seus n&#xfa;meros?
          </h2>
          <p className="text-blue-200 text-sm mb-8">
            Acesse agora com suas credenciais de afiliado Nuvemshop.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-white font-semibold px-7 py-3 rounded-xl text-sm shadow transition-all hover:shadow-lg"
            style={{ color: "#0050C3" }}
          >
            Fazer login
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between text-xs text-gray-400">
          <span>&#169; {new Date().getFullYear()} Nuvemshop. Portal exclusivo para afiliados.</span>
          <span>Acesso restrito</span>
        </div>
      </footer>
    </main>
  );
        }
