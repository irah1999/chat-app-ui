import React, { useState } from 'react';
import Header from '../header/Header';
import Chat from '../chat/Chat';
import Contact from '../contact/Contact';

const Home = () => {
  const [selectedReceiver, setSelectedReceiver] = useState(null);
  return (
    <div className="flex h-screen">
      {/* Contact List - Always Visible */}
      <Contact setSelectedReceiver={setSelectedReceiver()} />

      {/* Chat Component - Show Only When Receiver Selected */}
      {selectedReceiver ? <Chat receiver={selectedReceiver} /> : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Select a contact to start chatting</p>
        </div>
      )}
    </div>

  )
}

export default Home