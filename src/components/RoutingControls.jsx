
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Route, Trash2, Settings } from "lucide-react";

export const RoutingControls = ({
  gridSize,
  onGridSizeChange,
  onRouteAll,
  onClearRoutes,
  isRouting,
  disabled
}) => {
  return (
    <Card className="bg-slate-800 border-slate-600">
      <CardHeader>
        <CardTitle className="text-emerald-400 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Routing Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Grid Size Selection */}
        <div className="space-y-2">
          <Label className="text-slate-300">Grid Resolution</Label>
          <Select 
            value={gridSize.toString()} 
            onValueChange={(value) => onGridSizeChange(parseInt(value))}
          >
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <SelectItem value="25">25×25 (Coarse)</SelectItem>
              <SelectItem value="50">50×50 (Medium)</SelectItem>
              <SelectItem value="75">75×75 (Fine)</SelectItem>
              <SelectItem value="100">100×100 (Very Fine)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-slate-400">
            Higher resolution = more precise routing but slower processing
          </p>
        </div>

        {/* Routing Actions */}
        <div className="space-y-2">
          <Button
            onClick={onRouteAll}
            disabled={disabled || isRouting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600"
          >
            <Route className="w-4 h-4 mr-2" />
            {isRouting ? "Routing..." : "Route All Nets"}
          </Button>

          <Button
            onClick={onClearRoutes}
            variant="outline"
            className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Routes
          </Button>
        </div>

        {/* Algorithm Info */}
        <div className="p-3 bg-slate-700 rounded-lg">
          <h4 className="text-sm font-semibold text-emerald-400 mb-2">Algorithm</h4>
          <ul className="text-xs text-slate-300 space-y-1">
            <li>• A* Pathfinding</li>
            <li>• Manhattan Distance Heuristic</li>
            <li>• Collision-Free Guarantee</li>
            <li>• Minimum Spanning Tree</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
