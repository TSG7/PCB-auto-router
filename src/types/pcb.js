
// PCB Types - JavaScript version
// 
// Pin: { id: string, x: number, y: number }
// Net: { id: string, name: string, color: string, pins: Pin[] }
// GridPoint: { x: number, y: number }
// RoutedPath: { netId: string, segments: GridPoint[][], totalLength: number, bendCount: number }
// RoutingResult: { routedPaths: RoutedPath[], failedNets: string[] }
// AStarNode: { x: number, y: number, g: number, h: number, f: number, parent: AStarNode | null }

export const PCBTypes = {
  // This file serves as documentation for the data structures used
  // All types are implicit in JavaScript
};
