import { useState, useRef, useEffect } from "react";
import cn from "classnames";

let getCaretCoordinates = require("textarea-caret");
const suggestionStyleHidden = { display: "none", maxHeight: "200px" };

export default function MentionField({
  initialSuggestions,
  isLoading,
  label,
  handleSubmit,
}) {
  const [suggestionStyles, setSuggestionStyles] = useState(
    suggestionStyleHidden
  );
  const [suggestions, setSuggestions] = useState([]);
  const [allSuggestions, setAllSuggestions] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [mentionedUsers, setMentionedUsers] = useState([]);
  const commentTextarea = useRef(null);

  useEffect(() => {
    const updatedSuggestions = initialSuggestions.map((suggestion, index) => {
      suggestion.focused = index === 0;
      suggestion.value = suggestion.label.split(" ").join("");
      return suggestion;
    });
    setSuggestions(updatedSuggestions);
    setAllSuggestions(updatedSuggestions);
  }, []);

  const handleTextareaChange = (ev) => {
    const textarea = ev.target;
    const textareaValue = textarea.value;
    setCommentText(textareaValue);
    var caret = getCaretCoordinates(ev.target, ev.target.selectionEnd);
    const allWords = textareaValue.split(" ");
    const lastWord = allWords[allWords.length - 1];

    if (lastWord.includes("@")) {
      const newStyles = {
        ...suggestionStyles,
        top: caret.top + 40,
        left: caret.left + 5,
        display: "block",
      };
      setSuggestionStyles(newStyles);
      const newSuggestions = [...allSuggestions].filter((suggestion) =>
        suggestion.label
          .toLowerCase()
          .startsWith(lastWord.replace("@", "").toLowerCase())
      );
      newSuggestions.map((sugg, index) => {
        sugg.focused = index === 0;
        return sugg;
      });
      setSuggestions(newSuggestions);
    } else {
      setSuggestionStyles(suggestionStyleHidden);
    }
  };

  const hideSuggestions = () => {
    setSuggestionStyles(suggestionStyleHidden);
    commentTextarea.current.focus();
  };

  const onSuggestionSelectClick = (e, suggestion) => {
    const currentCommentText = commentText.split(" ");
    currentCommentText[currentCommentText.length - 1] = `@${suggestion.value} `;
    setCommentText(currentCommentText.join(" "));
    const newMentionedUsers = [...mentionedUsers];
    newMentionedUsers.push(suggestion);
    setMentionedUsers(newMentionedUsers);
    hideSuggestions();
  };

  const handleSuggestionEnter = (e) => {
    e.preventDefault();
    const filteredSuggestion = suggestions.find(
      (suggestion) => suggestion.focused
    );
    const currentCommentText = commentText.split(" ");
    currentCommentText[
      currentCommentText.length - 1
    ] = `@${filteredSuggestion.value} `;
    setCommentText(currentCommentText.join(" "));
    const newMentionedUsers = [...mentionedUsers].concat(filteredSuggestion);
    setMentionedUsers(newMentionedUsers);
    hideSuggestions();
  };

  const handleArrowUpSuggestions = (e) => {
    e.preventDefault();
    const currentlyFocusedIndex = suggestions.findIndex(
      (suggestion) => suggestion.focused
    );
    const newSuggestions = [...suggestions];

    if (newSuggestions[currentlyFocusedIndex - 1]) {
      newSuggestions[currentlyFocusedIndex].focused = false;
      newSuggestions[currentlyFocusedIndex - 1].focused = true;
      setSuggestions(newSuggestions);
    }
  };

  const handleArrowDownSuggestions = (e) => {
    e.preventDefault();
    const currentlyFocusedIndex = suggestions.findIndex(
      (suggestion) => suggestion.focused
    );
    const newSuggestions = [...suggestions];

    if (newSuggestions[currentlyFocusedIndex + 1]) {
      newSuggestions[currentlyFocusedIndex].focused = false;
      newSuggestions[currentlyFocusedIndex + 1].focused = true;
      setSuggestions(newSuggestions);
    }
  };

  const handleMentionSubmit = (e) => {
    e.preventDefault();
    // cover case where the user manually deleted a mention from the comment field
    const users = mentionedUsers
      .filter((mentionedUser) => {
        return commentText.includes(`@${mentionedUser.value}`);
      })
      .map((user) => {
        return { email: user.email, label: user.label, value: user.value };
      });
    const usersWithoutDuplicates = Array.from(
      new Set(users.map(JSON.stringify))
    ).map(JSON.parse);
    // convert to markdown
    let finalCommentText = commentText;
    usersWithoutDuplicates.forEach((user) => {
      finalCommentText = finalCommentText.replaceAll(
        `@${user.value}`,
        `[@${user.value}](mailto:${user.email})`
      );
    });
    handleSubmit(finalCommentText, usersWithoutDuplicates);
  };

  return (
    <form
      className="form sm:w-[320px] text-base"
      onSubmit={handleMentionSubmit}
    >
      <div className="form-tag">
        <div className="mention-field__wrapper">
          <label className="mention-field__label" htmlFor="comment">
            {label && label}
            <textarea
              id="comment"
              onChange={handleTextareaChange}
              className="mention-field"
              value={commentText}
              ref={commentTextarea}
              placeholder="Start typing '@' to mention user"
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") handleArrowDownSuggestions(e);
                if (e.key === "ArrowUp") handleArrowUpSuggestions(e);
                if (e.key === "Enter") handleSuggestionEnter(e);
              }}
            />
          </label>
          {isLoading ? (
            <div
              className="mention-field__suggestions"
              style={suggestionStyles}
            >
              <div className="mention-field__suggestion">Loading...</div>
            </div>
          ) : (
            <>
              <div
                id="suggestions"
                className="mention-field__suggestions"
                style={suggestionStyles}
              >
                {suggestions.map((suggestion) => {
                  return (
                    <div
                      key={suggestion.email}
                      className={cn({
                        "mention-field__suggestion": true,
                        "mention-field__suggestion--focused":
                          suggestion.focused,
                      })}
                      onClick={(e) => onSuggestionSelectClick(e, suggestion)}
                      data-value={suggestion.value}
                    >
                      {suggestion.label}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
      <button type="submit">Submit</button>
    </form>
  );
}
