import { useQuery } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { AlertCircle, CheckCircle2, FileText, Sparkles, Upload } from 'lucide-react'
import { Skeleton } from '../ui/Skeleton'

const iconMap = {
  query: Sparkles,
  document: FileText,
  upload: Upload,
  warning: AlertCircle,
  success: CheckCircle2,
}

const fetchActivity = async () => {
  await new Promise((resolve) => setTimeout(resolve, 400))
  return [
    { id: 'a1', type: 'query', title: 'Generated compliance brief', description: 'AI assistant prepared memo for SEBI update.', timestamp: new Date().toISOString() },
    { id: 'a2', type: 'document', title: 'Uploaded contract draft', description: 'Garner uploaded Series B SPA draft.', timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
    { id: 'a3', type: 'success', title: 'Workflow executed', description: 'Due diligence workflow completed without errors.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString() },
  ]
}

export function ActivityTimeline() {
  const { data, isLoading } = useQuery({ queryKey: ['activity-timeline'], queryFn: fetchActivity })

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Activity timeline</h2>
      {isLoading ? (
        <div className="mt-6 space-y-4">
          <Skeleton variant="text" height={18} />
          <Skeleton variant="text" height={18} />
          <Skeleton variant="text" height={18} />
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {data?.map((activity, index) => {
            const Icon = iconMap[activity.type] || Sparkles
            return (
              <div key={activity.id} className="relative flex gap-4">
                <div className="flex flex-col items-center">
                  <span className="relative z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  {index !== data.length - 1 && <span className="mt-[-2px] h-full w-0.5 bg-slate-200 dark:bg-slate-700" aria-hidden="true" />}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{activity.title}</h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">{activity.description}</p>
                  <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
