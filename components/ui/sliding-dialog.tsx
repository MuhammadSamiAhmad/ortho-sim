"use client";

import * as Dialog from "@radix-ui/react-dialog";
import type { ReactNode } from "react";
import { X } from "lucide-react";

interface SlidingDialogProps {
  trigger: ReactNode;
  title?: string;
  description?: string;
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const SlidingDialog = ({
  trigger,
  title,
  description,
  children,
  open,
  onOpenChange,
}: SlidingDialogProps) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 z-40" />
        <Dialog.Content
          className="fixed z-50 
          /* Mobile first approach */
          inset-y-0 right-0 w-full 
          /* Tablet and up */
          md:w-[80%] md:max-w-[500px]
          /* Desktop */
          lg:w-[570px] lg:right-0
          /* Styling */
          bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 shadow-lg border-l border-white/10
          /* Padding */
          p-4 md:p-6 lg:p-[25px]
          /* Rounded corners only on left side */
          rounded-l-none md:rounded-l-3xl
          /* Height */
          h-full
          /* Content */
          overflow-y-auto"
        >
          {title && (
            <Dialog.Title className="text-lg md:text-xl lg:text-2xl font-bold text-white border-b border-white/20 pb-3 mt-4 md:mt-6 lg:mt-10 mb-4 md:mb-6 lg:mb-10">
              {title}
            </Dialog.Title>
          )}
          {description && (
            <Dialog.Description className="mb-4 md:mb-5 mt-2 md:mt-2.5 text-gray-300">
              {description}
            </Dialog.Description>
          )}
          <div>{children}</div>

          {/* Close button */}
          <Dialog.Close className="absolute cursor-pointer top-4 right-4 p-2 md:top-6 text-white hover:text-gray-300 transition-colors">
            <span className="sr-only">Close</span>
            <X className="w-6 h-6" />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default SlidingDialog;
