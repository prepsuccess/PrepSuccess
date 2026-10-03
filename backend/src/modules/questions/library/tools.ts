import { q, type CatalogueQuestion } from "./helpers.js";

/** Interview questions for this topic group (see helpers.ts for the format). */
export const TOOLS_QUESTIONS: CatalogueQuestion[] = [
  // ---------------------------------------------------------------- git
  q(
    "git",
    "What is the difference between Git and GitHub?",
    "Basics",
    "EASY",
    `Many people use "Git" and "GitHub" interchangeably. Explain the difference between them.`,
    `- Git is a distributed version control system: a command-line tool that tracks changes to files and keeps the full history locally on every clone.
- GitHub is a hosting service for Git repositories, with extras on top: pull requests, code review, issues, Actions (CI/CD), access control.
- You can use Git without GitHub (locally, or with GitLab, Bitbucket, a self-hosted server).
- Analogy: Git is the engine, GitHub is one of several garages that store and share the work.`,
    { company: "TCS" },
  ),
  q(
    "git",
    "What are the working directory, staging area and repository?",
    "Basics",
    "EASY",
    `Git talks about three "areas" a change moves through. Name them and explain how a change moves between them.`,
    `- Working directory: the files on disk you edit.
- Staging area (index): a snapshot of what will go into the next commit. \`git add\` copies changes here.
- Repository (.git): the committed history. \`git commit\` records the staged snapshot as a new commit.
- \`git status\` shows what is modified, staged or untracked; \`git diff\` shows unstaged changes, \`git diff --staged\` shows staged ones.
- The staging area lets you commit only part of your changes (even part of a file with \`git add -p\`).`,
  ),
  q(
    "git",
    "What is the difference between git fetch and git pull?",
    "Remotes",
    "EASY",
    `Explain what \`git fetch\` and \`git pull\` do and when you would prefer one over the other.`,
    `- \`git fetch\` downloads new commits and branches from the remote and updates remote-tracking refs (e.g. origin/main). It does not touch your local branch or working files.
- \`git pull\` = \`git fetch\` + integrate: by default a merge of the upstream branch into your current branch (or a rebase with \`--rebase\`).
- Prefer fetch when you want to inspect incoming changes first (\`git log main..origin/main\`) before merging.
- Pull is convenient when you know you just want to update your branch.`,
  ),
  q(
    "git",
    "What is a branch in Git and why is it cheap to create?",
    "Branching",
    "EASY",
    `What is a branch in Git? Why do teams create a new branch for every feature or bug fix?`,
    `- A branch is just a movable pointer (a small file holding a commit hash). Creating one does not copy any files, so it is instant and cheap.
- HEAD points to the branch you are on; each new commit moves that branch pointer forward.
- Feature branches isolate work in progress, so main stays stable and deployable.
- They enable code review via pull requests and let several people work in parallel.
- Commands: \`git branch feature-x\`, \`git switch feature-x\` (or \`git checkout -b feature-x\` to create and switch).`,
  ),
  q(
    "git",
    "What is a .gitignore file used for?",
    "Basics",
    "EASY",
    `What is the purpose of a \`.gitignore\` file? Give some typical entries for a Node.js project.`,
    `- It lists file patterns Git should not track, so they never show up as untracked or get committed by accident.
- Typical entries:
\`\`\`
node_modules/
dist/
.env
*.log
.DS_Store
\`\`\`
- It only affects untracked files. If a file is already committed, you must untrack it with \`git rm --cached <file>\` before the ignore rule applies.
- Never commit secrets such as .env files; if you did, rotate the secret, because it stays in history.`,
  ),
  q(
    "git",
    "How do you undo the last commit that has not been pushed?",
    "Undoing Changes",
    "EASY",
    `You just committed something by mistake and have not pushed yet. How do you undo the commit, and how do you choose whether to keep the changes?`,
    `- \`git reset --soft HEAD~1\`: removes the commit, keeps changes staged.
- \`git reset HEAD~1\` (default --mixed): removes the commit, keeps changes in the working directory, unstaged.
- \`git reset --hard HEAD~1\`: removes the commit and throws away the changes (dangerous).
- If you only want to fix the message or add a forgotten file: \`git commit --amend\`.
- Since nothing is pushed, rewriting local history is safe.`,
  ),
  q(
    "git",
    "What does git clone do?",
    "Remotes",
    "EASY",
    `What happens when you run \`git clone <url>\`? How is it different from downloading a ZIP of the repository?`,
    `- It copies the entire repository, including the full history of all commits and branches, into a new folder.
- It sets up a remote called \`origin\` pointing to the URL and checks out the default branch, tracking origin/main.
- A ZIP contains only one snapshot of the files with no .git folder: no history, no branches, and you cannot push or pull.
- Options: \`--depth 1\` for a shallow clone (only latest commit), \`-b <branch>\` to check out a specific branch.`,
  ),
  q(
    "git",
    "What is the difference between git merge and git rebase?",
    "Branching",
    "MEDIUM",
    `Your feature branch is behind main. You can either merge main into it or rebase it onto main. Explain both approaches and their trade-offs.`,
    `- Merge creates a new merge commit that joins the two histories. History is preserved exactly, but it can become cluttered with merge commits.
- Rebase replays your feature commits on top of the latest main, creating new commits with new hashes. The result is a clean, linear history.
- Rebase rewrites history, so the golden rule is: do not rebase commits that others have already pulled (shared/public branches).
- Conflicts: merge resolves them once; rebase may ask you to resolve them commit by commit.
- Common team practice: rebase your private feature branch to stay current, merge (or squash-merge) into main via a pull request.`,
    { role: "SDE" },
  ),
  q(
    "git",
    "How do you resolve a merge conflict?",
    "Branching",
    "MEDIUM",
    `While merging a branch, Git reports a conflict in \`app.js\`. Walk through how you resolve it.`,
    `- A conflict happens when both branches changed the same lines (or one deleted a file the other edited).
- \`git status\` lists the conflicted files. Inside them Git inserts markers:
\`\`\`
<<<<<<< HEAD
const port = 3000;
=======
const port = 8080;
>>>>>>> feature
\`\`\`
- Edit the file to the correct final content and delete the markers (talk to the other author if unsure).
- Run tests, then \`git add app.js\` and \`git commit\` (or \`git rebase --continue\` during a rebase).
- To give up: \`git merge --abort\`.`,
  ),
  q(
    "git",
    "What is the difference between git reset and git revert?",
    "Undoing Changes",
    "MEDIUM",
    `A bad commit has reached main and others have already pulled it. Should you use \`git reset\` or \`git revert\`? Explain the difference.`,
    `- \`git reset\` moves the branch pointer backwards, removing commits from the branch history. It rewrites history.
- \`git revert <hash>\` creates a new commit that applies the inverse of the bad commit. History is preserved.
- On a shared branch use revert: resetting and force-pushing would break everyone who already pulled.
- Use reset for local, unpushed work.
- Reverting a merge commit needs \`-m 1\` to say which parent is the mainline.`,
    { role: "SDE" },
  ),
  q(
    "git",
    "What is git stash and when would you use it?",
    "Workflow",
    "MEDIUM",
    `You are halfway through a change when an urgent bug needs fixing on another branch. You do not want to commit half-done work. What do you do?`,
    `- \`git stash\` (or \`git stash push -m "wip login"\`) saves your uncommitted changes on a stack and cleans the working directory.
- Switch branches, fix the bug, commit, switch back.
- \`git stash pop\` reapplies the latest stash and removes it; \`git stash apply\` reapplies but keeps it.
- \`git stash list\` shows stashes; \`git stash drop\` deletes one.
- \`-u\` also stashes untracked files.
- Alternative: \`git worktree add\` to check out the other branch in a separate folder.`,
  ),
  q(
    "git",
    "What is git cherry-pick?",
    "Workflow",
    "MEDIUM",
    `A bug fix was committed on the develop branch, but you need just that one fix on the release branch. How do you bring it over?`,
    `- \`git cherry-pick <commit-hash>\` applies the changes of that single commit on top of your current branch as a new commit (new hash).
- Steps: \`git switch release\`, \`git cherry-pick a1b2c3d\`, resolve conflicts if any, then \`git cherry-pick --continue\`.
- \`-x\` adds a "cherry picked from commit ..." line to the message, useful for traceability.
- Overuse leads to duplicated commits across branches; prefer merging when you need many commits.`,
  ),
  q(
    "git",
    "What is a detached HEAD state?",
    "Internals",
    "HARD",
    `After running \`git checkout a1b2c3d\` Git warns "You are in 'detached HEAD' state". What does this mean and what should you watch out for?`,
    `- Normally HEAD points to a branch, which points to a commit. In detached HEAD, HEAD points directly at a commit, not a branch.
- You can look around and even commit, but new commits belong to no branch.
- If you switch away, those commits become unreachable and are eventually garbage-collected.
- To keep work: \`git switch -c new-branch\` while still detached.
- Also happens when checking out a tag or during a rebase.`,
  ),
  q(
    "git",
    "Explain a typical feature-branch and pull-request workflow.",
    "Workflow",
    "MEDIUM",
    `Describe how you would take a ticket from start to merged code in a team that uses GitHub with pull requests and protected main.`,
    `- \`git switch main && git pull\` to start from the latest code.
- \`git switch -c feature/JIRA-123-login-otp\`.
- Make small, focused commits with clear messages; push with \`git push -u origin feature/...\`.
- Open a pull request; CI runs lint and tests; teammates review.
- Address review comments with new commits; keep the branch current with main (rebase or merge).
- Once approved and green, merge (often squash-merge), delete the branch.
- Protected main prevents direct pushes and requires reviews and passing checks.`,
    { role: "SDE" },
  ),
  q(
    "git",
    "What is the difference between git push --force and --force-with-lease?",
    "Remotes",
    "MEDIUM",
    `After rebasing your feature branch, a normal push is rejected. Why, and what is the safe way to push?`,
    `- Rebasing rewrote the commits, so your local branch is no longer a descendant of the remote one; Git rejects a non-fast-forward push.
- \`--force\` overwrites the remote branch unconditionally, possibly deleting commits a teammate pushed meanwhile.
- \`--force-with-lease\` only overwrites if the remote branch is still where your last fetch saw it; otherwise it refuses.
- So prefer \`git push --force-with-lease\`, and never force-push shared branches like main.`,
  ),
  q(
    "git",
    "What are tags in Git and how are they used for releases?",
    "Workflow",
    "MEDIUM",
    `How do you mark version 1.2.0 of your app in Git? What is the difference between lightweight and annotated tags?`,
    `- A tag is a fixed name for a specific commit, typically a release: \`v1.2.0\`.
- Lightweight tag: just a pointer (\`git tag v1.2.0\`).
- Annotated tag: a full object with tagger, date, message, optionally signed (\`git tag -a v1.2.0 -m "Release 1.2.0"\`). Preferred for releases.
- Tags are not pushed by default: \`git push origin v1.2.0\` or \`git push --tags\`.
- Unlike branches, tags do not move when new commits are added. CI often deploys on tag push.`,
  ),
  q(
    "git",
    "How does Git store data internally?",
    "Internals",
    "HARD",
    `Explain how Git stores a commit internally. What are blobs, trees and commits, and why is Git called content-addressable?`,
    `- Git is a key-value store: each object is stored under the SHA-1 (or SHA-256) hash of its content.
- Blob: the contents of a file (no name).
- Tree: a directory listing mapping names and modes to blobs and sub-trees.
- Commit: points to one root tree, its parent commit(s), author, committer and message.
- Branches and tags are refs: names pointing to commit hashes.
- Content-addressable: identical files share one blob; any change to content changes its hash, so history is tamper-evident.
- Git stores full snapshots, not diffs, but compresses objects into packfiles using delta compression.
- Inspect with \`git cat-file -p <hash>\`.`,
  ),
  q(
    "git",
    "How do you recover a commit lost after git reset --hard?",
    "Undoing Changes",
    "HARD",
    `You ran \`git reset --hard HEAD~3\` and realise you needed those three commits. Can you get them back? How?`,
    `- Yes, usually. The commits still exist as objects; only the branch pointer moved.
- \`git reflog\` lists every position HEAD has been at, e.g. \`HEAD@{1}: commit: add payment API\`.
- Find the hash before the reset and run \`git reset --hard <hash>\` (or \`git branch rescue <hash>\`).
- Reflog is local only and entries expire (90 days by default for reachable, 30 for unreachable), after which gc may delete the objects.
- Uncommitted changes wiped by \`--hard\` are not recoverable this way (unless they were staged; \`git fsck --lost-found\` may find blobs).`,
  ),
  q(
    "git",
    "How do you use git bisect to find a bug?",
    "Debugging",
    "HARD",
    `A test passed in release v2.0 but fails on main, 200 commits later. How can Git help you find the exact commit that introduced the bug?`,
    `- \`git bisect\` does a binary search over history.
\`\`\`
git bisect start
git bisect bad            # current commit is broken
git bisect good v2.0      # this one was fine
# Git checks out a middle commit; test it, then:
git bisect good   # or: git bisect bad
git bisect reset  # when done
\`\`\`
- 200 commits need about log2(200) = 8 steps.
- Automate with \`git bisect run npm test\`: exit code 0 = good, non-zero = bad (125 = skip).`,
  ),
  q(
    "git",
    "What does interactive rebase let you do?",
    "Branching",
    "HARD",
    `Before opening a pull request, your branch has 8 messy commits ("wip", "fix typo", "fix again"). How do you clean them up?`,
    `- \`git rebase -i HEAD~8\` (or \`git rebase -i main\`) opens a list of commits with an action per line.
- Actions: pick (keep), reword (edit message), edit (stop to amend), squash (combine, merge messages), fixup (combine, discard message), drop (delete).
- You can also reorder lines to reorder commits.
- Save and Git replays the commits; resolve conflicts with \`git rebase --continue\`, or bail out with \`--abort\`.
- \`git commit --fixup <hash>\` plus \`git rebase -i --autosquash\` automates this.
- It rewrites history, so then push with \`--force-with-lease\`, and only on your own branch.`,
    { role: "SDE" },
  ),

  // ---------------------------------------------------------------- linux
  q(
    "linux",
    "What do the commands ls, cd, pwd, mkdir and rm do?",
    "Basic Commands",
    "EASY",
    `Explain these basic Linux commands with an example each: \`ls\`, \`cd\`, \`pwd\`, \`mkdir\`, \`rm\`.`,
    `- \`ls -la\`: list files, including hidden ones, in long format (permissions, owner, size, date).
- \`cd /var/log\`: change directory; \`cd ..\` goes up, \`cd ~\` goes home, \`cd -\` goes back.
- \`pwd\`: print the current working directory.
- \`mkdir -p a/b/c\`: create directories, including missing parents.
- \`rm file.txt\` deletes a file; \`rm -r dir\` deletes a directory recursively. There is no recycle bin, so be careful with \`rm -rf\`.`,
    { company: "TCS" },
  ),
  q(
    "linux",
    "How do Linux file permissions work?",
    "Permissions",
    "EASY",
    `\`ls -l\` shows \`-rwxr-x---\` for a file. What does this mean? What does \`chmod 755\` do?`,
    `- First character is the type: \`-\` file, \`d\` directory, \`l\` symlink.
- Then three triplets for owner, group and others: r (read), w (write), x (execute).
- \`rwxr-x---\`: owner can read/write/execute, group can read/execute, others have no access.
- Octal: r=4, w=2, x=1. So 7=rwx, 5=r-x, 0=---.
- \`chmod 755 script.sh\` gives rwxr-xr-x; \`chmod 644\` gives rw-r--r-- (typical for files).
- \`chown user:group file\` changes ownership.`,
  ),
  q(
    "linux",
    "What is the difference between a process and a daemon?",
    "Processes",
    "EASY",
    `What is a process in Linux? What is a daemon, and can you name a few?`,
    `- A process is a running instance of a program, with its own PID, memory, open files and owner.
- A daemon is a background process not attached to a terminal, usually started at boot and providing a service.
- Names often end in "d": sshd (SSH server), crond (scheduled jobs), systemd (init system, PID 1), dockerd, httpd.
- Daemons are usually managed with systemctl: \`systemctl status sshd\`.`,
  ),
  q(
    "linux",
    "How do you view the contents of a file in Linux?",
    "Basic Commands",
    "EASY",
    `Name the commands you would use to view a file's contents, including a very large log file, and when you would choose each.`,
    `- \`cat file\`: print the whole file (fine for small files).
- \`less file\`: page through a file; search with /word, quit with q. Best for large files.
- \`head -n 20 file\` / \`tail -n 20 file\`: first or last lines.
- \`tail -f app.log\`: follow a log as new lines are written.
- \`wc -l file\`: count lines.
- \`more\` is an older pager; \`less\` is preferred.`,
  ),
  q(
    "linux",
    "What is the difference between absolute and relative paths?",
    "File System",
    "EASY",
    `Explain absolute versus relative paths in Linux with examples. What do \`.\`, \`..\` and \`~\` mean?`,
    `- An absolute path starts from the root \`/\`: \`/home/ravi/project/app.py\`. It works from anywhere.
- A relative path starts from the current directory: \`project/app.py\` or \`../notes.txt\`.
- \`.\` = current directory (e.g. \`./run.sh\`), \`..\` = parent directory, \`~\` = the user's home directory.
- Scripts and cron jobs should prefer absolute paths, since their working directory may differ.`,
  ),
  q(
    "linux",
    "What is the purpose of the main directories under /?",
    "File System",
    "EASY",
    `Briefly explain what these directories hold: \`/etc\`, \`/var\`, \`/home\`, \`/tmp\`, \`/bin\`, \`/usr\`.`,
    `- \`/etc\`: system-wide configuration files (e.g. /etc/hosts, /etc/passwd, /etc/nginx).
- \`/var\`: variable data that grows: logs (/var/log), caches, mail, databases.
- \`/home\`: personal directories for users; root's home is \`/root\`.
- \`/tmp\`: temporary files, often cleared on reboot.
- \`/bin\`: essential user commands (ls, cp); \`/sbin\`: system admin commands.
- \`/usr\`: installed programs and libraries (/usr/bin, /usr/lib, /usr/local).`,
  ),
  q(
    "linux",
    "What is the difference between a hard link and a soft link?",
    "File System",
    "MEDIUM",
    `Explain hard links and symbolic (soft) links. What happens to each if the original file is deleted?`,
    `- Every file is an inode (data + metadata); a filename is a directory entry pointing to an inode.
- Hard link (\`ln a b\`): a second name for the same inode. Deleting the original name leaves the data accessible through the other; data is freed only when the link count reaches 0.
- Soft link (\`ln -s a b\`): a separate small file storing a path. If the target is deleted, the link becomes dangling (broken).
- Hard links cannot cross file systems or (normally) point to directories; soft links can.
- \`ls -li\` shows inode numbers and link counts.`,
  ),
  q(
    "linux",
    "How do you find and kill a process that is hanging?",
    "Processes",
    "MEDIUM",
    `A Java application on a server is stuck and using 100% CPU. How do you find it and stop it?`,
    `- Find it: \`top\` or \`htop\` (sort by CPU), or \`ps aux | grep java\`, or \`pgrep -f myapp.jar\`.
- Note the PID from the output.
- Stop gracefully: \`kill <PID>\` sends SIGTERM (15), letting the app clean up.
- If it ignores that: \`kill -9 <PID>\` sends SIGKILL, which cannot be caught (no cleanup).
- \`pkill -f name\` kills by name.
- If it is a service, prefer \`systemctl restart myapp\`. Before killing, a thread dump (\`jstack\`) can help find the cause.`,
    { role: "DevOps Engineer" },
  ),
  q(
    "linux",
    "How do you search for text inside files using grep?",
    "Text Processing",
    "MEDIUM",
    `How would you find every line containing "ERROR" in all log files under \`/var/log/app\`, ignoring case, with line numbers? Mention useful grep options.`,
    `\`\`\`
grep -rin "error" /var/log/app
\`\`\`
- \`-r\` recursive, \`-i\` ignore case, \`-n\` show line numbers.
- \`-v\` invert (lines not matching), \`-c\` count matches, \`-l\` list only file names.
- \`-w\` whole word, \`-E\` extended regex (\`grep -E "ERROR|FATAL"\`).
- \`-A 3\` / \`-B 3\` / \`-C 3\`: show lines after / before / around each match.
- Combine with pipes: \`grep ERROR app.log | wc -l\`.`,
  ),
  q(
    "linux",
    "What is the difference between > and >> and what is a pipe?",
    "Shell",
    "MEDIUM",
    `Explain output redirection (\`>\`, \`>>\`, \`2>\`, \`2>&1\`) and the pipe \`|\` with examples.`,
    `- \`cmd > out.txt\`: write stdout to a file, overwriting it.
- \`cmd >> out.txt\`: append stdout to the file.
- \`cmd 2> err.txt\`: redirect stderr (file descriptor 2).
- \`cmd > all.log 2>&1\`: send both stdout and stderr to the same file.
- \`cmd < in.txt\`: read stdin from a file.
- Pipe \`a | b\`: stdout of a becomes stdin of b, e.g. \`ps aux | grep nginx\`.
- \`/dev/null\` discards output: \`cmd > /dev/null 2>&1\`.`,
  ),
  q(
    "linux",
    "How do you schedule a job with cron?",
    "Automation",
    "MEDIUM",
    `You need a backup script to run every day at 2:30 AM. How do you set this up with cron? Explain the crontab format.`,
    `- Edit your crontab with \`crontab -e\`; list with \`crontab -l\`.
- Format: minute hour day-of-month month day-of-week command.
\`\`\`
30 2 * * * /home/ops/backup.sh >> /var/log/backup.log 2>&1
\`\`\`
- More examples: \`*/5 * * * *\` every 5 minutes; \`0 9 * * 1-5\` 9 AM on weekdays.
- Use absolute paths; cron has a minimal environment (PATH is short).
- Redirect output to a log so failures are visible.`,
    { role: "DevOps Engineer" },
  ),
  q(
    "linux",
    "How do you check disk and memory usage in Linux?",
    "System Monitoring",
    "MEDIUM",
    `A server is slow and alerts say the disk is almost full. Which commands help you check disk space, find what is using it, and check memory?`,
    `- \`df -h\`: free and used space per mounted file system (human-readable).
- \`du -sh /var/*\`: size of each directory; \`du -sh * | sort -h\` to find the biggest.
- \`df -i\`: inode usage (a disk can be "full" from millions of tiny files).
- \`free -h\`: RAM and swap; look at "available", not just "free", since Linux uses spare RAM for cache.
- \`top\` / \`htop\`, \`vmstat 1\`: CPU, memory and load.
- Common culprits: old logs (use logrotate), core dumps, Docker images.`,
    { role: "DevOps Engineer" },
  ),
  q(
    "linux",
    "What is SSH and how does key-based authentication work?",
    "Networking",
    "MEDIUM",
    `How do you log in to a remote Linux server securely? Explain how SSH key-based login works and why it is preferred over passwords.`,
    `- SSH (Secure Shell) gives an encrypted remote shell, by default on port 22: \`ssh user@host\`.
- Generate a key pair: \`ssh-keygen -t ed25519\`. The private key stays on your machine; the public key goes into \`~/.ssh/authorized_keys\` on the server (\`ssh-copy-id user@host\`).
- On login the server challenges the client, which proves it holds the private key without sending it.
- Benefits: no password to brute-force or phish, easy automation; you can disable password login (\`PasswordAuthentication no\`).
- Keep the private key at permission 600 and protect it with a passphrase.`,
  ),
  q(
    "linux",
    "What does sudo do and how is it different from su?",
    "Permissions",
    "EASY",
    `What is the purpose of \`sudo\`? How is it different from \`su\`, and why do admins prefer sudo?`,
    `- \`sudo <command>\` runs a single command as root (or another user), asking for your own password.
- \`su\` switches to another user (root by default) and needs that user's password; \`su -\` also loads their login environment.
- Who may use sudo, and for which commands, is configured in \`/etc/sudoers\` (edit with \`visudo\`), often via the sudo or wheel group.
- Why sudo is preferred: no shared root password, privileges are limited per user, and every command is logged.
- Rule: work as a normal user and use sudo only when needed.`,
  ),
  q(
    "linux",
    "What are environment variables and what is PATH?",
    "Shell",
    "MEDIUM",
    `What are environment variables in Linux? What is the PATH variable, and why might a command work in your terminal but fail with "command not found" in a script or cron job?`,
    `- Environment variables are key-value pairs passed from a process to its children, e.g. HOME, USER, PATH.
- View: \`echo $HOME\`, \`env\` or \`printenv\`. Set for child processes: \`export API_URL=http://localhost:3000\`.
- PATH is a colon-separated list of directories the shell searches for commands: \`/usr/local/bin:/usr/bin:/bin\`. \`which node\` shows which one is found.
- Persist settings in \`~/.bashrc\` or \`~/.profile\`.
- Scripts and cron jobs run with a different, minimal environment (cron's PATH is short and .bashrc is not read), so use absolute paths or set PATH at the top of the script.`,
  ),
  q(
    "linux",
    "Write a one-liner to find the top 5 IP addresses in an access log.",
    "Text Processing",
    "HARD",
    `An nginx \`access.log\` has the client IP as the first field on each line. Write a shell pipeline that prints the 5 IPs with the most requests, with counts.`,
    `\`\`\`
awk '{print $1}' access.log | sort | uniq -c | sort -rn | head -5
\`\`\`
- \`awk '{print $1}'\`: extract the first whitespace-separated field.
- \`sort\`: group identical IPs together (uniq only collapses adjacent duplicates).
- \`uniq -c\`: collapse duplicates and prefix each with its count.
- \`sort -rn\`: sort numerically, highest first.
- \`head -5\`: keep the top five.
- Alternative: \`cut -d' ' -f1\` instead of awk.`,
    { role: "DevOps Engineer" },
  ),
  q(
    "linux",
    "What happens when you boot a Linux machine?",
    "System Internals",
    "HARD",
    `Walk through the Linux boot process from pressing the power button to getting a login prompt.`,
    `- Firmware (BIOS or UEFI) runs a power-on self test and finds a bootable device.
- Bootloader (usually GRUB) loads the kernel and the initramfs into memory.
- The kernel initialises hardware and drivers, mounts the initramfs, which loads drivers needed to mount the real root file system.
- The kernel starts the init process, PID 1, today usually systemd.
- systemd starts services in parallel according to unit dependencies, reaching a target (e.g. multi-user.target or graphical.target).
- A getty or display manager presents the login prompt.`,
  ),
  q(
    "linux",
    "What is a zombie process and how do you get rid of it?",
    "Processes",
    "HARD",
    `\`ps\` shows processes with state \`Z\` (defunct). What is a zombie process, why does it occur, and how do you clean it up? How is it different from an orphan?`,
    `- When a child exits, its entry stays in the process table until the parent reads its exit status with wait()/waitpid(). Until then it is a zombie: no memory or CPU, just a PID slot.
- Zombies pile up when a buggy parent never calls wait.
- You cannot kill a zombie (it is already dead). Fix: signal the parent (SIGCHLD) or kill/restart the parent; the zombie is then adopted by init (PID 1), which reaps it.
- Orphan: a still-running child whose parent died; it is re-parented to init and continues normally.
- Find zombies: \`ps -eo pid,ppid,stat,cmd | grep ' Z'\`.`,
  ),
  q(
    "linux",
    "How do you manage a service with systemd?",
    "Automation",
    "HARD",
    `You need your Node.js API to run as a service that starts at boot and restarts if it crashes. How would you set this up with systemd, and how do you view its logs?`,
    `Create \`/etc/systemd/system/api.service\`:
\`\`\`
[Unit]
Description=My API
After=network.target

[Service]
User=app
WorkingDirectory=/opt/api
ExecStart=/usr/bin/node server.js
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
\`\`\`
- \`sudo systemctl daemon-reload\`, then \`sudo systemctl enable --now api\`.
- \`systemctl status api\`, \`systemctl restart api\`.
- Logs: \`journalctl -u api -f\`.`,
    { role: "DevOps Engineer" },
  ),
  q(
    "linux",
    "How would you troubleshoot a web server that is not reachable?",
    "Networking",
    "HARD",
    `Users say \`http://your-server\` does not load. The machine is up and you can SSH in. Describe step by step how you would troubleshoot.`,
    `- Is the service running? \`systemctl status nginx\`, check \`journalctl -u nginx\`.
- Is it listening on the right port and address? \`ss -tlnp | grep :80\` (0.0.0.0 vs only 127.0.0.1).
- Does it respond locally? \`curl -I http://localhost\`.
- Firewall: \`ufw status\` / \`iptables -L\`, and in the cloud, security groups.
- DNS: \`dig your-server\` / \`nslookup\` resolves to the right IP?
- From outside: \`curl -v\`, \`telnet host 80\` or \`nc -zv host 80\`.
- Logs: \`/var/log/nginx/error.log\`; also check disk full (\`df -h\`) and config (\`nginx -t\`).`,
    { role: "DevOps Engineer" },
  ),

  // ---------------------------------------------------------------- cloud-basics
  q(
    "cloud-basics",
    "What is cloud computing?",
    "Fundamentals",
    "EASY",
    `What is cloud computing? What are its main advantages compared with running your own servers on-premises?`,
    `- Cloud computing is on-demand delivery of computing resources (servers, storage, databases, networking, software) over the internet, with pay-as-you-go pricing.
- Advantages:
- No upfront hardware cost: capital expense becomes operating expense.
- Elasticity: scale up or down in minutes.
- Global reach: deploy in many regions close to users.
- Managed services reduce maintenance (patching, backups).
- High availability built in across data centres.
- Examples: AWS, Microsoft Azure, Google Cloud.`,
    { company: "TCS" },
  ),
  q(
    "cloud-basics",
    "What is the difference between IaaS, PaaS and SaaS?",
    "Service Models",
    "EASY",
    `Explain the three cloud service models IaaS, PaaS and SaaS with an example of each. Who manages what?`,
    `- IaaS (Infrastructure as a Service): you rent virtual machines, storage and networks; you manage the OS, runtime and apps. Example: AWS EC2, Azure VMs.
- PaaS (Platform as a Service): the provider runs the OS and runtime; you deploy code. Example: Heroku, Google App Engine, AWS Elastic Beanstalk.
- SaaS (Software as a Service): complete software used over the browser; you manage only your data and users. Example: Gmail, Salesforce, Microsoft 365.
- Moving from IaaS to SaaS, you control less and manage less.`,
    { company: "Infosys" },
  ),
  q(
    "cloud-basics",
    "What are public, private and hybrid clouds?",
    "Deployment Models",
    "EASY",
    `Explain the public, private and hybrid cloud deployment models. When would a company choose each?`,
    `- Public cloud: resources owned by a provider (AWS, Azure, GCP) and shared among many customers. Cheapest to start, fully elastic.
- Private cloud: infrastructure dedicated to one organisation, on-premises or hosted. More control and compliance, higher cost. Common in banks and government.
- Hybrid cloud: a mix, connected together, e.g. sensitive data on-premises, web front end in public cloud, or bursting to the public cloud at peak load.
- Multi-cloud: using more than one public provider.`,
  ),
  q(
    "cloud-basics",
    "What is the difference between scalability and elasticity?",
    "Fundamentals",
    "EASY",
    `Interviewers often ask about scalability and elasticity together. What is each, and how are they different?`,
    `- Scalability: the system's ability to handle more load by adding resources.
- Vertical scaling (scale up): a bigger machine (more CPU/RAM). Simple, but has a ceiling and often needs downtime.
- Horizontal scaling (scale out): more machines behind a load balancer. Near-unlimited, needs stateless design.
- Elasticity: automatically adding and removing resources as demand changes, e.g. auto scaling from 2 to 10 servers during a sale and back to 2 at night.
- Scalability is the capability; elasticity is doing it automatically, in both directions, to match demand and cost.`,
  ),
  q(
    "cloud-basics",
    "What are regions and availability zones?",
    "Infrastructure",
    "EASY",
    `In AWS (or Azure/GCP), what are regions and availability zones? Why should an application be spread across multiple availability zones?`,
    `- A region is a geographic area, e.g. ap-south-1 (Mumbai), containing several availability zones.
- An availability zone (AZ) is one or more physically separate data centres with independent power, cooling and network, linked to the other AZs by low-latency connections.
- Deploying across multiple AZs means a fire or power failure in one data centre does not take your app down: high availability.
- Choose a region by latency to users, data residency laws, price and service availability.
- Multi-region adds disaster recovery for an entire region outage.`,
  ),
  q(
    "cloud-basics",
    "What is a virtual machine and what is a hypervisor?",
    "Virtualization",
    "EASY",
    `Explain what a virtual machine is and the role of a hypervisor. What is the difference between Type 1 and Type 2 hypervisors?`,
    `- A virtual machine (VM) is a software emulation of a computer with its own OS, running on shared physical hardware.
- A hypervisor creates and runs VMs, dividing CPU, memory and storage between them and isolating them.
- Type 1 (bare metal): runs directly on hardware. Examples: VMware ESXi, Microsoft Hyper-V, KVM, Xen. Used in data centres and the cloud.
- Type 2 (hosted): runs as an app on a normal OS. Examples: VirtualBox, VMware Workstation. Used on laptops.
- Virtualization is what lets cloud providers sell slices of a server as EC2 instances.`,
  ),
  q(
    "cloud-basics",
    "What is object storage like Amazon S3?",
    "Storage",
    "EASY",
    `What is Amazon S3 and what kind of data is it used for? How is object storage different from a file system on a server?`,
    `- S3 (Simple Storage Service) is object storage: you store objects (file data + metadata) in buckets, addressed by a key, over HTTP APIs.
- Designed for 99.999999999% (11 nines) durability by storing copies across multiple AZs.
- Used for images, videos, backups, logs, static websites, data lake files.
- Unlike a file system: flat namespace (folders are just key prefixes), no in-place edits (you replace the whole object), accessed over the network, virtually unlimited size.
- Storage classes (Standard, Infrequent Access, Glacier) trade access speed for lower cost.`,
  ),
  q(
    "cloud-basics",
    "What is the difference between virtual machines and containers?",
    "Virtualization",
    "MEDIUM",
    `Compare virtual machines with containers such as Docker. Why have containers become so popular for deploying applications?`,
    `- A VM virtualises hardware and runs a full guest OS with its own kernel; it is heavy (GBs) and boots in minutes.
- A container virtualises the OS: containers share the host kernel and isolate processes using namespaces and cgroups; they are light (MBs) and start in seconds.
- VMs give stronger isolation (separate kernels); containers are less isolated but much denser.
- Popular because: "works on my machine" problems vanish (the image packs the app and its dependencies), fast startup suits auto scaling, and they fit microservices and CI/CD.
- In practice containers often run inside cloud VMs, orchestrated by Kubernetes.`,
    { role: "DevOps Engineer" },
  ),
  q(
    "cloud-basics",
    "What is a load balancer and why is it needed?",
    "Networking",
    "MEDIUM",
    `What does a load balancer do? Explain a few load-balancing algorithms and how health checks work.`,
    `- A load balancer distributes incoming traffic across multiple servers, so no single server is overloaded and one failing server does not cause an outage.
- Algorithms: round robin, weighted round robin, least connections, IP hash (same client to same server).
- Health checks: the load balancer regularly calls an endpoint like /health and stops sending traffic to instances that fail.
- Layer 4 (TCP, e.g. AWS NLB) vs layer 7 (HTTP, can route by path or host, e.g. AWS ALB).
- It also enables horizontal scaling, zero-downtime deploys and TLS termination.`,
    { role: "Backend Developer" },
  ),
  q(
    "cloud-basics",
    "What is auto scaling?",
    "Infrastructure",
    "MEDIUM",
    `An e-commerce site gets 10x traffic during a festive sale. How does auto scaling help, and how would you configure it?`,
    `- Auto scaling automatically adds instances when load rises and removes them when it falls.
- In AWS: an Auto Scaling Group with min, desired and max capacity (e.g. 2 / 2 / 20), launched from a launch template, spread across AZs, behind a load balancer.
- Scaling policies: target tracking (keep average CPU at 60%), step scaling on CloudWatch alarms, or scheduled scaling (scale up before the sale starts).
- It also replaces unhealthy instances automatically.
- Requirements: stateless app servers (sessions in Redis or a DB), fast boot (baked images or containers).
- Benefit: handles peaks without paying for peak capacity all year.`,
  ),
  q(
    "cloud-basics",
    "What is serverless computing?",
    "Service Models",
    "MEDIUM",
    `What does "serverless" mean, for example AWS Lambda? What are its benefits and limitations?`,
    `- Serverless means you deploy functions or code and the provider runs, scales and patches the servers; there are still servers, you just do not manage them.
- Functions run in response to events: HTTP request (via API Gateway), file uploaded to S3, queue message, schedule.
- Benefits: pay per request and execution time (nothing when idle), automatic scaling, no server maintenance.
- Limitations: cold-start latency, execution time limits (15 minutes on Lambda), stateless, harder local debugging, vendor lock-in, can be costly at sustained high load.
- Good for: image thumbnails, webhooks, cron jobs, spiky APIs.`,
  ),
  q(
    "cloud-basics",
    "What is the shared responsibility model?",
    "Security",
    "MEDIUM",
    `In the cloud, who is responsible for security: the provider or the customer? Explain the shared responsibility model.`,
    `- The provider is responsible for security "of" the cloud: physical data centres, hardware, network, the virtualization layer, and managed service internals.
- The customer is responsible for security "in" the cloud: their data, IAM users and permissions, OS patching on VMs, firewall/security group rules, encryption settings, application code.
- The split shifts with the service model: with IaaS (EC2) you patch the OS; with managed services (RDS, Lambda) the provider does more.
- Most cloud breaches come from customer-side misconfiguration, e.g. a public S3 bucket or leaked access keys.`,
  ),
  q(
    "cloud-basics",
    "What is IAM and the principle of least privilege?",
    "Security",
    "MEDIUM",
    `What is IAM in AWS? Explain users, groups, roles and policies, and the principle of least privilege.`,
    `- IAM (Identity and Access Management) controls who can do what on which resources.
- User: an identity for a person or app with long-term credentials.
- Group: a collection of users sharing permissions.
- Role: an identity assumed temporarily (by an EC2 instance, Lambda or another account), giving short-lived credentials. Preferred over embedding access keys in code.
- Policy: a JSON document of Allow/Deny statements on actions and resources.
- Least privilege: grant only the permissions needed for the task, e.g. read access to one bucket, not s3:* on everything. Also enable MFA and never use the root account daily.`,
    { role: "DevOps Engineer" },
  ),
  q(
    "cloud-basics",
    "What is a VPC and what are public and private subnets?",
    "Networking",
    "MEDIUM",
    `Explain what a VPC is. How would you place a web server and a database in public and private subnets, and why?`,
    `- A VPC (Virtual Private Cloud) is your own isolated virtual network in the cloud with an IP range (e.g. 10.0.0.0/16) you control.
- It is divided into subnets, each within one AZ.
- Public subnet: its route table sends 0.0.0.0/0 to an Internet Gateway, so resources with public IPs are reachable from the internet. Put load balancers or web servers here.
- Private subnet: no direct route from the internet. Put databases and app servers here; outbound internet (for updates) goes through a NAT Gateway.
- Security groups (stateful, per instance) and NACLs (stateless, per subnet) filter traffic, e.g. DB allows port 5432 only from the app's security group.`,
    { role: "DevOps Engineer" },
  ),
  q(
    "cloud-basics",
    "What is the difference between block, file and object storage?",
    "Storage",
    "MEDIUM",
    `Cloud providers offer block, file and object storage (for example EBS, EFS and S3 on AWS). Compare them and say when you would use each.`,
    `- Block storage (AWS EBS, Azure Disk): a raw virtual disk attached to one VM, formatted with a file system. Low latency, good for OS disks and databases.
- File storage (AWS EFS, Azure Files): a shared network file system (NFS/SMB) mounted by many servers at once. Good for shared content and lift-and-shift apps.
- Object storage (AWS S3, Azure Blob): objects in buckets accessed over HTTP APIs. Practically unlimited, cheapest per GB, highly durable; good for media, backups, logs, static sites.
- Rule of thumb: database on block, shared folders on file, everything else large and unstructured on object.`,
  ),
  q(
    "cloud-basics",
    "How would you design a highly available web application on AWS?",
    "Architecture",
    "HARD",
    `Design a highly available, scalable architecture on AWS for a typical web application (web front end, API, relational database, user-uploaded images). Explain your choices.`,
    `- DNS with Route 53; CloudFront CDN for static assets and images.
- Application Load Balancer in public subnets across at least 2 AZs.
- API servers in an Auto Scaling Group (or ECS/EKS containers) in private subnets across AZs, stateless.
- Database: RDS with Multi-AZ (synchronous standby, automatic failover), read replicas for read-heavy load, automated backups.
- Sessions and cache in ElastiCache (Redis).
- Images in S3, served via CloudFront.
- Monitoring with CloudWatch alarms; secrets in Secrets Manager; IAM roles for instances.
- No single point of failure: every tier is redundant across AZs.`,
    { role: "DevOps Engineer" },
  ),
  q(
    "cloud-basics",
    "What is Infrastructure as Code?",
    "DevOps",
    "HARD",
    `What is Infrastructure as Code (IaC)? Why do teams use tools like Terraform or CloudFormation instead of clicking in the console? Explain declarative vs imperative.`,
    `- IaC means defining servers, networks, databases and permissions in code files, versioned in Git and applied by a tool.
- Benefits: repeatable environments (dev, staging, prod identical), code review of infra changes, history and rollback, automation in CI/CD, documentation by default, fewer manual mistakes.
- Declarative (Terraform, CloudFormation): you describe the desired end state; the tool computes and applies the difference (\`terraform plan\`, \`terraform apply\`).
- Imperative: you write the steps (scripts with CLI calls).
- Terraform keeps a state file mapping code to real resources; store it remotely (e.g. S3 with locking) for teams.
- Watch for drift: manual console changes that the code does not know about.`,
    { role: "DevOps Engineer" },
  ),
  q(
    "cloud-basics",
    "What do RTO and RPO mean in disaster recovery?",
    "Architecture",
    "HARD",
    `Explain RTO and RPO. Describe common disaster-recovery strategies in the cloud and how they trade cost against recovery time.`,
    `- RPO (Recovery Point Objective): the maximum acceptable data loss, measured in time. RPO 1 hour means backups or replication at least hourly.
- RTO (Recovery Time Objective): the maximum acceptable downtime before service is restored.
- Strategies, from cheapest/slowest to most expensive/fastest:
- Backup and restore: restore from snapshots in another region. RTO hours.
- Pilot light: core pieces (replicated DB) always running in the DR region, the rest started on demand.
- Warm standby: a scaled-down full copy running, scaled up on failover. RTO minutes.
- Multi-site active-active: full capacity in multiple regions. Near-zero RTO and RPO, highest cost.
- Test DR plans regularly.`,
  ),
  q(
    "cloud-basics",
    "How can you reduce cloud costs?",
    "Cost Optimization",
    "HARD",
    `Your team's monthly AWS bill has doubled. What steps would you take to find the cause and reduce costs without hurting reliability?`,
    `- Find the cause: Cost Explorer grouped by service and tags, budgets and alerts; tag every resource by team and environment.
- Right-size: downsize underused instances (low CPU in CloudWatch); use newer instance generations.
- Turn off what is idle: dev/test environments outside office hours, unattached EBS volumes, old snapshots, idle load balancers, unused Elastic IPs.
- Pricing models: Reserved Instances or Savings Plans for steady load (large discounts), Spot Instances for fault-tolerant batch jobs.
- Storage: S3 lifecycle rules to move old data to cheaper classes.
- Data transfer: use a CDN, keep traffic within one AZ or region where possible, check NAT Gateway charges.
- Use auto scaling and serverless for spiky workloads.`,
  ),
  q(
    "cloud-basics",
    "What is a CDN and how does it work?",
    "Networking",
    "HARD",
    `What is a Content Delivery Network such as CloudFront or Cloudflare? Explain how a request is served, how caching is controlled, and what happens when content changes.`,
    `- A CDN is a network of edge servers worldwide that cache content close to users, cutting latency and load on the origin.
- Flow: DNS routes the user to the nearest edge. Cache hit: served directly from the edge. Cache miss: the edge fetches from the origin (e.g. S3 or the load balancer), caches it, then serves it.
- Caching is controlled by TTLs and headers like \`Cache-Control: max-age=86400\`, plus the cache key (path, query strings, headers).
- On change: invalidate the paths, or better, use versioned file names (\`app.3f9a1c.js\`) so new content gets a new URL.
- Extra benefits: TLS at the edge, DDoS protection, compression.
- Dynamic, personalised responses are usually not cached.`,
    { role: "Frontend Developer" },
  ),
];
