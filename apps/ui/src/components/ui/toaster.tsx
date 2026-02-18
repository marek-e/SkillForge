import { sileo, Toaster as SileoToaster } from 'sileo'

const Toaster = () => {
  return (
    <SileoToaster
      position="top-right"
      options={{
        styles: {
          description: 'text-sm dark:text-black text-white',
          title: 'text-md font-medium dark:text-black text-white',
        },
        fill: 'var(--toaster-background)',
      }}
    />
  )
}

const toast = sileo

export { Toaster, toast }
