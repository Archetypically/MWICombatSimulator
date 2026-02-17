# Global Rules

- Never start the server. I will have it running in a separate terminal.
- Never build after making changes.
- Never create your own version of a base component; always use a built-in Shadcn component. You may need to import it using

```shell
pnpm dlx shadcn@latest add <component>
```
- Important: never use a non-animated icons, like the ones directly from lucide-react. You *must* use an icon from lucide-animated.com

# Design

When making decisions about UI, reference [DESIGN.md](DESIGN.md).

# Data

When working with game data JSON files, reference [DATA.md](DATA.md).

# Tech Stack

- Vite + React + React Router + Tailwind CSS + Shadcn UI
- Mix of JSX and TSX
