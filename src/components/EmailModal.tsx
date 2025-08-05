import React from 'react';
import { X, Send, Edit, Save } from 'lucide-react';
import { Lead } from '../types';

interface EmailModalProps {
  lead: Lead;
  onClose: () => void;
}

const EmailModal: React.FC<EmailModalProps> = ({ lead, onClose }) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-600';
    if (score >= 80) return 'bg-orange-600';
    return 'bg-gray-600';
  };

  const getScoreText = (score: number) => {
    if (score >= 90) return 'High Confidence';
    if (score >= 80) return 'Medium Confidence';
    return 'Low Confidence';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Email for {lead.firstName} {lead.lastName}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`px-3 py-1 rounded-full text-white text-sm font-medium ${getScoreColor(lead.aiEmail.score)}`}>
                {lead.aiEmail.score}/100
              </div>
              <span className="text-sm text-gray-600">
                {getScoreText(lead.aiEmail.score)}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              {lead.company} • {lead.title}
            </div>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject Line
            </label>
            <div className="p-3 bg-gray-50 rounded-lg border">
              <p className="text-gray-900 font-medium">{lead.aiEmail.subject}</p>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Body
            </label>
            <div className="p-4 bg-gray-50 rounded-lg border min-h-[200px]">
              <pre className="text-gray-900 whitespace-pre-wrap font-sans text-sm leading-6">
                {lead.aiEmail.fullText}
              </pre>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              AI Personalization Insights
            </label>
            <div className="space-y-2">
              {lead.aiEmail.personalizations.map((insight, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-ampersand rounded-full"></div>
                  <span className="text-sm text-gray-700">{insight}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2">
              <Edit className="w-4 h-4" />
              <span>Edit Template</span>
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2">
              <Save className="w-4 h-4" />
              <span>Save to Salesforce</span>
            </button>
            <button className="px-4 py-2 bg-ampersand hover:bg-ampersand-dark text-white rounded-md text-sm font-medium transition-colors flex items-center space-x-2">
              <Send className="w-4 h-4" />
              <span>Send Email</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailModal;