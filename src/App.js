import React, { useState } from 'react';
import './App.css';
import axios from 'axios';
import htmlParser from 'html-react-parser';
import jsPDF from 'jspdf';

function App() {
  const [inputText, setInputText] = useState('');
  const [url, setUrl] = useState('');
  const [scrapedContent, setScrapedContent] = useState('');
  const [summary, setSummary] = useState('');
  const [summaryLength, setSummaryLength] = useState('short');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [user, setUser] = useState(null);

  const handleTextChange = (e) => setInputText(e.target.value);
  const handleUrlChange = (e) => setUrl(e.target.value);
  const handleSummaryLengthChange = (e) => setSummaryLength(e.target.value);

  const handleScrape = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/scrape', { url });
      const mainContent = htmlParser(response.data.content);
      setScrapedContent(mainContent);
    } catch (error) {
      console.error('Error scraping content:', error);
      alert('Failed to scrape content. Please check the URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  const mockSummarize = (text, length) => {
    if (length === 'short') return text.slice(0, 100) + '...';
    if (length === 'medium') return text.slice(0, 200) + '...';
    if (length === 'long') return text.slice(0, 500) + '...';
  };

  const handleSummarize = () => {
    try {
      const summary = mockSummarize(inputText || scrapedContent, summaryLength);
      setSummary(summary);
      setHistory([...history, { original: inputText || scrapedContent, summary }]);
    } catch (error) {
      console.error('Error generating summary:', error);
      alert('Failed to generate summary. Please try again.');
    }
  };

  const handleExport = (format) => {
    if (format === 'pdf') {
      const doc = new jsPDF();
      doc.text(summary, 10, 10);
      doc.save('summary.pdf');
    } else {
      const element = document.createElement('a');
      const file = new Blob([summary], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = 'summary.txt';
      document.body.appendChild(element);
      element.click();
    }
  };

  const handleLogin = (username) => {
    setUser({ name: username });
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>AI Summarization Dashboard</h1>
        {user ? (
          <div>
            <span>Welcome, {user.name}!</span>
            <button onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <button onClick={() => handleLogin('User')}>Login</button>
        )}
      </header>
      <main>
        <section>
          <textarea
            value={inputText}
            onChange={handleTextChange}
            placeholder="Paste or type your content here"
            aria-label="Text input area"
            role="textbox"
          />
          <input
            type="text"
            value={url}
            onChange={handleUrlChange}
            placeholder="Enter URL to scrape"
            aria-label="URL input field"
          />
          <button onClick={handleScrape} aria-label="Scrape content button">Scrape Content</button>
        </section>
        <section>
          <div>
            <h2>Original Content</h2>
            <div>{scrapedContent || inputText}</div>
          </div>
          <div>
            <h2>Summary</h2>
            <p>{summary}</p>
          </div>
        </section>
        <section>
          <label>
            Summary Length:
            <select value={summaryLength} onChange={handleSummaryLengthChange}>
              <option value="short">Short</option>
              <option value="medium">Medium</option>
              <option value="long">Long</option>
            </select>
          </label>
          <button onClick={handleSummarize}>Summarize</button>
        </section>
        {loading && <div>Loading...</div>}
        <section>
          <button onClick={() => handleExport('pdf')}>Export as PDF</button>
          <button onClick={() => handleExport('txt')}>Export as TXT</button>
        </section>
        <section>
          <h2>History</h2>
          <ul>
            {history.map((item, index) => (
              <li key={index}>
                <div>{item.original}</div>
                <div>{item.summary}</div>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}

export default App;
