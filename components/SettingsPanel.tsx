"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  RefreshCw,
  Settings,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";

interface SettingsPanelProps {
  apiStatus: "connected" | "disconnected" | "fallback";
  onStatusCheck: () => void;
}

export function SettingsPanel({
  apiStatus,
  onStatusCheck,
}: SettingsPanelProps) {
  const [jiraUrl, setJiraUrl] = useState("");
  const [jiraToken, setJiraToken] = useState("");
  const [trelloToken, setTrelloToken] = useState("");
  const [autoCapture, setAutoCapture] = useState(true);
  const [contextWindow, setContextWindow] = useState(10);
  const [requirementCategories, setRequirementCategories] = useState([
    "Authentication",
    "User Management",
    "Data Processing",
    "API Integration",
    "Security",
    "Performance",
    "UI/UX",
    "Reporting",
  ]);

  const getStatusIcon = () => {
    switch (apiStatus) {
      case "connected":
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case "fallback":
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      default:
        return <XCircle className="w-4 h-4 text-red-400" />;
    }
  };

  const getStatusText = () => {
    switch (apiStatus) {
      case "connected":
        return "Gemini API Connected";
      case "fallback":
        return "Using Fallback Mode";
      default:
        return "API Disconnected";
    }
  };

  const getStatusBadgeColor = () => {
    switch (apiStatus) {
      case "connected":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      case "fallback":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      default:
        return "bg-red-500/20 text-red-300 border-red-500/30";
    }
  };

  const testJiraConnection = async () => {
    if (!jiraUrl || !jiraToken) return;

    try {
      const response = await fetch("/api/integrations/jira/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: jiraUrl, token: jiraToken }),
      });

      if (response.ok) {
        alert("Jira connection successful!");
      } else {
        alert("Jira connection failed. Please check your credentials.");
      }
    } catch (error) {
      alert("Error testing Jira connection.");
    }
  };

  const testTrelloConnection = async () => {
    if (!trelloToken) return;

    try {
      const response = await fetch("/api/integrations/trello/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: trelloToken }),
      });

      if (response.ok) {
        alert("Trello connection successful!");
      } else {
        alert("Trello connection failed. Please check your token.");
      }
    } catch (error) {
      alert("Error testing Trello connection.");
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="api" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800/50 border border-gray-700 rounded-lg p-1">
          <TabsTrigger
            value="api"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-gray-300 rounded-md transition-all duration-200"
          >
            API
          </TabsTrigger>
          <TabsTrigger
            value="integrations"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-gray-300 rounded-md transition-all duration-200"
          >
            Integrations
          </TabsTrigger>
          <TabsTrigger
            value="preferences"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-gray-300 rounded-md transition-all duration-200"
          >
            Preferences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="api" className="space-y-4 mt-6">
          <Card className="bg-gray-800/30 border-gray-700 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm flex items-center gap-3 text-gray-100">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                  <Settings className="w-4 h-4 text-white" />
                </div>
                API Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-700/50 border border-gray-600">
                <div className="flex items-center gap-3">
                  {getStatusIcon()}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-100">
                      {getStatusText()}
                    </span>
                    <Badge
                      className={`text-xs mt-1 w-fit ${getStatusBadgeColor()}`}
                    >
                      {apiStatus.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onStatusCheck}
                  className="h-8 bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white transition-colors"
                >
                  <RefreshCw className="w-3 h-3 mr-2" />
                  Test
                </Button>
              </div>

              <div className="text-xs text-gray-400 space-y-2 bg-gray-700/30 p-4 rounded-lg border border-gray-700">
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-blue-400 rounded-full mt-1.5 shrink-0"></div>
                  <p>Gemini API provides advanced NLP capabilities</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-blue-400 rounded-full mt-1.5 shrink-0"></div>
                  <p>Fallback mode uses rule-based processing</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-blue-400 rounded-full mt-1.5 shrink-0"></div>
                  <p>
                    Get your free API key from{" "}
                    <a
                      href="https://makersuite.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline transition-colors"
                    >
                      Google AI Studio
                    </a>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4 mt-6">
          <Card className="bg-gray-800/30 border-gray-700 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm text-gray-100 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Jira Integration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <Label
                    htmlFor="jira-url"
                    className="text-xs text-gray-300 font-medium"
                  >
                    Jira URL
                  </Label>
                  <Input
                    id="jira-url"
                    placeholder="https://yourcompany.atlassian.net"
                    value={jiraUrl}
                    onChange={(e) => setJiraUrl(e.target.value)}
                    className="h-9 text-xs mt-2 bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="jira-token"
                    className="text-xs text-gray-300 font-medium"
                  >
                    API Token
                  </Label>
                  <Input
                    id="jira-token"
                    type="password"
                    placeholder="Your Jira API token"
                    value={jiraToken}
                    onChange={(e) => setJiraToken(e.target.value)}
                    className="h-9 text-xs mt-2 bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={testJiraConnection}
                disabled={!jiraUrl || !jiraToken}
                className="w-full h-9 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/50 text-blue-300 hover:from-blue-600/30 hover:to-purple-600/30 hover:text-white disabled:opacity-50 transition-all"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Test Connection
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/30 border-gray-700 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm text-gray-100 flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Trello Integration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label
                  htmlFor="trello-token"
                  className="text-xs text-gray-300 font-medium"
                >
                  Trello Token
                </Label>
                <Input
                  id="trello-token"
                  type="password"
                  placeholder="Your Trello API token"
                  value={trelloToken}
                  onChange={(e) => setTrelloToken(e.target.value)}
                  className="h-9 text-xs mt-2 bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={testTrelloConnection}
                disabled={!trelloToken}
                className="w-full h-9 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-purple-500/50 text-purple-300 hover:from-purple-600/30 hover:to-blue-600/30 hover:text-white disabled:opacity-50 transition-all"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Test Connection
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4 mt-6">
          <Card className="bg-gray-800/30 border-gray-700 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm text-gray-100 flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                Chat Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg bg-gray-700/50 border border-gray-600">
                <div>
                  <Label
                    htmlFor="auto-capture"
                    className="text-sm font-medium text-gray-100"
                  >
                    Auto-capture Requirements
                  </Label>
                  <p className="text-xs text-gray-400 mt-1">
                    Automatically extract requirements from conversations
                  </p>
                </div>
                <Switch
                  id="auto-capture"
                  checked={autoCapture}
                  onCheckedChange={setAutoCapture}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-600 data-[state=checked]:to-purple-600"
                />
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="context-window"
                  className="text-sm font-medium text-gray-300"
                >
                  Context Window
                </Label>
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-700/50 border border-gray-600">
                  <Input
                    id="context-window"
                    type="number"
                    min="5"
                    max="20"
                    value={contextWindow}
                    onChange={(e) => setContextWindow(Number(e.target.value))}
                    className="h-8 text-sm w-20 bg-gray-600/50 border-gray-500 text-gray-100 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-400">messages</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/30 border-gray-700 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm text-gray-100 flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                Requirement Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {requirementCategories.map((category, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30 text-blue-300 hover:from-blue-500/20 hover:to-purple-500/20 transition-all cursor-pointer"
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
