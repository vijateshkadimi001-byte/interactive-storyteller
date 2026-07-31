import { useState } from "react";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [storyId, setStoryId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastMessage, setLastMessage] = useState("");

  const startNewStory = () => {
    setMessage("");
    setMessages([]);
    setStoryId(null);
    setLoading(false);
    setLastMessage("");
  };

  const sendMessage = async (customMessage = null) => {
    const userMessage =
      customMessage !== null ? customMessage : message;

    if (!userMessage.trim() || loading) {
      return;
    }

    setLastMessage(userMessage);
    setMessage("");
    setLoading(true);

    setMessages((previousMessages) => [
      ...previousMessages,
      {
        role: "user",
        content: userMessage,
      },
    ]);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/story",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: userMessage,
            story_id: storyId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Backend returned status ${response.status}`
        );
      }

      const data = await response.json();

      setStoryId(data.story_id);

      setMessages((previousMessages) => [
        ...previousMessages,
        {
          role: "ai",
          content: data.message,
        },
      ]);
    } catch (error) {
      console.error("Error:", error);

      setMessages((previousMessages) => [
        ...previousMessages,
        {
          role: "error",
          content:
            "Something went wrong while generating the story.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const retryLastMessage = () => {
    if (lastMessage && !loading) {
      setMessages((previousMessages) =>
        previousMessages.filter(
          (item) => item.role !== "error"
        )
      );

      sendMessage(lastMessage);
    }
  };

  return (
    <div className="app">

      {/* Header */}
      <header className="header">
        <div className="header-content">

          <div>
            <h1>🌙 Interactive Storyteller</h1>

            <p>
              Your choices shape the story.
            </p>
          </div>

          <button
            className="new-story-button"
            onClick={startNewStory}
            disabled={loading}
          >
            🆕 New Story
          </button>

        </div>
      </header>


      {/* Main Story Area */}
      <main className="story-container">

        <div className="story-box">

          {/* Welcome Message */}
          {messages.length === 0 && (
            <div className="welcome">

              <h2>
                📖 Your Adventure Begins
              </h2>

              <p>
                Enter a choice or action to begin your
                interactive adventure.
              </p>

              <p className="example">
                Example: "I enter the mysterious forest
                at midnight."
              </p>

            </div>
          )}


          {/* Messages */}
          {messages.map((item, index) => (

            <div
              key={index}
              className={`message ${item.role}`}
            >

              <div className="message-label">

                {item.role === "user"
                  ? "🧑 You"
                  : item.role === "ai"
                  ? "🌙 Storyteller"
                  : "⚠️ Error"}

              </div>


              <div className="message-content">

                {item.content}


                {/* Retry Button */}
                {item.role === "error" && (
                  <button
                    className="retry-button"
                    onClick={retryLastMessage}
                    disabled={loading}
                  >
                    🔄 Retry
                  </button>
                )}

              </div>

            </div>

          ))}


          {/* Loading Message */}
          {loading && (

            <div className="message ai">

              <div className="message-label">
                🌙 Storyteller
              </div>

              <div className="message-content loading">
                The storyteller is thinking...
              </div>

            </div>

          )}

        </div>


        {/* Input Area */}
        <div className="input-area">

          <input
            type="text"
            value={message}
            onChange={(event) => {
              setMessage(event.target.value);
            }}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !event.shiftKey
              ) {
                event.preventDefault();
                sendMessage();
              }
            }}
            placeholder="What do you do?"
            disabled={loading}
          />


          <button
            type="button"
            onClick={() => sendMessage()}
            disabled={
              loading ||
              message.trim().length === 0
            }
          >
            {loading ? "..." : "Send"}
          </button>

        </div>


        {/* Story ID */}
        {storyId && (

          <div className="story-id">
            Story ID: {storyId}
          </div>

        )}

      </main>

    </div>
  );
}

export default App;