/**
 * Admin Types
 */

export interface AdminLog {
  // Basic info (7 fields)
  log_id: string;
  timestamp: string;
  session_id?: string;
  user_ip?: string;
  user_id?: string;
  user_email?: string;
  user_name?: string;
  // Query info (5 fields)
  query_text: string;
  query_type?: string;
  intent_detected?: string;
  is_searchable?: boolean;
  intent_reasoning?: string;
  intent_confidence?: number;
  // Parsed query fields (8 fields)
  parsed_skills?: any;
  parsed_location?: string;
  parsed_seniority?: string;
  parsed_experience_min?: number;
  parsed_experience_max?: number;
  parsed_domains?: any;
  parsed_company?: string;
  parsed_education?: string;
  // Expanded fields (3 fields)
  expanded_skills?: any;
  expanded_locations?: any;
  expanded_companies?: any;
  // Context (2 fields)
  temporal_context?: any;
  filters_applied?: any;
  // SQL metrics (6 fields)
  sql_query?: string;
  sql_parameters?: any;
  sql_generation_time_ms?: number;
  sql_execution_time_ms?: number;
  sql_rows_returned?: number;
  sql_error?: string;
  // Vector search metrics (6 fields)
  vector_query_text?: string;
  vector_execution_time_ms?: number;
  vector_rows_returned?: number;
  vector_top_scores?: any;
  vector_avg_score?: number;
  vector_error?: string;
  // Hybrid metrics (5 fields)
  hybrid_total_results?: number;
  hybrid_sql_only?: number;
  hybrid_vector_only?: number;
  hybrid_both?: number;
  hybrid_overlap_ratio?: number;
  // Reranking (3 fields)
  reranking_input_count?: number;
  reranking_time_ms?: number;
  reranking_provider?: string;
  // Results (5 fields)
  final_result_count?: number;
  final_results_summary?: string;
  top_result_names?: any;
  detailed_results_before_rerank?: any;
  detailed_results_after_rerank?: any;
  // Evaluation pipeline (18 fields)
  criteria_extraction_time_ms?: number;
  criteria_count?: number;
  criteria_json?: any;
  criteria_extraction_success?: boolean;
  profiles_evaluated_count?: number;
  evaluation_time_ms?: number;
  evaluation_model?: string;
  parallel_evaluation_success?: boolean;
  average_evaluation_time_per_profile_ms?: number;
  aggregation_time_ms?: number;
  profiles_after_filtering?: number;
  highest_evaluation_score?: number;
  lowest_evaluation_score?: number;
  average_evaluation_score?: number;
  all_low_profiles_filtered?: number;
  aggregation_success?: boolean;
  average_rank_change?: number;
  detailed_evaluation_results?: any;
  // Status (3 fields)
  total_execution_time_ms?: number;
  search_status?: string;
  error_message?: string;
  created_at?: string;
}

export interface AdminTable {
  table_name: string;
  row_count: number;
  column_count: number;
}

export interface AdminTableColumn {
  column_name: string;
  data_type: string;
  is_nullable: string;
  [key: string]: any;
}

export interface AdminWorkspaceStats {
  workspace_id: string;
  owner_name: string;
  recorded_count: number;
  actual_count: number;
  created_at: string;
}

