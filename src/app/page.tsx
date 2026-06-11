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
                                            </div>div>
                                            <span className="text-sm font-semibold text-gray-900">Nuvemshop</span>span>
                                            <span className="text-gray-300 text-sm">&middot;</span>span>
                                            <span className="text-sm text-gray-500">Portal de Afiliados</span>span>
                                </div>div>
                                <Link
                                              href="/login"
                                              className="text-sm font-medium text-white px-4 py-1.5 rounded-md transition-colors"
                                              style={{ background: "#0050C3" }}
                                            >
                                            Entrar
                                </Link>Link>
                      </div>div>
              </nav>nav>
        
          {/* Hero */}
              <section
                        className="relative overflow-hidden"
                        style={{
                                    background: "linear-gradient(135deg, #EEF4FF 0%, #DBEAFE 50%, #EEF4FF 100%)",
                        }}
                      >
                      <div
                                  className="absolute inset-0 opacity-40"
                                  style={{
                                                backgroundImage:
                                                                "linear-gradient(rgba(0,80,195,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(0,80,195,0.07) 1px, transparent 1px)",
                                                backgroundSize: "40px 40px",
                                  }}
                                />
                      <div className="relative max-w-3xl mx-auto px-6 py-28 text-center">
                                <div
                                              className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full mb-8 border"
                                              style={{
                                                              background: "rgba(0,80,195,0.08)",
                                                              borderColor: "rgba(0,80,195,0.2)",
                                                              color: "#0050C3",
                                              }}
                                            >
                                            <span
                                                            className="w-1.5 h-1.5 rounded-full animate-pulse"
                                                            style={{ background: "#0050C3" }}
                                                          />
                                            Dados atualizados semanalmente
                                </div>div>
                  <h1 className="text-5xl font-extrabold text-gray-900 leading-tight mb-5 tracking-tight">
                              Seus resultados,<br />em um{" "}
                              <span style={{ color: "#0050C3" }}>s&#xf3; lugar</span>span>
                  </h1>h1>
                                <p className="text-xl text-gray-500 mb-10 max-w-xl mx-auto leading-relaxed">
                                            Acompanhe o desempenho do seu neg&#xf3;cio de afiliado com
                                            m&#xe9;tricas claras e dados sempre atualizados.
                                </p>p>
                                <Link
                                              href="/login"
                                              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-white text-base font-semibold shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
                                              style={{ background: "#0050C3" }}
                                            >
                                            Acessar meu dashboard
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>svg>
                                </Link>Link>
                      </div>div>
              </section>section>
        
          {/* Metrics */}
              <section className="max-w-5xl mx-auto px-6 py-20">
                      <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-8 text-center">
                                M&#xe9;tricas acompanhadas
                      </p>p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
          { label: "Sess&#xf5;es", desc: "Visitas geradas pelo seu link", color: "#0050C3", bg: "#EEF4FF" },
          { label: "Trials", desc: "Novos trials iniciados", color: "#0284C7", bg: "#E0F2FE" },
          { label: "New Payments", desc: "Convers&#xf5;es para planos pagos", color: "#059669", bg: "#ECFDF5" },
          { label: "New Sellers", desc: "Vendedores ativados", color: "#D97706", bg: "#FFFBEB" },
                    ].map((m) => (
                                  <div key={m.label} className="rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow bg-white">
                                                <div className="w-10 h-10 rounded-xl mb-4" style={{ background: m.bg }} />
                                                <p className="font-bold text-sm mb-1" dangerouslySetInnerHTML={{ __html: m.label }} />
                                                <p className="text-xs text-gray-400" dangerouslySetInnerHTML={{ __html: m.desc }} />
                                  </div>div>
                                ))}
                      </div>div>
              </section>section>
        
          {/* Footer */}
              <footer className="border-t border-gray-100">
                      <div className="max-w-5xl mx-auhto px-6 py-6 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 rounded flex items-center justify-center text-white text-xs font-bold" style={{ background: "#0050C3" }}>N</div>div>
                                            <span className="text-xs text-gray-400">Nuvemshop &copy; {new Date().getFullYear()}</span>span>
                                </div>div>
                                <p className="text-xs text-gray-400">Portal exclusivo para afiliados</p>p>
                      </div>div>
              </footer>footer>
        </main>main>
      );
}</main>
