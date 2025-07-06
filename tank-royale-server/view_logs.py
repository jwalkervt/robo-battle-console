#!/usr/bin/env python3
"""
Tank Royale Server Log Viewer
------------------------------
A simple utility to view Tank Royale server logs in various ways.

Usage:
    python view_logs.py [options]
    
Options:
    --follow, -f       Follow logs in real-time
    --tail N           Show last N lines (default: 50)
    --container        Show container logs
    --server          Show server application logs
    --startup         Show container startup logs
    --all             Show all available logs
    --help, -h        Show this help message
"""

import argparse
import subprocess
import sys
import time
from pathlib import Path

# ANSI Color Codes
class Colors:
    RESET = "\033[0m"
    BOLD = "\033[1m"
    GREEN = "\033[92m"
    BLUE = "\033[94m"
    YELLOW = "\033[93m"
    RED = "\033[91m"
    CYAN = "\033[96m"

def print_step(message: str) -> None:
    print(f"{Colors.CYAN}{Colors.BOLD}==> {message}{Colors.RESET}")

def print_success(message: str) -> None:
    print(f"{Colors.GREEN}{Colors.BOLD}✓ {message}{Colors.RESET}")

def print_warning(message: str) -> None:
    print(f"{Colors.YELLOW}⚠ {message}{Colors.RESET}")

def print_error(message: str) -> None:
    print(f"{Colors.RED}✗ {message}{Colors.RESET}")

def print_info(message: str) -> None:
    print(f"{Colors.BLUE}  {message}{Colors.RESET}")

def run_command(cmd: list[str], check: bool = True) -> subprocess.CompletedProcess:
    """Run a command and return the result."""
    try:
        return subprocess.run(cmd, check=check, capture_output=True, text=True)
    except subprocess.CalledProcessError as e:
        print_error(f"Command failed: {' '.join(cmd)}")
        print_error(f"Error: {e.stderr.strip()}")
        return e
    except FileNotFoundError:
        print_error(f"Command not found: {cmd[0]}")
        sys.exit(1)

def check_container_running() -> bool:
    """Check if the Tank Royale container is running."""
    result = run_command(["docker", "ps", "-q", "-f", "name=tank-royale-server"], check=False)
    return bool(result.stdout.strip())

def view_container_logs(follow: bool = False, tail: int = 50) -> None:
    """View Docker container logs."""
    if not check_container_running():
        print_error("Tank Royale server container is not running!")
        print_info("Start it with: python run_server.py")
        return
    
    print_step(f"📋 Container Logs {'(following)' if follow else f'(last {tail} lines)'}")
    
    cmd = ["docker", "logs"]
    if follow:
        cmd.append("-f")
    cmd.extend(["--tail", str(tail), "tank-royale-server"])
    
    try:
        if follow:
            print_info("Press Ctrl+C to stop following logs")
            print_info("=" * 60)
            # Stream logs in real-time
            subprocess.run(cmd, check=True)
        else:
            result = run_command(cmd)
            if result.returncode == 0:
                print(result.stdout)
            else:
                print_error("Failed to retrieve logs")
    except KeyboardInterrupt:
        print_info("\nStopped following logs")

def view_server_logs(follow: bool = False, tail: int = 50) -> None:
    """View Tank Royale server application logs."""
    if not check_container_running():
        print_error("Tank Royale server container is not running!")
        return
    
    print_step(f"🎮 Server Application Logs {'(following)' if follow else f'(last {tail} lines)'}")
    
    cmd = ["docker", "exec", "tank-royale-server", "tail"]
    if follow:
        cmd.append("-f")
    cmd.extend(["-n", str(tail), "/app/logs/server.log"])
    
    try:
        if follow:
            print_info("Press Ctrl+C to stop following logs")
            print_info("=" * 60)
            subprocess.run(cmd, check=True)
        else:
            result = run_command(cmd)
            if result.returncode == 0:
                print(result.stdout)
            else:
                print_warning("Server log file may not exist yet")
    except KeyboardInterrupt:
        print_info("\nStopped following logs")

