import { Button } from "@/components/ui/button";
import { Download, Save } from "lucide-react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { HiMoon, HiSun } from "react-icons/hi";
import { useThemeStore } from "@/store/themeStore";
import { useSkinStore } from "@/store/skinStore";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { toast } from "sonner";

export function Navbar() {
  const themeStore = useThemeStore();
  const [isOpen, setIsOpen] = useState(false);
  const [json, setJson] = useState("");

  const skin = useSkinStore((state) => state.skin);

  return (
    <header className="border-b px-4 py-3 flex items-center justify-between bg-background">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold">osu!mania Skin Editor</h1>
      </div>

      <div className="flex flex-wrap justify-end items-center gap-2">
        <Select
          value={themeStore.theme}
          onValueChange={themeStore.setTheme}
          open={isOpen}
          onOpenChange={setIsOpen}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dark">
              <div className="flex items-center gap-2">
                <HiMoon className="h-4 w-4" />
                Dark
              </div>
            </SelectItem>
            <SelectItem value="light">
              <div className="flex items-center gap-2">
                <HiSun className="h-4 w-4" />
                Light
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm">
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>

        <Button
          size="sm"
          onClick={() => {
            console.log("Exporting skin:");
            let data = stringifyWithFunctions(skin);
            console.log(data);
            const blob = new Blob([data], { type: "application/json" });

            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");

            a.href = url;
            a.download = "skin.json";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }}
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Import
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Import</AlertDialogTitle>
              <AlertDialogDescription>
                Paste your skin JSON here:
              </AlertDialogDescription>
            </AlertDialogHeader>

            <Textarea
              className="h-64"
              value={json}
              onChange={(e) => setJson(e.target.value)}
              placeholder="Paste your skin JSON here"
            />

            <Input
              className="mt-2"
              type="file"
              accept=".json"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    if (typeof event.target?.result === "string") {
                      setJson(event.target.result);
                    }
                  };
                  reader.readAsText(file);
                }
              }}
              placeholder="Or upload a JSON file"
            />

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  try {
                    const parsed = parseWithFunctions(json.replace(/\n/g, ""));

                    if (!verifySkinObject(parsed)) {
                      toast.error("Invalid skin format. Your skin might be broken or outdated.");
                      return;
                    }
                      

                    useSkinStore.setState({ skin: parsed });
                    setJson("");
                    setIsOpen(false);
                    toast.success("Skin imported successfully!");
                  } catch (error) {
                    console.error("Failed to parse JSON:", error);
                    toast.error("Invalid JSON format. Please check your input.");
                  }
                }}
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </header>
  );
}

function verifySkinObject(obj: any): boolean {
  if (typeof obj !== "object" || obj === null) return false;
  if (!Array.isArray(obj.elements)) return false;
  
  const anyNotMatch = (obj: object, type: string, ...keys: string[]) => {
    return keys.some((key) => !(key in obj) || typeof (obj as any)[key] !== type);
  };

  if (anyNotMatch(obj, "string", "name", "author")) return false;

  return true;
}

function stringifyWithFunctions(obj: any): string {
  return JSON.stringify(
    obj,
    (_key, value) => {
      if (typeof value === "function") {
        return { __func__: value.toString() };
      }
      return value;
    },
    2
  );
}

function parseWithFunctions(str: string): any {
  return JSON.parse(str, (_key, value) => {
    if (value && typeof value === "object" && value.__func__) {
      const fnString = value.__func__;
      const match = fnString.match(/^function\s*\(([^)]*)\)\s*\{([\s\S]*)\}$/);
      if (match) {
        return new Function(match[1], match[2]);
      } else {
        return eval(`(${fnString})`);
      }
    }
    return value;
  });
}
