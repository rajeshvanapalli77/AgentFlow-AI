export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

export interface Agent {
  id: string;
  name: string;
  agent_type: string;
  description: string;
  system_prompt: string;
  default_model: string;
  is_active: boolean;
  capabilities_json?: Record<string, any>;
}

export interface ChatSession {
  id: string;
  title: string;
  created_at: string;
}

export interface Message {
  id: string;
  session_id: string;
  sender: 'user' | 'supervisor' | 'agent' | 'system';
  agent_name?: string;
  content: string;
  created_at: string;
  metadata_json?: any;
}

export interface ToolCall {
  id: string;
  tool_name: string;
  input_params?: any;
  output_result?: string;
  latency_ms: number;
  status: string;
  created_at: string;
}

export interface RunTrace {
  id: string;
  task_description: string;
  status: string;
  total_tokens: number;
  total_cost: number;
  duration_ms: number;
  agent_path_json?: { path: string[] };
  created_at: string;
  tool_calls: ToolCall[];
}

export interface EvaluationMetric {
  id: string;
  run_id: string;
  answer_quality: number;
  retrieval_quality: number;
  hallucination_score: number;
  groundedness_score: number;
  tool_accuracy: number;
  created_at: string;
}

export interface DocumentItem {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  chunk_count: number;
  status: string;
  created_at: string;
}

export interface MemoryItem {
  id: string;
  memory_type: string;
  key: string;
  content: string;
  created_at: string;
}
