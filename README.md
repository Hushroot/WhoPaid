# WhoPaid?

See who paid and who owes.

WhoPaid is a small website for splitting shared expenses with friends. Create a group, add what each person paid, and see everyone's balance and suggested payments.

[Try WhoPaid](https://hushroot.github.io/WhoPaid/) · [Source code](https://github.com/Hushroot/WhoPaid)

## Screenshot

![WhoPaid showing an example group, a lunch expense, balances, and a suggested payment](screenshots/whopaid-example.jpg)

This is a real screenshot of the public demo with example data: Ali paid 30.00 for lunch shared with Salma, so Salma owes Ali 15.00. The group controls visible near the top are still being connected in the published version.

## Features

- Create a group with at least two people.
- Add, edit, and delete expenses, with a description, amount, category, and payer.
- Search expenses by description or payer.
- Filter by category and sort by amount.
- See total spending and totals for each category.
- Split each expense equally between the group members.
- See who owes money, who should receive money, and suggested payments.
- Save data in the browser with localStorage.
- Download the current group as a JSON backup and restore it later.

## Run locally

There are no packages to install or build steps.

1. Download this repository using **Code → Download ZIP** and extract it, or clone it.
2. Open a terminal in the folder containing `index.html`.
3. If Python 3 is installed, start a local server:

   ```sh
   python3 -m http.server 8000 --bind 127.0.0.1
   ```

4. Open [http://127.0.0.1:8000](http://127.0.0.1:8000) in a modern browser.

Keep using the same address and port if you want to keep accessing the same browser save. The local copy and the public demo have separate saves.

## How to use it

1. Enter a group name, such as `Weekend trip`.
2. Enter names separated by commas, such as `Ali, Salma`. Each name must be different.
3. Click **Create group**.
4. Add an expense description, amount, category, and the person who paid.
5. Click **Add expense**. The list, spending totals, balances, and suggested payments update.
6. Use **Edit** to change an expense, **Cancel edit** to leave it unchanged, or **Delete** to remove it.
7. Open **Backup and restore** to download a copy of the current group.

For example, if Ali pays 30.00 and Salma pays nothing, their equal shares are 15.00 each. WhoPaid suggests that Salma pays Ali 15.00. These are suggestions; the app does not send money or record repayments.

## Saving and backups

Data stays in this browser on this device. There are no accounts, server database, or automatic sync between devices. Clearing site data can remove your save, so download a backup before clearing storage or changing devices.

The backup is a `.json` file for the current group. Restoring a valid backup asks for confirmation and replaces the current group's data. It does not merge expenses. Files larger than 10 MB are rejected.

## Current limits and work in progress

- Multiple groups are being added. The current published code has the save/load foundation and group controls, but group switching, renaming, and deletion are not connected yet.
- In the published version, **Create group** still replaces the current group and its expenses after confirmation when expenses exist. Download a backup first if you want to keep them.
- The displayed expense count can be stale because it currently updates when the group is displayed rather than whenever the list changes.
- Every expense is split equally between all members. Custom participants, unequal splits, and repayment history are not implemented.
- Amounts have no currency conversion. Use the same currency for every expense in a group.

## Built with

HTML, CSS, and JavaScript, with no external libraries. Amounts are stored as whole cents. When an equal split leaves a few extra cents, they go to the first members in the group's order so the shares still add up to the bill.

## Development

This project was built step by step for Hack Club Terra, with AI-provided code snippets, explanations, and review help. The current work focuses on keeping each group's expenses separate and preserving older browser saves.
