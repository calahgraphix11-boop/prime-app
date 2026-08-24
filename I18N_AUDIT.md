# i18n Audit — Full Findings (Step 1, report-only, no fixes applied)

Current system: `AppContext.jsx` loads `en.js`/`fr.js` (85 keys each, currently in sync) into `t`, exposed via `useApp()`. Anything not routed through `t.xxx` does not change on language toggle. Both files below are grouped by source file; each bullet is `"string" — line — category`.

---

## pages/

### AIChatbot.jsx
- "File exceeds 5 MB limit." — 29 — alert-error
- "Could not read file. Please try a different file." — 35 — alert-error
- "Sorry, I encountered an error. Please try again." — 106 — alert-error
- "Voice input is not supported in this browser. Try Chrome or Edge." — 121 — alert-error
- "New Chat" (default session label, distinct from t.newChat) — 83 — jsx-text
- "Model" — 164 — jsx-text
- "Loading…" — 181 — loading-state
- "Chats" (mobile header) — 206 — jsx-text
- "Free Trial Ended" / "Daily Limit Reached" — 216 — jsx-text
- "Your 7-day free trial has ended — upgrade to Pro or Basic to keep studying." — 217 — jsx-text
- "You've reached your daily limit — upgrade to Pro for more." — 217 — jsx-text
- "7-day free trial ended" — 219 — jsx-text
- "${10} / ${10} messages used today" — 219 — jsx-text
- "Upgrade Plan" — 225 — button-label
- "StudyPal AI" (fallback for undefined t.aiChatTitle) — 235 — jsx-text
- "Ask me anything about your studies" fallback — 236 — reuse t.askAnything
- "Thinking…" — 269 — loading-state
- "Upgrade to access file uploads" — 288 — jsx-text
- "Daily file upload limit reached" — 291 — jsx-text
- title="Attach file" — 300 — aria-tooltip
- placeholder fallback "Ask anything…" (t.chatPlaceholder undefined) — 315 — reuse t.typeMessage

### Dashboard.jsx
- "${minutes}m" / "${h}h ${m}m" / "${h}h" — 17, 20 — reuse t.minutes/t.hours
- "Today" / "Yesterday" — 26-27 — date-format
- toLocaleDateString("en-US", {month:"short", day:"numeric"}) — 28 — date-format
- "Good morning"/"Good afternoon"/"Good evening" — 38-40 — jsx-text
- toLocaleDateString("en-US", {weekday:"long",...}) todayLabel — 44-46 — date-format
- weekday/month short labels in areaData — 219-220 — date-format
- "Other" (fallback subject) — 229 — jsx-text
- "7 days"/"30 days"/"All time" — 252 — button-label
- "Total Study Time" — 303 — jsx-text
- "Current Streak" — 313 — jsx-text
- "Sessions Completed" — 323 — jsx-text
- "AI Features Used" — 333 — jsx-text
- "Study Time per Day" — 365 — jsx-text
- "Time by Subject" — 408 — jsx-text
- "No data for this period" — 412 — empty-state
- "total" (donut caption) — 438 — jsx-text
- "Recent Sessions" — 466 — reuse t.recentSessions (exact match, just not wired)
- "No sessions yet" — 471 — empty-state

