#!/usr/bin/env python3
"""
bootstrap_tank_royale_gui.py
---------------------------------
Enhanced bootstrapper for a browser-first Tank Royale GUI.
Creates a Next.js TypeScript application with all necessary dependencies
and optional type generation from Tank Royale schemas.

Usage:
    python bootstrap_tank_royale_gui.py --name my-gui
    python bootstrap_tank_royale_gui.py --name my-gui --generate-types
    python bootstrap_tank_royale_gui.py --name my-gui --force
"""
import argparse
import os
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Optional
import json

# Configuration
REPO_URL = "https://github.com/robocode-dev/tank-royale.git"
DEFAULT_GUI_NAME = "tank-royale-webgui"

# Core dependencies for the Tank Royale GUI
CORE_NPM_DEPS = [
    # Runtime dependencies
    "pixi.js@^8.0.0",
    "zustand@^4.4.0",
    "zod@^3.22.0",
    # Development dependencies
    "--save-dev",
    "typescript@^5.0.0",
    "@types/node@^20.0.0",
    "@types/react@^18.0.0",
    "@types/react-dom@^18.0.0",
    "quicktype@^23.0.0",
    "prettier@^3.0.0",
    "@typescript-eslint/eslint-plugin@^6.0.0",
    "@typescript-eslint/parser@^6.0.0"
]

class Colors:
    """ANSI color codes for terminal output."""
    RESET = "\033[0m"
    BOLD = "\033[1m"
    GREEN = "\033[92m"
    BLUE = "\033[94m"
    YELLOW = "\033[93m"
    RED = "\033[91m"
    CYAN = "\033[96m"

def print_step(message: str, step_num: Optional[int] = None) -> None:
    """Print a formatted step message."""
    if step_num:
        print(f"{Colors.CYAN}{Colors.BOLD}[{step_num}] {message}{Colors.RESET}")
    else:
        print(f"{Colors.BLUE}{message}{Colors.RESET}")

def print_success(message: str) -> None:
    """Print a success message."""
    print(f"{Colors.GREEN}{Colors.BOLD}✓ {message}{Colors.RESET}")

def print_warning(message: str) -> None:
    """Print a warning message."""
    print(f"{Colors.YELLOW}⚠ {message}{Colors.RESET}")

def print_error(message: str) -> None:
    """Print an error message."""
    print(f"{Colors.RED}✗ {message}{Colors.RESET}")

def run(cmd: list[str], cwd: Optional[Path] = None, check: bool = True, 
        capture_output: bool = False) -> subprocess.CompletedProcess:
    """
    Helper that prints and executes shell commands with better error handling.
    
    Args:
        cmd: Command to execute as list of strings
        cwd: Working directory for the command
        check: Whether to raise exception on non-zero exit code
        capture_output: Whether to capture stdout/stderr
        
    Returns:
        CompletedProcess object
        
    Raises:
        subprocess.CalledProcessError: If command fails and check=True
    """
    print(f"{Colors.CYAN}+ {' '.join(cmd)}{Colors.RESET}")
    try:
        result = subprocess.run(
            cmd, 
            cwd=cwd, 
            check=check,
            capture_output=capture_output,
            text=True if capture_output else None
        )
        return result
    except subprocess.CalledProcessError as e:
        print_error(f"Command failed with exit code {e.returncode}")
        if capture_output and e.stderr:
            print_error(f"Error output: {e.stderr}")
        raise

def check_prerequisites() -> None:
    """Check if required tools are installed."""
    required_tools = [
        ("node", "Node.js is required. Install from https://nodejs.org/"),
        ("npm", "npm is required (comes with Node.js)"),
        ("git", "Git is required. Install from https://git-scm.com/"),
        ("npx", "npx is required (comes with npm)")
    ]
    
    missing_tools = []
    for tool, instruction in required_tools:
        try:
            run([tool, "--version"], capture_output=True, check=True)
        except (subprocess.CalledProcessError, FileNotFoundError):
            missing_tools.append((tool, instruction))
    
    if missing_tools:
        print_error("Missing required tools:")
        for tool, instruction in missing_tools:
            print(f"  - {tool}: {instruction}")
        sys.exit(1)

