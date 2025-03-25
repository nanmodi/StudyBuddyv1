from flask import Flask, request, jsonify
from PyPDF2 import PdfReader
from langchain.text_splitter import RecursiveCharacterTextSplitter
import os
from langchain_google_genai import GoogleGenerativeAIEmbeddings
import google.generativeai as genai
from langchain_community.vectorstores import FAISS
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.chains.question_answering import load_qa_chain
from langchain.prompts import PromptTemplate
from flask_cors import CORS
from dotenv import load_dotenv

# Load API Key
load_dotenv()
genai.configure(api_key=os.environ["GOOGLE_API_KEY"])

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing

# Helper Functions
def get_pdf(pdfs):
    """Extract text from uploaded PDFs."""
    text = ""
    for pdf in pdfs:
        pdfreader = PdfReader(pdf)
        for page in pdfreader.pages:
            text += page.extract_text()
    return text

def get_text_chunks(text):
    """Split text into smaller chunks for processing."""
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=10000, chunk_overlap=1000)
    return text_splitter.split_text(text)

def get_vector_store(text_chunks):
    """Create a FAISS vector store."""
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    vector_store = FAISS.from_texts(text_chunks, embedding=embeddings)
    vector_store.save_local("faiss_index")

def get_chats():
    """Configure the AI chat model."""
    prompt_template = """
    Answer the question as detailed as possible from the provided context. If the answer is not in
    the provided context, just say, "answer is not available in the context." Don't provide the wrong answer.
    You can create summaries, question-answer pairs, and personalized flashcards for uploaded documents.

    Context:\n{context}\n
    Question:\n{question}\n

    Answer:
    """
    model = ChatGoogleGenerativeAI(model="gemini-1.5-pro", temperature=0.3)
    prompt = PromptTemplate(template=prompt_template, input_variables=["context", "question"])
    return load_qa_chain(model, chain_type="stuff", prompt=prompt)

def query_vector_store(query):
    
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    new_db = FAISS.load_local("faiss_index", embeddings, allow_dangerous_deserialization=True)
    docs = new_db.similarity_search(query)
    chain = get_chats()
    response = chain({"input_documents": docs, "question": query}, return_only_outputs=True)
    return response["output_text"]

# Flask API Endpoints
@app.route("/upload", methods=["POST"])
def upload():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file uploaded"}), 400
        
        print("Received file upload request")
        pdf_file = request.files["file"]
        print("Received file in Flask:", pdf_file.filename)

        # Process the file
        text = get_pdf([pdf_file])  # Pass as a list
        if not text:
            return jsonify({"error": "Failed to extract text from PDF"}), 500

        text_chunks = get_text_chunks(text)
        if not text_chunks:
            return jsonify({"error": "Failed to split text into chunks"}), 500

        get_vector_store(text_chunks)

        return jsonify({"message": "File processed successfully"}), 200

    except Exception as e:
        print("Error processing file:", str(e))
        return jsonify({"error": "Internal server error", "details": str(e)}), 500



@app.route("/ask", methods=["POST"])
def ask():
    """Endpoint for asking questions based on the document."""
    data = request.json
    user_question = data.get("question")
    
    if not user_question:
        return jsonify({"error": "Question is required"}), 400
    
    response = query_vector_store(user_question)
    return jsonify({"response": response})

@app.route("/summary", methods=["POST"])
def summary():
    """Generate a summary of the uploaded document."""
    response = query_vector_store("summarize the entire document and extract key points")
    return jsonify({"summary": response})

@app.route("/flashcards", methods=["POST"])
def flashcards():
   
    response = query_vector_store("""Extract key concepts from the uploaded document and generate flashcards in the following format:
Flashcard [Number]:
Question: [Concise and clear question]
Answer: [Brief, precise answer with relevant details]

Ensure that:

Questions are clear and to the point.

Answers are informative yet concise.

Important technical terms are included.

Each flashcard follows a structured and consistent format.""")
    return jsonify({"flashcards": response})





if __name__ == "__main__":
    app.run(debug=True)
