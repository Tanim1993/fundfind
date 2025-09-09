import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Hero() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    // Scroll to latest opportunities section and trigger search
    const latestSection = document.getElementById('latest');
    if (latestSection) {
      latestSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // You could emit a custom event here to trigger search in LatestOpportunities component
      const searchEvent = new CustomEvent('heroSearch', { detail: { query: searchQuery } });
      window.dispatchEvent(searchEvent);
    }
  };

  return (
    <section id="home" className="hero-gradient text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Find Your Perfect Funding Opportunity
        </h1>
        <p className="text-xl mb-8 text-blue-100 max-w-3xl mx-auto">
          Discover the latest PhD and Master's funding opportunities from across the USA. 
          Our automated system scrapes and curates funding posts daily from trusted academic sources.
        </p>
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search for funding opportunities by keyword, university, or field..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 text-gray-900 rounded-lg border-0 shadow-lg focus:ring-4 focus:ring-blue-300 focus:outline-none pr-20"
              data-testid="input-hero-search"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button
              onClick={handleSearch}
              className="absolute right-2 top-2 bg-primary text-white hover:bg-blue-700 transition-colors"
              data-testid="button-hero-search"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
