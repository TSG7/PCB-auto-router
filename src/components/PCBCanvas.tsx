
import { useRef, useEffect } from "react";
import { Net, RoutedPath, GridPoint } from "@/types/pcb";

interface PCBCanvasProps {
  nets: Net[];
  routedPaths: RoutedPath[];
  gridSize: number;
  canvasSize: { width: number; height: number };
  selectedNetId: string | null;
  onCanvasClick: (x: number, y: number) => void;
}

export const PCBCanvas = ({ 
  nets, 
  routedPaths, 
  gridSize, 
  canvasSize, 
  selectedNetId,
  onCanvasClick 
}: PCBCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "#0f172a"; // slate-900
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

    // Draw grid
    drawGrid(ctx, canvasSize, gridSize);

    // Draw routed paths first (behind pins)
    routedPaths.forEach(path => {
      const net = nets.find(n => n.id === path.netId);
      if (net) {
        drawRoutedPath(ctx, path, net.color, gridSize);
      }
    });

    // Draw nets and pins
    nets.forEach(net => {
      drawNet(ctx, net, selectedNetId === net.id);
    });

  }, [nets, routedPaths, gridSize, canvasSize, selectedNetId]);

  const drawGrid = (ctx: CanvasRenderingContext2D, size: { width: number; height: number }, gridSize: number) => {
    ctx.strokeStyle = "#1e293b"; // slate-800
    ctx.lineWidth = 0.5;

    const cellSize = Math.min(size.width / gridSize, size.height / gridSize);
    
    // Vertical lines
    for (let i = 0; i <= gridSize; i++) {
      const x = i * cellSize;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, size.height);
      ctx.stroke();
    }

    // Horizontal lines
    for (let i = 0; i <= gridSize; i++) {
      const y = i * cellSize;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size.width, y);
      ctx.stroke();
    }
  };

  const drawNet = (ctx: CanvasRenderingContext2D, net: Net, isSelected: boolean) => {
    if (net.pins.length === 0) return;

    // Draw connections between pins as dashed lines (before routing)
    if (net.pins.length > 1) {
      ctx.strokeStyle = net.color + "40"; // semi-transparent
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      
      for (let i = 0; i < net.pins.length - 1; i++) {
        ctx.beginPath();
        ctx.moveTo(net.pins[i].x, net.pins[i].y);
        ctx.lineTo(net.pins[i + 1].x, net.pins[i + 1].y);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }

    // Draw pins
    net.pins.forEach((pin, index) => {
      // Pin circle
      ctx.fillStyle = net.color;
      ctx.beginPath();
      ctx.arc(pin.x, pin.y, isSelected ? 8 : 6, 0, 2 * Math.PI);
      ctx.fill();

      // Pin border
      ctx.strokeStyle = isSelected ? "#ffffff" : "#1e293b";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Pin number
      ctx.fillStyle = "#ffffff";
      ctx.font = "10px monospace";
      ctx.textAlign = "center";
      ctx.fillText((index + 1).toString(), pin.x, pin.y + 3);
    });

    // Net label
    if (net.pins.length > 0) {
      const firstPin = net.pins[0];
      ctx.fillStyle = net.color;
      ctx.font = "12px monospace";
      ctx.textAlign = "left";
      ctx.fillText(net.name, firstPin.x + 15, firstPin.y - 10);
    }
  };

  const drawRoutedPath = (ctx: CanvasRenderingContext2D, path: RoutedPath, color: string, gridSize: number) => {
    const cellSize = Math.min(canvasSize.width / gridSize, canvasSize.height / gridSize);
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    path.segments.forEach(segment => {
      if (segment.length < 2) return;

      ctx.beginPath();
      const startPoint = segment[0];
      ctx.moveTo(
        startPoint.x * cellSize + cellSize / 2,
        startPoint.y * cellSize + cellSize / 2
      );

      for (let i = 1; i < segment.length; i++) {
        const point = segment[i];
        ctx.lineTo(
          point.x * cellSize + cellSize / 2,
          point.y * cellSize + cellSize / 2
        );
      }
      
      ctx.stroke();
    });
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    onCanvasClick(x, y);
  };

  return (
    <div className="bg-slate-800 rounded-lg p-4">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-emerald-400">PCB Layout Canvas</h2>
        <p className="text-slate-400 text-sm">
          {selectedNetId 
            ? `Click to add pins to ${nets.find(n => n.id === selectedNetId)?.name || 'selected net'}` 
            : "Select a net to start adding pins"
          }
        </p>
      </div>
      
      <div className="border-2 border-slate-600 rounded-lg overflow-hidden bg-slate-900">
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          onClick={handleCanvasClick}
          className="cursor-crosshair block"
          style={{ maxWidth: "100%", height: "auto" }}
        />
      </div>

      <div className="mt-4 text-xs text-slate-400 grid grid-cols-3 gap-4">
        <div>Canvas: {canvasSize.width}×{canvasSize.height}</div>
        <div>Grid: {gridSize}×{gridSize}</div>
        <div>Nets: {nets.length} | Pins: {nets.reduce((sum, net) => sum + net.pins.length, 0)}</div>
      </div>
    </div>
  );
};
