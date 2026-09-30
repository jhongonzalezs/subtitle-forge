import { pipeline } from '@huggingface/transformers';

let translatorPipeline = null;

async function getTranslator() {
  if (!translatorPipeline) {
    console.log('[translator] Cargando modelo Opus-MT EN→ES (primera vez puede tardar)…');
    translatorPipeline = await pipeline(
      'translation',
      'Xenova/opus-mt-en-es',
      { dtype: 'q8' },
    );
    console.log('[translator] Modelo cargado ✅');
  }
  return translatorPipeline;
}

export async function translateSegments(segments, targetLang, sourceLang = 'en') {
  if (!segments.length) return segments;
  if (!targetLang || targetLang === 'original') return segments;
  if (targetLang === sourceLang) return segments;

  if (targetLang === 'es') {
    console.log(`[translator] Traduciendo ${segments.length} segmentos EN → ES…`);
    const translator = await getTranslator();
    const result = [];

    for (const seg of segments) {
      try {
        const output = await translator(seg.text, {
          max_new_tokens: 256,
          do_sample: false,
        });
        const translated = output?.[0]?.translation_text || seg.text;
        result.push({ ...seg, text: translated.trim() });
      } catch (err) {
        console.warn(`[translator] Error: ${err.message}. Usando original.`);
        result.push(seg);
      }
    }

    return result;
  }

  return segments;
}