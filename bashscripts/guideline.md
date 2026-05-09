Guide to Using `.sh` and `.ps1` Files
1. `.sh` (Shell Script) Files
Shell scripts are used in Unix/Linux/macOS systems for automating tasks in the terminal.

How to Run a .sh File:
Make the script executable (if needed):

```bash
chmod +x count_testcases.sh
```

Run the script:

If using Bash:

```bash
./count_testcases.sh
```

If using another shell (e.g., zsh, sh):

```bash
sh count_testcases.sh
```

Run with a specific shell (optional):

```bash
bash count_testcases.sh
```

Common Issues & Fixes:
Permission Denied? Use `chmod +x count_testcases.sh` to grant execution rights.

Wrong Interpreter? Ensure the first line (shebang) specifies the correct shell:

```bash
#!/bin/bash
```

2. `.ps1` (PowerShell Script) Files
PowerShell scripts are used in Windows for task automation and system management.

How to Run a `.ps1` File:
Allow script execution (one-time setup, if restricted):
Open PowerShell as Administrator and run:

```bash
Set-ExecutionPolicy RemoteSigned
```

Run the script:

```bash
./count_testcases.ps1
```

or

```bash
powershell -ExecutionPolicy Bypass -File script.ps1
```

Common Issues & Fixes:
Execution Policy Restriction? Use:

```bash
Set-ExecutionPolicy Unrestricted -Scope Process
```

(This applies only to the current session and resets after closing PowerShell.)

Running from a non-trusted source? Use Unblock-File:

```bash
Unblock-File -Path .\count_testcases.ps1
```