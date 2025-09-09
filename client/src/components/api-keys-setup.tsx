import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Key, ExternalLink } from "lucide-react"
import { FaLinkedin, FaFacebook, FaTwitter } from "react-icons/fa"

interface ApiKeyStatus {
  name: string
  icon: React.ReactNode
  isConfigured: boolean
  description: string
  setupUrl: string
}

export function ApiKeysSetup() {
  const [apiKeys, setApiKeys] = useState({
    linkedin: "",
    facebook: "",
    twitter: ""
  })

  // Check if API keys are configured in environment
  const apiKeyStatuses: ApiKeyStatus[] = [
    {
      name: "LinkedIn API",
      icon: <FaLinkedin className="h-5 w-5 text-blue-600" />,
      isConfigured: false,
      description: "Access LinkedIn posts from professors and universities",
      setupUrl: "https://developer.linkedin.com/docs/getting-started"
    },
    {
      name: "Facebook API",
      icon: <FaFacebook className="h-5 w-5 text-blue-500" />,
      isConfigured: false,
      description: "Monitor university Facebook pages and academic groups",
      setupUrl: "https://developers.facebook.com/docs/graph-api/get-started"
    },
    {
      name: "Twitter API",
      icon: <FaTwitter className="h-5 w-5 text-blue-400" />,
      isConfigured: false,
      description: "Track hashtags and professor tweets about funding",
      setupUrl: "https://developer.twitter.com/en/docs/getting-started"
    }
  ]

  const handleSaveKeys = () => {
    // This would typically save to environment variables
    console.log("API Keys to save:", apiKeys)
    alert("API keys would be saved to environment variables in a real implementation")
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Social Media API Setup</h2>
        <p className="text-gray-600">Configure API keys to enable real-time professor post scraping</p>
      </div>

      <div className="grid gap-4">
        {apiKeyStatuses.map((api, index) => (
          <Card key={index} className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {api.icon}
                  <div>
                    <CardTitle className="text-lg">{api.name}</CardTitle>
                    <p className="text-sm text-gray-600">{api.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {api.isConfigured ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Configured
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Not Set
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={api.setupUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Get API Key
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Alert>
        <Key className="h-4 w-4" />
        <AlertDescription>
          <strong>How to add API keys in Replit:</strong>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>Click the "Secrets" tab in the left sidebar of your Replit workspace</li>
            <li>Click "New Secret" button</li>
            <li>Add these secret names with your API keys:</li>
            <ul className="list-disc list-inside ml-4 mt-1">
              <li><code>LINKEDIN_API_KEY</code> - Your LinkedIn API key</li>
              <li><code>FACEBOOK_API_KEY</code> - Your Facebook API key</li>
              <li><code>TWITTER_API_KEY</code> - Your Twitter API key</li>
            </ul>
          </ol>
        </AlertDescription>
      </Alert>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-blue-900 mb-2">What happens after adding API keys?</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Platform will automatically scrape real professor posts from social media</li>
            <li>• Fresh funding opportunities will be collected daily</li>
            <li>• Email notifications will include the latest social media findings</li>
            <li>• Admin dashboard will show scraping activity and success rates</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}