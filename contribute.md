# Contributing to PromptLint

Thank you for considering contributing to **PromptLint** 🎉  
This document will guide you through the different ways you can help improve the project.

- [Ways to contribute](#ways-to-contribute)  
- [Contribution Content](#contribution-content)  
- [Contribute using GitHub](#contribute-using-github)  
- [Contribute using Git](#contribute-using-git)  

## Ways to contribute

Here are some ways you can contribute to **PromptLint**:

- Open an **Issue** to report bugs, request features, or suggest improvements.  
- Share **Feedback** on user experience, usability, or design.  
- Improve **Documentation** (README, principles, contributing guide, etc.).  
- For small changes to docs or text, [Contribute using GitHub](#contribute-using-github).  
- For larger changes (code, lint rules, browser extension logic), [Contribute using Git](#contribute-using-git).  


## Contribution Content

Contributors can help in many areas of **PromptLint**, including but not limited to:

- **Code**  
  - Core logic for Chrome extension (TypeScript/Node.js), or others(future).  
  - UI components for inline highlighting and suggestions.  

- **Lint Rules**  
  - New prompt linting rules (e.g., missing structure, vague wording, unclear task).  
  - Improvements to existing rule logic.  

- **Prompt Optimization Strategies**  
  - New approaches for structuring and rephrasing prompts.  
  - Enhancements to clarity, conciseness, and actionability.  

- **Testing**  
  - Unit tests and integration tests for extension behavior.  

- **Documentation**  
  - README, principles, contributing guide, and usage examples.  

- **Issues & Feedback**  
  - Report bugs, usability issues, or suggest new features.  

## Contribute using GitHub

Use GitHub to contribute without having to clone the repository locally.  
This is the easiest way to create a pull request for **minor changes** (like documentation or small fixes).

### To Contribute using GitHub

1. Find the file you want to edit on [GitHub](https://github.com/ErdunE/promptlint).  
2. Make sure you are signed in to your GitHub account ([Join GitHub](https://github.com/join) if you don’t have one).  
3. Click the **pencil icon** (✏️) on the file to edit it in your fork.  
4. Make your changes in the **Edit file** window.  
5. Scroll to the bottom, add a short description of your change.  
6. Click **Propose file change** → **Create pull request**.  

You have now successfully submitted a pull request 🎉


## Contribute using Git

For larger changes (such as new lint rules, new features, or code refactoring), please contribute using Git.

1. **Fork the repository** to your GitHub account:  
   [https://github.com/ErdunE/promptlint.git](https://github.com/ErdunE/promptlint.git)  

2. **Clone your fork locally**:  
```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/promptlint.git
cd promptlint
```

3. Create a new branch for your feature or fix (replace YOUR_GITHUB_USERNAME and feature-name accordingly):
```bash
git checkout -b YOUR_GITHUB_USERNAME/feature-name
``` 

4. Make your changes (add new files, update existing code, improve docs, etc.).
Stage them with:
```bash
git add .
```   

5.	Commit your changes with a clear and descriptive message:
```bash
git commit -m "Add: new lint rule for vague task descriptions"
```

6.	Push your branch to your forked repository:
```bash
git push origin YOUR_GITHUB_USERNAME/feature-name
```

7.	Open a pull request:
 - Navigate to your fork on GitHub.
 - Click Compare & pull request.
 - Describe your changes clearly, link related issues if any, and submit.

✅ That’s it! Thank you for contributing to PromptLint 💙
Your feedback, code, and ideas will help make prompts clearer and more professional for everyone.