### ExamPrep.jsx — never calls t at all
- "Excellent"/"Good"/"Keep Practicing" — 18-20 — jsx-text
- "No definition found for that term." — 74 — alert-error
- "Could not fetch a definition right now." — 79 — alert-error
- "Category: ${q.category}" — 96 — jsx-text
- "Could not load trivia questions. Please try again." — 107 — alert-error
- "File too large. Please attach a file under 5MB." — 140 — alert-error
- "Could not read file. Please try a different file." — 147 — alert-error
- "That was a lot of questions — try fewer or a lower difficulty." — 189 — alert-error
- "Failed to generate questions. Please try again." — 191 — alert-error
- "Exam Coach" (h1, x4: 280,520,635,677) — jsx-text
- "Practice smarter, not harder" (x4, same lines) — jsx-text
- "Generate"/"History" (tabs) — 285-286 — button-label
- "Quick Practice" title — 292 — jsx-text
- "General knowledge questions, unrelated to your courses" — 293 — jsx-text
- "Loading…" (x2) — 302, 313 — loading-state
- "Quick Practice" button — 304 — button-label
- "No past sessions yet" — 315 — empty-state
- "Free Trial Ended"/"Monthly Limit Reached"/"Upgrade Required" — 338 — jsx-text
- "Your 24-hour free trial has ended — upgrade to keep practicing." — 339 — jsx-text
- "You've used all 60 Exam Coach sessions for this month — resets ${date}." — 339 — jsx-text + date-format
- "You need an active plan to use this feature." — 339 — jsx-text
- "24-hour trial ended"/"60 / 60 sessions used this month"/"No active plan" — 341 — jsx-text
- "Upgrade Plan" — 344 — button-label
- "Topic" label — 350 — jsx-text
- placeholder "e.g. Photosynthesis, World War II, Calculus…" — 355 — placeholder
- "Define"/"…" — 364 — button-label
- "Read more" — 374 — jsx-text
- "Reference Material" — 384 — jsx-text
- "Attach file" — 391 — jsx-text
- "Upgrade to access file uploads" — 404 — jsx-text
- "Monthly file upload limit reached"/"Upgrade to continue" — 406 — jsx-text
- "Optional — PDF & images preserve diagrams · Word docs are text only (diagrams not included)" — 414 — jsx-text
- "PDF · PNG · JPG · WEBP · DOCX · TXT — max 5MB" — 417 — jsx-text
- "Subject" label / "Select a subject…" / "Other (type below)" — 421-431 — jsx-text
- placeholder "Enter subject…" — 437 — placeholder
- "Question Type" label — 444 — jsx-text
- "Multiple Choice"/"Structured" — 15 — button-label
- "Difficulty" label — 459 — jsx-text
- "Easy"/"Medium"/"Hard" — 13 — button-label
- "Number of Questions" — 474 — jsx-text
- "Generate Questions" / "Generating…" — 494-496 — button-label/loading-state
- "{n} of {60|5} sessions remaining {this month|today}" — 500 — jsx-text
- "Question" — 541 — jsx-text
- "Reveal Answer" — 565 — button-label
- "Suggested marks: " — 572 — jsx-text
- "Explanation: " — 605 — jsx-text
- "Next Question" / "See Results" — 618, 620 — button-label
- "Session Complete" — 644 — jsx-text
- "{n} structured question{s} reviewed" — 645 — jsx-text
- "Answer Sheet" — 650 — jsx-text
- "Marks: " — 655 — jsx-text
- "Try Again" (x2) / "New Topic" (x2) — 662,721 / 665,727 — button-label
- "{score} of {n} correct" — 687 — jsx-text
- "Best combo {x}x · +{n} bonus XP" — 698 — jsx-text
- "Review Missed Questions" — 705 — jsx-text
- "Correct: " — 709 — jsx-text

### Friends.jsx — never calls t
- "Unknown" (fallback name) — 38 — jsx-text
- "${name} accepted your friend request." — 160 — alert-error
- "Friends" h1 / "Connect with other students" — 175-176 — jsx-text
- "Find Students" — 188 — jsx-text
- placeholder "Search by username…" — 195 — placeholder
- "Searching…" — 203 — loading-state
- "No users found" — 206 — empty-state
- "Friends" badge / "Pending" — 218, 225 — jsx-text
- "Add" — 233 — button-label
- "Friends (${n})" / "Requests (${n})" — 247-248 — jsx-text
- "Loading…" — 267 — loading-state
- "No friends yet — search for students above" — 274 — empty-state
- "No pending requests" — 283 — empty-state
- "Accept" / "Decline" — 296, 303 — button-label

### InternshipReport.jsx — never calls t
- "Please fill in at least your name, registration number, and report title." — 37 — alert-error
- "API request failed" — 98 — alert-error
- "Could not parse AI response. Please try again." — 104 — alert-error
- "Something went wrong. Please try again." — 109 — alert-error
- "Internship Report Generator" / subtitle — 118-119 — jsx-text
- All field labels & placeholders (Name, Reg Number, Department, Academic Year, Supervisor, Host Institution, Location, Dates, Report Title, Content, Acknowledgements, Description, Activities, Problems, Solutions, Conclusion) — 126-181 — jsx-text/placeholder
- "Generating report…" — 198 — loading-state
- "Generate & Download Word Document" — 200 — button-label
- **Generated .docx template** (static, hardcoded regardless of app language — needs a decision, see note below): "REPUBLIC OF CAMEROON", "Peace – Work – Fatherland", "UNIVERSITY OF BAMENDA", "COLLEGE OF TECHNOLOGY (COLTECH)", "AN INTERNSHIP REPORT", "Submitted in partial fulfilment...", "Presented by:", "Registration Number:", "Supervised by:", "Host Institution:", "Internship Period:", "Academic Year:", "DEDICATION", "ACKNOWLEDGEMENTS", "GENERAL INTRODUCTION", "CHAPTER ONE: PRESENTATION OF HOST INSTITUTION" + subsections, "CHAPTER TWO..." + subsections, "GENERAL CONCLUSION", "RECOMMENDATIONS" — lines 240-308

