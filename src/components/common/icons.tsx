import type { SVGProps } from 'react'

function BaseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    />
  )
}

export function PiggyBankIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <BaseIcon {...props}>
      <path d="M4 13c0-3.9 3.6-7 8-7 3 0 5.6 1.4 7 3.5.9-.3 1.8.2 2 1.1.2.9-.4 1.8-1.3 2-.2 0-.5.1-.7 0v1.4c0 .6-.5 1-1 1h-.6l-.6 1.7c-.2.6-.8 1-1.4 1h-.6a1 1 0 0 1-1-1v-.7H9.2v.7a1 1 0 0 1-1 1h-.6c-.6 0-1.2-.4-1.4-1L5.6 16C4.6 15.4 4 14.2 4 13z" />
      <circle cx="9" cy="12" r="0.6" fill="currentColor" stroke="none" />
      <path d="M14 8.5V6.5" />
    </BaseIcon>
  )
}

export function BuildingIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <BaseIcon {...props}>
      <rect x="5" y="4" width="14" height="16" rx="1.5" />
      <path d="M9 8h1M14 8h1M9 12h1M14 12h1M9 16h1M14 16h1" />
    </BaseIcon>
  )
}

export function ClockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" />
    </BaseIcon>
  )
}

export function SparkleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <BaseIcon {...props}>
      <path d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6L12 4z" />
    </BaseIcon>
  )
}

export function ChartIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <BaseIcon {...props}>
      <path d="M4 20h16" />
      <path d="M7 20v-6M12 20V8M17 20v-10" />
    </BaseIcon>
  )
}

export function MenuIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <BaseIcon {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </BaseIcon>
  )
}

export function PlusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <BaseIcon {...props}>
      <path d="M12 5v14M5 12h14" />
    </BaseIcon>
  )
}

export function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <BaseIcon {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </BaseIcon>
  )
}
