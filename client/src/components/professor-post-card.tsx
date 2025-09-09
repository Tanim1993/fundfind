import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, MessageCircle, Share2, Calendar, DollarSign } from "lucide-react"
import { FaLinkedin, FaFacebook, FaTwitter } from "react-icons/fa"

interface ProfessorPost {
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
  originalPost?: string | null
  professorName?: string | null
  professorProfile?: string | null
  postDate?: string | null
  socialPlatform?: string | null
}

interface ProfessorPostCardProps {
  post: ProfessorPost
}

export function ProfessorPostCard({ post }: ProfessorPostCardProps) {
  const getSocialIcon = (platform?: string | null) => {
    switch (platform?.toLowerCase()) {
      case 'linkedin':
        return <FaLinkedin className="h-4 w-4 text-blue-600" />
      case 'facebook':
        return <FaFacebook className="h-4 w-4 text-blue-500" />
      case 'twitter':
        return <FaTwitter className="h-4 w-4 text-blue-400" />
      default:
        return <MessageCircle className="h-4 w-4" />
    }
  }

  const getPlatformColor = (platform?: string | null) => {
    switch (platform?.toLowerCase()) {
      case 'linkedin':
        return 'bg-blue-50 border-blue-200'
      case 'facebook':
        return 'bg-blue-50 border-blue-200'
      case 'twitter':
        return 'bg-sky-50 border-sky-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const isSocialPost = post.originalPost && post.professorName && post.socialPlatform

  return (
    <Card className={`group hover:shadow-lg transition-all duration-300 ${
      isSocialPost ? getPlatformColor(post.socialPlatform) : 'bg-white border-gray-200'
    }`} data-testid={`card-funding-${post.id}`}>
      <CardHeader className="space-y-3">
        {isSocialPost && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getSocialIcon(post.socialPlatform)}
              <span className="text-sm font-medium text-gray-600">
                {post.professorName}
              </span>
              <Badge variant="secondary" className="text-xs">
                {post.socialPlatform?.toUpperCase()}
              </Badge>
            </div>
            {post.postDate && (
              <span className="text-xs text-gray-500">
                {formatDate(post.postDate)}
              </span>
            )}
          </div>
        )}
        
        <div className="space-y-2">
          <h3 className="text-lg font-bold leading-tight group-hover:text-blue-600 transition-colors" 
              data-testid={`text-title-${post.id}`}>
            {post.title}
          </h3>
          
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs" data-testid={`badge-degree-${post.id}`}>
              {post.degreeLevel}
            </Badge>
            <Badge variant="outline" className="text-xs" data-testid={`badge-subject-${post.id}`}>
              {post.subject}
            </Badge>
            <Badge 
              variant={post.fundingType === 'Fully Funded' ? 'default' : 'secondary'} 
              className="text-xs"
              data-testid={`badge-funding-${post.id}`}
            >
              {post.fundingType}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isSocialPost && post.originalPost && (
          <div className="bg-white/70 p-3 rounded-lg border-l-4 border-blue-400">
            <p className="text-sm italic text-gray-700" data-testid={`text-original-post-${post.id}`}>
              "{post.originalPost}"
            </p>
          </div>
        )}

        <p className="text-gray-700 leading-relaxed" data-testid={`text-description-${post.id}`}>
          {post.description}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-red-500" />
            <span className="font-medium">Deadline:</span>
            <span className="text-red-600 font-semibold" data-testid={`text-deadline-${post.id}`}>
              {post.deadline}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="font-medium">Amount:</span>
            <span className="text-green-600 font-semibold" data-testid={`text-amount-${post.id}`}>
              {post.amount}
            </span>
          </div>
          
          <div className="flex items-center gap-2 sm:col-span-2">
            <span className="font-medium">Institution:</span>
            <span className="text-blue-600" data-testid={`text-institution-${post.id}`}>
              {post.institution}
            </span>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button 
            asChild 
            className="flex-1" 
            data-testid={`button-apply-${post.id}`}
          >
            <a 
              href={post.sourceUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Apply Now
            </a>
          </Button>
          
          {isSocialPost && post.professorProfile && (
            <Button 
              variant="outline" 
              asChild
              data-testid={`button-professor-${post.id}`}
            >
              <a 
                href={post.professorProfile} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                {getSocialIcon(post.socialPlatform)}
                Professor
              </a>
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            size="icon"
            data-testid={`button-share-${post.id}`}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}