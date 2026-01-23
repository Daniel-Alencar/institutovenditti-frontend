"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon } from "lucide-react";
import type * as React from "react";

import { cn } from "@/lib/utils";

function Checkbox({
	className,
	...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
	return (
		<CheckboxPrimitive.Root
			data-slot="checkbox"
			className={cn(
				`
				peer
				size-5
				shrink-0
				rounded-md
				border-2
				border-muted-foreground/50
				bg-background
				shadow-sm

				transition-all

				hover:border-primary
				hover:bg-primary/5

				data-[state=checked]:bg-primary
				data-[state=checked]:border-primary
				data-[state=checked]:text-primary-foreground

				focus-visible:outline-none
				focus-visible:ring-2
				focus-visible:ring-primary
				focus-visible:ring-offset-2

				disabled:cursor-not-allowed
				disabled:opacity-50
				`,
				className,
			)}
			{...props}
		>
			<CheckboxPrimitive.Indicator
				data-slot="checkbox-indicator"
				className="flex items-center justify-center text-current"
			>
				<CheckIcon className="size-4 stroke-[3]" />
			</CheckboxPrimitive.Indicator>
		</CheckboxPrimitive.Root>
	);
}

export { Checkbox };
