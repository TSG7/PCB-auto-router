
import { useState } from "react";
import { PCBCanvas } from "@/components/PCBCanvas";
import { NetManager } from "@/components/NetManager";
import { RoutingControls } from "@/components/RoutingControls";
import { RoutingStats } from "@/components/RoutingStats";
import { routeAllNets } from "@/utils/routing";
import { toast } from "sonner";

const Index = () => {
  const [nets, setNets] = useState([]);
  const [routedPaths, setRoutedPaths] = useState([]);
  const [gridSize, setGridSize] = useState(50);
  const [canvasSize] = useState({ width: 800, height: 600 });
  const [isRouting, setIsRouting] = useState(false);
  const [selectedNetId, setSelectedNetId] = useState(null);

  const addNet = (name, color) => {
    const newNet = {
      id: `net-${Date.now()}`,
      name,
      color,
      pins: []
    };
    setNets(prev => [...prev, newNet]);
    toast.success(`Net "${name}" created`);
  };

  const addPinToNet = (netId, pin) => {
    setNets(prev => prev.map(net => 
      net.id === netId 
        ? { ...net, pins: [...net.pins, pin] }
        : net
    ));
  };

  const removeNet = (netId) => {
    setNets(prev => prev.filter(net => net.id !== netId));
    setRoutedPaths(prev => prev.filter(path => path.netId !== netId));
    if (selectedNetId === netId) {
      setSelectedNetId(null);
    }
  };

  const removePinFromNet = (netId, pinId) => {
    setNets(prev => prev.map(net => 
      net.id === netId 
        ? { ...net, pins: net.pins.filter(pin => pin.id !== pinId) }
        : net
    ));
  };

  const handleRouteAll = async () => {
    if (nets.length === 0) {
      toast.error("No nets to route");
      return;
    }

    const netsWithPins = nets.filter(net => net.pins.length >= 2);
    if (netsWithPins.length === 0) {
      toast.error("No nets have enough pins to route (minimum 2 pins per net)");
      return;
    }

    setIsRouting(true);
    try {
      const result = await routeAllNets(netsWithPins, canvasSize, gridSize);
      setRoutedPaths(result.routedPaths);
      
      if (result.failedNets.length > 0) {
        toast.warning(`${result.failedNets.length} nets could not be routed`);
      } else {
        toast.success("All nets routed successfully!");
      }
    } catch (error) {
      toast.error("Routing failed: " + error.message);
    } finally {
      setIsRouting(false);
    }
  };

  const clearRoutes = () => {
    setRoutedPaths([]);
    toast.info("All routes cleared");
  };

  const handleCanvasClick = (x, y) => {
    if (selectedNetId) {
      const pin = {
        id: `pin-${Date.now()}`,
        x,
        y
      };
      addPinToNet(selectedNetId, pin);
      toast.success(`Pin added to ${nets.find(n => n.id === selectedNetId)?.name}`);
    } else {
      toast.info("Select a net first to add pins");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-emerald-400 flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white rounded-sm"></div>
            </div>
            PCB Auto-Router
          </h1>
          <p className="text-slate-400 mt-1">Interactive Multi-Group PCB Routing Visualizer</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <NetManager
            nets={nets}
            selectedNetId={selectedNetId}
            onAddNet={addNet}
            onRemoveNet={removeNet}
            onSelectNet={setSelectedNetId}
            onRemovePin={removePinFromNet}
          />
          
          <RoutingControls
            gridSize={gridSize}
            onGridSizeChange={setGridSize}
            onRouteAll={handleRouteAll}
            onClearRoutes={clearRoutes}
            isRouting={isRouting}
            disabled={nets.length === 0}
          />

          <RoutingStats
            nets={nets}
            routedPaths={routedPaths}
          />
        </div>

        <div className="lg:col-span-3">
          <PCBCanvas
            nets={nets}
            routedPaths={routedPaths}
            gridSize={gridSize}
            canvasSize={canvasSize}
            selectedNetId={selectedNetId}
            onCanvasClick={handleCanvasClick}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
