interface MultipleButtonsProps {
    code: string
    type: string
    Component: any
    disabled?: boolean
}

interface ButtonProps {
    id: string
    selectedState: any
    items: MultipleButtonsProps[]
    setSelectedState: any
    disabled?: boolean
}

export type { MultipleButtonsProps, ButtonProps }
