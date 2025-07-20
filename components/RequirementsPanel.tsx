"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CheckCircle,
  Circle,
  AlertTriangle,
  Clock,
  Target,
  List,
  ExternalLink,
} from "lucide-react";

interface ExtractedRequirement {
  id: string;
  title: string;
  description: string;
  type: "functional" | "non-functional";
  priority: "high" | "medium" | "low";
  category: string;
  acceptance_criteria: string[];
  estimated_effort: string;
  dependencies: string[];
}

interface RequirementsPanelProps {
  requirements: ExtractedRequirement[];
}

export function RequirementsPanel({ requirements }: RequirementsPanelProps) {
  const [selectedRequirement, setSelectedRequirement] =
    useState<ExtractedRequirement | null>(null);
  const [filter, setFilter] = useState<"all" | "functional" | "non-functional">(
    "all"
  );

  const filteredRequirements = requirements.filter(
    (req) => filter === "all" || req.type === filter
  );

  const functionalCount = requirements.filter(
    (req) => req.type === "functional"
  ).length;
  const nonFunctionalCount = requirements.filter(
    (req) => req.type === "non-functional"
  ).length;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      case "medium":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      case "low":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertTriangle className="w-3 h-3" />;
      case "medium":
        return <Clock className="w-3 h-3" />;
      case "low":
        return <Circle className="w-3 h-3" />;
      default:
        return <Circle className="w-3 h-3" />;
    }
  };

  const exportToJira = async (requirement: ExtractedRequirement) => {
    // This would integrate with Jira API
    console.log("Exporting to Jira:", requirement);
    // Implementation would depend on Jira API setup
  };

  const exportToTrello = async (requirement: ExtractedRequirement) => {
    // This would integrate with Trello API
    console.log("Exporting to Trello:", requirement);
    // Implementation would depend on Trello API setup
  };

  if (requirements.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <div className="p-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full w-fit mx-auto mb-4">
          <Target className="w-12 h-12 text-gray-300" />
        </div>
        <p className="text-lg font-medium text-gray-200">
          No requirements captured yet
        </p>
        <p className="text-sm text-gray-400 mt-2">
          Start chatting to capture and organize your requirements
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-gray-800/30 border-gray-700 backdrop-blur-sm p-4">
          <div className="text-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {requirements.length}
            </div>
            <div className="text-xs text-gray-400 mt-1">Total</div>
          </div>
        </Card>
        <Card className="bg-gray-800/30 border-gray-700 backdrop-blur-sm p-4">
          <div className="text-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              {functionalCount}
            </div>
            <div className="text-xs text-gray-400 mt-1">Functional</div>
          </div>
        </Card>
        <Card className="bg-gray-800/30 border-gray-700 backdrop-blur-sm p-4">
          <div className="text-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {nonFunctionalCount}
            </div>
            <div className="text-xs text-gray-400 mt-1">Non-functional</div>
          </div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={(value) => setFilter(value as any)}>
        <TabsList className="grid w-full grid-cols-3 bg-gray-800/50 border border-gray-700 rounded-lg p-1">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-gray-300 rounded-md transition-all duration-200"
          >
            All ({requirements.length})
          </TabsTrigger>
          <TabsTrigger
            value="functional"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-gray-300 rounded-md transition-all duration-200"
          >
            Functional ({functionalCount})
          </TabsTrigger>
          <TabsTrigger
            value="non-functional"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-gray-300 rounded-md transition-all duration-200"
          >
            Non-functional ({nonFunctionalCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6">
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {filteredRequirements.map((requirement) => (
                <Card
                  key={requirement.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/10 bg-gray-800/30 border-gray-700 backdrop-blur-sm hover:bg-gray-700/30 ${
                    selectedRequirement?.id === requirement.id
                      ? "ring-2 ring-blue-500 bg-gray-700/40"
                      : ""
                  }`}
                  onClick={() => setSelectedRequirement(requirement)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-sm font-medium line-clamp-2 text-gray-100">
                        {requirement.title}
                      </CardTitle>
                      <Badge
                        className={`text-xs ${getPriorityColor(
                          requirement.priority
                        )}`}
                      >
                        {getPriorityIcon(requirement.priority)}
                        <span className="ml-1">{requirement.priority}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-gray-400 line-clamp-2 mb-3">
                      {requirement.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge
                        variant="outline"
                        className="text-xs bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30 text-blue-300"
                      >
                        {requirement.category}
                      </Badge>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 w-7 p-0 bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            exportToJira(requirement);
                          }}
                          title="Export to Jira"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 w-7 p-0 bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            exportToTrello(requirement);
                          }}
                          title="Export to Trello"
                        >
                          <List className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Detailed View */}
      {selectedRequirement && (
        <Card className="mt-6 bg-gray-800/30 border-gray-700 backdrop-blur-sm ring-2 ring-blue-500/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-gray-100 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <Target className="w-4 h-4 text-white" />
              </div>
              {selectedRequirement.title}
            </CardTitle>
            <div className="flex gap-2 mt-3">
              <Badge
                variant="outline"
                className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/30 text-cyan-300"
              >
                {selectedRequirement.type}
              </Badge>
              <Badge className={getPriorityColor(selectedRequirement.priority)}>
                {getPriorityIcon(selectedRequirement.priority)}
                <span className="ml-1">{selectedRequirement.priority}</span>
              </Badge>
              <Badge
                variant="outline"
                className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30 text-purple-300"
              >
                {selectedRequirement.category}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 rounded-lg bg-gray-700/30 border border-gray-600">
              <h4 className="font-semibold text-sm mb-3 text-gray-200 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Description
              </h4>
              <p className="text-sm text-gray-300">
                {selectedRequirement.description}
              </p>
            </div>

            {selectedRequirement.acceptance_criteria.length > 0 && (
              <div className="p-4 rounded-lg bg-gray-700/30 border border-gray-600">
                <h4 className="font-semibold text-sm mb-3 text-gray-200 flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  Acceptance Criteria
                </h4>
                <ul className="space-y-2">
                  {selectedRequirement.acceptance_criteria.map(
                    (criteria, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-3 text-sm"
                      >
                        <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300">{criteria}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-gray-700/30 border border-gray-600">
                <h4 className="font-semibold text-sm mb-3 text-gray-200 flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  Estimated Effort
                </h4>
                <p className="text-sm text-gray-300">
                  {selectedRequirement.estimated_effort}
                </p>
              </div>

              {selectedRequirement.dependencies.length > 0 && (
                <div className="p-4 rounded-lg bg-gray-700/30 border border-gray-600">
                  <h4 className="font-semibold text-sm mb-3 text-gray-200 flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    Dependencies
                  </h4>
                  <ul className="space-y-1">
                    {selectedRequirement.dependencies.map((dep, index) => (
                      <li
                        key={index}
                        className="text-sm text-gray-300 flex items-start gap-2"
                      >
                        <div className="w-1 h-1 bg-purple-400 rounded-full mt-1.5 shrink-0"></div>
                        {dep}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
