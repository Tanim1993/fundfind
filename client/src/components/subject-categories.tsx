import { useQuery } from "@tanstack/react-query";
import { Laptop, Settings, Brain, Heart, BookOpen, TrendingUp } from "lucide-react";

const subjectIcons = {
  "Computer Science": Laptop,
  "Engineering": Settings,
  "Social Sciences": Brain,
  "Health & Medicine": Heart,
  "Humanities": BookOpen,
  "Business & Economics": TrendingUp,
};

const subjectColors = {
  "Computer Science": "subject-card-cs",
  "Engineering": "subject-card-engineering",
  "Social Sciences": "subject-card-social",
  "Health & Medicine": "subject-card-health",
  "Humanities": "subject-card-humanities",
  "Business & Economics": "subject-card-business",
};

export default function SubjectCategories() {
  const { data: subjectCounts = [], isLoading } = useQuery<Array<{ subject: string; count: number }>>({
    queryKey: ['/api/subject-counts'],
  });

  const handleSubjectClick = (subject: string) => {
    // Scroll to latest opportunities and trigger filter
    const latestSection = document.getElementById('latest');
    if (latestSection) {
      latestSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // You could emit a custom event here to trigger subject filter
      const filterEvent = new CustomEvent('subjectFilter', { detail: { subject } });
      window.dispatchEvent(filterEvent);
    }
  };

  if (isLoading) {
    return (
      <section id="subjects" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Browse by Academic Subject</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-6 rounded-xl border animate-pulse">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-lg mr-4"></div>
                  <div>
                    <div className="h-5 bg-gray-300 rounded mb-2 w-32"></div>
                    <div className="h-4 bg-gray-300 rounded w-24"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-300 rounded"></div>
                  <div className="h-3 bg-gray-300 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="subjects" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Browse by Academic Subject</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjectCounts.map(({ subject, count }) => {
            const IconComponent = subjectIcons[subject as keyof typeof subjectIcons] || BookOpen;
            const colorClass = subjectColors[subject as keyof typeof subjectColors] || "bg-gray-50";
            
            return (
              <div
                key={subject}
                className={`${colorClass} p-6 rounded-xl border hover:shadow-lg transition-shadow cursor-pointer`}
                onClick={() => handleSubjectClick(subject)}
                data-testid={`subject-card-${subject.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className="flex items-center mb-4">
                  <div className="bg-primary text-white p-3 rounded-lg">
                    <IconComponent className="text-xl w-6 h-6" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">{subject}</h3>
                    <p className="text-sm text-gray-600">{count} opportunities</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">
                    Recent: Latest opportunity in {subject}
                  </div>
                  <div className="text-sm text-gray-600">
                    Deadline: Multiple opportunities expiring soon
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
