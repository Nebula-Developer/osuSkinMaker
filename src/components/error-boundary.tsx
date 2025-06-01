import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; error?: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center p-8 bg-accent rounded-md w-full">
          <div className="text-center container flex flex-col items-center justify-center">
            <h1 className="text-xl font-bold">Something went wrong.</h1>
            
            {this.props.error || (
              <p className="mt-2 text-muted-foreground">
                A component has crashed. More details below.
              </p>
            )}

            <Accordion
              type="single"
              collapsible
              className="mt-12 container bg-card rounded-md px-6 py-2 shadow-md"
            >
              <AccordionItem value="item-1">
                <AccordionTrigger>Error Details</AccordionTrigger>
                <AccordionContent className="flex flex-col">
                  <pre>
                    {this.state.error?.message || "No error message available."}{" "}
                    <br />
                    Component Name:{" "}
                    <strong>
                      {(this.props.children as any)?.type?.name ||
                        "Unknown Component"}
                    </strong>
                  </pre>

                  {this.state.error?.stack && (
                    <div className="mt-2 text-left">
                      <strong>Stack Trace:</strong>

                      <pre className="whitespace-pre-wrap mt-2">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
