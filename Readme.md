# Programming Workshop Assignments

This repository contains a series of programming workshops designed to test and improve your skills across various programming languages and concepts.

## Workshop Overview

| Workshop | Topic | Description |
|----------|-------|-------------|
| Workshop 1 | Problem Solving | Practical programming exercises in LeetCode |
| Workshop 2 | Requirement Analysis | Learning to analyze and document requirements |
| Workshop 3 | Frontend Development | Creating Frontend UI using preferred technologies |
| Workshop 4 | Backend Development | API development with database modeling and documentation |
| Workshop 5 | Testing | Backend testing based on features and test cases |
| Workshop 6 | Code Review | Identifying and fixing issues in existing code |

## Workshop 1: Problem Solving

**Objective**: Try to solve LeetCode problems 1 of these problems set

- https://leetcode.com/problems/median-of-two-sorted-arrays/description/
- https://leetcode.com/problems/regular-expression-matching/description/
- https://leetcode.com/problems/longest-valid-parentheses/description/

## Workshop 2: Requirement Analysis
Exercise focused on analyzing requirements and documenting specifications. From `brd.md` file.

**Deliverables**:
- User stories
- Acceptance criteria

## Workshop 3: Frontend Development
**Objective**: Create an attractive landing page using your preferred tools and technologies, making sure it follows the User Story and Acceptance Criteria consolidated from Workshop 2

- This workshop will involve working on the problem using v0.

## Workshop 4: Backend Development
**Objective**: Develop APIs to support the provided UI design.

**Deliverables**:
- Working API implementation + DB (SQLite)
- For the output, please expose it via a reverse proxy using Pinggy, VS Code Tunnel, Ngrok, or any other tool you're comfortable with. There should be two accessible endpoints:
    - `/swagger` to display the Swagger UI (API Document)
    - `/swagger.json` to provide the swagger.json file for import
- Reverse proxy lists:
    - https://pinggy.io/
    - https://ngrok.com/
    - https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/get-started/create-remote-tunnel/
- Sequence diagram (mermaid format).

**Other Task**:
- Create an architecture based on the given requirements and design it in http://www.plantuml.com/

## Workshop 5: Testing
**Objective**: Implement backend tests according to specified features and test cases.

You will receive a testcase.csv file along with the backend code server.js. Your task is to implement the function so that it correctly follows the logic specified in the test cases, along with writing unit tests that fully cover those test cases.

- Unit Tests / Integration Tests
- E2E Test using Playwright

## Workshop 6: Code Review
**Objective**: Identify and fix problems in the provided code samples.

- Test the code samples