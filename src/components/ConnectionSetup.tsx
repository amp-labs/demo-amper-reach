import React from "react";
import { Bot, Database, ArrowRight } from "lucide-react";

interface ConnectionSetupProps {
  onConnect: () => void;
}

const ConnectionSetup: React.FC<ConnectionSetupProps> = ({ onConnect }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-ampersand rounded-lg flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">AmperReach</h1>
          </div>
          <p className="text-lg text-gray-600 mb-8">
            Automated email generation when leads are assigned in Salesforce
          </p>

          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Connect Your Salesforce
            </h2>

            <div className="mb-8">
              <div className="flex items-center justify-center space-x-4 text-gray-600">
                <div className="text-center">
                  <Database className="w-8 h-8 mx-auto mb-2" />
                  <span className="text-sm">Salesforce</span>
                </div>
                <ArrowRight className="w-6 h-6" />
                <div className="text-center">
                  <div className="w-8 h-8 bg-ampersand rounded flex items-center justify-center mx-auto mb-2">
                    <span className="text-white font-bold text-xs">&</span>
                  </div>
                  <span className="text-sm">Ampersand</span>
                </div>
                <ArrowRight className="w-6 h-6" />
                <div className="text-center">
                  <Bot className="w-8 h-8 mx-auto mb-2" />
                  <span className="text-sm">AmperReach</span>
                </div>
              </div>
            </div>

            <button
              onClick={onConnect}
              className="bg-ampersand hover:bg-ampersand-dark text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Connect Salesforce
            </button>

            <p className="text-sm text-gray-500 mt-4">
              One-click OAuth setup • No code required
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            How it works
          </h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-ampersand-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-semibold text-ampersand">1</span>
              </div>
              <div>
                <p className="text-sm text-gray-700 font-medium">
                  Lead assigned in Salesforce
                </p>
                <p className="text-sm text-gray-500">
                  Sales manager assigns lead to rep
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-ampersand-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-semibold text-ampersand">2</span>
              </div>
              <div>
                <p className="text-sm text-gray-700 font-medium">
                  Webhook triggered
                </p>
                <p className="text-sm text-gray-500">
                  Ampersand sends real-time notification
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-ampersand-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-semibold text-ampersand">3</span>
              </div>
              <div>
                <p className="text-sm text-gray-700 font-medium">
                  AI generates email
                </p>
                <p className="text-sm text-gray-500">
                  Personalized outreach created automatically
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-ampersand-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-semibold text-ampersand">4</span>
              </div>
              <div>
                <p className="text-sm text-gray-700 font-medium">
                  Saved to Salesforce
                </p>
                <p className="text-sm text-gray-500">
                  Email written to custom fields
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500">Powered by Ampersand</p>
        </div>
      </div>
    </div>
  );
};

export default ConnectionSetup;
