import { useState } from "react";
import { InstallIntegration, useIsIntegrationInstalled } from "@amp-labs/react";
import { Leads } from "./Leads";

// The signed-in user and their company. A real app gets these from its auth.
const user = { id: "jane", name: "Jane Smith" };
const company = { id: "acme", name: "Acme Inc." };
const integration = "amperreach";

export function App() {
  const { isLoaded, isIntegrationInstalled, config } = useIsIntegrationInstalled(
    integration,
    company.id,
  );
  const [settings, setSettings] = useState(false);

  // Stays false forever if `amp.yaml` isn't deployed yet: run `amp deploy amp.yaml`.
  if (!isLoaded) return null;

  const connecting = !isIntegrationInstalled || settings;
  // The Salesforce field this customer chose for the email when connecting.
  const emailField = config?.content?.read?.objects?.lead?.selectedFieldMappings?.outreach_email;

  return (
    <div className="page">
      <header className="topbar">
        <span className="logo">AmperReach</span>
        {isIntegrationInstalled && (
          <button onClick={() => setSettings(!settings)}>
            {settings ? "Back to leads" : "Salesforce settings"}
          </button>
        )}
      </header>

      {connecting ? (
        <main className="connect">
          <InstallIntegration
            integration={integration}
            consumerRef={user.id}
            consumerName={user.name}
            groupRef={company.id}
            groupName={company.name}
            onInstallSuccess={() => setSettings(false)}
            // @ts-expect-error -- wizard mode is in beta and not in the public types yet
            variant="wizard"
          />
        </main>
      ) : (
        <Leads emailField={emailField} />
      )}
    </div>
  );
}
