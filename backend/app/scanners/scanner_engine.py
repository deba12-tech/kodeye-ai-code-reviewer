from app.scanners.javascript_scanner import scan_javascript
from app.scanners.python_scanner import scan_python


SEVERITY_PENALTY = {
    "Critical": 15,
    "High": 10,
    "Medium": 5,
    "Low": 2,
}


def calculate_score(issues: list[dict]) -> int:
    score = 100

    for issue in issues:
        score -= SEVERITY_PENALTY.get(issue["severity"], 0)

    return max(score, 0)


def generate_summary(score: int, issues: list[dict]) -> str:
    critical = len([i for i in issues if i["severity"] == "Critical"])
    high = len([i for i in issues if i["severity"] == "High"])
    medium = len([i for i in issues if i["severity"] == "Medium"])
    low = len([i for i in issues if i["severity"] == "Low"])

    if not issues:
        return "Kodeye found no major issues. Your code looks clean based on the current rule-based scan."

    return (
        f"Kodeye found {len(issues)} issue(s): "
        f"{critical} critical, {high} high, {medium} medium, and {low} low priority. "
        "Review the highest severity issues first."
    )


def generate_improved_code(code: str, issues: list[dict]) -> str:
    if not issues:
        return code

    notes = [
        "// Kodeye suggested improvements:",
        "// - Move secrets to environment variables",
        "// - Avoid unsafe functions like eval",
        "// - Replace debug logs with structured logging",
        "// - Use parameterized queries for database operations",
        "",
    ]

    return "\n".join(notes) + code


def analyze_code(code: str, language: str) -> dict:
    normalized_language = language.lower().strip()

    if normalized_language in ["javascript", "typescript", "js", "ts"]:
        issues = scan_javascript(code)
    elif normalized_language in ["python", "py"]:
        issues = scan_python(code)
    else:
        issues = []

    score = calculate_score(issues)
    summary = generate_summary(score, issues)
    improved_code = generate_improved_code(code, issues)

    return {
        "score": score,
        "summary": summary,
        "issues": issues,
        "improved_code": improved_code,
    }
