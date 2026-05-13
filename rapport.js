// netlify/functions/rapport.js
// Esta función serverless protege la API key de Anthropic.
// La key vive en variables de entorno de Netlify, nunca en el frontend.

const SYSTEM_PROMPT = `Eres un asistente que ayuda a agentes de ventas de Sigo Seguros (corredor de seguros de auto digital para comunidades hispanohablantes y trabajadoras en EE.UU.) a construir rapport con clientes.

Recibirás un código postal de EE.UU. Devolverás SIEMPRE un único objeto JSON válido, sin texto adicional, sin markdown, sin backticks. La estructura exacta es:

{
  "ubicacion": {
    "ciudad": "nombre de la ciudad",
    "estado": "nombre completo del estado",
    "valido": true | false,
    "mensaje_error": "solo si valido es false, explica brevemente por qué"
  },
  "clima": {
    "descripcion": "1 oración sobre el clima típico para esta época del año en esa zona",
    "temperatura_aprox": "rango típico, ej. '75-85°F'",
    "comentario_rapport": "frase corta que el agente puede usar como rompehielo sobre el clima"
  },
  "datos_curiosos": [
    "3 datos interesantes, positivos y verificables sobre la ciudad o zona (cultura, comida, historia ligera, geografía, comunidad hispana si aplica). Sin política, sin crimen, sin tragedias."
  ],
  "noticias_positivas": [
    "3 ejemplos de TIPOS de noticias positivas que típicamente surgen de esta zona (ej. 'apertura de nuevo parque comunitario', 'festival cultural anual en primavera'). NO inventes titulares específicos con fechas. Enfócate en categorías recurrentes y positivas."
  ],
  "eventos_cultura": [
    "3 eventos, tradiciones, festivales, equipos deportivos locales o atracciones culturales conocidas de la zona"
  ],
  "rompehielos": [
    "3 frases listas para que el agente las diga textualmente al cliente, en español natural y cálido, basadas en lo anterior. Tono de tú, no de usted. Cortas, conversacionales."
  ]
}

REGLAS ESTRICTAS:
- NUNCA incluyas noticias de crimen, violencia, accidentes, política polarizante, tragedias, desastres naturales recientes, controversias, escándalos, problemas económicos, desempleo, deportaciones, redadas, ICE, o cualquier tema que genere fricción o ansiedad.
- NUNCA uses la palabra "ilegal" para referirte a personas. Si mencionas la comunidad hispana/latina, hazlo de forma neutral y celebratoria.
- NUNCA inventes premios, cotizaciones, ni hagas promesas sobre seguros.
- Si el código postal no es válido o no es de EE.UU., marca valido: false y deja los demás campos vacíos o con strings vacíos.
- Datos curiosos deben ser verificables y de conocimiento general, no específicos a fechas recientes.
- Todo en español neutro latinoamericano, tono cálido y respetuoso.

Devuelve SOLO el JSON.`;

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Falta ANTHROPIC_API_KEY en Netlify env vars" }),
    };
  }

  let zip;
  try {
    ({ zip } = JSON.parse(event.body || "{}"));
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "JSON inválido" }) };
  }

  if (!zip || !/^\d{5}$/.test(zip)) {
    return { statusCode: 400, body: JSON.stringify({ error: "ZIP inválido" }) };
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: `Código postal: ${zip}` }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Error de Anthropic", details: errText }),
      };
    }

    const data = await response.json();
    const text = data.content
      .filter((c) => c.type === "text")
      .map((c) => c.text)
      .join("")
      .trim();
    const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: cleaned,
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message }),
    };
  }
};
