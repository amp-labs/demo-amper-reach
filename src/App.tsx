import React, { useState } from "react";
import { useIsIntegrationInstalled } from "@amp-labs/react";
import Dashboard from "./components/Dashboard";
import ConnectionSetup from "./components/ConnectionSetup";
import IntegrationModal from "./components/IntegrationModal";
import SalesforceIntegration from "./components/SalesforceIntegration";

// Demo user data - in a real app, this would come from your auth system
const DEMO_USER = {
  id: "user-123",
  name: "John Smith",
  companyId: "acme-corp",
  companyName: "Acme Corporation",
};

function App() {
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);
  const [installationComplete, setInstallationComplete] = useState(false);

  // Check if integration is already installed
  const { isLoaded, isIntegrationInstalled } = useIsIntegrationInstalled(
    import.meta.env.VITE_SALESFORCE_INTEGRATION_NAME,
    DEMO_USER.companyId
  );

  const handleConnectClick = () => {
    setShowIntegrationModal(true);
  };

  const handleConnectionSuccess = () => {
    setInstallationComplete(true);
    setShowIntegrationModal(false);
  };

  const handleModalClose = () => {
    setShowIntegrationModal(false);
  };

  // Show loading state while checking installation status
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </div>
          <h2 className="text-xl font-medium text-gray-900 mb-2">
            Checking Connection Status...
          </h2>
          <p className="text-gray-600">
            Please wait while we verify your Salesforce integration.
          </p>
        </div>
      </div>
    );
  }

  const showDashboard = isIntegrationInstalled || installationComplete;

  return (
    <div className="App">
      {showDashboard ? (
        <Dashboard onManageIntegration={handleConnectClick} />
      ) : (
        <ConnectionSetup onConnect={handleConnectClick} />
      )}
      <IntegrationModal
        isOpen={showIntegrationModal}
        onClose={handleModalClose}
        onSuccess={handleConnectionSuccess}
      >
        <SalesforceIntegration onConnectionSuccess={handleConnectionSuccess} />
      </IntegrationModal>
    </div>
  );
}

export default App;
