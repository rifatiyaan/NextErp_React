# NextErp_React (Frontend)

**NextErp_React** is a modern, high-performance ERP frontend interface built with **Next.js 16**, **Tailwind CSS v4**, and **Shadcn/UI**.

To Login : email : admin@test.com, password : nextErpIsAwesome 

It serves as the React-based frontend for the **NextErp** backend solution : https://github.com/rifatiyaan/NextErp . Note that an Angular version of this frontend is also planned for the future.

## 🚀 Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Library:** [Shadcn/UI](https://ui.shadcn.com/) (Radix UI primitives)
- **Icons:** [Lucide React](https://lucide.dev/)
- **State Management:** React Hooks / Context (Jotai planned for complex state)
- **Package Manager:** NPM

## 📂 Project Structure

This project follows a **Container-Presentational** architecture to separate business logic from UI rendering.

```
D:\EcommerceUi\NextGenERP\nextgenerp
├── app/                  # Next.js App Router pages and layouts
│   ├── layout.tsx        # Root layout with Providers
│   ├── page.tsx          # Home/Dashboard page
│   └── globals.css       # Global styles and Tailwind directives
├── components/           # Presentational (Dumb) Components
│   ├── layout/           # Strategic layout blocks (Sidebar, Header)
│   ├── ui/               # Reusable Shadcn/UI primitives (Button, Input, Sheet...)
│   └── providers/        # Context providers (Theme, Sidebar status)
├── containers/           # Container (Smart) Components
│   └── layout/           # Logic-heavy layout wrappers (MainLayout)
├── data/                 # Mock data and static configuration
│   ├── dictionaries/     # i18n dictionaries (English default)
│   └── navigations.ts    # Sidebar navigation structure
├── hooks/                # Custom React hooks (use-mobile, etc.)
├── lib/                  # Utilities and helper functions
│   └── utils.ts          # Class merging (cn) and formatters
└── types/                # TypeScript type definitions
```

## 🔌 Backend Integration

This frontend is designed to consume APIs from the **NextErp** .NET backend.
*   **Current State:** Uses mock data (`data/`) for UI development.
*   **Future Integration:** API calls will replace mock data loaders in the `containers/` layer.

## 🛠️ Getting Started

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Run the development server:**
    ```bash
    npm run dev
    ```

3.  **Build for production:**
    ```bash
    npm run build
    npm start
    ```

## 🎨 Design System

The UI is a direct port of the **Shadboard Analytics Dashboard**, ensuring a premium, responsive, and pixel-perfect design. It features:
*   **Collapsible Sidebar:** Optimized for both desktop and mobile.
*   **Themeable:** Built with CSS variables for easy theming (Zinc default).
*   **Dark Mode:** Native support via `next-themes`.

## 🔮 Future Roadmap

*   **Recharts Integration:** interactive analytics charts.
*   **Auth Integration:** Connect to NextErp Identity.
*   **Angular Version:** A parallel frontend implementation using Angular is planned.
