import { ReactNode } from "react";
import Link from "next/link";

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div>
      <header>
        <h1>Welcome to Ortho Sim</h1>
        <nav>
          <ul>
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/about">About</Link>
            </li>
            <li>
              <Link href="/contact">Contact</Link>
            </li>
          </ul>
        </nav>
      </header>
      <main>{children}</main>
      <footer>
        <p>&copy; 2023 Ortho Sim. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default RootLayout;
