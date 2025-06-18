
export interface Pin {
  id: string;
  x: number;
  y: number;
}

export interface Net {
  id: string;
  name: string;
  color: string;
  pins: Pin[];
}

export interface GridPoint {
  x: number;
  y: number;
}

export interface RoutedPath {
  netId: string;
  segments: GridPoint[][];
  totalLength: number;
  bendCount: number;
}

export interface RoutingResult {
  routedPaths: RoutedPath[];
  failedNets: string[];
}

export interface AStarNode {
  x: number;
  y: number;
  g: number; // cost from start
  h: number; // heuristic cost to goal
  f: number; // total cost
  parent: AStarNode | null;
}
