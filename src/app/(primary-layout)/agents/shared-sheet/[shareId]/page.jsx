"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import {
  useCreateAgentReplicaMutation,
  useLazyVerifySharedAgentQuery,
} from "@/redux/api/shareAgent/shareAgentApi";
import { setShowLoginModal } from "@/redux/slices/auth";
import {
  ChevronDown,
  Download,
  Edit,
  ExternalLink,
  Save,
  Share2,
} from "lucide-react";
import { use, useEffect, useState } from "react";
import { DataGrid } from "react-data-grid";
import "react-data-grid/lib/styles.css";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";

// Editable Cell Component for shared sheets
const EditableCell = ({
  value,
  onValueChange,
  row,
  column,
  isEditing,
  onEdit,
}) => {
  const [editValue, setEditValue] = useState(value || "");

  useEffect(() => {
    setEditValue(value || "");
  }, [value]);

  const handleSave = () => {
    if (onValueChange) {
      onValueChange(row, column, editValue);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      setEditValue(value || "");
      onEdit && onEdit(null);
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  if (isEditing) {
    return (
      <input
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        autoFocus
        className="font-inherit w-full border-0 bg-transparent text-inherit outline-none"
      />
    );
  }

  return (
    <span
      onDoubleClick={() => onEdit && onEdit(`${row.id}-${column}`)}
      className="block w-full cursor-pointer"
    >
      {value || ""}
    </span>
  );
};

// Process sheet data for DataGrid
const processSheetData = (sheetData, onCellValueChange, editingCell) => {
  if (!sheetData || sheetData.length === 0) {
    return { columns: [], rows: [] };
  }

  // Get all unique column headers
  const headers = Array.from(
    new Set(sheetData.flatMap((row) => Object.keys(row))),
  );

  // Create columns
  const columns = headers.map((header) => ({
    key: header,
    name: header.charAt(0).toUpperCase() + header.slice(1).replace(/_/g, " "),
    width: Math.max(250, Math.min(350, header.length * 15)),
    resizable: true,
    sortable: true,
    renderCell: (params) => {
      const value = params.row[header];
      const cellKey = `${params.row.id}-${header}`;
      const isEditing = editingCell === cellKey;

      return (
        <EditableCell
          value={value}
          onValueChange={onCellValueChange}
          row={params.row}
          column={header}
          isEditing={isEditing}
          onEdit={(cellKey) => {
            // Handle edit state
          }}
        />
      );
    },
  }));

  // Process rows with proper IDs
  const rows = sheetData.map((row, index) => {
    return {
      ...row,
      id: row.id !== undefined ? row.id : `row-${index}`,
      _index: index,
    };
  });

  return { columns, rows };
};

export default function SharedSheetPage({ params }) {
  const { shareId } = use(params);
  const [sharedData, setSharedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCell, setEditingCell] = useState(null);
  const [pendingSaveAction, setPendingSaveAction] = useState(false);
  const { user } = useSelector((state) => state.auth);

  // Fallback: try to get user from localStorage if Redux state is not available
  const [localUser, setLocalUser] = useState(null);

  useEffect(() => {
    // Try to get user info from multiple possible locations in localStorage
    const possibleUserKeys = [
      "user",
      "userData",
      "authUser",
      "currentUser",
      "userInfo",
    ];

    for (const key of possibleUserKeys) {
      const userFromStorage = localStorage.getItem(key);
      if (userFromStorage) {
        try {
          const parsedUser = JSON.parse(userFromStorage);
          console.log(`Found user in localStorage key '${key}':`, parsedUser);
          setLocalUser(parsedUser);
          break; // Use the first valid user found
        } catch (e) {
          console.error(
            `Error parsing user from localStorage key '${key}':`,
            e,
          );
        }
      }
    }

    // Also try to get user ID directly from access token or other sources
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken && !localUser) {
      try {
        // Try to decode JWT token to get user info
        const tokenPayload = JSON.parse(atob(accessToken.split(".")[1]));
        if (tokenPayload && tokenPayload.userId) {
          console.log("Found user ID from access token:", tokenPayload);
          setLocalUser({ id: tokenPayload.userId, ...tokenPayload });
        }
      } catch (e) {
        console.log("Could not decode access token:", e);
      }
    }
  }, []);
  const dispatch = useDispatch();
  const [verifySharedAgent, { isLoading: isVerifying }] =
    useLazyVerifySharedAgentQuery();
  const [createAgentReplica, { isLoading: isReplicating }] =
    useCreateAgentReplicaMutation();

  useEffect(() => {
    const fetchSharedData = async () => {
      try {
        setLoading(true);
        console.log("Fetching shared data for shareId:", shareId);
        const result = await verifySharedAgent({ shareId }).unwrap();

        console.log("Shared data response:", result);

        if (result.success && result.data) {
          setSharedData(result.data);
          console.log("Shared data set:", result.data);
        } else {
          console.error("No data in response:", result);
          setError("Failed to load shared sheet data");
        }
      } catch (err) {
        console.error("Error fetching shared data:", err);
        setError("Failed to load shared sheet data");
      } finally {
        setLoading(false);
      }
    };

    if (shareId) {
      fetchSharedData();
    }
  }, [shareId, verifySharedAgent]);

  const handleCellValueChange = (rowObj, column, newValue) => {
    if (!sharedData?.content?.data) return;

    const updatedData = sharedData.content.data.map((row, index) => {
      if (row.id === rowObj.id || index === rowObj._index) {
        return { ...row, [column]: newValue };
      }
      return row;
    });

    setSharedData({
      ...sharedData,
      content: {
        ...sharedData.content,
        data: updatedData,
      },
    });
  };

  const handleSaveAndCopy = async () => {
    console.log("🚀 handleSaveAndCopy function called!");

    // Check if user is authenticated
    const currentUser = user || localUser;
    const accessToken = localStorage.getItem("accessToken");

    // More robust authentication check - user must have either user data OR accessToken
    if (
      !currentUser ||
      (Object.keys(currentUser).length === 0 && !accessToken)
    ) {
      console.log("❌ User not authenticated, opening login modal");
      console.log("   currentUser:", currentUser);
      console.log("   accessToken:", accessToken ? "exists" : "missing");

      // Set pending flag so we can retry after login
      setPendingSaveAction(true);

      // Show login modal
      dispatch(setShowLoginModal(true));

      // Show info message
      showSnackbar("Please log in to save this sheet to your account", "info");
      return;
    }

    console.log("✅ User authenticated:", currentUser);

    try {
      // Extract chat ObjectId from shared data
      // The correct path is: sharedData.agent.metadata.chatId (or originalChatId)
      let chatId =
        sharedData?.agent?.metadata?.chatId ||
        sharedData?.agent?.metadata?.originalChatId;

      console.log("🔍 Extracted chat ID from agent.metadata:", chatId);

      // Validate that we have a valid MongoDB ObjectId
      const isValidObjectId = chatId && /^[0-9a-fA-F]{24}$/.test(chatId);

      if (!chatId || !isValidObjectId) {
        console.error("❌ Invalid or missing chat ID");
        console.error(
          "sharedData.agent.metadata:",
          sharedData?.agent?.metadata,
        );
        showSnackbar(
          "Unable to find the original chat ID. This link may be invalid.",
          "error",
        );
        return;
      }

      console.log("✅ Using valid Chat ID:", chatId);

      // Get user ID
      let userId =
        currentUser?.id ||
        currentUser?.userId ||
        currentUser?._id ||
        currentUser?.user_id;

      // Try to get user ID from access token if not found
      if (!userId) {
        const accessToken = localStorage.getItem("accessToken");
        if (accessToken) {
          try {
            const tokenPayload = JSON.parse(atob(accessToken.split(".")[1]));
            userId = tokenPayload.userId || tokenPayload.id || tokenPayload.sub;
          } catch (e) {
            console.error("Could not decode access token:", e);
          }
        }
      }

      if (!userId) {
        console.error("User ID is missing");
        showSnackbar("User ID is missing. Please log in again.", "error");
        return;
      }

      console.log("Replicating chat:", { chatId, userId });

      // Get base URL from environment
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      console.log("🌐 Environment base URL:", baseUrl);

      if (!baseUrl) {
        console.error(
          "API base URL not configured - NEXT_PUBLIC_API_URL is missing",
        );
        showSnackbar("Configuration error. Please contact support.", "error");
        return;
      }

      // Construct the API URL
      // NEXT_PUBLIC_API_URL = https://api-qa.shothik.ai
      // We need to add: /sheet/chat/replicate_chat
      // Remove trailing slash if present
      const cleanBaseUrl = baseUrl.endsWith("/")
        ? baseUrl.slice(0, -1)
        : baseUrl;
      const apiUrl = `${cleanBaseUrl}/sheet/chat/replicate_chat`;

      console.log("🔗 Constructed API URL:", apiUrl);
      console.log(
        "✅ Expected URL:",
        "https://api-qa.shothik.ai/sheet/chat/replicate_chat",
      );

      // Prepare the request payload
      const requestPayload = {
        chat: chatId,
        replicate_to: userId,
      };

      const accessToken = localStorage.getItem("accessToken");
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      };

      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("📡 COMPLETE API REQUEST DETAILS");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("🔗 URL:", apiUrl);
      console.log("📍 Method: POST");
      console.log("");
      console.log("📦 Headers:");
      Object.entries(headers).forEach(([key, value]) => {
        if (key === "Authorization") {
          console.log(
            `   ${key}: Bearer ${value.split(" ")[1]?.substring(0, 30)}...`,
          );
        } else {
          console.log(`   ${key}: ${value}`);
        }
      });
      console.log("");
      console.log("📝 Request Body:");
      console.log("   Raw Object:", requestPayload);
      console.log("   JSON String:", JSON.stringify(requestPayload));
      console.log("   Formatted:");
      console.log(JSON.stringify(requestPayload, null, 2));
      console.log("");
      console.log("🔍 Payload Validation:");
      console.log("   chat ID:", chatId);
      console.log("   chat ID type:", typeof chatId);
      console.log("   chat ID length:", chatId?.length);
      console.log(
        "   chat ID is valid ObjectId:",
        /^[0-9a-fA-F]{24}$/.test(chatId),
      );
      console.log("   replicate_to ID:", userId);
      console.log("   replicate_to ID type:", typeof userId);
      console.log("   replicate_to ID length:", userId?.length);
      console.log(
        "   replicate_to ID is valid ObjectId:",
        /^[0-9a-fA-F]{24}$/.test(userId),
      );
      console.log("");
      console.log("✅ POSTMAN EQUIVALENT (copy this to test):");
      console.log(`curl -X POST '${apiUrl}' \\`);
      console.log(`  -H 'Content-Type: application/json' \\`);
      console.log(
        `  -H 'Authorization: Bearer ${accessToken?.substring(0, 30)}...' \\`,
      );
      console.log(`  -d '${JSON.stringify(requestPayload)}'`);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(requestPayload),
      });

      console.log("");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("📨 RESPONSE DETAILS");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("📊 Status:", response.status, response.statusText);
      console.log("🔗 URL:", response.url);
      console.log("✓ OK:", response.ok);
      console.log("📋 Type:", response.type);
      console.log("");
      console.log("📦 Response Headers:");
      response.headers.forEach((value, key) => {
        console.log(`   ${key}: ${value}`);
      });
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { message: await response.text() };
        }
        console.error("❌ API Error Response:", errorData);
        console.error("❌ Response Headers:", [...response.headers.entries()]);
        showSnackbar(
          errorData.message ||
            `Failed to save sheet (${response.status}). Please try again.`,
          "error",
        );
        return;
      }

      const result = await response.json();
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("✅ REPLICA CREATED SUCCESSFULLY!");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("📊 Response:", result);
      console.log(
        "🆔 Replicated Chat ID:",
        result.data?.replicatedChatId || result.replicatedChatId || chatId,
      );
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

      // Show success message
      showSnackbar(
        "Sheet saved to your account successfully! Redirecting...",
        "success",
      );

      // Redirect to the replicated chat page after a short delay
      setTimeout(() => {
        const replicatedChatId =
          result.data?.replicatedChatId || result.replicatedChatId || chatId;

        // Redirect to the agents sheets page with the replicated chat ID
        const redirectUrl = `/agents/sheets?id=${replicatedChatId}`;

        console.log("🔗 Redirecting to:", redirectUrl);
        window.location.href = redirectUrl;
      }, 1500);
    } catch (err) {
      console.error("Error creating replica:", err);
      showSnackbar("Failed to create a copy. Please try again.", "error");
    }
  };

  // Watch for user login and retry save action if pending
  useEffect(() => {
    const currentUser = user || localUser;
    const accessToken = localStorage.getItem("accessToken");

    // If user just logged in and there's a pending save action
    if (pendingSaveAction && (currentUser || accessToken)) {
      console.log("✅ User logged in! Retrying save action...");
      setPendingSaveAction(false);
      // Retry the save action
      setTimeout(() => {
        handleSaveAndCopy();
      }, 500); // Small delay to ensure auth state is fully updated
    }
  }, [user, localUser, pendingSaveAction]);

  const handleExportCSV = () => {
    if (!sharedData?.content?.data) return;

    const csvContent = convertToCSV(sharedData.content.data);
    downloadFile(csvContent, "shared-sheet.csv", "text/csv");
  };

  const handleExportExcel = () => {
    if (!sharedData?.content?.data) return;

    const ws = XLSX.utils.json_to_sheet(sharedData.content.data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet Data");
    XLSX.writeFile(wb, "shared-sheet.xlsx");
  };

  const convertToCSV = (data) => {
    if (!data || data.length === 0) return "";

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(","),
      ...data.map((row) =>
        headers.map((header) => `"${row[header] || ""}"`).join(","),
      ),
    ];
    return csvRows.join("\n");
  };

  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const showSnackbar = (message, severity = "success") => {
    if (severity === "error") {
      toast.error(message);
    } else if (severity === "info") {
      toast.info(message);
    } else {
      toast.success(message);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2">
        <Spinner className="size-10" />
        <p className="text-sm">Loading shared sheet...</p>
      </div>
    );
  }

  if (error || !sharedData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 p-3">
        <Alert variant="destructive" className="max-w-[500px]">
          <AlertDescription>
            {error || "Sheet not found or access denied"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Try different possible data structures
  let sheetData = [];
  if (sharedData?.content?.data) {
    sheetData = sharedData.content.data;
  } else if (sharedData?.data) {
    sheetData = sharedData.data;
  } else if (Array.isArray(sharedData)) {
    sheetData = sharedData;
  } else if (sharedData?.content && Array.isArray(sharedData.content)) {
    sheetData = sharedData.content;
  } else if (sharedData?.response?.rows) {
    // Handle the case where data is in response.rows (common structure)
    sheetData = sharedData.response.rows;
  } else if (sharedData?.rows) {
    // Handle the case where data is directly in rows
    sheetData = sharedData.rows;
  }

  // If no data found, create sample data for testing
  if (sheetData.length === 0) {
    sheetData = [
      { Rank: 1, RestaurantName: "Osteria France", Rating: "4.9/5" },
      { Rank: 2, RestaurantName: "Carbone", Rating: "4.8/5" },
      { Rank: 3, RestaurantName: "Trattoria Da Vittorio", Rating: "4.7/5" },
      { Rank: 4, RestaurantName: "Pizzeria Bianco", Rating: "4.7/5" },
      { Rank: 5, RestaurantName: "Il Posto", Rating: "4.6/5" },
    ];
  }

  const { columns, rows } = processSheetData(
    sheetData,
    handleCellValueChange,
    editingCell,
  );
  const hasData = rows.length > 0 && columns.length > 0;

  return (
    <main>
      {/* Sheet Title/Dropdown */}
      <div className="mb-2 flex items-center gap-1">
        <div className="bg-primary text-primary-foreground flex h-5 w-5 items-center justify-center rounded-full text-xs">
          ✓
        </div>
        <h2 className="text-foreground text-lg font-medium">
          List top 5 Italian restaurant...
        </h2>
      </div>

      {/* Action Buttons */}
      <div className="mb-3 flex gap-1">
        <Button variant="outline" className="rounded-lg px-2 py-1">
          <Edit className="size-4" />
          Edit Mode
        </Button>

        <Button variant="outline" className="rounded-lg px-2 py-1">
          <ExternalLink className="size-4" />
          View in New Window
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              disabled={!hasData}
              className="rounded-lg px-2 py-1"
            >
              <Download className="size-4" />
              Export
              <ChevronDown className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleExportCSV}>
              <Download className="size-4" />
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportExcel}>
              <Download className="size-4" />
              Export as Excel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="outline" className="rounded-lg px-2 py-1">
          <Share2 className="size-4" />
          Share
        </Button>

        {/* Save and Copy Button */}
        <Button
          variant="default"
          onClick={handleSaveAndCopy}
          disabled={isReplicating}
          className={cn(
            "ml-1 rounded-lg px-3 py-1.5 text-sm font-semibold",
            isReplicating && "cursor-not-allowed opacity-50",
          )}
        >
          {isReplicating ? (
            <>
              <Spinner className="size-4" />
              Saving...
            </>
          ) : (
            <>
              <Save className="size-4" />
              Save as Copy to My Chat
            </>
          )}
        </Button>
      </div>

      {/* Data Table */}
      <div className="h-[calc(100vh-300px)] min-h-[400px]">
        {hasData ? (
          <DataGrid
            rows={rows}
            columns={columns}
            defaultColumnOptions={{
              resizable: true,
              sortable: true,
            }}
            className="rdg-light border-border bg-background rounded-lg border"
            style={{
              fontFamily: "inherit",
            }}
            headerRowHeight={40}
            rowHeight={40}
          />
        ) : (
          <div className="bg-background border-border flex h-full flex-col items-center justify-center gap-2 rounded-lg border">
            <h3 className="text-muted-foreground text-lg">No data available</h3>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-2 flex items-center justify-between">
        <p className="text-muted-foreground text-xs">
          Last updated: {new Date().toLocaleTimeString()}
        </p>
        <p className="text-muted-foreground flex items-center gap-0.5 text-xs">
          <Edit className="size-3" />
          Double-click to edit cells
        </p>
      </div>
    </main>
  );
}
