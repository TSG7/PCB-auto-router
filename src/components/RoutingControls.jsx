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
    <Card className="bg-sidebar border-sidebar-border">
      <CardHeader>
        <CardTitle className="text-primary flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Routing Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Grid Size Selection */}
        <div className="space-y-2">
          <Label className="text-foreground">Grid Resolution</Label>
          <Select 
            value={gridSize.toString()} 
            onValueChange={(value) => onGridSizeChange(parseInt(value))}
          >
            <SelectTrigger className="bg-background border-sidebar-border text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-background border-sidebar-border">
              <SelectItem value="25">25×25 (Coarse)</SelectItem>
              <SelectItem value="50">50×50 (Medium)</SelectItem>
              <SelectItem value="75">75×75 (Fine)</SelectItem>
              <SelectItem value="100">100×100 (Very Fine)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-sidebar-accent">
            Higher resolution = more precise routing but slower processing
          </p>
        </div>

        {/* Routing Actions */}
        <div className="space-y-2">
          <Button
            onClick={onRouteAll}
            disabled={disabled || isRouting}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted"
          >
            <Route className="w-4 h-4 mr-2" />
            {isRouting ? "Routing..." : "Route All Nets"}
          </Button>

          <Button
            onClick={onClearRoutes}
            variant="outline"
            className="w-full border-sidebar-border text-foreground hover:bg-background"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Routes
          </Button>
        </div>

        {/* Algorithm Info */}
        <div className="p-3 bg-background rounded-lg">
          <h4 className="text-sm font-semibold text-primary mb-2">Algorithm</h4>
          <ul className="text-xs text-foreground space-y-1">
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
