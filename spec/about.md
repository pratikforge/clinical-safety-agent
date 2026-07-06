# AI Agents: Intensive Vibe Coding Capstone Project

> **Source**: [Kaggle Competition Page](https://www.kaggle.com/competitions/vibecoding-agents-capstone-project/overview)

---

## Competition Overview

This is a community hackathon hosted on Kaggle. The goal is to put course learning into action by building an **AI agent** that solves a real-world problem, helps people, or improves everyday living.

"Vibe coding" refers to building functional applications and agents with the assistance of LLMs, emphasizing rapid prototyping and iteration.

---

## Timeline

```yaml
announcement: June 19, 2026
submission_deadline: July 6, 2026, 11:59 PM PT
type: Community Hackathon
team_size: 1–4 members
submissions_per_team: 1
awards_points_or_medals: false
```

> [!CAUTION]
> **Deadline is TODAY (July 6, 2026).** All submissions must be finalized by 11:59 PM Pacific Time.

---

## Submission Tracks

Four tracks are available. You must choose one, though innovative projects outside strict track bounds are welcomed.

```yaml
tracks:
  - name: Agents for Business
    focus: Solving compelling business problems (cost or revenue-focused)

  - name: Agents for Good
    focus: Social impact and humanitarian applications

  - name: Concierge Agents
    focus: Assistant-style personal agents

  - name: Freestyle
    focus: General innovation and best practices in agent deployment
```

---

## Evaluation Criteria

All tracks are judged on the same four pillars:

```yaml
evaluation_pillars:
  - pillar: Innovation
    question: Is the solution creative and forward-thinking?

  - pillar: Solution Design
    question: Is the architecture thoughtful, secure, and well-documented?

  - pillar: Communication
    question: How well does the writeup and video demo explain the project?

  - pillar: Effective Application
    question: Does the project clearly apply the tools and concepts taught in the course?
```

### Scoring Breakdown

```yaml
scoring:
  the_pitch:
    total_points: 30
    breakdown:
      - area: Core Concept & Value
        points: 10
        format: Written (Kaggle writeup)
        description: Central idea, relevance to chosen track, meaningful & central use of agents

      - area: YouTube Video Submission
        points: 10
        format: Video (max 5 minutes)
        required_elements:
          - Problem Statement: what you are solving and why it matters
          - Why Agents: why agents uniquely solve this problem
          - Architecture: visuals/diagrams of the agent system
          - Demo: live interaction, screen recordings, or animations

      - area: Overall Communication
        points: 10
        format: Both written + video
        description: Clarity, conciseness, and quality of messaging across both formats

  technical_implementation:
    criteria:
      - Quality of code and technical design
      - Robustness of architecture
      - Meaningful integration of AI
      - Must demonstrate at least 3 key course concepts

  bonus_points:
    criteria:
      - Effective use of Gemini
      - Advanced tooling
      - Deployment to production
      - High-quality video demonstration
```

---

## Required Course Concepts (Minimum 3)

Your project must demonstrate at least **three** of the following key concepts from the course:

```yaml
course_concepts:
  - Agent / Multi-agent system (ADK - Agent Development Kit)
  - MCP (Model Context Protocol) Server
  - Antigravity (demonstrated in video)
  - Security features
  - Deployability
  - Agent skills (e.g., Agents CLI)
  - Memory / Context management
```

---

## Submission Requirements

### Mandatory Deliverables

```yaml
deliverables:
  kaggle_writeup:
    required: true
    description: Detailed writeup on the competition page
    recommended_length: "<1500 words"
    must_include:
      - Title and Subtitle
      - Card and Thumbnail Image
      - Submission Track (one of the four tracks)
      - Project Description

  public_codebase:
    required: true
    options:
      - GitHub Repository (must be public, no login/paywall)
      - Kaggle Notebook (with inline Markdown documentation)
    must_include:
      - Comments pertinent to design and behavior

  readme:
    required: true
    contents:
      - Problem statement
      - Solution architecture
      - Setup instructions
      - Relevant diagrams/images

  video_demo:
    required: true
    max_duration: 5 minutes
    purpose: Showcase the agent in action
    platform: YouTube (link in submission)

  project_link:
    recommended: true
    description: A deployable or accessible version of the agent
```

---

## Prizes

```yaml
prizes:
  type: Kaggle Swag
  monetary: false
  kaggle_points: false
  kaggle_medals: false
  note: Winners across the four categories receive Kaggle swag
```

---

## Alignment Checklist

Use this checklist to cross-verify whether our current progress is aligned with the hackathon requirements.

### Track Selection
- [ ] Chosen a specific track (Business / Good / Concierge / Freestyle)

### Core Requirements
- [ ] Project solves a real-world problem
- [ ] Demonstrates at least 3 course concepts
  - [ ] Concept 1: _________________
  - [ ] Concept 2: _________________
  - [ ] Concept 3: _________________

### Deliverables
- [ ] Kaggle writeup drafted (<1500 words)
- [ ] Title and Subtitle defined
- [ ] Card/Thumbnail image created
- [ ] Public GitHub repository set up
- [ ] README.md with problem statement, architecture, setup instructions, diagrams
- [ ] Video demo recorded (≤5 minutes)
- [ ] Video uploaded to YouTube
- [ ] Project deployed / accessible link available

### Quality Gates
- [ ] Code is well-commented
- [ ] Architecture is clearly documented
- [ ] Security considerations addressed
- [ ] Innovation factor is evident
- [ ] "The Pitch" clearly explains the WHY behind the agent