def view_startup_logs() -> None:
    """View container startup logs."""
    if not check_container_running():
        print_error("Tank Royale server container is not running!")
        return
    
    print_step("🚀 Container Startup Logs")
    
    cmd = ["docker", "exec", "tank-royale-server", "cat", "/app/logs/startup.log"]
    result = run_command(cmd)
    
    if result.returncode == 0:
        print(result.stdout)
    else:
        print_warning("Startup log file may not exist yet")

def view_all_logs() -> None:
    """View all available logs."""
    if not check_container_running():
        print_error("Tank Royale server container is not running!")
        return
    
    print_step("📊 All Available Logs")
    
    # List all log files
    cmd = ["docker", "exec", "tank-royale-server", "ls", "-la", "/app/logs/"]
    result = run_command(cmd)
    
    if result.returncode == 0:
        print_info("Available log files:")
        print(result.stdout)
    
    # Show each log file
    log_files = [
        ("startup.log", "🚀 Container Startup"),
        ("server.log", "🎮 Server Application"),
        ("xvfb.log", "🖥️  Virtual Display"),
        ("gc.log", "☕ Java Garbage Collection")
    ]
    
    for filename, description in log_files:
        print(f"\n{Colors.CYAN}{'='*60}{Colors.RESET}")
        print_step(f"{description} ({filename})")
        print(f"{Colors.CYAN}{'='*60}{Colors.RESET}")
        
        cmd = ["docker", "exec", "tank-royale-server", "tail", "-n", "20", f"/app/logs/{filename}"]
        result = run_command(cmd, check=False)
        
        if result.returncode == 0:
            print(result.stdout)
        else:
            print_warning(f"Log file {filename} may not exist yet")

def show_container_info() -> None:
    """Show container information."""
    if not check_container_running():
        print_error("Tank Royale server container is not running!")
        return
    
    print_step("📋 Container Information")
    
    # Container status
    cmd = ["docker", "ps", "-f", "name=tank-royale-server", "--format", "table {{.Names}}\t{{.Status}}\t{{.Ports}}"]
    result = run_command(cmd)
    if result.returncode == 0:
        print(result.stdout)
    
    # Container health
    cmd = ["docker", "inspect", "--format={{.State.Health.Status}}", "tank-royale-server"]
    result = run_command(cmd, check=False)
    if result.returncode == 0 and result.stdout.strip():
        health_status = result.stdout.strip()
        if health_status == "healthy":
            print_success(f"Health: {health_status.upper()} ✅")
        elif health_status == "unhealthy":
            print_error(f"Health: {health_status.upper()} ❌")
        else:
            print_info(f"Health: {health_status.upper()}")

def main():
    parser = argparse.ArgumentParser(
        description="Tank Royale Server Log Viewer",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python view_logs.py --follow           # Follow container logs in real-time
  python view_logs.py --server --tail 100  # Show last 100 server log lines
  python view_logs.py --all             # Show all available logs
  python view_logs.py --startup         # Show container startup logs
        """
    )
    
    parser.add_argument("--follow", "-f", action="store_true", help="Follow logs in real-time")
    parser.add_argument("--tail", "-t", type=int, default=50, help="Number of lines to show (default: 50)")
    parser.add_argument("--container", action="store_true", help="Show container logs (default)")
    parser.add_argument("--server", action="store_true", help="Show server application logs")
    parser.add_argument("--startup", action="store_true", help="Show container startup logs")
    parser.add_argument("--all", action="store_true", help="Show all available logs")
    parser.add_argument("--info", action="store_true", help="Show container information")
    
    args = parser.parse_args()
    
    print(f"\n{Colors.BOLD}{Colors.GREEN}Tank Royale Server Log Viewer{Colors.RESET}")
    print("-" * 40)
    
    if args.info:
        show_container_info()
    elif args.all:
        view_all_logs()
    elif args.startup:
        view_startup_logs()
    elif args.server:
        view_server_logs(follow=args.follow, tail=args.tail)
    else:
        # Default to container logs
        view_container_logs(follow=args.follow, tail=args.tail)

if __name__ == "__main__":
    main() 