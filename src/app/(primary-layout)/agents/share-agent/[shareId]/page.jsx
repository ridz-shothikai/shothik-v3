"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import {
  useCreateAgentReplicaMutation,
  useLazyVerifySharedAgentQuery,
} from "@/redux/api/shareAgent/shareAgentApi";
import { setShowLoginModal } from "@/redux/slices/auth";
import { ArrowLeft, Eye, Save, User } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const SharedAgentPage = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { shareId } = params;

  const [password, setPassword] = useState("");
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [error, setError] = useState(null);
  const [sharedData, setSharedData] = useState(null);

  const { accessToken, user } = useSelector((state) => state.auth);
  const isAuthenticated = !!accessToken;
  const dispatch = useDispatch();

  const [verifySharedAgent, { isLoading, data, error: verifyError }] =
    useLazyVerifySharedAgentQuery();
  const [createReplica, { isLoading: isCreatingReplica }] =
    useCreateAgentReplicaMutation();

  useEffect(() => {
    console.log("Component mounted, auth state:", {
      accessToken,
      isAuthenticated,
      user,
    });
    if (shareId) {
      loadSharedAgent();
    }
  }, [shareId]);

  // Debug auth state changes
  useEffect(() => {
    console.log("Auth state changed:", { accessToken, isAuthenticated, user });
  }, [accessToken, isAuthenticated, user]);

  useEffect(() => {
    if (verifyError) {
      const errorData = verifyError?.data;
      if (errorData?.requiresPassword) {
        setPasswordDialogOpen(true);
      } else if (errorData?.requiresAuth) {
        setError("Please sign in to view this shared content");
      } else {
        setError(errorData?.error || "Failed to load shared content");
      }
    }
  }, [verifyError]);

  useEffect(() => {
    if (data?.success) {
      setSharedData(data.data);
      setError(null);
    }
  }, [data]);

  const loadSharedAgent = async () => {
    try {
      await verifySharedAgent({
        shareId,
        password: password || undefined,
      }).unwrap();
    } catch (err) {
      console.error("Error loading shared agent:", err);
    }
  };

  const handlePasswordSubmit = () => {
    if (!password) {
      setError("Password is required");
      return;
    }
    setPasswordDialogOpen(false);
    loadSharedAgent();
  };

  const handleSaveAsCopy = async () => {
    console.log("Save as Copy clicked:", {
      accessToken,
      isAuthenticated,
      user,
      shareId,
      authState: { accessToken, isAuthenticated, user },
    });

    if (!isAuthenticated || !user) {
      console.log("User not authenticated, opening login modal");
      // Open the login modal instead of redirecting
      dispatch(setShowLoginModal(true));
      return;
    }

    console.log(
      "User authenticated, creating replica and redirecting to research page",
    );

    try {
      // Create replica first
      const response = await createReplica({
        sharedAgentId: sharedData.agent._id,
        currentUserId: user?.id,
        source: "shared_link",
        metadata: {
          sharedBy: sharedData.shareInfo.sharedBy,
          shareType: sharedData.shareInfo.visibility,
          originalShareId: shareId,
        },
      }).unwrap();

      console.log("Replica creation response:", response);

      if (response.success) {
        // Redirect to the research page with the new agent ID
        router.push(`/agents/research?id=${response.newAgentId}`);
      } else {
        setError(
          response.message ||
            "Failed to create copy. This feature is coming soon.",
        );
      }
    } catch (err) {
      console.error("Error creating replica:", err);
      setError(
        err?.data?.message ||
          "Failed to create a copy. This feature is coming soon.",
      );
    }
  };

  // Function to process markdown content to HTML
  const processMarkdownContent = (content) => {
    if (!content) return "";

    let processed = content
      // Remove reference links
      ?.replace(/<span[^>]*class="reference-link"[^>]*>.*?<\/span>/g, "")
      // Convert [1], [2], etc. to superscript
      ?.replace(/\[(\d+)\]/g, "<sup>$1</sup>")
      // Convert markdown headers
      ?.replace(/^### (.*$)/gim, "<h3>$1</h3>")
      ?.replace(/^## (.*$)/gim, "<h2>$1</h2>")
      ?.replace(/^# (.*$)/gim, "<h1>$1</h1>")
      // Convert markdown bold
      ?.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      // Convert markdown italic (but not bullet points)
      ?.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>")
      // Split into lines for processing
      ?.split("\n");

    // Process each line
    let htmlLines = [];
    let inList = false;

    for (let i = 0; i < processed.length; i++) {
      const line = processed[i].trim();

      if (line.startsWith("* ") && !line.startsWith("**")) {
        // Start of a list
        if (!inList) {
          htmlLines.push("<ul>");
          inList = true;
        }
        htmlLines.push(`<li>${line.substring(2)}</li>`);
      } else {
        // End of list
        if (inList) {
          htmlLines.push("</ul>");
          inList = false;
        }

        if (line) {
          htmlLines.push(`<p>${line}</p>`);
        }
      }
    }

    // Close any remaining list
    if (inList) {
      htmlLines.push("</ul>");
    }

    return htmlLines.join("");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <Spinner className="size-12" />
        <p className="text-muted-foreground">Loading shared content...</p>
      </div>
    );
  }

  if (error && !passwordDialogOpen) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/")}
              className="ml-4"
            >
              Go Home
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!sharedData) {
    return null;
  }

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 size-4" />
            Back to Home
          </Button>

          <Card>
            <CardContent className="p-6">
              <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <h1 className="mb-2 text-2xl font-semibold">
                    Shared AI Research
                  </h1>
                  <div className="mb-2 flex items-center gap-2">
                    <User className="text-muted-foreground size-4" />
                    <p className="text-muted-foreground text-sm">
                      Shared by: {sharedData.shareInfo.sharedBy.name}
                    </p>
                  </div>
                  {sharedData.shareInfo.message && (
                    <Alert className="mt-4">
                      <AlertDescription>
                        {sharedData.shareInfo.message}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={
                      sharedData.shareInfo.visibility === "public"
                        ? "default"
                        : "outline"
                    }
                  >
                    <Eye className="mr-1 size-3" />
                    {sharedData.shareInfo.visibility}
                  </Badge>
                  {sharedData.shareInfo.views !== null && (
                    <Badge variant="outline">
                      {sharedData.shareInfo.views} views
                    </Badge>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap gap-2">
                <Button
                  variant="default"
                  onClick={() => {
                    console.log("Button clicked - before handleSaveAsCopy");
                    handleSaveAsCopy();
                  }}
                  disabled={isCreatingReplica}
                >
                  {isCreatingReplica ? (
                    <>
                      <Spinner className="mr-2 size-4" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 size-4" />
                      Save as Copy to My Chat
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Research Content Display - Matching Research Agent Page Design */}
        <div className="mx-auto max-w-full">
          {sharedData.agent.type === "research" ? (
            <div>
              {/* Main Title */}
              {sharedData.agent.title && (
                <h2 className="text-foreground mb-6 text-center text-2xl font-bold">
                  {sharedData.agent.title}
                </h2>
              )}

              {/* Research Content */}
              <div
                className={cn(
                  "[&_h1]:text-foreground [&_h1]:mt-8 [&_h1]:mb-4 [&_h1]:text-3xl [&_h1]:font-semibold",
                  "[&_h2]:text-foreground [&_h2]:mt-8 [&_h2]:mb-4 [&_h2]:text-2xl [&_h2]:font-semibold",
                  "[&_h3]:text-foreground [&_h3]:mt-8 [&_h3]:mb-4 [&_h3]:text-xl [&_h3]:font-semibold",
                  "[&_h4]:text-foreground [&_h4]:mt-8 [&_h4]:mb-4 [&_h4]:text-xl [&_h4]:font-semibold",
                  "[&_h5]:text-foreground [&_h5]:mt-8 [&_h5]:mb-4 [&_h5]:text-xl [&_h5]:font-semibold",
                  "[&_h6]:text-foreground [&_h6]:mt-8 [&_h6]:mb-4 [&_h6]:text-xl [&_h6]:font-semibold",
                  "[&_p]:text-foreground [&_p]:mb-4 [&_p]:text-justify [&_p]:text-base [&_p]:leading-relaxed",
                  "[&_strong]:text-foreground [&_strong]:font-semibold",
                  "[&_b]:text-foreground [&_b]:font-semibold",
                  "[&_em]:italic",
                  "[&_i]:italic",
                  "[&_ul]:mt-2 [&_ul]:mb-4 [&_ul]:pl-12",
                  "[&_ol]:mt-2 [&_ol]:mb-4 [&_ol]:pl-12",
                  "[&_li]:mb-2 [&_li]:ml-4 [&_li]:list-disc [&_li]:leading-relaxed",
                  "[&_blockquote]:border-primary [&_blockquote]:text-muted-foreground [&_blockquote]:mb-4 [&_blockquote]:border-l-4 [&_blockquote]:pl-4 [&_blockquote]:italic",
                  "[&_code]:bg-muted [&_code]:rounded [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-sm",
                  "[&_pre]:bg-muted [&_pre]:mb-4 [&_pre]:overflow-auto [&_pre]:rounded [&_pre]:p-4",
                  "[&_a]:text-primary [&_a]:underline",
                  "[&_sup]:text-primary [&_sup]:ml-0.5 [&_sup]:text-xs [&_sup]:font-semibold",
                  '[&_span[class*="reference-link"]]:hidden',
                )}
                dangerouslySetInnerHTML={{
                  __html: processMarkdownContent(sharedData.agent.content),
                }}
              />

              {/* Sources Section - Matching Research Agent Page */}
              {sharedData.agent.sources &&
                sharedData.agent.sources.length > 0 && (
                  <div className="mt-12">
                    <h3 className="text-foreground mb-6 text-xl font-semibold">
                      References
                    </h3>

                    <div className="mb-4 flex flex-col flex-wrap gap-4 md:flex-row">
                      {sharedData.agent.sources
                        .slice(0, 6)
                        .map((source, index) => (
                          <div
                            key={index}
                            className={cn(
                              "border-border bg-card hover:bg-muted flex-[1_1_100%] rounded-lg border p-4 transition-colors",
                              "md:min-w-[calc(50%-8px)] md:flex-[1_1_calc(50%-8px)]",
                            )}
                          >
                            <div className="mb-2 flex items-center gap-2">
                              <div className="bg-primary flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                                <span className="text-primary-foreground text-xs font-bold">
                                  {index + 1}
                                </span>
                              </div>
                              <p className="text-foreground truncate text-sm font-semibold">
                                {source.title ||
                                  source.domain ||
                                  `Source ${index + 1}`}
                              </p>
                            </div>
                            <p className="text-muted-foreground block max-w-full truncate text-xs">
                              {source.url ||
                                source.domain ||
                                "No URL available"}
                            </p>
                          </div>
                        ))}
                    </div>

                    {sharedData.agent.sources.length > 6 && (
                      <p className="text-primary mb-6 cursor-pointer text-sm underline">
                        +{sharedData.agent.sources.length - 6} more sources
                        available
                      </p>
                    )}
                  </div>
                )}
            </div>
          ) : sharedData.agent.messages ? (
            // Regular agent messages display
            sharedData.agent.messages.map((message, index) => (
              <Card
                key={index}
                className={cn(
                  "mb-4 border-l-4 p-6",
                  message.role === "user"
                    ? "bg-muted/50 border-l-primary"
                    : "border-l-primary",
                )}
              >
                <div className="mb-2 flex items-center gap-2">
                  <Badge
                    variant={message.role === "user" ? "default" : "secondary"}
                  >
                    {message.role === "user" ? "You" : "AI Assistant"}
                  </Badge>
                </div>
                <p className="text-base whitespace-pre-wrap">
                  {typeof message.content === "string"
                    ? message.content
                    : message.content?.message ||
                      message.content?.data?.content ||
                      JSON.stringify(message.content, null, 2)}
                </p>
              </Card>
            ))
          ) : (
            <Alert>
              <AlertDescription>No content available</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <p className="text-muted-foreground text-xs">
            Shared on{" "}
            {new Date(sharedData.shareInfo.createdAt).toLocaleDateString()} via
            Shothik AI
          </p>
        </div>
      </div>

      {/* Password Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Password Required</DialogTitle>
            <DialogDescription className="mb-4">
              This shared content is password protected. Please enter the
              password to continue.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                autoFocus
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handlePasswordSubmit()}
                aria-invalid={!!error}
              />
              {error && <p className="text-destructive text-sm">{error}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => router.push("/")}>
              Cancel
            </Button>
            <Button
              onClick={handlePasswordSubmit}
              variant="default"
              disabled={!password}
            >
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SharedAgentPage;
