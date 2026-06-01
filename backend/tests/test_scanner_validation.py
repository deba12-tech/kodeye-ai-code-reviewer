"""Scanner input validation and scoring tests."""

from app.scanners.scanner_engine import analyze_code


def test_random_text_is_rejected_as_invalid_code(client):
    response = client.post(
        "/api/v1/reviews/analyze",
        json={
            "project_name": "Random Text",
            "language": "JavaScript",
            "code": "hello this is not code I am just testing random words",
            "review_depth": "quick",
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Please enter valid code to analyze."


def test_clean_javascript_keeps_high_score_without_major_findings():
    result = analyze_code(
        """function addNumbers(a, b) {
  return a + b;
}""",
        "JavaScript",
    )

    assert result["score"] >= 90
    assert result["issues"] == []


def test_risky_javascript_still_returns_security_findings():
    result = analyze_code(
        """const password = "admin123";
eval(userInput);""",
        "JavaScript",
    )

    titles = {issue["title"] for issue in result["issues"]}
    assert "Hardcoded Password" in titles
    assert "Unsafe eval Usage" in titles
    assert result["score"] < 90
