import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  FileText, 
  Send, 
  Trophy, 
  AlertCircle,
  ArrowRight,
  Target,
  BookOpen
} from "lucide-react";

interface JourneyStep {
  id: string;
  title: string;
  description: string;
  timeframe: string;
  status: 'upcoming' | 'current' | 'completed' | 'overdue';
  icon: React.ReactNode;
  tips: string[];
  requirements?: string[];
  daysFromNow?: number;
}

interface ScholarshipJourney {
  id: string;
  title: string;
  deadline: string;
  totalSteps: number;
  completedSteps: number;
  daysUntilDeadline: number;
  steps: JourneyStep[];
}

const scholarshipJourneys: ScholarshipJourney[] = [
  {
    id: "nsf-grfp",
    title: "NSF Graduate Research Fellowship",
    deadline: "October 21, 2025",
    totalSteps: 6,
    completedSteps: 2,
    daysUntilDeadline: 63,
    steps: [
      {
        id: "research",
        title: "Research Requirements",
        description: "Understand eligibility criteria and research areas",
        timeframe: "3-4 months before deadline",
        status: 'completed',
        icon: <BookOpen className="h-5 w-5" />,
        tips: [
          "Review NSF's list of eligible STEM fields",
          "Check citizenship and academic standing requirements",
          "Understand the 3-year usage window"
        ],
        daysFromNow: -30
      },
      {
        id: "references",
        title: "Secure Reference Letters",
        description: "Contact and confirm 3 reference letter writers",
        timeframe: "2-3 months before deadline",
        status: 'completed',
        icon: <FileText className="h-5 w-5" />,
        tips: [
          "Ask professors who know your research potential",
          "Provide writers with your CV and research statement",
          "Send gentle reminders 2 weeks before deadline"
        ],
        requirements: ["3 reference letters required"],
        daysFromNow: -15
      },
      {
        id: "personal-statement",
        title: "Write Personal Statement",
        description: "Draft and refine your 3-page personal statement",
        timeframe: "6-8 weeks before deadline",
        status: 'current',
        icon: <FileText className="h-5 w-5" />,
        tips: [
          "Focus on intellectual merit and broader impacts",
          "Include specific research experiences and goals",
          "Get feedback from mentors and peers",
          "Follow NSF formatting guidelines exactly"
        ],
        requirements: ["3 pages maximum", "Specific format required"],
        daysFromNow: 0
      },
      {
        id: "research-plan",
        title: "Research Plan Proposal",
        description: "Develop detailed 2-page research proposal",
        timeframe: "4-6 weeks before deadline",
        status: 'upcoming',
        icon: <Target className="h-5 w-5" />,
        tips: [
          "Align with NSF's funding priorities",
          "Include specific methodology and timeline",
          "Demonstrate feasibility and innovation",
          "Address potential challenges"
        ],
        requirements: ["2 pages maximum", "Bibliography separate"],
        daysFromNow: 14
      },
      {
        id: "application-review",
        title: "Application Review",
        description: "Final review and proofreading of all materials",
        timeframe: "1-2 weeks before deadline",
        status: 'upcoming',
        icon: <CheckCircle className="h-5 w-5" />,
        tips: [
          "Check all formatting requirements",
          "Verify reference letters are submitted",
          "Review for grammar and clarity",
          "Ensure all sections are complete"
        ],
        daysFromNow: 49
      },
      {
        id: "submission",
        title: "Submit Application",
        description: "Submit complete application through NSF portal",
        timeframe: "Deadline day",
        status: 'upcoming',
        icon: <Send className="h-5 w-5" />,
        tips: [
          "Submit at least 24 hours before deadline",
          "Keep confirmation receipt",
          "Double-check all uploaded documents",
          "Contact NSF if technical issues arise"
        ],
        daysFromNow: 63
      }
    ]
  },
  {
    id: "fulbright",
    title: "Fulbright U.S. Student Program",
    deadline: "October 7, 2025",
    totalSteps: 7,
    completedSteps: 1,
    daysUntilDeadline: 49,
    steps: [
      {
        id: "country-research",
        title: "Country & Program Research",
        description: "Research host countries and affiliate institutions",
        timeframe: "4-6 months before deadline",
        status: 'completed',
        icon: <BookOpen className="h-5 w-5" />,
        tips: [
          "Review Fulbright country profiles",
          "Research potential host institutions",
          "Understand cultural and academic context"
        ],
        daysFromNow: -60
      },
      {
        id: "language-prep",
        title: "Language Preparation",
        description: "Improve language skills if required for host country",
        timeframe: "3-6 months before deadline",
        status: 'current',
        icon: <BookOpen className="h-5 w-5" />,
        tips: [
          "Take language proficiency tests if required",
          "Practice academic vocabulary",
          "Consider online language courses"
        ],
        daysFromNow: 0
      },
      {
        id: "statement-purpose",
        title: "Statement of Purpose",
        description: "Write compelling statement of grant purpose",
        timeframe: "8-10 weeks before deadline",
        status: 'upcoming',
        icon: <Target className="h-5 w-5" />,
        tips: [
          "Clearly articulate research or study objectives",
          "Explain why this specific country/program",
          "Demonstrate cultural sensitivity and awareness"
        ],
        daysFromNow: 21
      },
      {
        id: "personal-statement-fulbright",
        title: "Personal Statement",
        description: "Draft personal statement showcasing leadership",
        timeframe: "6-8 weeks before deadline",
        status: 'upcoming',
        icon: <FileText className="h-5 w-5" />,
        tips: [
          "Highlight leadership experiences",
          "Show commitment to public service",
          "Demonstrate cross-cultural competence"
        ],
        daysFromNow: 28
      },
      {
        id: "affiliations",
        title: "Secure Affiliations",
        description: "Contact and confirm host institution partnerships",
        timeframe: "3-4 months before deadline",
        status: 'upcoming',
        icon: <FileText className="h-5 w-5" />,
        tips: [
          "Email potential advisors early",
          "Provide detailed research proposal",
          "Follow up professionally"
        ],
        daysFromNow: 35
      },
      {
        id: "recommendations-fulbright",
        title: "Recommendation Letters",
        description: "Secure 3 strong academic/professional references",
        timeframe: "2-3 months before deadline",
        status: 'upcoming',
        icon: <FileText className="h-5 w-5" />,
        tips: [
          "Choose recommenders who know your work well",
          "Provide them with detailed project description",
          "Allow plenty of time for quality letters"
        ],
        daysFromNow: 42
      },
      {
        id: "final-submission",
        title: "Application Submission",
        description: "Complete and submit final application",
        timeframe: "Deadline day",
        status: 'upcoming',
        icon: <Send className="h-5 w-5" />,
        tips: [
          "Submit early to avoid technical issues",
          "Review all documents thoroughly",
          "Keep copies of all materials"
        ],
        daysFromNow: 49
      }
    ]
  }
];

