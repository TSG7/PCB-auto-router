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

    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
    drawGrid(ctx, canvasSize, gridSize);
    routedPaths.forEach((path) => {
      const net = nets.find(n => n.id === path.netId);
      if (net) drawRoutedPath(ctx, path, net.color, gridSize);
    });
    nets.forEach(net => {
      drawNet(ctx, net, selectedNetId === net.id);
    });
  }, [nets, routedPaths, gridSize, canvasSize, selectedNetId]);

  const drawGrid = (ctx, size, gridSize) => {
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 0.5;
    const cellSize = Math.min(size.width / gridSize, size.height / gridSize);
    for (let i = 0; i <= gridSize; i++) {
      const x = i * cellSize;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, size.height);
      ctx.stroke();
    }
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
    const hasRoute = routedPaths.some(path => path.netId === net.id);
    if (net.pins.length > 1 && !hasRoute) {
      ctx.strokeStyle = net.color + "40";
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
    net.pins.forEach((pin, index) => {
      ctx.fillStyle = net.color;
      ctx.beginPath();
      ctx.arc(pin.x, pin.y, isSelected ? 8 : 6, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = isSelected ? "#ffffff" : "#1e293b";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "#ffffff";
      ctx.font = "10px monospace";
      ctx.textAlign = "center";
      ctx.fillText((index + 1).toString(), pin.x, pin.y + 3);
    });
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
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowColor = color;
    ctx.shadowBlur = 3;
    path.segments.forEach((segment) => {
      if (segment.length < 2) return;
      ctx.beginPath();
      const start = segment[0];
      ctx.moveTo(start.x * cellSize + cellSize / 2, start.y * cellSize + cellSize / 2);
      for (let i = 1; i < segment.length; i++) {
        const p = segment[i];
        ctx.lineTo(p.x * cellSize + cellSize / 2, p.y * cellSize + cellSize / 2);
      }
      ctx.stroke();
      segment.forEach((p) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(p.x * cellSize + cellSize / 2, p.y * cellSize + cellSize / 2, 2, 0, 2 * Math.PI);
        ctx.fill();
      });
    });
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
    <div className="rounded-xl p-4 bg-card border border-gray-700 shadow-lg">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-primary">PCB Layout Canvas</h2>
        <p className="text-sidebar-accent text-sm">
          {selectedNetId 
            ? `Click to add pins to ${nets.find(n => n.id === selectedNetId)?.name || 'selected net'}` 
            : "Select a net to start adding pins"}
        </p>
        {routedPaths.length > 0 && (
          <p className="text-primary text-sm mt-1">
            {routedPaths.length} net(s) routed with colored paths
          </p>
        )}
      </div>

      {/* Outer container */}
      <div className="rounded-lg overflow-hidden bg-background flex justify-center items-center">
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          onClick={handleCanvasClick}
          className="cursor-crosshair block"
          style={{
            border: "1px solid #22c55e",  // light green border on canvas only
            borderRadius: "0.5rem"         // match rounded-lg
          }}
        />
      </div>

      <div className="mt-4 text-xs text-sidebar-accent grid grid-cols-3 gap-4">
        <div>Canvas: {canvasSize.width}×{canvasSize.height}</div>
        <div>Grid: {gridSize}×{gridSize}</div>
        <div>Nets: {nets.length} | Pins: {nets.reduce((sum, net) => sum + net.pins.length, 0)} | Routes: {routedPaths.length}</div>
      </div>
    </div>
  );
};
