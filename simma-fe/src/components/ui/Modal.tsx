import React from "react";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { X } from "lucide-react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
  initialFocus?: React.MutableRefObject<HTMLElement | null>;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "md",
  initialFocus,
}) => {
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  };

  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={onClose}
        initialFocus={initialFocus}
      >
        <TransitionChild
          as={React.Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <TransitionChild
              as={React.Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95 translate-y-2 sm:translate-y-0"
              enterTo="opacity-100 scale-100 translate-y-0"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100 translate-y-0"
              leaveTo="opacity-0 scale-95 translate-y-2 sm:translate-y-0"
            >
              <DialogPanel
                className={`w-full ${maxWidthClasses[maxWidth]} transform rounded-2xl bg-white p-6 text-left shadow-2xl transition-all border border-slate-100 my-8`}
              >
                <div className="flex items-start justify-between pb-3 border-b border-slate-100 mb-5">
                  <div>
                    {title && (
                      <DialogTitle as="h3" className="text-base font-bold text-slate-900 tracking-tight">
                        {title}
                      </DialogTitle>
                    )}
                    {description && (
                      <p className="text-xs text-slate-500 mt-0.5">{description}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg p-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {children}
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
