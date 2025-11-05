import { api } from './api'

export const billingService = {
  async getCurrentPlan() {
    return api.get('/api/billing/plan')
  },

  async getUsageMetrics() {
    return api.get('/api/billing/usage')
  },

  async getInvoices() {
    return api.get('/api/billing/invoices')
  },

  async updatePaymentMethod(data) {
    return api.put('/api/billing/payment-method', data)
  },

  async changePlan(newPlanId) {
    return api.post('/api/billing/change-plan', { planId: newPlanId })
  },

  async cancelSubscription() {
    return api.post('/api/billing/cancel')
  },
}

export default billingService