### JoinGroup.jsx — never calls t
- "Invalid or expired invite link" / "This invite link doesn't exist or has been revoked." — 95-96 — empty-state
- "Browse Groups" — 101 — button-label
- "{n} member/members" — 123 — jsx-text
- "Private" — 128 — jsx-text
- "You're already in this group" — 141 — jsx-text
- "Go to Groups" — 148 — button-label
- "Joining…" / "Join Group" — 157 — loading-state/button-label

### Leaderboard.jsx — never calls t
- "${m}m"/"${h}h"/"${h}h ${m}m" — 19,22-24 — reuse t.minutes/t.hours
- "Unknown" (x4) — 89,144,231,284 — jsx-text
- "You" badge (x3) — 96,151,291 — jsx-text
- "Activity Score" — 110 — jsx-text
- "Lvl {n} · {rank}" — 295 — jsx-text
- "The Grind Board" h1 — 423 — jsx-text
- "Ranked by activity score — study, AI features, sessions & streak" / "Ranked by total XP earned — all time" — 426-427 — jsx-text
- "XP Ranking"/"Weekly Activity" — 437-438 — button-label
- "Global"/"Friends" — 464-465 — button-label
- "None of your friends have studied this week yet" — 495 — empty-state
- "No study sessions logged this week yet" — 496 — empty-state
- "No XP earned yet" — 546 — empty-state
- "Your Rank" — 590 — jsx-text

### Login.jsx
- "Something went wrong. Please try again." — 58 — alert-error
- "Google sign-in failed" — 68 — alert-error
- "Invalid credentials" — 78 — alert-error
- "Password updated — you can now sign in with your new password." — 145 — jsx-text
- "Reset password" / "Enter your email and we'll send you a reset link." — 161,164 — jsx-text
- "Check your email for a reset link." — 179 — jsx-text
- placeholder "you@example.com" — 192 — placeholder
- "Sending…" / "Send reset link" — 257 — loading-state/button-label
- "← Back to sign in" — 279 — button-label
- "Welcome back" — 294 — jsx-text
- "Forgot password?" — 402 — button-label
- "..." loading fallback — 444 — loading-state
- "or" divider — 451 — jsx-text
- "Redirecting…" / "Continue with Google" — 488 — loading-state/button-label

### NoteSummarizer.jsx
- "File too large. Please attach a file under 5MB." — 69 — alert-error
- "Could not read file. Please try a different file." — 76 — alert-error
- "Failed to summarize. Please try again." — 119 — alert-error
- "Could not load summary." — 283 — jsx-text
- "Key Points"/"Definitions"/"Exam Questions" — 288,301,314 — jsx-text
- "Load into view" — 329 — button-label
- "Note Summarizer" / "Turn your lecture notes into study gold" — 339-340 — jsx-text
- "Summarize"/"History" tabs — 344-345 — button-label
- "Loading…" — 351 — loading-state
- "No past summaries yet" — 353 — empty-state
- "Summary · ${date}" fallback title — 357 — jsx-text
- "Subject" label / "Select a subject…" / "Other (type below)" — 430-440 — jsx-text
- placeholder "Enter subject…" — 446 — placeholder
- "Instructions" label + placeholder — 454-458 — jsx-text/placeholder
- "Attach a file" / "Choose file" — 467,475 — jsx-text/button-label
- "Upgrade to access file uploads" — 481 — jsx-text
- "Monthly file upload limit reached" / "Upgrade to continue" — 483 — jsx-text
- "PDF & images preserve diagrams..." / "PDF · PNG · JPG · WEBP · DOCX · TXT — max 5MB" — 491,494 — jsx-text
- "Free Trial Ended"/"Monthly Limit Reached"/"Upgrade Required" — 502 — jsx-text
- "Your 24-hour free trial has ended..." — 503 — jsx-text
- "You've used all 30 note summaries for this month — resets {date}" (toLocaleDateString('en-US',...)) — 503 — date-format
- "You need an active plan to use this feature." — 503 — jsx-text
- "24-hour trial ended"/"30 / 30 summaries used this month"/"No active plan" — 505 — jsx-text
- "Upgrade Plan" — 511 — button-label
- "Summarizing…" / "Summarize Notes" — 522,524 — loading-state/button-label
- "{n} of {30|5} summaries remaining {this month|today}" — 528 — jsx-text
- "Key Points"/"Key Definitions"/"Likely Exam Questions" (result headings) — 544,562,580 — jsx-text
- "Download PDF" — 601 — button-label
- **Generated PDF content** (hardcoded, always English): "${subject} — Study Summary", "Key Points", "Key Definitions", "Likely Exam Questions", footer date (toLocaleDateString('en-US',...)), "Generated with Prime — primestudyapp.com · {date}", filename date — 193-277

