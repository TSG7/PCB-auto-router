
// A* Pathfinding Algorithm for PCB Routing
export const routeAllNets = async (nets, canvasSize, gridSize) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const grid = createGrid(gridSize);
      const routedPaths = [];
      const failedNets = [];

      console.log(`Starting routing for ${nets.length} nets on ${gridSize}x${gridSize} grid`);

      for (const net of nets) {
        console.log(`Routing net: ${net.name} with ${net.pins.length} pins`);
        
        if (net.pins.length < 2) {
          console.log(`Skipping net ${net.name}: insufficient pins`);
          continue;
        }

        const routedPath = routeNet(net, grid, canvasSize, gridSize);
        
        if (routedPath) {
          routedPaths.push(routedPath);
          console.log(`Successfully routed net ${net.name}`);
        } else {
          failedNets.push(net.id);
          console.log(`Failed to route net ${net.name}`);
        }
      }

      console.log(`Routing complete: ${routedPaths.length} successful, ${failedNets.length} failed`);
      resolve({ routedPaths, failedNets });
    }, 100); // Small delay to show loading state
  });
};

const createGrid = (size) => {
  const grid = [];
  for (let i = 0; i < size; i++) {
    grid[i] = new Array(size).fill(false);
  }
  return grid;
};

const routeNet = (net, grid, canvasSize, gridSize) => {
  const cellSize = Math.min(canvasSize.width / gridSize, canvasSize.height / gridSize);
  
  // Convert pin coordinates to grid coordinates
  const gridPins = net.pins.map(pin => ({
    x: Math.floor(pin.x / cellSize),
    y: Math.floor(pin.y / cellSize)
  })).filter(pin => 
    pin.x >= 0 && pin.x < gridSize && pin.y >= 0 && pin.y < gridSize
  );

  if (gridPins.length < 2) {
    console.log(`Net ${net.name}: Not enough valid grid pins`);
    return null;
  }

  console.log(`Net ${net.name} grid pins:`, gridPins);

  const segments = [];
  let totalLength = 0;
  let bendCount = 0;

  // Create minimum spanning tree using greedy approach
  const connected = [gridPins[0]];
  const remaining = gridPins.slice(1);

  while (remaining.length > 0) {
    let shortestDistance = Infinity;
    let closestPair = null;

    // Find closest pin pair between connected and remaining
    for (const connectedPin of connected) {
      for (let i = 0; i < remaining.length; i++) {
        const remainingPin = remaining[i];
        const distance = manhattanDistance(connectedPin, remainingPin);
        
        if (distance < shortestDistance) {
          shortestDistance = distance;
          closestPair = { from: connectedPin, to: remainingPin, index: i };
        }
      }
    }

    if (closestPair) {
      // Route from closest connected pin to closest remaining pin
      const path = findPath(closestPair.from, closestPair.to, grid);
      
      if (path && path.length > 0) {
        segments.push(path);
        totalLength += path.length - 1;
        bendCount += countBends(path);

        // Mark path as occupied
        for (const point of path) {
          if (point.x >= 0 && point.x < gridSize && point.y >= 0 && point.y < gridSize) {
            grid[point.y][point.x] = true;
          }
        }

        // Move pin from remaining to connected
        connected.push(remaining[closestPair.index]);
        remaining.splice(closestPair.index, 1);
        
        console.log(`Routed segment from (${closestPair.from.x},${closestPair.from.y}) to (${closestPair.to.x},${closestPair.to.y}), length: ${path.length - 1}`);
      } else {
        console.log(`Failed to find path for net ${net.name}`);
        return null;
      }
    } else {
      console.log(`No valid pair found for net ${net.name}`);
      return null;
    }
  }

  return {
    netId: net.id,
    segments,
    totalLength,
    bendCount
  };
};

const findPath = (start, goal, grid) => {
  const openSet = [];
  const closedSet = new Set();
  const gridSize = grid.length;

  const startNode = {
    x: start.x,
    y: start.y,
    g: 0,
    h: manhattanDistance(start, goal),
    f: 0,
    parent: null
  };
  
  startNode.f = startNode.g + startNode.h;
  openSet.push(startNode);

  const directions = [
    { x: 0, y: 1 },  // Down
    { x: 1, y: 0 },  // Right
    { x: 0, y: -1 }, // Up
    { x: -1, y: 0 }  // Left
  ];

  while (openSet.length > 0) {
    // Find node with lowest f score
    let currentIndex = 0;
    for (let i = 1; i < openSet.length; i++) {
      if (openSet[i].f < openSet[currentIndex].f) {
        currentIndex = i;
      }
    }

    const current = openSet.splice(currentIndex, 1)[0];
    const currentKey = `${current.x},${current.y}`;
    closedSet.add(currentKey);

    // Check if we reached the goal
    if (current.x === goal.x && current.y === goal.y) {
      const path = [];
      let node = current;
      while (node) {
        path.unshift({ x: node.x, y: node.y });
        node = node.parent;
      }
      return path;
    }

    // Check all neighbors
    for (const direction of directions) {
      const neighborX = current.x + direction.x;
      const neighborY = current.y + direction.y;
      const neighborKey = `${neighborX},${neighborY}`;

      // Check bounds
      if (neighborX < 0 || neighborX >= gridSize || neighborY < 0 || neighborY >= gridSize) {
        continue;
      }

      // Check if already in closed set
      if (closedSet.has(neighborKey)) {
        continue;
      }

      // Check if cell is occupied (but allow goal cell)
      if (grid[neighborY][neighborX] && !(neighborX === goal.x && neighborY === goal.y)) {
        continue;
      }

      const gScore = current.g + 1;
      
      // Check if this neighbor is already in open set
      let existingNode = openSet.find(node => node.x === neighborX && node.y === neighborY);
      
      if (!existingNode) {
        const neighbor = {
          x: neighborX,
          y: neighborY,
          g: gScore,
          h: manhattanDistance({ x: neighborX, y: neighborY }, goal),
          f: 0,
          parent: current
        };
        neighbor.f = neighbor.g + neighbor.h;
        openSet.push(neighbor);
      } else if (gScore < existingNode.g) {
        existingNode.g = gScore;
        existingNode.f = existingNode.g + existingNode.h;
        existingNode.parent = current;
      }
    }
  }

  return null; // No path found
};

const manhattanDistance = (a, b) => {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
};

const countBends = (path) => {
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
