
import { Net, RoutedPath, RoutingResult, AStarNode, GridPoint } from "@/types/pcb";

export const routeAllNets = async (
  nets: Net[],
  canvasSize: { width: number; height: number },
  gridSize: number
): Promise<RoutingResult> => {
  const routedPaths: RoutedPath[] = [];
  const failedNets: string[] = [];
  
  // Create occupancy grid
  const occupancyGrid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(false));
  
  console.log(`Starting routing for ${nets.length} nets on ${gridSize}x${gridSize} grid`);

  for (const net of nets) {
    if (net.pins.length < 2) {
      failedNets.push(net.id);
      continue;
    }

    try {
      const routedPath = await routeNet(net, canvasSize, gridSize, occupancyGrid);
      if (routedPath) {
        routedPaths.push(routedPath);
        console.log(`Successfully routed net ${net.name} with ${routedPath.segments.length} segments`);
      } else {
        failedNets.push(net.id);
        console.log(`Failed to route net ${net.name}`);
      }
    } catch (error) {
      console.error(`Error routing net ${net.name}:`, error);
      failedNets.push(net.id);
    }
  }

  return { routedPaths, failedNets };
};

const routeNet = async (
  net: Net,
  canvasSize: { width: number; height: number },
  gridSize: number,
  occupancyGrid: boolean[][]
): Promise<RoutedPath | null> => {
  const cellSizeX = canvasSize.width / gridSize;
  const cellSizeY = canvasSize.height / gridSize;
  
  // Convert pins to grid coordinates
  const gridPins = net.pins.map(pin => ({
    x: Math.floor(pin.x / cellSizeX),
    y: Math.floor(pin.y / cellSizeY)
  }));

  // Create minimum spanning tree connections
  const connections = createMinimumSpanningTree(gridPins);
  
  const segments: GridPoint[][] = [];
  let totalLength = 0;
  let bendCount = 0;

  // Route each connection using A*
  for (const connection of connections) {
    const path = findPath(
      gridPins[connection.from],
      gridPins[connection.to],
      occupancyGrid,
      gridSize
    );

    if (!path) {
      return null; // Failed to route this net
    }

    // Mark path cells as occupied
    path.forEach(point => {
      if (point.x >= 0 && point.x < gridSize && point.y >= 0 && point.y < gridSize) {
        occupancyGrid[point.y][point.x] = true;
      }
    });

    segments.push(path);
    totalLength += path.length - 1;
    bendCount += countBends(path);
  }

  return {
    netId: net.id,
    segments,
    totalLength,
    bendCount
  };
};

const createMinimumSpanningTree = (pins: GridPoint[]): { from: number; to: number }[] => {
  if (pins.length < 2) return [];

  const connections: { from: number; to: number }[] = [];
  const visited = new Set<number>();
  visited.add(0);

  while (visited.size < pins.length) {
    let minDistance = Infinity;
    let bestConnection = { from: -1, to: -1 };

    // Find the shortest connection from any visited pin to any unvisited pin
    for (const visitedPin of visited) {
      for (let i = 0; i < pins.length; i++) {
        if (!visited.has(i)) {
          const distance = manhattanDistance(pins[visitedPin], pins[i]);
          if (distance < minDistance) {
            minDistance = distance;
            bestConnection = { from: visitedPin, to: i };
          }
        }
      }
    }

    if (bestConnection.from !== -1) {
      connections.push(bestConnection);
      visited.add(bestConnection.to);
    } else {
      break;
    }
  }

  return connections;
};

const findPath = (
  start: GridPoint,
  goal: GridPoint,
  occupancyGrid: boolean[][],
  gridSize: number
): GridPoint[] | null => {
  const openSet: AStarNode[] = [];
  const closedSet = new Set<string>();
  
  const startNode: AStarNode = {
    x: start.x,
    y: start.y,
    g: 0,
    h: manhattanDistance(start, goal),
    f: 0,
    parent: null
  };
  startNode.f = startNode.g + startNode.h;
  
  openSet.push(startNode);

  while (openSet.length > 0) {
    // Find node with lowest f score
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift()!;
    
    const currentKey = `${current.x},${current.y}`;
    if (closedSet.has(currentKey)) continue;
    closedSet.add(currentKey);

    // Check if we reached the goal
    if (current.x === goal.x && current.y === goal.y) {
      return reconstructPath(current);
    }

    // Check all neighbors
    const neighbors = [
      { x: current.x + 1, y: current.y },
      { x: current.x - 1, y: current.y },
      { x: current.x, y: current.y + 1 },
      { x: current.x, y: current.y - 1 }
    ];

    for (const neighbor of neighbors) {
      // Check bounds
      if (neighbor.x < 0 || neighbor.x >= gridSize || neighbor.y < 0 || neighbor.y >= gridSize) {
        continue;
      }

      // Check if occupied (except for start and goal)
      const isStart = neighbor.x === start.x && neighbor.y === start.y;
      const isGoal = neighbor.x === goal.x && neighbor.y === goal.y;
      if (!isStart && !isGoal && occupancyGrid[neighbor.y][neighbor.x]) {
        continue;
      }

      const neighborKey = `${neighbor.x},${neighbor.y}`;
      if (closedSet.has(neighborKey)) continue;

      const tentativeG = current.g + 1;
      
      // Check if this neighbor is already in openSet with a better path
      const existingNode = openSet.find(node => node.x === neighbor.x && node.y === neighbor.y);
      if (existingNode && tentativeG >= existingNode.g) {
        continue;
      }

      const neighborNode: AStarNode = {
        x: neighbor.x,
        y: neighbor.y,
        g: tentativeG,
        h: manhattanDistance(neighbor, goal),
        f: 0,
        parent: current
      };
      neighborNode.f = neighborNode.g + neighborNode.h;

      if (existingNode) {
        // Update existing node
        Object.assign(existingNode, neighborNode);
      } else {
        openSet.push(neighborNode);
      }
    }
  }

  return null; // No path found
};

const reconstructPath = (node: AStarNode): GridPoint[] => {
  const path: GridPoint[] = [];
  let current: AStarNode | null = node;
  
  while (current) {
    path.unshift({ x: current.x, y: current.y });
    current = current.parent;
  }
  
  return path;
};

const manhattanDistance = (a: GridPoint, b: GridPoint): number => {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
};

const countBends = (path: GridPoint[]): number => {
  if (path.length < 3) return 0;
  
  let bends = 0;
  for (let i = 1; i < path.length - 1; i++) {
    const prev = path[i - 1];
    const current = path[i];
    const next = path[i + 1];
    
    const dir1 = { x: current.x - prev.x, y: current.y - prev.y };
    const dir2 = { x: next.x - current.x, y: next.y - current.y };
    
    if (dir1.x !== dir2.x || dir1.y !== dir2.y) {
      bends++;
    }
  }
  
  return bends;
};
