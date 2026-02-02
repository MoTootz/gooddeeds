'use client'

import { useState } from 'react'

export function useForm<T extends Record<string, any>>(
  initialValues: T,
  onSubmit: (values: T) => Promise<void>
) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setValues(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSubmit(values)
    } catch (error) {
      setErrors({ submit: 'Failed to submit form' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    setErrors,
  }
}