def create_next_app(project_dir: Path) -> None:
    """Create a new Next.js application with TypeScript and recommended settings."""
    print_step("Creating Next.js application...")
    
    # Use more explicit flags for better control
    cmd = [
        "npx", "--yes", "create-next-app@latest", project_dir.name,
        "--typescript",
        "--eslint", 
        "--tailwind", 
        "--src-dir",
        "--app",
        "--import-alias", "@/*"
    ]
    
    try:
        run(cmd, cwd=project_dir.parent)
        print_success("Next.js application created successfully")
    except subprocess.CalledProcessError:
        print_error("Failed to create Next.js application")
        raise

def install_deps(project_dir: Path) -> None:
    """Install all required dependencies."""
    print_step("Installing dependencies...")
    
    try:
        run(["npm", "install"] + CORE_NPM_DEPS, cwd=project_dir)
        print_success("Dependencies installed successfully")
    except subprocess.CalledProcessError:
        print_error("Failed to install dependencies")
        raise

def clone_repo(target_root: Path) -> Path:
    """Clone the Tank Royale repository if it doesn't exist."""
    repo_path = target_root / "tank-royale"
    
    if repo_path.exists():
        print_warning("Repository already exists, skipping clone")
        return repo_path
    
    print_step("Cloning Tank Royale repository...")
    
    try:
        run(["git", "clone", "--depth", "1", REPO_URL], cwd=target_root)
        print_success("Repository cloned successfully")
        return repo_path
    except subprocess.CalledProcessError:
        print_error("Failed to clone repository")
        raise

def generate_types(schema_dir: Path, out_dir: Path) -> None:
    """Generate TypeScript types from YAML schemas."""
    print_step("Generating TypeScript types from schemas...")
    
    if not schema_dir.exists():
        print_error(f"Schema directory not found: {schema_dir}")
        return
    
    out_dir.mkdir(parents=True, exist_ok=True)
    
    yaml_files = list(schema_dir.glob("*.yaml"))
    if not yaml_files:
        print_warning("No YAML schema files found")
        return
    
    generated_count = 0
    for yaml_file in yaml_files:
        ts_file = out_dir / f"{yaml_file.stem}.ts"
        
        try:
            run([
                "npx", "quicktype",
                "--lang", "ts",
                "--src-lang", "schema",
                "--just-types",
                "--alphabetize-properties",
                "--prefer-unions",
                "--nice-property-names",
                "--out", str(ts_file),
                str(yaml_file)
            ])
            generated_count += 1
        except subprocess.CalledProcessError:
            print_warning(f"Failed to generate types for {yaml_file.name}")
    
    if generated_count > 0:
        print_success(f"Generated {generated_count} TypeScript type files")
        
        # Create an index file to export all types
        index_file = out_dir / "index.ts"
        with index_file.open("w") as f:
            f.write("// Auto-generated type exports\n")
            for yaml_file in yaml_files:
                module_name = yaml_file.stem
                f.write(f"export * from './{module_name}';\n")
        
        print_success("Created index.ts for easy imports")

def create_basic_config_files(project_dir: Path) -> None:
    """Create some basic configuration files for the project."""
    print_step("Creating configuration files...")
    
    # Create a basic .env.local file
    env_file = project_dir / ".env.local"
    if not env_file.exists():
        with env_file.open("w") as f:
            f.write("# Tank Royale GUI Configuration\n")
            f.write("# Tank Royale server URL (adjust as needed)\n")
            f.write("NEXT_PUBLIC_TANK_ROYALE_SERVER_URL=ws://localhost:7654\n")
            f.write("\n# Development settings\n")
            f.write("NODE_ENV=development\n")
    
    # Create a basic README
    readme_file = project_dir / "README.md"
    if readme_file.exists():
        # Append to existing README
        with readme_file.open("a") as f:
            f.write("\n\n## Tank Royale GUI\n\n")
            f.write("This is a Tank Royale GUI application built with Next.js and TypeScript.\n\n")
            f.write("### Getting Started\n\n")
            f.write("1. Start the development server:\n")
            f.write("   ```bash\n   npm run dev\n   ```\n\n")
            f.write("2. Open [http://localhost:3000](http://localhost:3000) in your browser\n\n")
            f.write("### Tank Royale Server\n\n")
            f.write("To run the Tank Royale server locally:\n")
            f.write("```bash\n")
            f.write("cd ../tank-royale/runner\n")
            f.write("./gradlew :server:run\n")
            f.write("```\n")
    
    print_success("Configuration files created")

