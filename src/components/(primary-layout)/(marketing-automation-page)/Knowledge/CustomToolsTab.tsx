import {
  useCreateCustomTool,
  useCustomTools,
  useDeleteCustomTool,
} from "@/hooks/(marketing-automation-page)/useKnowledgeApi";
import { AlertCircle, Loader2, Plus, Trash2, Wrench } from "lucide-react";
import { useState } from "react";
// import {
//   useCreateCustomTool,
//   useCustomTools,
//   useDeleteCustomTool,
// } from "../../hooks/useKnowledgeApi";

interface CustomTool {
  id: string;
  pageId: string;
  name: string;
  description: string;
  apiEndpoint: string;
  method: string;
  headers: Record<string, string>;
  parameters: Record<string, string>;
  createdAt: string;
}

interface CustomToolsTabProps {
  selectedPage: string;
}

export const CustomToolsTab = ({ selectedPage }: CustomToolsTabProps) => {
  const [toolName, setToolName] = useState("");
  const [toolDescription, setToolDescription] = useState("");
  const [toolEndpoint, setToolEndpoint] = useState("");
  const [toolMethod, setToolMethod] = useState("GET");
  const [authToken, setAuthToken] = useState("");
  const [toolHeaders, setToolHeaders] = useState("");
  const [toolParameters, setToolParameters] = useState("");

  const createCustomToolMutation = useCreateCustomTool();
  const deleteCustomToolMutation = useDeleteCustomTool();
  const { data: customToolsData } = useCustomTools(selectedPage || null);

  // Dynamic placeholders based on HTTP method
  const getHeadersPlaceholder = () => {
    switch (toolMethod) {
      case "GET":
        return '{"Accept": "application/json"}';
      case "POST":
        return '{"Content-Type": "application/json"}';
      case "PUT":
        return '{"Content-Type": "application/json"}';
      case "DELETE":
        return '{"Accept": "application/json"}';
      default:
        return "{}";
    }
  };

  const getParametersPlaceholder = () => {
    switch (toolMethod) {
      case "GET":
        return '{"status": "active", "limit": "10", "page": "1"}';
      case "POST":
        return '{"name": "John Doe", "email": "john@example.com", "age": "30"}';
      case "PUT":
        return '{"id": "123", "name": "Updated Name", "status": "active"}';
      case "DELETE":
        return '{"id": "123"}';
      default:
        return "{}";
    }
  };

  const getEndpointPlaceholder = () => {
    switch (toolMethod) {
      case "GET":
        return "https://api.example.com/users (query params will be appended)";
      case "POST":
        return "https://api.example.com/users";
      case "PUT":
        return "https://api.example.com/users/:id (use :id for path params)";
      case "DELETE":
        return "https://api.example.com/users/:id (use :id for path params)";
      default:
        return "https://api.example.com/endpoint";
    }
  };

  const getParametersHelpText = () => {
    switch (toolMethod) {
      case "GET":
        return "Query parameters (will be added as ?status=active&limit=10)";
      case "POST":
        return "Request body parameters (sent as JSON in request body)";
      case "PUT":
        return "Path params like :id will be replaced, others sent in body";
      case "DELETE":
        return "Path params like :id will be replaced from these values";
      default:
        return "Request parameters";
    }
  };

  const handleCreateTool = async () => {
    if (!toolName || !toolDescription || !toolEndpoint || !selectedPage) return;

    try {
      // Parse headers and parameters, use empty object if empty
      let headersObj: Record<string, string> = {};
      let parametersObj: Record<string, string> = {};

      try {
        headersObj = toolHeaders ? JSON.parse(toolHeaders) : {};
      } catch {
        console.error("Invalid headers JSON, using empty object");
      }

      try {
        parametersObj = toolParameters ? JSON.parse(toolParameters) : {};
      } catch {
        console.error("Invalid parameters JSON, using empty object");
      }

      // Merge auth token into headers if provided
      if (authToken) {
        headersObj["Authorization"] = `Bearer ${authToken}`;
      }

      await createCustomToolMutation.mutateAsync({
        pageId: selectedPage,
        name: toolName,
        description: toolDescription,
        apiEndpoint: toolEndpoint,
        method: toolMethod,
        headers: JSON.stringify(headersObj),
        parameters: JSON.stringify(parametersObj),
      });

      // Reset form
      setToolName("");
      setToolDescription("");
      setToolEndpoint("");
      setAuthToken("");
      setToolHeaders("");
      setToolParameters("");
    } catch (error) {
      console.error("Failed to create tool:", error);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-6 backdrop-blur-xl">
      <h2 className="mb-4 text-lg font-semibold text-gray-100">
        Create Custom AI Tool
      </h2>
      <p className="mb-6 text-sm text-gray-400">
        Create custom AI tools with API integrations using LangGraph and Gemini.
      </p>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Tool Name
          </label>
          <input
            type="text"
            value={toolName}
            onChange={(e) => setToolName(e.target.value)}
            placeholder="e.g., Weather API, Stock Price Checker"
            className="w-full rounded-xl border border-slate-700/50 bg-slate-800/50 px-4 py-3 text-gray-200 focus:border-emerald-500/50 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Description
          </label>
          <textarea
            value={toolDescription}
            onChange={(e) => setToolDescription(e.target.value)}
            placeholder="Describe what this tool does..."
            rows={3}
            className="w-full resize-none rounded-xl border border-slate-700/50 bg-slate-800/50 px-4 py-3 text-gray-200 focus:border-emerald-500/50 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            API Endpoint
          </label>
          <input
            type="url"
            value={toolEndpoint}
            onChange={(e) => setToolEndpoint(e.target.value)}
            placeholder={getEndpointPlaceholder()}
            className="w-full rounded-xl border border-slate-700/50 bg-slate-800/50 px-4 py-3 text-gray-200 focus:border-emerald-500/50 focus:outline-none"
          />
          <p className="mt-1 text-xs text-gray-500">
            {toolMethod === "GET"
              ? "Base URL only - query params will be added automatically"
              : toolMethod === "POST"
                ? "Full endpoint URL for creating resources"
                : "Use :paramName for path parameters (e.g., /users/:id)"}
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            HTTP Method
          </label>
          <select
            value={toolMethod}
            onChange={(e) => setToolMethod(e.target.value)}
            className="w-full rounded-xl border border-slate-700/50 bg-slate-800/50 px-4 py-3 text-gray-200 focus:border-emerald-500/50 focus:outline-none"
          >
            <option value="GET">GET - Retrieve data</option>
            <option value="POST">POST - Create new resource</option>
            <option value="PUT">PUT - Update existing resource</option>
            <option value="DELETE">DELETE - Remove resource</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Auth Token (Optional)
          </label>
          <input
            type="password"
            value={authToken}
            onChange={(e) => setAuthToken(e.target.value)}
            placeholder="your-api-token-here (will be added as Bearer token)"
            className="w-full rounded-xl border border-slate-700/50 bg-slate-800/50 px-4 py-3 text-gray-200 focus:border-emerald-500/50 focus:outline-none"
          />
          <p className="mt-1 text-xs text-gray-500">
            If provided, will be added as "Authorization: Bearer token" header
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Headers (JSON)
          </label>
          <textarea
            value={toolHeaders}
            onChange={(e) => setToolHeaders(e.target.value)}
            placeholder={getHeadersPlaceholder()}
            rows={3}
            className="w-full resize-none rounded-xl border border-slate-700/50 bg-slate-800/50 px-4 py-3 font-mono text-sm text-gray-200 focus:border-emerald-500/50 focus:outline-none"
          />
          <p className="mt-1 text-xs text-gray-500">
            Additional headers (auth token will be auto-added if provided above)
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Parameters (JSON)
          </label>
          <textarea
            value={toolParameters}
            onChange={(e) => setToolParameters(e.target.value)}
            placeholder={getParametersPlaceholder()}
            rows={3}
            className="w-full resize-none rounded-xl border border-slate-700/50 bg-slate-800/50 px-4 py-3 font-mono text-sm text-gray-200 focus:border-emerald-500/50 focus:outline-none"
          />
          <p className="mt-1 text-xs text-gray-500">
            {getParametersHelpText()}
          </p>
        </div>

        <button
          onClick={handleCreateTool}
          disabled={
            !toolName ||
            !toolDescription ||
            !toolEndpoint ||
            !selectedPage ||
            createCustomToolMutation.isPending
          }
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 font-medium text-white transition-all hover:from-emerald-700 hover:to-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {createCustomToolMutation.isPending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Creating...</span>
            </>
          ) : (
            <>
              <Plus className="h-5 w-5" />
              <span>Create Tool</span>
            </>
          )}
        </button>
      </div>

      {!selectedPage && (
        <div className="mt-4 flex items-center gap-2 text-sm text-amber-400">
          <AlertCircle className="h-4 w-4" />
          <span>Please select a page first</span>
        </div>
      )}

      {/* Display existing custom tools */}
      {selectedPage && customToolsData && customToolsData.length > 0 && (
        <div className="mt-6 border-t border-slate-700/50 pt-6">
          <h3 className="text-md mb-4 font-semibold text-gray-200">
            Existing Tools ({customToolsData.length})
          </h3>
          <div className="space-y-3">
            {customToolsData.map((tool: CustomTool) => (
              <div
                key={tool.id}
                className="flex items-start justify-between gap-4 rounded-xl border border-slate-700/50 bg-slate-800/50 p-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <Wrench className="h-4 w-4 flex-shrink-0 text-purple-400" />
                    <h4 className="truncate text-sm font-medium text-gray-200">
                      {tool.name}
                    </h4>
                  </div>
                  <p className="mb-2 text-xs text-gray-400">
                    {tool.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="rounded bg-slate-700/50 px-2 py-1">
                      {tool.method}
                    </span>
                    <span className="truncate">{tool.apiEndpoint}</span>
                  </div>
                </div>
                <button
                  onClick={() =>
                    deleteCustomToolMutation.mutate({
                      id: tool.id,
                      pageId: selectedPage,
                    })
                  }
                  className="rounded-lg p-2 text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
                  title="Delete tool"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
