
import { useRef, useEffect } from "react";

export const PCBCanvas = ({ 
  nets, 
  routedPaths, 
  gridSize, 
  canvasSize, 
  selectedNetId,
  onCanvasClick 
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    console.log("Rendering canvas with:", {
      nets: nets.length,
      routedPaths: routedPaths.length,
      gridSize
    });

    // Clear canvas
    ctx.fillStyle = "#0f172a"; // slate-900
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

    // Draw grid
    drawGrid(ctx, canvasSize, gridSize);

    // Draw routed paths first (behind pins)
    routedPaths.forEach((path, index) => {
      const net = nets.find(n => n.id === path.netId);
      if (net) {
        console.log(`Drawing path ${index} for net ${net.name}:`, path);
        drawRoutedPath(ctx, path, net.color, gridSize);
      }
    });

    // Draw nets and pins
    nets.forEach(net => {
      drawNet(ctx, net, selectedNetId === net.id);
    });

  }, [nets, routedPaths, gridSize, canvasSize, selectedNetId]);

  const drawGrid = (ctx, size, gridSize) => {
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

  const drawNet = (ctx, net, isSelected) => {
    if (net.pins.length === 0) return;

    // Only draw dashed lines if no routes exist for this net
    const hasRoute = routedPaths.some(path => path.netId === net.id);
    
    if (net.pins.length > 1 && !hasRoute) {
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

  const drawRoutedPath = (ctx, path, color, gridSize) => {
    const cellSize = Math.min(canvasSize.width / gridSize, canvasSize.height / gridSize);
    
    console.log(`Drawing routed path with cellSize: ${cellSize}, segments: ${path.segments.length}`);
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Draw a subtle background for the path
    ctx.shadowColor = color;
    ctx.shadowBlur = 3;

    path.segments.forEach((segment, segIndex) => {
      if (segment.length < 2) return;

      console.log(`Drawing segment ${segIndex} with ${segment.length} points:`, segment);

      ctx.beginPath();
      const startPoint = segment[0];
      const startX = startPoint.x * cellSize + cellSize / 2;
      const startY = startPoint.y * cellSize + cellSize / 2;
      
      console.log(`Start point: grid(${startPoint.x}, ${startPoint.y}) -> canvas(${startX}, ${startY})`);
      ctx.moveTo(startX, startY);

      for (let i = 1; i < segment.length; i++) {
        const point = segment[i];
        const canvasX = point.x * cellSize + cellSize / 2;
        const canvasY = point.y * cellSize + cellSize / 2;
        
        console.log(`Point ${i}: grid(${point.x}, ${point.y}) -> canvas(${canvasX}, ${canvasY})`);
        ctx.lineTo(canvasX, canvasY);
      }
      
      ctx.stroke();
      
      // Draw connection points for debugging
      segment.forEach((point, pointIndex) => {
        const canvasX = point.x * cellSize + cellSize / 2;
        const canvasY = point.y * cellSize + cellSize / 2;
        
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(canvasX, canvasY, 2, 0, 2 * Math.PI);
        ctx.fill();
      });
    });

    // Reset shadow
    ctx.shadowBlur = 0;
  };

  const handleCanvasClick = (event) => {
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
        {routedPaths.length > 0 && (
          <p className="text-emerald-400 text-sm mt-1">
            {routedPaths.length} net(s) routed with colored paths
          </p>
        )}
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
        <div>Nets: {nets.length} | Pins: {nets.reduce((sum, net) => sum + net.pins.length, 0)} | Routes: {routedPaths.length}</div>
      </div>
    </div>
  );
};
