import { pipeline, env, type FeatureExtractionPipeline } from '@huggingface/transformers'

// Allow downloading the model from Hugging Face Hub on first run
env.allowLocalModels = false

// Singleton — load the model once and reuse across requests.
// In dev, attach to global so hot reloads don't reload the model.
const P = () =>
  class PipelineSingleton {
    static instance: Promise<FeatureExtractionPipeline> | null = null
    static getInstance(): Promise<FeatureExtractionPipeline> {
      if (this.instance === null) {
        // all-MiniLM-L6-v2 → 384 dimensions, runs locally, free
        this.instance = pipeline(
          'feature-extraction',
          'Xenova/all-MiniLM-L6-v2'
        ) as Promise<FeatureExtractionPipeline>
      }
      return this.instance
    }
  }

let PipelineSingleton: ReturnType<typeof P>
declare global {
  var PipelineSingletonGlobal: ReturnType<typeof P> | undefined
}

if (process.env.NODE_ENV !== 'production') {
  if (!global.PipelineSingletonGlobal) {
    global.PipelineSingletonGlobal = P()
  }
  PipelineSingleton = global.PipelineSingletonGlobal
} else {
  PipelineSingleton = P()
}

/**
 * Generate a 384-dimensional embedding for a single text.
 */
export async function embedText(text: string): Promise<number[]> {
  const model = await PipelineSingleton.getInstance()
  const output = await model(text, { pooling: 'mean', normalize: true })
  return Array.from(output.data as Float32Array)
}

/**
 * Generate embeddings for multiple texts.
 */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  const model = await PipelineSingleton.getInstance()
  const results: number[][] = []
  for (const text of texts) {
    const output = await model(text, { pooling: 'mean', normalize: true })
    results.push(Array.from(output.data as Float32Array))
  }
  return results
}
