import { ChevronDown } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function ToolsSepecigFaq({ tag, data }) {
  return (
    <div>
      <h2 className="text-3xl font-bold text-center">
        Frequently Asked Questions
      </h2>

      <p className="text-base text-center text-muted-foreground mb-20">
        {tag}
      </p>

      <div className="max-w-[800px] mx-auto">
        <Accordion type="single" collapsible className="space-y-12">
          {data.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-b">
              <AccordionTrigger className="text-left hover:no-underline py-4 sm:py-6">
                <span className="text-base font-medium">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
