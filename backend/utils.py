import difflib
from typing import List, Dict, Any


def compare_versions(old_version: Dict[str, Any], new_version: Dict[str, Any]) -> Dict[str, Any]:
    """
    Compare two versions of a note and return the differences.
    """
    result = {
        "title_changed": old_version["title"] != new_version["title"],
        "old_title": old_version["title"] if old_version["title"] != new_version["title"] else None,
        "new_title": new_version["title"] if old_version["title"] != new_version["title"] else None,
        "content_diff": []
    }

    # Compare content line by line
    old_lines = old_version["content"].splitlines()
    new_lines = new_version["content"].splitlines()
    
    # Use difflib to get a detailed comparison
    differ = difflib.Differ()
    diff = list(differ.compare(old_lines, new_lines))
    
    for line in diff:
        if line.startswith('  '):  # Unchanged line
            result["content_diff"].append({
                "type": "unchanged",
                "content": line[2:]
            })
        elif line.startswith('- '):  # Removed line
            result["content_diff"].append({
                "type": "removed",
                "content": line[2:]
            })
        elif line.startswith('+ '):  # Added line
            result["content_diff"].append({
                "type": "added",
                "content": line[2:]
            })
    
    return result
