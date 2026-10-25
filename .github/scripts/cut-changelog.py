#!/usr/bin/env python3
"""Move the [Unreleased] section of CHANGELOG.md into a dated release section.

Usage: cut-changelog.py <version> <date> [changelog-path]
Prints the new release section (for use as release notes) to stdout.

Fragments in changelog.d/ next to the changelog (one file per PR, with the same "### Category"
headings) are merged into [Unreleased] first and deleted afterwards.
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

    fragments = sorted(
        f for f in (path.parent / "changelog.d").glob("*.md") if f.name != "README.md"
    )
    old_section = merge_fragments(lines[unreleased_idx + 1 : section_end], fragments)
    release_section = [f"## [{version}] - {date}", ""] + old_section
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
    for fragment in fragments:
        fragment.unlink()
    print("\n".join(release_section[2:]).strip())


def collapse_blank_lines(lines: list[str]) -> list[str]:
    result: list[str] = []
    for line in lines:
        if line == "" and result and result[-1] == "":
            continue
        result.append(line)
    return result


def split_categories(section: list[str]) -> dict[str, list[str]]:
    """Group the lines of a section by their "### Category" heading, dropping blank lines."""
    result: dict[str, list[str]] = {}
    current = None
    for line in section:
        if line.startswith("### "):
            current = line[4:].strip()
            if current not in CATEGORIES:
                sys.exit(f"Unknown changelog category: {current}")
            result.setdefault(current, [])
        elif line.strip() and current is not None:
            result[current].append(line)
    return result


def merge_fragments(section: list[str], fragments: list[Path]) -> list[str]:
    """Return the [Unreleased] section with the fragment bullets added and empty categories dropped."""
    categories = split_categories(section)
    for fragment in fragments:
        for cat, bullets in split_categories(fragment.read_text(encoding="utf-8").splitlines()).items():
            categories.setdefault(cat, []).extend(bullets)
    result: list[str] = []
    for cat in CATEGORIES:
        if categories.get(cat):
            result += [f"### {cat}", ""] + categories[cat] + [""]
    return result


def previous_version(link_lines: list[str]) -> str | None:
    for line in link_lines:
        m = re.match(r"^\[(\d+\.\d+\.\d+)\]: ", line)
        if m:
            return m.group(1)
    return None


if __name__ == "__main__":
    main()