### PaymentSuccess.jsx
- "No transaction ID found. If you completed a payment, contact support." — 24 — alert-error
- "Payment is still pending..." — 54 — alert-error
- "Payment was not completed. No charges were made. Try again or contact support." — 57 — alert-error
- "Could not verify your payment. Contact support if you were charged." — 61 — alert-error
- "Verifying your payment…" / "This will only take a moment." — 73-74 — loading-state/jsx-text
- "You're on {plan}!" — 86 — jsx-text
- "Your subscription is active for 30 days..." — 88 — jsx-text
- "Start studying" — 91 — button-label
- "Awaiting payment confirmation" / "Payment not completed" — 108 — jsx-text
- "Go home" / "Try again" — 113,116 — button-label

### Profile.jsx
- "Failed to save profile" — 63 — alert-error
- "Profile" / "Manage your personal information" — 72-73 — jsx-text
- title="Upload photo" — 93 — aria-tooltip
- "Click the camera icon to upload a new photo" — 105 — jsx-text
- "Character" / "No character selected yet" / "Change Character" — 121,123,130 — jsx-text/empty-state/button-label
- "Personal Info" — 147 — jsx-text
- "Username" label + placeholder "e.g. studyking99" + "Letters, numbers, and underscores only" — 165-173 — jsx-text/placeholder
- placeholder "Your full name" — 158 — placeholder
- "Saving..."/"Saved!"/"Save Changes" — 203 — button-label
- "Badges" / "{n} of 8 earned" — 217-218 — jsx-text

### PublicProfile.jsx
- "User not found." — 84 — empty-state
- "Back" — 99 — button-label
- "Unknown" — 123 — jsx-text
- "Studying now" — 134 — jsx-text
- "Friends" badge / "Request Sent" / "Respond in Friends" — 145,152,159 — jsx-text
- "Sending…" / "Send Friend Request" — 169 — loading-state/button-label
- "Study Hours" / "Friends" (stat label) — 178,180 — jsx-text
- "Day Streak" — 179 — reuse t.dayStreak

### ResetPassword.jsx
- "Passwords do not match." — 90 — alert-error
- "Password must be at least 6 characters." — 94 — alert-error
- "Failed to update password. The link may have expired." — 102 — alert-error
- "Verifying your link…" — 173 — loading-state
- "Link expired" / "This password reset link is invalid or has expired. Please request a new one." — 190,203 — jsx-text
- "Back to sign in" — 224 — button-label
- "Set new password" / "Choose a strong password for your account." — 241,244 — jsx-text
- "New password" / "Confirm password" labels — 250,292 — jsx-text
- "Updating…" / "Update password" — 372 — loading-state/button-label

### Settings.jsx
- "Deletion failed. Please try again." — 68 — alert-error
- "Manage your courses and study goals" — 77 — jsx-text
- placeholder "e.g. Object Oriented Programming" — 133 — placeholder
- "Set a target for hours studied per week" — 155 — jsx-text
- "✓ Saved" / "Save" — 172 — button-label
- "Privacy" / "Active Status" / "Show friends when you're in a study session" — 182-187 — jsx-text
- "Appearance" / "Dark"/"Light" (reuse t.darkMode/t.lightMode) / "System" — 207-213 — jsx-text
- "Delete Account" section text + "Delete My Account" — 243-253 — jsx-text/button-label
- "Are you sure?" + confirm body — 271-273 — jsx-text
- "Cancel" — 289 — button-label
- "Deleting…" / "Yes, Delete My Account" — 297 — button-label

### Signup.jsx
- "Google sign-in failed" / "Signup failed" — 19,44 — alert-error
- "I agree to the" / "and" (Terms/Privacy) — 134-137 — jsx-text
- "You must agree to the Terms of Service and Privacy Policy to create an account." — 141 — alert-error
- "Email me about product updates and resources." — 167 — jsx-text
- "..." / "or" / "Redirecting…" / "Continue with Google" — 181,186,201 — loading-state/jsx-text/button-label

