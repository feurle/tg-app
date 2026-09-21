#!/usr/bin/env python3
"""Move the [Unreleased] section of CHANGELOG.md into a dated release section.

Usage: cut-changelog.py <version> <date> [changelog-path]
Prints the new release section (for use as release notes) to stdout.
"""
import re
import sys
from pathlib import Path

REPO_URL = "https://github.com/feurle/tg-app"
CATEGORIES = ["Added", "Changed", "Deprecated", "Removed", "Fixed", "Security"]


def main() -> None:
    version, date = sys.argv[1], sys.argv[2]
    path = Path(sys.argv[3] if len(sys.argv) > 3 else "CHANGELOG.md")
    lines = path.read_text(encoding="utf-8").splitlines()

    unreleased_idx = next(i for i, l in enumerate(lines) if l.strip() == "## [Unreleased]")
    next_heading_idx = next(
        (i for i in range(unreleased_idx + 1, len(lines)) if lines[i].startswith("## [")),
        len(lines),
    )
    link_start = next(
        (i for i in range(unreleased_idx + 1, len(lines)) if re.match(r"^\[[^\]]+\]: ", lines[i])),
        len(lines),
    )
    section_end = min(next_heading_idx, link_start)

    old_section = lines[unreleased_idx + 1 : section_end]
    release_section = [f"## [{version}] - {date}", ""] + strip_empty_categories(old_section)
    while release_section and release_section[-1] == "":
        release_section.pop()

    template = ["## [Unreleased]", ""]
    for cat in CATEGORIES:
        template += [f"### {cat}", ""]

    previous = previous_version(lines[link_start:])
    links = [l for l in lines[link_start:] if not l.startswith("[Unreleased]: ")]
    links = [l for l in links if l.strip()]
    release_link = (
        f"[{version}]: {REPO_URL}/compare/v{previous}...v{version}"
        if previous
        else f"[{version}]: {REPO_URL}/releases/tag/v{version}"
    )
    links = [f"[Unreleased]: {REPO_URL}/compare/v{version}...HEAD", release_link] + links

    rest = lines[section_end:link_start]
    while rest and rest[-1] == "":
        rest.pop()

    new_lines = collapse_blank_lines(lines[:unreleased_idx] + template + release_section + [""] + rest)
    while new_lines and new_lines[-1] == "":
        new_lines.pop()
    new_lines += ["", *links]

    path.write_text("\n".join(new_lines) + "\n", encoding="utf-8")
    print("\n".join(release_section[2:]).strip())


def collapse_blank_lines(lines: list[str]) -> list[str]:
    result: list[str] = []
    for line in lines:
        if line == "" and result and result[-1] == "":
            continue
        result.append(line)
    return result


def strip_empty_categories(section: list[str]) -> list[str]:
    result: list[str] = []
    i = 0
    while i < len(section):
        line = section[i]
        if line.startswith("### "):
            j = i + 1
            while j < len(section) and not section[j].startswith("### "):
                j += 1
            block = section[i:j]
            if any(l.strip() for l in block[1:]):
                result += block
            i = j
        else:
            result.append(line)
            i += 1
    return result


def previous_version(link_lines: list[str]) -> str | None:
    for line in link_lines:
        m = re.match(r"^\[(\d+\.\d+\.\d+)\]: ", line)
        if m:
            return m.group(1)
    return None


if __name__ == "__main__":
    main()
