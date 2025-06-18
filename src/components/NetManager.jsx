
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Circle, X } from "lucide-react";

const netColors = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4",
  "#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"
];

export const NetManager = ({
  nets,
  selectedNetId,
  onAddNet,
  onRemoveNet,
  onSelectNet,
  onRemovePin
}) => {
  const [newNetName, setNewNetName] = useState("");

  const handleAddNet = () => {
    if (newNetName.trim()) {
      const colorIndex = nets.length % netColors.length;
      onAddNet(newNetName.trim(), netColors[colorIndex]);
      setNewNetName("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleAddNet();
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-600">
      <CardHeader>
        <CardTitle className="text-emerald-400 flex items-center gap-2">
          <Circle className="w-5 h-5" />
          Net Manager
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add New Net */}
        <div className="space-y-2">
          <Label className="text-slate-300">Create New Net</Label>
          <div className="flex gap-2">
            <Input
              value={newNetName}
              onChange={(e) => setNewNetName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter net name (e.g., VCC, GND)"
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
            />
            <Button 
              onClick={handleAddNet}
              disabled={!newNetName.trim()}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Separator className="bg-slate-600" />

        {/* Nets List */}
        <div className="space-y-2">
          <Label className="text-slate-300">Existing Nets ({nets.length})</Label>
          
          {nets.length === 0 ? (
            <div className="text-slate-400 text-sm py-4 text-center border border-slate-600 rounded-lg border-dashed">
              No nets created yet. Add a net to get started.
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {nets.map((net) => (
                <div
                  key={net.id}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    selectedNetId === net.id
                      ? "border-emerald-500 bg-emerald-900/20"
                      : "border-slate-600 bg-slate-700 hover:bg-slate-600"
                  }`}
                  onClick={() => onSelectNet(selectedNetId === net.id ? null : net.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border-2 border-white"
                        style={{ backgroundColor: net.color }}
                      />
                      <span className="text-white font-medium">{net.name}</span>
                      <Badge variant="secondary" className="bg-slate-600 text-slate-200">
                        {net.pins.length} pins
                      </Badge>
                    </div>
                    
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveNet(net.id);
                      }}
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Pin List */}
                  {net.pins.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="text-xs text-slate-400">Pins:</div>
                      <div className="flex flex-wrap gap-1">
                        {net.pins.map((pin, index) => (
                          <div
                            key={pin.id}
                            className="flex items-center gap-1 bg-slate-600 rounded px-2 py-1 text-xs"
                          >
                            <span className="text-slate-200">
                              {index + 1}: ({Math.round(pin.x)}, {Math.round(pin.y)})
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onRemovePin(net.id, pin.id);
                              }}
                              className="text-red-400 hover:text-red-300 ml-1"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedNetId === net.id && (
                    <div className="mt-2 text-xs text-emerald-400">
                      ✓ Selected - Click on canvas to add pins
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="p-3 bg-slate-700 rounded-lg text-xs text-slate-300">
          <div className="font-semibold text-emerald-400 mb-1">Instructions:</div>
          <ul className="space-y-1">
            <li>• Create nets with unique names</li>
            <li>• Select a net to add pins by clicking</li>
            <li>• Each net needs 2+ pins to route</li>
            <li>• Different colors avoid crossing</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
