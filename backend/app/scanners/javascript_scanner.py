import re


def scan_javascript(code: str) -> list[dict]:
    issues = []
    lines = code.splitlines()

    for index, line in enumerate(lines, start=1):
        stripped = line.strip()
        
        # Remove comments for matching rules to avoid false positives in comments/docs
        code_part = re.sub(r"\/\/.*", "", stripped)
        code_part = re.sub(r"\/\*.*?\*\/", "", code_part).strip()

        if "eval(" in code_part:
            issues.append({
                "title": "Unsafe eval Usage",
                "severity": "Critical",
                "category": "Security",
                "line_number": index,
                "description": "eval() can execute arbitrary code and create serious security risks.",
                "suggested_fix": "Avoid eval(). Use safer parsing or controlled function mapping.",
                "fixed_code": "// Replace eval() with a safe alternative"
            })

        if "console.log" in code_part:
            issues.append({
                "title": "Console Log in Production",
                "severity": "Low",
                "category": "Readability",
                "line_number": index,
                "description": "console.log statements should usually be removed from production code.",
                "suggested_fix": "Use a proper logger or remove debug logs before deployment.",
                "fixed_code": stripped.replace("console.log", "// console.log")
            })

        if "innerHTML" in code_part and "=" in code_part:
            issues.append({
                "title": "Unsafe innerHTML Assignment",
                "severity": "High",
                "category": "Security",
                "line_number": index,
                "description": "Assigning user-controlled content to innerHTML may cause XSS vulnerabilities.",
                "suggested_fix": "Use textContent or sanitize input before rendering HTML.",
                "fixed_code": stripped.replace("innerHTML", "textContent")
            })

        if re.search(r"(api[_-]?key|token|secret)\s*=\s*['\"][^'\"]+['\"]", code_part, re.IGNORECASE) and not re.search(r"ey[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_=]*", code_part):
            issues.append({
                "title": "Hardcoded Secret Detected",
                "severity": "Critical",
                "category": "Security",
                "line_number": index,
                "description": "Hardcoded API keys, tokens, or secrets can be leaked from source code.",
                "suggested_fix": "Move secrets to environment variables.",
                "fixed_code": "const API_KEY = process.env.API_KEY;"
            })

        if re.search(r"password\s*=\s*['\"][^'\"]+['\"]", code_part, re.IGNORECASE):
            issues.append({
                "title": "Hardcoded Password",
                "severity": "Critical",
                "category": "Security",
                "line_number": index,
                "description": "Hardcoded passwords are unsafe and should never be stored in code.",
                "suggested_fix": "Use environment variables or a secure secret manager.",
                "fixed_code": "const password = process.env.PASSWORD;"
            })

        if code_part.startswith("var "):
            issues.append({
                "title": "Use of var",
                "severity": "Low",
                "category": "Best Practice",
                "line_number": index,
                "description": "var has function scope and can cause unexpected behavior.",
                "suggested_fix": "Use let or const instead of var.",
                "fixed_code": stripped.replace("var ", "let ", 1)
            })

        if re.search(r"SELECT .* \+|query\s*\+|WHERE .* \+", code_part, re.IGNORECASE):
            issues.append({
                "title": "Possible SQL Injection",
                "severity": "High",
                "category": "Security",
                "line_number": index,
                "description": "Building SQL queries using string concatenation can lead to SQL injection.",
                "suggested_fix": "Use parameterized queries or ORM query builders.",
                "fixed_code": "// Use parameterized query instead"
            })

        if "localStorage" in code_part and re.search(r"(setItem|token|password|key|secret|jwt)", code_part, re.IGNORECASE) and re.search(r"(token|password|key|secret|jwt)", code_part, re.IGNORECASE):
            issues.append({
                "title": "Sensitive Data in localStorage",
                "severity": "High",
                "category": "Security",
                "line_number": index,
                "description": "Storing tokens, passwords, or API keys in localStorage makes them vulnerable to XSS leaks.",
                "suggested_fix": "Use secure HTTP-only cookies or encrypted memory session storage.",
                "fixed_code": "// Store sensitive credentials in secure HttpOnly cookies instead"
            })

        if re.search(r"\bdocument\s*\.\s*write(ln)?\b", code_part):
            issues.append({
                "title": "Unsafe document.write Usage",
                "severity": "Medium",
                "category": "Security",
                "line_number": index,
                "description": "document.write() can overwrite pages, block rendering, and introduce XSS vulnerabilities.",
                "suggested_fix": "Use modern DOM manipulation APIs like textContent or insertAdjacentHTML.",
                "fixed_code": stripped.replace("document.write", "// Use textContent or DOM manipulation instead")
            })

        if re.search(r"\b(setTimeout|setInterval)\s*\(\s*['\"`]", code_part):
            issues.append({
                "title": "Unsafe Timer Callback",
                "severity": "Medium",
                "category": "Security",
                "line_number": index,
                "description": "Passing strings to setTimeout/setInterval compiles code dynamically, similar to eval().",
                "suggested_fix": "Pass an anonymous or named arrow function callback instead of a string.",
                "fixed_code": re.sub(r"(setTimeout|setInterval)\s*\(\s*['\"`](.+)['\"`]", r"\1(() => \2", stripped)
            })

        if "fetch(" in code_part:
            if "catch" in code_part:
                has_catch = True
            else:
                has_catch = False
                for j in range(index, min(index + 8, len(lines))):
                    next_line_code = re.sub(r"\/\/.*", "", lines[j])
                    next_line_code = re.sub(r"\/\*.*?\*\/", "", next_line_code).strip()
                    if "fetch(" in next_line_code:
                        break
                    if "catch" in next_line_code:
                        has_catch = True
                        break
            if not has_catch:
                issues.append({
                    "title": "Unhandled fetch Rejection",
                    "severity": "Medium",
                    "category": "Best Practice",
                    "line_number": index,
                    "description": "A fetch API call lacks direct inline catch validation. Network dropouts will cause unhandled promise rejections.",
                    "suggested_fix": "Append .catch() rejection handler to your fetch promise chain.",
                    "fixed_code": stripped + ".catch(err => console.error(err))"
                })

        if "catch" in code_part:
            found_empty_catch = False
            opened = False
            brace_count = 0
            block_chars = []
            
            # Look ahead up to 10 lines ahead to parse braces
            first_line = True
            for j in range(index - 1, min(index + 10, len(lines))):
                line_val = lines[j]
                if not opened:
                    if first_line:
                        catch_idx = line_val.find("catch")
                        if catch_idx != -1:
                            brace_idx = line_val.find("{", catch_idx)
                            if brace_idx != -1:
                                opened = True
                                line_val = line_val[brace_idx:]
                                first_line = False
                            else:
                                first_line = False
                                continue
                        else:
                            continue
                    else:
                        if "{" in line_val:
                            opened = True
                            idx = line_val.find("{")
                            line_val = line_val[idx:]
                        else:
                            continue
                else:
                    first_line = False
                
                for char in line_val:
                     if char == "{":
                         brace_count += 1
                         block_chars.append(char)
                     elif char == "}":
                         brace_count -= 1
                         block_chars.append(char)
                         if brace_count == 0:
                             break
                     else:
                         block_chars.append(char)
                if opened:
                    if brace_count == 0:
                        break
                    block_chars.append("\n")
            
            if opened and brace_count == 0:
                block_content = "".join(block_chars)
                first_brace = block_content.find("{")
                last_brace = block_content.rfind("}")
                inner = block_content[first_brace+1:last_brace].strip()
                # Remove comments
                inner_no_comments = re.sub(r"\/\/.*", "", inner)
                inner_no_comments = re.sub(r"\/\*[\s\S]*?\*\/", "", inner_no_comments)
                if not inner_no_comments.strip():
                    found_empty_catch = True
            else:
                if re.search(r"catch\s*(?:\([^)]*\))?\s*\{\s*\}", code_part):
                    found_empty_catch = True
                    
            if found_empty_catch:
                issues.append({
                    "title": "Empty catch Block",
                    "severity": "Medium",
                    "category": "Best Practice",
                    "line_number": index,
                    "description": "An empty catch block swallows runtime errors silently, making debugging and auditing extremely difficult.",
                    "suggested_fix": "Log the captured error using a logger or handle it gracefully.",
                    "fixed_code": "catch (error) { console.error(error); }"
                })

        if re.search(r"\bey[A-Za-z0-9-_=]{10,}\.[A-Za-z0-9-_=]{10,}\.[A-Za-z0-9-_=]*", code_part):
            issues.append({
                "title": "Hardcoded JWT Token Detected",
                "severity": "Critical",
                "category": "Security",
                "line_number": index,
                "description": "A hardcoded JSON Web Token (JWT) signature is exposed, risking account takeovers.",
                "suggested_fix": "Remove hardcoded credentials. Issue session signs from backend environments dynamically.",
                "fixed_code": "const token = process.env.SESSION_TOKEN;"
            })

        if re.search(r"\b(password|pwd)\.length\s*(?:<|<=|==|!=|>|>=)\s*[0-7]\b", code_part, re.IGNORECASE):
            issues.append({
                "title": "Weak Password Validation",
                "severity": "Medium",
                "category": "Security",
                "line_number": index,
                "description": "Password validation checks are too short (less than 7 characters) and fail standard security complexity standards.",
                "suggested_fix": "Require stronger complexity rules (at least 8 characters, capital letters, and special symbols).",
                "fixed_code": "// Require secure password validation logic check"
            })

        if re.search(r"\b(process\.env\.[A-Z_]+|env\.[A-Z_]+)\s*=\s*['\"][^'\"]+['\"]", code_part):
            issues.append({
                "title": "Exposed Environment Secret",
                "severity": "Critical",
                "category": "Security",
                "line_number": index,
                "description": "Assigning raw secret strings directly to process.env config overrides exposes server configurations in source controls.",
                "suggested_fix": "Load config values dynamically from .env bindings without hardcoding defaults inside scripts.",
                "fixed_code": "// Load config values from environment files safely"
            })

    return issues
