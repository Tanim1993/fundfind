import { useQuery } from "@tanstack/react-query";

export default function Statistics() {
  const { data: stats, isLoading } = useQuery<{
    totalOpportunities: number;
    newToday: number;
    activeSources: number;
    totalSubscribers: number;
  }>({
    queryKey: ['/api/statistics'],
  });

  if (isLoading) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center p-6 bg-gray-50 rounded-xl animate-pulse">
                <div className="h-8 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-gray-50 rounded-xl" data-testid="stat-total-opportunities">
            <div className="text-3xl font-bold text-primary">{stats?.totalOpportunities || 0}</div>
            <div className="text-gray-600 mt-2">Total Opportunities</div>
          </div>
          <div className="text-center p-6 bg-gray-50 rounded-xl" data-testid="stat-new-today">
            <div className="text-3xl font-bold text-accent">{stats?.newToday || 0}</div>
            <div className="text-gray-600 mt-2">New Today</div>
          </div>
          <div className="text-center p-6 bg-gray-50 rounded-xl" data-testid="stat-active-sources">
            <div className="text-3xl font-bold text-warning">{stats?.activeSources || 0}</div>
            <div className="text-gray-600 mt-2">Active Sources</div>
          </div>
          <div className="text-center p-6 bg-gray-50 rounded-xl" data-testid="stat-subscribers">
            <div className="text-3xl font-bold text-purple-600">{stats?.totalSubscribers || 0}</div>
            <div className="text-gray-600 mt-2">Subscribers</div>
          </div>
        </div>
      </div>
    </section>
  );
}
