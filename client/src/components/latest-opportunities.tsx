import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import OpportunityCard from "./opportunity-card";
import { ProfessorPostCard } from "./professor-post-card";
import type { FundingOpportunity } from "@shared/schema";

export default function LatestOpportunities() {
  const [filters, setFilters] = useState({
    subject: "",
    degreeLevel: "",
    search: "",
    limit: 100, // Get all data at once
    offset: 0,
  });

  const [displayLimit, setDisplayLimit] = useState(6); // How many to show

  const { data: opportunities = [], isLoading, refetch } = useQuery<FundingOpportunity[]>({
    queryKey: ['/api/funding-opportunities', filters.subject, filters.degreeLevel, filters.search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.subject) params.append('subject', filters.subject);
      if (filters.degreeLevel) params.append('degreeLevel', filters.degreeLevel);
      if (filters.search) params.append('search', filters.search);
      params.append('limit', filters.limit.toString());
      params.append('offset', filters.offset.toString());
      
      const response = await fetch(`/api/funding-opportunities?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch opportunities');
      return response.json();
    },
  });

  const displayedOpportunities = opportunities.slice(0, displayLimit);
  const hasMoreData = displayLimit < opportunities.length;

  // Listen for search events from hero component
  useEffect(() => {
    const handleHeroSearch = (event: CustomEvent) => {
      setFilters(prev => ({ ...prev, search: event.detail.query, offset: 0 }));
      setDisplayLimit(6);
    };

    window.addEventListener('heroSearch', handleHeroSearch as EventListener);
    return () => window.removeEventListener('heroSearch', handleHeroSearch as EventListener);
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, offset: 0 }));
    setDisplayLimit(6);
  };

  const loadMore = () => {
    setDisplayLimit(prev => prev + 6);
  };

  return (
    <section id="latest" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Latest Funding Opportunities</h2>
          <div className="flex space-x-4">
            <Select value={filters.subject} onValueChange={(value) => handleFilterChange('subject', value)}>
              <SelectTrigger className="w-40" data-testid="select-subject-filter">
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Subjects">All Subjects</SelectItem>
                <SelectItem value="Computer Science">Computer Science</SelectItem>
                <SelectItem value="Engineering">Engineering</SelectItem>
                <SelectItem value="Humanities">Humanities</SelectItem>
                <SelectItem value="Social Sciences">Social Sciences</SelectItem>
                <SelectItem value="Health & Medicine">Health & Medicine</SelectItem>
                <SelectItem value="Business & Economics">Business & Economics</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filters.degreeLevel} onValueChange={(value) => handleFilterChange('degreeLevel', value)}>
              <SelectTrigger className="w-40" data-testid="select-degree-filter">
                <SelectValue placeholder="All Degrees" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Degrees">All Degrees</SelectItem>
                <SelectItem value="PhD">PhD</SelectItem>
                <SelectItem value="Master's">Master's</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="h-6 bg-gray-300 rounded mb-4"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-300 rounded"></div>
                  <div className="h-3 bg-gray-300 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="space-y-6" data-testid="opportunities-grid">
              {displayedOpportunities.map((opportunity: FundingOpportunity) => {
                // Check if this is a professor social media post
                const hasSocialMediaInfo = opportunity.originalPost && opportunity.professorName && opportunity.socialPlatform;
                
                if (hasSocialMediaInfo) {
                  // Format opportunity for professor post card
                  const formattedOpportunity = {
                    ...opportunity,
                    postDate: opportunity.postDate ? 
                      (typeof opportunity.postDate === 'string' ? opportunity.postDate : opportunity.postDate.toISOString()) 
                      : null
                  };
                  return <ProfessorPostCard key={opportunity.id} post={formattedOpportunity} />;
                }
                
                return <OpportunityCard key={opportunity.id} opportunity={opportunity} />;
              })}
            </div>

            {opportunities.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No funding opportunities found matching your criteria.</p>
                <p className="text-gray-500 mt-2">Try adjusting your filters or search terms.</p>
              </div>
            )}

            {hasMoreData && (
              <div className="text-center mt-8">
                <Button
                  onClick={loadMore}
                  variant="outline"
                  className="border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors font-medium"
                  data-testid="button-load-more"
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : `Load More (${opportunities.length - displayLimit} more available)`}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
