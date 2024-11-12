import type { BookingEnvData } from "./bookingEnvData"

export interface CustomWindow extends Window {
  booking: {
    env: BookingEnvData
  }
}