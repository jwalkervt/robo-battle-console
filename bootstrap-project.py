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
import json
import shlex
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Optional

# Configuration
REPO_URL = "https://github.com/robocode-dev/tank-royale.git"
DEFAULT_GUI_NAME = "tank-royale-webgui"
MIN_NODE_VERSION = 18

# Core dependencies for the Tank Royale GUI
NPM_DEPS = [
    "pixi.js@^8.0.0",
    "zustand@^4.4.0",
    "zod@^3.22.0",
]
NPM_DEV_DEPS = [
    "typescript@^5.0.0",
    "@types/node@^20.0.0",
    "@types/react@^18.0.0",
    "@types/react-dom@^18.0.0",
    "quicktype@^23.0.0",
    "prettier@^3.0.0",
    "@typescript-eslint/eslint-plugin@^8.0.0",
    "@typescript-eslint/parser@^8.0.0",
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


def print_info(message: str) -> None:
    """Print an informational message."""
    print(f"{Colors.BLUE}ℹ {message}{Colors.RESET}")


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
        cmd: Command to execute as list of strings.
        cwd: Working directory for the command.
        check: Whether to raise exception on non-zero exit code.
        capture_output: Whether to capture stdout/stderr.

    Returns:
        CompletedProcess object.

    Raises:
        subprocess.CalledProcessError: If command fails and check=True.
        FileNotFoundError: If the command is not found.
    """
    print(f"{Colors.CYAN}+ {shlex.join(cmd)}{Colors.RESET}")
    try:
        result = subprocess.run(
            cmd,
            cwd=cwd,
            check=check,
            capture_output=capture_output,
            text=True,
            encoding='utf-8'
        )
        return result
    except subprocess.CalledProcessError as e:
        print_error(f"Command failed with exit code {e.returncode}")
        if e.stdout:
            print_error(f"Stdout: {e.stdout.strip()}")
        if e.stderr:
            print_error(f"Stderr: {e.stderr.strip()}")
        raise
    except FileNotFoundError:
        print_error(f"Command not found: {cmd[0]}")
        raise


def check_prerequisites() -> None:
    """Check if required tools are installed and meet version requirements."""
    print_step("Checking prerequisites...")
    required_tools = [
        ("node", f"Node.js v{MIN_NODE_VERSION}+ is required. Install from https://nodejs.org/"),
        ("npm", "npm is required (comes with Node.js)"),
        ("git", "Git is required. Install from https://git-scm.com/"),
        ("npx", "npx is required (comes with npm)")
    ]

    missing_tools = []
    for tool, instruction in required_tools:
        if not shutil.which(tool):
            missing_tools.append((tool, instruction))

    if missing_tools:
        print_error("Missing required tools:")
        for tool, instruction in missing_tools:
            print(f"  - {tool}: {instruction}")
        sys.exit(1)

    # Check Node.js version
    try:
        result = run(["node", "--version"], capture_output=True, check=True)
        version_str = result.stdout.strip().lstrip('v')
        major_version = int(version_str.split('.')[0])
        if major_version < MIN_NODE_VERSION:
            print_warning(f"Node.js version is {version_str}. v{MIN_NODE_VERSION}+ is recommended.")
    except (subprocess.CalledProcessError, ValueError):
        print_warning("Could not determine Node.js version. Please ensure it's a recent version.")

    print_success("All prerequisites are met.")


def create_next_app(project_dir: Path) -> None:
    """Create a new Next.js application with TypeScript and recommended settings."""
    print_step("Creating Next.js application...")

    cmd = [
        "npx", "--yes", "create-next-app@latest", project_dir.name,
        "--typescript", "--eslint", "--tailwind", "--src-dir", "--app",
        "--import-alias", "@/*"
    ]

    try:
        run(cmd, cwd=project_dir.parent)
        print_success("Next.js application created successfully")
    except subprocess.CalledProcessError:
        print_error("Failed to create Next.js application.")
        print_info("Scroll up to see the output from 'create-next-app' for details.")
        raise


def install_deps(project_dir: Path) -> None:
    """Install all required dependencies."""
    print_step("Installing dependencies...")

    try:
        if NPM_DEPS:
            print_info("Installing runtime dependencies...")
            run(["npm", "install", "--save"] + NPM_DEPS, cwd=project_dir)

        if NPM_DEV_DEPS:
            print_info("Installing development dependencies...")
            run(["npm", "install", "--save-dev"] + NPM_DEV_DEPS, cwd=project_dir)

        print_success("Dependencies installed successfully")
    except subprocess.CalledProcessError:
        print_error("Failed to install dependencies")
        raise


def setup_tank_royale_repo(target_root: Path) -> Path:
    """
    Clones the Tank Royale repository for schema access.
    Uses a shallow clone (--depth 1) to minimize download size.
    """
    repo_path = target_root / "tank-royale"

    if repo_path.exists():
        print_warning("Tank Royale repository already exists, skipping clone.")
        return repo_path

    print_info("Cloning Tank Royale repository (for schemas)...")

    try:
        # Using --depth 1 to only get the latest commit, which is all we need
        # for the schemas. This is much faster than a full clone.
        run(["git", "clone", "--depth", "1", REPO_URL, str(repo_path)], cwd=target_root)
        print_success("Repository cloned successfully")
        return repo_path
    except subprocess.CalledProcessError:
        print_error("Failed to clone Tank Royale repository")
        raise


def generate_types(schema_dir: Path, out_dir: Path) -> None:
    """
    Generate TypeScript types from YAML schemas using quicktype.
    Fails if any schema file cannot be processed.
    """
    print_step("Generating TypeScript types from schemas...")

    if not schema_dir.exists():
        print_error(f"Schema directory not found: {schema_dir}")
        raise FileNotFoundError(f"Schema directory not found: {schema_dir}")

    out_dir.mkdir(parents=True, exist_ok=True)

    yaml_files = sorted(list(schema_dir.glob("*.yaml")))
    if not yaml_files:
        print_warning("No YAML schema files found, skipping type generation.")
        return

    print_info(f"Found {len(yaml_files)} schema files to process.")
    errors = []
    generated_files = []

    for yaml_file in yaml_files:
        ts_file = out_dir / f"{yaml_file.stem}.ts"
        try:
            run([
                "npx", "quicktype", "--lang", "ts", "--src-lang", "yaml",
                "--just-types", "--alphabetize-properties", "--prefer-unions",
                "--nice-property-names", "--out", str(ts_file), str(yaml_file)
            ])
            generated_files.append(ts_file)
        except subprocess.CalledProcessError:
            err_msg = f"Failed to generate types for {yaml_file.name}"
            print_error(err_msg)
            errors.append(err_msg)

    if errors:
        raise RuntimeError("Type generation failed for one or more schema files.")

    if generated_files:
        print_success(f"Generated {len(generated_files)} TypeScript type files.")

        # Create an index file to export all types
        index_file = out_dir / "index.ts"
        with index_file.open("w") as f:
            f.write("// Auto-generated type exports\n")
            for ts_file in generated_files:
                module_name = ts_file.stem
                f.write(f"export * from './{module_name}';\n")
        print_success("Created index.ts for easy type imports.")


def create_prettier_config(project_dir: Path) -> None:
    """Creates a .prettierrc.json file with sensible defaults."""
    print_info("Creating Prettier configuration...")
    prettier_config = {
        "semi": True,
        "tabWidth": 2,
        "singleQuote": False,
        "trailingComma": "es5",
        "arrowParens": "always",
    }
    config_file = project_dir / ".prettierrc.json"
    if config_file.exists():
        print_warning("Prettier config already exists, skipping.")
        return
    with config_file.open("w") as f:
        json.dump(prettier_config, f, indent=2)
    print_success("Created .prettierrc.json")


def create_basic_config_files(project_dir: Path) -> None:
    """Create or update basic configuration files for the project."""
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
        print_success("Created .env.local file.")

    # Append to the README generated by Next.js
    readme_file = project_dir / "README.md"
    if readme_file.exists():
        with readme_file.open("a") as f:
            f.write("\n\n## Tank Royale GUI\n\n")
            f.write("This is a Tank Royale GUI application bootstrapped with a custom script.\n\n")
            f.write("### Getting Started\n\n")
            f.write("1. Start the development server:\n")
            f.write("   ```bash\n   npm run dev\n   ```\n\n")
            f.write("2. Open [http://localhost:3000](http://localhost:3000) in your browser.\n\n")
            f.write("### Tank Royale Server\n\n")
            f.write("To run the Tank Royale server locally, you'll need to have the `tank-royale` repository cloned adjacent to this project.\n")
            f.write("```bash\n")
            f.write("# From the root directory containing both projects\n")
            f.write("cd tank-royale/runner\n")
            f.write("./gradlew :server:run\n")
            f.write("```\n")
        print_success("Updated README.md with project-specific instructions.")

    create_prettier_config(project_dir)


def main() -> None:
    """Main entry point for the bootstrap script."""
    parser = argparse.ArgumentParser(
        description="Bootstrap a Tank Royale GUI application.",
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
        help="Generate TypeScript models from the YAML schemas."
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Remove existing directory if it exists."
    )

    args = parser.parse_args()

    print(f"\n{Colors.BOLD}{Colors.GREEN}Tank Royale GUI Bootstrap{Colors.RESET}")
    print("=" * 40)

    try:
        check_prerequisites()

        root = Path.cwd()
        gui_dir = root / args.name

        if gui_dir.exists():
            if args.force:
                print_warning(f"Removing existing directory: {gui_dir}")
                shutil.rmtree(gui_dir)
            else:
                print_error(f"Directory '{gui_dir.name}' already exists.")
                print_info("Use --force to overwrite or choose a different name.")
                sys.exit(1)

        # Step 1: Clone repository (if needed for schemas)
        print_step("Setting up Tank Royale repository", 1)
        repo_dir = setup_tank_royale_repo(root)

        # Step 2: Create Next.js app
        print_step("Creating Next.js application", 2)
        create_next_app(gui_dir)

        # Step 3: Install dependencies
        print_step("Installing additional dependencies", 3)
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

        print("\n" + "=" * 50)
        print(f"{Colors.GREEN}{Colors.BOLD}🎉 Bootstrap completed successfully!{Colors.RESET}")
        print("=" * 50)

        print(f"\n{Colors.BOLD}Next steps:{Colors.RESET}")
        print(f"  1. {Colors.CYAN}cd {args.name}{Colors.RESET}")
        print(f"  2. {Colors.CYAN}npm run dev{Colors.RESET}  (to start the GUI on http://localhost:3000)")

        print(f"\n{Colors.BOLD}To run the Tank Royale server locally:{Colors.RESET}")
        print(f"  {Colors.CYAN}cd ../tank-royale/runner && ./gradlew :server:run{Colors.RESET}")

        if args.generate_types:
            print(f"\n{Colors.BOLD}Generated types are available at:{Colors.RESET}")
            print(f"  {Colors.CYAN}{Path(args.name) / 'src' / 'generated'}{Colors.RESET}")

    except (subprocess.CalledProcessError, RuntimeError, FileNotFoundError) as e:
        print_error(f"\nBootstrap failed: {e}")
        sys.exit(1)
    except KeyboardInterrupt:
        print_error("\nBootstrap cancelled by user.")
        sys.exit(1)


if __name__ == "__main__":
    main()
