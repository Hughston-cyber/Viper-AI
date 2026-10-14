# VIPER AI — Team Venom HPR

Team Venom's private digital information hub for race records, rider statistics, race days, lap records, team submissions and captain-managed member accounts.

The AI chat assistant has been retired. VIPER's focus is reliable, team-managed information and data tools.

## Run locally
Open `index.html` in a browser. The live website uses Supabase for authentication and team data, so local use requires the project's configured connection.

## Install VIPER AI
Open the live website in Chrome and use Chrome's **Install VIPER AI** option in the address bar or browser menu when it appears. The installable app shell and offline race recorder are provided through the web app manifest and service worker.

## Offline Race Mode
- Open **Offline Race Mode** from the Leadership section while online and signed in as an approved captain or leadership user. This prepares the current browser for offline use for up to seven days.
- Use the recorder to save race details, rider names, stints, lap numbers, lap times, incidents and notes. Entries are stored in this browser's local IndexedDB database.
- Export a `.json` race file after the session and keep a backup.
- When back online, an approved captain can use **Sync saved races to VIPER AI** to upload lap entries to the live lap log. Local sessions remain on the device; export a `.json` backup as well. A live database sync should be tested with a small sample before relying on it for an event.
- Offline leadership authorization is a local browser marker and cannot be remotely checked or revoked while disconnected. Use a trusted, device-locked device and do not treat offline access as a replacement for server-side permissions.

## Spectator accounts
- Captains can create separate spectator invitation codes in **Captain Controls**.
- During registration, choose **Spectator** and enter a spectator code. The database assigns the spectator role; a normal member code cannot create a spectator account.
- Spectators are sent to a read-only dashboard for official race results and rider statistics. Database row-level security denies access to private team tools, attendance, rosters, training, announcements and detailed lap logs.
- Spectator accounts cannot upload, edit or manage records.

## Core features
- Member registration and captain approval
- Race results and rider statistics
- Race-day information
- Team data submissions and captain review
- Supabase-backed authentication and data
- Installable PWA shell and local offline race capture

*Built for Team Venom. Focused on performance.*
