"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link, { type LinkProps } from "next/link";
import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useContext,
  useState,
} from "react";

import { cn } from "@/lib/utils";

type SidebarLinkItem = {
  label: string;
  href: string;
  icon: ReactNode;
};

type SidebarContextValue = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  animate: boolean;
};

const SidebarContext = createContext<SidebarContextValue | undefined>(
  undefined,
);

export function useSidebar() {
  const context = useContext(SidebarContext);

  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }

  return context;
}

export function SidebarProvider({
  children,
  open: controlledOpen,
  setOpen: controlledSetOpen,
  animate = true,
}: {
  children: ReactNode;
  open?: boolean;
  setOpen?: Dispatch<SetStateAction<boolean>>;
  animate?: boolean;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = controlledSetOpen ?? setInternalOpen;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function Sidebar({
  children,
  open,
  setOpen,
  animate,
}: {
  children: ReactNode;
  open?: boolean;
  setOpen?: Dispatch<SetStateAction<boolean>>;
  animate?: boolean;
}) {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
}

export function SidebarBody(
  props: React.ComponentProps<typeof motion.div>,
) {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...(props as React.ComponentProps<"div">)} />
    </>
  );
}

export function DesktopSidebar({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) {
  const { open, setOpen, animate } = useSidebar();

  return (
    <motion.aside
      className={cn(
        "hidden h-full shrink-0 flex-col bg-neutral-100 px-4 py-4 md:flex dark:bg-neutral-800",
        className,
      )}
      animate={{ width: animate ? (open ? 300 : 60) : 300 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      {...props}
    >
      {children}
    </motion.aside>
  );
}

export function MobileSidebar({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const { open, setOpen } = useSidebar();

  return (
    <div
      className="flex h-10 w-full items-center justify-end bg-neutral-100 px-4 py-4 md:hidden dark:bg-neutral-800"
      {...props}
    >
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label="Open sidebar"
      >
        <Menu className="cursor-pointer text-neutral-800 dark:text-neutral-200" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={cn(
              "fixed inset-0 z-[100] flex h-full w-full flex-col justify-between bg-white p-10 dark:bg-neutral-900",
              className,
            )}
          >
            <button
              type="button"
              className="absolute right-10 top-10 z-50"
              onClick={() => setOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="text-neutral-800 dark:text-neutral-200" />
            </button>
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function SidebarLink({
  link,
  className,
  ...props
}: {
  link: SidebarLinkItem;
  className?: string;
} & Omit<LinkProps, "href">) {
  const { open, animate } = useSidebar();

  return (
    <Link
      href={link.href}
      className={cn(
        "group/sidebar flex items-center justify-start gap-2 py-2",
        className,
      )}
      {...props}
    >
      {link.icon}
      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="m-0 inline-block whitespace-pre p-0 text-sm text-neutral-700 transition duration-150 group-hover/sidebar:translate-x-1 dark:text-neutral-200"
      >
        {link.label}
      </motion.span>
    </Link>
  );
}
