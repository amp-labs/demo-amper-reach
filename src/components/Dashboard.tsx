import React, { useState, useEffect } from "react";
import {
  Bot,
  CheckCircle,
  AlertCircle,
  Settings,
  RefreshCw,
  Loader,
  Check,
  XCircle,
} from "lucide-react";
import LeadTable from "./LeadTable";
import ActivityFeed from "./ActivityFeed";
import { Lead, Activity } from "../types";

interface DashboardProps {
  onManageIntegration: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onManageIntegration }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncState, setSyncState] = useState("idle");

  // Extract refreshData outside useEffect
  const refreshData = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/state");
      if (!response.ok) throw new Error("Failed to fetch data");

      const data = await response.json();
      setLeads(data.leads);
      setActivities(data.activities);
      setError(null);
    } catch (err) {
      setError(
        "Unable to connect to backend. Make sure the server is running."
      );
      console.error("Failed to fetch data:", err);
    }
  };

  // Replace the useEffect with this version where refreshData is defined outside
  useEffect(() => {
    // Initial fetch with loading
    setLoading(true);
    refreshData().finally(() => setLoading(false));

    // Poll for updates every 5 seconds
    const interval = setInterval(refreshData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Bot className="w-12 h-12 text-ampersand mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading Salesforce data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-ampersand rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    AmperReach
                  </h1>
                  <p className="text-xs text-gray-500">
                    AI-powered sales outreach
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={onManageIntegration}
                className="group flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-gray-700">
                  Connected to Salesforce
                </span>
                <Settings className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button
                disabled={syncState === "loading"}
                onClick={async () => {
                  setSyncState("loading");
                  try {
                    await fetch("http://localhost:3001/api/trigger-read", {
                      method: "POST",
                    });
                    setSyncState("success");
                  } catch (err) {
                    setSyncState("error");
                  } finally {
                    setTimeout(() => setSyncState("idle"), 2000);
                  }
                }}
                className={`group flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors ${
                  syncState === "error"
                    ? "text-red-500"
                    : syncState === "success"
                    ? "text-green-500"
                    : ""
                }`}
              >
                {syncState === "loading" ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : syncState === "success" ? (
                  <Check className="w-5 h-5" />
                ) : syncState === "error" ? (
                  <XCircle className="w-5 h-5" />
                ) : (
                  <RefreshCw className="w-5 h-5 text-blue-500" />
                )}
                <span className="text-sm font-medium text-gray-700">
                  {syncState === "loading"
                    ? "Syncing..."
                    : syncState === "success"
                    ? "Sync Triggered"
                    : syncState === "error"
                    ? "Sync Failed"
                    : "Sync Now"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800">
                  Connection Error
                </h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-ampersand-50 border border-ampersand-200 rounded-lg p-4 mb-8">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <Bot className="w-6 h-6 text-ampersand" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-ampersand-900">
                How it works
              </h3>
              <p className="mt-1 text-sm text-ampersand-700">
                When leads are assigned in Salesforce, Ampersand sends webhooks
                that trigger automatic email generation. The emails are saved
                back to Salesforce custom fields.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <LeadTable leads={leads} onRefresh={refreshData} />
          </div>

          <div className="lg:col-span-1">
            <ActivityFeed activities={activities} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
