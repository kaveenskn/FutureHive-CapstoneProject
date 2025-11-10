# Git Connection Issue - Solutions

## Error

```
Git fatal: unable to access 'https://github.com/kaveenskn/FutureHive-CapstoneProject.git/':
Could not resolve host: github.com
```

## Solutions (Try in order)

### Solution 1: Check Internet Connection

1. Make sure you're connected to the internet
2. Try opening https://github.com in your browser

### Solution 2: Flush DNS Cache

Open PowerShell as Administrator and run:

```powershell
ipconfig /flushdns
```

### Solution 3: Change DNS to Google DNS

1. Open Network Settings
2. Change DNS to:
   - Primary: 8.8.8.8
   - Secondary: 8.8.4.4

Or in PowerShell (as Administrator):

```powershell
# For Wi-Fi
netsh interface ip set dns "Wi-Fi" static 8.8.8.8
netsh interface ip add dns "Wi-Fi" 8.8.4.4 index=2

# For Ethernet
netsh interface ip set dns "Ethernet" static 8.8.8.8
netsh interface ip add dns "Ethernet" 8.8.4.4 index=2
```

### Solution 4: Disable VPN/Proxy

If you're using a VPN or proxy, try disabling it temporarily.

### Solution 5: Use GitHub via SSH instead of HTTPS

```powershell
# Check current remote
git remote -v

# Change to SSH (if you have SSH key set up)
git remote set-url origin git@github.com:kaveenskn/FutureHive-CapstoneProject.git
```

### Solution 6: Work Offline

You can continue working without pushing to GitHub:

```powershell
# Your local commits are safe
git status

# When internet is back, sync:
git pull origin Heshani
git push origin Heshani
```

### Solution 7: Restart Network Adapter

```powershell
# In PowerShell as Administrator
Get-NetAdapter | Restart-NetAdapter
```

### Solution 8: Check Firewall/Antivirus

Temporarily disable firewall/antivirus to see if it's blocking Git.

## Quick Test

After trying any solution, test with:

```powershell
# Test DNS resolution
nslookup github.com

# Test Git connection
git ls-remote https://github.com/kaveenskn/FutureHive-CapstoneProject.git
```

## Note

This is a network issue, NOT a code issue. Your backend server is running fine!
The Git sync can be done later when your network is stable.
