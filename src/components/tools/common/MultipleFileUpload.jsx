"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { toggleUpdateFileHistory } from "@/redux/slices/paraphraseHistorySlice";
import { CloudUpload, Download } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import UpgradePopover from "./UpgradePopover";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB
const FREE_LIMIT = 3;
const PAID_LIMIT = 250;

export default function MultipleFileUpload({
  paidUser,
  selectedMode,
  selectedSynonymLevel,
  selectedLang,
  freezeWords = [],
  shouldShowButton = true,
}) {
  const { accessToken } = useSelector((state) => state.auth);

  const dispatch = useDispatch();

  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [popoverAnchorEl, setPopoverAnchorEl] = useState(null);
  const inputRef = useRef(null);

  const limit = paidUser ? PAID_LIMIT : FREE_LIMIT;
  const redirectPrefix = "p-v2";
  const apiBase = `${process.env.NEXT_PUBLIC_API_URL}/${redirectPrefix}/api`;

  const handleOpen = (event) => {
    if (paidUser) {
      setOpen(true);
    } else {
      setPopoverAnchorEl(event.currentTarget);
    }
  };

  const handlePopoverClose = () => setPopoverAnchorEl(null);

  const handleClose = () => {
    setFiles([]);
    setOpen(false);
  };

  const handleFilesSelected = (fileList) => {
    let incoming = Array.from(fileList).slice(0, limit);

    if (!accessToken) {
      setFiles(
        incoming.map((file) => ({
          file,
          status: "error",
          progress: 0,
          error: "Please log in to upload files",
        })),
      );
      return;
    }

    const mapped = incoming.map((file) => {
      if (!/\.(pdf|docx|txt)$/i.test(file.name)) {
        return {
          file,
          status: "error",
          progress: 0,
          error: "Unsupported format",
        };
      }
      if (file.size > MAX_FILE_SIZE) {
        return {
          file,
          status: "error",
          progress: 0,
          error: "File must be ≤ 25 MB",
        };
      }
      return {
        file,
        status: "idle",
        progress: 0,
        downloadUrl: null,
        error: null,
      };
    });

    setFiles(mapped);

    mapped.forEach((f, i) => {
      if (f.status === "idle") uploadFile(f.file, i);
    });
  };

  const onDrop = (e) => {
    e.preventDefault();
    handleFilesSelected(e.dataTransfer.files);
  };

  const onDragOver = (e) => e.preventDefault();

  const uploadFile = async (file, idx) => {
    updateFileStatus(idx, "uploading", 0);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("mode", selectedMode?.toLowerCase() ?? "");
      formData.append("synonym", selectedSynonymLevel?.toLowerCase() ?? "");
      formData.append("freeze", freezeWords);
      formData.append("language", selectedLang ?? "");

      const res = await fetch(`${apiBase}/files/file-paraphrase`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      });

      if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      updateFileStatus(idx, "success", 100, url);
      dispatch(toggleUpdateFileHistory());
    } catch (err) {
      updateFileStatus(idx, "error", 0, null, err.message);
    }
  };

  const updateFileStatus = (
    idx,
    status,
    progress,
    downloadUrl = null,
    error = null,
  ) => {
    setFiles((fs) =>
      fs.map((f, i) =>
        i === idx ? { ...f, status, progress, downloadUrl, error } : f,
      ),
    );
  };

  return (
    <>
      <Button
        id="multi_upload_button"
        onClick={handleOpen}
        className={`items-center gap-2 ${shouldShowButton ? "inline-flex" : "hidden"}`}
      >
        <Image
          src="/icons/cloud.svg"
          alt="upload"
          width={16}
          height={16}
          className="h-4 w-4 lg:h-4 lg:w-4"
        />
        <span>Multi Upload Document</span>
      </Button>
      <Button
        id="multi_upload_close_button"
        className={`${shouldShowButton ? "flex" : "hidden"} absolute top-[-9999px] -z-50 opacity-0`}
        onClick={handleClose}
      />
      <Dialog open={open} onOpenChange={(v) => (!v ? handleClose() : null)}>
        <DialogContent showCloseButton={true}>
          <DialogHeader>
            <DialogTitle>Upload Multiple Documents</DialogTitle>
          </DialogHeader>
          <div
            id="multi_upload_view"
            onDrop={onDrop}
            onDragOver={onDragOver}
            className="border-border mb-2 cursor-pointer rounded-lg border-2 border-dashed p-4 text-center"
            onClick={() => inputRef.current?.click()}
          >
            <CloudUpload className="text-muted-foreground mb-1 inline-block size-8" />
            <div className="text-base font-medium">
              Upload Multiple Documents
            </div>
            <div className="text-muted-foreground mb-1 text-sm">
              Drop files here or <b>browse</b> your machine
            </div>
            <div className="text-muted-foreground text-xs">
              pdf, txt, docx — up to {limit} file{limit > 1 ? "s" : ""} at once
            </div>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept=".pdf,.docx,.txt"
              hidden
              onChange={(e) => handleFilesSelected(e.target.files)}
            />
          </div>
          <div className="space-y-2">
            {files.map((f, i) => (
              <div key={i} className="flex flex-col py-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">
                      {f.file.name}
                    </div>
                    <div
                      className={`text-xs ${f.error ? "text-destructive" : "text-muted-foreground"}`}
                    >
                      {f.error
                        ? f.error
                        : f.status === "success"
                          ? "Completed"
                          : f.status === "uploading"
                            ? "Uploading…"
                            : ""}
                    </div>
                  </div>
                  {f.status === "success" && f.downloadUrl && (
                    <a
                      href={f.downloadUrl}
                      download={f.file.name}
                      className="text-muted-foreground hover:text-foreground inline-flex items-center justify-center rounded-md p-2"
                    >
                      <Download className="size-4" />
                    </a>
                  )}
                </div>
                {(f.status === "uploading" || f.status === "success") && (
                  <div className="mt-1">
                    <Progress value={f.progress} />
                  </div>
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <div className="text-muted-foreground mr-auto pl-1 text-xs">
              {paidUser
                ? `Up to ${PAID_LIMIT} files per batch`
                : `Free users: ${FREE_LIMIT} files per batch`}
            </div>
            <Button onClick={handleClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <UpgradePopover
        anchorEl={popoverAnchorEl}
        onClose={handlePopoverClose}
        message="Unlock document upload and more premium features."
        redirectPath="/pricing?redirect=/paraphrase"
      />
    </>
  );
}