export default function ScholarshipJourney() {
  const [selectedJourney, setSelectedJourney] = useState<string>(scholarshipJourneys[0].id);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const currentJourney = scholarshipJourneys.find(j => j.id === selectedJourney)!;
  const progressPercentage = (currentJourney.completedSteps / currentJourney.totalSteps) * 100;

  // Mutation to update step progress
  const updateProgressMutation = useMutation({
    mutationFn: async ({ journeyId, stepId, status }: { journeyId: string; stepId: string; status: string }) => {
      return apiRequest(`/api/scholarship-journeys/progress`, {
        method: 'PATCH',
        body: JSON.stringify({
          journeyId,
          stepId,
          status,
          completedAt: status === 'completed' ? new Date() : undefined
        })
      });
    },
    onSuccess: () => {
      toast({
        title: "Progress Updated",
        description: "Step progress has been updated successfully."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/scholarship-journeys'] });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update step progress. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleMarkComplete = async (stepId: string) => {
    const step = currentJourney.steps.find(s => s.id === stepId);
    if (!step) return;

    const newStatus = step.status === 'completed' ? 'upcoming' : 'completed';
    updateProgressMutation.mutate({
      journeyId: selectedJourney,
      stepId,
      status: newStatus
    });
  };

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500 border-green-500 text-white';
      case 'current': return 'bg-blue-500 border-blue-500 text-white';
      case 'upcoming': return 'bg-gray-200 border-gray-300 text-gray-600';
      case 'overdue': return 'bg-red-500 border-red-500 text-white';
      default: return 'bg-gray-200 border-gray-300 text-gray-600';
    }
  };

  const getUrgencyBadge = (daysUntilDeadline: number) => {
    if (daysUntilDeadline <= 14) {
      return <Badge variant="destructive" className="ml-2">Urgent</Badge>;
    } else if (daysUntilDeadline <= 30) {
      return <Badge variant="default" className="ml-2">Soon</Badge>;
    }
    return null;
  };

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Interactive Scholarship Journey
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Track your application progress and stay on top of deadlines with our step-by-step journey visualization
          </p>
        </div>

        {/* Journey Selection */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4 justify-center">
            {scholarshipJourneys.map((journey) => (
              <Button
                key={journey.id}
                variant={selectedJourney === journey.id ? "default" : "outline"}
                onClick={() => setSelectedJourney(journey.id)}
                className="flex items-center gap-2"
                data-testid={`button-journey-${journey.id}`}
              >
                <Trophy className="h-4 w-4" />
                {journey.title}
                {getUrgencyBadge(journey.daysUntilDeadline)}
              </Button>
            ))}
          </div>
        </div>

        {/* Journey Overview */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl" data-testid="text-journey-title">
                {currentJourney.title}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-500" />
                <span className="font-semibold" data-testid="text-deadline">
                  Deadline: {currentJourney.deadline}
                </span>
                <Badge 
                  variant={currentJourney.daysUntilDeadline <= 30 ? "destructive" : "secondary"}
                  data-testid="badge-days-remaining"
                >
                  {currentJourney.daysUntilDeadline} days left
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm text-gray-600">
                    {currentJourney.completedSteps} of {currentJourney.totalSteps} steps completed
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-3" data-testid="progress-journey" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Journey Steps */}
        <div className="space-y-6">
          {currentJourney.steps.map((step, index) => (
            <Card 
              key={step.id} 
              className={`transition-all duration-300 cursor-pointer hover:shadow-lg ${
                step.status === 'current' ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
              data-testid={`card-step-${step.id}`}
            >
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${getStepStatusColor(step.status)}`}>
                    {step.status === 'completed' ? <CheckCircle className="h-6 w-6" /> : step.icon}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold" data-testid={`text-step-title-${step.id}`}>
                        {step.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={step.status === 'current' ? 'default' : 'secondary'}
                          data-testid={`badge-step-status-${step.id}`}
                        >
                          {step.status}
                        </Badge>
                        {step.status === 'current' && (
                          <Clock className="h-4 w-4 text-blue-500" />
                        )}
                        {step.status === 'overdue' && (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </div>
                    <p className="text-gray-600 mt-1" data-testid={`text-step-description-${step.id}`}>
                      {step.description}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {step.timeframe}
                    </p>
                  </div>
                  
                  <ArrowRight className={`h-5 w-5 text-gray-400 transition-transform ${
                    expandedStep === step.id ? 'rotate-90' : ''
                  }`} />
                </div>
              </CardHeader>
              
              {expandedStep === step.id && (
                <CardContent className="pt-0 border-t bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div>
                      <h4 className="font-semibold text-green-700 mb-2">💡 Tips for Success</h4>
                      <ul className="space-y-1">
                        {step.tips.map((tip, tipIndex) => (
                          <li key={tipIndex} className="text-sm text-gray-700 flex items-start gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {step.requirements && (
                      <div>
                        <h4 className="font-semibold text-blue-700 mb-2">📋 Requirements</h4>
                        <ul className="space-y-1">
                          {step.requirements.map((req, reqIndex) => (
                            <li key={reqIndex} className="text-sm text-gray-700 flex items-start gap-2">
                              <AlertCircle className="h-3 w-3 text-blue-500 mt-1 flex-shrink-0" />
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                    <Button 
                      size="sm" 
                      variant={step.status === 'completed' ? 'secondary' : 'default'}
                      onClick={() => handleMarkComplete(step.id)}
                      disabled={updateProgressMutation.isPending}
                      data-testid={`button-mark-complete-${step.id}`}
                    >
                      {updateProgressMutation.isPending ? 'Updating...' : 
                        step.status === 'completed' ? 'Completed ✓' : 'Mark as Complete'}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        toast({
                          title: "Reminder Feature",
                          description: "Email reminders will be implemented in the next update."
                        });
                      }}
                      data-testid={`button-add-reminder-${step.id}`}
                    >
                      Add Reminder
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Quick Stats */}
        <Card className="mt-12 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold">{currentJourney.completedSteps}</div>
                <div className="text-blue-100">Steps Completed</div>
              </div>
              <div>
                <div className="text-3xl font-bold">{currentJourney.totalSteps - currentJourney.completedSteps}</div>
                <div className="text-blue-100">Steps Remaining</div>
              </div>
              <div>
                <div className="text-3xl font-bold">{currentJourney.daysUntilDeadline}</div>
                <div className="text-blue-100">Days Until Deadline</div>
              </div>
              <div>
                <div className="text-3xl font-bold">{Math.round(progressPercentage)}%</div>
                <div className="text-blue-100">Progress Complete</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}