### StudyGroups.jsx — largest single file (~70 findings)
- "just now"/"${m}m ago"/"${h}h ago" (fmtAgo) — 14-16 — date-format
- "Create Study Group" — 181 — jsx-text
- "Group name is required." — 143 — alert-error
- "Group Name *" + placeholder — 196,200 — jsx-text/placeholder
- "Group Icon" / "Pick a color for your group icon" — 208,211 — jsx-text
- "Description" label + placeholder "What is this group about?" — 241,245 — jsx-text/placeholder
- "Visibility" / "Public"/"Private" toggle — 254,256 — jsx-text
- "Creating…" / "Create Group" — 277 — loading-state/button-label
- "Invite to ${group}" / "Invite Link" — 315,322 — jsx-text
- "Copy Link" (reuse t.copied for "Copied!") — 336 — button-label/reuse
- "Updating…" / "Regenerate" — 344 — loading-state/button-label
- "Private" badge / "Join" — 372,382 — jsx-text/button-label
- "Study Groups" left panel / "Create" — 399,404 — jsx-text/button-label
- placeholder "Search groups…" — 412 — placeholder
- "No groups found" / "Create one to get started" — 424-425 — empty-state
- "My Groups" / "Discover" — 431,447 — jsx-text
- "No messages yet — say hello!" — 582 — empty-state
- "Unknown" (sender fallback) — 588 — jsx-text
- title="Pin message" — 610 — aria-tooltip
- placeholder "Send a message…" — 629 — placeholder
- "You are the only admin" / "Make someone else admin before leaving the group." — 724-725 — jsx-text
- "Unknown" (member fallback) — 735 — jsx-text
- "Admin" badge / "(you)" — 755,759 — jsx-text
- "Joined ${fmtAgo}" — 762 — date-format
- title="Make Admin" / "Admin" button / "Remove" / "Leave" — 773-796 — aria-tooltip/button-label
- "Weekly study time · this week" / "No study data this week" — 848,852 — jsx-text/empty-state
- "Unknown" (leaderboard fallback) — 858 — jsx-text
- "Group Settings" / "Edit Group" — 968,984 — jsx-text
- "Group Name *"/"Group Icon" (settings modal) — 987,997 — jsx-text
- "Upload a photo or pick a color" / "Remove image" — 1015,1022 — jsx-text/button-label
- "Description"/"Visibility"/"Public"/"Private" (settings modal) — 1054-1067 — jsx-text
- "Saving…" / "Save Changes" — 1087 — loading-state/button-label
- "Danger Zone" + delete-group copy — 1093-1105 — jsx-text/button-label
- "Group Info" / "Members"/"Visibility" stat labels — 1113-1131 — jsx-text
- "Created ${date}" (toLocaleDateString()) — 1136 — date-format
- "Leaving…" / "Leave Group" — 1147 — loading-state/button-label
- "Select a group to get started" / "Or create your own study group" — 1210-1211 — empty-state/jsx-text
- "Join this group to participate in the chat" / "Join Group" — 1301,1308 — jsx-text/button-label
- "Study Groups" page heading / "Study together, grow together" — 1438-1439 — jsx-text
- "Back to Groups" — 1471 — button-label

### StudySessions.jsx
- formatDate via toLocaleDateString(undefined,...) / toLocaleTimeString(undefined,...) — 8-10 — date-format
- "paused"/"break"/"studying" — 49 — jsx-text
- "Chat History" / "Loading…" / "No chat history for this session." — 117-121 — jsx-text/loading-state/empty-state
- "No courses — add in Settings" — 214 — jsx-text
- aria-label="Toggle Pomodoro" — 235 — aria-tooltip
- "25 min study · 5 min break" — 228 — jsx-text
- "Round ${n}" — 303 — jsx-text
- "No sessions yet" — 386 — empty-state
- aria-label="Toggle StudyPal" — 432 — aria-tooltip

### Upgrade.jsx
No literal text — delegates entirely to UpgradeModal (see below).

### VerifyEmail.jsx
- "Invalid code — please try again." — 36 — alert-error
- "Welcome to Prime, ${name}!" (fallback name "there") — 74/9 — jsx-text
- "Check your email" / "We sent a verification code to" — 92,94 — jsx-text
- "Verification code" label + placeholder "000000" — 101,111 — jsx-text/placeholder
- "Verifying…" / "Verify" — 127 — loading-state/button-label
- "Didn't get it?" / "Sent!"/"Sending…"/"Resend code" — 132,138 — jsx-text/button-label

---

## components/

### BadgeGrid.jsx
- badge.name / badge.description rendered as title/alt/text (source: hardcoded BADGES array in lib/gamification.js) — 42,48,61,65 — badge-quest-data

### CharacterPortrait.jsx
- rank.name / character.name (alt text, source: RANKS/CHARACTERS in lib/gamification.js) — 12,27,31 — badge-quest-data

