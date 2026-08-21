import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiDataService } from './ai.data.service';
import { AI_TOOLS, HerramientaArgs, ejecutarHerramienta } from './ai.tools';
import { ChatMessageDto } from './ai.dto';

const MODELO_POR_DEFECTO = 'gemini-3.6-flash';
const MODELOS_FALLBACK = ['gemini-3.5-flash', 'gemini-3.5-flash-lite'];
const MAX_ITERACIONES = 6;
const MAX_HISTORIAL = 20;
const REINTENTOS_MAXIMOS = 2;
const ESPERA_BASE_MS = 1000;
const TIEMPO_FETCH_MS = 60000;
const URL_BASE = 'https://generativelanguage.googleapis.com/v1beta';

class QuotaError extends Error {}

class OverloadError extends Error {}

interface GeminiFunctionCall {
  name: string;
  args?: HerramientaArgs;
  id?: string;
}

interface GeminiPart {
  text?: string;
  functionCall?: GeminiFunctionCall;
  functionResponse?: { name: string; response: unknown };
  thoughtSignature?: string;
}

interface GeminiContent {
  role: string;
  parts: GeminiPart[];
}

interface GeminiResponse {
  candidates?: Array<{
    content?: { parts?: GeminiPart[] };
  }>;
}

const SYSTEM_PROMPT = `
Sos el asistente virtual de Stock Cialco, una aplicación de gestión de stock de genética bovina (pajuelas de semen congeladas guardadas en termos criogénicos con canastillos).

Tenés acceso a los datos del sistema mediante herramientas de lectura y escritura, y a un manual de uso de la aplicación.

Reglas generales:
- Respondé siempre en español, de forma clara, concisa y profesional.
- Si la pregunta es sobre datos (stock, toros, colectas, termos, clientes, movimientos, remitos, historial), usá las herramientas de datos correspondientes y basá tu respuesta únicamente en la información que devuelven.
- Si la pregunta es "cómo hago X" o sobre cómo usar la aplicación, usá la herramienta manual_de_uso y guiate por los pasos que devuelve.
- Nunca inventes datos, números ni nombres que no aparezcan en los resultados de las herramientas. Si no hay información suficiente, decilo con honestidad.
- Si la consulta menciona un nombre que podría ser un toro o un cliente (por ejemplo, un establecimiento, campo o negocio), buscá en AMBOS: usá listar_colectas con el filtro de toro y también con el de cliente, o listar_clientes para confirmar a quién pertenece el nombre.
- Si no sabés qué herramienta usar o el dato no existe, pedí aclaración o respondé con lo que sepas, sin inventar.
- Usá fechas en formato dd/mm/aaaa en tus respuestas.
- Cuando el resultado tenga varios elementos, resumí de forma ordenada (listas cortas o tablas simples). Si hay más de 10 resultados, resumí con cantidades y tendencias, y listá solo los 5 más relevantes. No listes todos los registros uno por uno.
- Si no hay clave de IA configurada o el servicio falla, lo comunica el sistema; vos solo respondés consultas válidas.

Reglas de escritura (crear_toro, crear_cliente, crear_termo):
- Antes de ejecutar cualquier tool de creación, resumí los datos que vas a registrar y pedí confirmación explícita al usuario (por ejemplo: "¿Creo el toro Indomable con raza AA?").
- Solo ejecutá la tool después de que el usuario diga sí, confirmo, dale, o una expresión equivalente de aprobación.
- Si el usuario se niega o pide cambios, ajustá los datos sin ejecutar la tool.
- Después de crear exitosamente, confirmá qué se registró con los datos devueltos por la tool.
- Si la tool devuelve un error (por ejemplo, CUIT duplicado), informalo al usuario y sugerí una corrección.
`.trim();

export interface ChatRespuesta {
  reply: string;
  display?: string;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly apiKeys: string[];
  private readonly modelos: string[];
  private readonly anonymize: boolean;
  private keyCursor = 0;

