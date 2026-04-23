'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function AnimatedLogo() {
  return (
    <Link 
      href="/" 
      className="flex items-center select-none group absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2"
    >
      <Image
        src="/logo.png"
        alt="Spirit - متجر الإكسسوارات"
        width={250}
        height={50}
        className="h-30 w-auto object-contain transition-opacity group-hover:opacity-80"
        priority
      />
    </Link>
  )
}
