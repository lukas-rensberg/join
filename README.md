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
- `style.css`: Logo container animation (center → left upper corner), body background transition
- `assets/icons/logo-white.svg`: Logo SVG (white paths)
- `assets/icons/logo-blue.svg`: Logo SVG (blue paths, favicon)
- `menu_icons/`: icons for the app's navbar
- `priority_icons/`: icons for priority markering at the kanban board
- `css/font.css`: Defination of font-families
