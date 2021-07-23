import date from 'date-and-time'

export const generateMessage = (username, text) => {
    return {
        username,
        text,
        createdAt: date.format(new Date(), 'HH:mm')
    }
}