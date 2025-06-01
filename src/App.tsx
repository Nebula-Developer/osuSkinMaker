import { Navbar } from "./components/navbar";
import { ComponentEditor } from "./components/component-editor";
import { Button } from "./components/ui/button";
import {
  BoxComponent,
  CircleClipComponent,
  CircleComponent,
  RestoreMaskComponent,
} from "./lib/elements";
import { useComponent, useElement, useSkinStore } from "./store/skinStore";
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
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "./components/ui/resizable";
import { useState, useEffect } from "react";
import { ScrollArea } from "./components/ui/scroll-area";
import { cn } from "./lib/utils";
import { Switch } from "./components/ui/switch";
import { Label } from "./components/ui/label";
import { Slider } from "./components/ui/slider";
import { PanScrollArea } from "./components/pan-scroll-area";
import { RiDraggable } from "react-icons/ri";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
} from "./components/ui/command";

function ComponentView({
  elementIndex,
  componentIndex,
  data,
  element,
  onRemove,
}: {
  elementIndex: number;
  componentIndex: number;
  data: ElementComponentData;
  element: Element;
  onRemove?: () => void;
}) {
  const { handleUpdate, handleMoveUp, handleMoveDown } = useComponent(
    elementIndex,
    componentIndex
  );

  return (
    <div className="p-5 bg-card border rounded-lg shadow-md border-b last:border-b-0">
      <div className="flex gap-2 mb-2">
        <h3 className="text-lg font-semibold">{data.component.name}</h3>
        {data.customName && <Badge>{data.customName}</Badge>}
      </div>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <Button variant="outline" className="w-full justify-between" asChild>
            <AccordionTrigger>Edit Properties</AccordionTrigger>
          </Button>
          <AccordionContent
            className="flex flex-col gap-4 text-balance"
            animate={false}
          >
            <ComponentEditor
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
        <Button
          variant="destructive"
          className="ml-2"
          onClick={onRemove || (() => {})}
          disabled={!onRemove}
        >
          Remove
        </Button>
      </div>
    </div>
  );
}

function App() {
  const [elementId, setElementId] = useState(0);
  const { element, components, addComponent, removeComponent } =
    useElement(elementId);
  const skin = useSkinStore((s) => s.skin);

  const [width, setWidth] = useState(window.innerWidth);

  const [previewFit, setPreviewFit] = useState(false);
  const [scale, setScale] = useState(1);

  const [componentAddOpen, setComponentAddOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const selectableComponents = [
    CircleClipComponent,
    CircleComponent,
    BoxComponent,
    RestoreMaskComponent,
  ];

  return (
    <ErrorBoundary>
      <Navbar />

      <ResizablePanelGroup
        direction={width < 800 ? "vertical" : "horizontal"}
        className="flex-1 shrink-0"
      >
        <ResizablePanel
          defaultSize={30}
          minSize={20}
          maxSize={50}
          className="bg-background"
        >
          <ScrollArea className="w-full h-full overflow-x-auto">
            <Select
              value={elementId.toString()}
              onValueChange={(value) => setElementId(Number(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Element" />
              </SelectTrigger>

              <SelectContent>
                {skin.elements.map((el, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {el.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="p-5 flex flex-col gap-5">
              {/* <Button
                variant="secondary"
                onClick={() => addComponent(TestComponent, randChars(5))}
              >
                Add Component
              </Button> */}

              <Popover
                open={componentAddOpen}
                onOpenChange={setComponentAddOpen}
              >
                <PopoverTrigger asChild>
                  <Button variant="outline">+ Add Component</Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Search components..." />
                    <CommandList>
                      {selectableComponents.map((component, index) => (
                        <CommandItem
                          key={index}
                          onSelect={() => {
                            addComponent(component, randChars(5));
                            setComponentAddOpen(false);
                          }}
                          className="cursor-pointer p-2"
                        >
                          {component.name}
                        </CommandItem>
                      ))}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              <div className="flex flex-col gap-5">
                {components.map((component, index) => (
                  <ErrorBoundary
                    error={
                      <div>
                        <p className="mt-2 text-muted-foreground">
                          A component has crashed. This may be due to an error
                          in the component's code.
                        </p>

                        <Button
                          variant="destructive"
                          className="mt-2"
                          onClick={() => removeComponent(index)}
                        >
                          Remove Component
                        </Button>
                      </div>
                    }
                  >
                    <ComponentView
                      key={
                        (component.customName ?? index) +
                        component.component.name
                      }
                      elementIndex={elementId}
                      componentIndex={index}
                      data={component}
                      element={element}
                      onRemove={() => removeComponent(index)}
                    />
                  </ErrorBoundary>
                ))}
              </div>
            </div>
          </ScrollArea>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={70} className="flex flex-col">
          <div className="w-full h-18 bg-sidebar shadow-md flex justify-between px-12 z-10">
            <div className="flex items-center gap-x-8 w-full flex-wrap">
              <Label className="flex items-center">
                <Switch
                  checked={previewFit}
                  onCheckedChange={(checked) => setPreviewFit(checked)}
                />
                Fit Preview
              </Label>

              {!previewFit && (
                <Label className="flex flex-1 items-center">
                  <span className="mr-2">Scale:</span>
                  <Slider
                    value={[scale]}
                    onValueChange={(value) => setScale(value[0])}
                    min={0.1}
                    max={40}
                    step={0.1}
                    className="w-full min-w-24"
                  />
                </Label>
              )}
            </div>
          </div>

          <div className="h-full overflow-hidden relative flex-1">
            {!previewFit && (
              <div className="absolute top-2 right-3 text-muted-foreground pointer-events-none flex gap-1 items-center text-sm opacity-70">
                <RiDraggable className="text-foreground" />
                Drag to pan
              </div>
            )}

            <PanScrollArea>
              <div
                className={cn(
                  "items-center justify-center min-h-full min-w-full",
                  !previewFit ? "flex w-fit h-fit" : "block w-full h-full"
                )}
              >
                <div
                  className={cn(
                    "flex items-center justify-center p-12",
                    previewFit ? "h-full" : "h-fit w-fit"
                  )}
                >
                  <SkinCanvasView
                    element={element}
                    scale={previewFit ? 10 : scale}
                    fit={previewFit}
                  />
                </div>
              </div>
            </PanScrollArea>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
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