### CharacterSelectModal.jsx
- "Could not save your pick. Try again." — 17 — alert-error
- aria-label="Close" — 40 — aria-tooltip
- "Choose your character" / "Pick who represents you on your journey" — 46-47 — jsx-text
- c.name (alt/text) — 69,79 — badge-quest-data
- "Selected" — 82 — jsx-text

### ChatBubble.jsx
- "Sorry, I encountered an error. Please try again." — 46 — alert-error (dup of SessionChatPanel)
- "Voice input is not supported in this browser. Try Chrome or Edge." — 54 — alert-error
- t.askAnything fallback text — 96 — reuse (dead fallback, fine to simplify)
- "Thinking…" — 115 — loading-state (dup)
- "Free trial ended — upgrade to continue" / "Daily limit reached" — 125 — jsx-text (dup)
- placeholder fallback "Ask anything…" via non-existent t.chatPlaceholder — 137 — should reuse t.typeMessage (bug: key doesn't exist, always shows English)

### ErrorBoundary.jsx
- "Something went wrong" — 33 — jsx-text
- "An unexpected error occurred. Please try again." — 35 — alert-error
- "Reload" — 51 — button-label

### GamificationHeader.jsx
- "Lvl" prefix + rank.name — 73 — jsx-text/badge-quest-data
- "{n} / {n} XP" title — 79 — aria-tooltip

### Layout.jsx
- "just now"/"${m}m ago"/"${h}h ago" — 96-99 — date-format
- d.toLocaleDateString() (browser locale, ignores app lang) — 100 — date-format
- "Notifications" / "No notifications yet" — 152,157 — jsx-text/empty-state
- Nav labels: "Home","Study","Groups","Progress","Profile" — 206-210 — jsx-text
- "Session Complete!" — 256 — jsx-text
- "min" in duration display — 258 — reuse t.min (exact dup, not wired)

### LevelUpModal.jsx
- aria-label="Level {n} reached" — 41 — aria-tooltip
- rank.name (alt) — 47 — badge-quest-data
- "Level {n}" / "You've reached {rank} rank!" — 51,53 — jsx-text
- "Continue" — 58 — button-label

### NextBadgeCard.jsx
- "Next Badge" — 66 — jsx-text
- badge.name — 80,91 — badge-quest-data
- {message} — entire string built by lib/badgeProgress.js remainingText(), 100% hardcoded English — 92 — badge-quest-data

### QuestsCard.jsx
- title/description (quest data from Supabase RPC, English-only server data) — 29-30 — badge-quest-data
- "+{n} XP" — 39 — jsx-text
- "Quests" / "Today" — 105,111 — jsx-text
- "This Week" — 117 — reuse t.thisWeek (exact dup, not wired)

### QuoteCard.jsx
No hardcoded strings — fully translated (renders dynamic quote data only).

### SessionChatPanel.jsx
- alt="StudyPal" — 14 — jsx-text (brand name, likely fine to leave)
- character.name — 26 — badge-quest-data
- "Sorry, I encountered an error. Please try again." — 70 — alert-error (dup of ChatBubble)
- "Voice input not supported. Try Chrome or Edge." — 78 — alert-error (near-dup, different wording)
- "Ask anything about your session topic" — 96 — empty-state
- "Thinking…" — 118 — loading-state (dup)
- "Free trial ended..." / "Daily limit reached" — 128 — jsx-text (dup)
- placeholder "Ask anything about your session…" — 140 — placeholder

### Sidebar.jsx
- Nav labels: "Internship Report","Exam Coach","Note Summarizer","Friends","Leaderboard" — 23-28 — jsx-text
- "Trial"/"Basic"/"Pro" plan badges — 66-72 — jsx-text
- "Upgrade" / "Contact Support" — 151,159 — button-label
- "Prime v1.1.0" — 169 — jsx-text (version string, likely fine to leave)

### StudyPalPanel.jsx
- alt="StudyPal" / character.name — 15,26 — jsx-text/badge-quest-data
- "Today"/"Yesterday"/"${n}d ago" / toLocaleDateString(undefined,...) — 46-49 — date-format
- aria-label="Back to active session" — 70 — aria-tooltip
- "Study Chat" fallback (3 occurrences: 75,166,233) — jsx-text
- "No messages in this session." — 82 — empty-state
- "Read-only — start a new session to continue chatting" — 106 — jsx-text
- aria-label="Toggle history" — 160 — aria-tooltip
- "History"/"Active" — 188,206 — jsx-text
- "Loading…" — 211 — loading-state
- "Past chats appear here after sessions end" — 216 — empty-state

### SupportModal.jsx
- "Sorry, something went wrong. Try again or reach us on WhatsApp." — 27 — alert-error
- "Support" / "AI Support Agent" / "WhatsApp Support" — 55,75,86 — jsx-text/button-label
- "Prime Support AI" / "Ask anything about the app" — 103-104 — jsx-text
- placeholder "Ask a question…" — 145 — placeholder
- "Talk to our team directly" / body text — 174,176 — jsx-text
- "Chat with us on WhatsApp" — 186 — button-label

### UpgradeModal.jsx
- "Invalid or expired coupon code." / "This coupon has reached its usage limit." / "This code isn't valid for ${plan}." — 44,46,49 — alert-error
- "No payment link returned. Please try again." — 95 — alert-error
- "Plan activated!" / "Your plan is active for 14 days. Enjoy Prime." / "Get started" — 116-119 — jsx-text/button-label
- Plan cards: label "Basic"/"Pro", priceSuffix "FCFA/mo" (x2), cta "Upgrade to Basic"/"Upgrade to Pro", badge "Most Popular" — 133-161 — jsx-text/button-label
- "Choose your plan" / "Unlock the full Prime experience" — 189-190 — jsx-text
- feature list strings (from lib/fapshi.js PLANS.*.features) — 244 — badge-quest-data
- "24-hour free trial" — 235 — jsx-text
- "Processing…" — 270 — loading-state
- placeholder "Coupon code" / "Apply" — 287,299 — placeholder/button-label
- "{n}% off applied" — 309 — jsx-text
- "Payments processed securely by Fapshi · MTN Mobile Money & Orange Money" — 336 — jsx-text

---

## context/

### AuthContext.jsx
- "Your account has been upgraded to a 24-hour free trial of Basic..." — 68 — toast-message (stored in `notifications` table, rendered raw)
- new Error('Not authenticated') (x2, surfaces via calling component) — 163,174 — alert-error
- "Your 24-hour free trial of Prime Basic has started..." — 222 — jsx-text
- aria-label="Dismiss" (x2) — 227,241 — jsx-text
- "Your free trial has ended. Upgrade to Basic or Pro..." — 236 — jsx-text

### BadgeToastContext.jsx
- "Badge Earned" — 40 — toast-message

### LevelUpModalContext.jsx
N/A — no literal strings.

### QuestToastContext.jsx
- "Quest Complete · +{xp} XP" — 39 — toast-message

### StreakToastContext.jsx
- "Streak Milestone · +{xp} XP" / "{n}-day streak" — 50-51 — toast-message

### ThemeContext.jsx
N/A.

### XpBubbleContext.jsx
- "+{n} XP" — 57 — jsx-text (minor, "XP" suffix)

---

## lib/

### badgeProgress.js
- "Complete an Exam Coach session or summarize a note" — 14
- "${n} more day(s) of studying" (x2, lines 17,21)
- "Summarize your first note" — 26
- "${n} more Exam Coach session(s)" — 29
- "Score 100% on an Exam Coach session" — 33
- "Upload your first file" — 37
- "${n} more study action(s)" — 41
- "${goal} until ${badge.name}" ("until" hardcoded) — 66
All jsx-text; this is the entire "next badge" progress copy engine, 100% English.

### combo.js
N/A — pure numeric logic.

### fapshi.js — plan/pricing content, high impact (rendered in UpgradeModal)
- label: 'Basic' / 'Pro' — 31,46
- Basic features (9 strings): 'Unlimited AI chats', '30 report rewrites per month', '30 note summaries per month', '60 exam sessions per month', '10 file uploads per month', 'Study session timer', 'Basic analytics', 'Leaderboard access', 'Standard support' — 34-42
- Pro features (9 strings): 'Unlimited AI chats', 'Unlimited report rewrites', 'Unlimited note summarizations', 'Unlimited Exam Coach sessions', 'Unlimited file uploads (PDF, images, docs)', 'Advanced analytics with insights', 'Leaderboard — compete globally and with friends', 'Priority support', 'Early access to new features' — 49-57
- "Payment initiation failed" / "Status check failed" (fallbacks) — 76,90 — alert-error

### fileUtils.js
- "Could not read the file from disk." (x1) / "Could not read the file from disk. Please try re-uploading it." — 35,88
- "This looks like an older .doc file, not .docx. Please save it as .docx in Word and try again." — 79-81
- "This .docx file appears to be corrupted or unreadable..." — 95-97
- "Could not read the text file from disk." (x2, lines 105,129)
- "Unsupported file type: .${ext}. Please upload a PDF, image (PNG/JPG/JPEG/WEBP), DOCX, or TXT file." — 110
All alert-error.

### gamification.js — root cause of most badge-quest-data findings above
- RANKS: "Novice","Apprentice","Scholar","Master","Prime" — 24-28
- CHARACTERS: "The Analyst","The Strategist","The Grinder","The Visionary","The Motivator","The Scholar","The Perfectionist","The Dreamer","The Trailblazer","The Mentor" — 36-45
- BADGES (8 name/description pairs): "First Step"/"Complete your first study action", "Streak Starter"/"Reach a 3-day study streak", "On Fire"/"Reach a 7-day study streak", "Note Taker"/"Summarize your first note", "Exam Ready"/"Complete your first Exam Coach session", "Perfect Score"/"Score 100% on an Exam Coach session", "Bookworm"/"Upload your first file", "Century Club"/"Complete 100 total study actions" — 57-101

### gemini.js
- "Support chat request failed" / "StudyPal request failed" / "Note Summarizer request failed" / "Exam Coach request failed" (all fallbacks on API failure) — 25,81,104,140 — alert-error
(System prompts correctly excluded — not UI text.)

### quests.js / streaks.js / xp.js / xpEvents.js
N/A — no user-facing strings (console.warn only, or pass-through dynamic data).

---

## utils/

### dailyQuote.js
- FALLBACK quote: `{ text: 'Discipline is the bridge between goals and results.', author: 'Jim Rohn' }` — 6-8 — quiz-quote-content (needs a French fallback equivalent, not a simple key)

### triviaLookup.js
N/A — questions fetched live from opentdb.com, not authored here.

### wikiLookup.js
No hardcoded literal strings, but: **both fetch URLs are hardcoded to fr.wikipedia.org regardless of app language** (lines 3, 13) — an English-mode user gets French wiki results. Separate bug, flagging for the fix pass.

---

## App.jsx / main.jsx
- App.jsx: "App crashed:" (ErrorBoundary fallback heading) — 40 — jsx-text
- main.jsx: N/A.

---

## Systemic patterns (fix once, not string-by-string)

1. **Relative/absolute date formatting never respects `lang`.** Every "Xm ago"/"Xh ago"/"just now"/"Today"/"Yesterday" helper (StudyGroups.jsx fmtAgo, Layout.jsx, StudyPalPanel.jsx, StudySessions.jsx formatDate) and every `toLocaleDateString('en-US', ...)` / `toLocaleDateString()` call (Dashboard, NoteSummarizer PDF export, StudyGroups "Created ${date}") is hardcoded to English or browser locale. Needs one shared locale-aware date helper keyed off `lang`.
2. **Gamification content (ranks, characters, badges, quest "next badge" copy) lives in `lib/gamification.js` and `lib/badgeProgress.js` as flat English strings** consumed by ~8 components. This is the single biggest concentration of missed strings and needs restructuring into `{ en: '...', fr: '...' }` per item, not just new flat keys.
3. **Pricing/plan content in `lib/fapshi.js` (18 feature bullets + labels) feeds UpgradeModal** — currently 100% English regardless of language.
4. **Cross-component duplicate strings** should become single shared keys instead of 2-3 separate copies: "Sorry, I encountered an error..." (ChatBubble + SessionChatPanel), "Thinking…" (both), "Free trial ended — upgrade to continue"/"Daily limit reached" (both), "Study Chat" fallback (StudyPalPanel x3).
5. **Generated documents (InternshipReport .docx, NoteSummarizer PDF) are hardcoded English templates.** These need an explicit decision — do they follow the in-app language toggle, or do they stay English/French-fixed by design (e.g. the .docx is templated on Cameroonian university format and may be intentionally French-locale-invariant)? Flagging rather than assuming.
6. **`t.chatPlaceholder` is referenced in ChatBubble.jsx and AIChatbot.jsx but does not exist in en.js/fr.js** — always silently falls back to hardcoded English. Should be replaced with the existing `t.typeMessage` key, not a new one.
7. **wikiLookup.js hardcodes fr.wikipedia.org** regardless of `lang` — a real language-consistency bug, not just a missing string.

## Scale
Roughly 480+ individual hardcoded strings/attributes across 19 page files, 16 components, 7 contexts, 6 lib files, and 1 util file. Outside of Login/Signup/ResetPassword (partially wired) and Dashboard (partially wired), almost no screen is fully translated — ExamPrep, Friends, InternshipReport, JoinGroup, Leaderboard never call `useApp().t` at all, and StudyGroups.jsx alone accounts for ~70 of the findings.
