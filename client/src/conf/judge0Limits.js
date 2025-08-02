/**
 * Custom Judge0 execution limits
 */
export const judge0Limits = {
    cpu_time_limit: '3.0', // 3s
    cpu_extra_time: '0.5', // Safety buffer
    wall_time_limit: '5.0', // Total runtime
    memory_limit: 128000, // 128 MB
    stack_limit: 64000, // 64 MB
    max_processes_and_or_threads: 32,
    enable_per_process_and_thread_time_limit: true,
    enable_per_process_and_thread_memory_limit: true,
    max_file_size: 4096, // 4 KB
    enable_network: false, // Always keep false for safety
};
