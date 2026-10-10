export type ColumnType = 'numeric' | 'categorical' | 'date' | 'text';

export type AggregationType = 'sum' | 'avg' | 'count' | 'min' | 'max';

export type ChartType = 'bar' | 'line' | 'pie' | 'doughnut' | 'histogram' | 'scatter' | 'area';

export interface ColumnMeta {
  name: string;
  type: ColumnType;
  uniqueCount: number;
  missingCount: number;
  min?: number;
  max?: number;
  sum?: number;
  mean?: number;
  median?: number;
  distinctValues: string[];
  dateMin?: string;
  dateMax?: string;
}

export interface ChartConfig {
  id: string;
  title: string;
  type: ChartType;
  xColumn: string;
  yColumn?: string;
  aggregation: AggregationType;
}

export interface Dataset {
  fileName: string;
  fileSize: number;
  rowCount: number;
  columnCount: number;
  missingTotal: number;
  duplicateRows: number;
  columns: ColumnMeta[];
  data: Record<string, any>[];
  charts: ChartConfig[];
  humanSummary: string;
}

export interface FilterState {
  search: string;
  categorical: Record<string, string[]>; // column -> selected values
  numeric: Record<string, { min?: number; max?: number }>;
  dates: Record<string, { start?: string; end?: string }>;
}
