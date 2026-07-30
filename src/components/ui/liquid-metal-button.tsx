"use client";

import {
  liquidMetalFragmentShader,
  ShaderMount,
} from "@paper-design/shaders";
import { Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { AiLoader } from "@/components/ui/ai-loader";
import { cn } from "@/lib/utils";

type LiquidMetalButtonProps = {
  label?: string;
  loadingLabel?: string;
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  className?: string;
};

export function LiquidMetalButton({
  label = "Get Started",
  loadingLabel = "Generating...",
  disabled = false,
  loading = false,
  type = "button",
  onClick,
  className,
}: LiquidMetalButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const shaderRef = useRef<HTMLDivElement>(null);
  const shaderMount = useRef<ShaderMount | null>(null);

  useEffect(() => {
    if (!shaderRef.current) return;

    shaderMount.current = new ShaderMount(
      shaderRef.current,
      liquidMetalFragmentShader,
      {
        u_repetition: 4,
        u_softness: 0.5,
        u_shiftRed: 0.3,
        u_shiftBlue: 0.3,
        u_distortion: 0,
        u_contour: 0,
        u_angle: 45,
        u_scale: 8,
        u_shape: 1,
        u_offsetX: 0.1,
        u_offsetY: -0.1,
      },
      undefined,
      0.6,
    );

    return () => {
      shaderMount.current?.dispose();
      shaderMount.current = null;
    };
  }, []);

  function handleMouseEnter() {
    if (disabled) return;
    setIsHovered(true);
    shaderMount.current?.setSpeed(1);
  }

  function handleMouseLeave() {
    setIsHovered(false);
    setIsPressed(false);
    shaderMount.current?.setSpeed(0.6);
  }

  function handleClick() {
    if (disabled) return;

    shaderMount.current?.setSpeed(2.4);
    window.setTimeout(() => {
      shaderMount.current?.setSpeed(isHovered ? 1 : 0.6);
    }, 300);
    onClick?.();
  }

  return (
    <div
      className={cn(
        "relative h-[50px] w-[190px] [perspective:1000px]",
        disabled && "opacity-50",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-30 flex translate-z-5 items-center justify-center gap-2"
      >
        {loading ? (
          <AiLoader label={loadingLabel.replace(/\.+$/, "")} />
        ) : (
          <>
            <Sparkles className="size-4 text-zinc-500 drop-shadow-sm" />
            <span className="whitespace-nowrap text-sm font-medium text-zinc-500 [text-shadow:0_1px_2px_rgba(0,0,0,0.45)]">
              {label}
            </span>
          </>
        )}
      </div>

      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 z-20 translate-z-2.5 rounded-full p-0.5 transition-transform duration-150",
          isPressed && "translate-y-px scale-[0.98]",
        )}
      >
        <div className="size-full rounded-full bg-gradient-to-b from-[#202020] to-black" />
      </div>

      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-full shadow-[0_0_0_1px_rgba(0,0,0,.3),0_20px_12px_rgba(0,0,0,.08),0_5px_7px_rgba(0,0,0,.14)] transition-[transform,box-shadow] duration-150",
          isHovered &&
            "shadow-[0_0_0_1px_rgba(0,0,0,.4),0_12px_8px_rgba(0,0,0,.1),0_3px_5px_rgba(0,0,0,.18)]",
          isPressed && "translate-y-px scale-[0.98]",
        )}
      >
        <div
          ref={shaderRef}
          className="relative size-full overflow-hidden rounded-full [&_canvas]:absolute [&_canvas]:inset-0 [&_canvas]:size-full!"
        />
      </div>

      <button
        type={type}
        disabled={disabled}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={() => !disabled && setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        className="absolute inset-0 z-40 translate-z-6 cursor-pointer rounded-full bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed"
        aria-label={loading ? loadingLabel : label}
      />
    </div>
  );
}
