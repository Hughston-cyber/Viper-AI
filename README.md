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
- The first version supports local recording, export and loading a saved export for review. It **does not yet import records into the live Supabase tables**; review and import into the main system is a separate next step.
- Offline leadership authorization is a local browser marker and cannot be remotely checked or revoked while disconnected. Use a trusted, device-locked device and do not treat offline access as a replacement for server-side permissions.

## Core features
- Member registration and captain approval
- Race results and rider statistics
- Race-day information
- Team data submissions and captain review
- Supabase-backed authentication and data
- Installable PWA shell and local offline race capture

*Built for Team Venom. Focused on performance.*
