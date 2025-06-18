
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Circle } from "lucide-react";
import { Net } from "@/types/pcb";

interface NetManagerProps {
  nets: Net[];
  selectedNetId: string | null;
  onAddNet: (name: string, color: string) => void;
  onRemoveNet: (netId: string) => void;
  onSelectNet: (netId: string | null) => void;
  onRemovePin: (netId: string, pinId: string) => void;
}

const NET_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", 
  "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899",
  "#f59e0b", "#10b981", "#6366f1", "#d946ef"
];

export const NetManager = ({ 
  nets, 
  selectedNetId, 
  onAddNet, 
  onRemoveNet, 
  onSelectNet,
  onRemovePin
}: NetManagerProps) => {
  const [newNetName, setNewNetName] = useState("");
  const [selectedColor, setSelectedColor] = useState(NET_COLORS[0]);

  const handleAddNet = () => {
    if (newNetName.trim()) {
      onAddNet(newNetName.trim(), selectedColor);
      setNewNetName("");
      // Cycle to next color
      const currentIndex = NET_COLORS.indexOf(selectedColor);
      setSelectedColor(NET_COLORS[(currentIndex + 1) % NET_COLORS.length]);
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
        {/* Add Net Form */}
        <div className="space-y-3">
          <Input
            placeholder="Net name (e.g., VCC, GND)"
            value={newNetName}
            onChange={(e) => setNewNetName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddNet()}
            className="bg-slate-700 border-slate-600 text-white"
          />
          
          {/* Color Picker */}
          <div className="flex flex-wrap gap-2">
            {NET_COLORS.map(color => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`w-6 h-6 rounded-full border-2 ${
                  selectedColor === color ? "border-white" : "border-slate-600"
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          <Button 
            onClick={handleAddNet}
            disabled={!newNetName.trim()}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Net
          </Button>
        </div>

        {/* Net List */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {nets.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-4">
              No nets created yet
            </p>
          ) : (
            nets.map(net => (
              <div 
                key={net.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedNetId === net.id 
                    ? "border-emerald-500 bg-slate-700" 
                    : "border-slate-600 bg-slate-750 hover:bg-slate-700"
                }`}
                onClick={() => onSelectNet(selectedNetId === net.id ? null : net.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: net.color }}
                    />
                    <span className="font-medium text-white">{net.name}</span>
                    <Badge variant="secondary" className="bg-slate-600">
                      {net.pins.length} pins
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveNet(net.id);
                    }}
                    className="text-red-400 hover:text-red-300 hover:bg-red-950"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Pin List */}
                {net.pins.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {net.pins.map((pin, index) => (
                      <Badge 
                        key={pin.id}
                        variant="outline"
                        className="text-xs bg-slate-600 border-slate-500 text-slate-200"
                      >
                        P{index + 1}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemovePin(net.id, pin.id);
                          }}
                          className="ml-1 text-red-400 hover:text-red-300"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
