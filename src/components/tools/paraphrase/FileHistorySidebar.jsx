"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Download,
  Edit2,
  Loader2,
  MoreVertical,
  Plus,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import UpgradePopover from "../common/UpgradePopover"; // Import UpgradePopover

export default function FileHistorySidebar({ fetchFileHistories }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // const [isLoading, setIsLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [newFilename, setNewFilename] = useState("");
  const { accessToken } = useSelector((state) => state.auth);
  const [popoverAnchorEl, setPopoverAnchorEl] = useState(null); // State for popover

  const [search, setSearch] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  const dispatch = useDispatch();
  const {
    fileHistories = [],
    fileHistoryGroups = [],
    fileHistoriesMeta,
    isUpdatedFileHistory,
    isFileHistoryLoading: isLoading,
  } = useSelector((state) => state.paraphraseHistory);

  const { page = 1, limit = 10, total = 0 } = fileHistoriesMeta || {};
  const hasMore = (fileHistories?.length || 0) < total;

  const API_BASE = process.env.NEXT_PUBLIC_API_URL + "/p-v2/api";

  // const API_BASE = "http://localhost:3050/api";

  const handlePopoverClose = () => setPopoverAnchorEl(null); // Popover close handler

  // Trigger upload button
  const handleAddClick = (event) => {
    if (!accessToken) {
      setPopoverAnchorEl(event.currentTarget);
    } else {
      document.querySelector("#multi_upload_button")?.click();
    }
  };

  // Sidebar toggles
  const handleBookClick = () => setIsSidebarOpen(true);
  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    // Reset search when closing sidebar
    setSearch("");
  };
  const handleNewClick = (event) => {
    if (!accessToken) {
      setPopoverAnchorEl(event.currentTarget);
    } else {
      handleAddClick(event);
      handleCloseSidebar();
    }
  };

  // Menu handlers
  const handleMenuOpen = (event, item) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedItem(null);
  };

  const handleDownloadClick = () => {
    if (selectedItem) {
      handleDownload(selectedItem._id, selectedItem.filename);
    }
    handleMenuClose();
  };

  const handleRenameClick = () => {
    if (selectedItem) {
      setNewFilename(selectedItem.filename || "");
      setRenameDialogOpen(true);
    }
  };

  const handleDeleteClick = () => {
    if (selectedItem) {
      handleDelete(selectedItem._id);
    }
    handleMenuClose();
  };

  const handleRenameSubmit = async () => {
    if (selectedItem && newFilename.trim()) {
      await handleRename(selectedItem?._id, newFilename.trim());
      setRenameDialogOpen(false);
      setNewFilename("");
      handleMenuClose();
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    fetchFileHistories({ page: nextPage, limit, search });
  };

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchLoading(true);
      fetchFileHistories({ reset: true, search }).finally(() =>
        setSearchLoading(false),
      );
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [search]);

  // Download handler
  const handleDownload = async (id, filename) => {
    setDownloadingId(id);
    try {
      const res = await fetch(`${API_BASE}/files/file-download/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename || "download";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;
    try {
      const res = await fetch(`${API_BASE}/files/file-delete/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
      });
      if (!res.ok) throw new Error("Failed to delete history entry");
      await fetchFileHistories({ reset: true, search });
    } catch (err) {
      console.error(err);
    }
  };

  const handleRename = async (id, filename) => {
    try {
      const res = await fetch(`${API_BASE}/files/file-rename/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
        body: JSON.stringify({ filename }),
      });
      if (!res.ok) throw new Error("Failed to rename file");
      await fetchFileHistories({ reset: true, search });
    } catch (err) {
      console.error(err);
    }
  };

  const getIconPath = (type) => {
    switch (type) {
      case "docx":
        return "/icons/docx.svg";
      case "pdf":
        return "/icons/pdf.svg";
      case "txt":
        return "/icons/txt.svg";
      default:
        return null;
    }
  };

  const formatTime = (ts) =>
    new Date(ts).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const clearSearch = () => {
    setSearch("");
  };

  return (
    <>
      <div
        id="file_history_buttons"
        className={cn(
          "border-border bg-card flex flex-col gap-1 rounded-md border p-1.5 md:p-2",
        )}
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                id="file_history_view_button"
                variant="ghost"
                size="icon"
                onClick={handleBookClick}
                className="h-8 w-8"
              >
                <Image
                  src={"/icons/file.svg"}
                  alt="file"
                  width={24}
                  height={24}
                  className="h-5 w-5 lg:h-6 lg:w-6"
                />
                <span className="sr-only">Saved Files</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Saved document</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleAddClick}
                className="hidden h-8 w-8 md:inline-flex"
              >
                <Plus className="h-5 w-5" />
                <span className="sr-only">Add new document</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Add new document</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <Sheet
        open={isSidebarOpen}
        onOpenChange={(open) =>
          !open ? handleCloseSidebar() : setIsSidebarOpen(open)
        }
      >
        <SheetContent side="left" className="w-[100vw] p-0 sm:w-[360px]">
          <div
            id="file_history_view"
            className="bg-background flex h-full flex-col p-4"
          >
            <button onClick={handleCloseSidebar} className="sr-only" />
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Documents</h3>
            </div>

            {/* Search Input */}
            <div className="relative mb-2">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search documents..."
                value={search}
                onChange={handleSearchChange}
                className="pr-9 pl-9"
              />
              {search ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={clearSearch}
                  className="absolute top-0 right-0 h-9 w-9"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              ) : null}
            </div>

            <ScrollArea className="flex-1">
              {isLoading || searchLoading ? (
                <div className="space-y-2 p-2">
                  {[...Array(5)]?.map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : fileHistories?.length > 0 ? (
                <>
                  <div className="divide-border divide-y">
                    {fileHistories?.map((item) => (
                      <div key={item._id} className="flex items-center py-2">
                        <div className="mr-2 shrink-0">
                          {getIconPath(item.file_type) && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={getIconPath(item.file_type)}
                              alt="icon"
                              className="h-6 w-6"
                            />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium">
                            {item.filename || "Unnamed File"}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {formatTime(item.timestamp)}
                          </div>
                        </div>
                        <div className="ml-2 flex items-center">
                          {item.is_download && downloadingId === item._id ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : null}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => handleMenuOpen(e, item)}
                                className="ml-1"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={handleDownloadClick}
                                disabled={!selectedItem?.is_download}
                              >
                                <Download className="mr-2 h-4 w-4" /> Download
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={handleRenameClick}>
                                <Edit2 className="mr-2 h-4 w-4" /> Rename
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={handleDeleteClick}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Load More Button - Only show if not searching and has more */}
                  {hasMore && !search && (
                    <div className="mt-2 mb-2 flex justify-center">
                      <Button
                        variant="outline"
                        onClick={handleLoadMore}
                        disabled={isLoading}
                        className="px-4"
                      >
                        {isLoading ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          "Read More"
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Search results info */}
                  {search && fileHistories?.length > 0 && (
                    <p className="text-muted-foreground mt-1 mb-1 text-center text-sm">
                      Found {fileHistories?.length} result(s) for ({search})
                    </p>
                  )}
                </>
              ) : (
                <div className="p-4 text-center">
                  <BookOpen className="text-primary mx-auto h-12 w-12" />
                  <p className="text-muted-foreground mt-2">
                    {search
                      ? `No documents found for "${search}"`
                      : "All of your stored documents can be found here."}
                  </p>
                  {search && (
                    <Button
                      variant="outline"
                      onClick={clearSearch}
                      className="mt-2"
                    >
                      Clear Search
                    </Button>
                  )}
                </div>
              )}
            </ScrollArea>

            <Button onClick={handleNewClick} className="mt-2">
              <Plus className="mr-2 h-4 w-4" /> New
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Options Menu is integrated per-item via DropdownMenu above */}

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Rename File</DialogTitle>
          </DialogHeader>
          <Input
            autoFocus
            value={newFilename}
            onChange={(e) => setNewFilename(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleRenameSubmit();
              }
            }}
            className="mt-2"
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRenameSubmit} disabled={!newFilename.trim()}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <UpgradePopover
        anchorEl={popoverAnchorEl}
        onClose={handlePopoverClose}
        message="Log in to upload documents."
        redirectPath="/pricing?redirect=/paraphrase"
      />
    </>
  );
}
