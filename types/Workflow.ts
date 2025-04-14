export default interface Workflow {
  id: number;
  name: string;
  updated_at: string;
  run_started_at: string;
  created_at: string;
  run_number: number;
  conclusion?: string;
  status: string;
}
