import os
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / "all_code.txt"

IGNORED_DIRS = {
    ".git", ".venv", "__pycache__", "build", "dist", "node_modules",
    "media", "venv", ".vscode",
}
IGNORED_FILES = {"all_code.txt", "export.py", "package-lock.json"}
IGNORED_SUFFIXES = {".png", ".jpg", ".jpeg", ".svg", ".ico", ".xlsx", ".pyc"}
SECRET_ASSIGNMENT = re.compile(
    r"^(\s*(?:export\s+)?[A-Za-z0-9_]*(?:SECRET|PASSWORD|TOKEN|KEY)[A-Za-z0-9_]*\s*=\s*).*$",
    re.IGNORECASE,
)


def exclusion_reason(path: Path) -> str | None:
    name = path.name.lower()
    if name.startswith(".env") and name != ".env.example":
        return "environment files"
    if name in IGNORED_FILES:
        return "excluded filenames"
    if "secret" in name or name.endswith((".pem", ".key")):
        return "secret-like filenames"
    if name.endswith((".sqlite3", ".sqlite3-wal", ".sqlite3-shm", ".log")):
        return "database and log files"
    if path.suffix.lower() in IGNORED_SUFFIXES:
        return "binary and generated files"
    return None


excluded = {}
excluded_dirs = {}
masked_lines = 0
with OUTPUT.open("w", encoding="utf-8") as outfile:
    for current, dirs, files in os.walk(ROOT):
        current_path = Path(current)
        for dirname in dirs:
            if dirname.lower() in IGNORED_DIRS:
                excluded_dirs[dirname] = excluded_dirs.get(dirname, 0) + 1
        dirs[:] = [d for d in dirs if d.lower() not in IGNORED_DIRS]
        for filename in files:
            path = current_path / filename
            reason = exclusion_reason(path)
            if reason:
                excluded[reason] = excluded.get(reason, 0) + 1
                continue
            relative = path.relative_to(ROOT)
            outfile.write(f"\n\n========================================================\n")
            outfile.write(f"FILE: {relative.as_posix()}\n")
            outfile.write(f"========================================================\n\n")
            try:
                content = path.read_text(encoding="utf-8", errors="ignore")
                safe_lines = []
                for line in content.splitlines(keepends=True):
                    match = SECRET_ASSIGNMENT.match(line.rstrip("\r\n"))
                    if match:
                        prefix = match.group(1)
                        ending = "\r\n" if line.endswith("\r\n") else "\n" if line.endswith("\n") else ""
                        safe_lines.append(prefix + "[REDACTED]" + ending)
                        masked_lines += 1
                    else:
                        safe_lines.append(line)
                outfile.write("".join(safe_lines))
            except (OSError, UnicodeError) as exc:
                outfile.write(f"[Could not read file: {type(exc).__name__}]\n")

print(f"Export written to {OUTPUT.name}")
print("Excluded files:")
for reason, count in sorted(excluded.items()):
    print(f"  {reason}: {count}")
print("Excluded directories:")
for dirname, count in sorted(excluded_dirs.items(), key=lambda item: item[0].lower()):
    print(f"  {dirname}/: {count}")
print(f"Masked secret-like assignment lines: {masked_lines}")
