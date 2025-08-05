import React, { useState } from "react";
import { InstallIntegration, Config } from "@amp-labs/react";

// Demo user data - in a real app, this would come from your auth system
const DEMO_USER = {
  id: "user-123",
  name: "John Smith",
  companyId: "acme-corp",
  companyName: "Acme Corporation",
};

interface SalesforceIntegrationProps {
  onConnectionSuccess: () => void;
}

const SalesforceIntegration: React.FC<SalesforceIntegrationProps> = ({
  onConnectionSuccess,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [installationId, setInstallationId] = useState<string | null>(null);

  const handleInstallSuccess = (id: string, config: Config) => {
    console.log("✅ Installation successful!", { id, config });
    setIsConnected(true);
    setInstallationId(id);
    // Simulate delay before transitioning to dashboard
    setTimeout(() => {
      onConnectionSuccess();
    }, 2000);
  };

  const handleUpdateSuccess = (id: string, config: Config) => {
    console.log("✅ Configuration updated!", { id, config });
  };

  const handleUninstallSuccess = () => {
    console.log("❌ Integration uninstalled");
    setIsConnected(false);
    setInstallationId(null);
  };

  // Show the success state after installation
  if (isConnected) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Salesforce Connected!
        </h2>
        <p className="text-gray-600 mb-6">
          Your integration is active and syncing data.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📊</span>
              <div className="text-left">
                <strong className="text-gray-900">Account Data</strong>
                <p className="text-sm text-gray-600">
                  Syncing every 30 minutes
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">⚡</span>
              <div className="text-left">
                <strong className="text-gray-900">Lead Events</strong>
                <p className="text-sm text-gray-600">Real-time notifications</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-100 px-4 py-2 rounded inline-block mb-6">
          <code className="text-sm text-gray-700">
            Installation ID: {installationId}
          </code>
        </div>

        <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
      </div>
    );
  }

  // Show installation UI
  return (
    <div>
      <p className="text-gray-600 mb-6">
        Sync accounts every 30 minutes • Get notified of new leads in{" "}
        <strong>real-time</strong>
      </p>

      {/* InstallIntegration Component */}
      <div className="border rounded-lg p-6 mb-6">
        <InstallIntegration
          integration={import.meta.env.VITE_SALESFORCE_INTEGRATION_NAME}
          consumerRef={DEMO_USER.id}
          consumerName={DEMO_USER.name}
          groupRef={DEMO_USER.companyId}
          groupName={DEMO_USER.companyName}
          onInstallSuccess={handleInstallSuccess}
          onUpdateSuccess={handleUpdateSuccess}
          onUninstallSuccess={handleUninstallSuccess}
        />
      </div>
    </div>
  );
};

export default SalesforceIntegration;
