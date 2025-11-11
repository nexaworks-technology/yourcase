const { GoogleGenerativeAI } = require('@google/generative-ai')

let instance

class GeminiService {
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables')
    }

    this.client = new GoogleGenerativeAI(apiKey)
    this.defaultModel = resolveModel(process.env.GEMINI_MODEL) || 'gemini-2.5-flash'
    this.modelName = this.defaultModel
    this.generationConfig = {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    }
  }

  static getInstance() {
    if (!instance) {
      instance = new GeminiService()
    }
    return instance
  }

  countTokens(text = '') {
    if (!text) return 0
    return Math.ceil(text.length / 4)
  }

  async generateResponse(prompt, options = {}) {
    try {
      const { model: overrideModel, ...cfgOverrides } = options || {}
      const generationConfig = { ...this.generationConfig, ...cfgOverrides }

      const tried = new Set()
      const candidates = [
        resolveModel(overrideModel),
        this.defaultModel,
        ...FALLBACK_MODELS,
      ].filter(Boolean)

      let lastError
      for (const candidate of candidates) {
        if (tried.has(candidate)) continue
        tried.add(candidate)
        try {
          const model = this.getModel(candidate)
          const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig,
          })
          const responseText = result?.response?.text?.() || ''
          const tokensUsed = this.countTokens(prompt) + this.countTokens(responseText)
          return { content: responseText, tokensUsed, model: candidate }
        } catch (err) {
          lastError = err
          if (!(err && (err.status === 404 || err.status === 400))) {
            break
          }
          // otherwise try next candidate
        }
      }

      if (lastError) throw lastError
      throw new Error('Failed to generate AI response')
    } catch (error) {
      console.error('Gemini generateResponse error:', error)
      throw new Error('Failed to generate AI response')
    }
  }

  async analyzeDocument(text, analysisType = 'contract') {
    try {
      const prompts = {
        contract: `You are a legal AI assistant analyzing a contract. Given the following document text, extract:
- Parties involved
- Key clauses (with titles and summaries)
- Potential risks or red flags
- Actionable recommendations

Return a JSON object with keys: parties (array), clauses (array of objects with title & summary), risks (array), recommendations (array), summary.

Document text:\n${text}`,
        'case-law': `You are a legal AI assistant analyzing a case law document. Given the text, extract:
- Factual background
- Key legal issues
- Court's judgment/holding
- Notable precedents cited
- Implications for practitioners

Return a JSON object with keys: facts, legalIssues, judgment, precedents (array), recommendations, summary.

Document text:\n${text}`,
      }

      const prompt = prompts[analysisType] || `Analyze the following legal document and provide a structured summary with key points, risks, and recommendations in JSON format.\n\n${text}`

      const response = await this.generateResponse(prompt, { maxOutputTokens: 3072 })

      let analysis
      try {
        analysis = JSON.parse(response.content)
      } catch (parseError) {
        analysis = { summary: response.content }
      }

      analysis.analyzedAt = new Date()
      analysis.tokensUsed = response.tokensUsed
      analysis.model = response.model
      return analysis
    } catch (error) {
      console.error('Gemini analyzeDocument error:', error)
      throw new Error('Failed to analyze document')
    }
  }

  async generateWithContext(prompt, context = {}) {
    try {
      const contextStrings = []

      if (context.previousQueries && context.previousQueries.length) {
        const mapped = context.previousQueries
          .slice(-5)
          .map((q) => `Q: ${q.prompt}\nA: ${q.response}`)
        contextStrings.push('Recent conversation history:\n' + mapped.join('\n'))
      }

      if (context.documents && context.documents.length) {
        const docs = context.documents.map((doc) => `• ${doc.title || doc.fileName}`)
        contextStrings.push('Relevant documents:\n' + docs.join('\n'))
      }

      if (context.additionalNotes) {
        contextStrings.push('Additional context:\n' + context.additionalNotes)
      }

      const enrichedPrompt = `${contextStrings.join('\n\n')}\n\nUser request:\n${prompt}`.trim()
      const { model: overrideModel, ...cfgOverrides } = context.options || {}
      return this.generateResponse(enrichedPrompt, { ...cfgOverrides, model: overrideModel })
    } catch (error) {
      console.error('Gemini generateWithContext error:', error)
      throw new Error('Failed to generate response with context')
    }
  }

  async *streamResponse(prompt) {
    try {
      const streamResult = await this.getModel().generateContentStream({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: this.generationConfig,
      })

      for await (const chunk of streamResult.stream) {
        const text = chunk?.text?.()
        if (text) {
          yield text
        }
      }
    } catch (error) {
      console.error('Gemini streamResponse error:', error)
      throw new Error('Failed to stream AI response')
    }
  }
}

const MODEL_MAP = new Map([
  ['gemini-1.5-flash'],
])

const FALLBACK_MODELS = [
  'gemini-2.5-flash',
]

function resolveModel(name) {
  if (!name) return ''
  const cleaned = String(name).replace(/^models\//, '')
  return MODEL_MAP.get(cleaned) || ''
}

GeminiService.prototype.getModel = function getModel(overrideModel) {
  const resolved = resolveModel(overrideModel) || this.defaultModel
  return this.client.getGenerativeModel({ model: resolved })
}

module.exports = GeminiService.getInstance()
