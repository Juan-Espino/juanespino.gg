"use client";

import Link from "next/link";
import { useState, type ComponentProps } from "react";

export default function ArticlePrefetchLink(
  props: ComponentProps<typeof Link>,
) {
  const [intent, setIntent] = useState(false);
  return (
    <Link
      {...props}
      prefetch={intent}
      onMouseEnter={() => setIntent(true)}
      onFocus={() => setIntent(true)}
      onTouchStart={() => setIntent(true)}
    />
  );
}
