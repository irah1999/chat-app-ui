# React Chat Application

This is the frontend for a real-time chat application built with **React**. It connects to a Laravel backend using **Laravel Echo** with **Reverb** and **Pusher** for WebSocket-based communication.

---

## 🚀 Features

- Real-time private and group messaging
- Typing indicators and message seen/unseen status
- Scroll-based infinite message loading
- Laravel Echo integration with Reverb & Pusher
- Group creation, member list, and chat info UI
- JWT-based secure API calls to Laravel backend

---

## 🛠️ Technologies Used

- React 18/19 (with Hooks and Functional Components)
- Tailwind CSS for styling
- Laravel Echo + Pusher for real-time messaging
- Axios for API requests
- JWT for authentication
- Vite (optional for build)

---

## 📦 Installation

### 1. Clone the repository

```bash
git clone https://github.com/irah1999/chat-app-ui.git
cd react-chat-app-ui
```
### 2.Install dependencies

```bash
npm install
```
### 3. Create a .env file in the root of the project and add the following:

```env
REACT_APP_BACKEND_URL=http://localhost:8000/api
REACT_APP_BACKEND_IMAGE_URL=http://localhost:8000/storage/

REACT_APP_REVERB_APP_ID=
REACT_APP_REVERB_APP_KEY=
REACT_APP_REVERB_APP_SECRET=
REACT_APP_REVERB_HOST="localhost"
REACT_APP_REVERB_PORT=8080
REACT_APP_REVERB_SCHEME=http

```

### 4. Start the server
```bash
npm run dev
```

### Real-time Setup
### The chat app uses Laravel Echo with the Reverb broadcaster. The Echo configuration is typically set in src/hooks/echo.js (or similar). A sample setup:

```
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


```