import { Navbar } from "./components/navbar";
import { EditorSidebar } from "./components/component-editor";
import { Button } from "./components/ui/button";
import { TestComponent } from "./lib/elements";
import { useComponent, useElement } from "./store/skinStore";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "./components/ui/accordion";
import { Badge } from "./components/ui/badge";
import type { ElementComponentData, Element } from "./lib/types";
import { SkinCanvasView } from "./components/skin-view";
import { ErrorBoundary } from "./components/error-boundary";
import { useEffect } from "react";

function Crasher() {
  useEffect(() => {
    throw new Error("Crash in useEffect!");
  }, []);
  return <div>Crash Component</div>;
}
function ComponentView({
  elementIndex,
  componentIndex,
  data,
  element,
}: {
  elementIndex: number;
  componentIndex: number;
  data: ElementComponentData;
  element: Element;
}) {
  const { handleUpdate, handleMoveUp, handleMoveDown } = useComponent(
    elementIndex,
    componentIndex
  );

  return (
    <div className="p-5 border-b last:border-b-0">
      <div className="flex gap-2 mb-2">
        <h3 className="text-lg font-semibold">{data.component.name}</h3>
        {data.customName && <Badge>{data.customName}</Badge>}
      </div>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <Button variant="default" className="w-full justify-between" asChild>
            <AccordionTrigger>Edit Properties</AccordionTrigger>
          </Button>
          <AccordionContent
            className="flex flex-col gap-4 text-balance"
            animate={false}
          >
            <EditorSidebar
              component={data}
              updateValues={(props) => handleUpdate({ props })}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="mt-2">
        <Button
          variant="outline"
          onClick={handleMoveUp}
          disabled={componentIndex === 0}
        >
          Move Up
        </Button>
        <Button
          variant="outline"
          className="ml-2"
          onClick={handleMoveDown}
          disabled={componentIndex === element.components.length - 1}
        >
          Move Down
        </Button>
      </div>
    </div>
  );
}

function App() {
  const { element, components, addComponent, removeComponent } = useElement(0);

  return (
    <ErrorBoundary>
      <Navbar />

      <div className="flex flex-col">
        {components.map((component, index) => (
          <ErrorBoundary
            error={
              <div>
                <p className="mt-2 text-muted-foreground">
                  A component has crashed. This may be due to an error in the
                  component's code.
                </p>

                <Button
                  variant="destructive"
                  className="mt-2"
                  onClick={() =>
                    removeComponent(index)
                  }
                >
                  Remove Component
                </Button>
              </div>
            }
          >
            <ComponentView
              key={(component.customName ?? index) + component.component.name}
              elementIndex={0}
              componentIndex={index}
              data={component}
              element={element}
            />
          </ErrorBoundary>
        ))}
      </div>

      <div className="p-5">
        <Button
          variant="secondary"
          onClick={() => addComponent(TestComponent, randChars(5))}
        >
          Add Test Component
        </Button>
      </div>

      <div className="w-screen h-screen bg-black/20">
        <SkinCanvasView element={element} scale={10} />
      </div>
    </ErrorBoundary>
  );
}

function randChars(length: number): string {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export default App;
