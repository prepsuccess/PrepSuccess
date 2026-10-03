import { c, task, type CatalogueTask } from "./helpers.js";

/** More practical tasks for this topic group (see helpers.ts for the format). */
export const TOOLS_TASKS: CatalogueTask[] = [
  // Git
  task(
    "git",
    "Start a repo and make your first commits",
    "EASY",
    `
You have a folder resume-site with index.html, style.css and a node_modules folder. Write the git commands (one-line explanation each) to:

- Turn the folder into a git repository.
- Make sure node_modules and any .env file are never committed.
- Commit index.html and style.css with a clear message.
- Connect it to a GitHub remote https://github.com/you/resume-site.git and push the main branch.
- Show the commit history in one line per commit.
`,
    [
      c("init", "git init (and optional branch rename to main)", 2),
      c("gitignore", "Creates .gitignore listing node_modules/ and .env, and commits it", 3),
      c(
        "commit",
        "git add of the right files followed by git commit -m with a meaningful message",
        2,
      ),
      c("remote-push", "git remote add origin ... and git push -u origin main", 2),
      c("log", "git log --oneline (or equivalent)", 1),
    ],
    `
# 1. Create the repo

# 2. Ignore files

# 3. First commit

# 4. Remote and push

# 5. History
`,
  ),
  task(
    "git",
    "Undo common mistakes safely",
    "EASY",
    `
Write the git command for each situation, with one line saying why it is safe:

- You ran git add on secrets.txt by mistake. Unstage it but keep the file.
- You edited app.js and want to throw away all uncommitted changes to that file.
- Your last commit (not pushed yet) has a typo in the message. Fix the message.
- A commit a1b2c3d that is already pushed to the shared main branch broke the build. Undo it without rewriting history.
`,
    [
      c("unstage", "git restore --staged secrets.txt (or git reset HEAD secrets.txt)", 2),
      c("discard", "git restore app.js (or git checkout -- app.js)", 2),
      c(
        "amend",
        "git commit --amend -m with a new message, noting it is fine because not pushed",
        3,
      ),
      c(
        "revert",
        "git revert a1b2c3d, explaining it adds a new commit instead of rewriting shared history",
        3,
      ),
    ],
    `
# 1. Unstage secrets.txt

# 2. Discard changes to app.js

# 3. Fix last commit message

# 4. Undo pushed commit a1b2c3d
`,
  ),
  task(
    "git",
    "Resolve a merge conflict",
    "MEDIUM",
    `
You run git merge feature/discount on main and get a conflict in price.js:

\`\`\`
function finalPrice(price) {
<<<<<<< HEAD
  const tax = price * 0.18;
  return price + tax;
=======
  const discounted = price * 0.9;
  return discounted;
>>>>>>> feature/discount
}
\`\`\`

The correct behaviour is: apply the 10% discount first, then add 18% GST on the discounted price.

- Explain what each marker section means.
- Write the resolved function.
- Write the commands to finish the merge, and the command you would use to abort it instead.
`,
    [
      c(
        "markers",
        "Correctly explains HEAD (current branch) vs incoming feature/discount sections",
        2,
      ),
      c("resolved", "Resolved code with no markers: discount then 18% tax (price * 0.9 * 1.18)", 4),
      c("finish", "git add price.js then git commit (or git merge --continue)", 2),
      c("abort", "git merge --abort", 2),
    ],
    `
// Resolved price.js
function finalPrice(price) {
  // your code here
}

/* Commands to finish the merge:

   Command to abort instead:
*/
`,
  ),
  task(
    "git",
    "Hunt a bug and recover lost work",
    "HARD",
    `
Your project has 60 commits since the release tag v1.0, which worked. Now the login test fails. Separately, yesterday you ran git reset --hard HEAD~3 on your branch and lost 3 commits you still need.

Write the commands (with a short explanation each) to:

- Use git bisect to find the first bad commit, including how you mark good/bad, how you could automate it with npm test, and how you finish.
- Explain roughly how many steps bisect needs for 60 commits and why.
- Recover the 3 lost commits using the reflog.
- Before opening a PR, squash your 5 messy local commits into one clean commit (interactive rebase), and push the rewritten branch safely.
`,
    [
      c("bisect", "bisect start, bad HEAD, good v1.0, marking each step, and bisect reset", 3),
      c("automate", "git bisect run npm test (or similar script)", 2),
      c("steps", "About 6 steps because it halves the range each time (log2 60)", 1),
      c(
        "reflog",
        "git reflog to find the old HEAD, then reset/branch/cherry-pick to restore it",
        2,
      ),
      c("squash", "git rebase -i HEAD~5 with squash/fixup and git push --force-with-lease", 2),
    ],
    `
# Bisect

# Steps estimate

# Recover with reflog

# Squash and push
`,
  ),

  // Linux
  task(
    "linux",
    "Set file permissions correctly",
    "EASY",
    `
On a Linux server, answer and write commands for:

- What does -rwxr-x--- mean for a file? Give its numeric (octal) form.
- Make deploy.sh executable by the owner only, readable by the group, and not accessible to others.
- Make the folder /srv/app and everything inside it owned by user deploy and group www-data.
- Set the permissions on your SSH private key ~/.ssh/id_ed25519 so ssh will accept it, and say why ssh is strict about it.
`,
    [
      c("read-perms", "Correctly explains owner rwx, group r-x, others none = 750", 3),
      c("chmod", "chmod 740 deploy.sh (or equivalent symbolic form)", 2),
      c("chown", "chown -R deploy:www-data /srv/app", 2),
      c(
        "ssh-key",
        "chmod 600 (or 400) on the key with a valid reason (others must not read it)",
        3,
      ),
    ],
    `
# 1. Meaning of -rwxr-x--- :

# 2. deploy.sh

# 3. /srv/app ownership

# 4. SSH key
`,
  ),
  task(
    "linux",
    "Analyse an access log with pipes",
    "MEDIUM",
    `
access.log contains lines like these (thousands of them):

\`\`\`
10.0.0.5 - - [03/Oct/2026:10:01:12] "GET /api/jobs HTTP/1.1" 200 512
10.0.0.9 - - [03/Oct/2026:10:01:15] "POST /api/login HTTP/1.1" 401 87
10.0.0.5 - - [03/Oct/2026:10:02:40] "GET /missing HTTP/1.1" 404 0
\`\`\`

Using only standard tools (grep, awk, cut, sort, uniq, head, wc), write one command line for each:

- The top 5 IP addresses by number of requests, with counts.
- The number of requests that returned 404.
- How many distinct IP addresses visited.
- Every line for failed logins (POST /api/login with status 401), saved to failed.txt.
`,
    [
      c("top-ips", "awk/cut for field 1 | sort | uniq -c | sort -nr | head -5", 3),
      c(
        "count-404",
        "Counts 404 using the status field (awk on field 8 or a precise grep), not just any 404",
        3,
      ),
      c("distinct", "Field 1 | sort -u | wc -l (or sort | uniq | wc -l)", 2),
      c("failed", "Filters POST /api/login with 401 and redirects to failed.txt", 2),
    ],
    `
# 1. Top 5 IPs

# 2. Number of 404s

# 3. Distinct IPs

# 4. Failed logins -> failed.txt
`,
  ),
  task(
    "linux",
    "Debug a slow server",
    "MEDIUM",
    `
Users say your Node app on a Linux VM is slow and new uploads are failing. Write the commands you would run (with one line on what you look for) to:

- See which processes use the most CPU and memory.
- Find the process ID of the program listening on port 3000.
- Stop a stuck process gracefully, and forcefully if it ignores you.
- Check whether the disk is full, and find which folder under /var is using the most space.
- Check free memory, and view the last 50 lines of the app's log /var/log/app.log while following new lines.
`,
    [
      c("cpu-mem", "top/htop or ps aux --sort=-%cpu / -%mem", 2),
      c("port", "ss -ltnp, lsof -i :3000 or netstat to get the PID", 2),
      c(
        "kill",
        "kill PID (SIGTERM) first, then kill -9 PID only if needed, explaining the difference",
        2,
      ),
      c("disk", "df -h plus du -sh /var/* | sort -h (or similar)", 2),
      c("mem-log", "free -h and tail -n 50 -f /var/log/app.log", 2),
    ],
    `
# 1. CPU / memory hogs

# 2. Who is on port 3000

# 3. Stop the process

# 4. Disk usage

# 5. Memory and logs
`,
  ),
  task(
    "linux",
    "Write a backup script with cron",
    "HARD",
    `
Write a bash script backup.sh that:

- Takes a source directory as its first argument; prints a usage message and exits with code 1 if it is missing or not a directory.
- Creates a compressed archive /backups/<folder-name>-YYYY-MM-DD.tar.gz of that directory.
- Keeps only the 7 newest backups for that folder and deletes older ones.
- Appends a timestamped success or failure line to /var/log/backup.log, and exits non-zero on failure.

Then write the crontab line that runs it every day at 2:30 AM for /srv/app, and the commands to make the script executable and install the cron job.
`,
    [
      c("args", "Validates the argument with a usage message and exit 1", 2),
      c("archive", "Correct tar -czf with a date-stamped name from date +%F", 2),
      c(
        "rotation",
        "Deletes all but the 7 newest backups (ls -t | tail -n +8 | xargs rm, or find)",
        2,
      ),
      c("logging", "Timestamped log lines and correct exit codes (checks tar status or set -e)", 2),
      c("cron", "Correct cron line 30 2 * * * with full paths, plus chmod +x and crontab -e", 2),
    ],
    `
#!/usr/bin/env bash
# Usage: backup.sh <source-dir>

SRC="$1"
DEST="/backups"
LOG="/var/log/backup.log"

# your code here

# Crontab line:
`,
  ),

  // Cloud basics
  task(
    "cloud-basics",
    "Explain regions, zones and scaling",
    "EASY",
    `
Answer in short, clear points as you would in an interview:

- What is the difference between a region and an availability zone? Why would you run your app in two zones?
- Vertical vs horizontal scaling: define both and give one limit of vertical scaling.
- What does a load balancer do, and what is a health check?
- Your college fest site is hosted in Mumbai but many visitors are in the US. Name one service type that makes static pages load faster for them.
`,
    [
      c(
        "region-az",
        "Region = geographic area, AZ = isolated data centre(s) within it; two AZs for fault tolerance",
        3,
      ),
      c(
        "scaling",
        "Correct definitions plus a limit of vertical scaling (hardware ceiling, downtime, single point of failure)",
        3,
      ),
      c("lb", "Load balancer spreads traffic and health checks remove unhealthy instances", 2),
      c("cdn", "Names a CDN (edge caching) and why it helps", 2),
    ],
    `
Regions vs availability zones:

Vertical vs horizontal scaling:

Load balancer and health checks:

Faster pages for US visitors:
`,
  ),
  task(
    "cloud-basics",
    "Estimate and cut a monthly cloud bill",
    "MEDIUM",
    `
A startup runs this setup for a 30-day month (720 hours). Prices are simplified:

- 2 virtual machines running 24x7 at Rs 3 per hour each.
- 200 GB of block storage at Rs 2 per GB per month.
- 100 GB of outbound data transfer; the first 10 GB are free, then Rs 8 per GB.

Tasks:

- Calculate the total monthly bill, showing each line item.
- The provider offers a 1-year reserved-instance deal that is 40% cheaper on VM hours. What is the new total, and how much is saved per month?
- Suggest two other ways to cut cost (with a one-line reason each), for example for a dev server only used 9am-7pm on weekdays.
`,
    [
      c("vm", "VM cost 2 x 3 x 720 = Rs 4320", 2),
      c("total", "Storage Rs 400, transfer 90 x 8 = Rs 720, total Rs 5440", 3),
      c("reserved", "Reserved VMs Rs 2592, new total Rs 3712, saving Rs 1728 per month", 3),
      c(
        "ideas",
        "Two sensible savings ideas (scheduling/stopping idle VMs, right-sizing, autoscaling, CDN, cheaper storage tier)",
        2,
      ),
    ],
    `
VMs:
Storage:
Data transfer:
Total:

With reserved instances:
Saving:

Other ways to cut cost:
1.
2.
`,
  ),
  task(
    "cloud-basics",
    "Design a secure network for a web app",
    "MEDIUM",
    `
You are deploying a placement-portal app on a cloud provider: a web/API server and a PostgreSQL database. Design its virtual network (VPC):

- Which parts go in a public subnet and which in a private subnet, and why?
- Write the inbound security-group (firewall) rules for the web server and for the database (port, source).
- The database must download OS updates but must not be reachable from the internet. What component allows this?
- How should the admin SSH into servers safely?
- Where should the database password live instead of in the code?
`,
    [
      c(
        "subnets",
        "Web/load balancer in public subnet, database in private subnet with a reason",
        3,
      ),
      c(
        "rules",
        "Web: 80/443 from anywhere; DB: 5432 only from the web server's security group",
        3,
      ),
      c("nat", "NAT gateway (or NAT instance) for outbound-only access", 2),
      c(
        "access-secrets",
        "Bastion host/VPN/session manager with SSH limited by IP or key, and a secrets manager or env vars",
        2,
      ),
    ],
    `
Subnets:

Security group rules:
- Web server:
- Database:

Outbound access for the database:

Admin access:

Storing the DB password:
`,
  ),
  task(
    "cloud-basics",
    "Plan a highly available results-day deployment",
    "HARD",
    `
Your college's placement portal normally gets 200 users at a time, but on results day 20,000 students log in within 15 minutes. Last year the single server crashed. Design a cloud architecture that survives this.

Cover:

- The compute layer: how it scales out and back in (what metric triggers scaling, min/max instances).
- Load balancing and running across availability zones.
- The database: how to handle read-heavy traffic and survive a zone failure.
- Static assets (PDFs, images) and caching of hot data like the results list.
- Monitoring and alerts: two metrics you would alarm on.
- What happens, step by step, if one availability zone goes down during results.
- One way to keep cost low on normal days.
`,
    [
      c(
        "autoscaling",
        "Auto-scaling group with sensible metric (CPU/requests) and min/max, possibly scheduled scale-up before results",
        2,
      ),
      c("lb-multi-az", "Load balancer with instances spread over at least two AZs", 2),
      c("database", "Managed DB with multi-AZ standby and read replicas (or caching) for reads", 2),
      c(
        "static-cache",
        "Object storage + CDN for files and an in-memory cache (e.g. Redis) for hot data",
        2,
      ),
      c("ops", "Relevant alarms, a clear AZ-failure walkthrough, and a cost-saving point", 2),
    ],
    `
Architecture overview:

Compute and auto-scaling:

Load balancing and zones:

Database:

Static files and caching:

Monitoring and alerts:

If one zone fails:

Keeping cost low:
`,
  ),
];
