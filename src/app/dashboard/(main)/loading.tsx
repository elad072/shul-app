export default function DashboardLoading() {
    return (
        <div className="space-y-6 font-sans pb-24 md:pb-10 p-4">
            {/* Hero Skeleton */}
            <div className="relative overflow-hidden rounded-3xl bg-slate-200 h-48 animate-pulse"></div>

            {/* Tabs Skeleton */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-12 w-24 bg-slate-200 rounded-xl shrink-0 animate-pulse"></div>
                ))}
            </div>

            {/* Content Skeleton */}
            <div className="space-y-4">
                <div className="h-32 bg-slate-200 rounded-3xl animate-pulse"></div>
                <div className="h-32 bg-slate-200 rounded-3xl animate-pulse"></div>
            </div>
        </div>
    );
}
