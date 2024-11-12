import z from "zod"

const dateStringRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/

export const configJsonSchema = z.object({
  properties: z.array(
    z.object({
      name: z.string(),
      url: z.string().url(),
      adultsAmmount: z.number().int().gt(0),
      startDate: z.string().regex(dateStringRegex),
      endDate: z.string().regex(dateStringRegex),
      maxBundleSize: z.number().int().gt(0)
    })
  )
})