  constructor(
    configService: ConfigService,
    private readonly dataService: AiDataService,
  ) {
    const lista = configService.get<string>('AI_API_KEYS')?.split(',') ?? [];
    const clavesLista = lista.map((c) => c.trim()).filter((c) => c.length > 0);
    const claveLegacy = configService.get<string>('AI_API_KEY')?.trim();
    this.apiKeys = claveLegacy ? [...clavesLista, claveLegacy] : clavesLista;
    const modelosLista = (configService.get<string>('AI_MODELS') ?? '')
      .split(',')
      .map((m) => m.trim())
      .filter((m) => m.length > 0);
    const modeloLegacy =
      configService.get<string>('AI_MODEL')?.trim() || MODELO_POR_DEFECTO;
    const cadena =
      modelosLista.length > 0
        ? modelosLista
        : [modeloLegacy, ...MODELOS_FALLBACK];
    this.modelos = [...new Set(cadena)];
    this.anonymize = configService.get<string>('AI_ANONYMIZE') === 'true';
  }

  async chat(messages: ChatMessageDto[]): Promise<ChatRespuesta> {
    if (this.apiKeys.length === 0) {
      return {
        reply:
          'El asistente todavía no está configurado. Pedile al administrador que agregue una clave de Gemini (AI_API_KEYS) en el backend.',
      };
    }

    const contents = this.construirContenidos(messages);
    const inicio = this.keyCursor % this.apiKeys.length;
    let huboQuota = false;

    for (const modelo of this.modelos) {
      for (let i = 0; i < this.apiKeys.length; i++) {
        const apiKey = this.apiKeys[(inicio + i) % this.apiKeys.length];
        try {
          const reply = await this.responderConReintentos(
            contents,
            apiKey,
            modelo,
          );
          this.keyCursor = (inicio + i + 1) % this.apiKeys.length;
          if (this.anonymize) {
            return { reply, display: await this.desanonimizar(reply) };
          }
          return { reply };
        } catch (error: unknown) {
          if (error instanceof QuotaError) {
            huboQuota = true;
            this.logger.warn(
              `Cuota agotada con una de las claves de Gemini (${i + 1}/${this.apiKeys.length}). Probando la siguiente…`,
            );
            continue;
          }
          if (error instanceof OverloadError) {
            this.logger.warn(
              `El modelo ${modelo} está saturado. Probando el siguiente…`,
            );
            break;
          }
          const mensaje =
            error instanceof Error ? error.message : String(error);
          this.logger.error(`Error en el asistente de IA: ${mensaje}`);
          return {
            reply:
              'Ups, hubo un problema al procesar la consulta. Intentá de nuevo en unos segundos.',
          };
        }
      }
    }

    if (huboQuota) {
      return {
        reply:
          'Se agotó el límite diario del asistente. Probá de nuevo más tarde o pedile al administrador que agregue más claves de Gemini.',
      };
    }
    return {
      reply:
        'Hay mucha demanda en el asistente en este momento. Probá de nuevo en unos minutos.',
    };
  }

  async *chatStream(messages: ChatMessageDto[]): AsyncGenerator<{
    type: string;
    text?: string;
    name?: string;
    message?: string;
  }> {
    if (this.apiKeys.length === 0) {
      yield {
        type: 'text',
        text: 'El asistente todavía no está configurado.',
      };
      return;
    }

    const contents = this.construirContenidos(messages);
    const inicio = this.keyCursor % this.apiKeys.length;

    for (const modelo of this.modelos) {
      for (let i = 0; i < this.apiKeys.length; i++) {
        const apiKey = this.apiKeys[(inicio + i) % this.apiKeys.length];
        try {
          yield* this.responderStream(contents, 0, apiKey, modelo);
          this.keyCursor = (inicio + i + 1) % this.apiKeys.length;
          return;
        } catch (error: unknown) {
          if (error instanceof QuotaError) {
            this.logger.warn(
              `Cuota agotada con una de las claves de Gemini (${i + 1}/${this.apiKeys.length}). Probando la siguiente…`,
            );
            continue;
          }
          if (error instanceof OverloadError) {
            this.logger.warn(
              `El modelo ${modelo} está saturado. Probando el siguiente…`,
            );
            break;
          }
          const mensaje =
            error instanceof Error ? error.message : String(error);
          this.logger.error(`Error en el asistente de IA: ${mensaje}`);
          yield {
            type: 'text',
            text: 'Ups, hubo un problema al procesar la consulta. Intentá de nuevo en unos segundos.',
          };
          return;
        }
      }
    }

    yield {
      type: 'text',
      text: 'Hay mucha demanda en el asistente en este momento. Probá de nuevo en unos minutos.',
    };
  }

