import re


def scan_python(code: str) -> list[dict]:
    issues = []
    lines = code.splitlines()

    for index, line in enumerate(lines, start=1):
        stripped = line.strip()
        
        # Remove comments for matching rules to avoid false positives in comments/docs
        code_part = re.sub(r"#.*", "", stripped).strip()

        if "eval(" in code_part:
            issues.append({
                "title": "Unsafe eval Usage",
                "severity": "Critical",
                "category": "Security",
                "line_number": index,
                "description": "eval() can execute arbitrary Python code and create security risks.",
                "suggested_fix": "Avoid eval(). Use safer parsing like ast.literal_eval when appropriate.",
                "fixed_code": "# Replace eval() with ast.literal_eval() where safe"
            })

        if code_part.startswith("print("):
            issues.append({
                "title": "Print Statement in Production",
                "severity": "Low",
                "category": "Readability",
                "line_number": index,
                "description": "print statements should be replaced with structured logging in production.",
                "suggested_fix": "Use Python's logging module instead of print.",
                "fixed_code": "logging.info(...)"
            })

        if re.search(r"(api[_-]?key|token|secret)\s*=\s*['\"][^'\"]+['\"]", code_part, re.IGNORECASE) and not "SECRET_KEY" in code_part:
            issues.append({
                "title": "Hardcoded Secret Detected",
                "severity": "Critical",
                "category": "Security",
                "line_number": index,
                "description": "Hardcoded API keys, tokens, or secrets can be leaked from source code.",
                "suggested_fix": "Move secrets into environment variables.",
                "fixed_code": "API_KEY = os.getenv('API_KEY')"
            })

        if re.search(r"password\s*=\s*['\"][^'\"]+['\"]", code_part, re.IGNORECASE):
            issues.append({
                "title": "Hardcoded Password",
                "severity": "Critical",
                "category": "Security",
                "line_number": index,
                "description": "Hardcoded passwords are unsafe.",
                "suggested_fix": "Use environment variables or a secret manager.",
                "fixed_code": "password = os.getenv('PASSWORD')"
            })

        if code_part == "except:":
            issues.append({
                "title": "Bare Except Block",
                "severity": "Medium",
                "category": "Best Practice",
                "line_number": index,
                "description": "Bare except catches all exceptions and can hide serious errors.",
                "suggested_fix": "Catch specific exceptions instead.",
                "fixed_code": "except ValueError as e:"
            })

        if code_part in ["pass", "except: pass"]:
            issues.append({
                "title": "Silent Exception Handling",
                "severity": "Medium",
                "category": "Best Practice",
                "line_number": index,
                "description": "Using pass inside exception handling can silently hide bugs.",
                "suggested_fix": "Log the exception or handle it properly.",
                "fixed_code": "logging.exception('Error occurred')"
            })

        if "debug=True" in code_part:
            issues.append({
                "title": "Debug Mode Enabled",
                "severity": "High",
                "category": "Security",
                "line_number": index,
                "description": "Debug mode should not be enabled in production environments.",
                "suggested_fix": "Disable debug mode in production.",
                "fixed_code": "debug=False"
            })

        if "pickle.loads" in code_part:
            issues.append({
                "title": "Unsafe pickle.loads Usage",
                "severity": "High",
                "category": "Security",
                "line_number": index,
                "description": "pickle.loads can execute malicious code when loading untrusted data.",
                "suggested_fix": "Avoid pickle for untrusted data. Use JSON or safer serializers.",
                "fixed_code": "json.loads(data)"
            })

        if re.search(r"SELECT .* \+|query\s*\+|WHERE .* \+", code_part, re.IGNORECASE):
            issues.append({
                "title": "Possible SQL Injection",
                "severity": "High",
                "category": "Security",
                "line_number": index,
                "description": "SQL queries built using string concatenation can be vulnerable to injection.",
                "suggested_fix": "Use parameterized queries.",
                "fixed_code": "cursor.execute('SELECT * FROM users WHERE id = %s', (user_id,))"
            })

        if re.search(r"\bshell\s*=\s*True\b", code_part):
            issues.append({
                "title": "Insecure Subprocess Execution",
                "severity": "High",
                "category": "Security",
                "line_number": index,
                "description": "Running subprocess commands with shell=True permits command injection vulnerabilities if user input is interpolated.",
                "suggested_fix": "Pass arguments as a structured array or set shell=False.",
                "fixed_code": stripped.replace("shell=True", "shell=False")
            })

        if re.search(r"\bverify\s*=\s*False\b", code_part):
            issues.append({
                "title": "Disabled SSL Verification",
                "severity": "High",
                "category": "Security",
                "line_number": index,
                "description": "Disabling SSL validation (verify=False) exposes HTTP calls to Man-in-the-Middle (MitM) attacks.",
                "suggested_fix": "Remove verify=False or bind to valid CA certificate authorities.",
                "fixed_code": stripped.replace("verify=False", "verify=True")
            })

        if re.search(r"\byaml\s*\.\s*load\s*\(", code_part) and not "SafeLoader" in code_part and not "Loader=yaml.safe_load" in code_part:
            issues.append({
                "title": "Unsafe YAML Parsing",
                "severity": "High",
                "category": "Security",
                "line_number": index,
                "description": "yaml.load() without SafeLoader can deserialize arbitrary Python objects, leading to arbitrary code execution.",
                "suggested_fix": "Use yaml.safe_load() or configure SafeLoader Loader options.",
                "fixed_code": stripped.replace("yaml.load", "yaml.safe_load")
            })

        if re.search(r"\bexcept\b", code_part) and code_part.endswith(":"):
            found_empty = False
            # Look ahead up to 3 lines for a pass/ellipsis/continue statements
            for j in range(index, min(index + 3, len(lines))):
                next_line = lines[j].strip()
                if not next_line or next_line.startswith("#"):
                    continue
                if next_line in ["pass", "...", "continue"]:
                    found_empty = True
                break
            if found_empty:
                issues.append({
                    "title": "Silent Exception Suppressed",
                    "severity": "Medium",
                    "category": "Best Practice",
                    "line_number": index,
                    "description": "Suppressing catches silently with pass hides bugs and breaks logging audit scopes.",
                    "suggested_fix": "Log the captured exception detail using the logger module.",
                    "fixed_code": "# Handle or log the exception instead of passing silently"
                })

        if re.search(r"\bdebug\s*=\s*True\b", code_part) and ("app.run(" in code_part or "run(" in code_part):
            issues.append({
                "title": "Flask Debug Mode Active",
                "severity": "High",
                "category": "Security",
                "line_number": index,
                "description": "Running Flask apps with debug=True enables active interactive debug consoles, enabling RCE.",
                "suggested_fix": "Disable Flask debugging in production deployment configurations.",
                "fixed_code": stripped.replace("debug=True", "debug=False")
            })

        if re.search(r"\bSECRET_KEY\s*=\s*['\"][^'\"]+['\"]", code_part):
            issues.append({
                "title": "Hardcoded Django/Flask SECRET_KEY",
                "severity": "Critical",
                "category": "Security",
                "line_number": index,
                "description": "A hardcoded SECRET_KEY makes session cryptographic signature validation vulnerable to manipulation.",
                "suggested_fix": "Load secret keys dynamically from environment parameter configs.",
                "fixed_code": "SECRET_KEY = os.environ.get('SECRET_KEY', 'fallback-key')"
            })

        if "=" in code_part:
            parts = code_part.split("=", 1)
            lhs, rhs = parts[0].strip(), parts[1].strip()
            if re.search(r"(token|secret|password|key)", lhs, re.IGNORECASE) and re.search(r"\b(choice|randint|random|randrange|uniform|sample|choices|randbytes|getrandbits)\b", rhs):
                issues.append({
                    "title": "Insecure Pseudo-Random Generator",
                    "severity": "Medium",
                    "category": "Security",
                    "line_number": index,
                    "description": "The standard random module is pseudo-random and mathematically predictable. Do not use it for crypto token generation.",
                    "suggested_fix": "Use the secrets module for secure cryptographic token allocations.",
                    "fixed_code": "import secrets\ntoken = secrets.token_hex(16)"
                })

        if re.search(r"\bopen\s*\(", code_part) and not "with open" in code_part and "=" in code_part:
            issues.append({
                "title": "Unclosed File Stream",
                "severity": "Low",
                "category": "Best Practice",
                "line_number": index,
                "description": "Calling open() directly without context managers can cause unclosed file handle resource leaks.",
                "suggested_fix": "Encapsulate file transactions using Python 'with' context managers.",
                "fixed_code": "# Use context manager: with open(...) as f:"
            })

    return issues
