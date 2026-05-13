import React, { useState } from "react";
import { Search, Cloud, MapPin, Newspaper, Calendar, MessageCircle, Loader2, AlertCircle, RefreshCw } from "lucide-react";

// ───────────────────────────────────────────────────────────────
// Sigo — Asistente de Rapport para Agentes de Ventas
// El frontend llama a /.netlify/functions/rapport que protege la API key.
// ───────────────────────────────────────────────────────────────

async function fetchLocationData(zip) {
  const response = await fetch("/.netlify/functions/rapport", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ zip }),
  });
  if (!response.ok) throw new Error(`Error de API: ${response.status}`);
  return await response.json();
}

export default function RapportBuilder() {
  const [zip, setZip] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    const trimmed = zip.trim();
    if (!/^\d{5}$/.test(trimmed)) {
      setError("Ingresa un código postal válido de 5 dígitos.");
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const result = await fetchLocationData(trimmed);
      if (!result.ubicacion?.valido) {
        setError(result.ubicacion?.mensaje_error || "Código postal no encontrado.");
      } else {
        setData(result);
      }
    } catch (e) {
      setError("Hubo un problema obteniendo la información. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="min-h-screen w-full" style={{ background: "var(--bg)", color: "var(--ink)" }}>
      <style>{`
        :root {
          --bg: #F4EDE0;
          --bg-card: #FBF7EE;
          --ink: #1F2A1B;
          --ink-soft: #4A5443;
          --terracotta: #C75D3A;
          --terracotta-dark: #A24727;
          --mustard: #D9A441;
          --forest: #2D4A2B;
          --rule: #D6CBB3;
        }
        @keyframes rise {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .rise { animation: rise 0.5s ease-out both; }
        .serif { font-family: 'Fraunces', 'Playfair Display', Georgia, serif; }
        .sans { font-family: 'IBM Plex Sans', 'Helvetica Neue', system-ui, sans-serif; }
        .mono { font-family: 'IBM Plex Mono', ui-monospace, monospace; }
      `}</style>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />

      <header className="border-b sans" style={{ borderColor: "var(--rule)" }}>
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-baseline justify-between">
          <div className="flex items-baseline gap-3">
            <span className="mono text-xs tracking-widest" style={{ color: "var(--terracotta)" }}>
              Sigo Seguros
            </span>
            <span className="text-sm" style={{ color: "var(--ink-soft)" }}>
              Asistente de rapport
            </span>
          </div>
          <span className="mono text-xs" style={{ color: "var(--ink-soft)" }}>
            v1.0
          </span>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 pt-12 pb-8">
        <h1 className="serif text-5xl md:text-6xl leading-[1.05] mb-4" style={{ fontWeight: 600 }}>
          Conoce la zona del cliente y <span style={{ color: "var(--terracotta)", fontStyle: "italic" }}>crea</span> conexión.
        </h1>
        <p className="sans text-lg max-w-2xl mb-8" style={{ color: "var(--ink-soft)" }}>
          Ingresa el código postal del cliente para tener clima, datos curiosos y temas positivos
          de conversación. Solo para construir confianza — no son datos de cotización ni de cobertura.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: "var(--ink-soft)" }} />
            <input
              type="text"
              inputMode="numeric"
              maxLength={5}
              value={zip}
              onChange={(e) => setZip(e.target.value.replace(/\D/g, ""))}
              onKeyDown={handleKey}
              placeholder="Ej. 78201"
              className="sans w-full pl-12 pr-4 py-4 text-lg border focus:outline-none focus:ring-2"
              style={{ background: "var(--bg-card)", borderColor: "var(--rule)", color: "var(--ink)", borderRadius: "2px" }}
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="sans px-8 py-4 text-base font-medium transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ background: "var(--terracotta)", color: "#FBF7EE", borderRadius: "2px" }}
          >
            {loading ? (<><Loader2 className="w-4 h-4 animate-spin" /> Buscando…</>) : ("Buscar")}
          </button>
        </div>

        {error && (
          <div className="rise mt-4 flex items-start gap-2 sans text-sm" style={{ color: "var(--terracotta-dark)" }}>
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </section>

      {data && (
        <section className="max-w-6xl mx-auto px-6 pb-16">
          <div className="rise mb-10 pb-6 border-b" style={{ borderColor: "var(--rule)" }}>
            <div className="mono text-xs uppercase tracking-widest mb-2" style={{ color: "var(--ink-soft)" }}>
              <MapPin className="w-3 h-3 inline mr-1" /> {zip}
            </div>
            <h2 className="serif text-4xl" style={{ fontWeight: 600 }}>
              {data.ubicacion.ciudad}, <span style={{ color: "var(--forest)" }}>{data.ubicacion.estado}</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card icon={<Cloud className="w-5 h-5" />} label="Clima típico" accent="var(--mustard)" delay="0.05s">
              <p className="serif text-2xl mb-2" style={{ fontWeight: 600 }}>{data.clima.temperatura_aprox}</p>
              <p className="sans text-sm mb-4" style={{ color: "var(--ink-soft)" }}>{data.clima.descripcion}</p>
              <Quote text={data.clima.comentario_rapport} />
            </Card>

            <Card icon={<Calendar className="w-5 h-5" />} label="Eventos y cultura" accent="var(--forest)" delay="0.1s">
              <ul className="space-y-3 sans text-sm">
                {data.eventos_cultura?.map((e, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="mono text-xs mt-1" style={{ color: "var(--forest)" }}>{String(i + 1).padStart(2, "0")}</span>
                    <span>{e}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card icon={<MapPin className="w-5 h-5" />} label="Datos curiosos" accent="var(--terracotta)" delay="0.15s">
              <ul className="space-y-3 sans text-sm">
                {data.datos_curiosos?.map((d, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="mono text-xs mt-1" style={{ color: "var(--terracotta)" }}>{String(i + 1).padStart(2, "0")}</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card icon={<Newspaper className="w-5 h-5" />} label="Temas positivos recurrentes" accent="var(--mustard)" delay="0.2s">
              <ul className="space-y-3 sans text-sm">
                {data.noticias_positivas?.map((n, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="mono text-xs mt-1" style={{ color: "var(--mustard)" }}>✦</span>
                    <span>{n}</span>
                  </li>
                ))}
              </ul>
              <p className="sans text-xs mt-4 italic" style={{ color: "var(--ink-soft)" }}>
                Ejemplos de tipos de buenas noticias frecuentes en la zona, no titulares específicos.
              </p>
            </Card>
          </div>

          <div className="rise mt-10" style={{ animationDelay: "0.25s" }}>
            <div className="flex items-center gap-3 mb-5">
              <MessageCircle className="w-5 h-5" style={{ color: "var(--terracotta)" }} />
              <h3 className="serif text-2xl" style={{ fontWeight: 600 }}>Rompehielos listos para usar</h3>
            </div>
            <div className="space-y-3">
              {data.rompehielos?.map((r, i) => (
                <div key={i} className="p-5 border-l-4" style={{ background: "var(--bg-card)", borderLeftColor: "var(--terracotta)" }}>
                  <p className="serif text-lg italic leading-snug" style={{ color: "var(--ink)" }}>“{r}”</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 flex justify-center">
            <button
              onClick={() => { setData(null); setZip(""); }}
              className="sans text-sm flex items-center gap-2 px-4 py-2 border"
              style={{ borderColor: "var(--rule)", color: "var(--ink-soft)", background: "transparent", borderRadius: "2px" }}
            >
              <RefreshCw className="w-3.5 h-3.5" /> Otro código postal
            </button>
          </div>
        </section>
      )}

      {!data && !loading && (
        <section className="max-w-6xl mx-auto px-6 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-8 border-t" style={{ borderColor: "var(--rule)" }}>
            {[
              { icon: <Cloud className="w-5 h-5" />, title: "Clima", desc: "El clima típico para hablar del día" },
              { icon: <MapPin className="w-5 h-5" />, title: "Ciudad", desc: "Datos curiosos para conectar" },
              { icon: <Newspaper className="w-5 h-5" />, title: "Positivo", desc: "Solo temas que suman, nunca fricción" },
              { icon: <Calendar className="w-5 h-5" />, title: "Cultura", desc: "Eventos, equipos y tradiciones" },
            ].map((f, i) => (
              <div key={i} className="pt-6">
                <div style={{ color: "var(--terracotta)" }}>{f.icon}</div>
                <h4 className="serif text-lg mt-3" style={{ fontWeight: 600 }}>{f.title}</h4>
                <p className="sans text-sm mt-1" style={{ color: "var(--ink-soft)" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <footer className="border-t mt-auto sans" style={{ borderColor: "var(--rule)" }}>
        <div className="max-w-6xl mx-auto px-6 py-6 text-xs" style={{ color: "var(--ink-soft)" }}>
          Esta herramienta es solo para preparación de la conversación. No genera cotizaciones,
          no determina elegibilidad ni cobertura. Las cotizaciones están sujetas a suscripción y
          regulación estatal.
        </div>
      </footer>
    </div>
  );
}

function Card({ icon, label, accent, children, delay }) {
  return (
    <div className="rise p-6" style={{ background: "var(--bg-card)", borderTop: `3px solid ${accent}`, animationDelay: delay }}>
      <div className="flex items-center gap-2 mb-4">
        <span style={{ color: accent }}>{icon}</span>
        <span className="mono text-xs uppercase tracking-widest" style={{ color: "var(--ink-soft)" }}>{label}</span>
      </div>
      {children}
    </div>
  );
}

function Quote({ text }) {
  return (
    <div className="pt-3 border-t" style={{ borderColor: "var(--rule)" }}>
      <p className="mono text-[10px] uppercase tracking-widest mb-1" style={{ color: "var(--ink-soft)" }}>Para decir</p>
      <p className="serif text-base italic" style={{ color: "var(--ink)" }}>“{text}”</p>
    </div>
  );
}
