import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Calendar, DollarSign } from "lucide-react"

interface OpportunityCardProps {
  opportunity: {
    id: string
    title: string
    description: string
    institution: string
    deadline: string
    amount: string
    degreeLevel: string
    subject: string
    fundingType: string
    sourceUrl: string
    sourceName: string
  }
}

export default function OpportunityCard({ opportunity }: OpportunityCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 bg-white border-gray-200" data-testid={`card-funding-${opportunity.id}`}>
      <CardHeader className="space-y-3">
        <div className="space-y-2">
          <h3 className="text-lg font-bold leading-tight group-hover:text-blue-600 transition-colors" 
              data-testid={`text-title-${opportunity.id}`}>
            {opportunity.title}
          </h3>
          
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs" data-testid={`badge-degree-${opportunity.id}`}>
              {opportunity.degreeLevel}
            </Badge>
            <Badge variant="outline" className="text-xs" data-testid={`badge-subject-${opportunity.id}`}>
              {opportunity.subject}
            </Badge>
            <Badge 
              variant={opportunity.fundingType === 'Fully Funded' ? 'default' : 'secondary'} 
              className="text-xs"
              data-testid={`badge-funding-${opportunity.id}`}
            >
              {opportunity.fundingType}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-gray-700 leading-relaxed" data-testid={`text-description-${opportunity.id}`}>
          {opportunity.description}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-red-500" />
            <span className="font-medium">Deadline:</span>
            <span className="text-red-600 font-semibold" data-testid={`text-deadline-${opportunity.id}`}>
              {opportunity.deadline}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="font-medium">Amount:</span>
            <span className="text-green-600 font-semibold" data-testid={`text-amount-${opportunity.id}`}>
              {opportunity.amount}
            </span>
          </div>
          
          <div className="flex items-center gap-2 sm:col-span-2">
            <span className="font-medium">Institution:</span>
            <span className="text-blue-600" data-testid={`text-institution-${opportunity.id}`}>
              {opportunity.institution}
            </span>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button 
            asChild 
            className="flex-1" 
            data-testid={`button-apply-${opportunity.id}`}
          >
            <a 
              href={opportunity.sourceUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Apply Now
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}