def main() -> None:
    """Main entry point for the bootstrap script."""
    parser = argparse.ArgumentParser(
        description="Bootstrap a Tank Royale GUI application",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s --name my-tank-gui
  %(prog)s --name my-tank-gui --generate-types
  %(prog)s --name my-tank-gui --force
        """
    )
    
    parser.add_argument(
        "--name", 
        default=DEFAULT_GUI_NAME,
        help=f"Folder (and package) name for the new GUI (default: {DEFAULT_GUI_NAME})"
    )
    
    parser.add_argument(
        "--generate-types", 
        action="store_true",
        help="Generate TypeScript models from the YAML schemas"
    )
    
    parser.add_argument(
        "--force", 
        action="store_true",
        help="Remove existing directory if it exists"
    )
    
    args = parser.parse_args()
    
    # Print header
    print(f"{Colors.BOLD}{Colors.GREEN}Tank Royale GUI Bootstrap{Colors.RESET}")
    print("=" * 30)
    
    # Check prerequisites
    check_prerequisites()
    
    # Setup paths
    root = Path.cwd()
    gui_dir = root / args.name
    
    # Handle existing directory
    if gui_dir.exists():
        if args.force:
            print_warning(f"Removing existing directory: {gui_dir}")
            shutil.rmtree(gui_dir)
        else:
            print_error(f"Directory {gui_dir} already exists")
            print("Use --force to overwrite or choose a different name")
            sys.exit(1)
    
    try:
        # Step 1: Clone repository
        print_step("Setting up Tank Royale repository", 1)
        repo_dir = clone_repo(root)
        
        # Step 2: Create Next.js app
        print_step("Creating Next.js application", 2)
        create_next_app(gui_dir)
        
        # Step 3: Install dependencies
        print_step("Installing dependencies", 3)
        install_deps(gui_dir)
        
        # Step 4: Create config files
        print_step("Setting up configuration", 4)
        create_basic_config_files(gui_dir)
        
        # Step 5: Generate types (optional)
        if args.generate_types:
            print_step("Generating TypeScript types", 5)
            schema_src = repo_dir / "schema" / "schemas"
            dest = gui_dir / "src" / "generated"
            generate_types(schema_src, dest)
        
        # Success message
        print("\n" + "=" * 50)
        print(f"{Colors.GREEN}{Colors.BOLD}🎉 Bootstrap completed successfully!{Colors.RESET}")
        print("=" * 50)
        
        print(f"\n{Colors.BOLD}Next steps:{Colors.RESET}")
        print(f"  1. {Colors.CYAN}cd {gui_dir}{Colors.RESET}")
        print(f"  2. {Colors.CYAN}npm run dev{Colors.RESET}  # Start the GUI on http://localhost:3000")
        
        print(f"\n{Colors.BOLD}To run the Tank Royale server locally:{Colors.RESET}")
        print(f"  {Colors.CYAN}cd {repo_dir}/runner && ./gradlew :server:run{Colors.RESET}")
        
        if args.generate_types:
            print(f"\n{Colors.BOLD}Generated types are available at:{Colors.RESET}")
            print(f"  {Colors.CYAN}{gui_dir}/src/generated/{Colors.RESET}")
        
    except Exception as e:
        print_error(f"Bootstrap failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
