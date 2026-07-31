import { useEffect, useState } from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [stories, setStories] = useState([]);
  const [storyId, setStoryId] = useState(null);
  const [choices, setChoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingStories, setLoadingStories] = useState(true);

  // Load stories when application starts
  useEffect(() => {
    loadStories();
  }, []);

  // Load all saved stories
  const loadStories = async () => {
    try {
      setLoadingStories(true);

      const response = await fetch(
        `${API_URL}/stories`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load stories"
        );
      }

      const data = await response.json();

      setStories(data);

    } catch (error) {
      console.error(
        "Error loading stories:",
        error
      );

    } finally {
      setLoadingStories(false);
    }
  };


  // Start a new story
  const startNewStory = () => {
    setMessage("");
    setMessages([]);
    setStoryId(null);
    setChoices([]);
  };


  // Load an existing story
  const loadStory = async (
    selectedStoryId
  ) => {

    if (loading) {
      return;
    }

    try {

      setLoading(true);

      const response = await fetch(
        `${API_URL}/story/${selectedStoryId}`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load selected story"
        );
      }

      const data = await response.json();

      setStoryId(
        data.story_id
      );


      // Convert database conversation
      // into frontend messages

      const loadedMessages =
        data.conversation.map(
          (item) => ({
            role:
              item.role === "user"
                ? "user"
                : "ai",

            content:
              item.content,
          })
        );


      setMessages(
        loadedMessages
      );


      // Clear choices when loading
      // an old story

      setChoices([]);

    } catch (error) {

      console.error(
        "Error loading story:",
        error
      );

    } finally {

      setLoading(false);

    }
  };


  // Send message to backend
  const sendMessage = async (
    selectedMessage = null
  ) => {

    const messageToSend =
      selectedMessage !== null
        ? selectedMessage
        : message.trim();


    if (
      !messageToSend ||
      loading
    ) {
      return;
    }


    // Add user message
    // immediately to UI

    setMessages(
      (previousMessages) => [
        ...previousMessages,

        {
          role: "user",
          content: messageToSend,
        },
      ]
    );


    setMessage("");

    // Remove old choices
    setChoices([]);

    setLoading(true);


    try {

      const response =
        await fetch(
          `${API_URL}/story`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              message:
                messageToSend,

              story_id:
                storyId,
            }),
          }
        );


      if (!response.ok) {

        throw new Error(
          "Failed to generate story"
        );

      }


      const data =
        await response.json();


      // Save story ID

      setStoryId(
        data.story_id
      );


      // Add AI response

      setMessages(
        (previousMessages) => [
          ...previousMessages,

          {
            role: "ai",
            content:
              data.message,
          },
        ]
      );


      // Save new choices

      setChoices(
        data.choices || []
      );


      // Refresh sidebar

      await loadStories();


    } catch (error) {

      console.error(
        error
      );


      setMessages(
        (previousMessages) => [
          ...previousMessages,

          {
            role: "error",

            content:
              "Something went wrong. Please try again.",
          },
        ]
      );


    } finally {

      setLoading(false);

    }
  };


  return (

    <div className="app">

      {/* ========================= */}
      {/* LEFT SIDEBAR */}
      {/* ========================= */}

      <aside className="sidebar">

        <div className="sidebar-header">

          <h2>
            🌙 Storyteller
          </h2>


          <button
            className="new-story-button"
            onClick={
              startNewStory
            }
            disabled={loading}
          >
            🆕 New Story
          </button>

        </div>


        <div className="stories-section">

          <h3>
            Your Stories
          </h3>


          {loadingStories && (

            <p className="sidebar-message">
              Loading stories...
            </p>

          )}


          {!loadingStories &&
            stories.length === 0 && (

              <p className="sidebar-message">
                No stories yet.
              </p>

            )}


          <div className="story-list">

            {stories.map(
              (story) => (

                <button
                  key={
                    story.story_id
                  }

                  className={
                    `story-item ${
                      story.story_id ===
                      storyId
                        ? "active"
                        : ""
                    }`
                  }

                  onClick={() =>
                    loadStory(
                      story.story_id
                    )
                  }

                  disabled={loading}
                >

                  <span className="story-icon">
                    📖
                  </span>


                  <span className="story-title">
                    {story.title}
                  </span>

                </button>

              )
            )}

          </div>

        </div>

      </aside>


      {/* ========================= */}
      {/* MAIN APPLICATION */}
      {/* ========================= */}

      <div className="main-content">


        {/* HEADER */}

        <header className="header">

          <div className="header-text">

            <h1>
              🌙 Interactive Storyteller
            </h1>

            <p>
              Your choices shape the story.
            </p>

          </div>

        </header>


        {/* STORY AREA */}

        <main className="story-container">


          {/* CONVERSATION */}

          <div className="story-box">


            {messages.length === 0 && (

              <div className="welcome">

                <div className="welcome-icon">
                  📖
                </div>

                <h2>
                  Your Adventure Begins
                </h2>

                <p>
                  Enter a choice or action
                  to begin your interactive
                  adventure.
                </p>

                <p className="example">
                  Example: "I enter the
                  mysterious forest at
                  midnight."
                </p>

              </div>

            )}


            {messages.map(
              (item, index) => (

                <div
                  key={index}

                  className={
                    `message ${item.role}`
                  }
                >

                  <div className="message-label">

                    {item.role ===
                      "user"
                      ? "🧑 You"
                      : item.role ===
                        "ai"
                      ? "🌙 Storyteller"
                      : "⚠️ Error"}

                  </div>


                  <div className="message-content">

                    {item.content}

                  </div>

                </div>

              )
            )}


            {/* LOADING */}

            {loading && (

              <div className="message ai">

                <div className="message-label">
                  🌙 Storyteller
                </div>

                <div className="message-content loading">

                  The storyteller
                  is thinking...

                </div>

              </div>

            )}


            {/* CLICKABLE CHOICES */}

            {!loading &&
              choices.length > 0 && (

                <div className="choices-container">

                  <div className="choices-title">
                    What do you do?
                  </div>


                  {choices.map(
                    (
                      choice,
                      index
                    ) => (

                      <button
                        key={index}

                        className="choice-button"

                        onClick={() =>
                          sendMessage(
                            choice
                          )
                        }

                        disabled={loading}
                      >

                        <span className="choice-icon">
                          {index === 0
                            ? "🌲"
                            : index === 1
                            ? "🔎"
                            : "🚪"}
                        </span>


                        <span>
                          {choice}
                        </span>

                      </button>

                    )
                  )}

                </div>

              )}

          </div>


          {/* INPUT AREA */}

          <div className="input-area">

            <input

              type="text"

              value={message}

              onChange={(
                event
              ) =>
                setMessage(
                  event.target.value
                )
              }

              onKeyDown={(
                event
              ) => {

                if (
                  event.key ===
                  "Enter"
                ) {

                  sendMessage();

                }

              }}

              placeholder="What do you do?"

              disabled={loading}

            />


            <button

              className="send-button"

              onClick={
                () =>
                  sendMessage()
              }

              disabled={
                loading ||
                !message.trim()
              }

            >

              {loading
                ? "..."
                : "Send"}

            </button>

          </div>


          {/* STORY ID */}

          {storyId && (

            <div className="story-id">

              Story ID: {storyId}

            </div>

          )}

        </main>

      </div>

    </div>

  );
}

export default App;