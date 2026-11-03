
# Import psutil to access computer hardware information.
import psutil

# Import time to measure CPU usage.
import time


# Collects CPU, memory, and disk metrics.
def collect_system_metrics():

    # Measures CPU usage over a one-second interval.
    cpu_usage = psutil.cpu_percent(interval=1)

    # Retrieves RAM information.
    memory = psutil.virtual_memory()

    # Retrieves disk information for the Windows system drive.
    disk = psutil.disk_usage("C:\\")

    # Returns all collected metrics.
    return {
        "cpu_usage": cpu_usage,
        "memory_usage": memory.percent,
        "memory_total_gb": round(memory.total / (1024 ** 3), 2),
        "memory_available_gb": round(memory.available / (1024 ** 3), 2),
        "disk_usage": disk.percent,
        "disk_total_gb": round(disk.total / (1024 ** 3), 2),
        "disk_free_gb": round(disk.free / (1024 ** 3), 2)
    }


# Runs the collector when this file is executed directly.
if __name__ == "__main__":

    # Collect system metrics.
    metrics = collect_system_metrics()

    # Display the collected information.
    print("\n========== SYSTEM METRICS ==========")

    for metric, value in metrics.items():
        print(f"{metric}: {value}")

    print("====================================")
