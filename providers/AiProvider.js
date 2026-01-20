import Groq from 'groq-sdk/index.mjs';

export class AiProvider {
  static async generateInterests({prompt}) {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const resp = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: `
            Eres un experto periodista de actualidad al dia de todos los temas y noticias
    En base a unos intereses que te voy a dar dame temas interesantes para realizar una búsqueda en google de 
    noticias con ese parámetro.
    Antes de entregar la información busca la actualidad de ese tema para proporcionar el mejor resultado.
    Ej : Interes = UFC, Tema = NFL || kickboxing || MMA.
    Tengo este array de intereses:
    ${prompt}
    Crea un array JSON objetos con este formato:
    {
      "id": number,
      "interest": string = ${prompt},
      "theme": string
    }
    Reglas:
    - Cada interés debe tener 99% de coincidencia con el tema sugerido.
    - SOLO puedes devolver JSON dentro de <JSON> y </JSON>.
    - Prohibido usar backticks, markdown o etiquetas como json.
    - No añadas nada fuera de esas marcas.
    - Dame 4 objetos JSON por cada interés que haya.
    - Cada vez que se te pidan nuevos objetos da temas diferentes a los anteriores en los intereses actuales.
    Escribe exactamente así:
    <JSON>
    [ ... ]
    </JSON>
          `
        }
      ]
    });

    return resp.choices[0].message.content;
  }
}