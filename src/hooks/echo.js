import { useEffect, useState } from 'react'
import { axios } from '../lib/axios';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
window.Pusher = Pusher

const useEcho = () => {
    const [echoInstance, setEchoInstance] = useState(null)

    useEffect(() => {
        // We are going to create the Echo instance here...
        const echo = new Echo({
            broadcaster: 'reverb',
            key: process.env.REACT_APP_REVERB_APP_KEY,
            authorizer: channel => {
                return {
                    authorize: (socketId, callback) => {
                        axios
                            .post('broadcasting/auth', {
                                socket_id: socketId,
                                channel_name: channel.name,
                            })
                            .then(response => {
                                callback(false, response.data)
                            })
                            .catch(error => {
                                callback(true, error)
                            })
                    },
                }
            },
            wsHost: process.env.REACT_APP_REVERB_HOST,
            wsPort: process.env.REACT_APP_REVERB_PORT,
            wssPort: process.env.REACT_APP_REVERB_PORT,
            forceTLS:
                (process.env.REACT_APP_REVERB_SCHEME ?? 'https') === 'https',
            enabledTransports: ['ws', 'wss'],
        })
        setEchoInstance(echo)
    }, [])
    
    return echoInstance
}

export default useEcho
