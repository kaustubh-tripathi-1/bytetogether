/**
 * Custom Judge0 execution limits
 */
export const judge0Limits = {
    cpu_time_limit: '3.0', // 3s
    cpu_extra_time: '0.5', // Safety buffer
    wall_time_limit: '5.0', // Total runtime
    memory_limit: 131072, // 128 MB
    stack_limit: 65536, // 64 MB
    max_processes_and_or_threads: 32,
    enable_per_process_and_thread_time_limit: true,
    enable_per_process_and_thread_memory_limit: true,
    max_file_size: 4096, // 4 KB
    enable_network: false, // False for safety
};

/**
 * Judge0 Verdicts
 */
export const judge0Verdicts = {
    3: `✅ Successfully executed`,
    5: `💥 Time Limit Exceeded`,
    6: `❌ Compilation Error`,
    7: `🛑 Runtime Error`,
    13: `🚫 Memory Limit Exceeded`,
};
