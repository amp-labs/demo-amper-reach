import React from "react";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Lead } from "../types";

interface LeadTableProps {
  leads: Lead[];
}

const LeadTable: React.FC<LeadTableProps> = ({ leads }) => {
  const getEmailStatus = (lead: Lead) => {
    if (lead.assignedTo === "Unassigned") {
      return (
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="w-4 h-4 mr-1" />
          <span>Waiting for assignment</span>
        </div>
      );
    }

    if (lead.aiEmail) {
      return (
        <div className="flex items-center text-sm text-green-600">
          <CheckCircle className="w-4 h-4 mr-1" />
          <span>Email generated</span>
        </div>
      );
    }

    return (
      <div className="flex items-center text-sm text-yellow-600">
        <AlertCircle className="w-4 h-4 mr-1" />
        <span>Processing...</span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Salesforce Leads
        </h3>
      </div>

      <div className="overflow-y-auto max-h-[600px]">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                Lead
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                Company
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                Assigned To
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                AI Email Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leads.length > 0 ? (
              leads.map((lead) => (
                <tr key={lead.id}>
                  <td className="px-6 py-4 w-1/4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {lead.firstName} {lead.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{lead.title}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 w-1/4">
                    <div className="text-sm text-gray-900">{lead.company}</div>
                    <div className="text-sm text-gray-500">{lead.industry}</div>
                  </td>
                  <td className="px-6 py-4 w-1/4">
                    <div className="text-sm text-gray-900">
                      {lead.assignedTo === "Unassigned" ? (
                        <span className="text-gray-500 italic">Unassigned</span>
                      ) : (
                        lead.assignedTo
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 w-1/4">{getEmailStatus(lead)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-10 px-6">
                  <div className="text-gray-500">
                    <h4 className="font-semibold">No new leads yet</h4>
                    <p className="text-sm mt-1">
                      When leads are assigned in Salesforce, they'll appear
                      here.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeadTable;
