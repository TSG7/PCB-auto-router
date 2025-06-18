
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Zap, TrendingUp } from "lucide-react";

export const RoutingStats = ({ nets, routedPaths }) => {
  const totalPins = nets.reduce((sum, net) => sum + net.pins.length, 0);
  const routedNets = routedPaths.length;
  const totalWireLength = routedPaths.reduce((sum, path) => sum + path.totalLength, 0);
  const totalBends = routedPaths.reduce((sum, path) => sum + path.bendCount, 0);
  
  const routingEfficiency = nets.length > 0 ? Math.round((routedNets / nets.length) * 100) : 0;

  return (
    <Card className="bg-slate-800 border-slate-600">
      <CardHeader>
        <CardTitle className="text-emerald-400 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Routing Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-700 p-3 rounded-lg">
            <div className="text-2xl font-bold text-white">{nets.length}</div>
            <div className="text-xs text-slate-400">Total Nets</div>
          </div>
          <div className="bg-slate-700 p-3 rounded-lg">
            <div className="text-2xl font-bold text-white">{totalPins}</div>
            <div className="text-xs text-slate-400">Total Pins</div>
          </div>
        </div>

        {/* Routing Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-slate-300 text-sm">Routing Progress</span>
            <Badge 
              variant={routingEfficiency === 100 ? "default" : "secondary"}
              className={routingEfficiency === 100 ? "bg-emerald-600" : "bg-slate-600"}
            >
              {routingEfficiency}%
            </Badge>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${routingEfficiency}%` }}
            />
          </div>
          <div className="text-xs text-slate-400">
            {routedNets} of {nets.length} nets routed
          </div>
        </div>

        {/* Detailed Stats */}
        {routedPaths.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-300">Performance Metrics</span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Wire Length:</span>
                <span className="text-white font-mono">{totalWireLength.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Bends:</span>
                <span className="text-white font-mono">{totalBends}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Avg. Length/Net:</span>
                <span className="text-white font-mono">
                  {routedNets > 0 ? (totalWireLength / routedNets).toFixed(1) : "0.0"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Quality Indicator */}
        <div className="p-3 bg-slate-700 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-semibold text-yellow-400">Quality Score</span>
          </div>
          <div className="text-xs text-slate-300">
            {routedPaths.length === 0 
              ? "No routes to analyze" 
              : `${Math.max(100 - Math.round(totalBends / routedNets * 10), 0)}% - ${
                  totalBends / routedNets < 2 ? "Excellent" : 
                  totalBends / routedNets < 4 ? "Good" : 
                  totalBends / routedNets < 6 ? "Fair" : "Poor"
                } routing quality`
            }
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
