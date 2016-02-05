# Stash modifications

This extension fixes some annoyances I have with Atlassian Stash:

* **Keeps you logged in**: Stash has a very short login timeout.  The plugin sends an XHR every 2 minutes to keep you logged in.
* **Removed committer name from commit list**: The avatar is enough, the name is a waste of space. **TODO: not currently working**
* **Shows tags in commit list**: Implements [STASH-2795](https://jira.atlassian.com/browse/STASH-2795)

## Installation

In Chrome, open the Extensions page (Menu > Tools > Extensions), check "Developer mode", click "Load unpacked extension" and select the stash-mods directory.

## Authorize your domain

Extention Permissions will show what domains will be affected. This can be updated in the manifest.json file. Once updated, be sure to
'refresh' the extention.
