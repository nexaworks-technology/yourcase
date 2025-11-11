import PropTypes from 'prop-types'
import { TrendingDown, TrendingUp, Wallet } from 'lucide-react'

import { Card } from '../ui/Card'
import { Button } from '../ui/Button'

const statConfig = [
  { key: 'estimatedValue', label: 'Estimated value', tone: 'bg-blue-50 text-blue-600', icon: Wallet },
  { key: 'feesCharged', label: 'Fees charged', tone: 'bg-emerald-50 text-emerald-600', icon: TrendingUp },
  { key: 'feesPaid', label: 'Fees paid', tone: 'bg-indigo-50 text-indigo-600', icon: TrendingUp },
  { key: 'outstanding', label: 'Outstanding', tone: 'bg-rose-50 text-rose-600', icon: TrendingDown },
]

export function FinancialSummary({ summary = {}, history = [], onAddPayment, onGenerateInvoice }) {
  const outstanding = summary.feesCharged && summary.feesPaid ? summary.feesCharged - summary.feesPaid : undefined
  const stats = statConfig.map((stat) => ({
    ...stat,
    value:
      stat.key === 'outstanding'
        ? outstanding ?? summary.outstanding
        : summary[stat.key],
  }))

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <Card variant="bordered" padding="md" className="space-y-4">
        <header className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Financial overview</h3>
            <p className="text-sm text-slate-500">Track invoices, payments, and outstanding fees.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onGenerateInvoice}>
              Generate invoice
            </Button>
            <Button variant="primary" size="sm" onClick={onAddPayment}>
              Add payment
            </Button>
          </div>
        </header>

        <div className="grid gap-3 sm:grid-cols-2">
          {stats.map((stat) => (
            <div key={stat.key} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">{stat.label}</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">
                  {stat.value != null ? `₹${Number(stat.value).toLocaleString()}` : '—'}
                </p>
              </div>
              <span className={`flex h-10 w-10 items-center justify-center rounded-full ${stat.tone}`}>
                <stat.icon className="h-5 w-5" />
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card variant="bordered" padding="md" className="space-y-3">
        <header className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Payment history</h3>
            <p className="text-xs text-slate-500">Recent invoices and receipts</p>
          </div>
        </header>
        <div className="max-h-72 overflow-y-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2 text-left">Date</th>
                <th className="px-3 py-2 text-left">Description</th>
                <th className="px-3 py-2 text-right">Amount</th>
                <th className="px-3 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-4 text-center text-slate-500">
                    No payments recorded yet.
                  </td>
                </tr>
              )}
              {history.map((entry) => (
                <tr key={entry.id}>
                  <td className="px-3 py-2 text-xs text-slate-500">{new Date(entry.date).toLocaleDateString()}</td>
                  <td className="px-3 py-2">{entry.description || 'Payment'}</td>
                  <td className="px-3 py-2 text-right font-semibold text-slate-900">₹{Number(entry.amount).toLocaleString()}</td>
                  <td className="px-3 py-2 text-xs capitalize text-slate-500">{entry.status || 'recorded'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

FinancialSummary.propTypes = {
  summary: PropTypes.object,
  history: PropTypes.array,
  onAddPayment: PropTypes.func,
  onGenerateInvoice: PropTypes.func,
}

FinancialSummary.defaultProps = {
  summary: {},
  history: [],
  onAddPayment: undefined,
  onGenerateInvoice: undefined,
}

export default FinancialSummary
