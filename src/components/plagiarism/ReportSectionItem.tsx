import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PlagiarismSection } from "@/types/plagiarism";
import { getSimilarityTone } from "@/utils/plagiarism/riskHelpers";
import { ExternalLink, LinkIcon } from "lucide-react";

interface ReportSectionItemProps {
  section: PlagiarismSection;
  index: number;
}

const ReportSectionItem = ({ section, index }: ReportSectionItemProps) => {
  const sources = section.sources ?? [];
  const primarySource = sources[0];
  const similarityTone = getSimilarityTone(section.similarity);

  return (
    <AccordionItem
      value={`section-${index}`}
      className="bg-card/40 overflow-hidden rounded-xl border backdrop-blur"
    >
      <AccordionTrigger className="hover:bg-muted/50 px-4 py-3">
        <div className="flex w-full items-center gap-3 text-left">
          <span className={cn("text-sm font-semibold", similarityTone)}>
            {section.similarity}%
          </span>
          <div className="flex-1 space-y-1">
            <p className="text-foreground text-sm font-semibold">
              {primarySource?.title || "Possible paraphrased section"}
            </p>
            <p className="text-muted-foreground line-clamp-1 text-xs">
              {primarySource?.url || "Source details unavailable"}
            </p>
          </div>
          <Badge variant="secondary" className="hidden text-xs sm:inline-flex">
            {sources.length} {sources.length === 1 ? "source" : "sources"}
          </Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <div className="space-y-4 text-sm">
          <div className="bg-muted/40 text-foreground rounded-lg border p-3">
            <p className="text-muted-foreground mb-1 font-medium">
              Detected excerpt
            </p>
            <p className="leading-relaxed">
              {section.excerpt || "Excerpt unavailable."}
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
              Matched sources
            </p>
            {sources.length === 0 ? (
              <div className="text-muted-foreground rounded-md border border-dashed p-3 text-xs">
                No source metadata provided.
              </div>
            ) : (
              <ul className="space-y-3">
                {sources.map((source, sourceIndex) => (
                  <li
                    key={`${source.url}-${sourceIndex}`}
                    className="bg-background/60 rounded-lg border p-3 shadow-sm transition hover:shadow-md"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-foreground text-sm font-medium">
                          {source.title || "Unknown source"}
                        </p>
                        <a
                          href={source.url || undefined}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary mt-1 inline-flex items-center gap-1 text-xs hover:underline"
                        >
                          {source.url ? (
                            <>
                              <LinkIcon className="size-3" />
                              Visit source
                              <ExternalLink className="size-3" />
                            </>
                          ) : (
                            "Source link unavailable"
                          )}
                        </a>
                      </div>
                      <span
                        className={cn(
                          "text-xs font-semibold",
                          getSimilarityTone(source.similarity ?? 0),
                        )}
                      >
                        {source.similarity != null
                          ? `${source.similarity}%`
                          : "—"}
                      </span>
                    </div>
                    {source.snippet ? (
                      <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
                        {source.snippet}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default ReportSectionItem;
