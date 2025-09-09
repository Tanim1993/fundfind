import { GraduationCap, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <GraduationCap className="text-primary text-2xl" />
              <span className="text-xl font-bold text-gray-900">FundingFinder</span>
            </div>
            <nav className="hidden md:flex space-x-6">
              <button 
                onClick={() => scrollToSection('home')} 
                className="text-primary font-medium border-b-2 border-primary pb-1"
                data-testid="nav-home"
              >
                Home
              </button>
              <button 
                onClick={() => scrollToSection('latest')} 
                className="text-gray-600 hover:text-primary transition-colors"
                data-testid="nav-latest"
              >
                Latest Funding
              </button>
              <button 
                onClick={() => scrollToSection('subjects')} 
                className="text-gray-600 hover:text-primary transition-colors"
                data-testid="nav-subjects"
              >
                By Subject
              </button>
              <button 
                onClick={() => scrollToSection('subscribe')} 
                className="text-gray-600 hover:text-primary transition-colors"
                data-testid="nav-subscribe"
              >
                Subscribe
              </button>
              <button 
                onClick={() => scrollToSection('admin')} 
                className="text-gray-600 hover:text-primary transition-colors"
                data-testid="nav-admin"
              >
                Admin
              </button>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => scrollToSection('subscribe')}
              className="bg-primary text-white hover:bg-blue-700 transition-colors"
              data-testid="button-subscribe-header"
            >
              <Bell className="mr-2 h-4 w-4" />
              Subscribe
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
