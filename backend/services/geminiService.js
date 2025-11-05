const { GoogleGenerativeAI } = require('@google/generative-ai')

class GeminiService {
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables')
    }

    this.modelName = 'gemini-pro'
    this.client = new GoogleGenerativeAI(apiKey)
    this.model = this.client.getGenerativeModel({ model: this.modelName })
    this.generationConfig = {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    }
  }

  countTokens(text = '') {
    if (!text) return 0
    return Math.ceil(text.length / 4)
  }

  async generateResponse(prompt, options = {}) {
    try {
      const generationConfig = { ...this.generationConfig, ...options }
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig,
      })

      const responseText = result?.response?.text?.() || ''
      const tokensUsed = this.countTokens(prompt) + this.countTokens(responseText)

      return {
        content: responseText,
        tokensUsed,
        model: this.modelName,
      }
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

      return this.generateResponse(enrichedPrompt, context.options)
    } catch (error) {
      console.error('Gemini generateWithContext error:', error)
      throw new Error('Failed to generate response with context')
    }
  }

  async *streamResponse(prompt) {
    try {
      const streamResult = await this.model.generateContentStream({
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

module.exports = GeminiService
