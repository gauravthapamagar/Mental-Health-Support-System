import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

export default function Loading() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="border-slate-200 shadow-sm">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex flex-col items-center gap-4 lg:w-40">
                <Skeleton className="h-28 w-28 rounded-full" />
                <Skeleton className="h-20 w-20 rounded-full" />
              </div>
              <div className="flex-1 space-y-6">
                <div className="space-y-3">
                  <Skeleton className="h-7 w-64" />
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-56" />
                </div>
                <Skeleton className="h-32 w-full rounded-lg" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-8 w-24 rounded-md" />
                  <Skeleton className="h-8 w-32 rounded-md" />
                  <Skeleton className="h-8 w-28 rounded-md" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Skeleton className="h-20 rounded-lg" />
                  <Skeleton className="h-20 rounded-lg" />
                  <Skeleton className="h-20 rounded-lg" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
