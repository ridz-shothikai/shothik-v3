"use client";

import { Card, CardContent } from "@/components/ui/card";

export default function SourcesContent({ sources }) {
  if (!sources || sources.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
        <h6 className="text-muted-foreground text-lg">No Sources Available</h6>
        <p className="text-muted-foreground text-sm">
          No sources were found for this research query
        </p>
      </div>
    );
  }

  // Remove duplicates based on URL
  const uniqueSources = sources.filter(
    (source, index, self) =>
      index === self.findIndex((s) => s.url === source.url),
  );

  return (
    <div className="mb-[4.25rem] px-2 py-3 sm:mb-7 md:mb-5">
      <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {uniqueSources.map((source, index) => (
          <Card
            key={source._id || index}
            className="cursor-pointer rounded-lg transition-all duration-200 hover:shadow-lg"
            onClick={() => window.open(source.url, "_blank")}
          >
            <CardContent className="p-4">
              <p className="flex items-center gap-1 text-base break-words">
                {source.title}
              </p>

              {(() => {
                const displayUrl = source.resolved_url || source.url;
                const hostname = new URL(displayUrl).hostname.replace(
                  "www.",
                  "",
                );
                return (
                  <div className="text-muted-foreground flex items-center gap-1 text-sm">
                    <img
                      src={`https://www.google.com/s2/favicons?sz=32&domain_url=${displayUrl}`}
                      alt=""
                      width={16}
                      height={16}
                    />
                    <span className="break-words">{hostname}</span>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
