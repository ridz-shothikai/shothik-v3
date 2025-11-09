import { Accordion } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import type { PlagiarismSection } from "@/types/plagiarism";
import EmptyReportState from "./EmptyReportState";
import ReportSectionItem from "./ReportSectionItem";

interface ReportSectionListProps {
  sections: PlagiarismSection[];
  loading: boolean;
}

const ReportSectionList = ({ sections, loading }: ReportSectionListProps) => {
  if (loading && sections.length === 0) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <EmptyReportState
        title="No overlapping passages detected"
        description="Your content looks original. Keep writing confidently! If you’ve updated the text, run another scan to be sure."
      />
    );
  }

  return (
    <Accordion type="single" collapsible className="space-y-3">
      {sections.map((section, idx) => (
        <ReportSectionItem
          key={`report-section-${idx}`}
          section={section}
          index={idx}
        />
      ))}
    </Accordion>
  );
};

export default ReportSectionList;
