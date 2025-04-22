import React, { useState, useEffect } from "react";
import axios from "axios";
import { BookOpen, CheckSquare, Upload, Loader } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";

function Aiapp() {
  const { getToken } = useAuth();
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTab, setCurrentTab] = useState("summary");
  const [summaryData, setSummaryData] = useState(null);
  const [flashcardsData, setFlashcardsData] = useState([]);
  const [activeFlashcard, setActiveFlashcard] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [finalAnswer, setFinalAnswer] = useState("");

  useEffect(() => {
    console.log("Flashcards data updated:", flashcardsData);
  }, [flashcardsData]);

  const parseFlashcards = (flashcardsString) => {
    console.log("Raw flashcards string:", flashcardsString);
    try {
      const flashcards = [];
      const flashcardBlocks = flashcardsString
        .split(/\nFlashcard \d+:\n/g)
        .filter((block) => block.trim());

      console.log("Flashcard blocks:", flashcardBlocks);
      flashcardBlocks.forEach((block) => {
        const match = block.match(/Question:\s*(.*?)\nAnswer:\s*(.*)/s);
        console.log("Processing block:", block, "Match result:", match);
        if (match) {
          flashcards.push({
            question: match[1].trim(),
            answer: match[2].trim(),
          });
        }
      });
      console.log("Parsed flashcards:", flashcards);
      return flashcards.length > 0
        ? flashcards
        : [{ question: "No flashcards parsed", answer: "Check data format" }];
    } catch (error) {
      console.error("Error parsing flashcards:", error);
      return [{ question: "Error parsing", answer: "Processing failed" }];
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = await getToken();
      const response = await axios.post(
        "http://127.0.0.1:5000/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setIsUploading(false);
      handleGenerateSummary();
    } catch (error) {
      console.error(
        "Error uploading file:",
        error.response?.data || error.message
      );
      setIsUploading(false);
    }
  };

  const handleGenerateSummary = async () => {
    setIsProcessing(true);
    try {
      const token = await getToken();
      const response = await axios.post("http://127.0.0.1:5000/summary", null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSummaryData(response.data);
      setFinalAnswer(response.data);
      setCurrentTab("summary");
    } catch (error) {
      console.error("Error generating summary:", error);
      setSummaryData(mockSummaryData);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateFlashcards = async () => {
    setIsProcessing(true);
    try {
      const token = await getToken();
      const response = await axios.post(
        "http://127.0.0.1:5000/flashcards",
        null,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const flashcardsStr =
        typeof response.data === "string"
          ? response.data
          : response.data.flashcards || "";
      const parsedFlashcards = parseFlashcards(flashcardsStr);
      if (parsedFlashcards.length > 0) {
        setFlashcardsData(parsedFlashcards);
        setFinalAnswer((prev) => prev + flashcardsStr);
        setActiveFlashcard(0);
        setShowAnswer(false);
        setCurrentTab("flashcards");
      } else {
        throw new Error("No flashcards found");
      }
    } catch (error) {
      console.error("Error generating flashcards:", error);
      const sampleResponse = {
        flashcards: `**Flashcard 1:**\n\n* **Front:** What is the chosen software architecture for StudyBuddy AI?\n* **Back:** Layered Architecture\n\n**Flashcard 2:**\n\n* **Front:** Name the layers in the StudyBuddy AI architecture.\n* **Back:** Presentation Layer, Application Layer, Data Access Layer, Integration Layer`,
      };
      const parsedFlashcards = parseFlashcards(sampleResponse.flashcards);
      setFlashcardsData(parsedFlashcards);
      setCurrentTab("flashcards");
    } finally {
      setIsProcessing(false);
    }
  };

  const nextFlashcard = () => {
    if (activeFlashcard < flashcardsData.length - 1) {
      setActiveFlashcard(activeFlashcard + 1);
      setShowAnswer(false);
    }
  };

  const prevFlashcard = () => {
    if (activeFlashcard > 0) {
      setActiveFlashcard(activeFlashcard - 1);
      setShowAnswer(false);
    }
  };

  const toggleAnswer = () => setShowAnswer(!showAnswer);

  const mockSummaryData = {
    summary:
      "StudyBuddy AI uses a Layered Architecture consisting of Presentation, Application, Data Access, and Integration layers. Key components include DocumentManager for uploads, SummaryGenerator for document processing, and various tracking tools like StudySessionManager. The system is hosted on AWS with S3/CloudFront for frontend, EC2 for backend, RDS for MySQL database, and Lambda for AI processing. Security measures include firewalls, encryption, and Privy.io for authentication.",
  };

  const displaySummary = summaryData || mockSummaryData;

  return (
    <div className="aiapp-page">
      <section className="aiapp-section">
        <h1 className="aiapp-title">StudyBuddy AI</h1>
        <p className="aiapp-subtitle">
          Enhance your study with AI-powered tools
        </p>

        {/* Upload Section */}
        <div className="upload-card">
          <div className="upload-content">
            <div
              className="upload-dropzone"
              onClick={() => document.getElementById("fileInput").click()}
            >
              <input
                type="file"
                id="fileInput"
                className="hidden-file-input"
                accept=".pdf,.docx,.txt"
                onChange={handleFileChange}
              />
              <Upload className="upload-icon" />
              {fileName ? (
                <p className="upload-file-name">{fileName}</p>
              ) : (
                <>
                  <p className="upload-instruction">
                    Click to upload a document
                  </p>
                  <p className="upload-filetypes">PDF, DOCX, or TXT</p>
                </>
              )}
            </div>
            <button
              className={`action-button ${
                !file || isUploading ? "disabled" : ""
              }`}
              onClick={handleUpload}
              disabled={!file || isUploading}
            >
              {isUploading ? (
                <span className="flex items-center justify-center">
                  <Loader className="animate-spin h-5 w-5 mr-2" />
                  Uploading...
                </span>
              ) : (
                "Process Document"
              )}
            </button>
          </div>
        </div>

        {/* Tools Menu */}
        <div className="tools-menu">
          <button
            className={`tool-button ${
              currentTab === "summary" ? "active" : ""
            }`}
            onClick={handleGenerateSummary}
          >
            <BookOpen className="tool-icon" /> Summary
          </button>
          <button
            className={`tool-button ${
              currentTab === "flashcards" ? "active" : ""
            }`}
            onClick={handleGenerateFlashcards}
          >
            <CheckSquare className="tool-icon" /> Flashcards
          </button>
        </div>

        {/* Loading State */}
        {isProcessing && (
          <div className="loading-container">
            <Loader className="loading-icon animate-spin" />
            <p className="loading-text">Processing your document...</p>
          </div>
        )}

        {/* Content Area */}
        {!isProcessing && (
          <div className="content-card">
            {/* Summary Tab */}
            {currentTab === "summary" && (
              <div className="summary-content">
                <h2 className="content-title">Document Summary</h2>
                <p className="content-text">{displaySummary.summary}</p>
              </div>
            )}

            {/* Flashcards Tab */}
            {currentTab === "flashcards" && flashcardsData.length > 0 && (
              <div className="flashcards-content">
                <h2 className="content-title">Flashcards</h2>
                <div className="flashcard-card">
                  <p className="flashcard-question">
                    {activeFlashcard < flashcardsData.length
                      ? flashcardsData[activeFlashcard].question
                      : "No question available"}
                  </p>
                  {showAnswer && activeFlashcard < flashcardsData.length && (
                    <p className="flashcard-answer">
                      {flashcardsData[activeFlashcard].answer}
                    </p>
                  )}
                  <button className="action-button" onClick={toggleAnswer}>
                    {showAnswer ? "Hide Answer" : "Show Answer"}
                  </button>
                </div>
                <div className="flashcard-navigation">
                  <button
                    className={`nav-button ${
                      activeFlashcard === 0 ? "disabled" : ""
                    }`}
                    onClick={prevFlashcard}
                    disabled={activeFlashcard === 0}
                  >
                    Previous
                  </button>
                  <span className="flashcard-counter">
                    {activeFlashcard + 1} of {flashcardsData.length}
                  </span>
                  <button
                    className={`nav-button ${
                      activeFlashcard >= flashcardsData.length - 1
                        ? "disabled"
                        : ""
                    }`}
                    onClick={nextFlashcard}
                    disabled={activeFlashcard >= flashcardsData.length - 1}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Empty State for Flashcards */}
            {currentTab === "flashcards" && flashcardsData.length === 0 && (
              <div className="no-content">
                <p className="no-content-title">No flashcards available</p>
                <p className="no-content-text">
                  Click the Flashcards button to generate flashcards from your
                  document
                </p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default Aiapp;
