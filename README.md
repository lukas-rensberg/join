# join
A project management tool

## Project Structure

```
join/
├── assets/
│   └── fonts/
│       └── OpenSans-Italic.ttf
│       └── OpenSans.ttf
│   └── icons/
│       └── arrow-left-line.svg
|       └── checked.svg
│       └── lock.svg
|       └── logo-blue.svg
│       └── logo-white.svg
|       └── mail.svg
|       └── menu-icons.svg
|       └── unchecked.svg
│       └── visibility_off.svg
|       └── visibility.svg
|   └── menu_icons/
|       └── add-task.svg
|       └── awaiting-feedback.svg
|       └── board.svg
|       └── contacts.svg
|       └── done.svg
|       └── frame.svg
|       └── in-progress.svg
|       └── login.svg
|       └── on-board.svg
|       └── summary.svg
|       └── todo.svg
|   └── priority_icons/
|       └── low.svg
|       └── medium.svg
|       └── urgent.svg
├── css/
│   └── font.css
│   └── header-footer.css
│   └── help.css
│   └── legal_notice.css
│   └── login.css
│   └── overview.css
│   └── signup.css
│   └── style.css
├── js/
│   └── login.js
│   └── script.js
├── .gitignore
├── help.html
├── index.html
├── legal_notice.html
├── overview.html
├── signup.html
├── README.md
└── LICENSE
```

### File Overview
- `index.html`: main entry point
- `help.html`: Help and explanation on how to use “Join”
- `legal_notice.html`: Includes legal notice and privacy policy
- `overview.html`: Sends the user or guest to a board with an overview of tasks
- `signup.html`: Page for registering the “Join” application 
- `assets/icons/logo-white.svg`: Logo SVG (white paths)
- `assets/icons/logo-blue.svg`: Logo SVG (blue paths, favicon)
- `menu_icons/`: icons for the app's navbar
- `priority_icons/`: icons for priority markering at the kanban board
- `css/font.css`: Definition of font-families
- `css/header-footer.css`: Contains the styles for the header (including submenu window) and the footer
- `css/help.css`: Contains styles for help.html
- `css/legal_notice.css`: Contains styles for legal_notice.html
- `css/login.css`: Logo container animation (center → left upper corner), body login background transition
- `css/overview.css`: Contains styles for overview.html
- `css/signup.css`: Contains styles for signup.html
- `css/style.css`: Contains general styles

