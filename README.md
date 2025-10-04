# join
A project management tool

## Project Structure

```
join/
├── assets/
│   └── icons/
│       └── logo-white.svg
├── js/
│   └── helper.js
├── index.html
├── script.js
├── style.css
├── README.md
└── LICENSE
```

### File Overview
- `index.html`: Entry point; loads logo via `<object>`
- `script.js`: Main entry; triggers logo animation and color changes
- `js/helper.js`: Utilities: `changeBackground(color)`, `changeLogoColor(color)`
- `style.css`: Logo container animation (center → corner), body background transition, mobile-first
- `assets/icons/logo-white.svg`: Logo SVG (white fill, paths)
