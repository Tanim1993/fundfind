import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, RefreshCw, Edit, Trash2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ApiKeysSetup } from "./api-keys-setup";
import type { ScrapingSource } from "@shared/schema";

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddSourceOpen, setIsAddSourceOpen] = useState(false);
  const [newSource, setNewSource] = useState({ name: "", url: "", status: "active" });

  const { data: sources = [], isLoading: sourcesLoading } = useQuery<ScrapingSource[]>({
    queryKey: ['/api/scraping-sources'],
  });

  const { data: activity = [] } = useQuery<Array<{
    id: string;
    sourceId: string;
    status: string;
    opportunitiesFound: number | null;
    duplicatesFiltered: number | null;
    errorMessage: string | null;
    timestamp: string;
  }>>({
    queryKey: ['/api/scraping-activity'],
  });

  const runScraper = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/run-scraper');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Scraper Executed",
        description: `Successfully scraped ${data.sourceCount} sources`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/scraping-activity'] });
    },
  });

  const addSource = useMutation({
    mutationFn: async (source: typeof newSource) => {
      const response = await apiRequest('POST', '/api/scraping-sources', {
        ...source,
        isActive: true,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Source Added",
        description: "New scraping source has been added successfully",
      });
      setNewSource({ name: "", url: "", status: "active" });
      setIsAddSourceOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/scraping-sources'] });
    },
  });

  const deleteSource = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/scraping-sources/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Source Deleted",
        description: "Scraping source has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/scraping-sources'] });
    },
  });

  return (
    <section id="admin" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
            </div>

            <Tabs defaultValue="dashboard" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="sources">Data Sources</TabsTrigger>
                <TabsTrigger value="api-keys">API Setup</TabsTrigger>
              </TabsList>
              
              <TabsContent value="dashboard" className="space-y-6 mt-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold">System Overview</h3>
                  <Button 
                    onClick={() => runScraper.mutate()}
                    disabled={runScraper.isPending}
                    className="bg-green-600 text-white hover:bg-green-700"
                  >
                    <RefreshCw className={`mr-2 h-4 w-4 ${runScraper.isPending ? 'animate-spin' : ''}`} />
                    {runScraper.isPending ? "Running..." : "Run Scraper"}
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="text-2xl font-bold text-blue-600">
                      {sources.filter((s: ScrapingSource) => s.isActive).length}
                    </div>
                    <div className="text-sm text-gray-600">Active Sources</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-green-600">
                      {activity.filter(a => a.status === 'success').length}
                    </div>
                    <div className="text-sm text-gray-600">Successful Scrapes</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <div className="text-2xl font-bold text-red-600">
                      {activity.filter(a => a.status === 'error').length}
                    </div>
                    <div className="text-sm text-gray-600">Failed Scrapes</div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="sources" className="space-y-6 mt-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold">Manage Data Sources</h3>
                  <Dialog open={isAddSourceOpen} onOpenChange={setIsAddSourceOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 text-white hover:bg-blue-700">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Source
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Scraping Source</DialogTitle>
                        <DialogDescription>
                          Add a new data source for scraping funding opportunities.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="source-name">Source Name</Label>
                          <Input
                            id="source-name"
                            value={newSource.name}
                            onChange={(e) => setNewSource(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g., NSF.gov"
                          />
                        </div>
                        <div>
                          <Label htmlFor="source-url">Source URL</Label>
                          <Input
                            id="source-url"
                            value={newSource.url}
                            onChange={(e) => setNewSource(prev => ({ ...prev, url: e.target.value }))}
                            placeholder="e.g., https://nsf.gov/funding"
                          />
                        </div>
                        <Button 
                          onClick={() => addSource.mutate(newSource)}
                          disabled={addSource.isPending || !newSource.name || !newSource.url}
                          className="w-full"
                        >
                          {addSource.isPending ? "Adding..." : "Add Source"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-3">
                  {sourcesLoading ? (
                    <div className="p-4 bg-gray-50 rounded-lg animate-pulse">
                      <div className="h-4 bg-gray-300 rounded mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded"></div>
                    </div>
                  ) : (
                    sources.map((source: ScrapingSource) => (
                      <div key={source.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">{source.name}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{source.url}</div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-400 hover:text-red-600"
                            onClick={() => deleteSource.mutate(source.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="api-keys" className="space-y-6 mt-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Social Media API Configuration</h3>
                  <ApiKeysSetup />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}