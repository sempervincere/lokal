/**
 * AI client — Groq OpenAI-compatible API.
 * Endpoint: https://api.groq.com/openai/v1/chat/completions
 * Streaming: OpenAI SSE (choices[0].delta.content)
 * Non-streaming: choices[0].message.content
 */

export interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface StreamCallbacks {
  onDelta: (text: string) => void;
  onDone: () => void;
}

const GROQ_BASE = 'https://api.groq.com/openai';
const GROQ_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';

function apiKey() {
  return process.env.GROQ_API_KEY!;
}

function headers() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey()}`,
  };
}

function model() {
  return process.env.AI_MODEL ?? GROQ_MODEL;
}

function buildMessages(systemPrompt: string, messages: AnthropicMessage[]) {
  return [{ role: 'system' as const, content: systemPrompt }, ...messages];
}

/** Non-streaming — Groq supports it natively. Used for report generation. */
export async function callAnthropicSync(
  systemPrompt: string,
  messages: AnthropicMessage[],
  maxTokens = 4000,
  temperature = 0.3,
): Promise<string> {
  const res = await fetch(`${GROQ_BASE}/v1/chat/completions`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      model: model(),
      messages: buildMessages(systemPrompt, messages),
      max_tokens: maxTokens,
      temperature,
      stream: false,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Groq API ${res.status}: ${body}`);
  }

  const json = await res.json() as { choices: Array<{ message: { content: string } }> };
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty response from Groq');
  return content;
}

/** Streaming — returns raw Response with SSE body. Caller passes to readAnthropicStream. */
export async function callAnthropicStream(
  systemPrompt: string,
  messages: AnthropicMessage[],
  maxTokens = 800,
  temperature = 0.65,
): Promise<Response> {
  const res = await fetch(`${GROQ_BASE}/v1/chat/completions`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      model: model(),
      messages: buildMessages(systemPrompt, messages),
      max_tokens: maxTokens,
      temperature,
      stream: true,
    }),
  });

  if (!res.ok || !res.body) {
    const body = await res.text().catch(() => '');
    throw new Error(`Groq API ${res.status}: ${body}`);
  }

  return res;
}

/** Parse OpenAI SSE stream from Groq. */
export async function readAnthropicStream(
  response: Response,
  callbacks: StreamCallbacks,
): Promise<string> {
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let fullText = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6).trim();
      if (data === '[DONE]') { callbacks.onDone(); continue; }

      try {
        const event = JSON.parse(data) as {
          choices?: Array<{ delta?: { content?: string }; finish_reason?: string }>;
        };
        const delta = event.choices?.[0]?.delta?.content;
        if (typeof delta === 'string' && delta) {
          fullText += delta;
          callbacks.onDelta(delta);
        }
        if (event.choices?.[0]?.finish_reason === 'stop') {
          callbacks.onDone();
        }
      } catch { /* skip malformed */ }
    }
  }

  return fullText;
}
