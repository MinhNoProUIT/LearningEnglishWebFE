import * as signalR from '@microsoft/signalr'

let connection: signalR.HubConnection | null = null
const apiPath = 'https://localhost:44381'

export const initializeSignalRConnection = (): void => {
    if (!connection) {
        connection = new signalR.HubConnectionBuilder()
            .withUrl(`${apiPath}/notificationHub`)
            .withAutomaticReconnect()
            .build()

        connection.on('ReceiveNotification', (message: string) => {
            console.log('Received notification:', message)
        })

        connection
            .start()
            .then(() => console.log('SignalR Connected'))
            .catch(err => console.error('Error connecting to SignalR:', err))
    }
}

export const getSignalRConnection = (): signalR.HubConnection | null => connection