  private async *responderStream(
    contents: GeminiContent[],
    iteracion: number,
    apiKey: string,
    modelo: string,
  ): AsyncGenerator<{ type: string; text?: string; name?: string }> {
    if (iteracion >= MAX_ITERACIONES) {
      yield {
        type: 'text',
        text: 'No pude completar la consulta con los datos disponibles. Probá con una pregunta más específica.',
      };
      return;
    }

    const cuerpo = {
      contents,
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      tools: AI_TOOLS,
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 2048,
      },
    };

    const res = await fetch(
      `${URL_BASE}/models/${modelo}:streamGenerateContent?alt=sse&key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cuerpo),
        signal: AbortSignal.timeout(TIEMPO_FETCH_MS),
      },
    );

    if (!res.ok) {
      const texto = await res.text();
      if (res.status === 429) {
        throw new QuotaError(`Cuota agotada: ${res.status}`);
      }
      if (res.status >= 500) {
        throw new OverloadError(`Gemini respondió ${res.status}: ${texto}`);
      }
      throw new Error(`Gemini respondió ${res.status}: ${texto}`);
    }

    if (!res.body) {
      throw new Error('Gemini no devolvió un stream');
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    const partesTool: GeminiPart[] = [];
    let textoAcumulado = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lineas = buffer.split('\n');
        buffer = lineas.pop() ?? '';

        for (const linea of lineas) {
          if (!linea.startsWith('data: ')) continue;
          const jsonStr = linea.slice(6).trim();
          if (!jsonStr || jsonStr === '[DONE]') continue;

          try {
            const data = JSON.parse(jsonStr) as GeminiResponse;
            const parts = data?.candidates?.[0]?.content?.parts ?? [];
            for (const part of parts) {
              if (part.text) {
                textoAcumulado += part.text;
                yield { type: 'text', text: part.text };
              }
              if (part.functionCall) {
                partesTool.push(part);
              }
            }
          } catch {
            // chunk incompleto, ignorar
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    if (partesTool.length > 0) {
      const siguientes: GeminiContent[] = [
        ...contents,
        { role: 'model', parts: partesTool },
      ];
      for (const part of partesTool) {
        yield { type: 'tool', name: part.functionCall!.name };
      }
      const resultados = await Promise.all(
        partesTool.map((part) =>
          ejecutarHerramienta(
            part.functionCall!.name,
            part.functionCall!.args ?? {},
            this.dataService,
            this.anonymize,
          ).catch((error: unknown) => {
            const mensaje =
              error instanceof Error ? error.message : String(error);
            return { error: `No se pudo ejecutar la consulta: ${mensaje}` };
          }),
        ),
      );
      for (let i = 0; i < partesTool.length; i++) {
        siguientes.push({
          role: 'user',
          parts: [
            {
              functionResponse: {
                name: partesTool[i].functionCall!.name,
                response: { data: resultados[i] },
              },
            },
          ],
        });
      }

      yield* this.responderStream(siguientes, iteracion + 1, apiKey, modelo);
      return;
    }

    if (!textoAcumulado) {
      yield { type: 'text', text: 'No pude generar una respuesta.' };
    }
  }

  private construirContenidos(messages: ChatMessageDto[]): GeminiContent[] {
    const recientes = messages.slice(-MAX_HISTORIAL);
    return recientes.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));
  }

  private async responderConReintentos(
    contents: GeminiContent[],
    apiKey: string,
    modelo: string,
  ): Promise<string> {
    let ultimoError: Error | undefined;
    for (let intento = 0; intento <= REINTENTOS_MAXIMOS; intento++) {
      try {
        return await this.responder(contents, 0, apiKey, modelo);
      } catch (error: unknown) {
        if (error instanceof QuotaError) {
          throw error;
        }
        if (error instanceof OverloadError) {
          throw error;
        }
        if (!(error instanceof TypeError) && !this.esErrorDeTiempo(error)) {
          throw error;
        }
        ultimoError = error as Error;
        if (intento < REINTENTOS_MAXIMOS) {
          await this.esperar(ESPERA_BASE_MS * (intento + 1));
        }
      }
    }
    throw ultimoError ?? new Error('Error transitorio del asistente');
  }

  private esperar(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private esErrorDeTiempo(error: unknown): boolean {
    return (
      error instanceof Error &&
      (error.name === 'TimeoutError' || error.name === 'AbortError')
    );
  }

  private async desanonimizar(texto: string): Promise<string> {
    const ids = Array.from(texto.matchAll(/Cliente #([0-9a-fA-F-]{8,})/g)).map(
      (m) => m[1],
    );
    if (ids.length === 0) return texto;
    const nombres = await this.dataService.razonSocialPorIds(ids);
    return texto.replace(
      /Cliente #([0-9a-fA-F-]{8,})/g,
      (match, id: string) => nombres.get(id) ?? match,
    );
  }

  private async responder(
    contents: GeminiContent[],
    iteracion: number,
    apiKey: string,
    modelo: string,
  ): Promise<string> {
    if (iteracion >= MAX_ITERACIONES) {
      return 'No pude completar la consulta con los datos disponibles. Probá con una pregunta más específica.';
    }

    const cuerpo = {
      contents,
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      tools: AI_TOOLS,
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 2048,
      },
    };

    const res = await fetch(
      `${URL_BASE}/models/${modelo}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cuerpo),
        signal: AbortSignal.timeout(TIEMPO_FETCH_MS),
      },
    );

    if (!res.ok) {
      const texto = await res.text();
      if (res.status === 429) {
        throw new QuotaError(`Cuota agotada: ${res.status}`);
      }
      if (res.status >= 500) {
        throw new OverloadError(`Gemini respondió ${res.status}: ${texto}`);
      }
      throw new Error(`Gemini respondió ${res.status}: ${texto}`);
    }

    const data = (await res.json()) as GeminiResponse;
    const candidato = data?.candidates?.[0];
    const parts: GeminiPart[] = candidato?.content?.parts ?? [];

    const llamadas = parts.filter((p) => p.functionCall);
    if (llamadas.length > 0) {
      const siguientes: GeminiContent[] = [
        ...contents,
        { role: 'model', parts: llamadas },
      ];
      const resultados = await Promise.all(
        llamadas.map(async (p) => {
          const { name, args } = p.functionCall as GeminiFunctionCall;
          try {
            return await ejecutarHerramienta(
              name,
              args ?? {},
              this.dataService,
              this.anonymize,
            );
          } catch (error: unknown) {
            const mensaje =
              error instanceof Error ? error.message : String(error);
            return { error: `No se pudo ejecutar la consulta: ${mensaje}` };
          }
        }),
      );
      for (let i = 0; i < llamadas.length; i++) {
        siguientes.push({
          role: 'user',
          parts: [
            {
              functionResponse: {
                name: llamadas[i].functionCall!.name,
                response: { data: resultados[i] },
              },
            },
          ],
        });
      }

      return this.responder(siguientes, iteracion + 1, apiKey, modelo);
    }

    const texto = parts
      .map((p) => p.text ?? '')
      .join('')
      .trim();
    return texto || 'No pude generar una respuesta.';
  }
}
