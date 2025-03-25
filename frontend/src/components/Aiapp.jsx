import React, { useState, useEffect } from "react";
import axios from "axios";
import { BookOpen, CheckSquare, Upload, Loader } from "lucide-react";
import { useAuth } from "@clerk/clerk-react"; // Import useAuth for Clerk token

function Aiapp() {
  const { getToken } = useAuth(); // Get Clerk token
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

      // Splitting based on "Flashcard X:" pattern
      const flashcardBlocks = flashcardsString
        .split(/\nFlashcard \d+:\n/g)
        .filter((block) => block.trim());

      console.log("Flashcard blocks:", flashcardBlocks);

      flashcardBlocks.forEach((block) => {
        // Extracting question and answer using regex
        const match = block.match(/Question:\s*(.*?)\nAnswer:\s*(.*)/s);

        console.log("Processing block:", block);
        console.log("Match result:", match);

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
        : [
            {
              question: "No flashcards could be parsed correctly",
              answer: "Please check the format of your data",
            },
          ];
    } catch (error) {
      console.error("Error parsing flashcards:", error);
      return [
        {
          question: "Error parsing flashcards",
          answer: "An error occurred while processing the flashcards data",
        },
      ];
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
      const token = await getToken(); // Fetch Clerk token
      const response = await axios.post(
        "http://127.0.0.1:5000/upload", // Flask server port
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`, // Add token
          },
        }
      );
      setIsUploading(false);
      handleGenerateSummary(); // Trigger summary generation after upload
    } catch (error) {
      console.error("Error uploading file:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      setIsUploading(false);
    }
  };

  const handleGenerateSummary = async () => {
    setIsProcessing(true);
    try {
      const token = await getToken(); // Fetch Clerk token
      const response = await axios.post(
        "http://127.0.0.1:5000/summary", // Flask server port
        null,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Add token
          },
        }
      );
      setSummaryData(response.data);
      setFinalAnswer(response.data);
      setCurrentTab("summary");
    } catch (error) {
      console.error("Error generating summary:", error);
      setSummaryData(mockSummaryData); // Fallback to mock data
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateFlashcards = async () => {
    setIsProcessing(true);
    try {
      const token = await getToken(); // Fetch Clerk token
      const response = await axios.post(
        "http://127.0.0.1:5000/flashcards", // Flask server port
        null,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Add token
          },
        }
      );
      console.log("API Response:", response.data);

      // Handle both possible response formats
      const flashcardsStr =
        typeof response.data === "string"
          ? response.data
          : response.data.flashcards || "";

      const parsedFlashcards = parseFlashcards(flashcardsStr);
      console.log("Parsed flashcards result:", parsedFlashcards);

      if (parsedFlashcards.length > 0) {
        setFlashcardsData(parsedFlashcards);
        setFinalAnswer((prev) => prev + flashcardsStr); // Append to finalAnswer
        console.log("Updated finalAnswer:", finalAnswer);
        setActiveFlashcard(0);
        setShowAnswer(false);
        setCurrentTab("flashcards");
      } else {
        console.error("No flashcards were parsed from the response");
        throw new Error("No flashcards found in response");
      }
    } catch (error) {
      console.error("Error generating flashcards:", error);
      // Use sample data if API fails
      const sampleResponse = {
        flashcards: `**Flashcard 1:**\n\n* **Front:** What is the chosen software architecture for StudyBuddy AI?\n* **Back:** Layered Architecture\n\n**Flashcard 2:**\n\n* **Front:** Name the layers in the StudyBuddy AI architecture.\n* **Back:** Presentation Layer, Application Layer, Data Access Layer, Integration Layer`,
      };
      console.log("Using sample data");
      const parsedFlashcards = parseFlashcards(sampleResponse.flashcards);
      console.log("Parsed Sample Flashcards:", parsedFlashcards);
      setFlashcardsData(parsedFlashcards);
      setCurrentTab("flashcards");
    } finally {
      setIsProcessing(false);
    }
  };

  const nextFlashcard = () => {
    if (flashcardsData && activeFlashcard < flashcardsData.length - 1) {
      setActiveFlashcard(activeFlashcard + 1);
      setShowAnswer(false);
    }
  };

  const prevFlashcard = () => {
    if (flashcardsData && activeFlashcard > 0) {
      setActiveFlashcard(activeFlashcard - 1);
      setShowAnswer(false);
    }
  };

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  // Mock data for summary
  const mockSummaryData = {
    summary:
      "StudyBuddy AI uses a Layered Architecture consisting of Presentation, Application, Data Access, and Integration layers. Key components include DocumentManager for uploads, SummaryGenerator for document processing, and various tracking tools like StudySessionManager. The system is hosted on AWS with S3/CloudFront for frontend, EC2 for backend, RDS for MySQL database, and Lambda for AI processing. Security measures include firewalls, encryption, and Privy.io for authentication.",
  };

  // Use real data if available, otherwise use mock data
  const displaySummary = summaryData || mockSummaryData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-indigo-800 mb-2">
            StudyBuddy AI
          </h1>
          <p className="text-gray-600">
            Upload documents to generate summaries, flashcards, and practice
            questions
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="w-full md:w-2/3">
              <div
                className="border-2 border-dashed border-indigo-300 rounded-lg p-8 hover:border-indigo-500 transition-colors cursor-pointer bg-indigo-50"
                onClick={() => document.getElementById("fileInput").click()}
              >
                <input
                  type="file"
                  id="fileInput"
                  className="hidden"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileChange}
                />
                <div className="flex flex-col items-center justify-center text-center">
                  <Upload className="h-12 w-12 text-indigo-500 mb-4" />
                  {fileName ? (
                    <p className="text-indigo-700 font-medium">{fileName}</p>
                  ) : (
                    <>
                      <p className="text-indigo-700 font-medium mb-1">
                        Click to upload a document
                      </p>
                      <p className="text-indigo-400 text-sm">
                        PDF, DOCX, or TXT
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="w-full md:w-1/3">
              <button
                className={`w-full py-4 px-6 rounded-lg font-medium text-white transition-colors ${
                  file && !isUploading
                    ? "bg-indigo-600 hover:bg-indigo-700"
                    : "bg-indigo-300 cursor-not-allowed"
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
        </div>

        {/* Tools Menu */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="flex flex-wrap">
            <button
              className={`flex items-center px-6 py-4 font-medium border-b-2 ${
                currentTab === "summary"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-600 hover:text-indigo-500"
              }`}
              onClick={handleGenerateSummary}
            >
              <BookOpen className="h-5 w-5 mr-2" />
              Summary
            </button>
            <button
              className={`flex items-center px-6 py-4 font-medium border-b-2 ${
                currentTab === "flashcards"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-600 hover:text-indigo-500"
              }`}
              onClick={handleGenerateFlashcards}
            >
              <CheckSquare className="h-5 w-5 mr-2" />
              Flashcards
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isProcessing && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader className="h-12 w-12 animate-spin text-indigo-600 mx-auto mb-4" />
              <p className="text-indigo-800 font-medium">
                Processing your document...
              </p>
            </div>
          </div>
        )}

        {/* Content Area */}
        {!isProcessing && (
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Summary Tab */}
            {currentTab === "summary" && (
              <div>
                <h2 className="text-2xl font-semibold text-indigo-800 mb-4">
                  Document Summary
                </h2>
                <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-100">
                  <p className="text-gray-700 leading-relaxed">
                    {displaySummary.summary}
                  </p>
                </div>
              </div>
            )}

            {/* Flashcards Tab */}
            {currentTab === "flashcards" &&
              flashcardsData &&
              flashcardsData.length > 0 && (
                <div>
                  <h2 className="text-2xl font-semibold text-indigo-800 mb-4">
                    Flashcards
                  </h2>
                  <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-100 mb-4">
                    <div className="min-h-64 flex flex-col items-center justify-center">
                      <div className="bg-white w-full max-w-lg p-6 rounded-lg shadow-md mb-4 min-h-48 flex flex-col justify-center">
                        <p className="text-center text-xl font-medium mb-6">
                          {activeFlashcard < flashcardsData.length
                            ? flashcardsData[activeFlashcard].question
                            : "No question available"}
                        </p>
                        {showAnswer &&
                          activeFlashcard < flashcardsData.length && (
                            <div className="mt-4 pt-4 border-t border-indigo-100">
                              <p className="text-center text-indigo-700">
                                {flashcardsData[activeFlashcard].answer}
                              </p>
                            </div>
                          )}
                      </div>
                      <button
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
                        onClick={toggleAnswer}
                      >
                        {showAnswer ? "Hide Answer" : "Show Answer"}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <button
                      className={`flex items-center py-2 px-4 rounded font-medium ${
                        activeFlashcard > 0
                          ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                      onClick={prevFlashcard}
                      disabled={activeFlashcard === 0}
                    >
                      Previous
                    </button>
                    <div className="text-indigo-800 font-medium">
                      {activeFlashcard + 1} of {flashcardsData.length}
                    </div>
                    <button
                      className={`flex items-center py-2 px-4 rounded font-medium ${
                        activeFlashcard < flashcardsData.length - 1
                          ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                      onClick={nextFlashcard}
                      disabled={activeFlashcard >= flashcardsData.length - 1}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

            {/* Empty state for flashcards */}
            {currentTab === "flashcards" &&
              (!flashcardsData || flashcardsData.length === 0) && (
                <div className="text-center py-8">
                  <div className="text-indigo-800 font-medium">
                    No flashcards available
                  </div>
                  <p className="text-gray-600 mt-2">
                    Click the Flashcards button to generate flashcards from your
                    document
                  </p>
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Aiapp;
