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
import { useState, useEffect, type JSX, useRef } from "react";
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
import { Separator } from "./components/ui/separator";
import Editor from "@monaco-editor/react";
import { useThemeStore } from "./store/themeStore";
import { toast } from "sonner";
import { Input } from "./components/ui/input";
import { FaCogs } from "react-icons/fa";

const docString = `
/**
 * Renders the component on the canvas.
 * @param {Object} context - The rendering context.
 * @param {CanvasRenderingContext2D} context.ctx - The 2D rendering context for the canvas.
 * @param {Object} context.size - The size of the canvas.
 * @param {number} context.size.width - The width of the canvas.
 * @param {number} context.size.height - The height of the canvas.
 * @param {Object} context.properties - The properties of the component.
 * @param {any} context.properties - The properties of the component.
 * @returns {void}
 */`.trim();

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
  const {
    handleUpdate,
    handleMoveUp,
    handleMoveDown,
    handleUpdateRenderMethod,
  } = useComponent(elementIndex, componentIndex);
  const theme = useThemeStore((s) => s.theme);

  const [code, setCode] = useState(data.component.render.toString());

  return (
    <div className="p-5 bg-card border rounded-lg shadow-md border-b last:border-b-0">
      <div className="flex justify-between items-start">
        <div className="flex gap-2 mb-2">
          <h3 className="text-lg font-semibold">{data.component.name}</h3>
          {data.customName && <Badge>{data.customName}</Badge>}
        </div>

        <Switch
          checked={!data.disabled}
          onCheckedChange={(checked) => handleUpdate({ disabled: !checked })}
        />
      </div>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger>Edit Properties</AccordionTrigger>
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

        <AccordionItem value="item-2">
          <AccordionTrigger>Advanced Settings</AccordionTrigger>
          <AccordionContent
            className="flex flex-col gap-4 text-balance"
            animate={false}
          >
            <Editor
              height="500px"
              defaultLanguage="javascript"
              defaultValue={data.component.render.string.trim()}
              theme={theme === "dark" ? "vs-dark" : "vs-light"}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                formatOnPaste: true,
                formatOnType: true,
                inlayHints: {
                  enabled: "on",
                },
                suggestOnTriggerCharacters: true,
                tabSize: 2,
              }}
              onChange={(value) => {
                setCode(value || "");
              }}
            />

            <Button
              variant="outline"
              className="mt-2"
              onClick={() => {
                try {
                  handleUpdateRenderMethod(code);

                  toast.success("Component code updated successfully!");
                } catch (error) {
                  console.error("Error updating component code:", error);
                  toast.error(
                    "Failed to update component code. Check console for details."
                  );
                }
              }}
            >
              Update Code
            </Button>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="mt-2 flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={handleMoveUp}
          disabled={componentIndex === 0}
        >
          Move Up
        </Button>
        <Button
          variant="outline"
          onClick={handleMoveDown}
          disabled={componentIndex === element.components.length - 1}
        >
          Move Down
        </Button>
        <Button
          variant="destructive"
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

  const [grid, setGrid] = useState(10);
  const [gridAccent, setGridAccent] = useState(5);
  const [useGrid, setUseGrid] = useState(true);

  const [componentAddOpen, setComponentAddOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);

  const canvasRef = useRef<ErrorBoundary | null>(null);

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
            <div className="p-5 flex flex-col gap-5">
              <h2 className="text-2xl font-semibold">Element Editor</h2>

              <Select
                value={elementId.toString()}
                onValueChange={(value) => setElementId(Number(value))}
              >
                <SelectTrigger className="w-full">
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

              <Separator />

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
          <div className="w-full min-h-18 bg-sidebar shadow-md flex justify-between px-12 py-5 z-10 relative">
            <div className="flex items-center justify-between gap-8 w-full flex-wrap">
              <div className="flex gap-8 flex-1 items-center">
                <Label className="flex items-center whitespace-nowrap">
                  <Switch
                    checked={previewFit}
                    onCheckedChange={(checked) => setPreviewFit(checked)}
                  />
                  Fit Preview
                </Label>

                {!previewFit && (
                  <Label className="flex flex-1 items-center min-w-96">
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

              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => setOptionsOpen(!optionsOpen)}
              >
                <FaCogs className="text-lg" />
              </Button>

              <div
                className={cn(
                  "w-full flex-col gap-4",
                  optionsOpen ? "flex" : "hidden"
                )}
              >
                <Separator orientation="horizontal" className="my-2" />

                <div className="flex items-center gap-2">
                  <Switch checked={useGrid} onCheckedChange={setUseGrid} />
                  <span>Use Grid</span>
                </div>

                {useGrid && (
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center justify-between gap-4">
                        <span className="whitespace-nowrap">Grid Size:</span>
                        <Input
                          type="number"
                          value={grid}
                          onChange={(e) => setGrid(Number(e.target.value))}
                          min={1}
                          max={20}
                          step={1}
                          className="w-24"
                        />
                      </label>
                      <Slider
                        value={[grid]}
                        onValueChange={(value) => setGrid(value[0])}
                        min={2}
                        max={20}
                        step={2}
                        className="w-full"
                      />
                    </div>

                    {grid % 2 === 0 && (
                      <div className="flex flex-col gap-2">
                        <label className="flex items-center justify-between gap-4">
                          <span className="whitespace-nowrap">
                            Grid Accent:
                          </span>
                          <Input
                            type="number"
                            value={gridAccent}
                            onChange={(e) =>
                              setGridAccent(Number(e.target.value))
                            }
                            min={1}
                            max={grid / 2}
                            step={1}
                            className="w-24"
                          />
                        </label>
                        <Slider
                          value={[gridAccent]}
                          onValueChange={(value) => setGridAccent(value[0])}
                          min={1}
                          max={grid / 2}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    )}
                  </div>
                )}
                <Separator orientation="horizontal" className="my-2" />
              </div>
            </div>
          </div>

          <div className="h-full overflow-hidden relative flex-1">
            {!previewFit && (
              <div className="absolute top-2 right-3 text-muted-foreground pointer-events-none flex gap-1 items-center text-sm opacity-70">
                <RiDraggable className="text-foreground" />
                Drag to pan
              </div>
            )}

            <PanScrollArea getScale={() => scale} setScale={setScale}>
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
                  <ErrorBoundary
                    ref={canvasRef}
                    error={
                      <div>
                        <p className="mt-2 text-muted-foreground">
                          The element has encountered an error and cannot be
                          displayed.
                        </p>

                        <Button
                          variant="destructive"
                          className="mt-2"
                          onClick={() => canvasRef.current?.clearError()}
                        >
                          Refresh
                        </Button>
                      </div>
                    }
                  >
                    <SkinCanvasView
                      element={element}
                      scale={previewFit ? 10 : scale}
                      fit={previewFit}
                      grid={useGrid ? grid : 0}
                      gridAccent={useGrid ? gridAccent : 0}
                    />
                  </ErrorBoundary>
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
