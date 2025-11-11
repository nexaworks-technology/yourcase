import { useMutation, useQueryClient } from '@tanstack/react-query'
import { documentService } from '../services/documentService'

export function useDocumentAnalysis(documentId) {
  const queryClient = useQueryClient()

  const analyzeMutation = useMutation({
    mutationFn: ({ documentId: id, regenerate, question, tags }) => {
      if (question) {
        return documentService.askQuestion(id, question, tags)
      }
      return documentService.analyzeDocument(id, { regenerate })
    },
    onSuccess: (result) => {
      if (result?.analysis) {
        queryClient.invalidateQueries(['document', documentId])
      }
    },
  })

  return analyzeMutation
}

export default useDocumentAnalysis
