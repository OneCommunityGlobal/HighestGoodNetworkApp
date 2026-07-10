# Hotfix: WBS Navigation from User Profile Projects Tab

## Summary

This PR fixes inconsistent WBS (Work Breakdown Structure) navigation from the user profile **Projects** tab. After assigning a new project (e.g. HG Education), clicking the WBS icon could open an empty/broken WBS page instead of that project's Work Breakdown Structure.

---

## Problem (Before)

When assigning a new project from a user profile and clicking the WBS icon in the Projects table, navigation was inconsistent:

- Sometimes the WBS page opened with **no project name**
- The WBS table was **empty**
- Users had to click **Return to Project List**, find the project again, and open WBS from there

This also affected workflow when moving between **Projects** and **Tasks** on the same profile.

### Before — Screen Recording

<!-- Paste your Loom/screen recording link here -->
**Video:** [Before fix — WBS navigation fails after assigning project]()

### Before — Screenshots

| Step | Screenshot |
|------|------------|
| User profile → Projects tab with assigned projects | <!-- ![Before - Projects tab](link-to-image) --> |
| Assign new project (e.g. HG Education) | <!-- ![Before - Assign project modal](link-to-image) --> |
| Click WBS icon → empty/broken WBS page | <!-- ![Before - Empty WBS page](link-to-image) --> |

---

## Root Cause

Newly assigned projects from the API use `_id`, but the WBS link in `UserProjectsTable.jsx` only used `project.projectId`.

For fresh assignments, `projectId` was often `undefined`, so the app navigated to:

```
/project/wbs/undefined
```

That page could not load project details or WBS data.

The main **Projects** list already used `_id` correctly; the user profile Projects table did not.

---

## What We Fixed

### Part 1 — `UserProjectsTable.jsx`

- Added `getProjectId(project)` helper: `project._id || project.projectId`
- Updated WBS icon links to use the resolved ID
- Applied the same ID logic to task filtering, row keys, and delete actions

### Part 2 — `UserProfile.jsx`

- Normalized project objects on **assign** so `projectId` is always set
- Normalized projects on **profile load** from the API so both `_id` and `projectId` are available

---

## After (Expected Behavior)

After assigning a project, clicking the WBS icon should go directly to that project's WBS page with:

- Correct **Project Name** in the header
- WBS list loading for that project (if WBS items exist)
- No need to use **Return to Project List**

### After — Screen Recording

<!-- Paste your demo video link here -->
**Video:** [After fix — WBS navigation works after assigning project]()

### After — Screenshots

| Step | Screenshot |
|------|------------|
| Assign new project from user profile | <!-- ![After - Assign project](link-to-image) --> |
| Click WBS icon on newly assigned project | <!-- ![After - WBS icon click](link-to-image) --> |
| Correct WBS page with project name loaded | <!-- ![After - WBS page loaded](link-to-image) --> |

---

## Files Changed

| File | Change |
|------|--------|
| `src/components/UserProfile/TeamsAndProjects/UserProjectsTable.jsx` | WBS links and project ID handling |
| `src/components/UserProfile/UserProfile.jsx` | Normalize `projectId` on assign and load |

---

## Test Plan

### Test 1 — Newly assigned project → WBS navigation

1. Open a user profile (e.g. Pranjul Garg)
2. Go to **Projects** tab
3. Click **Assign Project**
4. Select or create a project (e.g. **HG Education**)
5. Click **Confirm**
6. Click the **WBS icon** on the new project row

**Expected:** Opens `/project/wbs/<valid-project-id>` with the correct project name and WBS content (or empty WBS table if none exist yet — but project name must show).

---

### Test 2 — Existing assigned project → WBS navigation

1. On the same user profile **Projects** tab
2. Click the WBS icon on a project that was already assigned before this session

**Expected:** Still navigates to the correct WBS page (no regression).

---

### Test 3 — Tasks section still works

1. On the same user profile, scroll to **Tasks**
2. Confirm tasks still show under the correct project name
3. If applicable, use project/WBS navigation from tasks workflow

**Expected:** Tasks display correctly; no broken project association.

---

### Test 4 — Delete project still works

1. On **Projects** tab, click **Delete** on a test project
2. Confirm project is removed from the list

**Expected:** Delete works using the correct project ID.

---

### Test 5 — Regression on main Projects list

1. Go to **Projects** (main project list, not user profile)
2. Click WBS icon on any project

**Expected:** Unchanged; still navigates correctly.

---

## Demo Video Checklist

Use this when recording your before/after videos.

### Before video should show

- [ ] Assign new project from user profile
- [ ] Click WBS icon
- [ ] Broken/empty WBS page (no project name)

### After video should show

- [ ] Same steps
- [ ] WBS page opens with correct project name
- [ ] No need to use "Return to Project List"

---

## Notes

- No backend changes required
- Fix is frontend-only: project ID normalization
- Related to user profile Projects/Tasks workflow

---

## Related

- Reported by: Jae (hotfix request)
- Issue: WBS icon navigation inconsistent after assigning new project from user profile
