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

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center p-8 bg-accent rounded-md w-full">
          <div className="text-center flex flex-col items-center justify-center">
            <h1 className="text-xl font-bold">Something went wrong.</h1>

            {this.props.error || (
              <p className="mt-2 text-muted-foreground">
                A component has crashed. More details below.
              </p>
            )}

            <Accordion
              type="single"
              collapsible
              className="mt-12 bg-card rounded-md px-6 py-2 shadow-md w-full"
            >
              <AccordionItem value="item-1">
                <AccordionTrigger>Error Details</AccordionTrigger>
                <AccordionContent className="flex flex-col max-w-full">
                  <div className="text-sm text-muted-foreground font-mono">
                    {this.state.error?.message || "No error message available."}{" "}
                    <br />
                    Component Name:{" "}
                    <strong>
                      {(this.props.children as any)?.type?.name ||
                        "Unknown Component"}
                    </strong>
                  </div>
                </AccordionContent>
              </AccordionItem>
              {this.state.error?.stack && (
                <AccordionItem value="item-2">
                  <AccordionTrigger>Stack Trace</AccordionTrigger>
                  <AccordionContent>
                    <pre className="text-left whitespace-pre-line break-all">
                      {this.state.error.stack}
                    </pre>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
