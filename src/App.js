import "./App.css";
import { useState, useEffect } from "react";
import MentionField from "./components/MentionField";
import ReactMarkdown from "react-markdown";

function App() {
  const [emailsData, setEmailsData] = useState([]);
  const [commentData, setCommentData] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const suggestionsExample = [
    {
      email: "test@test.de",
      label: "Max Muster",
    },
    {
      email: "foo@bar.de",
      label: "Foo Bar",
    },
    {
      email: "lorem@ipsum.de",
      label: "Lorem Ipsum",
    },
  ];

  const submitData = (commentText, mentionedUsers) => {
    console.log(commentData);
    setCommentData(commentText);
    setEmailsData(mentionedUsers);
  };

  useEffect(() => {
    window &&
      window.setTimeout(() => {
        setIsLoading(false);
      }, 3000);
  }, []);

  return (
    <div className="main">
      <div className="main--gradient-block"></div>
      <div className="content">
        <h1>Simple Mention Component in React</h1>
        <h4>Example Data (for Suggestion)</h4>
        <div className="data-preview">
          <pre>{JSON.stringify(suggestionsExample, null, 2)}</pre>
        </div>
        <MentionField
          initialSuggestions={suggestionsExample}
          label="Comment"
          handleSubmit={submitData}
          isLoading={isLoading}
        />

        <h4>Post Data</h4>
        <div className="data-preview">
          <pre>{JSON.stringify(emailsData, null, 2)}</pre>
        </div>

        <h4>Comment Preview (in Markdown)</h4>
        <div className="data-preview">
          {commentData ? <ReactMarkdown>{commentData}</ReactMarkdown> : '""'}
        </div>
      </div>
    </div>
  );
}

export default App;
