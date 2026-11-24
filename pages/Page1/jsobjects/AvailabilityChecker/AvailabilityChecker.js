export default {
    async checkAvailability() {
        const currentTime = 540;
        const startText = String(StartTimeInput.text ?? "").trim();
        const duration = Number(DurationInput.text);
        const blocked = RoomBlockedSwitch.isSwitchedOn;
        const bookings = BookingsTable.tableData;

        let result;

        // Validate time format
        const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(startText);

        if (!match) {
            result = {
                available: false,
                code: "INVALID_TIME",
                message: "Enter a valid time in HH:MM format."
            };
        } else {
            const start = Number(match[1]) * 60 + Number(match[2]);
            const end = start + duration;

            if (start <= currentTime) {
                result = {
                    available: false,
                    code: "PAST_START",
                    message: "Start time must be in the future."
                };
            } else if (!Number.isInteger(duration) || duration <= 0 || duration > 120) {
                result = {
                    available: false,
                    code: "INVALID_DURATION",
                    message: "Duration must be between 1 and 120 minutes."
                };
            } else if (end > 1440) {
                result = {
                    available: false,
                    code: "INVALID_INTERVAL",
                    message: "Booking cannot extend beyond midnight."
                };
            } else if (blocked) {
                result = {
                    available: false,
                    code: "ROOM_BLOCKED",
                    message: "Unavailable: Room is blocked."
                };
            } else {
                const conflict = bookings.find(
                    b => b.start < end && start < b.end
                );

                if (conflict) {
                    result = {
                        available: false,
                        code: "OVERLAP",
                        message: "Unavailable: Overlaps with " + conflict.title
                    };
                } else {
                    result = {
                        available: true,
                        code: "AVAILABLE",
                        message: "Available: Room is free."
                    };
                }
            }
        }

        await storeValue("availabilityResult", result, false);
        return result;
    }
}
