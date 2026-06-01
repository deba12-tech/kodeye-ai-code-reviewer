from app.scanners.javascript_scanner import scan_javascript
from app.scanners.python_scanner import scan_python


class InvalidCodeError(ValueError):
    """Raised when user input does not look like analyzable source code."""


SEVERITY_PENALTY = {
    "Critical": 15,
    "High": 10,
    "Medium": 5,
    "Low": 2,
}


def _count_signals(code: str, signals: list[str]) -> int:
    lowered = code.lower()
    return sum(1 for signal in signals if signal in lowered)


def is_code_like(code: str, language: str) -> bool:
    normalized_language = language.lower().strip()
    stripped = code.strip()
    if not stripped:
        return False

    if normalized_language in ["javascript", "typescript", "js", "ts"]:
        signals = [
            "function",
            "const",
            "let",
            "var",
            "import",
            "export",
            "class",
            "=>",
            "if (",
            "for (",
            "while (",
            "try {",
            "catch",
            "console.",
            "return",
            ";",
        ]
        signal_count = _count_signals(stripped, signals)
        if "{" in stripped and "}" in stripped:
            signal_count += 1
        return signal_count >= 2

    if normalized_language in ["python", "py"]:
        signals = [
            "def ",
            "import ",
            "class ",
            "if ",
            "for ",
            "while ",
            "try:",
            "except",
            "print(",
            "return",
            "=",
        ]
        signal_count = _count_signals(stripped, signals)
        if any(line.rstrip().endswith(":") for line in stripped.splitlines()):
            signal_count += 1
        if any(token in stripped for token in ("[", "]", "{", "}")):
            signal_count += 1
        return signal_count >= 2

    return True


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

    if not is_code_like(code, normalized_language):
        raise InvalidCodeError("Please enter valid code to analyze.")

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
