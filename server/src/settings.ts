import Database from 'better-sqlite3';

export type VisionProviderMode =
  | 'auto'
  | 'ocr'
  | 'gemini'
  | 'openai'
  | 'ollama';

export interface AppSettings {
  visionProvider: VisionProviderMode;
  geminiApiKey: string;
  geminiModel: string;
  openaiApiKey: string;
  openaiModel: string;
  ollamaUrl: string;
  ollamaModel: string;
  googleBooksApiKey: string;
}

const VALID_VISION_PROVIDERS = new Set<VisionProviderMode>([
  'auto',
  'ocr',
  'gemini',
  'openai',
  'ollama',
]);

export function getAppSettings(db?: Database.Database): AppSettings {
  const map = new Map<string, string>();
  if (db) {
    try {
      const rows = db
        .prepare('SELECT key, value FROM app_setting')
        .all() as Array<{ key: string; value: string }>;
      for (const r of rows) {
        map.set(r.key, r.value);
      }
    } catch {
      // ignore if table not ready
    }
  }

  const rawProvider = (map.get('visionProvider') ?? 'auto').trim() as VisionProviderMode;
  const visionProvider: VisionProviderMode = VALID_VISION_PROVIDERS.has(rawProvider)
    ? rawProvider
    : 'auto';

  const pick = (key: string, envValue?: string, fallback = ''): string => {
    if (map.has(key)) {
      return map.get(key)!.trim();
    }
    return (envValue ?? fallback).trim();
  };

  return {
    visionProvider,
    geminiApiKey: pick('geminiApiKey', process.env.GEMINI_API_KEY),
    geminiModel:
      pick('geminiModel', process.env.GEMINI_MODEL, 'gemini-2.0-flash') ||
      'gemini-2.0-flash',
    openaiApiKey: pick('openaiApiKey', process.env.OPENAI_API_KEY),
    openaiModel:
      pick('openaiModel', process.env.OPENAI_MODEL, 'gpt-4o-mini') ||
      'gpt-4o-mini',
    ollamaUrl: pick('ollamaUrl', process.env.OLLAMA_URL),
    ollamaModel:
      pick('ollamaModel', process.env.OLLAMA_MODEL, 'llava') || 'llava',
    googleBooksApiKey: pick(
      'googleBooksApiKey',
      process.env.GOOGLE_BOOKS_API_KEY,
    ),
  };
}

export function updateAppSettings(
  db: Database.Database,
  input: Partial<AppSettings>,
): AppSettings {
  const upsert = db.prepare(
    `INSERT INTO app_setting (key, value, updated_at)
     VALUES (?, ?, datetime('now'))
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`,
  );

  const tx = db.transaction(() => {
    if (input.visionProvider !== undefined) {
      const mode = String(input.visionProvider).trim() as VisionProviderMode;
      if (VALID_VISION_PROVIDERS.has(mode)) {
        upsert.run('visionProvider', mode);
      }
    }
    const keys: Array<keyof Omit<AppSettings, 'visionProvider'>> = [
      'geminiApiKey',
      'geminiModel',
      'openaiApiKey',
      'openaiModel',
      'ollamaUrl',
      'ollamaModel',
      'googleBooksApiKey',
    ];
    for (const k of keys) {
      if (input[k] !== undefined && input[k] !== null) {
        upsert.run(k, String(input[k]).trim());
      }
    }
  });

  tx();
  return getAppSettings(db);
}
